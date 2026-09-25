import { prisma } from "@/lib/prisma";
import { SPECIALTIES, DOCTORS, PATIENTS } from "@/lib/demoData.mjs";

// Botón "Restablecer demo": borra todo y vuelve a sembrar especialidades,
// médicos, pacientes y un puñado de turnos de ejemplo (uno ya atendido con
// notas, para que el panel del médico y el historial del paciente no
// arranquen vacíos), igual que el reset de vestra-demo/comanda-demo.
export async function resetDemoData() {
  await prisma.$transaction([
    prisma.appointment.deleteMany(),
    prisma.patient.deleteMany(),
    prisma.doctor.deleteMany(),
    prisma.specialty.deleteMany(),
  ]);

  const specialtyBySlug = {};
  for (const s of SPECIALTIES) {
    specialtyBySlug[s.slug] = await prisma.specialty.create({ data: { name: s.name, slug: s.slug } });
  }

  const doctorByName = {};
  for (const d of DOCTORS) {
    doctorByName[d.name] = await prisma.doctor.create({
      data: { name: d.name, bio: d.bio, specialtyId: specialtyBySlug[d.specialtySlug].id },
    });
  }

  const patientByPhone = {};
  for (const p of PATIENTS) {
    patientByPhone[p.phone] = await prisma.patient.create({ data: p });
  }

  const nextWeekdayAt = (daysAhead, hour, minute = 0) => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() + daysAhead);
    while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d.setUTCDate(d.getUTCDate() + 1);
    d.setUTCHours(hour, minute, 0, 0);
    return d;
  };

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
