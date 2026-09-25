import { prisma } from "@/lib/prisma";

export class DoctorError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function serializeDoctor(doctor) {
  return {
    id: doctor.id,
    name: doctor.name,
    bio: doctor.bio,
    active: doctor.active,
    specialtyId: doctor.specialtyId,
    specialty: doctor.specialty ? { id: doctor.specialty.id, name: doctor.specialty.name, slug: doctor.specialty.slug } : null,
  };
}

export function validateDoctorInput({ name, specialtyId }) {
  if (!(name || "").trim()) throw new DoctorError("Falta el nombre del médico", 400);
  if (!specialtyId) throw new DoctorError("Falta la especialidad", 400);
}

export async function createDoctor({ name, bio, specialtyId }) {
  validateDoctorInput({ name, specialtyId });
  return prisma.doctor.create({
    data: { name: name.trim(), bio: bio?.trim() || null, specialtyId },
    include: { specialty: true },
  });
}

export async function updateDoctor(id, { name, bio, specialtyId, active }) {
  validateDoctorInput({ name, specialtyId });
  const doctor = await prisma.doctor.findUnique({ where: { id } });
  if (!doctor) throw new DoctorError("Médico no encontrado", 404);
  return prisma.doctor.update({
    where: { id },
    data: { name: name.trim(), bio: bio?.trim() || null, specialtyId, active: active ?? doctor.active },
    include: { specialty: true },
  });
}
