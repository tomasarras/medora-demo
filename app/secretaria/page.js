"use client";

import Link from "next/link";
import { CalendarDays, Stethoscope, Tags, Users } from "lucide-react";

const CARDS = [
  { href: "/secretaria/turnos", label: "Turnos", description: "Ver, crear y reprogramar turnos de todos los médicos", icon: CalendarDays },
  { href: "/secretaria/medicos", label: "Médicos", description: "Alta y edición de médicos por especialidad", icon: Stethoscope },
  { href: "/secretaria/especialidades", label: "Especialidades", description: "Organizar las especialidades de la clínica", icon: Tags },
  { href: "/secretaria/pacientes", label: "Pacientes", description: "Buscar pacientes y ver su historial", icon: Users },
];

export default function SecretariaDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Panel</h1>
      <p className="mt-1 text-sm text-black/50">Elegí qué querés administrar.</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5">
              <Icon size={20} />
            </span>
            <span className="font-semibold">{label}</span>
            <span className="text-sm text-black/50">{description}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
