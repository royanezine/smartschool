import { apiFetch } from "../lib/api";

/* =====================================================
   TYPES
===================================================== */

export interface Ujian {
  id: string;
  kelasMapelId: string;

  judul: string;
  deskripsi?: string | null;

  jenis: string;

  durasi: number;

  waktuMulai?: string | null;
  waktuSelesai?: string | null;

  nilaiKelulusan?: number | null;

  dipublikasikan: boolean;

  modeUjian?: string | null;

  penilaianOtomatis?: boolean;

  dibuatPada?: string;
  diperbaruiPada?: string;

  _count?: {
    soalUjian?: number;
    percobaanUjian?: number;
  };

  kelasMapel?: {
    id: string;

    kelas?: {
      id: string;
      nama: string;
      tingkat?: number;
    } | null;

    mataPelajaran?: {
      id: string;
      nama: string;
      kode?: string;
    } | null;

    guruPengajar?: {
      id?: string;
      namaLengkap?: string | null;
    } | null;
  } | null;
}

/* =====================================================
   CREATE UJIAN
===================================================== */

export interface CreateUjianPayload {
  kelasMapelId: string;

  judul: string;

  deskripsi?: string;

  jenis: string;

  durasi: number;

  waktuMulai?: string | null;

  waktuSelesai?: string | null;

  nilaiKelulusan?: number | null;

  modeUjian?: string;

  dipublikasikan?: boolean;

  penilaianOtomatis?: boolean;
}

/* =====================================================
   UPDATE UJIAN
===================================================== */

export interface UpdateUjianPayload {
  judul?: string;

  deskripsi?: string | null;

  jenis?: string;

  durasi?: number;

  waktuMulai?: string | null;

  waktuSelesai?: string | null;

  nilaiKelulusan?: number | null;

  modeUjian?: string;

  dipublikasikan?: boolean;

  penilaianOtomatis?: boolean;
}

/* =====================================================
   JENIS SOAL
===================================================== */

export type JenisSoal =
  | "pilihan_ganda"
  | "esai"
  | "benar_salah";

/* =====================================================
   SOAL UJIAN
===================================================== */

export interface SoalUjian {
  id: string;

  ujianId: string;

  teksSoal: string;

  jenisSoal: JenisSoal;

  pilihan?: unknown | null;

  jawabanBenar?: string | null;

  poin: number;

  nomorUrut: number;

  dibuatPada?: string;

  diperbaruiPada?: string;
}

/* =====================================================
   CREATE SOAL
===================================================== */

export interface CreateSoalPayload {
  teksSoal: string;

  jenisSoal: JenisSoal;

  pilihan?: unknown | null;

  jawabanBenar?: string | null;

  poin: number;

  nomorUrut: number;
}

/* =====================================================
   UPDATE SOAL
===================================================== */

export interface UpdateSoalPayload {
  teksSoal?: string;

  jenisSoal?: JenisSoal;

  pilihan?: unknown | null;

  jawabanBenar?: string | null;

  poin?: number;

  nomorUrut?: number;
}

/* =====================================================
   HASIL UJIAN
===================================================== */

export interface HasilUjian {
  id?: string;

  percobaanUjianId?: string;

  totalNilai?: number | null;

  jumlahBenar?: number | null;

  jumlahSalah?: number | null;

  jumlahLewati?: number | null;

  detail?: unknown;

  dibuatPada?: string | null;

  diperbaruiPada?: string | null;
}

/* =====================================================
   SISWA DALAM HASIL UJIAN
===================================================== */

export interface NilaiSiswa {
  percobaanUjianId?: string | null;

  siswaId?: string | null;

  siswa?: {
    id?: string | null;

    namaLengkap?: string | null;

    nis?: string | null;

    nisn?: string | null;
  } | null;

  pengguna?: {
    id?: string | null;

    namaLengkap?: string | null;

    nis?: string | null;

    nisn?: string | null;
  } | null;

  namaLengkap?: string | null;

  namaSiswa?: string | null;

  nis?: string | null;

  nisn?: string | null;

  nilai?: number | null;

  status?: string | null;

  dimulaiPada?: string | null;

  selesaiPada?: string | null;

  hasilUjian?: HasilUjian | null;
}

/* =====================================================
   DETAIL UJIAN
===================================================== */

export interface DetailUjian extends Ujian {
  soalUjian?: SoalUjian[];

  percobaanUjian?: NilaiSiswa[];

  nilaiSiswa?: NilaiSiswa[];

  hasilUjian?: HasilUjian | null;
}

/* =====================================================
   RESPONSE GENERIC
===================================================== */

export interface ApiResponse<T = unknown> {
  success?: boolean;

  message?: string;

  data?: T;

  [key: string]: unknown;
}

/* =====================================================
   GET UJIAN BERDASARKAN KELAS MAPEL
===================================================== */

export async function getUjianByKelasMapel(
  kelasMapelId: string
) {
  if (!kelasMapelId) {
    throw new Error(
      "Kelas mata pelajaran wajib dipilih."
    );
  }

  return apiFetch(
    `/api/ujian/kelas-mapel/${kelasMapelId}`,
    {
      method: "GET",
    }
  );
}

/* =====================================================
   GET DETAIL UJIAN
===================================================== */

export async function getUjianById(
  id: string
) {
  if (!id) {
    throw new Error(
      "ID ujian tidak ditemukan."
    );
  }

  return apiFetch(
    `/api/ujian/${id}`,
    {
      method: "GET",
    }
  );
}

/* =====================================================
   ALIAS GET DETAIL UJIAN
===================================================== */

export async function getDetailUjian(
  id: string
) {
  if (!id) {
    throw new Error(
      "ID ujian tidak ditemukan."
    );
  }

  return getUjianById(id);
}

/* =====================================================
   CREATE UJIAN
===================================================== */

export async function createUjian(
  payload: CreateUjianPayload
) {
  if (!payload.kelasMapelId) {
    throw new Error(
      "Kelas mata pelajaran wajib dipilih."
    );
  }

  if (!payload.judul?.trim()) {
    throw new Error(
      "Judul ujian wajib diisi."
    );
  }

  if (!payload.jenis) {
    throw new Error(
      "Jenis ujian wajib dipilih."
    );
  }

  if (
    !payload.durasi ||
    Number(payload.durasi) <= 0
  ) {
    throw new Error(
      "Durasi ujian harus lebih dari 0 menit."
    );
  }

  return apiFetch(
    "/api/ujian",
    {
      method: "POST",

      body: JSON.stringify({
        kelasMapelId:
          payload.kelasMapelId,

        judul:
          payload.judul.trim(),

        deskripsi:
          payload.deskripsi?.trim() ||
          null,

        jenis:
          payload.jenis,

        durasi:
          Number(payload.durasi),

        waktuMulai:
          payload.waktuMulai ||
          null,

        waktuSelesai:
          payload.waktuSelesai ||
          null,

        nilaiKelulusan:
          payload.nilaiKelulusan !==
            undefined &&
          payload.nilaiKelulusan !==
            null
            ? Number(
                payload.nilaiKelulusan
              )
            : null,

        modeUjian:
          payload.modeUjian ||
          "online",

        dipublikasikan:
          payload.dipublikasikan ??
          false,

        penilaianOtomatis:
          payload.penilaianOtomatis ??
          true,
      }),
    }
  );
}

/* =====================================================
   UPDATE UJIAN
===================================================== */

export async function updateUjian(
  id: string,
  payload: UpdateUjianPayload
) {
  if (!id) {
    throw new Error(
      "ID ujian tidak ditemukan."
    );
  }

  return apiFetch(
    `/api/ujian/${id}`,
    {
      method: "PUT",

      body: JSON.stringify({
        ...(payload.judul !==
          undefined && {
          judul:
            payload.judul.trim(),
        }),

        ...(payload.deskripsi !==
          undefined && {
          deskripsi:
            payload.deskripsi?.trim() ||
            null,
        }),

        ...(payload.jenis !==
          undefined && {
          jenis:
            payload.jenis,
        }),

        ...(payload.durasi !==
          undefined && {
          durasi:
            Number(payload.durasi),
        }),

        ...(payload.waktuMulai !==
          undefined && {
          waktuMulai:
            payload.waktuMulai ||
            null,
        }),

        ...(payload.waktuSelesai !==
          undefined && {
          waktuSelesai:
            payload.waktuSelesai ||
            null,
        }),

        ...(payload.nilaiKelulusan !==
          undefined && {
          nilaiKelulusan:
            payload.nilaiKelulusan ===
            null
              ? null
              : Number(
                  payload.nilaiKelulusan
                ),
        }),

        ...(payload.modeUjian !==
          undefined && {
          modeUjian:
            payload.modeUjian,
        }),

        ...(payload.dipublikasikan !==
          undefined && {
          dipublikasikan:
            payload.dipublikasikan,
        }),

        ...(payload.penilaianOtomatis !==
          undefined && {
          penilaianOtomatis:
            payload.penilaianOtomatis,
        }),
      }),
    }
  );
}

/* =====================================================
   DELETE UJIAN
===================================================== */

export async function deleteUjian(
  id: string
) {
  if (!id) {
    throw new Error(
      "ID ujian tidak ditemukan."
    );
  }

  return apiFetch(
    `/api/ujian/${id}`,
    {
      method: "DELETE",
    }
  );
}

/* =====================================================
   PUBLISH UJIAN
===================================================== */

export async function publishUjian(
  id: string
) {
  return updateUjian(id, {
    dipublikasikan: true,
  });
}

/* =====================================================
   UNPUBLISH UJIAN
===================================================== */

export async function unpublishUjian(
  id: string
) {
  return updateUjian(id, {
    dipublikasikan: false,
  });
}

/* =====================================================
   GET SOAL UJIAN
===================================================== */

export async function getSoalUjian(
  ujianId: string
) {
  if (!ujianId) {
    throw new Error(
      "ID ujian tidak ditemukan."
    );
  }

  return apiFetch(
    `/api/ujian/${ujianId}/soal`,
    {
      method: "GET",
    }
  );
}

/* =====================================================
   CREATE SOAL
===================================================== */

export async function createSoalUjian(
  ujianId: string,
  payload: CreateSoalPayload
) {
  if (!ujianId) {
    throw new Error(
      "ID ujian tidak ditemukan."
    );
  }

  if (!payload.teksSoal?.trim()) {
    throw new Error(
      "Pertanyaan soal wajib diisi."
    );
  }

  if (!payload.jenisSoal) {
    throw new Error(
      "Jenis soal wajib dipilih."
    );
  }

  if (
    !payload.poin ||
    Number(payload.poin) <= 0
  ) {
    throw new Error(
      "Poin soal harus lebih dari 0."
    );
  }

  return apiFetch(
    `/api/ujian/${ujianId}/soal`,
    {
      method: "POST",

      body: JSON.stringify({
        teksSoal:
          payload.teksSoal.trim(),

        jenisSoal:
          payload.jenisSoal,

        pilihan:
          payload.pilihan ??
          null,

        jawabanBenar:
          payload.jawabanBenar ??
          null,

        poin:
          Number(payload.poin),

        nomorUrut:
          Number(payload.nomorUrut),
      }),
    }
  );
}

/* =====================================================
   UPDATE SOAL
===================================================== */

export async function updateSoalUjian(
  ujianId: string,
  soalId: string,
  payload: UpdateSoalPayload
) {
  if (!ujianId) {
    throw new Error(
      "ID ujian tidak ditemukan."
    );
  }

  if (!soalId) {
    throw new Error(
      "ID soal tidak ditemukan."
    );
  }

  return apiFetch(
    `/api/ujian/${ujianId}/soal/${soalId}`,
    {
      method: "PUT",

      body: JSON.stringify({
        ...(payload.teksSoal !==
          undefined && {
          teksSoal:
            payload.teksSoal.trim(),
        }),

        ...(payload.jenisSoal !==
          undefined && {
          jenisSoal:
            payload.jenisSoal,
        }),

        ...(payload.pilihan !==
          undefined && {
          pilihan:
            payload.pilihan,
        }),

        ...(payload.jawabanBenar !==
          undefined && {
          jawabanBenar:
            payload.jawabanBenar,
        }),

        ...(payload.poin !==
          undefined && {
          poin:
            Number(payload.poin),
        }),

        ...(payload.nomorUrut !==
          undefined && {
          nomorUrut:
            Number(
              payload.nomorUrut
            ),
        }),
      }),
    }
  );
}

/* =====================================================
   DELETE SOAL
===================================================== */

export async function deleteSoalUjian(
  ujianId: string,
  soalId: string
) {
  if (!ujianId) {
    throw new Error(
      "ID ujian tidak ditemukan."
    );
  }

  if (!soalId) {
    throw new Error(
      "ID soal tidak ditemukan."
    );
  }

  return apiFetch(
    `/api/ujian/${ujianId}/soal/${soalId}`,
    {
      method: "DELETE",
    }
  );
}

/* =====================================================
   MULAI UJIAN SISWA
===================================================== */

export async function mulaiUjian(
  ujianId: string,
  token: string
) {
  if (!ujianId) {
    throw new Error(
      "ID ujian tidak ditemukan."
    );
  }

  if (!token?.trim()) {
    throw new Error(
      "Token ujian wajib diisi."
    );
  }

  return apiFetch(
    `/api/ujian/${ujianId}/mulai`,
    {
      method: "POST",

      body: JSON.stringify({
        token:
          token
            .trim()
            .toUpperCase(),
      }),
    }
  );
}

/* =====================================================
   SUBMIT UJIAN SISWA
===================================================== */

export interface JawabanUjianPayload {
  soalId: string;

  jawaban: string;
}

export async function submitUjian(
  sesiId: string,
  jawaban: JawabanUjianPayload[]
) {
  if (!sesiId) {
    throw new Error(
      "ID sesi ujian tidak ditemukan."
    );
  }

  if (!Array.isArray(jawaban)) {
    throw new Error(
      "Data jawaban tidak valid."
    );
  }

  return apiFetch(
    `/api/ujian/sesi/${sesiId}/submit`,
    {
      method: "POST",

      body: JSON.stringify({
        jawaban,
      }),
    }
  );
}


/* =====================================================
   GET NILAI UJIAN SISWA UNTUK ENTRY NILAI
===================================================== */

/* =========================================================
   GET NILAI UJIAN UNTUK ENTRY NILAI
========================================================= */

export async function getNilaiUjianUntukKelas(
  kelasMapelId
) {
  if (!kelasMapelId) {
    throw new Error(
      "ID kelas mata pelajaran tidak ditemukan."
    );
  }

  /* =======================================================
     HELPER AMBIL ARRAY
  ======================================================= */

  const getArray = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.results)) {
      return response.results;
    }

    if (Array.isArray(response?.items)) {
      return response.items;
    }

    if (Array.isArray(response?.data?.items)) {
      return response.data.items;
    }

    return [];
  };

  /* =======================================================
     HELPER AMBIL OBJECT
  ======================================================= */

  const getObject = (response) => {
    if (!response) {
      return null;
    }

    if (
      response?.data?.data &&
      typeof response.data.data === "object" &&
      !Array.isArray(response.data.data)
    ) {
      return response.data.data;
    }

    if (
      response?.data &&
      typeof response.data === "object" &&
      !Array.isArray(response.data)
    ) {
      return response.data;
    }

    return response;
  };

  /* =======================================================
     1. AMBIL SEMUA UJIAN BERDASARKAN KELAS MAPEL
  ======================================================= */

  const ujianResponse =
    await getUjianByKelasMapel(
      String(kelasMapelId)
    );

  console.log(
    "[ENTRY NILAI] Response daftar ujian:",
    ujianResponse
  );

  const daftarUjian =
    getArray(ujianResponse);

  console.log(
    "[ENTRY NILAI] Daftar ujian:",
    daftarUjian
  );

  if (daftarUjian.length === 0) {
    console.log(
      "[ENTRY NILAI] Tidak ada ujian untuk kelas mapel:",
      kelasMapelId
    );

    return [];
  }

  /* =======================================================
     2. AMBIL DETAIL SETIAP UJIAN
  ======================================================= */

  const detailUjianList =
    await Promise.all(
      daftarUjian.map(
        async (ujian) => {
          const ujianId =
            ujian?.id ||
            ujian?.asesmenId ||
            ujian?.ujianId;

          if (!ujianId) {
            return null;
          }

          try {
            const response =
              await getDetailUjian(
                String(ujianId)
              );

            console.log(
              `[ENTRY NILAI] Detail ujian ${ujianId}:`,
              response
            );

            const detail =
              getObject(response);

            return {
              ujian,
              detail,
            };
          } catch (error) {
            console.error(
              `[ENTRY NILAI] Gagal mengambil detail ujian ${ujianId}:`,
              error
            );

            return null;
          }
        }
      )
    );

  /* =======================================================
     3. GABUNGKAN SEMUA NILAI SISWA
  ======================================================= */

  const hasil = [];

  detailUjianList.forEach(
    (item) => {
      if (!item?.detail) {
        return;
      }

      const {
        ujian,
        detail,
      } = item;

      /* ================================================
         SUPPORT BEBERAPA BENTUK RESPONSE
      ================================================ */

      let nilaiSiswa = [];

      if (
        Array.isArray(
          detail?.nilaiSiswa
        )
      ) {
        nilaiSiswa =
          detail.nilaiSiswa;
      } else if (
        Array.isArray(
          detail?.percobaanUjian
        )
      ) {
        nilaiSiswa =
          detail.percobaanUjian;
      } else if (
        Array.isArray(
          detail?.data?.nilaiSiswa
        )
      ) {
        nilaiSiswa =
          detail.data.nilaiSiswa;
      } else if (
        Array.isArray(
          detail?.data?.percobaanUjian
        )
      ) {
        nilaiSiswa =
          detail.data.percobaanUjian;
      }

      console.log(
        `[ENTRY NILAI] Nilai siswa ujian ${
          ujian?.id
        }:`,
        nilaiSiswa
      );

      if (!nilaiSiswa.length) {
        return;
      }

      /* ================================================
         MASUKKAN SETIAP SISWA
      ================================================ */

      nilaiSiswa.forEach(
        (item) => {
          const siswa =
            item?.siswa ||
            item?.pengguna ||
            item?.student ||
            item?.user ||
            null;

          const siswaId =
            item?.siswaId ||
            siswa?.id ||
            item?.penggunaId ||
            item?.studentId ||
            item?.userId ||
            null;

          if (!siswaId) {
            console.warn(
              "[ENTRY NILAI] Data nilai tidak memiliki siswaId:",
              item
            );

            return;
          }

          const hasilUjian =
            item?.hasilUjian ||
            item?.hasilAsesmen ||
            item?.hasil ||
            null;

          const rawNilai =
            item?.nilai ??
            hasilUjian?.totalNilai ??
            item?.totalNilai ??
            null;

          const nilai =
            rawNilai !== null &&
            rawNilai !== undefined &&
            rawNilai !== ""
              ? Number(rawNilai)
              : null;

          hasil.push({
            ujianId:
              ujian?.id ||
              ujian?.asesmenId ||
              null,

            judulUjian:
              ujian?.judul ||
              ujian?.nama ||
              ujian?.namaUjian ||
              detail?.judul ||
              detail?.nama ||
              "Ujian",

            siswaId: String(
              siswaId
            ),

            namaLengkap:
              siswa?.namaLengkap ||
              siswa?.nama ||
              item?.namaLengkap ||
              item?.namaSiswa ||
              "",

            nis:
              siswa?.nis ||
              item?.nis ||
              null,

            nisn:
              siswa?.nisn ||
              item?.nisn ||
              null,

            nilai,

            status:
              item?.status ||
              null,

            selesaiPada:
              item?.selesaiPada ||
              item?.waktuSelesai ||
              item?.submittedAt ||
              item?.dikumpulkanPada ||
              null,

            dimulaiPada:
              item?.dimulaiPada ||
              item?.waktuMulai ||
              item?.mulaiPada ||
              item?.startedAt ||
              null,

            hasilUjian,
          });
        }
      );
    }
  );

  console.log(
    "[ENTRY NILAI] HASIL AKHIR NILAI UJIAN:",
    hasil
  );

  return hasil;
}