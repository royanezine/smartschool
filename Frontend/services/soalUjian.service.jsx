
import { apiFetch } from "../lib/api";

/* =====================================================
   HELPER
===================================================== */

function normalizeJenisSoal(jenisSoal) {
  const jenis = String(jenisSoal ?? "").trim();

  if (!["pilihan_ganda", "benar_salah", "esai"].includes(jenis)) {
    throw new Error("Jenis soal tidak valid.");
  }

  return jenis;
}

function normalizePilihan(pilihan) {
  if (!Array.isArray(pilihan)) {
    return [];
  }

  return pilihan
    .map((item) => String(item ?? "").trim())
    .filter(Boolean);
}

function validateAngka(poin, nomorUrut) {
  const normalizedPoin = Number(poin);
  const normalizedNomorUrut = Number(nomorUrut);

  if (!Number.isFinite(normalizedPoin) || normalizedPoin <= 0) {
    throw new Error("Poin soal harus berupa angka lebih dari 0.");
  }

  if (
    !Number.isSafeInteger(normalizedNomorUrut) ||
    normalizedNomorUrut <= 0
  ) {
    throw new Error(
      "Nomor urut soal harus berupa bilangan bulat positif."
    );
  }

  return {
    poin: normalizedPoin,
    nomorUrut: normalizedNomorUrut,
  };
}

/**
 * Menyiapkan pilihan dan kunci jawaban berdasarkan jenis soal.
 *
 * Format jawaban benar/salah yang dikirim ke backend:
 * jawabanBenar: "benar" atau "salah"
 */
function normalizeJawaban(jenisSoal, pilihanInput, jawabanInput) {
  const jenis = normalizeJenisSoal(jenisSoal);

  if (jenis === "pilihan_ganda") {
    const pilihan = normalizePilihan(pilihanInput);

    if (pilihan.length < 2) {
      throw new Error(
        "Soal pilihan ganda minimal memiliki 2 pilihan."
      );
    }

    if (pilihan.length > 6) {
      throw new Error(
        "Soal pilihan ganda maksimal memiliki 6 pilihan."
      );
    }

    const pilihanUnik = new Set(
      pilihan.map((item) => item.toLocaleLowerCase())
    );

    if (pilihanUnik.size !== pilihan.length) {
      throw new Error("Setiap pilihan jawaban harus berbeda.");
    }

    const jawabanBenar = String(jawabanInput ?? "").trim();

    if (!jawabanBenar) {
      throw new Error(
        "Jawaban benar wajib dipilih untuk soal pilihan ganda."
      );
    }

    if (!pilihan.includes(jawabanBenar)) {
      throw new Error(
        "Jawaban benar harus berasal dari pilihan yang tersedia."
      );
    }

    return {
      pilihan,
      jawabanBenar,
    };
  }

  if (jenis === "benar_salah") {
    const pilihan = ["benar", "salah"];
    const jawabanBenar = String(jawabanInput ?? "")
      .trim()
      .toLowerCase();

    if (!["benar", "salah"].includes(jawabanBenar)) {
      throw new Error(
        "Jawaban soal benar/salah harus berupa benar atau salah."
      );
    }

    return {
      pilihan,
      jawabanBenar,
    };
  }

  // Soal esai tidak memerlukan pilihan atau kunci jawaban.
  return {
    pilihan: [],
    jawabanBenar: undefined,
  };
}

/* =====================================================
   GET SOAL BY UJIAN
   GET /api/soal-ujian/ujian/:ujianId
===================================================== */

export async function getSoalByUjian(ujianId) {
  if (!ujianId) {
    throw new Error("ID ujian tidak ditemukan.");
  }

  return apiFetch(
    `/api/soal-ujian/ujian/${encodeURIComponent(String(ujianId))}`,
    {
      method: "GET",
    }
  );
}

/* =====================================================
   GET SOAL BY ID
   GET /api/soal-ujian/:id
===================================================== */

export async function getSoalById(id) {
  if (!id) {
    throw new Error("ID soal tidak ditemukan.");
  }

  return apiFetch(
    `/api/soal-ujian/${encodeURIComponent(String(id))}`,
    {
      method: "GET",
    }
  );
}

/* =====================================================
   CREATE SOAL
   POST /api/soal-ujian
===================================================== */

export async function createSoal(payload) {
  if (!payload?.ujianId) {
    throw new Error("ID ujian wajib diisi.");
  }

  const teksSoal = String(payload.teksSoal ?? "").trim();

  if (teksSoal.length < 1) {
    throw new Error("Teks soal wajib diisi.");
  }

  const jenisSoal = normalizeJenisSoal(payload.jenisSoal);

  const { pilihan, jawabanBenar } = normalizeJawaban(
    jenisSoal,
    payload.pilihan,
    payload.jawabanBenar
  );

  const { poin, nomorUrut } = validateAngka(
    payload.poin,
    payload.nomorUrut
  );

  const body = {
    ujianId: String(payload.ujianId),
    teksSoal,
    jenisSoal,
    pilihan,
    ...(jawabanBenar !== undefined && { jawabanBenar }),
    poin,
    nomorUrut,
  };

  return apiFetch("/api/soal-ujian", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/* =====================================================
   UPDATE SOAL
   PUT /api/soal-ujian/:id
===================================================== */

export async function updateSoal(id, payload) {
  if (!id) {
    throw new Error("ID soal tidak ditemukan.");
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Data soal yang akan diperbarui tidak valid.");
  }

  const body = {};

  if (payload.teksSoal !== undefined) {
    const teksSoal = String(payload.teksSoal ?? "").trim();

    if (!teksSoal) {
      throw new Error("Teks soal wajib diisi.");
    }

    body.teksSoal = teksSoal;
  }

  /*
   * Jika jenis soal dikirim, siapkan pilihan dan jawaban
   * berdasarkan jenis tersebut.
   */
  if (payload.jenisSoal !== undefined) {
    const jenisSoal = normalizeJenisSoal(payload.jenisSoal);

    const { pilihan, jawabanBenar } = normalizeJawaban(
      jenisSoal,
      payload.pilihan,
      payload.jawabanBenar
    );

    body.jenisSoal = jenisSoal;
    body.pilihan = pilihan;

    if (jawabanBenar !== undefined) {
      body.jawabanBenar = jawabanBenar;
    }
  } else {
    /*
     * Jika jenis soal tidak diubah, kirim hanya properti
     * yang memang diberikan.
     */
    if (payload.pilihan !== undefined) {
      body.pilihan = normalizePilihan(payload.pilihan);
    }

    if (payload.jawabanBenar !== undefined) {
      body.jawabanBenar = String(payload.jawabanBenar).trim();
    }
  }

  if (payload.poin !== undefined) {
    const poin = Number(payload.poin);

    if (!Number.isFinite(poin) || poin <= 0) {
      throw new Error("Poin soal harus berupa angka lebih dari 0.");
    }

    body.poin = poin;
  }

  if (payload.nomorUrut !== undefined) {
    const nomorUrut = Number(payload.nomorUrut);

    if (
      !Number.isSafeInteger(nomorUrut) ||
      nomorUrut <= 0
    ) {
      throw new Error(
        "Nomor urut soal harus berupa bilangan bulat positif."
      );
    }

    body.nomorUrut = nomorUrut;
  }

  return apiFetch(
    `/api/soal-ujian/${encodeURIComponent(String(id))}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );
}

/* =====================================================
   DELETE SOAL
   DELETE /api/soal-ujian/:id
===================================================== */

export async function deleteSoal(id) {
  if (!id) {
    throw new Error("ID soal tidak ditemukan.");
  }

  return apiFetch(
    `/api/soal-ujian/${encodeURIComponent(String(id))}`,
    {
      method: "DELETE",
    }
  );
}
