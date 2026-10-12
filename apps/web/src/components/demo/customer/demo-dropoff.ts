export const DEMO_DROP_OFF_TIMES = ["09:00", "11:00", "14:00"] as const;

export type DemoDropOffSlot = {
  dateKey: string;
  time: string;
  label: string;
};

/** Next N weekdays from tomorrow — demo availability only. */
export function getSampleDropOffDates(count = 5): Date[] {
  const dates: Date[] = [];
  const cursor = new Date();
  cursor.setHours(12, 0, 0, 0);

  while (dates.length < count) {
    cursor.setDate(cursor.getDate() + 1);
    const day = cursor.getDay();
    if (day === 0 || day === 6) continue;
    dates.push(new Date(cursor));
  }

  return dates;
}

export function formatDropOffDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function slotStorageKey(leadId: string) {
  return `demo-customer-dropoff:${leadId}`;
}

export function readStoredDropOffSlot(leadId: string): DemoDropOffSlot | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(slotStorageKey(leadId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoDropOffSlot;
    if (!parsed?.dateKey || !parsed?.time || !parsed?.label) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeStoredDropOffSlot(leadId: string, slot: DemoDropOffSlot) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(slotStorageKey(leadId), JSON.stringify(slot));
}

export function money(value: number) {
  return value.toLocaleString("en-GB", {
    style: "currency",
    currency: "GBP",
  });
}

export function demoDepositBreakdown(quotedCost: number | null) {
  const total = Number(quotedCost ?? 0);
  const deposit = Math.round(total * 0.2 * 100) / 100;
  const remaining = Math.round((total - deposit) * 100) / 100;
  return { total, deposit, remaining };
}
