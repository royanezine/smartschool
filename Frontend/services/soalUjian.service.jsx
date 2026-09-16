import { apiFetch } from "../lib/api";

/* =====================================================
   GET SOAL BY UJIAN
===================================================== */

export async function getSoalByUjian(ujianId) {
  if (!ujianId) {
    throw new Error("ID ujian tidak ditemukan.");
  }

  return apiFetch(
    `/api/v1/soal-ujian/ujian/${ujianId}`,
    {
      method: "GET",
    }
  );
}

/* =====================================================
   GET SOAL BY ID
===================================================== */

export async function getSoalById(id) {
  if (!id) {
    throw new Error("ID soal tidak ditemukan.");
  }

  return apiFetch(
    `/api/v1/soal-ujian/${id}`,
    {
      method: "GET",
    }
  );
}

/* =====================================================
   CREATE SOAL
===================================================== */

export async function createSoal(payload) {
  if (!payload.ujianId) {
    throw new Error("ID ujian wajib diisi.");
  }

  if (!payload.teksSoal?.trim()) {
    throw new Error("Teks soal wajib diisi.");
  }

  if (!payload.jenisSoal) {
    throw new Error("Jenis soal wajib dipilih.");
  }

  if (
    payload.jenisSoal === "pilihan_ganda" &&
    (!Array.isArray(payload.pilihan) ||
      payload.pilihan.length < 2)
  ) {
    throw new Error(
      "Soal pilihan ganda minimal memiliki 2 pilihan."
    );
  }

  if (
    payload.jenisSoal === "pilihan_ganda" &&
    !payload.jawabanBenar
  ) {
    throw new Error(
      "Jawaban benar wajib dipilih untuk soal pilihan ganda."
    );
  }

  if (!payload.poin || Number(payload.poin) <= 0) {
    throw new Error("Poin soal harus lebih dari 0.");
  }

  if (
    !payload.nomorUrut ||
    Number(payload.nomorUrut) <= 0
  ) {
    throw new Error("Nomor urut soal tidak valid.");
  }

  return apiFetch(
    "/api/v1/soal-ujian",
    {
      method: "POST",
      body: JSON.stringify({
        ujianId: payload.ujianId,
        teksSoal: payload.teksSoal.trim(),
        jenisSoal: payload.jenisSoal,
        pilihan:
          payload.jenisSoal === "pilihan_ganda"
            ? payload.pilihan
            : undefined,
        jawabanBenar:
          payload.jenisSoal === "pilihan_ganda"
            ? payload.jawabanBenar
            : undefined,
        poin: Number(payload.poin),
        nomorUrut: Number(payload.nomorUrut),
      }),
    }
  );
}

/* =====================================================
   UPDATE SOAL
===================================================== */

export async function updateSoal(id, payload) {
  if (!id) {
    throw new Error("ID soal tidak ditemukan.");
  }

  if (
    payload.teksSoal !== undefined &&
    !payload.teksSoal?.trim()
  ) {
    throw new Error("Teks soal wajib diisi.");
  }

  if (
    payload.jenisSoal === "pilihan_ganda" &&
    (!Array.isArray(payload.pilihan) ||
      payload.pilihan.length < 2)
  ) {
    throw new Error(
      "Soal pilihan ganda minimal memiliki 2 pilihan."
    );
  }

  if (
    payload.jenisSoal === "pilihan_ganda" &&
    !payload.jawabanBenar
  ) {
    throw new Error(
      "Jawaban benar wajib dipilih."
    );
  }

  return apiFetch(
    `/api/v1/soal-ujian/${id}`,
    {
      method: "PUT",
      body: JSON.stringify({
        ...(payload.teksSoal !== undefined && {
          teksSoal: payload.teksSoal.trim(),
        }),
        ...(payload.jenisSoal !== undefined && {
          jenisSoal: payload.jenisSoal,
        }),
        ...(payload.pilihan !== undefined && {
          pilihan: payload.pilihan,
        }),
        ...(payload.jawabanBenar !== undefined && {
          jawabanBenar: payload.jawabanBenar,
        }),
        ...(payload.poin !== undefined && {
          poin: Number(payload.poin),
        }),
        ...(payload.nomorUrut !== undefined && {
          nomorUrut: Number(payload.nomorUrut),
        }),
      }),
    }
  );
}

/* =====================================================
   DELETE SOAL
===================================================== */

export async function deleteSoal(id) {
  if (!id) {
    throw new Error("ID soal tidak ditemukan.");
  }

  return apiFetch(
    `/api/v1/soal-ujian/${id}`,
    {
      method: "DELETE",
    }
  );
}