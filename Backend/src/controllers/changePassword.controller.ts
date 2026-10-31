import { NextFunction, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/appError";
import { successResponse } from "../utils/responseFormatter";

const schema = z.object({
  kataSandiLama: z.string().min(1).max(72),
  kataSandiBaru: z.string().min(8).max(72).refine(v => Buffer.byteLength(v, "utf8") <= 72, "Kata sandi maksimal 72 byte"),
}).strict().refine(v => v.kataSandiLama !== v.kataSandiBaru, "Kata sandi baru harus berbeda");
export async function changePassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = schema.parse(req.body);
    const user = await prisma.pengguna.findUnique({ where: { id: req.user!.userId }, select: { kataSandi: true } });
    if (!user || !await bcrypt.compare(data.kataSandiLama, user.kataSandi)) throw new AppError("Kata sandi lama salah", 400);
    const hash = await bcrypt.hash(data.kataSandiBaru, 12);
    const result = await prisma.pengguna.updateMany({ where: { id: req.user!.userId, kataSandi: user.kataSandi }, data: { kataSandi: hash, kodeOtp: null, otpTimeout: null, diperbaruiOleh: req.user!.userId } });
    if (result.count !== 1) throw new AppError("Kata sandi telah berubah; ulangi dengan kata sandi terbaru", 409);
    return successResponse(res, "Kata sandi berhasil diubah");
  } catch (error) { next(error); }
}
