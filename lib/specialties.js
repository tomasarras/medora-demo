import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/format";

export class SpecialtyError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function serializeSpecialty(specialty) {
  return { id: specialty.id, name: specialty.name, slug: specialty.slug };
}

export async function createSpecialty(name) {
  const trimmed = (name || "").trim();
  if (!trimmed) throw new SpecialtyError("Falta el nombre de la especialidad", 400);
  const slug = slugify(trimmed);
  const existing = await prisma.specialty.findFirst({ where: { OR: [{ name: trimmed }, { slug }] } });
  if (existing) throw new SpecialtyError("Ya existe una especialidad con ese nombre", 409);
  return prisma.specialty.create({ data: { name: trimmed, slug } });
}

export async function deleteSpecialty(id) {
  const inUse = await prisma.doctor.count({ where: { specialtyId: id } });
  if (inUse > 0) throw new SpecialtyError("No se puede eliminar: hay médicos con esta especialidad", 409);
  await prisma.specialty.delete({ where: { id } });
}
