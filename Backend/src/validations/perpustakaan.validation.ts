import { z } from "zod";

const tipeBuku = z.enum(["FISIK", "EBOOK"]);

const kosongJadiUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

const angkaOpsional = (schema: z.ZodNumber) =>
  z.preprocess(kosongJadiUndefined, z.coerce.number().pipe(schema).optional());

const teksOpsional = (max?: number) => {
  const base = max ? z.string().max(max) : z.string();
  return z.preprocess(kosongJadiUndefined, base.optional());
};

export const createBukuSchema = z.object({
  body: z.object({
    kodeBuku: z.string().min(1).max(50),
    judul: z.string().min(1).max(150),
    penulis: teksOpsional(100),
    penerbit: teksOpsional(100),
    tahunTerbit: angkaOpsional(z.number().int().positive()),
    isbn: teksOpsional(30),

    tipe: tipeBuku,

    kategori: teksOpsional(50),
    mataPelajaranId: teksOpsional(),
    deskripsi: teksOpsional(),
    coverUrl: teksOpsional(255),
    urlEbook: teksOpsional(255),

    jumlah: z.preprocess(
      kosongJadiUndefined,
      z.coerce.number().int().min(0).default(0),
    ),
    status: teksOpsional(20),
  }),

  params: z.object({}),

  query: z.object({}),
});

export const updateBukuSchema = z.object({
  body: z.object({
    kodeBuku: z.string().min(1).max(50).optional(),
    judul: z.string().min(1).max(150).optional(),
    penulis: teksOpsional(100),
    penerbit: teksOpsional(100),
    tahunTerbit: angkaOpsional(z.number().int().positive()),
    isbn: teksOpsional(30),
    tipe: tipeBuku.optional(),
    kategori: teksOpsional(50),
    mataPelajaranId: teksOpsional(),
    deskripsi: teksOpsional(),
    coverUrl: teksOpsional(255),
    urlEbook: teksOpsional(255),
    jumlah: angkaOpsional(z.number().int().min(0)),
    status: teksOpsional(20),
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
    catatan: teksOpsional(),
  }),

  params: z.object({}),

  query: z.object({}),
});

export const pengembalianBukuSchema = z.object({
  body: z.object({
    catatan: teksOpsional(),
  }),

  params: z.object({
    id: z.string().uuid(),
  }),

  query: z.object({}),
});