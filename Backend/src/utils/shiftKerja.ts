export const SHIFT_KERJA = ["pagi", "siang"] as const;
export type ShiftKerja = (typeof SHIFT_KERJA)[number];

export const JAM_SHIFT_DEFAULT: Record<
  ShiftKerja,
  { jamMasuk: string; jamPulang: string }
> = {
  pagi: { jamMasuk: "07:00", jamPulang: "14:00" },
  siang: { jamMasuk: "12:00", jamPulang: "18:00" },
};

export const isShiftKerja = (value: unknown): value is ShiftKerja =>
  typeof value === "string" &&
  (SHIFT_KERJA as readonly string[]).includes(value);

// Terima "Pagi", " siang ", dst. Kembalikan null kalau tidak valid.
export const normalizeShiftKerja = (value: unknown): ShiftKerja | null => {
  if (typeof value !== "string") return null;
  const v = value.trim().toLowerCase();
  return isShiftKerja(v) ? v : null;
};