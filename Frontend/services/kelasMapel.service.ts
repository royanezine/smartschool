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


  return Array.isArray(result?.data)
    ? result.data
    : [];
}

export async function getKelasMapelById(
  id: string
): Promise<KelasMapel | null> {
  try {
    const result = await apiFetch(`/api/kelas-mapel/detail/${id}`, {
      method: "GET",
    });
    if (result?.data) return result.data;
  } catch {
  }

  const data = await getKelasMapel();
  return data.find((item) => item.id === id) || null;
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

export async function getKelasMapelDiampu(params: {
  tahunAjaranId?: string;
  guruId?: string;
} = {}): Promise<KelasMapel[]> {
  const query = new URLSearchParams();
  if (params.tahunAjaranId) query.set("tahunAjaranId", params.tahunAjaranId);
  if (params.guruId) query.set("guruId", params.guruId);

  const qs = query.toString();
  const endpoint = qs ? `/api/kelas-mapel/diampu?${qs}` : "/api/kelas-mapel/diampu";

  const result = await apiFetch(endpoint, {
    method: "GET",
  });

  return Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
}

export async function getKelasMapelSiswa(params: {
  tahunAjaranId?: string;
  siswaId?: string;
} = {}): Promise<KelasMapel[]> {
  const query = new URLSearchParams();
  if (params.tahunAjaranId) query.set("tahunAjaranId", params.tahunAjaranId);
  if (params.siswaId) query.set("siswaId", params.siswaId);

  const qs = query.toString();
  const endpoint = qs ? `/api/kelas-mapel/siswa?${qs}` : "/api/kelas-mapel/siswa";

  const result = await apiFetch(endpoint, {
    method: "GET",
  });

  return Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [];
}