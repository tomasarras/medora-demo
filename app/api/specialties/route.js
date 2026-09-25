import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSpecialty, serializeSpecialty, SpecialtyError } from "@/lib/specialties";

export async function GET() {
  const specialties = await prisma.specialty.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(specialties.map(serializeSpecialty));
}

export async function POST(request) {
  const data = await request.json();
  try {
    const specialty = await createSpecialty(data.name);
    return NextResponse.json(serializeSpecialty(specialty), { status: 201 });
  } catch (err) {
    if (err instanceof SpecialtyError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
