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