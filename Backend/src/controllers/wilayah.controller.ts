import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { daftarKota, daftarProvinsi } from "../services/wilayah.service";

const provinsiIdSchema = z
  .string()
  .regex(/^\d{2}$/, "provinsi_id wajib berupa kode provinsi 2 digit");

export async function getProvinsi(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await daftarProvinsi();
    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function getKota(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const raw =
      (req.params as any).provinsiId ??
      (req.query as any).provinsi_id ??
      (req.query as any).provinsiId;

    const provinsi_id = provinsiIdSchema.parse(raw);
    const data = await daftarKota(provinsi_id);

    return res.json({
      success: true,
      data: data.map((item) => ({ ...item, provinsi_id })),
    });
  } catch (error) {
    next(error);
  }
}