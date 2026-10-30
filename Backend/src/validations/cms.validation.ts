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
  halamanCmsId: z.string().uuid("ID Halaman CMS tidak valid"),
  section: z.string().trim().min(1, "Section wajib diisi").max(50),
  judul: z.string().trim().min(1, "Judul wajib diisi").max(100),
  subJudul: z.string().max(255).nullable().optional(),
  konten: z.string().nullable().optional(),
  gambarUrl: z.string().max(255).nullable().optional(),
  ctaText: z.string().max(50).nullable().optional(),
  ctaLink: z.string().max(255).nullable().optional(),
  urutan: z.number().int().min(0).max(2147483647).default(1),
  status: z.enum(["aktif", "nonaktif"]).default("aktif"),
}).strict();
