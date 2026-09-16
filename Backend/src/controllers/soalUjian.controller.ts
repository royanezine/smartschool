import { Response } from "express";
import { prisma } from "../config/db";
import {
  createSoalSchema,
  updateSoalSchema,
} from "../validations/soalUjian.validation";
import { AppError } from "../utils/appError";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createSoal = async (req: AuthRequest, res: Response) => {
  const data = createSoalSchema.parse(req.body);

  const asesmen = await prisma.asesmen.findUnique({
    where: { id: data.ujianId },
  });

  if (!asesmen) {
    throw new AppError("Ujian tidak ditemukan", 404);
  }

  if (
    data.jenisSoal === "pilihan_ganda" &&
    (!data.pilihan || data.pilihan.length < 2)
  ) {
    throw new AppError("Soal pilihan ganda membutuhkan minimal 2 pilihan", 400);
  }

  if (data.jenisSoal === "pilihan_ganda" && !data.jawabanBenar) {
    throw new AppError("Soal pilihan ganda membutuhkan jawaban benar", 400);
  }

  const soal = await prisma.soalAsesmen.create({
    data: {
      asesmenId: data.ujianId,
      teksSoal: data.teksSoal,
      jenisSoal: data.jenisSoal,
      pilihan: data.pilihan,
      kunciJawaban: data.jawabanBenar,
      poin: data.poin,
      nomorUrut: data.nomorUrut,
      dibuatOleh: req.user!.userId,
    },
  });

  res.status(201).json({
    success: true,
    message: "Soal ujian berhasil ditambahkan",
    data: soal,
  });
};

export const getSoalByUjian = async (req: AuthRequest, res: Response) => {
  const ujianId = req.params.ujianId as string;

  const soal = await prisma.soalAsesmen.findMany({
    where: { asesmenId: ujianId },
    orderBy: { nomorUrut: "asc" },
  });

  res.status(200).json({
    success: true,
    message: "Daftar soal ujian berhasil diambil",
    data: soal,
  });
};

export const getSoalById = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;

  const soal = await prisma.soalAsesmen.findUnique({ where: { id } });

  if (!soal) {
    throw new AppError("Soal ujian tidak ditemukan", 404);
  }

  res.status(200).json({
    success: true,
    message: "Soal ujian berhasil diambil",
    data: soal,
  });
};

export const updateSoal = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const data = updateSoalSchema.parse(req.body);

  const existing = await prisma.soalAsesmen.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError("Soal ujian tidak ditemukan", 404);
  }

  const { jawabanBenar, ...restData } = data;

  const soal = await prisma.soalAsesmen.update({
    where: { id },
    data: {
      ...restData,
      ...(jawabanBenar !== undefined && { kunciJawaban: jawabanBenar }),
      diperbaruiOleh: req.user!.userId,
    },
  });

  res.status(200).json({
    success: true,
    message: "Soal ujian berhasil diperbarui",
    data: soal,
  });
};

export const deleteSoal = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;

  const existing = await prisma.soalAsesmen.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError("Soal ujian tidak ditemukan", 404);
  }

  await prisma.soalAsesmen.delete({ where: { id } });

  res.status(200).json({
    success: true,
    message: "Soal ujian berhasil dihapus",
  });
};
