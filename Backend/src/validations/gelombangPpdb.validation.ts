import { z } from "zod";
import { parseDateOnly } from "../utils/dateOnly";

const calendarDate = z.string().transform((value, context) => {
  try {
    return parseDateOnly(value);
  } catch {
    context.addIssue({ code: "custom", message: "Tanggal harus valid dengan format YYYY-MM-DD" });
    return z.NEVER;
  }
});

export const gelombangPpdbSchema = z.object({
  nama: z.string().trim().min(2).max(50),
  jalurPpdbId: z.string().uuid().nullable().optional(),
  tanggalMulai: calendarDate,
  tanggalSelesai: calendarDate,
  kuota: z.number().int().min(0).max(2_147_483_647).nullable().optional(),
  status: z.enum(["aktif", "nonaktif"]).optional(),
}).strict().refine(value => value.tanggalSelesai >= value.tanggalMulai, {
  path: ["tanggalSelesai"], message: "Tanggal selesai tidak boleh sebelum tanggal mulai",
});

export const gelombangPpdbQuerySchema = z.object({
  sekolahId: z.string().uuid().optional(),
  search: z.string().trim().max(200).optional(),
  jalurPpdbId: z.string().uuid().optional(),
  status: z.enum(["aktif", "nonaktif"]).optional(),
});
