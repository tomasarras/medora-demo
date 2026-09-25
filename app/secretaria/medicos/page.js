"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import DoctorAvatar from "@/components/DoctorAvatar";

export default function MedicosPage() {
  const [doctors, setDoctors] = useState(null);

  useEffect(() => {
    fetch("/api/doctors")
      .then((res) => res.json())
      .then(setDoctors);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Médicos</h1>
        <Link href="/secretaria/medicos/nuevo" className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">
          <Plus size={14} />
          Nuevo médico
        </Link>
      </div>

      <div className="mt-6 space-y-2">
        {!doctors && <p className="text-sm text-black/50">Cargando...</p>}
        {doctors?.map((d) => (
          <Link
            key={d.id}
            href={`/secretaria/medicos/${d.id}`}
            className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 hover:bg-black/5"
          >
            <DoctorAvatar name={d.name} specialtySlug={d.specialty?.slug} size={36} />
            <div className="flex-1">
              <p className="font-medium">{d.name}</p>
              <p className="text-sm text-black/50">{d.specialty?.name}</p>
            </div>
            {!d.active && <span className="rounded-full bg-black/10 px-2.5 py-1 text-xs font-semibold text-black/60">Inactivo</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
