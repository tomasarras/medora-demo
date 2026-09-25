"use client";

import { useEffect, useState, use } from "react";
import { Loader2 } from "lucide-react";
import { formatDayLabel, formatTime } from "@/lib/format";

const STATUS_LABEL = { CONFIRMADO: "Confirmado", ATENDIDO: "Atendido", CANCELADO: "Cancelado" };

export default function PacienteDetailPage({ params }) {
  const { id } = use(params);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    fetch(`/api/patients/${id}`)
      .then((res) => res.json())
      .then(setPatient);
  }, [id]);

  if (!patient) {
    return (
      <p className="flex items-center gap-2 text-sm text-black/50">
        <Loader2 size={14} className="animate-spin" /> Cargando...
      </p>
    );
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">{patient.name}</h1>
      <p className="text-sm text-black/50">{patient.phone}{patient.email ? ` · ${patient.email}` : ""}</p>

      <h2 className="mt-8 text-lg font-bold">Historial de turnos</h2>
      <div className="mt-4 space-y-3">
        {patient.appointments.length === 0 && <p className="text-sm text-black/50">Sin turnos registrados.</p>}
        {patient.appointments.map((a) => (
          <div key={a.id} className="rounded-xl border border-black/10 bg-white p-4">
            <p className="font-medium">{a.doctor.name} · {a.doctor.specialty}</p>
            <p className="text-sm text-black/50">{formatDayLabel(a.date)} · {formatTime(a.date)} · {STATUS_LABEL[a.status]}</p>
            <p className="mt-1 text-sm text-black/70">Motivo: {a.reason}</p>
            {a.notes && <p className="mt-1 text-sm text-black/70">Notas: {a.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
