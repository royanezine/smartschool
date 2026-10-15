import fs from "fs";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const tarikSumberNilaiSchema = z.object({
  kelasMapelId: z.string().uuid("ID kelas mapel tidak valid"),
  komponenNilaiId: z.string().uuid("ID komponen nilai tidak valid"),
  jenisSumber: z.enum(["asesmen", "tugas"]),
  sumberId: z.string().uuid("ID sumber tidak valid"),
});

export const importNilaiExcelSchema = z.object({
  kelasMapelId: z.string().uuid("ID kelas mapel tidak valid"),
  komponenNilaiId: z.string().uuid("ID komponen nilai tidak valid"),
});

export const validateImportNilaiExcel = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const result = importNilaiExcelSchema.safeParse(req.body);

  if (!result.success) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch {
      }
    }

    return res.status(400).json({
      success: false,
      message: "Data import tidak valid",
      errorCode: "VALIDATION_ERROR",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  req.body = result.data;
  next();
};
