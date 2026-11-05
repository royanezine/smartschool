import { Request, Response } from "express";
import { z } from "zod";
import { daftarKota, daftarProvinsi } from "../services/wilayah.service";

export async function getProvinsi(_req: Request, res: Response) {
  const data = await daftarProvinsi();
  return res.json({ success: true, data });
}

export async function getKota(req: Request, res: Response) {
  const { provinsi_id } = z.object({
    provinsi_id: z.string().regex(/^\d{2}$/, "provinsi_id wajib berupa kode provinsi 2 digit"),
  }).parse(req.query);
  const data = await daftarKota(provinsi_id);
  return res.json({ success: true, data: data.map(item => ({ ...item, provinsi_id })) });
}
