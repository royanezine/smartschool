import { z } from "zod";
import { parseDateOnly } from "../utils/dateOnly";

const optionalText = (max: number) => z.string().trim().max(max).nullable().optional();
const fields = {
  namaLengkap: z.string().trim().min(2).max(100), email: z.string().email().max(100),
  namaPengguna: z.string().trim().min(1).max(50), nisn: optionalText(20), nis: optionalText(20), nipd: optionalText(20),
  nik: z.string().regex(/^\d{16}$/).nullable().optional(), jenisKelamin: optionalText(10),
  tempatLahir: optionalText(50), tanggalLahir: z.string().transform(v => parseDateOnly(v, "tanggalLahir")).nullable().optional(),
  alamat: optionalText(10000), alamatKtp: optionalText(10000), alamatDomisili: optionalText(10000),
  alamatSesuaiDomisili: z.boolean().optional(), provinsi: optionalText(50), kotaKabupaten: optionalText(50),
  kecamatan: optionalText(50), kelurahan: optionalText(50), kodePos: optionalText(10), noTelepon: optionalText(20),
  namaAyah: optionalText(100), nikAyah: optionalText(20), pekerjaanAyah: optionalText(50), noHpAyah: optionalText(20),
  namaIbu: optionalText(100), nikIbu: optionalText(20), pekerjaanIbu: optionalText(50), noHpIbu: optionalText(20),
  namaWaliPesertaDidik: optionalText(20),
  kelasId: z.string().uuid().nullable().optional(), tahunAjaranId: z.string().uuid().optional(),
  jurusanId: z.string().uuid().nullable().optional(),
  status: z.enum(["aktif", "nonaktif"]).optional(),
};
export const createSiswaSchema = z.object({ ...fields, kataSandi: z.string().min(8).max(72).refine(v => Buffer.byteLength(v) <= 72) }).strict();
export const updateSiswaSchema = z.object(fields).partial().strict();

// Compatibility export; all student writes use the same validated contract.
export const siswaSchema = createSiswaSchema;
