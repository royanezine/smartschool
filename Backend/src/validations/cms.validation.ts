import { z } from "zod";
import { CMS_PUBLIC_STATUSES, normalizeCmsStatus } from "../utils/cmsPublication";

export const cmsPublicationStatusSchema = z.enum([
  "draft", "nonaktif", "arsip", ...CMS_PUBLIC_STATUSES,
]).transform(normalizeCmsStatus).default("draft");

export const kategoriArtikelSchema = z.object({
  nama: z.string().min(3, "Nama kategori minimal 3 karakter"),
  status: z.string().default("aktif"),
});

export const artikelCmsSchema = z.object({
  judul: z.string().min(3, "Judul artikel minimal 3 karakter"),
  konten: z.string().optional(),
  ringkasan: z.string().optional(),
  gambarUtama: z.string().optional(),
  status: cmsPublicationStatusSchema,
  kategoriArtikelId: z
    .string()
    .uuid("ID Kategori Artikel tidak valid")
    .optional()
    .nullable(),
});

export const halamanCmsSchema = z.object({
  judul: z.string().min(3, "Judul halaman minimal 3 karakter"),
  konten: z.string().optional(),
  status: cmsPublicationStatusSchema,
});

export const menuKonfigurasiSchema = z.object({
  halaman: z.string().min(1, "Halaman wajib diisi"),
  section: z.string().min(1, "Section wajib diisi"),
  judul: z.string().min(1, "Judul wajib diisi"),
  subJudul: z.string().nullable().optional(),
  konten: z.string().nullable().optional(),
  gambarUrl: z.string().nullable().optional(),
  ctaText: z.string().nullable().optional(),
  ctaLink: z.string().nullable().optional(),
  urutan: z.number().int().default(1),
  status: z.string().default("aktif"),
});
