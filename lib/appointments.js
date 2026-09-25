import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { findOrCreatePatient } from "@/lib/patients";
import { isSlotInSchedule } from "@/lib/schedule";

export class AppointmentError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function serializeAppointment(appt) {
  return {
    id: appt.id,
    date: appt.date,
    reason: appt.reason,
    status: appt.status,
    notes: appt.notes,
    createdAt: appt.createdAt,
    doctor: appt.doctor && { id: appt.doctor.id, name: appt.doctor.name, specialty: appt.doctor.specialty?.name },
    patient: appt.patient && { id: appt.patient.id, name: appt.patient.name, phone: appt.patient.phone },
  };
}

const INCLUDE = { doctor: { include: { specialty: true } }, patient: true };

// The one place this demo genuinely needs a real database: two visitors
// booking the same doctor's same slot at the same time must not both
// succeed. A Serializable transaction makes Postgres abort one of them with
// a serialization conflict instead of silently double-booking — we catch
// that (Prisma error code P2034) and turn it into a normal "already taken"
// response, same as the plain "someone beat you to it" check we also do
// up front for the common (non-racing) case.
export async function bookAppointment({ doctorId, date, reason, patient }) {
  const slotDate = new Date(date);
  if (Number.isNaN(slotDate.getTime()) || !isSlotInSchedule(slotDate)) {
    throw new AppointmentError("Ese horario no es válido", 400);
  }
  if (slotDate.getTime() <= Date.now()) throw new AppointmentError("Ese horario ya pasó", 400);
  const trimmedReason = (reason || "").trim();
  if (!trimmedReason) throw new AppointmentError("Contanos el motivo de la consulta", 400);

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
  if (!doctor || !doctor.active) throw new AppointmentError("Médico no disponible", 404);

  const patientRecord = await findOrCreatePatient(patient);

  try {
    const appt = await prisma.$transaction(
      async (tx) => {
        const conflict = await tx.appointment.findFirst({
          where: { doctorId, date: slotDate, status: { not: "CANCELADO" } },
        });
        if (conflict) throw new AppointmentError("Ese horario ya fue reservado, elegí otro", 409);

        return tx.appointment.create({
          data: { doctorId, patientId: patientRecord.id, date: slotDate, reason: trimmedReason },
          include: INCLUDE,
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
    return appt;
  } catch (err) {
    if (err instanceof AppointmentError) throw err;
    if (err.code === "P2034") throw new AppointmentError("Ese horario ya fue reservado, elegí otro", 409);
    throw err;
  }
}

export async function cancelAppointment(id) {
  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt) throw new AppointmentError("Turno no encontrado", 404);
  if (appt.status === "ATENDIDO") throw new AppointmentError("Ese turno ya fue atendido", 409);
  return prisma.appointment.update({ where: { id }, data: { status: "CANCELADO" }, include: INCLUDE });
}

export async function markAttended(id, notes) {
  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt) throw new AppointmentError("Turno no encontrado", 404);
  if (appt.status === "CANCELADO") throw new AppointmentError("Ese turno está cancelado", 409);
  return prisma.appointment.update({
    where: { id },
    data: { status: "ATENDIDO", notes: (notes || "").trim() || null },
    include: INCLUDE,
  });
}

export async function rescheduleAppointment(id, date) {
  const slotDate = new Date(date);
  if (Number.isNaN(slotDate.getTime()) || !isSlotInSchedule(slotDate)) {
    throw new AppointmentError("Ese horario no es válido", 400);
  }
  const appt = await prisma.appointment.findUnique({ where: { id } });
  if (!appt) throw new AppointmentError("Turno no encontrado", 404);

  try {
    return await prisma.$transaction(
      async (tx) => {
        const conflict = await tx.appointment.findFirst({
          where: { doctorId: appt.doctorId, date: slotDate, status: { not: "CANCELADO" }, id: { not: id } },
        });
        if (conflict) throw new AppointmentError("Ese horario ya fue reservado, elegí otro", 409);
        return tx.appointment.update({ where: { id }, data: { date: slotDate }, include: INCLUDE });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (err) {
    if (err instanceof AppointmentError) throw err;
    if (err.code === "P2034") throw new AppointmentError("Ese horario ya fue reservado, elegí otro", 409);
    throw err;
  }
}

export async function listAppointmentsByPhone(phone) {
  return prisma.appointment.findMany({
    where: { patient: { phone } },
    include: INCLUDE,
    orderBy: { date: "desc" },
  });
}

export async function listAppointmentsByDoctor(doctorId, { from, to } = {}) {
  return prisma.appointment.findMany({
    where: {
      doctorId,
      status: { not: "CANCELADO" },
      ...(from || to ? { date: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lt: new Date(to) } : {}) } } : {}),
    },
    include: INCLUDE,
    orderBy: { date: "asc" },
  });
}

export async function listAllAppointments({ from, to } = {}) {
  return prisma.appointment.findMany({
    where: from || to ? { date: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lt: new Date(to) } : {}) } } : {},
    include: INCLUDE,
    orderBy: { date: "asc" },
  });
}
