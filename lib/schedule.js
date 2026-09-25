import { prisma } from "@/lib/prisma";

// Fixed weekly schedule for every doctor (a real clinic would let each
// doctor configure their own hours — out of scope for a demo). Monday(1)
// through Friday(5), morning + afternoon blocks with a lunch break,
// 30-minute slots. Dates are handled as UTC "wall clock" values throughout
// this app — see the note in lib/format.js.
const BLOCKS = [
  { startHour: 9, endHour: 13 },
  { startHour: 14, endHour: 18 },
];
const SLOT_MINUTES = 30;
export const MAX_BOOKING_DAYS_AHEAD = 21;

function slotTimesForWeekday(weekday) {
  if (weekday === 0 || weekday === 6) return [];
  const times = [];
  for (const block of BLOCKS) {
    for (let m = block.startHour * 60; m < block.endHour * 60; m += SLOT_MINUTES) {
      times.push({ hour: Math.floor(m / 60), minute: m % 60 });
    }
  }
  return times;
}

// `dateOnly` is a "YYYY-MM-DD" string picked by the patient/secretary.
export function slotsForDate(dateOnly) {
  const [year, month, day] = dateOnly.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return slotTimesForWeekday(weekday).map(({ hour, minute }) => new Date(Date.UTC(year, month - 1, day, hour, minute)));
}

export async function getAvailableSlots(doctorId, dateOnly) {
  const candidates = slotsForDate(dateOnly);
  if (candidates.length === 0) return [];

  const dayStart = candidates[0];
  const dayEnd = new Date(candidates[candidates.length - 1].getTime() + SLOT_MINUTES * 60000);
  const taken = await prisma.appointment.findMany({
    where: { doctorId, status: { not: "CANCELADO" }, date: { gte: dayStart, lt: dayEnd } },
    select: { date: true },
  });
  const takenTimes = new Set(taken.map((a) => a.date.getTime()));
  const now = new Date();
  return candidates.filter((slot) => !takenTimes.has(slot.getTime()) && slot.getTime() > now.getTime());
}

export function isSlotInSchedule(date) {
  const d = new Date(date);
  const weekday = d.getUTCDay();
  const minutesOfDay = d.getUTCHours() * 60 + d.getUTCMinutes();
  if (minutesOfDay % SLOT_MINUTES !== 0) return false;
  return slotTimesForWeekday(weekday).some((t) => t.hour * 60 + t.minute === minutesOfDay);
}
