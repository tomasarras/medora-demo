"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, X, CalendarClock } from "lucide-react";
import { formatTime } from "@/lib/format";

const STATUS_LABEL = { CONFIRMADO: "Confirmado", ATENDIDO: "Atendido", CANCELADO: "Cancelado" };
const STATUS_STYLE = {
  CONFIRMADO: "bg-accent/10 text-accent",
  ATENDIDO: "bg-black/10 text-black/60",
  CANCELADO: "bg-red-50 text-red-600",
};

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

function RescheduleRow({ appt, onDone }) {
  const [dateOnly, setDateOnly] = useState(appt.date.slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [slotIso, setSlotIso] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/appointments/slots?doctorId=${appt.doctor.id}&date=${dateOnly}`)
      .then((res) => res.json())
      .then(setSlots);
  }, [dateOnly, appt.doctor.id]);

  async function confirm() {
    if (!slotIso) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/appointments/${appt.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reschedule", date: slotIso }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onDone(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-black/10 bg-black/[0.02] p-3">
      <input type="date" value={dateOnly} onChange={(e) => setDateOnly(e.target.value)} className="rounded-lg border border-black/15 px-2 py-1 text-sm" />
      <div className="mt-2 flex flex-wrap gap-2">
        {slots.map((iso) => (
          <button
            key={iso}
            type="button"
            onClick={() => setSlotIso(iso)}
            className={`rounded-full border px-3 py-1 text-xs ${slotIso === iso ? "border-accent bg-accent text-accent-foreground" : "border-black/15 hover:bg-black/5"}`}
          >
            {formatTime(iso)}
          </button>
        ))}
        {slots.length === 0 && <p className="text-xs text-black/40">Sin horarios libres ese día.</p>}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={confirm}
        disabled={!slotIso || loading}
        className="mt-2 flex items-center gap-1.5 rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
      >
        {loading && <Loader2 size={12} className="animate-spin" />}
        Confirmar nuevo horario
      </button>
    </div>
  );
}

export default function TurnosPage() {
  const [dateOnly, setDateOnly] = useState(todayDateOnly());
  const [appointments, setAppointments] = useState(null);
  const [reschedulingId, setReschedulingId] = useState(null);

  function load() {
    const from = `${dateOnly}T00:00:00.000Z`;
    const to = new Date(new Date(from).getTime() + 24 * 60 * 60 * 1000).toISOString();
    fetch(`/api/appointments?from=${from}&to=${to}`)
      .then((res) => res.json())
      .then((data) => setAppointments(data.sort((a, b) => new Date(a.date) - new Date(b.date))));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateOnly]);

  async function handleCancel(id) {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const data = await res.json();
    if (res.ok) setAppointments((prev) => prev.map((a) => (a.id === id ? data : a)));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Turnos</h1>
        <Link href="/secretaria/turnos/nuevo" className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white">
          <Plus size={14} />
          Nuevo turno
        </Link>
      </div>

      <input
        type="date"
        value={dateOnly}
        onChange={(e) => setDateOnly(e.target.value)}
        className="mt-4 rounded-lg border border-black/15 px-3 py-2 text-sm"
      />

      <div className="mt-6 space-y-3">
        {!appointments && <p className="text-sm text-black/50">Cargando...</p>}
        {appointments?.length === 0 && <p className="text-sm text-black/50">No hay turnos ese día.</p>}
        {appointments?.map((a) => (
          <div key={a.id} className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{formatTime(a.date)} · {a.patient.name}</p>
                <p className="text-sm text-black/50">{a.doctor.name} · {a.doctor.specialty}</p>
                <p className="mt-1 text-sm text-black/60">{a.reason}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[a.status]}`}>{STATUS_LABEL[a.status]}</span>
            </div>

            {a.status === "CONFIRMADO" && (
              <div className="mt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setReschedulingId(reschedulingId === a.id ? null : a.id)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-black/70 hover:underline"
                >
                  <CalendarClock size={14} />
                  Reprogramar
                </button>
                <button type="button" onClick={() => handleCancel(a.id)} className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:underline">
                  <X size={14} />
                  Cancelar
                </button>
              </div>
            )}

            {reschedulingId === a.id && (
              <RescheduleRow
                appt={a}
                onDone={(updated) => {
                  setReschedulingId(null);
                  load();
                  void updated;
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
