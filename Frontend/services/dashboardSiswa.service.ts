
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

type UnknownRecord = Record<string, unknown>;



const isRecord = (value: unknown): value is UnknownRecord => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
};

const unwrapDashboardResponse = (
  response: unknown,
): DashboardSiswa => {
  let result: unknown = response;


  for (let i = 0; i < 6; i++) {
    if (!isRecord(result)) {
      break;
    }

    if (result.success === false) {
      throw new Error(
        typeof result.message === "string"
          ? result.message
          : "Gagal mengambil dashboard siswa.",
      );
    }

   
    if ("profil" in result) {
      const dashboard = result as unknown as DashboardSiswa;

      if (
        !isRecord(dashboard.profil) ||
        typeof dashboard.profil.id !== "string" ||
        typeof dashboard.profil.namaLengkap !== "string"
      ) {
        throw new Error(
          "Data profil siswa tidak sesuai dengan response Backend.",
        );
      }

      return dashboard;
    }

    
    if (
      "data" in result &&
      result.data !== undefined &&
      result.data !== null
    ) {
      result = result.data;
      continue;
    }

    break;
  }

  throw new Error(
    "Format response dashboard siswa tidak sesuai kontrak Backend.",
  );
};



export async function getDashboardSiswa(): Promise<DashboardSiswa> {
  try {
   

    const response: unknown = await apiFetch("/dashboard/siswa");

    return unwrapDashboardResponse(response);
  } catch (error) {
    console.error("Gagal mengambil dashboard siswa:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Terjadi kesalahan saat mengambil dashboard siswa.");
  }
}
