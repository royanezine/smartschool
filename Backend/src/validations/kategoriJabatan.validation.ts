import { z } from "zod";

export const createKategoriJabatanSchema = z.object({
  nama: z.string().min(1, "Nama kategori jabatan wajib diisi").max(100),
  kode: z.string().max(50).optional(),
  keterangan: z.string().optional(),
  status: z.enum(["aktif", "nonaktif"]).default("aktif"),
  tarifPerJam: z.coerce.number().min(0, "Tarif per jam tidak boleh negatif"),
  berlakuMulai: z.string().optional(),
  catatanTarif: z.string().optional(),
  sekolahId: z.string().uuid("ID Sekolah tidak valid").optional(),
});

export const updateKategoriJabatanSchema = z.object({
  nama: z.string().min(1).max(100).optional(),
  kode: z.string().max(50).optional(),
  keterangan: z.string().optional(),
  status: z.enum(["aktif", "nonaktif"]).optional(),
});

export const setTarifJabatanSchema = z.object({
  tarifPerJam: z.coerce.number().min(0, "Tarif per jam tidak boleh negatif"),
  berlakuMulai: z.string().optional(),
  catatan: z.string().optional(),
});
