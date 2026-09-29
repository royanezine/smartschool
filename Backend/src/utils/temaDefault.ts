export const KELOMPOK_TEMA = "warna_tema"; 

export type TemaGroup = "tema" | "badgeStatus" | "labelRole" | "shiftKerja";

// Default warna. Dipakai kalau sekolah belum mengatur sendiri.
export const TEMA_DEFAULT: Record<TemaGroup, Record<string, string>> = {
  tema: {
    primary: "#2563EB",
    secondary: "#64748B",
    accent: "#F59E0B",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#0F172A",
    border: "#E2E8F0",
  },
  badgeStatus: {
    aktif: "#16A34A",
    nonaktif: "#6B7280",
    menunggu: "#F59E0B",
    disetujui: "#16A34A",
    ditolak: "#DC2626",
    hadir: "#16A34A",
    izin: "#2563EB",
    sakit: "#F59E0B",
    alpa: "#DC2626",
    terlambat: "#EA580C",
  },
  labelRole: {
    super_admin: "#7C3AED",
    admin_yayasan: "#4F46E5",
    admin_sekolah: "#2563EB",
    guru: "#0D9488",
    siswa: "#0EA5E9",
  },
  shiftKerja: {
    pagi: "#F59E0B",
    siang: "#6366F1",
  },
};

// "#abc" / "#AABBCC" -> "#AABBCC"
export const normalisasiHex = (hex: string): string => {
  let h = hex.replace("#", "").toUpperCase();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return `#${h}`;
};

export const formatWarna = (hex: string) => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { hex, rgb: `rgb(${r}, ${g}, ${b})`, r, g, b };
};

// Gabungkan default + override sekolah (kunci: "warna.<group>.<key>")
export const bangunTema = (overrides: { kunci: string; nilai: string }[]) => {
  const hasil: Record<string, Record<string, string>> = {};

  (Object.keys(TEMA_DEFAULT) as TemaGroup[]).forEach((g) => {
    hasil[g] = { ...TEMA_DEFAULT[g] };
  });

  for (const o of overrides) {
    const [, group, key] = o.kunci.split(".");
    if (group && key && hasil[group]) {
      hasil[group][key] = o.nilai;
    }
  }

  const output: Record<string, Record<string, ReturnType<typeof formatWarna>>> =
    {};
  for (const [group, warna] of Object.entries(hasil)) {
    output[group] = {};
    for (const [key, hex] of Object.entries(warna)) {
      output[group][key] = formatWarna(normalisasiHex(hex));
    }
  }
  return output;
};