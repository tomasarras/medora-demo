import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateDoctor, serializeDoctor, DoctorError } from "@/lib/doctors";

export async function GET(request, { params }) {
  const { id } = await params;
  const doctor = await prisma.doctor.findUnique({ where: { id }, include: { specialty: true } });
  if (!doctor) return NextResponse.json({ error: "Médico no encontrado" }, { status: 404 });
  return NextResponse.json(serializeDoctor(doctor));
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const data = await request.json();
  try {
    const doctor = await updateDoctor(id, data);
    return NextResponse.json(serializeDoctor(doctor));
  } catch (err) {
    if (err instanceof DoctorError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
