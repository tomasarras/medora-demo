"use client";

import { useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import PatientHeader from "@/components/PatientHeader";
import { formatDayLabel, formatTime } from "@/lib/format";

const STATUS_LABEL = { CONFIRMADO: "Confirmado", ATENDIDO: "Atendido", CANCELADO: "Cancelado" };
const STATUS_STYLE = {
  CONFIRMADO: "bg-accent/10 text-accent",
  ATENDIDO: "bg-black/10 text-black/60",
  CANCELADO: "bg-red-50 text-red-600",
};

export default function MisTurnosPage() {
  const [phone, setPhone] = useState("");
  const [appointments, setAppointments] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/appointments?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo buscar tus turnos");
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    setCancelingId(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAppointments((prev) => prev.map((a) => (a.id === id ? data : a)));
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelingId(null);
    }
  }

  return (
    <>
      <PatientHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-xl font-bold">Mis turnos</h1>
        <p className="mt-1 text-sm text-black/50">Ingresá el teléfono que usaste al reservar.</p>

        <form onSubmit={handleSearch} className="mt-5 flex gap-2">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="Tu teléfono"
            className="flex-1 rounded-lg border border-black/15 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Buscar
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {appointments && (
          <div className="mt-6 space-y-3">
            {appointments.length === 0 && <p className="text-sm text-black/50">No encontramos turnos con ese teléfono.</p>}
            {appointments.map((a) => (
              <div key={a.id} className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{a.doctor.name}</p>
                    <p className="text-sm text-black/50">{a.doctor.specialty}</p>
                    <p className="mt-1 text-sm">
                      {formatDayLabel(a.date)} · {formatTime(a.date)}
                    </p>
                    <p className="mt-1 text-sm text-black/60">Motivo: {a.reason}</p>
                    {a.notes && <p className="mt-1 text-sm text-black/60">Notas del médico: {a.notes}</p>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[a.status]}`}>
                    {STATUS_LABEL[a.status]}
                  </span>
                </div>
                {a.status === "CONFIRMADO" && new Date(a.date) > new Date() && (
                  <button
                    type="button"
                    onClick={() => handleCancel(a.id)}
                    disabled={cancelingId === a.id}
                    className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:underline disabled:opacity-60"
                  >
                    {cancelingId === a.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                    Cancelar turno
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
