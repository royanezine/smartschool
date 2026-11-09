import { z } from "zod";

const dasarSikapPerilaku = z.object({
  siswaId: z.string().uuid("ID siswa tidak valid").nullish(),
  kelasId: z.string().uuid("ID kelas tidak valid").nullish(),
  nama: z.string().trim().min(1, "Nama siswa wajib diisi").max(150).optional(),
  kelas: z.string().trim().max(50).nullish(),
  jenis: z.string().trim().min(1, "Jenis wajib diisi").max(20),
  catatan: z.string().trim().min(1, "Catatan wajib diisi"),
  poin: z.coerce.number().int().min(-1000).max(1000).optional(),
  tanggal: z.coerce.date({ message: "Tanggal tidak valid" }),
});

export const createSikapPerilakuSchema = dasarSikapPerilaku
  .extend({
    poin: z.coerce.number().int().min(-1000).max(1000).default(0),
  })
  .refine((value) => Boolean(value.siswaId) || Boolean(value.nama), {
    message: "siswaId atau nama wajib diisi",
    path: ["nama"],
  });

export const updateSikapPerilakuSchema = dasarSikapPerilaku.partial();