"use client";

import { useEffect, useState, use } from "react";
import { Loader2 } from "lucide-react";
import DoctorForm from "@/components/DoctorForm";

export default function EditarMedicoPage({ params }) {
  const { id } = use(params);
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    fetch(`/api/doctors/${id}`)
      .then((res) => res.json())
      .then(setDoctor);
  }, [id]);

  if (!doctor) {
    return (
      <p className="flex items-center gap-2 text-sm text-black/50">
        <Loader2 size={14} className="animate-spin" /> Cargando...
      </p>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{doctor.name}</h1>
      <DoctorForm doctor={doctor} />
    </div>
  );
}
