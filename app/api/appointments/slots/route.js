import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/schedule";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const doctorId = searchParams.get("doctorId");
  const date = searchParams.get("date");
  if (!doctorId || !date) return NextResponse.json({ error: "Faltan doctorId y date" }, { status: 400 });
  const slots = await getAvailableSlots(doctorId, date);
  return NextResponse.json(slots.map((s) => s.toISOString()));
}
