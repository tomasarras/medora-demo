import { PrismaClient } from "@prisma/client";
import { SPECIALTIES, DOCTORS, PATIENTS } from "../lib/demoData.mjs";

const prisma = new PrismaClient();

function nextWeekdayAt(daysAhead, hour, minute = 0) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + daysAhead);
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding specialties...");
  const specialtyBySlug = {};
  for (const s of SPECIALTIES) {
    specialtyBySlug[s.slug] = await prisma.specialty.upsert({
      where: { slug: s.slug },
      update: {},
      create: { name: s.name, slug: s.slug },
    });
  }

  console.log("Seeding doctors...");
  const doctorByName = {};
  for (const d of DOCTORS) {
    let doctor = await prisma.doctor.findFirst({ where: { name: d.name } });
    if (!doctor) {
      doctor = await prisma.doctor.create({ data: { name: d.name, bio: d.bio, specialtyId: specialtyBySlug[d.specialtySlug].id } });
    }
    doctorByName[d.name] = doctor;
  }

  console.log("Seeding patients...");
  const patientByPhone = {};
  for (const p of PATIENTS) {
    patientByPhone[p.phone] = await prisma.patient.upsert({
      where: { phone: p.phone },
      update: {},
      create: p,
    });
  }

  console.log("Seeding sample appointments...");
  const existingAppts = await prisma.appointment.count();
  if (existingAppts === 0) {
    await prisma.appointment.create({
      data: {
        doctorId: doctorByName["Dra. Laura Giménez"].id,
        patientId: patientByPhone["1122334455"].id,
        date: nextWeekdayAt(1, 10, 0),
        reason: "Control anual",
        status: "CONFIRMADO",
      },
    });
    await prisma.appointment.create({
      data: {
        doctorId: doctorByName["Dr. Martín Suárez"].id,
        patientId: patientByPhone["1133445566"].id,
        date: nextWeekdayAt(2, 15, 0),
        reason: "Control pediátrico",
        status: "CONFIRMADO",
      },
    });
    await prisma.appointment.create({
      data: {
        doctorId: doctorByName["Dra. Carla Fernández"].id,
        patientId: patientByPhone["1122334455"].id,
        date: nextWeekdayAt(-3, 11, 0),
        reason: "Revisión de lunar",
        status: "ATENDIDO",
        notes: "Sin hallazgos. Control de rutina en 6 meses.",
      },
    });
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
