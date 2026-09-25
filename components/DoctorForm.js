"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DoctorForm({ doctor }) {
  const router = useRouter();
  const isEdit = Boolean(doctor);

  const [specialties, setSpecialties] = useState([]);
  const [name, setName] = useState(doctor?.name || "");
  const [bio, setBio] = useState(doctor?.bio || "");
  const [specialtyId, setSpecialtyId] = useState(doctor?.specialtyId || "");
  const [active, setActive] = useState(doctor?.active ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/specialties")
      .then((res) => res.json())
      .then((list) => {
        setSpecialties(list);
        if (!isEdit && list[0]) setSpecialtyId((prev) => prev || list[0].id);
      });
  }, [isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { name, bio, specialtyId, active };
      const res = await fetch(isEdit ? `/api/doctors/${doctor.id}` : "/api/doctors", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/secretaria/medicos");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium">Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Especialidad</label>
        <select
          value={specialtyId}
          onChange={(e) => setSpecialtyId(e.target.value)}
          required
          className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm"
        >
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Bio (opcional)</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm" />
      </div>

      {isEdit && (
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Activo (visible para reservar turnos)
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        {isEdit ? "Guardar cambios" : "Crear médico"}
      </button>
    </form>
  );
}
