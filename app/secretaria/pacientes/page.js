"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export default function PacientesPage() {
  const [q, setQ] = useState("");
  const [patients, setPatients] = useState(null);

  function load(query) {
    fetch(`/api/patients${query ? `?q=${encodeURIComponent(query)}` : ""}`)
      .then((res) => res.json())
      .then(setPatients);
  }

  useEffect(() => {
    load("");
  }, []);

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Pacientes</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(q);
        }}
        className="mt-6 flex gap-2"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre o teléfono"
          className="flex-1 rounded-lg border border-black/15 px-3 py-2 text-sm"
        />
        <button type="submit" className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">
          <Search size={14} />
          Buscar
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {!patients && <p className="text-sm text-black/50">Cargando...</p>}
        {patients?.length === 0 && <p className="text-sm text-black/50">Sin resultados.</p>}
        {patients?.map((p) => (
          <Link key={p.id} href={`/secretaria/pacientes/${p.id}`} className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3 hover:bg-black/5">
            <span className="font-medium">{p.name}</span>
            <span className="text-sm text-black/50">{p.phone}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
