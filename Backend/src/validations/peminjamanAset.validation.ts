import { z } from "zod";

export const ajukanPeminjamanSchema = z.object({
  keperluan: z.string().min(3, "Keperluan peminjaman minimal 3 karakter"),
  tanggalKembaliRencana: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  catatanPeminjaman: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        asetId: z.string().uuid("ID Aset tidak valid"),
        jumlah: z.number().int().positive("Jumlah barang minimal 1"),
      })
    )
    .min(1, "Minimal pilih 1 aset untuk dipinjam"),
});

export const persetujuanPeminjamanSchema = z.object({
  status: z.enum(["disetujui", "ditolak"], {
    error: () => "Status hanya boleh 'disetujui' atau 'ditolak'",
  }),
  catatanPenolakan: z.string().optional().nullable(),
});

export const serahkanPeminjamanSchema = z
  .object({
    siswaPengambilId: z
      .string()
      .uuid("ID Siswa pengambil tidak valid")
      .optional()
      .nullable(),
    namaSiswaPengambil: z
      .string()
      .min(2, "Nama siswa pengambil minimal 2 karakter")
      .optional()
      .nullable(),
    kondisiSaatPinjam: z.string().default("baik"),
  })
  .refine((data) => data.siswaPengambilId || data.namaSiswaPengambil, {
    message: "Wajib mencantumkan ID siswa atau nama siswa yang mengambil barang",
    path: ["namaSiswaPengambil"],
  });

export const kembalikanPeminjamanSchema = z.object({
  siswaPengembaliId: z
    .string()
    .uuid("ID Siswa pengembali tidak valid")
    .optional()
    .nullable(),
  namaSiswaPengembali: z
    .string()
    .min(2, "Nama siswa pengembali minimal 2 karakter")
    .optional()
    .nullable(),
  items: z
    .array(
      z.object({
        asetId: z.string().uuid("ID Aset tidak valid"),
        kondisiSaatKembali: z
          .enum(["baik", "rusak_ringan", "rusak_berat"])
          .default("baik"),
        catatanKembali: z.string().optional().nullable(),
      })
    )
    .min(1, "Data barang yang dikembalikan wajib ada"),
});