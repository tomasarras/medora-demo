"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Stethoscope, LogOut } from "lucide-react";
import { useRole } from "@/components/RoleProvider";

export default function MedicoPanelLayout({ children }) {
  const { role, doctorId, loaded, exitRole } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const [doctorName, setDoctorName] = useState("");

  useEffect(() => {
    if (loaded && (role !== "medico" || !doctorId)) router.replace("/medico");
  }, [loaded, role, doctorId, router]);

  useEffect(() => {
    if (!doctorId) return;
    fetch(`/api/doctors/${doctorId}`)
      .then((res) => res.json())
      .then((d) => setDoctorName(d.name || ""));
  }, [doctorId]);

  function handleExit() {
    exitRole();
    router.push("/");
  }

  if (!loaded || role !== "medico" || !doctorId) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-black/40">Cargando…</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/medico/panel" className="flex items-center gap-2 text-lg font-bold">
            <Stethoscope size={20} className="text-accent" />
            {doctorName || "Mi agenda"}
          </Link>
          <button type="button" onClick={handleExit} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-black/60 hover:bg-black/5">
            <LogOut size={16} />
            Salir
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6" key={pathname}>
        {children}
      </main>
    </div>
  );
}
