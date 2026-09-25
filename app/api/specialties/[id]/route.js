import { NextResponse } from "next/server";
import { deleteSpecialty, SpecialtyError } from "@/lib/specialties";

export async function DELETE(request, { params }) {
  const { id } = await params;
  try {
    await deleteSpecialty(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SpecialtyError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}
