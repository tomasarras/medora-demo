import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializePatient } from "@/lib/patients";
import { serializeAppointment } from "@/lib/appointments";

export async function GET(request, { params }) {
  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { appointments: { include: { doctor: { include: { specialty: true } }, patient: true }, orderBy: { date: "desc" } } },
  });
  if (!patient) return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
  return NextResponse.json({ ...serializePatient(patient), appointments: patient.appointments.map(serializeAppointment) });
}
