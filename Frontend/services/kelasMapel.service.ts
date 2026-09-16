import { apiFetch } from "../lib/api";

export interface KelasMapel {
  id: string;

  kelasId: string;
  mataPelajaranId: string;
  guruPengajarId: string;

  status?: string;

  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;

  kelas?: {
    id: string;
    nama: string;
    tingkat?: number;
    sekolahId?: string;
  };

  mataPelajaran?: {
    id: string;
    nama: string;
    kode?: string;
    sekolahId?: string;
  };

  guruPengajar?: {
    id: string;
    namaLengkap: string;
    email?: string;
    nip?: string;
    nuptk?: string;
  };
}

export interface CreateKelasMapelPayload {
  kelasId: string;
  mataPelajaranId: string;
  guruPengajarId: string;
}

export interface UpdateKelasMapelPayload {
  kelasId?: string;
  mataPelajaranId?: string;
  guruPengajarId?: string;
}

export async function getKelasMapel(): Promise<KelasMapel[]> {
  const result = await apiFetch("/api/kelas-mapel", {
    method: "GET",
  });

  /*
    BE mengembalikan:

    {
      success: true,
      message: "...",
      data: [...]
    }
  */

  return Array.isArray(result?.data)
    ? result.data
    : [];
}

export async function getKelasMapelById(
  id: string
): Promise<KelasMapel | null> {
  const data = await getKelasMapel();

  return (
    data.find((item) => item.id === id) || null
  );
}

export async function createKelasMapel(
  payload: CreateKelasMapelPayload
): Promise<KelasMapel> {
  const result = await apiFetch("/api/kelas-mapel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return result?.data;
}

export async function updateKelasMapel(
  id: string,
  payload: UpdateKelasMapelPayload
): Promise<KelasMapel> {
  const result = await apiFetch(
    `/api/kelas-mapel/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return result?.data;
}

export async function deleteKelasMapel(
  id: string
): Promise<void> {
  await apiFetch(
    `/api/kelas-mapel/${id}`,
    {
      method: "DELETE",
    }
  );
}