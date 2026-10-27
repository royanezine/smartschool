import type {
  PendaftarPpdb,
  PpdbStatistik,
} from "@/services/ppdb.service";

export type KunciStatusPendaftaran =
  | "menunggu"
  | "lulus"
  | "ditolak";

export interface StatusPendaftaran {
  key: KunciStatusPendaftaran;
  label: string;
}

export function normalisasiStatusPendaftaran(
  status?: string | null
): StatusPendaftaran {
  const value = String(status || "").toLowerCase();

  if (value === "lulus" || value === "terverifikasi") {
    return {
      key: "lulus",
      label: "Terverifikasi",
    };
  }

  if (value === "ditolak") {
    return {
      key: "ditolak",
      label: "Ditolak",
    };
  }

  return {
    key: "menunggu",
    label: "Menunggu Verifikasi",
  };
}

export function statusPendaftaranKeApi(
  label: string
): KunciStatusPendaftaran | undefined {
  const value = String(label || "").toLowerCase();

  if (value === "terverifikasi" || value === "lulus") {
    return "lulus";
  }

  if (value === "ditolak") {
    return "ditolak";
  }

  if (value === "menunggu verifikasi" || value === "menunggu") {
    return "menunggu";
  }

  return undefined;
}

export function formatTanggal(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatTanggalJam(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatAngka(value: unknown) {
  const angka = Number(value);

  if (!Number.isFinite(angka)) {
    return "-";
  }

  return angka.toLocaleString("id-ID");
}

export function formatNilai(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const angka = Number(value);

  if (!Number.isFinite(angka)) {
    return "-";
  }

  return angka.toLocaleString("id-ID", {
    maximumFractionDigits: 2,
  });
}

/**
 * Statistik status memakai `statistik` dari respons resmi bila tersedia.
 * Jika endpoint hanya mengirim daftar, hitung dari baris yang benar-benar
 * diterima agar tidak ada angka yang dikarang.
 */
export function hitungStatistikPendaftar(
  data: PendaftarPpdb[],
  statistik?: Partial<PpdbStatistik> | null
): PpdbStatistik {
  if (
    statistik &&
    ["total", "menunggu", "lulus", "ditolak"].every(
      (kunci) =>
        Number.isFinite(Number(statistik[kunci as keyof PpdbStatistik]))
    )
  ) {
    return {
      total: Number(statistik.total || 0),
      menunggu: Number(statistik.menunggu || 0),
      lulus: Number(statistik.lulus || 0),
      ditolak: Number(statistik.ditolak || 0),
    };
  }

  const hasil: PpdbStatistik = {
    total: data.length,
    menunggu: 0,
    lulus: 0,
    ditolak: 0,
  };

  data.forEach((item) => {
    hasil[normalisasiStatusPendaftaran(item?.status).key] += 1;
  });

  return hasil;
}

export interface RekapJalur {
  id: string;
  nama: string;
  kuota: number;
  total: number;
  menunggu: number;
  lulus: number;
  ditolak: number;
  nonDitolak: number;
  dikonversi: number;
  sisaKuota: number;
}

export function hitungRekapJalur(
  data: PendaftarPpdb[],
  jalurList: Array<{
    id: string;
    nama?: string;
    kuota?: number;
  }> = []
): RekapJalur[] {
  const peta = new Map<string, RekapJalur>();

  const pastikan = (
    id: string,
    nama?: string,
    kuota?: number
  ) => {
    const kunci = id || "tanpa-jalur";
    let rekap = peta.get(kunci);

    if (!rekap) {
      rekap = {
        id: kunci,
        nama: nama || "Tanpa jalur",
        kuota: Number(kuota || 0),
        total: 0,
        menunggu: 0,
        lulus: 0,
        ditolak: 0,
        nonDitolak: 0,
        dikonversi: 0,
        sisaKuota: 0,
      };

      peta.set(kunci, rekap);
    } else {
      if (!rekap.nama && nama) {
        rekap.nama = nama;
      }

      if (!rekap.kuota && kuota) {
        rekap.kuota = Number(kuota);
      }
    }

    return rekap;
  };

  jalurList.forEach((jalur) => {
    pastikan(jalur.id, jalur.nama, jalur.kuota);
  });

  data.forEach((item) => {
    const rekap = pastikan(
      item?.jalurPpdbId || item?.jalurPpdb?.id || "",
      item?.jalurPpdb?.nama,
      item?.jalurPpdb?.kuota
    );
    const status = normalisasiStatusPendaftaran(
      item?.status
    ).key;

    rekap.total += 1;
    rekap[status] += 1;

    if (status !== "ditolak") {
      rekap.nonDitolak += 1;
    }

    if (item?.dikonversiKePenggunaId) {
      rekap.dikonversi += 1;
    }
  });

  return Array.from(peta.values())
    .map((rekap) => ({
      ...rekap,
      sisaKuota:
        rekap.kuota > 0
          ? Math.max(
              rekap.kuota - rekap.nonDitolak,
              0
            )
          : 0,
    }))
    .sort((a, b) =>
      a.nama.localeCompare(b.nama, "id")
    );
}

export interface RekapSeleksi {
  tersedia: boolean;
  totalPendaftar: number;
  sudahAdaHasil: number;
  belumAdaHasil: number;
  jumlahDinilai: number;
  rataNilaiTes: number | null;
  statusKelulusan: Array<{
    label: string;
    jumlah: number;
  }>;
}

export function hitungRekapSeleksi(
  data: PendaftarPpdb[]
): RekapSeleksi {
  const tersedia =
    data.length === 0 ||
    data.some(
      (item) =>
        item != null &&
        "hasilSeleksiPpdb" in item
    );

  if (!tersedia) {
    return {
      tersedia: false,
      totalPendaftar: data.length,
      sudahAdaHasil: 0,
      belumAdaHasil: 0,
      jumlahDinilai: 0,
      rataNilaiTes: null,
      statusKelulusan: [],
    };
  }

  const statusMap = new Map<string, number>();
  let sudahAdaHasil = 0;
  let jumlahDinilai = 0;
  let totalNilai = 0;

  data.forEach((item) => {
    const hasil = item?.hasilSeleksiPpdb;

    if (!hasil) {
      return;
    }

    sudahAdaHasil += 1;

    if (
      hasil.nilaiTes !== null &&
      hasil.nilaiTes !== undefined &&
      hasil.nilaiTes !== "" &&
      Number.isFinite(Number(hasil.nilaiTes))
    ) {
      jumlahDinilai += 1;
      totalNilai += Number(hasil.nilaiTes);
    }

    const status = String(
      hasil.statusKelulusan || ""
    ).trim();

    if (status) {
      statusMap.set(
        status,
        (statusMap.get(status) || 0) + 1
      );
    }
  });

  return {
    tersedia: true,
    totalPendaftar: data.length,
    sudahAdaHasil,
    belumAdaHasil:
      data.length - sudahAdaHasil,
    jumlahDinilai,
    rataNilaiTes:
      jumlahDinilai > 0
        ? totalNilai / jumlahDinilai
        : null,
    statusKelulusan: Array.from(
      statusMap.entries()
    )
      .map(([label, jumlah]) => ({
        label,
        jumlah,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, "id")
      ),
  };
}

export const NAMA_BERKAS_WAJIB = [
  "KK",
  "AKTE",
  "IJAZAH",
] as const;

export interface RekapBerkas {
  nama: string;
  jumlah: number;
  lengkap: number;
}

export function hitungRekapBerkas(
  data: PendaftarPpdb[]
): RekapBerkas[] {
  const rekap = NAMA_BERKAS_WAJIB.map((nama) => ({
    nama,
    jumlah: 0,
    lengkap: 0,
  }));

  data.forEach((item) => {
    const berkasAktif = new Set(
      (Array.isArray(item?.berkasPpdb)
        ? item.berkasPpdb
        : []
      )
        .filter((berkas) => !berkas?.dihapusPada)
        .map((berkas) =>
          String(berkas?.namaBerkas || "").toUpperCase()
        )
    );

    let punyaSemua = true;

    rekap.forEach((jenis) => {
      if (berkasAktif.has(jenis.nama)) {
        jenis.jumlah += 1;
      } else {
        punyaSemua = false;
      }
    });

    if (punyaSemua) {
      rekap.forEach((jenis) => {
        jenis.lengkap += 1;
      });
    }
  });

  return rekap;
}
