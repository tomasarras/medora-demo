"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useRole } from "@/components/RoleProvider";
import DoctorAvatar from "@/components/DoctorAvatar";

export default function MedicoPickerPage() {
  const router = useRouter();
  const { enterMedico } = useRole();
  const [doctors, setDoctors] = useState(null);

  useEffect(() => {
    fetch("/api/doctors")
      .then((res) => res.json())
      .then((all) => setDoctors(all.filter((d) => d.active)));
  }, []);

  function handleSelect(id) {
    enterMedico(id);
    router.push("/medico/panel");
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <button type="button" onClick={() => router.push("/")} className="mb-4 flex items-center gap-1 text-sm text-black/50 hover:text-black">
        <ChevronLeft size={16} /> Volver
      </button>
      <h1 className="text-xl font-bold">¿Cuál médico sos?</h1>
      <p className="mt-1 text-sm text-black/50">Elegí tu perfil para ver tu agenda.</p>

      {!doctors ? (
        <p className="mt-6 flex items-center gap-2 text-sm text-black/50">
          <Loader2 size={14} className="animate-spin" /> Cargando médicos...
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {doctors.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => handleSelect(d.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-black/10 bg-white p-4 text-left shadow-sm hover:-translate-y-0.5 hover:shadow-md"
            >
              <DoctorAvatar name={d.name} specialtySlug={d.specialty?.slug} />
              <div>
                <p className="font-semibold">{d.name}</p>
                <p className="text-sm text-black/50">{d.specialty?.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
