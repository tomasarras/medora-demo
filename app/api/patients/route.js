import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializePatient } from "@/lib/patients";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const patients = await prisma.patient.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }] } : undefined,
    orderBy: { name: "asc" },
  });
  return NextResponse.json(patients.map(serializePatient));
}
