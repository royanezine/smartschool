import { z } from "zod";

const dasarPrestasi = z.object({
  siswaId: z.string().uuid("ID siswa tidak valid").nullish(),
  kelasId: z.string().uuid("ID kelas tidak valid").nullish(),
  namaSiswa: z.string().trim().min(1, "Nama siswa wajib diisi").max(150).optional(),
  kelas: z.string().trim().max(50).nullish(),
  namaLomba: z.string().trim().min(1, "Nama lomba wajib diisi").max(200),
  tingkat: z.string().trim().min(1, "Tingkat wajib diisi").max(50),
  juara: z.string().trim().min(1, "Juara wajib diisi").max(50),
  bulan: z.string().trim().max(20).nullish(),
  tahun: z.coerce.number().int().min(1900).max(2100),
  penyelenggara: z.string().trim().min(1, "Penyelenggara wajib diisi").max(200),
  keterangan: z.string().trim().nullish(),
  sertifikatUrl: z.string().trim().max(255).nullish(),
});

export const createPrestasiSchema = dasarPrestasi.refine(
  (value) => Boolean(value.siswaId) || Boolean(value.namaSiswa),
  { message: "siswaId atau namaSiswa wajib diisi", path: ["namaSiswa"] },
);

export const updatePrestasiSchema = dasarPrestasi.partial();