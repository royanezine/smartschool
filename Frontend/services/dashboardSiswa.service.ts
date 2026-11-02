
import { apiFetch } from "@/lib/api";

export interface DashboardProfilSiswa {
  id: string;
  namaLengkap: string;
  email: string;
  avatar: string | null;
  nis: string | null;
  nisn: string | null;
}

export interface DashboardTahunAjaran {
  tahunAjaran: string;
  semester: string;
  status: string;
}

export interface DashboardKelas {
  id: string;
  nama: string;
  tingkat: string | number;
  shift: string | null;
  waliKelas: string | null;
  tahunAjaran: DashboardTahunAjaran | null;
}

export interface DashboardKehadiran {
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
  total: number;
  persentase: number;
}

export interface DashboardJadwal {
  id: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  ruangan: string | null;
  mataPelajaran: string;
  guru: string;
}

export interface DashboardTugas {
  id: string;
  judul: string;
  batasWaktu: string;
  mataPelajaran: string;
}

export interface DashboardNilai {
  id: string;
  nilai: number;
  komponen: string;
  jenis: string;
  mataPelajaran: string;
  tanggal: string;
}

export interface DashboardTagihanTerdekat {
  nomorTagihan: string;
  kategori: string;
  jatuhTempo: string | null;
  sisa: number;
}

export interface DashboardTagihan {
  jumlahBelumLunas: number;
  totalSisa: number;
  terdekat: DashboardTagihanTerdekat | null;
}

export interface DashboardTabungan {
  saldo: number;
}

export interface DashboardPelanggaran {
  jumlah: number;
  totalPoin: number;
}

export interface DashboardSiswa {
  profil: DashboardProfilSiswa;
  kelas: DashboardKelas | null;
  kehadiranBulanIni: DashboardKehadiran;
  jadwalHariIni: DashboardJadwal[];
  tugasMendatang: DashboardTugas[];
  nilaiTerbaru: DashboardNilai[];
  rataRataNilai: number;
  tagihan: DashboardTagihan;
  tabungan: DashboardTabungan;
  pelanggaran: DashboardPelanggaran;
  notifikasiBelumDibaca: number;
}

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

export async function getDashboardSiswa(): Promise<DashboardSiswa> {
  // Backend: app.use("/api/dashboard/siswa", dashboardSiswaRoutes)
  // Route: router.get("/", authenticate, authorizeRoles("siswa"), ...)
  const response: unknown = await apiFetch("/dashboard/siswa");

  let result: unknown = response;

  for (let i = 0; i < 4; i++) {
    if (!result || typeof result !== "object") {
      break;
    }

    const current = result as Record<string, unknown>;

    if (current.success === false) {
      throw new Error(
        typeof current.message === "string"
          ? current.message
          : "Gagal mengambil dashboard siswa."
      );
    }

    if ("profil" in current) {
      const dashboard = current as unknown as DashboardSiswa;

      if (
        !dashboard.profil ||
        typeof dashboard.profil.id !== "string"
      ) {
        throw new Error(
          "Data profil siswa tidak sesuai dengan response Backend."
        );
      }

      return dashboard;
    }

    if (
      "data" in current &&
      current.data !== undefined &&
      current.data !== null
    ) {
      result = current.data;
      continue;
    }

    break;
  }

  throw new Error(
    "Format response dashboard siswa tidak sesuai kontrak Backend."
  );
}
