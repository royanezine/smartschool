import { z } from "zod";

export const kategoriArtikelSchema = z.object({
  nama: z.string().min(3, "Nama kategori minimal 3 karakter"),
  status: z.string().default("aktif"),
});

export const artikelCmsSchema = z.object({
  judul: z.string().min(3, "Judul artikel minimal 3 karakter"),
  konten: z.string().optional(),
  ringkasan: z.string().optional(),
  gambarUtama: z.string().optional(),
  status: z.string().default("draft"),
  kategoriArtikelId: z.string().uuid("ID Kategori Artikel tidak valid").optional().nullable(),
});

export const halamanCmsSchema = z.object({
  judul: z.string().min(3, "Judul halaman minimal 3 karakter"),
  konten: z.string().optional(),
  status: z.string().default("draft"),
});
