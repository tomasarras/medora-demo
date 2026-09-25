"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, CheckCircle2 } from "lucide-react";
import { formatDayLabel, formatTime } from "@/lib/format";

export default function TurnoDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [appt, setAppt] = useState(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/appointments/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setAppt(data);
        setNotes(data.notes || "");
      });
  }, [id]);

  async function handleAttend() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "attend", notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAppt(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!appt) {
    return (
      <p className="flex items-center gap-2 text-sm text-black/50">
        <Loader2 size={14} className="animate-spin" /> Cargando turno...
      </p>
    );
  }

  return (
    <div className="max-w-xl">
      <button type="button" onClick={() => router.push("/medico/panel")} className="mb-4 flex items-center gap-1 text-sm text-black/50 hover:text-black">
        <ChevronLeft size={16} /> Volver a la agenda
      </button>

      <h1 className="text-xl font-bold">{appt.patient.name}</h1>
      <p className="text-sm text-black/50">{appt.patient.phone}</p>
      <p className="mt-2 text-sm">
        {formatDayLabel(appt.date)} · {formatTime(appt.date)}
      </p>
      <p className="mt-1 text-sm text-black/70">Motivo: {appt.reason}</p>

      <div className="mt-6">
        <label className="mb-1 block text-sm font-medium">Notas de la consulta</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Diagnóstico, indicaciones, seguimiento..."
          className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {appt.status === "ATENDIDO" ? (
        <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-accent">
          <CheckCircle2 size={16} /> Turno atendido
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleAttend}
        disabled={saving}
        className="mt-4 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        {appt.status === "ATENDIDO" ? "Guardar notas" : "Marcar como atendido"}
      </button>
    </div>
  );
}
