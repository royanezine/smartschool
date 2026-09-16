import { z } from "zod";

export const createJadwalMengajarSchema = z
  .object({
    kelasMapelId: z
      .string()
      .uuid("kelasMapelId harus berupa UUID"),

    hari: z.enum(
      [
        "senin",
        "selasa",
        "rabu",
        "kamis",
        "jumat",
        "sabtu",
        "minggu",
      ],
      {
        message: "Hari tidak valid",
      }
    ),

    jamMulai: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Format jam mulai harus HH:mm"
      ),

    jamSelesai: z
      .string()
      .regex(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        "Format jam selesai harus HH:mm"
      ),

    ruangan: z
      .string()
      .max(100, "Ruangan maksimal 100 karakter")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => data.jamMulai < data.jamSelesai,
    {
      message: "Jam selesai harus lebih besar dari jam mulai",
      path: ["jamSelesai"],
    }
  );

export const updateJadwalMengajarSchema =
  createJadwalMengajarSchema;