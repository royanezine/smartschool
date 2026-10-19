// ============================================================
// Helper bersama halaman Langganan (Admin Sekolah)
// ============================================================

export const SIKLUS_LABEL = {
  monthly: "Bulanan",
  annual: "Tahunan",
};

export const STATUS_PEMBAYARAN = {
  success: {
    label: "Berhasil",
    className: "theme-success",
    dot: "bg-[var(--color-success)]",
  },
  pending: {
    label: "Menunggu",
    className: "theme-warning",
    dot: "bg-[var(--color-warning)]",
  },
  failed: {
    label: "Gagal",
    className: "theme-danger",
    dot: "bg-[var(--color-danger)]",
  },
};

export const STATUS_LANGGANAN = {
  active: { label: "Aktif", className: "theme-success" },
  trialing: { label: "Trial", className: "theme-warning" },
  pending: { label: "Menunggu Pembayaran", className: "theme-warning" },
  expired: { label: "Kedaluwarsa", className: "theme-danger" },
  cancelled: { label: "Dibatalkan", className: "theme-danger" },
};

export function formatRupiah(value) {
  const angka = Number(value);

  if (!Number.isFinite(angka)) {
    return "Rp0";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);
}

export function formatTanggal(value, { withTime = false } = {}) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  const tanggal = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!withTime) {
    return tanggal;
  }

  const waktu = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${tanggal}, ${waktu} WIB`;
}

export function siklusLabel(siklus) {
  return SIKLUS_LABEL[siklus] ?? "-";
}

export function statusPembayaranInfo(status) {
  return (
    STATUS_PEMBAYARAN[status] ?? {
      label: status || "Tidak diketahui",
      className: "theme-text-muted theme-border",
      dot: "bg-[var(--color-text-muted)]",
    }
  );
}

export function statusLanggananInfo(status) {
  return (
    STATUS_LANGGANAN[status] ?? {
      label: status || "Tidak diketahui",
      className: "theme-text-muted theme-border",
    }
  );
}

export function sisaHari(tanggalBerakhir) {
  if (!tanggalBerakhir) {
    return null;
  }

  const end = new Date(tanggalBerakhir).getTime();

  if (Number.isNaN(end)) {
    return null;
  }

  return Math.max(0, Math.ceil((end - Date.now()) / 86400000));
}
