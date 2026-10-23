import { apiFetch } from "../lib/api";



export interface GetKelasParams {
  page?: number;
  limit?: number;

  search?: string;

  tahunAjaranId?: string;

  tingkat?: number;

  sortBy?: string;

  sortOrder?: "asc" | "desc";
}

export interface CreateKelasData {
  nama: string;
  tingkat: number;
  tahunAjaranId: string;
  kapasitas?: number;
  waliKelasId?: string | null;
  lantaiId?: string | null;
  fotoKelasUrl?: string | null;
}

export interface UpdateKelasData {
  nama?: string;
  tingkat?: number;
  tahunAjaranId?: string;
  kapasitas?: number;
  waliKelasId?: string | null;
  lantaiId?: string | null;
  fotoKelasUrl?: string | null;
}



export async function getKelas(
  params: GetKelasParams = {},
) {
  const searchParams =
    new URLSearchParams();

  

  if (
    params.page !== undefined
  ) {
    searchParams.set(
      "page",
      String(params.page),
    );
  }

  if (
    params.limit !== undefined
  ) {
    searchParams.set(
      "limit",
      String(params.limit),
    );
  }

 

  if (
    params.search &&
    params.search.trim()
  ) {
    searchParams.set(
      "search",
      params.search.trim(),
    );
  }



  if (
    params.tahunAjaranId
  ) {
    searchParams.set(
      "tahunAjaranId",
      params.tahunAjaranId,
    );
  }

  

  if (
    params.tingkat !== undefined
  ) {
    searchParams.set(
      "tingkat",
      String(params.tingkat),
    );
  }



  if (params.sortBy) {
    searchParams.set(
      "sortBy",
      params.sortBy,
    );
  }

  if (params.sortOrder) {
    searchParams.set(
      "sortOrder",
      params.sortOrder,
    );
  }

 

  const queryString =
    searchParams.toString();

  const endpoint = queryString
    ? `/api/kelas?${queryString}`
    : "/api/kelas";

  console.log(
    "========== GET KELAS ==========",
  );

  console.log(
    "ENDPOINT:",
    endpoint,
  );

  const response =
    await apiFetch(endpoint, {
      method: "GET",
    });

  console.log(
    "RESPONSE KELAS:",
    response,
  );

  console.log(
    "==============================",
  );

  return response;
}



export async function getKelasById(
  id: string,
) {
  if (!id) {
    throw new Error(
      "ID kelas wajib diisi.",
    );
  }

  return apiFetch(
    `/api/kelas/${id}`,
    {
      method: "GET",
    },
  );
}



export async function createKelas(
  data: CreateKelasData,
) {
  if (!data?.nama?.trim()) {
    throw new Error(
      "Nama kelas wajib diisi.",
    );
  }

  if (
    data.tingkat !== 10 &&
    data.tingkat !== 11 &&
    data.tingkat !== 12
  ) {
    throw new Error(
      "Tingkat kelas tidak valid.",
    );
  }

  if (!data.tahunAjaranId) {
    throw new Error(
      "Tahun ajaran wajib dipilih.",
    );
  }

  const response =
    await apiFetch(
      "/api/kelas",
      {
        method: "POST",

        body: JSON.stringify({
          nama: data.nama.trim(),

          tingkat:
            data.tingkat,

          tahunAjaranId:
            data.tahunAjaranId,

          kapasitas:
            data.kapasitas ?? 30,

          waliKelasId:
            data.waliKelasId ?? null,

          lantaiId:
            data.lantaiId ?? null,

          fotoKelasUrl:
            data.fotoKelasUrl ?? null,
        }),
      },
    );

  console.log(
    "========== CREATE KELAS ==========",
  );

  console.log(
    "CREATE RESPONSE:",
    response,
  );

  console.log(
    "=================================",
  );

  return response;
}



export async function updateKelas(
  id: string,
  data: UpdateKelasData,
) {
  if (!id) {
    throw new Error(
      "ID kelas wajib diisi.",
    );
  }

  const payload: UpdateKelasData =
    {};

  if (
    data.nama !== undefined
  ) {
    payload.nama =
      data.nama.trim();
  }

  if (
    data.tingkat !== undefined
  ) {
    payload.tingkat =
      data.tingkat;
  }

  if (
    data.tahunAjaranId !==
    undefined
  ) {
    payload.tahunAjaranId =
      data.tahunAjaranId;
  }

  if (
    data.kapasitas !==
    undefined
  ) {
    payload.kapasitas =
      data.kapasitas;
  }

  if (
    data.waliKelasId !==
    undefined
  ) {
    payload.waliKelasId =
      data.waliKelasId;
  }

  if (
    data.lantaiId !==
    undefined
  ) {
    payload.lantaiId =
      data.lantaiId;
  }

  if (
    data.fotoKelasUrl !==
    undefined
  ) {
    payload.fotoKelasUrl =
      data.fotoKelasUrl;
  }

  return apiFetch(
    `/api/kelas/${id}`,
    {
      method: "PUT",

      body: JSON.stringify(
        payload,
      ),
    },
  );
}



export async function deleteKelas(
  id: string,
) {
  if (!id) {
    throw new Error(
      "ID kelas wajib diisi.",
    );
  }

  const response =
    await apiFetch(
      `/api/kelas/${id}`,
      {
        method: "DELETE",
      },
    );

  console.log(
    "========== DELETE KELAS ==========",
  );

  console.log(
    "DELETE RESPONSE:",
    response,
  );

  console.log(
    "==================================",
  );

  return response;
}


export interface WaliKelasSiswa {
  id: string;
  nama: string;
  nisn: string;
  nis: string;
  jenisKelamin: string;
  avatar: string;
}

export interface WaliKelasRecord {
  id: string;
  kelas: string;
  tingkat: string;
  jenjang: string;
  waliKelasId: string | null;
  waliKelas: string;
  nip: string;
  email: string;
  telp: string;
  jumlahSiswa: number;
  kapasitas: number;
  tahunAjaranId: string;
  tahunAjaran: string;
  semester: string;
  siswa: WaliKelasSiswa[];
  status: "ditugaskan" | "belum_ditugaskan";
}

function extractList(response: any): any[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

function extractDetail(response: any): any {
  if (!response) return null;
  if (response.data !== undefined) {
    return response.data?.data ?? response.data;
  }
  return response;
}

function formatJenjang(tingkat: unknown): string {
  const value = String(tingkat ?? "").trim();
  if (!value) return "";

  const romawi: Record<string, string> = {
    "1": "I",
    "2": "II",
    "3": "III",
    "4": "IV",
    "5": "V",
    "6": "VI",
    "7": "VII",
    "8": "VIII",
    "9": "IX",
    "10": "X",
    "11": "XI",
    "12": "XII",
  };

  return romawi[value] ?? value;
}

function normalizeSiswa(anggota: any[]): WaliKelasSiswa[] {
  return anggota
    .map((entry) => {
      const siswa = entry?.siswa ?? entry;

      return {
        id: String(siswa?.id ?? entry?.penggunaId ?? ""),
        nama: String(
          siswa?.namaLengkap ??
            siswa?.nama ??
            entry?.namaLengkap ??
            ""
        ),
        nisn: String(siswa?.nisn ?? ""),
        nis: String(siswa?.nis ?? ""),
        jenisKelamin: String(siswa?.jenisKelamin ?? ""),
        avatar: String(siswa?.avatar ?? ""),
      };
    })
    .filter((siswa) => siswa.nama);
}

function normalizeKelas(item: any): WaliKelasRecord {
  const wali = item?.waliKelas ?? item?.wali_kelas ?? null;
  const tahunAjaran =
    item?.tahunAjaran ?? item?.tahun_ajaran ?? null;
  const anggota = Array.isArray(item?.anggota)
    ? item.anggota
    : [];

  const waliKelasId =
    item?.waliKelasId ??
    item?.wali_kelas_id ??
    wali?.id ??
    null;

  const jumlahSiswa = Number(
    item?._count?.anggota ??
      item?.jumlahSiswa ??
      anggota.length ??
      0
  );

  return {
    id: String(item?.id ?? ""),
    kelas: String(item?.nama ?? item?.kelas ?? "-"),
    tingkat:
      item?.tingkat !== undefined && item?.tingkat !== null
        ? String(item.tingkat)
        : "",
    jenjang: formatJenjang(item?.tingkat) || "-",
    waliKelasId: waliKelasId ? String(waliKelasId) : null,
    waliKelas: String(
      wali?.namaLengkap ?? wali?.nama ?? ""
    ),
    nip: String(wali?.nip ?? ""),
    email: String(wali?.email ?? ""),
    telp: String(wali?.noTelepon ?? ""),
    jumlahSiswa: Number.isFinite(jumlahSiswa)
      ? jumlahSiswa
      : 0,
    kapasitas: Number(item?.kapasitas ?? 0) || 0,
    tahunAjaranId: String(
      item?.tahunAjaranId ?? tahunAjaran?.id ?? ""
    ),
    tahunAjaran: String(
      tahunAjaran?.tahunAjaran ??
        tahunAjaran?.nama ??
        "-"
    ),
    semester: String(tahunAjaran?.semester ?? ""),
    siswa: normalizeSiswa(anggota),
    status: waliKelasId
      ? "ditugaskan"
      : "belum_ditugaskan",
  };
}

export async function getWaliKelasList(): Promise<
  WaliKelasRecord[]
> {
  const rows: any[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await getKelas({
      page,
      limit: 100,
      sortBy: "nama",
      sortOrder: "asc",
    });

    rows.push(...extractList(response));

    const nextTotal = Number(
      response?.meta?.totalPages ??
        response?.pagination?.totalPages ??
        1
    );

    totalPages =
      Number.isFinite(nextTotal) && nextTotal > 0
        ? nextTotal
        : 1;

    page += 1;
  } while (page <= totalPages && page <= 50);

  return rows.map(normalizeKelas);
}

export async function getWaliKelasDetail(
  id: string
): Promise<WaliKelasRecord> {
  if (!id) {
    throw new Error("ID kelas wajib diisi.");
  }

  const response = await getKelasById(id);
  const data = extractDetail(response);

  if (!data?.id) {
    throw new Error("Data kelas tidak ditemukan.");
  }

  return normalizeKelas(data);
}

async function updateWaliKelas(
  kelasId: string,
  waliKelasId: string | null
) {
  const detailResponse = await getKelasById(kelasId);
  const current = extractDetail(detailResponse);
  const kapasitas = Number(current?.kapasitas);

  return updateKelas(kelasId, {
    waliKelasId,
    ...(Number.isFinite(kapasitas) && kapasitas > 0
      ? { kapasitas }
      : {}),
  });
}

export async function assignWaliKelas(
  kelasId: string,
  waliKelasId: string
) {
  if (!kelasId) {
    throw new Error("ID kelas wajib diisi.");
  }

  if (!waliKelasId) {
    throw new Error("Wali kelas wajib dipilih.");
  }

  return updateWaliKelas(kelasId, waliKelasId);
}

export async function releaseWaliKelas(
  kelasId: string
) {
  if (!kelasId) {
    throw new Error("ID kelas wajib diisi.");
  }

  return updateWaliKelas(kelasId, null);
}

export async function getKelasSayaDariAnggota(siswaId) {
  if (!siswaId) {
    throw new Error("ID siswa wajib diisi.");
  }

  const response = await getKelas({
    page: 1,
    limit: 100,
  });

  const rows =
    response?.data?.data ??
    response?.data ??
    response?.items ??
    [];

  if (!Array.isArray(rows)) {
    throw new Error("Format data kelas dari server tidak valid.");
  }

  for (const kelas of rows) {
    if (!kelas?.id) continue;

    try {
      const detailResponse = await getKelasById(kelas.id);

      const detail =
        detailResponse?.data?.data ??
        detailResponse?.data ??
        detailResponse;

      const anggota = Array.isArray(detail?.anggota)
        ? detail.anggota
        : [];

      const ditemukan = anggota.some((item) => {
        const idAnggota =
          item?.siswa?.id ??
          item?.siswaId ??
          item?.penggunaId;

        return String(idAnggota) === String(siswaId);
      });

      if (ditemukan) {
        return detail;
      }
    } catch (error) {
      console.warn(
        `Gagal mengambil detail kelas ${kelas.id}:`,
        error
      );
    }
  }

  return null;
}