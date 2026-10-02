import { apiFetch } from "../lib/api";

export interface PermohonanIzin {
  id: string;
  sekolahId?: string;
  penggunaId?: string;
  jenis: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
  urlBukti?: string | null;
  status: "menunggu" | "disetujui" | "ditolak";
  catatan?: string | null;
  penyetujuId?: string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;

  guruPenggantiId?: string | null;

  pengguna?: {
    id?: string;
    namaLengkap?: string;
    nisn?: string | null;
    nip?: string | null;
    jabatan?: string | null;
  };

  penyetuju?: {
    id?: string;
    namaLengkap?: string;
  };

  guruPengganti?: {
    id?: string;
    namaLengkap?: string;
    nip?: string | null;
    jabatan?: string | null;
  } | null;
}

export interface AjukanIzinData {
  jenis: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  alasan: string;
  bukti?: File | null;
}

export interface VerifikasiIzinData {
  status: "disetujui" | "ditolak";
  catatan?: string;
}

export interface VerifikasiPengajuanData {
  status: "disetujui" | "ditolak";
  catatan?: string;
  guruPenggantiId?: string | null;
}

export async function ajukanIzin(
  data: AjukanIzinData
): Promise<PermohonanIzin> {
  const formData = new FormData();

  formData.append("jenis", data.jenis);
  formData.append("tanggalMulai", data.tanggalMulai);
  formData.append("tanggalSelesai", data.tanggalSelesai);
  formData.append("alasan", data.alasan);

  if (data.bukti) {
    formData.append("bukti", data.bukti);
  }

  const response = await apiFetch(
    "/api/v1/permohonan-izin",
    {
      method: "POST",
      body: formData,
    }
  );

  return response?.data || response;
}

export async function getDaftarIzin(): Promise<any> {
  const response = await apiFetch(
    "/api/v1/permohonan-izin",
    {
      method: "GET",
    }
  );

  return response;
}

export async function verifikasiIzin(
  id: string,
  data: VerifikasiIzinData
): Promise<PermohonanIzin> {
  if (!id) {
    throw new Error(
      "ID permohonan izin tidak valid."
    );
  }

  const response = await apiFetch(
    `/api/v1/permohonan-izin/${id}/verifikasi`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: data.status,
        catatan: data.catatan || "",
      }),
    }
  );

  return response?.data || response;
}

export async function verifikasiPengajuan(
  id: string,
  data: VerifikasiPengajuanData
): Promise<PermohonanIzin> {
  if (!id) {
    throw new Error(
      "ID permohonan izin tidak valid."
    );
  }

  if (
    data.status === "disetujui" &&
    !data.guruPenggantiId
  ) {
    throw new Error(
      "Guru pengganti wajib dipilih."
    );
  }

  const response = await apiFetch(
    `/api/v1/permohonan-izin/${id}/verifikasi-pengajuan`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: data.status,
        catatan: data.catatan || "",
        guruPenggantiId:
          data.guruPenggantiId || null,
      }),
    }
  );

  return response?.data || response;
}

const izinService = {
  ajukanIzin,
  getDaftarIzin,
  verifikasiIzin,
  verifikasiPengajuan,
};

export default izinService;