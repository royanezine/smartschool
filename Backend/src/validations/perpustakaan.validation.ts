import { z } from "zod";

const tipeBuku = z.enum(["FISIK", "EBOOK"]);

export const createBukuSchema = z.object({
  body: z.object({
    kodeBuku: z.string().min(1).max(50),
    judul: z.string().min(1).max(150),
    penulis: z.string().max(100).optional(),
    penerbit: z.string().max(100).optional(),
    tahunTerbit: z.number().int().positive().optional(),
    isbn: z.string().max(30).optional(),

    tipe: tipeBuku,

    kategori: z.string().max(50).optional(),
    deskripsi: z.string().optional(),
    coverUrl: z.string().url().optional(),
    urlEbook: z.string().url().optional(),

    jumlah: z.number().int().min(0).default(0),
    status: z.string().max(20).optional(),
  }),

  params: z.object({}),

  query: z.object({}),
});

export const updateBukuSchema = z.object({
  body: z.object({
    kodeBuku: z.string().min(1).max(50).optional(),
    judul: z.string().min(1).max(150).optional(),
    penulis: z.string().max(100).optional(),
    penerbit: z.string().max(100).optional(),
    tahunTerbit: z.number().int().positive().optional(),
    isbn: z.string().max(30).optional(),
    tipe: tipeBuku.optional(),
    kategori: z.string().max(50).optional(),
    deskripsi: z.string().optional(),
    coverUrl: z.string().url().optional(),
    urlEbook: z.string().url().optional(),
    jumlah: z.number().int().min(0).optional(),
    status: z.string().max(20).optional(),
  }),

  params: z.object({
    id: z.string().uuid(),
  }),

  query: z.object({}),
});

export const peminjamanBukuSchema = z.object({
  body: z.object({
    bukuId: z.string().uuid(),
    tanggalJatuhTempo: z.string().date(),
    catatan: z.string().optional(),
  }),

  params: z.object({}),

  query: z.object({}),
});

export const pengembalianBukuSchema = z.object({
  body: z.object({
    catatan: z.string().optional(),
  }),

  params: z.object({
    id: z.string().uuid(),
  }),

  query: z.object({}),
});