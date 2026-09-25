"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeartPulse, UserRound, Stethoscope, ClipboardList, RotateCcw, Loader2 } from "lucide-react";
import { useRole } from "@/components/RoleProvider";

export default function RoleSelectorPage() {
  const router = useRouter();
  const { enterSecretaria } = useRole();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  function handleSecretaria() {
    enterSecretaria();
    router.push("/secretaria");
  }

  async function handleReset() {
    setResetting(true);
    setResetMessage("");
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo restablecer la demo");
      setResetMessage("Demo restablecida — todo volvió al estado inicial.");
    } catch (err) {
      setResetMessage(err.message);
    } finally {
      setResetting(false);
      setConfirmingReset(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <HeartPulse size={26} />
      </span>
      <h1 className="text-2xl font-bold">Medora</h1>
      <p className="max-w-sm text-sm text-black/50">Demo de portfolio · elegí cómo querés entrar.</p>

      <div className="mt-4 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => router.push("/paciente")}
          className="flex flex-col items-start gap-3 rounded-2xl border border-black/10 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <UserRound size={20} />
          </span>
          <span className="block text-base font-semibold">Paciente</span>
          <span className="block text-sm text-black/50">Reservar o consultar mis turnos</span>
        </button>

        <button
          type="button"
          onClick={() => router.push("/medico")}
          className="flex flex-col items-start gap-3 rounded-2xl border border-black/10 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
            <Stethoscope size={20} />
          </span>
          <span className="block text-base font-semibold">Médico</span>
          <span className="block text-sm text-black/50">Ver mi agenda y atender turnos</span>
        </button>

        <button
          type="button"
          onClick={handleSecretaria}
          className="flex flex-col items-start gap-3 rounded-2xl border border-black/10 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white">
            <ClipboardList size={20} />
          </span>
          <span className="block text-base font-semibold">Secretaría</span>
          <span className="block text-sm text-black/50">Gestionar turnos, médicos y pacientes</span>
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {!confirmingReset ? (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/60 hover:bg-black/5"
          >
            <RotateCcw size={16} />
            Restablecer demo
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            <span>¿Borrar todo y volver al estado inicial?</span>
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-1.5 rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
            >
              {resetting && <Loader2 size={12} className="animate-spin" />}
              Sí, restablecer
            </button>
            <button
              type="button"
              onClick={() => setConfirmingReset(false)}
              disabled={resetting}
              className="text-xs font-semibold text-amber-700 hover:underline"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {resetMessage && <p className="mt-3 text-sm text-black/50">{resetMessage}</p>}

      <p className="mt-8 max-w-md text-center text-xs text-black/40">
        Es un proyecto de portfolio: no hay contraseñas reales, elegís cómo entrar y listo. Los datos son ficticios.
      </p>
    </div>
  );
}
