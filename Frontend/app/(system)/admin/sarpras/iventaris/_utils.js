export const KONDISI_OPTIONS = [
  { value: "baik", label: "Baik" },
  { value: "rusak_ringan", label: "Rusak Ringan" },
  { value: "rusak_berat", label: "Rusak Berat" },
];

export const STATUS_OPTIONS = [
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" },
];

export function extractData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.results)) return response.results;
  return [];
}

export function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatKondisi(value) {
  const normalized = String(value || "").toLowerCase();

  return (
    KONDISI_OPTIONS.find((item) => item.value === normalized)?.label ||
    (normalized
      ? normalized.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "-")
  );
}

export function getStokStatus(aset) {
  const stok = Number(aset?.jumlahStok) || 0;
  const minimum = Number(aset?.stokMinimum) || 0;

  if (stok <= 0) {
    return {
      key: "habis",
      label: "Habis",
      className:
        "border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] text-[var(--color-danger)]",
    };
  }

  if (stok <= minimum) {
    return {
      key: "menipis",
      label: "Menipis",
      className:
        "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] text-[var(--color-warning)]",
    };
  }

  return {
    key: "aman",
    label: "Aman",
    className:
      "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-[var(--color-success)]",
  };
}

export function kondisiBadgeClass(kondisi) {
  switch (String(kondisi || "").toLowerCase()) {
    case "rusak_berat":
      return "border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] text-[var(--color-danger)]";
    case "rusak_ringan":
      return "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] text-[var(--color-warning)]";
    default:
      return "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-[var(--color-success)]";
  }
}
