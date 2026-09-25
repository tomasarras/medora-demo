"use client";

import Link from "next/link";
import { CalendarPlus, CalendarSearch } from "lucide-react";

export default function PatientHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-[var(--background)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/paciente" className="text-xl font-bold tracking-tight">
          Medora
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium sm:gap-6">
          <Link href="/paciente/reservar" className="flex items-center gap-1.5 hover:text-accent">
            <CalendarPlus size={18} />
            <span className="hidden sm:inline">Reservar turno</span>
          </Link>
          <Link href="/paciente/mis-turnos" className="flex items-center gap-1.5 hover:text-accent">
            <CalendarSearch size={18} />
            <span className="hidden sm:inline">Mis turnos</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
