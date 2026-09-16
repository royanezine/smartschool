import { apiFetch } from "../lib/api";

/**
 * Ambil kelas-mapel yang diampu guru login
 */
export async function getKelasMapelGuru() {
  return apiFetch("/api/kelas-mapel");
}

/**
 * Buat tugas baru
 *
 * Backend:
 * POST /api/v1/tugas
 *
 * Body:
 * {
 *   kelasMapelId: string,
 *   judul: string,
 *   deskripsi?: string | null,
 *   batasWaktu: string
 * }
 */
export async function createTugas(data) {
  if (!data?.kelasMapelId) {
    throw new Error("kelasMapelId wajib diisi");
  }

  if (!data?.judul?.trim()) {
    throw new Error("Judul tugas wajib diisi");
  }

  if (!data?.batasWaktu) {
    throw new Error("Batas waktu tugas wajib diisi");
  }

  return apiFetch("/api/v1/tugas", {
    method: "POST",
    body: JSON.stringify({
      kelasMapelId: data.kelasMapelId,
      judul: data.judul.trim(),
      deskripsi:
        data.deskripsi?.trim() || null,
      batasWaktu: data.batasWaktu,
    }),
  });
}

/**
 * Ambil tugas berdasarkan kelas-mapel
 */
export async function getTugasByKelasMapel(
  kelasMapelId
) {
  if (!kelasMapelId) {
    throw new Error("kelasMapelId wajib diisi");
  }

  return apiFetch(
    `/api/v1/tugas/kelas-mapel/${kelasMapelId}`
  );
}

/**
 * Ambil detail tugas
 *
 * Backend:
 * GET /api/v1/tugas/:id
 */
export async function getDetailTugas(tugasId) {
  if (!tugasId) {
    throw new Error("ID tugas wajib diisi");
  }

  return apiFetch(
    `/api/v1/tugas/${tugasId}`
  );
}

/**
 * Update tugas
 *
 * Backend:
 * PUT /api/v1/tugas/:id
 */
export async function updateTugas(
  tugasId,
  data
) {
  if (!tugasId) {
    throw new Error("ID tugas wajib diisi");
  }

  return apiFetch(
    `/api/v1/tugas/${tugasId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        ...(data.judul !== undefined && {
          judul: data.judul,
        }),

        ...(data.deskripsi !== undefined && {
          deskripsi: data.deskripsi,
        }),

        ...(data.batasWaktu !== undefined && {
          batasWaktu: data.batasWaktu,
        }),
      }),
    }
  );
}

/**
 * Hapus tugas
 *
 * Backend:
 * DELETE /api/v1/tugas/:id
 */
export async function deleteTugas(tugasId) {
  if (!tugasId) {
    throw new Error("ID tugas wajib diisi");
  }

  return apiFetch(
    `/api/v1/tugas/${tugasId}`,
    {
      method: "DELETE",
    }
  );
}

/**
 * Submit tugas siswa
 *
 * Backend:
 * POST /api/v1/tugas/:id/submit
 *
 * Body:
 * {
 *   urlFile: string,
 *   keterangan?: string | null
 * }
 */
export async function submitTugas(
  tugasId,
  data
) {
  if (!tugasId) {
    throw new Error("ID tugas wajib diisi");
  }

  if (!data?.urlFile) {
    throw new Error("URL file wajib diisi");
  }

  return apiFetch(
    `/api/v1/tugas/${tugasId}/submit`,
    {
      method: "POST",
      body: JSON.stringify({
        urlFile: data.urlFile,
        keterangan:
          data.keterangan ?? null,
      }),
    }
  );
}

/**
 * Ambil pengumpulan siswa dari sebuah tugas
 *
 * Guru:
 * GET /api/v1/tugas/:id/pengumpulan
 */
export async function getPengumpulanByTugas(
  tugasId
) {
  if (!tugasId) {
    throw new Error("ID tugas wajib diisi");
  }

  return apiFetch(
    `/api/v1/tugas/${tugasId}/pengumpulan`
  );
}

/**
 * Simpan nilai tugas siswa
 *
 * Guru:
 * PATCH /api/v1/tugas/pengumpulan/:pengumpulanId/nilai
 */
export async function beriNilaiTugas(
  pengumpulanId,
  data
) {
  if (!pengumpulanId) {
    throw new Error(
      "ID pengumpulan wajib diisi"
    );
  }

  return apiFetch(
    `/api/v1/tugas/pengumpulan/${pengumpulanId}/nilai`,
    {
      method: "PATCH",
      body: JSON.stringify({
        nilai: Number(data.nilai),
        keterangan:
          data.keterangan ?? null,
      }),
    }
  );
}

/**
 * Ambil semua tugas guru.
 *
 * Alur:
 * kelas-mapel guru
 * -> tugas setiap kelas-mapel
 */
export async function getTugasGuru() {
  const responseKelasMapel =
    await getKelasMapelGuru();

  const kelasMapelData =
    responseKelasMapel?.data?.data ??
    responseKelasMapel?.data ??
    responseKelasMapel ??
    [];

  if (!Array.isArray(kelasMapelData)) {
    return [];
  }

  const hasil = await Promise.all(
    kelasMapelData.map(
      async (kelasMapel) => {
        try {
          const responseTugas =
            await getTugasByKelasMapel(
              kelasMapel.id
            );

          const tugasData =
            responseTugas?.data?.data ??
            responseTugas?.data ??
            responseTugas ??
            [];

          if (!Array.isArray(tugasData)) {
            return [];
          }

          return tugasData.map(
            (tugas) => ({
              ...tugas,

              kelasMapelId:
                kelasMapel.id,

              kelas:
                kelasMapel.kelas ??
                null,

              mataPelajaran:
                kelasMapel.mataPelajaran ??
                null,

              guruPengajar:
                kelasMapel.guruPengajar ??
                null,

              kelasNama:
                kelasMapel?.kelas
                  ?.nama ??
                kelasMapel?.kelas
                  ?.namaKelas ??
                "-",

              mapelNama:
                kelasMapel
                  ?.mataPelajaran
                  ?.nama ??
                kelasMapel
                  ?.mataPelajaran
                  ?.namaMapel ??
                kelasMapel
                  ?.mataPelajaran
                  ?.nama_mata_pelajaran ??
                "-",

              guruNama:
                kelasMapel
                  ?.guruPengajar
                  ?.namaLengkap ??
                "-",

              jumlahPengumpulan:
                tugas?._count
                  ?.pengumpulanTugasSiswa ??
                tugas?.jumlahPengumpulan ??
                0,
            })
          );
        } catch (error) {
          console.error(
            `Gagal mengambil tugas kelas-mapel ${kelasMapel.id}:`,
            error
          );

          return [];
        }
      }
    )
  );

  return hasil.flat();
}