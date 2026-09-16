import { z } from "zod";

export const createTahunAjaranSchema = z.object({
  nama: z
    .string()
    .regex(
      /^\d{4}\/\d{4}$/,
      "Format tahun ajaran harus seperti 2026/2027"
    ),

  semester: z.enum(
    ["Ganjil", "Genap"],
    {
      message: "Semester harus Ganjil atau Genap",
    }
  ),

  status: z
    .enum(["aktif", "tidak_aktif"], {
      message: "Status harus aktif atau tidak_aktif",
    })
    .optional(),
});

export const updateTahunAjaranSchema = z.object({
  nama: z
    .string()
    .regex(
      /^\d{4}\/\d{4}$/,
      "Format tahun ajaran harus seperti 2026/2027"
    )
    .optional(),

  semester: z
    .enum(["Ganjil", "Genap"], {
      message: "Semester harus Ganjil atau Genap",
    })
    .optional(),

  status: z
    .enum(["aktif", "tidak_aktif"], {
      message: "Status harus aktif atau tidak_aktif",
    })
    .optional(),
});