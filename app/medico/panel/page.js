"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRole } from "@/components/RoleProvider";
import { formatDayLabel, formatTime } from "@/lib/format";

const STATUS_STYLE = {
  CONFIRMADO: "bg-accent/10 text-accent",
  ATENDIDO: "bg-black/10 text-black/60",
};

function isSameDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  return da.getUTCFullYear() === db.getUTCFullYear() && da.getUTCMonth() === db.getUTCMonth() && da.getUTCDate() === db.getUTCDate();
}

export default function MedicoPanelPage() {
  const { doctorId } = useRole();
  const [appointments, setAppointments] = useState(null);

  useEffect(() => {
    if (!doctorId) return;
    fetch(`/api/appointments?doctorId=${doctorId}`)
      .then((res) => res.json())
      .then(setAppointments);
  }, [doctorId]);

  if (!appointments) {
    return (
      <p className="flex items-center gap-2 text-sm text-black/50">
        <Loader2 size={14} className="animate-spin" /> Cargando agenda...
      </p>
    );
  }

  const today = appointments.filter((a) => isSameDay(a.date, new Date()));
  const upcoming = appointments.filter((a) => !isSameDay(a.date, new Date()) && new Date(a.date) > new Date());
  const past = appointments.filter((a) => new Date(a.date) <= new Date() && !isSameDay(a.date, new Date()));

  function Row({ a }) {
    return (
      <Link
        href={`/medico/panel/turno/${a.id}`}
        className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-white p-4 hover:-translate-y-0.5 hover:shadow-md"
      >
        <div>
          <p className="font-semibold">{a.patient.name}</p>
          <p className="text-sm text-black/50">{formatDayLabel(a.date)} · {formatTime(a.date)}</p>
          <p className="mt-1 text-sm text-black/60">{a.reason}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLE[a.status] || "bg-black/10 text-black/60"}`}>
          {a.status === "CONFIRMADO" ? "Confirmado" : "Atendido"}
        </span>
      </Link>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-xl font-bold">Hoy</h1>
        <div className="mt-4 space-y-3">
          {today.length === 0 && <p className="text-sm text-black/50">No tenés turnos hoy.</p>}
          {today.map((a) => (
            <Row key={a.id} a={a} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold">Próximos</h2>
        <div className="mt-4 space-y-3">
          {upcoming.length === 0 && <p className="text-sm text-black/50">No tenés turnos próximos.</p>}
          {upcoming.map((a) => (
            <Row key={a.id} a={a} />
          ))}
        </div>
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="text-lg font-bold">Historial reciente</h2>
          <div className="mt-4 space-y-3">
            {past.slice(0, 10).map((a) => (
              <Row key={a.id} a={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
