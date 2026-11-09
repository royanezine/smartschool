import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  daftarKota,
  daftarProvinsi,
  daftarKecamatan,
  daftarKelurahan,
} from "../services/wilayah.service";

const provinsiIdSchema = z
  .string()
  .regex(/^\d{2}$/, "provinsi_id wajib berupa kode provinsi 2 digit");

const kotaIdSchema = z
  .string()
  .regex(/^\d{4}$/, "kota_id wajib berupa kode kota/kabupaten 4 digit");

const kecamatanIdSchema = z
  .string()
  .regex(/^\d{6}$/, "kecamatan_id wajib berupa kode kecamatan 6 digit");

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

export async function getKecamatan(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const raw =
      (req.params as any).kotaId ??
      (req.query as any).kota_id ??
      (req.query as any).kotaId;

    const kota_id = kotaIdSchema.parse(raw);
    const data = await daftarKecamatan(kota_id);

    return res.json({
      success: true,
      data: data.map((item) => ({ ...item, kota_id })),
    });
  } catch (error) {
    next(error);
  }
}

export async function getKelurahan(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const raw =
      (req.params as any).kecamatanId ??
      (req.query as any).kecamatan_id ??
      (req.query as any).kecamatanId;

    const kecamatan_id = kecamatanIdSchema.parse(raw);
    const data = await daftarKelurahan(kecamatan_id);

    return res.json({
      success: true,
      data: data.map((item) => ({ ...item, kecamatan_id })),
    });
  } catch (error) {
    next(error);
  }
}