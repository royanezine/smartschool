import { apiFetch } from "../lib/api";



export type Semester =
  | "Ganjil"
  | "Genap";

export type StatusTahunAjaran =
  | "aktif"
  | "tidak_aktif";

export interface TahunAjaran {
  id: string;
  nama: string;
  semester: Semester;
  status: StatusTahunAjaran;
  sekolahId: string;
  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;
}

export interface CreateTahunAjaranData {
  nama: string;
  semester: Semester;
  status?: StatusTahunAjaran;
}



export async function getTahunAjaran(): Promise<
  TahunAjaran[]
> {
  const response = await apiFetch(
    "/api/tahun-ajaran",
    {
      method: "GET",
    }
  );

  if (Array.isArray(response)) {
    return response;
  }

  if (
    Array.isArray(response?.data)
  ) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.data?.data
    )
  ) {
    return response.data.data;
  }

  return [];
}



export async function createTahunAjaran(
  data: CreateTahunAjaranData
) {
  return apiFetch(
    "/api/tahun-ajaran",
    {
      method: "POST",
      body: JSON.stringify({
        nama: data.nama.trim(),
        semester: data.semester,
        status:
          data.status ??
          "tidak_aktif",
      }),
    }
  );
}



export async function updateTahunAjaran(
  id: string,
  data: Partial<CreateTahunAjaranData>
) {
  if (!id) {
    throw new Error(
      "ID tahun ajaran wajib diisi."
    );
  }

  return apiFetch(
    `/api/tahun-ajaran/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        ...(data.nama !== undefined && {
          nama: data.nama.trim(),
        }),

        ...(data.semester !==
          undefined && {
          semester:
            data.semester,
        }),

        ...(data.status !==
          undefined && {
          status:
            data.status,
        }),
      }),
    }
  );
}



export async function deleteTahunAjaran(
  id: string
) {
  if (!id) {
    throw new Error(
      "ID tahun ajaran wajib diisi."
    );
  }

  return apiFetch(
    `/api/tahun-ajaran/${id}`,
    {
      method: "DELETE",
    }
  );
}