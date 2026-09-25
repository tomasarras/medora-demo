import { initials } from "@/lib/format";

const SPECIALTY_COLORS = {
  "clinica-general": "#0f766e",
  pediatria: "#d97706",
  dermatologia: "#db2777",
  cardiologia: "#dc2626",
  traumatologia: "#2563eb",
};

export default function DoctorAvatar({ name, specialtySlug, size = 44 }) {
  const color = SPECIALTY_COLORS[specialtySlug] || "#475569";
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}
