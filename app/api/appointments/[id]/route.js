import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cancelAppointment, markAttended, rescheduleAppointment, serializeAppointment, AppointmentError } from "@/lib/appointments";

export async function GET(request, { params }) {
  const { id } = await params;
  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: { doctor: { include: { specialty: true } }, patient: true },
  });
  if (!appt) return NextResponse.json({ error: "Turno no encontrado" }, { status: 404 });
  return NextResponse.json(serializeAppointment(appt));
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const data = await request.json();
  try {
    let appt;
    if (data.action === "cancel") appt = await cancelAppointment(id);
    else if (data.action === "attend") appt = await markAttended(id, data.notes);
    else if (data.action === "reschedule") appt = await rescheduleAppointment(id, data.date);
    else return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
    return NextResponse.json(serializeAppointment(appt));
  } catch (err) {
    if (err instanceof AppointmentError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
