const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");


const BASE_URL = API_URL.endsWith("/api")
  ? API_URL
  : `${API_URL}/api`;




export interface MateriPembelajaran {
  id: string;

  kelasMapelId: string;

  judul: string;

  deskripsi?: string | null;

  urlFile?: string | null;

  urlLink?: string | null;

  tipe?: string | null;

  kategori?: string | null;

  dibuatOleh?: string | null;

  diperbaruiOleh?: string | null;

  dihapusOleh?: string | null;

  dibuatPada?: string;

  diperbaruiPada?: string;

  dihapusPada?: string | null;

  kelasMapel?: {
    id: string;

    kelas?: {
      id: string;
      nama: string;
      tingkat?: number | null;
      kode?: string | null;
    } | null;

    mataPelajaran?: {
      id: string;
      nama: string;
      kode?: string | null;
    } | null;

    guruPengajar?: {
      id: string;
      namaLengkap: string;
      email?: string | null;
      nip?: string | null;
      nuptk?: string | null;
    } | null;
  } | null;
}


/* =========================================================
   KELAS MAPEL
========================================================= */

export interface KelasMapel {
  id: string;

  kelasId: string;

  mataPelajaranId: string;

  guruPengajarId: string;

  status?: string | null;

  kelas?: {
    id: string;
    nama: string;
    tingkat?: number | null;
    kode?: string | null;
  } | null;

  mataPelajaran?: {
    id: string;
    nama: string;
    kode?: string | null;
  } | null;

  guruPengajar?: {
    id: string;
    namaLengkap: string;
    email?: string | null;
    nip?: string | null;
    nuptk?: string | null;
  } | null;
}


/* =========================================================
   CREATE DATA
========================================================= */

export interface MateriCreateData {
  kelasMapelId: string;

  judul: string;

  deskripsi?: string;

  kategori?: string;

  urlLink?: string;
}


/* =========================================================
   UPDATE DATA
========================================================= */

export interface MateriUpdateData {
  kelasMapelId: string;

  judul: string;

  deskripsi?: string;

  kategori?: string;

  urlLink?: string;
}




export class MateriApiError extends Error {
  status: number;

  data: unknown;

  constructor(
    message: string,
    status: number,
    data: unknown = null
  ) {
    super(message);

    this.name = "MateriApiError";

    this.status = status;

    this.data = data;
  }
}




function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const tokenKeys = [
    "token",
    "accessToken",
    "access_token",
    "authToken",
    "jwt",
  ];

  for (const key of tokenKeys) {
    const value =
      localStorage.getItem(key);

    if (value && value.trim()) {
      return value
        .trim()
        .replace(
          /^Bearer\s+/i,
          ""
        );
    }
  }

  return null;
}




function buildUrl(
  endpoint: string
): string {
  const cleanEndpoint =
    endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;

  return `${BASE_URL}${cleanEndpoint}`;
}




async function parseResponse(
  response: Response,
  url: string
): Promise<any> {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  const rawText =
    await response.text();

  console.log(
    "[MATERI API] RESPONSE",
    {
      url,
      status:
        response.status,
      statusText:
        response.statusText,
      contentType,
      body: rawText,
    }
  );

  /*
    Kalau response kosong.
  */
  if (!rawText.trim()) {
    return null;
  }

  
  try {
    return JSON.parse(
      rawText
    );
  } catch (error) {
    console.error(
      "[MATERI API] SERVER TIDAK MENGEMBALIKAN JSON",
      {
        url,
        status:
          response.status,
        statusText:
          response.statusText,
        contentType,
        body: rawText,
      }
    );

    throw new MateriApiError(
      `Server mengembalikan response bukan JSON (${response.status}).`,
      response.status,
      {
        url,
        contentType,
        rawBody: rawText,
      }
    );
  }
}




function handleApiError(
  response: Response,
  result: any
): never {
  if (
    response.status === 400
  ) {
    throw new MateriApiError(
      result?.message ||
        "Data yang dikirim tidak valid.",
      400,
      result
    );
  }

  if (
    response.status === 401
  ) {
    throw new MateriApiError(
      result?.message ||
        "Sesi login sudah tidak valid. Silakan login kembali.",
      401,
      result
    );
  }

  if (
    response.status === 403
  ) {
    throw new MateriApiError(
      result?.message ||
        "Anda tidak memiliki akses ke materi pembelajaran.",
      403,
      result
    );
  }

  if (
    response.status === 404
  ) {
    throw new MateriApiError(
      result?.message ||
        "Endpoint atau data materi tidak ditemukan.",
      404,
      result
    );
  }

  if (
    response.status === 409
  ) {
    throw new MateriApiError(
      result?.message ||
        "Data materi mengalami konflik.",
      409,
      result
    );
  }

  if (
    response.status >= 500
  ) {
    throw new MateriApiError(
      result?.message ||
        "Terjadi kesalahan pada server.",
      response.status,
      result
    );
  }

  throw new MateriApiError(
    result?.message ||
      `Request gagal (${response.status}).`,
    response.status,
    result
  );
}




async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    getToken();

  if (!token) {
    throw new MateriApiError(
      "Token login tidak ditemukan. Silakan login kembali.",
      401
    );
  }

  const headers =
    new Headers(
      options.headers
    );

  /*
    Content-Type JSON hanya jika
    body bukan FormData.
  */
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has(
      "Content-Type"
    )
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  headers.set(
    "Authorization",
    `Bearer ${token}`
  );

  headers.set(
    "Accept",
    "application/json"
  );

  const url =
    buildUrl(endpoint);

  console.log(
    "[MATERI API] REQUEST",
    {
      url,
      method:
        options.method ||
        "GET",
    }
  );

  let response: Response;

  try {
    response =
      await fetch(
        url,
        {
          ...options,
          headers,
          cache: "no-store",
        }
      );
  } catch (error) {
    console.error(
      "[MATERI API] NETWORK ERROR",
      error
    );

    throw new MateriApiError(
      "Tidak dapat terhubung ke server. Pastikan backend berjalan di port 5000.",
      0,
      error
    );
  }

  const result =
    await parseResponse(
      response,
      url
    );

  if (!response.ok) {
    handleApiError(
      response,
      result
    );
  }

  return result as T;
}




async function requestFormData<T>(
  endpoint: string,
  formData: FormData,
  method: "POST" | "PUT"
): Promise<T> {
  const token =
    getToken();

  if (!token) {
    throw new MateriApiError(
      "Token login tidak ditemukan. Silakan login kembali.",
      401
    );
  }

  /*
    Jangan set Content-Type manual.

    Browser akan otomatis membuat:
    multipart/form-data;
    boundary=...
  */
  const headers =
    new Headers();

  headers.set(
    "Authorization",
    `Bearer ${token}`
  );

  headers.set(
    "Accept",
    "application/json"
  );

  const url =
    buildUrl(endpoint);

  console.log(
    "[MATERI API] FORMDATA REQUEST",
    {
      url,
      method,
      fields:
        Array.from(
          formData.keys()
        ),
    }
  );

  let response: Response;

  try {
    response =
      await fetch(
        url,
        {
          method,
          headers,
          body: formData,
          cache: "no-store",
        }
      );
  } catch (error) {
    console.error(
      "[MATERI API] FORMDATA NETWORK ERROR",
      error
    );

    throw new MateriApiError(
      "Tidak dapat terhubung ke server. Pastikan backend berjalan.",
      0,
      error
    );
  }

  const result =
    await parseResponse(
      response,
      url
    );

  if (!response.ok) {
    handleApiError(
      response,
      result
    );
  }

  return result as T;
}




export async function getMateriPembelajaran() {
  return request<{
    success: boolean;

    message?: string;

    data: MateriPembelajaran[];
  }>(
    "/v1/materi-pembelajaran"
  );
}




export async function getMateriPembelajaranById(
  id: string
) {
  if (!id) {
    throw new MateriApiError(
      "ID materi tidak ditemukan.",
      400
    );
  }

  return request<{
    success: boolean;

    message?: string;

    data: MateriPembelajaran;
  }>(
    `/v1/materi-pembelajaran/${encodeURIComponent(
      id
    )}`
  );
}




export async function getKelasMapel() {
  return request<{
    success: boolean;

    message?: string;

    data: KelasMapel[];
  }>(
    "/kelas-mapel"
  );
}




export async function createMateriDenganLink(
  data: MateriCreateData
) {
  if (!data.kelasMapelId) {
    throw new MateriApiError(
      "Kelas dan mata pelajaran belum dipilih.",
      400
    );
  }

  if (!data.judul?.trim()) {
    throw new MateriApiError(
      "Judul materi wajib diisi.",
      400
    );
  }

  if (!data.urlLink?.trim()) {
    throw new MateriApiError(
      "Link materi wajib diisi.",
      400
    );
  }

  return request<{
    success: boolean;

    message?: string;

    data: MateriPembelajaran;
  }>(
    "/v1/materi-pembelajaran",
    {
      method: "POST",

      body: JSON.stringify({
        kelasMapelId:
          data.kelasMapelId,

        judul:
          data.judul.trim(),

        deskripsi:
          data.deskripsi?.trim() ||
          undefined,

        kategori:
          data.kategori?.trim() ||
          undefined,

        urlLink:
          data.urlLink.trim(),
      }),
    }
  );
}




export async function createMateriDenganFile(
  data: {
    kelasMapelId: string;

    judul: string;

    deskripsi?: string;

    kategori?: string;

    file: File;
  }
) {
  if (!data.kelasMapelId) {
    throw new MateriApiError(
      "Kelas dan mata pelajaran belum dipilih.",
      400
    );
  }

  if (!data.judul?.trim()) {
    throw new MateriApiError(
      "Judul materi wajib diisi.",
      400
    );
  }

  if (!data.file) {
    throw new MateriApiError(
      "File materi belum dipilih.",
      400
    );
  }

  /*
    Backend menerima maksimal 100 MB.
  */
  const maxSize =
    100 * 1024 * 1024;

  if (
    data.file.size >
    maxSize
  ) {
    throw new MateriApiError(
      "Ukuran file maksimal 100 MB.",
      400
    );
  }

  /*
    Sama dengan fileFilter
    di backend.
  */
  const allowedMimeTypes = [
    "application/pdf",

    "video/mp4",

    "video/mpeg",

    "video/webm",

    "video/quicktime",
  ];

  const allowedExtensions = [
    ".pdf",

    ".mp4",

    ".mpeg",

    ".webm",

    ".mov",
  ];

  const extension =
    data.file.name
      .slice(
        data.file.name.lastIndexOf(
          "."
        )
      )
      .toLowerCase();

  const validFile =
    allowedMimeTypes.includes(
      data.file.type
    ) ||
    allowedExtensions.includes(
      extension
    );

  if (!validFile) {
    throw new MateriApiError(
      "File hanya boleh PDF atau Video.",
      400
    );
  }

  const formData =
    new FormData();

  formData.append(
    "kelasMapelId",
    data.kelasMapelId
  );

  formData.append(
    "judul",
    data.judul.trim()
  );

  if (
    data.deskripsi?.trim()
  ) {
    formData.append(
      "deskripsi",
      data.deskripsi.trim()
    );
  }

  if (
    data.kategori?.trim()
  ) {
    formData.append(
      "kategori",
      data.kategori.trim()
    );
  }

  formData.append(
    "file",
    data.file
  );

  return requestFormData<{
    success: boolean;

    message?: string;

    data: MateriPembelajaran;
  }>(
    "/v1/materi-pembelajaran",
    formData,
    "POST"
  );
}




export async function updateMateriDenganLink(
  id: string,
  data: MateriUpdateData
) {
  if (!id) {
    throw new MateriApiError(
      "ID materi tidak ditemukan.",
      400
    );
  }

  if (!data.kelasMapelId) {
    throw new MateriApiError(
      "Kelas dan mata pelajaran belum dipilih.",
      400
    );
  }

  if (!data.judul?.trim()) {
    throw new MateriApiError(
      "Judul materi wajib diisi.",
      400
    );
  }

  if (!data.urlLink?.trim()) {
    throw new MateriApiError(
      "Link materi wajib diisi.",
      400
    );
  }

  return request<{
    success: boolean;

    message?: string;

    data: MateriPembelajaran;
  }>(
    `/v1/materi-pembelajaran/${encodeURIComponent(
      id
    )}`,
    {
      method: "PUT",

      body: JSON.stringify({
        kelasMapelId:
          data.kelasMapelId,

        judul:
          data.judul.trim(),

        deskripsi:
          data.deskripsi?.trim() ||
          undefined,

        kategori:
          data.kategori?.trim() ||
          undefined,

        urlLink:
          data.urlLink.trim(),
      }),
    }
  );
}




export async function updateMateriDenganFile(
  id: string,
  data: {
    kelasMapelId: string;

    judul: string;

    deskripsi?: string;

    kategori?: string;

    file: File;
  }
) {
  if (!id) {
    throw new MateriApiError(
      "ID materi tidak ditemukan.",
      400
    );
  }

  if (!data.kelasMapelId) {
    throw new MateriApiError(
      "Kelas dan mata pelajaran belum dipilih.",
      400
    );
  }

  if (!data.judul?.trim()) {
    throw new MateriApiError(
      "Judul materi wajib diisi.",
      400
    );
  }

  if (!data.file) {
    throw new MateriApiError(
      "File materi belum dipilih.",
      400
    );
  }

  const maxSize =
    100 * 1024 * 1024;

  if (
    data.file.size >
    maxSize
  ) {
    throw new MateriApiError(
      "Ukuran file maksimal 100 MB.",
      400
    );
  }

  const allowedMimeTypes = [
    "application/pdf",

    "video/mp4",

    "video/mpeg",

    "video/webm",

    "video/quicktime",
  ];

  const allowedExtensions = [
    ".pdf",

    ".mp4",

    ".mpeg",

    ".webm",

    ".mov",
  ];

  const extension =
    data.file.name
      .slice(
        data.file.name.lastIndexOf(
          "."
        )
      )
      .toLowerCase();

  const validFile =
    allowedMimeTypes.includes(
      data.file.type
    ) ||
    allowedExtensions.includes(
      extension
    );

  if (!validFile) {
    throw new MateriApiError(
      "File hanya boleh PDF atau Video.",
      400
    );
  }

  const formData =
    new FormData();

  formData.append(
    "kelasMapelId",
    data.kelasMapelId
  );

  formData.append(
    "judul",
    data.judul.trim()
  );

  if (
    data.deskripsi?.trim()
  ) {
    formData.append(
      "deskripsi",
      data.deskripsi.trim()
    );
  }

  if (
    data.kategori?.trim()
  ) {
    formData.append(
      "kategori",
      data.kategori.trim()
    );
  }

  formData.append(
    "file",
    data.file
  );

  return requestFormData<{
    success: boolean;

    message?: string;

    data: MateriPembelajaran;
  }>(
    `/v1/materi-pembelajaran/${encodeURIComponent(
      id
    )}`,
    formData,
    "PUT"
  );
}



export async function updateMateriTanpaSumber(
  id: string,
  data: {
    kelasMapelId: string;

    judul: string;

    deskripsi?: string;

    kategori?: string;
  }
) {
  if (!id) {
    throw new MateriApiError(
      "ID materi tidak ditemukan.",
      400
    );
  }

  if (!data.kelasMapelId) {
    throw new MateriApiError(
      "Kelas dan mata pelajaran wajib dipilih.",
      400
    );
  }

  if (!data.judul?.trim()) {
    throw new MateriApiError(
      "Judul materi wajib diisi.",
      400
    );
  }

  return request<{
    success: boolean;

    message?: string;

    data: MateriPembelajaran;
  }>(
    `/v1/materi-pembelajaran/${encodeURIComponent(
      id
    )}`,
    {
      method: "PUT",

      body: JSON.stringify({
        kelasMapelId:
          data.kelasMapelId,

        judul:
          data.judul.trim(),

        deskripsi:
          data.deskripsi?.trim() ||
          undefined,

        kategori:
          data.kategori?.trim() ||
          undefined,
      }),
    }
  );
}


/* =========================================================
   DELETE MATERI
========================================================= */

export async function deleteMateriPembelajaran(
  id: string
) {
  if (!id) {
    throw new MateriApiError(
      "ID materi tidak ditemukan.",
      400
    );
  }

  return request<{
    success: boolean;

    message?: string;
  }>(
    `/v1/materi-pembelajaran/${encodeURIComponent(
      id
    )}`,
    {
      method: "DELETE",
    }
  );
}




export async function refreshMateriPembelajaran() {
  return getMateriPembelajaran();
}




const materiPembelajaranService = {
  getMateriPembelajaran,

  getMateriPembelajaranById,

  getKelasMapel,

  createMateriDenganLink,

  createMateriDenganFile,

  updateMateriDenganLink,

  updateMateriDenganFile,

  updateMateriTanpaSumber,

  deleteMateriPembelajaran,

  refreshMateriPembelajaran,
};

export default materiPembelajaranService;