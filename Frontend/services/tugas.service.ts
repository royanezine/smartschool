import { apiFetch } from "../lib/api";

export async function getKelasMapelGuru() {
  try {
    const res = await apiFetch("/api/kelas-mapel/diampu");
    const data = res?.data ?? res;
    if (Array.isArray(data) && data.length > 0) {
      return res;
    }
    if (res) return res;
  } catch {
  }
  return apiFetch("/api/kelas-mapel");
}


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

  return apiFetch("/api/tugas", {
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

export async function getTugasByKelasMapel(
  kelasMapelId
) {
  if (!kelasMapelId) {
    throw new Error("kelasMapelId wajib diisi");
  }

  return apiFetch(
    `/api/tugas/kelas-mapel/${kelasMapelId}`
  );
}


export async function getDetailTugas(tugasId) {
  if (!tugasId) {
    throw new Error("ID tugas wajib diisi");
  }

  return apiFetch(
    `/api/tugas/${tugasId}`
  );
}


export async function updateTugas(
  tugasId,
  data
) {
  if (!tugasId) {
    throw new Error("ID tugas wajib diisi");
  }

  return apiFetch(
    `/api/tugas/${tugasId}`,
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


export async function deleteTugas(tugasId) {
  if (!tugasId) {
    throw new Error("ID tugas wajib diisi");
  }

  return apiFetch(
    `/api/tugas/${tugasId}`,
    {
      method: "DELETE",
    }
  );
}


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
    `/api/tugas/${tugasId}/submit`,
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



export async function getPengumpulanByTugas(tugasId) {
  if (!tugasId) {
    throw new Error("ID tugas wajib diisi");
  }

  const response = await apiFetch(
    `/api/tugas/${tugasId}/pengumpulan`
  );

  const data =
    response?.data?.data ??
    response?.data ??
    response;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.pengumpulan)) {
    return data.pengumpulan;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export async function beriNilaiTugas(pengumpulanId, data) {
  if (!pengumpulanId) {
    throw new Error("ID pengumpulan wajib diisi");
  }

  const nilai = Number(data?.nilai);

  if (!Number.isFinite(nilai) || nilai < 0 || nilai > 100) {
    throw new Error("Nilai harus berupa angka 0–100");
  }

  return apiFetch(
    `/api/tugas/pengumpulan/${pengumpulanId}/nilai`,
    {
      method: "PATCH",
      body: JSON.stringify({
        nilai,
        keterangan: data?.keterangan?.trim() || null,
      }),
    }
  );
}

export async function getTugasGuru() {
  const responseKelasMapel = await getKelasMapelGuru();

  const kelasMapelData =
    responseKelasMapel?.data?.data ??
    responseKelasMapel?.data ??
    responseKelasMapel;

  if (!Array.isArray(kelasMapelData)) {
    return [];
  }

  const hasil = await Promise.all(
    kelasMapelData.map(async (kelasMapel) => {
      try {
        const responseTugas = await getTugasByKelasMapel(
          kelasMapel.id
        );

        const tugasData =
          responseTugas?.data?.data ??
          responseTugas?.data ??
          responseTugas;

        if (!Array.isArray(tugasData)) {
          return [];
        }

        return tugasData.map((tugas) => ({
          ...tugas,
          kelasMapelId: kelasMapel.id,

          kelas: kelasMapel.kelas ?? tugas.kelasMapel?.kelas ?? null,

          mataPelajaran:
            kelasMapel.mataPelajaran ??
            tugas.kelasMapel?.mataPelajaran ??
            null,

          guruPengajar:
            kelasMapel.guruPengajar ??
            tugas.kelasMapel?.guruPengajar ??
            null,

          kelasNama:
            kelasMapel.kelas?.nama ??
            kelasMapel.kelas?.namaKelas ??
            tugas.kelasMapel?.kelas?.nama ??
            "-",

          mapelNama:
            kelasMapel.mataPelajaran?.nama ??
            kelasMapel.mataPelajaran?.namaMapel ??
            tugas.kelasMapel?.mataPelajaran?.nama ??
            "-",

          guruNama:
            kelasMapel.guruPengajar?.namaLengkap ??
            tugas.kelasMapel?.guruPengajar?.namaLengkap ??
            "-",

          jumlahPengumpulan:
            tugas._count?.pengumpulanTugasSiswa ??
            tugas.jumlahPengumpulan ??
            0,
        }));
      } catch (error) {
        console.error(
          `Gagal mengambil tugas kelas-mapel ${kelasMapel.id}:`,
          error
        );

        return [];
      }
    })
  );

  return hasil.flat();
}

export async function getTugasSiswa(kelasMapelId?: string) {
  let kelasMapelIds: string[] = [];

  if (kelasMapelId) {
    kelasMapelIds = [kelasMapelId];
  } else {
    try {
      const res = await apiFetch("/api/kelas-mapel/siswa");
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      kelasMapelIds = list.map((item: any) => item.id).filter(Boolean);
    } catch {
      kelasMapelIds = [];
    }
  }

  if (kelasMapelIds.length === 0) return [];

  const taskResponses = await Promise.all(
    kelasMapelIds.map(async (kmId) => {
      try {
        const res = await apiFetch(`/api/tugas/kelas-mapel/${kmId}`);
        const data = res?.data ?? res;
        return Array.isArray(data) ? data : [];
      } catch {
        return [];
      }
    })
  );

  return taskResponses.flat();
}

export async function getKelasMapelAdmin() {
  return apiFetch("/api/kelas-mapel");
}

export async function getAllTugasAdmin() {
  const kmRes = await apiFetch("/api/kelas-mapel");
  const kmList = Array.isArray(kmRes?.data)
    ? kmRes.data
    : Array.isArray(kmRes)
    ? kmRes
    : [];

  if (kmList.length === 0) return [];

  const taskResponses = await Promise.all(
    kmList.map(async (km: any) => {
      try {
        const res = await apiFetch(`/api/tugas/kelas-mapel/${km.id}`);
        const data = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];

        return data.map((tugas: any) => ({
          ...tugas,
          kelasMapelId: km.id,
          kelasMapel: km,
          kelas: km.kelas ?? tugas.kelasMapel?.kelas ?? null,
          mataPelajaran:
            km.mataPelajaran ?? tugas.kelasMapel?.mataPelajaran ?? null,
          guruPengajar:
            km.guruPengajar ?? tugas.kelasMapel?.guruPengajar ?? null,
          kelasNama:
            km.kelas?.nama ??
            km.kelas?.namaKelas ??
            tugas.kelasMapel?.kelas?.nama ??
            "-",
          mapelNama:
            km.mataPelajaran?.nama ??
            km.mataPelajaran?.namaMapel ??
            tugas.kelasMapel?.mataPelajaran?.nama ??
            "-",
          guruNama:
            km.guruPengajar?.namaLengkap ??
            tugas.kelasMapel?.guruPengajar?.namaLengkap ??
            "-",
          jumlahPengumpulan:
            tugas._count?.pengumpulanTugasSiswa ??
            tugas.jumlahPengumpulan ??
            0,
        }));
      } catch (error) {
        console.error(`Gagal mengambil tugas kelas-mapel ${km.id}:`, error);
        return [];
      }
    })
  );

  return taskResponses.flat();
}

