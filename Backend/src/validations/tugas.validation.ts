import { z } from "zod";

export const createTugasSchema = z.object({
    kelasMapelId: z.string().uuid("ID Kelas Mapel tidak valid"),
    judul: z.string().min(3, "Judul tugas minimal 3 karakter").max(100),
    deskripsi: z.string().optional().nullable(),
    batasWaktu: z.string().datetime({
        message: "Format batas waktu harus ISO DateTime (contoh: 2026-08-25T23:59:59Z"
    }),
});

export const updateTugasSchema = z.object({
    judul: z.string().min(3).max(100).optional(),
    deskripsi: z.string().optional().nullable(),
    batasWaktu: z.string().datetime().optional(),
});

export const submitTugasSchema = z.object({
    urlFile: z.string().url("URL file pengumpulan harus berupa URL valid (cloud/storage path"),
    keterangan: z.string().optional().nullable(),
});

export const nilaiTugasSchema = z.object({
    nilai: z.number().min(0).max(100),
    keterangan: z.string().optional().nullable(),
});