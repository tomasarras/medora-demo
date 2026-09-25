import Link from "next/link";
import { CalendarPlus, CalendarSearch } from "lucide-react";
import { prisma } from "@/lib/prisma";
import PatientHeader from "@/components/PatientHeader";
import DoctorAvatar from "@/components/DoctorAvatar";

export const dynamic = "force-dynamic";

export default async function PacienteLandingPage() {
  const [specialties, doctors] = await Promise.all([
    prisma.specialty.findMany({ orderBy: { name: "asc" } }),
    prisma.doctor.findMany({ where: { active: true }, include: { specialty: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <>
      <PatientHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <section className="text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Turnos médicos, sin vueltas.</h1>
          <p className="mx-auto mt-3 max-w-lg text-black/60">
            Elegí especialidad, médico y horario, y confirmá tu turno en un par de clics.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/paciente/reservar"
              className="flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              <CalendarPlus size={18} />
              Reservar turno
            </Link>
            <Link
              href="/paciente/mis-turnos"
              className="flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-black/5"
            >
              <CalendarSearch size={18} />
              Mis turnos
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-black/50">Quiénes somos</h2>
          <p className="mt-3 max-w-2xl text-black/70">
            Medora es un centro médico ficticio armado como proyecto de portfolio: un lugar para mostrar cómo
            construiría de punta a punta un sistema de turnos real — reserva online, agenda por médico y un panel de
            secretaría para gestionar todo. Nada de esto es real: los médicos, pacientes y turnos son datos de
            demostración.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-black/50">Especialidades</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {specialties.map((s) => (
              <span key={s.id} className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm">
                {s.name}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-black/50">Nuestros médicos</h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {doctors.map((d) => (
              <div key={d.id} className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-4">
                <DoctorAvatar name={d.name} specialtySlug={d.specialty?.slug} />
                <div>
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-sm text-black/50">{d.specialty?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
