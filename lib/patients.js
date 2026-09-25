import { prisma } from "@/lib/prisma";

export class PatientError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function serializePatient(patient) {
  return { id: patient.id, name: patient.name, phone: patient.phone, email: patient.email };
}

const PHONE_RE = /^[0-9+\-\s()]{6,20}$/;

export function normalizePhone(phone) {
  const trimmed = (phone || "").trim();
  if (!PHONE_RE.test(trimmed)) throw new PatientError("Ingresá un teléfono válido", 400);
  return trimmed;
}

// Identity here is "whatever phone number you type in" — same no-real-auth
// spirit as the rest of this app. Booking under a known phone just updates
// that patient's name/email instead of creating a duplicate record.
export async function findOrCreatePatient({ name, phone, email }) {
  const trimmedName = (name || "").trim();
  if (!trimmedName) throw new PatientError("Falta el nombre del paciente", 400);
  const normalizedPhone = normalizePhone(phone);

  return prisma.patient.upsert({
    where: { phone: normalizedPhone },
    update: { name: trimmedName, email: email?.trim() || null },
    create: { name: trimmedName, phone: normalizedPhone, email: email?.trim() || null },
  });
}

export async function findPatientByPhone(phone) {
  const normalizedPhone = normalizePhone(phone);
  return prisma.patient.findUnique({ where: { phone: normalizedPhone } });
}
