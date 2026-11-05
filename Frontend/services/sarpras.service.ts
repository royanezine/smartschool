
import { apiFetch } from "../lib/api";

// ======================================================
// API ENDPOINT
// ======================================================

const API_ENDPOINT = "/api/sarpras";
const PEMINJAMAN_ENDPOINT = "/api/peminjaman-aset";

// ======================================================
// RESPONSE TYPE
// ======================================================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

// ======================================================
// MASTER DATA INTERFACES
// ======================================================

export interface Gudang {
  id: string;
  sekolahId?: string;
  nama: string;
  lokasi: string | null;
  keterangan: string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;
}

export interface KategoriAset {
  id: string;
  sekolahId?: string;
  nama: string;
  keterangan: string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;
}

export interface Ruangan {
  id: string;
  sekolahId?: string;
  nama: string;
  lokasi: string | null;
  kapasitas: number | null;
  keterangan: string | null;
  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;
}

// ======================================================
// ASET INTERFACES
// ======================================================

export interface Aset {
  id: string;
  sekolahId?: string;
  kode: string;
  nama: string;

  gudangId: string | null;
  kategoriAsetId: string | null;
  ruanganId: string | null;

  kondisi: string | null;
  jumlah: number;
  keterangan: string | null;

  gudang?: Gudang | null;
  kategoriAset?: KategoriAset | null;
  ruangan?: Ruangan | null;

  dibuatPada?: string;
  diperbaruiPada?: string;
  dihapusPada?: string | null;
}

// ======================================================
// PEMINJAMAN INTERFACES
// ======================================================

export type StatusPeminjaman =
  | "menunggu"
  | "disetujui"
  | "ditolak"
  | "dipinjam"
  | "dikembalikan"
  | "terlambat";

export interface PeminjamanItemInput {
  asetId: string;
  jumlah: number;
}

export interface PeminjamanItem {
  id?: string;
  asetId: string;
  jumlah: number;
  kondisiSaatPinjam?: string | null;
  kondisiSaatKembali?: string | null;
  catatanKembali?: string | null;
  aset?: Aset | null;
}

export interface Peminjaman {
  id: string;
  keperluan: string;
  tanggalKembaliRencana: string;
  catatanPeminjaman?: string | null;
  status: StatusPeminjaman | string;
  catatanPenolakan?: string | null;

  siswaPengambilId?: string | null;
  namaSiswaPengambil?: string | null;
  siswaPengembaliId?: string | null;
  namaSiswaPengembali?: string | null;

  kondisiSaatPinjam?: string | null;

  items?: PeminjamanItem[];

  dibuatPada?: string;
  diperbaruiPada?: string;
}

export interface KetersediaanAset extends Aset {
  jumlahTersedia?: number;
  jumlahDipinjam?: number;
}

// ======================================================
// PAYLOAD INTERFACES
// ======================================================

export interface GudangPayload {
  nama: string;
  lokasi?: string | null;
  keterangan?: string | null;
}

export interface KategoriAsetPayload {
  nama: string;
  keterangan?: string | null;
}

export interface RuanganPayload {
  nama: string;
  lokasi?: string | null;
  kapasitas?: number | null;
  keterangan?: string | null;
}

export interface AsetPayload {
  kode: string;
  nama: string;
  gudangId?: string | null;
  kategoriAsetId?: string | null;
  ruanganId?: string | null;
  kondisi?: string | null;
  jumlah?: number;
  keterangan?: string | null;
}

export interface AjukanPeminjamanPayload {
  asetId: string;
  jumlah: number;
  keperluan: string;
  tanggalKembaliRencana: string;
  catatanPeminjaman?: string | null;
}

export interface VerifikasiPeminjamanPayload {
  status: StatusPeminjaman;
  catatanPenolakan?: string | null;
}

export interface SerahkanPeminjamanPayload {
  siswaPengambilId?: string | null;
  namaSiswaPengambil?: string | null;
  kondisiSaatPinjam?: string;
}

export interface ItemPengembalianPayload {
  asetId: string;
  kondisiSaatKembali?: string;
  catatanKembali?: string | null;
}

export interface KembalikanPeminjamanPayload {
  siswaPengembaliId?: string | null;
  namaSiswaPengembali?: string | null;
  items: ItemPengembalianPayload[];
}

export interface DaftarPeminjamanParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

// ======================================================
// HELPER FUNCTIONS
// ======================================================

function validateId(id: string, label: string): void {
  if (!id || !id.trim()) {
    throw new Error(`${label} tidak ditemukan.`);
  }
}

function normalizeText(
  value?: string | null
): string | null {
  return value?.trim() || null;
}

function validatePositiveInteger(
  value: number,
  label: string,
  allowZero = false
): number {
  if (
    !Number.isInteger(value) ||
    (allowZero ? value < 0 : value <= 0)
  ) {
    throw new Error(
      allowZero
        ? `${label} harus berupa bilangan bulat minimal 0.`
        : `${label} harus berupa bilangan bulat lebih dari 0.`
    );
  }

  return value;
}

function extractList<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (
    typeof response === "object" &&
    response !== null &&
    "data" in response
  ) {
    const data = response.data;

    if (Array.isArray(data)) {
      return data as T[];
    }

    if (
      typeof data === "object" &&
      data !== null &&
      "data" in data &&
      Array.isArray(data.data)
    ) {
      return data.data as T[];
    }
  }

  return [];
}

// ======================================================
// GUDANG
// ======================================================

export async function getGudang() {
  return apiFetch(`${API_ENDPOINT}/gudang`, {
    method: "GET",
  });
}

export async function createGudang(data: GudangPayload) {
  if (!data.nama?.trim()) {
    throw new Error("Nama gudang wajib diisi.");
  }

  return apiFetch(`${API_ENDPOINT}/gudang`, {
    method: "POST",
    body: JSON.stringify({
      nama: data.nama.trim(),
      lokasi: normalizeText(data.lokasi),
      keterangan: normalizeText(data.keterangan),
    }),
  });
}

export async function updateGudang(
  id: string,
  data: GudangPayload
) {
  validateId(id, "ID gudang");

  if (!data.nama?.trim()) {
    throw new Error("Nama gudang wajib diisi.");
  }

  return apiFetch(
    `${API_ENDPOINT}/gudang/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        nama: data.nama.trim(),
        lokasi: normalizeText(data.lokasi),
        keterangan: normalizeText(data.keterangan),
      }),
    }
  );
}

export async function deleteGudang(id: string) {
  validateId(id, "ID gudang");

  return apiFetch(
    `${API_ENDPOINT}/gudang/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}

// ======================================================
// KATEGORI ASET
// ======================================================

export async function getKategoriAset() {
  return apiFetch(`${API_ENDPOINT}/kategori`, {
    method: "GET",
  });
}

export async function createKategoriAset(
  data: KategoriAsetPayload
) {
  if (!data.nama?.trim()) {
    throw new Error("Nama kategori aset wajib diisi.");
  }

  return apiFetch(`${API_ENDPOINT}/kategori`, {
    method: "POST",
    body: JSON.stringify({
      nama: data.nama.trim(),
      keterangan: normalizeText(data.keterangan),
    }),
  });
}

export async function updateKategoriAset(
  id: string,
  data: KategoriAsetPayload
) {
  validateId(id, "ID kategori aset");

  if (!data.nama?.trim()) {
    throw new Error("Nama kategori aset wajib diisi.");
  }

  return apiFetch(
    `${API_ENDPOINT}/kategori/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        nama: data.nama.trim(),
        keterangan: normalizeText(data.keterangan),
      }),
    }
  );
}

export async function deleteKategoriAset(id: string) {
  validateId(id, "ID kategori aset");

  return apiFetch(
    `${API_ENDPOINT}/kategori/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}

// ======================================================
// RUANGAN
// ======================================================

export async function getRuangan() {
  return apiFetch(`${API_ENDPOINT}/ruangan`, {
    method: "GET",
  });
}

export async function createRuangan(data: RuanganPayload) {
  if (!data.nama?.trim()) {
    throw new Error("Nama ruangan wajib diisi.");
  }

  const kapasitas =
    data.kapasitas == null
      ? null
      : validatePositiveInteger(
          data.kapasitas,
          "Kapasitas",
          true
        );

  return apiFetch(`${API_ENDPOINT}/ruangan`, {
    method: "POST",
    body: JSON.stringify({
      nama: data.nama.trim(),
      lokasi: normalizeText(data.lokasi),
      kapasitas,
      keterangan: normalizeText(data.keterangan),
    }),
  });
}

export async function updateRuangan(
  id: string,
  data: RuanganPayload
) {
  validateId(id, "ID ruangan");

  if (!data.nama?.trim()) {
    throw new Error("Nama ruangan wajib diisi.");
  }

  const kapasitas =
    data.kapasitas == null
      ? null
      : validatePositiveInteger(
          data.kapasitas,
          "Kapasitas",
          true
        );

  return apiFetch(
    `${API_ENDPOINT}/ruangan/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify({
        nama: data.nama.trim(),
        lokasi: normalizeText(data.lokasi),
        kapasitas,
        keterangan: normalizeText(data.keterangan),
      }),
    }
  );
}

export async function deleteRuangan(id: string) {
  validateId(id, "ID ruangan");

  return apiFetch(
    `${API_ENDPOINT}/ruangan/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}

// ======================================================
// ASET
// ======================================================

export async function getAset() {
  return apiFetch(`${API_ENDPOINT}/aset`, {
    method: "GET",
  });
}

function buildAsetPayload(data: AsetPayload): AsetPayload {
  if (!data.nama?.trim()) {
    throw new Error("Nama aset wajib diisi.");
  }

  if (!data.kode?.trim()) {
    throw new Error("Kode aset wajib diisi.");
  }

  const jumlah = data.jumlah ?? 0;

  validatePositiveInteger(jumlah, "Jumlah aset", true);

  return {
    kode: data.kode.trim(),
    nama: data.nama.trim(),
    gudangId: data.gudangId || null,
    kategoriAsetId: data.kategoriAsetId || null,
    ruanganId: data.ruanganId || null,
    kondisi: normalizeText(data.kondisi),
    jumlah,
    keterangan: normalizeText(data.keterangan),
  };
}

export async function createAset(data: AsetPayload) {
  return apiFetch(`${API_ENDPOINT}/aset`, {
    method: "POST",
    body: JSON.stringify(buildAsetPayload(data)),
  });
}

export async function updateAset(
  id: string,
  data: AsetPayload
) {
  validateId(id, "ID aset");

  return apiFetch(
    `${API_ENDPOINT}/aset/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(buildAsetPayload(data)),
    }
  );
}

export async function getAsetById(id: string) {
  validateId(id, "ID aset");

  // BE belum menyediakan endpoint GET /aset/:id.
  // Gunakan daftar aset dan cari berdasarkan ID.
  const response = await getAset();

  const aset = extractList<Aset>(response).find(
    (item) => String(item.id) === String(id)
  );

  if (!aset) {
    throw new Error("Aset tidak ditemukan.");
  }

  return {
    success: true,
    message: "Detail aset berhasil diambil.",
    data: aset,
  };
}

export async function deleteAset(id: string) {
  validateId(id, "ID aset");

  return apiFetch(
    `${API_ENDPOINT}/aset/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );
}

// ======================================================
// KETERSEDIAAN ASET
// ======================================================

export async function getKetersediaanAset() {
  return apiFetch(`${PEMINJAMAN_ENDPOINT}/ketersediaan`, {
    method: "GET",
  });
}

// ======================================================
// AJUKAN PEMINJAMAN
// ======================================================

export async function ajukanPeminjaman(
  data: AjukanPeminjamanPayload
) {
  validateId(data.asetId, "Aset");

  if (!data.keperluan?.trim()) {
    throw new Error("Keperluan peminjaman wajib diisi.");
  }

  if (!data.tanggalKembaliRencana) {
    throw new Error(
      "Tanggal rencana pengembalian wajib diisi."
    );
  }

  validatePositiveInteger(data.jumlah, "Jumlah peminjaman");

  return apiFetch(PEMINJAMAN_ENDPOINT, {
    method: "POST",
    body: JSON.stringify({
      keperluan: data.keperluan.trim(),
      tanggalKembaliRencana: data.tanggalKembaliRencana,
      catatanPeminjaman: normalizeText(
        data.catatanPeminjaman
      ),
      items: [
        {
          asetId: data.asetId,
          jumlah: data.jumlah,
        },
      ],
    }),
  });
}

// ======================================================
// DAFTAR PEMINJAMAN
// ======================================================

export async function getDaftarPeminjaman({
  page = 1,
  limit = 10,
  status = "",
  search = "",
}: DaftarPeminjamanParams = {}) {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (status.trim()) {
    params.set("status", status.trim());
  }

  if (search.trim()) {
    params.set("search", search.trim());
  }

  return apiFetch(
    `${PEMINJAMAN_ENDPOINT}?${params.toString()}`,
    {
      method: "GET",
    }
  );
}

// ======================================================
// DETAIL PEMINJAMAN
// ======================================================

export async function getDetailPeminjaman(id: string) {
  validateId(id, "ID peminjaman");

  return apiFetch(
    `${PEMINJAMAN_ENDPOINT}/${encodeURIComponent(id)}`,
    {
      method: "GET",
    }
  );
}

// ======================================================
// VERIFIKASI PEMINJAMAN
// ======================================================

export async function verifikasiPeminjaman(
  id: string,
  data: VerifikasiPeminjamanPayload
) {
  validateId(id, "ID peminjaman");

  if (!data.status) {
    throw new Error("Status persetujuan wajib diisi.");
  }

  if (
    data.status === "ditolak" &&
    !data.catatanPenolakan?.trim()
  ) {
    throw new Error("Catatan penolakan wajib diisi.");
  }

  return apiFetch(
    `${PEMINJAMAN_ENDPOINT}/${encodeURIComponent(id)}/verifikasi`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status: data.status,
        catatanPenolakan:
          data.status === "ditolak"
            ? normalizeText(data.catatanPenolakan)
            : null,
      }),
    }
  );
}

// ======================================================
// SERAHKAN ASET
// ======================================================

export async function serahkanPeminjaman(
  id: string,
  data: SerahkanPeminjamanPayload = {}
) {
  validateId(id, "ID peminjaman");

  return apiFetch(
    `${PEMINJAMAN_ENDPOINT}/${encodeURIComponent(id)}/serahkan`,
    {
      method: "PATCH",
      body: JSON.stringify({
        siswaPengambilId: data.siswaPengambilId || null,
        namaSiswaPengambil: normalizeText(
          data.namaSiswaPengambil
        ),
        kondisiSaatPinjam: data.kondisiSaatPinjam || "baik",
      }),
    }
  );
}

// ======================================================
// KEMBALIKAN ASET
// ======================================================

export async function kembalikanPeminjaman(
  id: string,
  data: KembalikanPeminjamanPayload
) {
  validateId(id, "ID peminjaman");

  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error("Data aset yang dikembalikan wajib diisi.");
  }

  const items = data.items.map((item) => {
    validateId(item.asetId, "ID aset");

    return {
      asetId: item.asetId,
      kondisiSaatKembali:
        item.kondisiSaatKembali || "baik",
      catatanKembali: normalizeText(item.catatanKembali),
    };
  });

  return apiFetch(
    `${PEMINJAMAN_ENDPOINT}/${encodeURIComponent(id)}/kembalikan`,
    {
      method: "PATCH",
      body: JSON.stringify({
        siswaPengembaliId: data.siswaPengembaliId || null,
        namaSiswaPengembali: normalizeText(
          data.namaSiswaPengembali
        ),
        items,
      }),
    }
  );
}
