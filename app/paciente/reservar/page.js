"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import PatientHeader from "@/components/PatientHeader";
import DoctorAvatar from "@/components/DoctorAvatar";
import { formatDayLabel, formatTime } from "@/lib/format";

function nextDays(count) {
  const days = [];
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 1);
  while (days.length < count) {
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) {
      const iso = d.toISOString().slice(0, 10);
      days.push({ dateOnly: iso, label: formatDayLabel(d) });
    }
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return days;
}

const STEPS = ["especialidad", "medico", "horario", "datos", "listo"];

export default function ReservarTurnoPage() {
  const [step, setStep] = useState(0);
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [specialtyId, setSpecialtyId] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [dateOnly, setDateOnly] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotIso, setSlotIso] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  const days = useMemo(() => nextDays(14), []);
  const doctor = doctors.find((d) => d.id === doctorId);

  useEffect(() => {
    fetch("/api/specialties")
      .then((res) => res.json())
      .then(setSpecialties);
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((all) => setDoctors(all.filter((d) => d.active)));
  }, []);

  useEffect(() => {
    if (!doctorId || !dateOnly) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingSlots(true);
    setSlotIso(null);
    fetch(`/api/appointments/slots?doctorId=${doctorId}&date=${dateOnly}`)
      .then((res) => res.json())
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [doctorId, dateOnly]);

  const doctorsForSpecialty = doctors.filter((d) => d.specialtyId === specialtyId);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, date: slotIso, name, phone, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo reservar el turno");
      setConfirmed(data);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  return (
    <>
      <PatientHeader />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {step > 0 && step < 4 && (
          <button type="button" onClick={back} className="mb-4 flex items-center gap-1 text-sm text-black/50 hover:text-black">
            <ChevronLeft size={16} /> Volver
          </button>
        )}

        {step === 0 && (
          <div>
            <h1 className="text-xl font-bold">¿Qué especialidad necesitás?</h1>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {specialties.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSpecialtyId(s.id);
                    setStep(1);
                  }}
                  className="rounded-2xl border border-black/10 bg-white p-4 text-left font-medium shadow-sm hover:-translate-y-0.5 hover:shadow-md"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="text-xl font-bold">Elegí un médico</h1>
            <div className="mt-5 space-y-3">
              {doctorsForSpecialty.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setDoctorId(d.id);
                    setStep(2);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 text-left shadow-sm hover:-translate-y-0.5 hover:shadow-md"
                >
                  <DoctorAvatar name={d.name} specialtySlug={d.specialty?.slug} />
                  <div>
                    <p className="font-semibold">{d.name}</p>
                    {d.bio && <p className="text-sm text-black/50">{d.bio}</p>}
                  </div>
                </button>
              ))}
              {doctorsForSpecialty.length === 0 && <p className="text-sm text-black/50">No hay médicos disponibles para esta especialidad.</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-xl font-bold">Elegí día y horario con {doctor?.name}</h1>
            <div className="mt-5 flex flex-wrap gap-2">
              {days.map((d) => (
                <button
                  key={d.dateOnly}
                  type="button"
                  onClick={() => setDateOnly(d.dateOnly)}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    dateOnly === d.dateOnly ? "border-black bg-black text-white" : "border-black/15 hover:bg-black/5"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {dateOnly && (
              <div className="mt-5">
                {loadingSlots ? (
                  <p className="flex items-center gap-2 text-sm text-black/50">
                    <Loader2 size={14} className="animate-spin" /> Buscando horarios...
                  </p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-black/50">No hay horarios libres ese día. Probá otra fecha.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {slots.map((iso) => (
                      <button
                        key={iso}
                        type="button"
                        onClick={() => setSlotIso(iso)}
                        className={`rounded-full border px-3 py-1.5 text-sm ${
                          slotIso === iso ? "border-accent bg-accent text-accent-foreground" : "border-black/15 hover:bg-black/5"
                        }`}
                      >
                        {formatTime(iso)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              disabled={!slotIso}
              onClick={() => setStep(3)}
              className="mt-6 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit}>
            <h1 className="text-xl font-bold">Tus datos</h1>
            <p className="mt-1 text-sm text-black/50">
              {doctor?.name} · {dateOnly && formatDayLabel(dateOnly)} · {slotIso && formatTime(slotIso)}
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Nombre y apellido</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Teléfono</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="Lo usás después para ver tus turnos"
                  className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Motivo de la consulta</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={3}
                  className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Confirmar turno
            </button>
          </form>
        )}

        {step === 4 && confirmed && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <CheckCircle2 size={48} className="text-accent" />
            <h1 className="text-xl font-bold">¡Turno confirmado!</h1>
            <p className="text-black/60">
              {confirmed.doctor.name} · {formatDayLabel(confirmed.date)} · {formatTime(confirmed.date)}
            </p>
            <p className="text-sm text-black/50">Guardá tu teléfono a mano: lo vas a necesitar en &quot;Mis turnos&quot;.</p>
          </div>
        )}
      </main>
    </>
  );
}
