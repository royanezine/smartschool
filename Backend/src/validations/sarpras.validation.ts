import { z } from "zod";

export const gudangSchema = z.object({
  nama: z.string().min(3, "Nama gudang minimal 3 karakter"),
  lokasi: z.string().optional().nullable(),
  status: z.string().default("aktif"),
});

export const kategoriAsetSchema = z.object({
  nama: z.string().min(3, "Nama kategori minimal 3 karakter"),
  status: z.string().default("aktif"),
});

export const asetSchema = z.object({
  kode: z.string().min(2, "Kode aset minimal 2 karakter"),
  nama: z.string().min(3, "Nama aset minimal 3 karakter"),
  kondisi: z.string().default("baik"),
  jumlah: z.number().int().min(1, "Jumlah minimal 1"),
  jumlahStok: z.number().int().min(0, "Jumlah stok minimal 0"),
  stokMinimum: z.number().int().min(0, "Stok minimum minimal 0"),
  lokasi: z.string().optional().nullable(),
  kategoriAsetId: z.string().uuid("ID Kategori Aset tidak valid"),
  gudangId: z.string().uuid("ID Gudang tidak valid"),
  status: z.string().default("aktif"),
});
