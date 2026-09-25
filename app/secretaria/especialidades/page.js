"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function EspecialidadesPage() {
  const [specialties, setSpecialties] = useState(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    fetch("/api/specialties")
      .then((res) => res.json())
      .then(setSpecialties);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/specialties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setName("");
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setError("");
    try {
      const res = await fetch(`/api/specialties/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold">Especialidades</h1>

      <form onSubmit={handleCreate} className="mt-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la especialidad"
          required
          className="flex-1 rounded-lg border border-black/15 px-3 py-2 text-sm"
        />
        <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Agregar
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-6 space-y-2">
        {!specialties && <p className="text-sm text-black/50">Cargando...</p>}
        {specialties?.map((s) => (
          <div key={s.id} className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3">
            <span className="font-medium">{s.name}</span>
            <button type="button" onClick={() => handleDelete(s.id)} className="text-black/40 hover:text-red-600">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
