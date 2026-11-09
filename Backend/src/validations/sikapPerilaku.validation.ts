import { z } from "zod";

export const createSikapPerilakuSchema = z.object({
  nama: z.string().min(1, "Nama siswa wajib diisi"),
  kelas: z.string().optional(),
  siswaId: z.string().uuid("ID Siswa tidak valid").optional().nullable(),
  kelasId: z.string().uuid("ID Kelas tidak valid").optional().nullable(),
  jenis: z.enum(["Positif", "Negatif"]),
  catatan: z.string().min(1, "Catatan sikap/perilaku wajib diisi"),
  poin: z.coerce.number().int().default(0),
  tanggal: z.string().min(1, "Tanggal wajib diisi"),
});

export const updateSikapPerilakuSchema = createSikapPerilakuSchema.partial();

