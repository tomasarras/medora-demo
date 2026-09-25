import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDoctor, serializeDoctor, DoctorError } from "@/lib/doctors";

export async function GET() {
  const doctors = await prisma.doctor.findMany({ include: { specialty: true }, orderBy: { name: "asc" } });
  return NextResponse.json(doctors.map(serializeDoctor));
}

export async function POST(request) {
  const data = await request.json();
  try {
    const doctor = await createDoctor(data);
    return NextResponse.json(serializeDoctor(doctor), { status: 201 });
  } catch (err) {
    if (err instanceof DoctorError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
