import { NextResponse } from "next/server";
import {
  bookAppointment,
  listAppointmentsByPhone,
  listAppointmentsByDoctor,
  listAllAppointments,
  serializeAppointment,
  AppointmentError,
} from "@/lib/appointments";
import { PatientError } from "@/lib/patients";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone");
  const doctorId = searchParams.get("doctorId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  try {
    let appointments;
    if (phone) appointments = await listAppointmentsByPhone(phone);
    else if (doctorId) appointments = await listAppointmentsByDoctor(doctorId, { from, to });
    else appointments = await listAllAppointments({ from, to });
    return NextResponse.json(appointments.map(serializeAppointment));
  } catch (err) {
    if (err instanceof PatientError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
}

export async function POST(request) {
  const data = await request.json();
  try {
    const appt = await bookAppointment({
      doctorId: data.doctorId,
      date: data.date,
      reason: data.reason,
      patient: { name: data.name, phone: data.phone, email: data.email },
    });
    return NextResponse.json(serializeAppointment(appt), { status: 201 });
  } catch (err) {
    if (err instanceof AppointmentError || err instanceof PatientError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    throw err;
  }
}
