"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { formatTime } from "@/lib/format";

function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

export default function NuevoTurnoPage() {
  const router = useRouter();
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [specialtyId, setSpecialtyId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [dateOnly, setDateOnly] = useState(todayDateOnly());
  const [slots, setSlots] = useState([]);
  const [slotIso, setSlotIso] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/specialties")
      .then((res) => res.json())
      .then((list) => {
        setSpecialties(list);
        if (list[0]) setSpecialtyId(list[0].id);
      });
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((all) => setDoctors(all.filter((d) => d.active)));
  }, []);

  const doctorsForSpecialty = doctors.filter((d) => d.specialtyId === specialtyId);

  useEffect(() => {
    if (doctorsForSpecialty[0] && !doctorsForSpecialty.some((d) => d.id === doctorId)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDoctorId(doctorsForSpecialty[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specialtyId, doctors]);

  useEffect(() => {
    if (!doctorId || !dateOnly) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlotIso(null);
    fetch(`/api/appointments/slots?doctorId=${doctorId}&date=${dateOnly}`)
      .then((res) => res.json())
      .then(setSlots);
  }, [doctorId, dateOnly]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, date: slotIso, name, phone, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/secretaria/turnos");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <h1 className="text-2xl font-bold">Nuevo turno</h1>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Especialidad</label>
          <select value={specialtyId} onChange={(e) => setSpecialtyId(e.target.value)} className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm">
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Médico</label>
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm">
            {doctorsForSpecialty.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Fecha</label>
        <input type="date" value={dateOnly} onChange={(e) => setDateOnly(e.target.value)} className="rounded-lg border border-black/15 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Horario</label>
        <div className="flex flex-wrap gap-2">
          {slots.map((iso) => (
            <button
              key={iso}
              type="button"
              onClick={() => setSlotIso(iso)}
              className={`rounded-full border px-3 py-1.5 text-sm ${slotIso === iso ? "border-accent bg-accent text-accent-foreground" : "border-black/15 hover:bg-black/5"}`}
            >
              {formatTime(iso)}
            </button>
          ))}
          {slots.length === 0 && <p className="text-sm text-black/40">Sin horarios libres ese día.</p>}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Nombre del paciente</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm" />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium">Teléfono</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Motivo</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} required rows={3} className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!slotIso || saving}
        className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        Crear turno
      </button>
    </form>
  );
}
