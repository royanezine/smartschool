import { Response } from "express";
import { prisma } from "../config/db";
import {
  createSoalSchema,
  updateSoalSchema,
} from "../validations/soalUjian.validation";
import { AppError } from "../utils/appError";
import { AuthRequest } from "../middlewares/auth.middleware";
import { isSuperAdmin, normalizeRole } from "../utils/rbac";

export const createSoal = async (req: AuthRequest, res: Response) => {
  const data = createSoalSchema.parse(req.body);
  const sekolahId = req.user?.sekolahId;
  const isSuper = isSuperAdmin(req.user?.role);

  const asesmen = await prisma.asesmen.findFirst({
    where: {
      id: data.ujianId,
      dihapusPada: null,
      ...(!isSuper && { kelasMapel: { kelas: { sekolahId } } }),
    },
  });

  if (!asesmen) {
    throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
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

  if (data.jenisSoal === "benar_salah") {
    if (!data.jawabanBenar) {
      throw new AppError("Soal benar/salah membutuhkan kunci jawaban", 400);
    }
    const kunciNorm = data.jawabanBenar.trim().toLowerCase();
    if (kunciNorm !== "benar" && kunciNorm !== "salah") {
      throw new AppError(
        "Kunci jawaban soal benar/salah harus berupa 'benar' atau 'salah'",
        400,
      );
    }
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
  const sekolahId = req.user?.sekolahId;
  const normRole = normalizeRole(req.user?.role);
  const isSuper = isSuperAdmin(req.user?.role);
  const userId = req.user?.userId;

  const asesmen = await prisma.asesmen.findFirst({
    where: {
      id: ujianId,
      dihapusPada: null,
      ...(!isSuper && { kelasMapel: { kelas: { sekolahId } } }),
    },
    include: {
      kelasMapel: { include: { kelas: true } },
    },
  });

  if (!asesmen) {
    throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
  }

  let showKunci = false;
  if (isSuper || normRole === "guru" || normRole === "admin_sekolah") {
    if (isSuper || (asesmen.kelasMapel?.kelas?.sekolahId && asesmen.kelasMapel.kelas.sekolahId === sekolahId)) {
      showKunci = true;
    }
  } else if (normRole === "siswa" && userId) {
    const now = new Date();
    const isWaktuBerakhir = asesmen.waktuSelesai ? now > new Date(asesmen.waktuSelesai) : false;
    if (isWaktuBerakhir) {
      const percobaan = await prisma.percobaanAsesmen.findFirst({
        where: {
          asesmenId: asesmen.id,
          siswaId: userId,
          status: { in: ["selesai", "dinilai"] },
        },
      });
      if (percobaan) {
        showKunci = true;
      }
    }
  }

  const soal = await prisma.soalAsesmen.findMany({
    where: {
      asesmenId: ujianId,
      dihapusPada: null,
      ...(!isSuper && { asesmen: { kelasMapel: { kelas: { sekolahId } } } }),
    },
    select: {
      id: true,
      asesmenId: true,
      teksSoal: true,
      jenisSoal: true,
      pilihan: true,
      poin: true,
      nomorUrut: true,
      dibuatPada: true,
      diperbaruiPada: true,
      ...(showKunci && { kunciJawaban: true }),
    },
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
  const sekolahId = req.user?.sekolahId;
  const normRole = normalizeRole(req.user?.role);
  const isSuper = isSuperAdmin(req.user?.role);
  const userId = req.user?.userId;

  const soal = await prisma.soalAsesmen.findFirst({
    where: {
      id,
      dihapusPada: null,
      ...(!isSuper && { asesmen: { kelasMapel: { kelas: { sekolahId } } } }),
    },
    include: {
      asesmen: {
        include: {
          kelasMapel: { include: { kelas: true } },
        },
      },
    },
  });

  if (!soal) {
    throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
  }

  let showKunci = false;
  if (isSuper || normRole === "guru" || normRole === "admin_sekolah") {
    if (isSuper || (soal.asesmen?.kelasMapel?.kelas?.sekolahId && soal.asesmen.kelasMapel.kelas.sekolahId === sekolahId)) {
      showKunci = true;
    }
  } else if (normRole === "siswa" && userId) {
    const now = new Date();
    const isWaktuBerakhir = soal.asesmen?.waktuSelesai ? now > new Date(soal.asesmen.waktuSelesai) : false;
    if (isWaktuBerakhir) {
      const percobaan = await prisma.percobaanAsesmen.findFirst({
        where: {
          asesmenId: soal.asesmenId,
          siswaId: userId,
          status: { in: ["selesai", "dinilai"] },
        },
      });
      if (percobaan) {
        showKunci = true;
      }
    }
  }

  const soalData: any = {
    id: soal.id,
    asesmenId: soal.asesmenId,
    teksSoal: soal.teksSoal,
    jenisSoal: soal.jenisSoal,
    pilihan: soal.pilihan,
    poin: soal.poin,
    nomorUrut: soal.nomorUrut,
    dibuatPada: soal.dibuatPada,
    diperbaruiPada: soal.diperbaruiPada,
    ...(showKunci && { kunciJawaban: soal.kunciJawaban }),
  };

  res.status(200).json({
    success: true,
    message: "Soal ujian berhasil diambil",
    data: soalData,
  });
};

export const updateSoal = async (req: AuthRequest, res: Response) => {
  const id = req.params.id as string;
  const sekolahId = req.user?.sekolahId;
  const isSuper = isSuperAdmin(req.user?.role);
  const data = updateSoalSchema.parse(req.body);

  const existing = await prisma.soalAsesmen.findFirst({
    where: {
      id,
      dihapusPada: null,
      ...(!isSuper && { asesmen: { kelasMapel: { kelas: { sekolahId } } } }),
    },
  });

  if (!existing) {
    throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
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
  const sekolahId = req.user?.sekolahId;
  const isSuper = isSuperAdmin(req.user?.role);

  const existing = await prisma.soalAsesmen.findFirst({
    where: {
      id,
      dihapusPada: null,
      ...(!isSuper && { asesmen: { kelasMapel: { kelas: { sekolahId } } } }),
    },
  });

  if (!existing) {
    throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
  }

  await prisma.soalAsesmen.delete({ where: { id } });

  res.status(200).json({
    success: true,
    message: "Soal ujian berhasil dihapus",
  });
};
