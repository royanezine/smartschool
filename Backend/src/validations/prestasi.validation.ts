import { z } from "zod";

export const createPrestasiSchema = z.object({
  namaSiswa: z.string().min(1, "Nama siswa wajib diisi"),
  kelas: z.string().optional(),
  siswaId: z.string().uuid("ID Siswa tidak valid").optional().nullable(),
  kelasId: z.string().uuid("ID Kelas tidak valid").optional().nullable(),
  namaLomba: z.string().min(1, "Nama lomba wajib diisi"),
  tingkat: z.string().min(1, "Tingkat perlombaan wajib diisi"),
  juara: z.string().min(1, "Peringkat juara wajib diisi"),
  bulan: z.string().optional().nullable(),
  tahun: z.coerce.number().int().min(1900).max(2100),
  penyelenggara: z.string().min(1, "Penyelenggara wajib diisi"),
  keterangan: z.string().optional().nullable(),
  sertifikatUrl: z.string().optional().nullable(),
});

export const updatePrestasiSchema = createPrestasiSchema.partial();

