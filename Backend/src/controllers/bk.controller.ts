import { Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { isSuperAdmin, normalizeRole } from "../utils/rbac";
import { AppError } from "../utils/appError";
import {
  ajukanSesiKonselingSchema,
  createSesiKonselingSchema,
  updateSesiKonselingSchema,
  createKategoriPelanggaranSchema,
  updateKategoriPelanggaranSchema,
  createPelanggaranSiswaSchema,
  updatePelanggaranSiswaSchema,
} from "../validations/bk.validation";

const WAKTU_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const TANGGAL_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const hariIniWib = () =>
  new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

const waktuBertabrakan = (
  mulaiA: string,
  selesaiA: string,
  mulaiB?: string | null,
  selesaiB?: string | null
) => {
  if (!mulaiB || !selesaiB) return false;
  return mulaiA < selesaiB && mulaiB < selesaiA;
};

export const getSesiKonseling = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const actorRole = normalizeRole(req.user?.role);
    const where: any = {
      sekolahId,
      dihapusPada: null,
    };

    if (actorRole === "siswa") {
      where.siswaId = req.user?.userId;
    }

    const status = req.query.status;
    if (typeof status === "string" && status) {
      where.status = status;
    }

    const data = await prisma.sesiKonseling.findMany({
      where,
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nis: true,
            nisn: true,
          },
        },
        konselor: {
          select: {
            id: true,
            namaLengkap: true,
            nip: true,
          },
        },
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const getSesiKonselingById = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const data = await prisma.sesiKonseling.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
      include: {
        siswa: true,
        konselor: true,
      },
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Sesi konseling tidak ditemukan",
      });
    }

    const actorRole = normalizeRole(req.user?.role);
    if (actorRole === "siswa" && data.siswaId !== req.user?.userId) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak: Anda hanya dapat melihat sesi konseling Anda sendiri",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const ajukanSesiKonseling = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const siswaId = req.user?.userId;

    if (!sekolahId || !siswaId) {
      throw new AppError("Sekolah tidak ditemukan", 401);
    }

    if (normalizeRole(req.user?.role) !== "siswa") {
      throw new AppError("Hanya siswa yang dapat mengajukan sesi konseling", 403);
    }

    const validated = ajukanSesiKonselingSchema.parse(req.body);
    const tanggalStr = validated.tanggal;
    const mulai = validated.waktuMulai;
    const selesai = validated.waktuSelesai;
    const topikStr = validated.topik;
    const masalah = validated.masalah;
    const konselorId = validated.konselorId;

    if (tanggalStr < hariIniWib()) {
      throw new AppError("Tanggal pengajuan tidak boleh di masa lalu", 400);
    }

    const data = await prisma.$transaction(async (tx) => {
      // Advisory lock pada level transaksi per siswa dan per konselor untuk mencegah race condition conflict
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`konseling_siswa:${sekolahId}:${siswaId}:${tanggalStr}`}))`;

      if (konselorId) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`konseling_konselor:${sekolahId}:${konselorId}:${tanggalStr}`}))`;

        const konselor = await tx.pengguna.findFirst({
          where: {
            id: String(konselorId),
            sekolahId,
            dihapusPada: null,
            status: "aktif",
          },
          select: {
            id: true,
            peran: { select: { nama: true } },
          },
        });

        if (!konselor || normalizeRole(konselor.peran?.nama) === "siswa") {
          throw new AppError("Konselor tidak ditemukan", 404);
        }

        const sesiKonselor = await tx.sesiKonseling.findMany({
          where: {
            sekolahId,
            konselorId: String(konselorId),
            tanggal: new Date(tanggalStr),
            dihapusPada: null,
            status: { in: ["diajukan", "dijadwalkan", "berlangsung"] },
          },
          select: {
            waktuMulai: true,
            waktuSelesai: true,
          },
        });

        if (
          sesiKonselor.some((s) =>
            waktuBertabrakan(mulai, selesai, s.waktuMulai, s.waktuSelesai)
          )
        ) {
          throw new AppError(
            "Konselor sudah memiliki jadwal konseling pada jam tersebut",
            409
          );
        }
      }

      const sesiSiswa = await tx.sesiKonseling.findMany({
        where: {
          sekolahId,
          siswaId,
          tanggal: new Date(tanggalStr),
          dihapusPada: null,
          status: { in: ["diajukan", "dijadwalkan", "berlangsung"] },
        },
        select: {
          waktuMulai: true,
          waktuSelesai: true,
        },
      });

      if (
        sesiSiswa.some((s) =>
          waktuBertabrakan(mulai, selesai, s.waktuMulai, s.waktuSelesai)
        )
      ) {
        throw new AppError(
          "Anda sudah memiliki pengajuan atau sesi pada jam tersebut",
          409
        );
      }

      return await tx.sesiKonseling.create({
        data: {
          sekolahId,
          siswaId,
          konselorId: konselorId ? String(konselorId) : null,
          tanggal: new Date(tanggalStr),
          waktuMulai: mulai,
          waktuSelesai: selesai,
          topik: topikStr,
          masalah: masalah ? String(masalah) : null,
          status: "diajukan",
          dibuatOleh: siswaId,
        },
        include: {
          konselor: {
            select: {
              id: true,
              namaLengkap: true,
            },
          },
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Pengajuan sesi konseling berhasil dikirim",
      data,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const putuskanPengajuanKonseling = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const userId = req.user?.userId;
    const id = String(req.params.id);

    if (!sekolahId || !userId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    if (normalizeRole(req.user?.role) === "siswa") {
      return res.status(403).json({
        success: false,
        message: "Siswa tidak dapat memproses pengajuan konseling",
      });
    }

    const { keputusan, konselorId, catatan } = req.body;

    if (keputusan !== "setujui" && keputusan !== "tolak") {
      return res.status(400).json({
        success: false,
        message: "keputusan harus berisi setujui atau tolak",
      });
    }

    const existing = await prisma.sesiKonseling.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Pengajuan konseling tidak ditemukan",
      });
    }

    if (existing.status !== "diajukan") {
      return res.status(400).json({
        success: false,
        message: "Pengajuan ini sudah diproses",
      });
    }

    if (keputusan === "tolak") {
      if (!catatan || !String(catatan).trim()) {
        return res.status(400).json({
          success: false,
          message: "Alasan penolakan wajib diisi pada catatan",
        });
      }

      const data = await prisma.sesiKonseling.update({
        where: { id },
        data: {
          status: "ditolak",
          catatan: String(catatan).trim(),
          diperbaruiOleh: userId,
        },
      });

      return res.json({
        success: true,
        message: "Pengajuan konseling ditolak",
        data,
      });
    }

    if (!existing.waktuMulai || !existing.waktuSelesai) {
      return res.status(400).json({
        success: false,
        message: "Pengajuan tidak memiliki jam sesi yang valid",
      });
    }

    const konselorFinal = konselorId
      ? String(konselorId)
      : existing.konselorId ?? userId;

    const konselor = await prisma.pengguna.findFirst({
      where: {
        id: konselorFinal,
        sekolahId,
        dihapusPada: null,
        status: "aktif",
      },
      select: {
        id: true,
        peran: { select: { nama: true } },
      },
    });

    if (!konselor || normalizeRole(konselor.peran?.nama) === "siswa") {
      return res.status(404).json({
        success: false,
        message: "Konselor tidak ditemukan",
      });
    }

    const sesiKonselor = await prisma.sesiKonseling.findMany({
      where: {
        sekolahId,
        konselorId: konselorFinal,
        tanggal: existing.tanggal,
        dihapusPada: null,
        status: "dijadwalkan",
        id: { not: id },
      },
      select: {
        waktuMulai: true,
        waktuSelesai: true,
      },
    });

    if (
      sesiKonselor.some((s) =>
        waktuBertabrakan(
          existing.waktuMulai as string,
          existing.waktuSelesai as string,
          s.waktuMulai,
          s.waktuSelesai
        )
      )
    ) {
      return res.status(409).json({
        success: false,
        message: "Konselor sudah memiliki sesi pada jam tersebut",
      });
    }

    const data = await prisma.sesiKonseling.update({
      where: { id },
      data: {
        status: "dijadwalkan",
        konselorId: konselorFinal,
        catatan: catatan ? String(catatan).trim() : undefined,
        diperbaruiOleh: userId,
      },
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
        konselor: {
          select: {
            id: true,
            namaLengkap: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Pengajuan konseling disetujui",
      data,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const batalkanPengajuanKonseling = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const siswaId = req.user?.userId;
    const id = String(req.params.id);

    if (!sekolahId || !siswaId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    if (normalizeRole(req.user?.role) !== "siswa") {
      return res.status(403).json({
        success: false,
        message: "Hanya siswa yang dapat membatalkan pengajuannya",
      });
    }

    const existing = await prisma.sesiKonseling.findFirst({
      where: {
        id,
        sekolahId,
        siswaId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Pengajuan konseling tidak ditemukan",
      });
    }

    if (existing.status !== "diajukan") {
      return res.status(400).json({
        success: false,
        message: "Hanya pengajuan yang masih menunggu yang dapat dibatalkan",
      });
    }

    const data = await prisma.sesiKonseling.update({
      where: { id },
      data: {
        status: "dibatalkan",
        diperbaruiOleh: siswaId,
      },
    });

    return res.json({
      success: true,
      message: "Pengajuan konseling dibatalkan",
      data,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const createSesiKonseling = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const isSuper = isSuperAdmin(req.user?.role);
    const sekolahId = req.user?.sekolahId;

    if (!isSuper && !sekolahId) {
      throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
    }

    const validated = createSesiKonselingSchema.parse(req.body);
    const {
      siswaId,
      konselorId,
      tanggal,
      waktuMulai,
      waktuSelesai,
      topik,
      masalah,
      hasil,
      tindakLanjut,
      status,
      catatan,
    } = validated;

    const siswa = await prisma.pengguna.findFirst({
      where: {
        id: siswaId,
        dihapusPada: null,
        ...(!isSuper ? { sekolahId } : {}),
      },
    });

    if (!siswa || !siswa.sekolahId) {
      throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
    }

    const targetSekolahId = siswa.sekolahId;

    if (!isSuper && sekolahId && targetSekolahId !== sekolahId) {
      throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
    }

    if (konselorId) {
      const konselor = await prisma.pengguna.findFirst({
        where: {
          id: konselorId,
          sekolahId: targetSekolahId,
          dihapusPada: null,
        },
      });

      if (!konselor) {
        throw new AppError("Konselor tidak ditemukan", 404);
      }
    }

    const data = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`konseling_siswa:${targetSekolahId}:${siswaId}:${tanggal}`}))`;
      if (konselorId) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`konseling_konselor:${targetSekolahId}:${konselorId}:${tanggal}`}))`;
      }

      return await tx.sesiKonseling.create({
        data: {
          sekolahId: targetSekolahId,
          siswaId,
          konselorId: konselorId || null,
          tanggal: new Date(tanggal),
          waktuMulai,
          waktuSelesai,
          topik,
          masalah: masalah || null,
          hasil: hasil || null,
          tindakLanjut: tindakLanjut || null,
          status: status || "dijadwalkan",
          catatan: catatan || null,
          dibuatOleh: req.user?.userId,
        },
      });
    });

    return res.status(201).json({
      success: true,
      message: "Sesi konseling berhasil dibuat",
      data,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const updateSesiKonseling = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const isSuper = isSuperAdmin(req.user?.role);
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);

    if (!isSuper && !sekolahId) {
      throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
    }

    const existing = await prisma.sesiKonseling.findFirst({
      where: {
        id,
        dihapusPada: null,
        ...(!isSuper ? { sekolahId } : {}),
      },
    });

    if (!existing) {
      throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 404);
    }

    const targetSekolahId = existing.sekolahId;
    const validated = updateSesiKonselingSchema.parse(req.body);
    const {
      konselorId,
      tanggal,
      waktuMulai,
      waktuSelesai,
      topik,
      masalah,
      hasil,
      tindakLanjut,
      status,
      catatan,
    } = validated;

    if (konselorId && konselorId !== existing.konselorId) {
      const konselor = await prisma.pengguna.findFirst({
        where: {
          id: konselorId,
          sekolahId: targetSekolahId,
          dihapusPada: null,
        },
      });
      if (!konselor) {
        throw new AppError("Konselor tidak ditemukan", 404);
      }
    }

    const data = await prisma.sesiKonseling.update({
      where: { id },
      data: {
        konselorId: konselorId !== undefined ? konselorId : undefined,
        tanggal: tanggal ? new Date(tanggal) : undefined,
        waktuMulai,
        waktuSelesai,
        topik,
        masalah,
        hasil,
        tindakLanjut,
        status,
        catatan,
        diperbaruiOleh: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: "Sesi konseling berhasil diperbarui",
      data,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const deleteSesiKonseling = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const existing = await prisma.sesiKonseling.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Sesi konseling tidak ditemukan",
      });
    }

    await prisma.sesiKonseling.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: "Sesi konseling berhasil dihapus",
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const getKategoriPelanggaran = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const data = await prisma.kategoriPelanggaran.findMany({
      where: {
        sekolahId,
        dihapusPada: null,
      },
      orderBy: {
        nama: "asc",
      },
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const createKategoriPelanggaran = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const validated = createKategoriPelanggaranSchema.parse(req.body);

    const duplikat = await prisma.kategoriPelanggaran.findFirst({
      where: {
        sekolahId,
        nama: { equals: validated.nama, mode: "insensitive" },
        dihapusPada: null,
      },
    });

    if (duplikat) {
      throw new AppError("Kategori pelanggaran dengan nama tersebut sudah ada", 400);
    }

    const data = await prisma.kategoriPelanggaran.create({
      data: {
        sekolahId,
        nama: validated.nama,
        deskripsi: validated.deskripsi || null,
        poin: validated.poin,
        status: validated.status || "aktif",
        dibuatOleh: req.user?.userId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Kategori pelanggaran berhasil dibuat",
      data,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const updateKategoriPelanggaran = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const existing = await prisma.kategoriPelanggaran.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Kategori pelanggaran tidak ditemukan",
      });
    }

    const validated = updateKategoriPelanggaranSchema.parse(req.body);

    if (validated.nama && validated.nama.toLowerCase() !== existing.nama.toLowerCase()) {
      const duplikat = await prisma.kategoriPelanggaran.findFirst({
        where: {
          sekolahId,
          nama: { equals: validated.nama, mode: "insensitive" },
          dihapusPada: null,
          id: { not: existing.id },
        },
      });

      if (duplikat) {
        throw new AppError("Kategori pelanggaran dengan nama tersebut sudah ada", 400);
      }
    }

    const data = await prisma.kategoriPelanggaran.update({
      where: { id },
      data: {
        nama: validated.nama !== undefined ? validated.nama : undefined,
        deskripsi: validated.deskripsi !== undefined ? validated.deskripsi : undefined,
        poin: validated.poin !== undefined ? validated.poin : undefined,
        status: validated.status !== undefined ? validated.status : undefined,
        diperbaruiOleh: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: "Kategori pelanggaran berhasil diperbarui",
      data,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const deleteKategoriPelanggaran = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const existing = await prisma.kategoriPelanggaran.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Kategori pelanggaran tidak ditemukan",
      });
    }

    await prisma.kategoriPelanggaran.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: "Kategori pelanggaran berhasil dihapus",
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const getPelanggaranSiswa = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const actorRole = normalizeRole(req.user?.role);
    const where: any = {
      sekolahId,
      dihapusPada: null,
    };

    if (actorRole === "siswa") {
      where.siswaId = req.user?.userId;
    }

    const data = await prisma.pelanggaranSiswa.findMany({
      where,
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nis: true,
            nisn: true,
          },
        },
        kategoriPelanggaran: true,
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const createPelanggaranSiswa = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const validated = createPelanggaranSiswaSchema.parse(req.body);
    const {
      siswaId,
      kategoriPelanggaranId,
      tanggal,
      kronologi,
      poin,
      status,
      tindakLanjut,
      catatan,
    } = validated;

    const siswa = await prisma.pengguna.findFirst({
      where: {
        id: siswaId,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: "Siswa tidak ditemukan",
      });
    }

    const kategori = await prisma.kategoriPelanggaran.findFirst({
      where: {
        id: kategoriPelanggaranId,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!kategori) {
      return res.status(404).json({
        success: false,
        message: "Kategori pelanggaran tidak ditemukan",
      });
    }

    const data = await prisma.pelanggaranSiswa.create({
      data: {
        sekolahId,
        siswaId,
        kategoriPelanggaranId,
        tanggal: new Date(tanggal),
        kronologi: kronologi || null,
        poin: poin !== undefined ? Number(poin) : kategori.poin,
        status: status || "tercatat",
        tindakLanjut: tindakLanjut || null,
        catatan: catatan || null,
        dibuatOleh: req.user?.userId,
      },
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nis: true,
          },
        },
        kategoriPelanggaran: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Pelanggaran siswa berhasil dicatat",
      data,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const updatePelanggaranSiswa = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const existing = await prisma.pelanggaranSiswa.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Data pelanggaran tidak ditemukan",
      });
    }

    const validated = updatePelanggaranSiswaSchema.parse(req.body);
    const {
      kategoriPelanggaranId,
      tanggal,
      kronologi,
      poin,
      status,
      tindakLanjut,
      catatan,
    } = validated;

    const data = await prisma.pelanggaranSiswa.update({
      where: { id },
      data: {
        kategoriPelanggaranId,
        tanggal: tanggal ? new Date(tanggal) : undefined,
        kronologi: kronologi !== undefined ? (kronologi || null) : undefined,
        poin: poin !== undefined ? Number(poin) : undefined,
        status,
        tindakLanjut: tindakLanjut !== undefined ? (tindakLanjut || null) : undefined,
        catatan: catatan !== undefined ? (catatan || null) : undefined,
        diperbaruiOleh: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: "Data pelanggaran berhasil diperbarui",
      data,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const deletePelanggaranSiswa = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const existing = await prisma.pelanggaranSiswa.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Data pelanggaran tidak ditemukan",
      });
    }

    await prisma.pelanggaranSiswa.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: "Data pelanggaran berhasil dihapus",
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

// -------------------------------------------------------------
// ASESMEN MINAT BAKAT (BK)
// -------------------------------------------------------------

export const getAsesmenMinatBakat = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const actorRole = normalizeRole(req.user?.role);
    const where: any = {
      sekolahId,
      dihapusPada: null,
    };

    if (actorRole === "siswa") {
      where.siswaId = req.user?.userId;
    } else if (req.query.siswaId && typeof req.query.siswaId === "string") {
      where.siswaId = req.query.siswaId;
    }

    if (req.query.jenis && typeof req.query.jenis === "string") {
      where.jenis = req.query.jenis;
    }

    const data = await prisma.asesmenMinatBakat.findMany({
      where,
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nipd: true,
            nisn: true,
          },
        },
      },
      orderBy: { tanggal: "desc" },
    });

    const formatted = data.map((item) => ({
      ...item,
      siswa: item.siswa
        ? {
            id: item.siswa.id,
            namaLengkap: item.siswa.namaLengkap,
            nis: item.siswa.nipd,
            nisn: item.siswa.nisn,
          }
        : null,
    }));

    return res.json({
      success: true,
      message: "Berhasil mengambil data asesmen minat bakat",
      data: formatted,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const getAsesmenMinatBakatById = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = req.params.id as string;

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const where: any = {
      id,
      sekolahId,
      dihapusPada: null,
    };

    if (normalizeRole(req.user?.role) === "siswa") {
      where.siswaId = req.user?.userId;
    }

    const item = await prisma.asesmenMinatBakat.findFirst({
      where,
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nipd: true,
            nisn: true,
          },
        },
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Data asesmen minat bakat tidak ditemukan",
      });
    }

    const formatted = {
      ...item,
      siswa: (item as any).siswa
        ? {
            id: (item as any).siswa.id,
            namaLengkap: (item as any).siswa.namaLengkap,
            nis: (item as any).siswa.nipd,
            nisn: (item as any).siswa.nisn,
          }
        : null,
    };

    return res.json({
      success: true,
      message: "Berhasil mengambil detail asesmen",
      data: formatted,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const createAsesmenMinatBakat = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const {
      siswaId,
      tanggal,
      jenis,
      minat,
      bakat,
      hasil,
      rekomendasi,
      skor,
      status,
      catatan,
    } = req.body;

    if (!siswaId || !tanggal || !jenis) {
      return res.status(400).json({
        success: false,
        message: "siswaId, tanggal, dan jenis wajib diisi",
      });
    }

    const siswa = await prisma.pengguna.findFirst({
      where: {
        id: siswaId,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: "Siswa tidak ditemukan",
      });
    }

    const created = await prisma.asesmenMinatBakat.create({
      data: {
        sekolahId,
        siswaId,
        tanggal: new Date(tanggal),
        jenis,
        minat: minat || null,
        bakat: bakat || null,
        hasil: hasil || null,
        rekomendasi: rekomendasi || null,
        skor: skor !== undefined && skor !== null && skor !== "" ? Number(skor) : null,
        status: status || "selesai",
        catatan: catatan || null,
        dibuatOleh: req.user?.userId,
      },
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nipd: true,
            nisn: true,
          },
        },
      },
    });

    const formatted = {
      ...created,
      siswa: (created as any).siswa
        ? {
            id: (created as any).siswa.id,
            namaLengkap: (created as any).siswa.namaLengkap,
            nis: (created as any).siswa.nipd,
            nisn: (created as any).siswa.nisn,
          }
        : null,
    };

    return res.status(201).json({
      success: true,
      message: "Asesmen minat bakat berhasil dibuat",
      data: formatted,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const updateAsesmenMinatBakat = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = req.params.id as string;

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const existing = await prisma.asesmenMinatBakat.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Data asesmen tidak ditemukan",
      });
    }

    const {
      siswaId,
      tanggal,
      jenis,
      minat,
      bakat,
      hasil,
      rekomendasi,
      skor,
      status,
      catatan,
    } = req.body;

    const updateData: any = {
      diperbaruiOleh: req.user?.userId,
    };

    if (siswaId) updateData.siswaId = siswaId;
    if (tanggal) updateData.tanggal = new Date(tanggal);
    if (jenis) updateData.jenis = String(jenis);
    if (minat !== undefined) updateData.minat = minat || null;
    if (bakat !== undefined) updateData.bakat = bakat || null;
    if (hasil !== undefined) updateData.hasil = hasil || null;
    if (rekomendasi !== undefined) updateData.rekomendasi = rekomendasi || null;
    if (skor !== undefined) updateData.skor = skor !== null && skor !== "" ? Number(skor) : null;
    if (status) updateData.status = status;
    if (catatan !== undefined) updateData.catatan = catatan || null;

    const updated = await prisma.asesmenMinatBakat.update({
      where: { id },
      data: updateData,
      include: {
        siswa: {
          select: {
            id: true,
            namaLengkap: true,
            nipd: true,
            nisn: true,
          },
        },
      },
    });

    const formatted = {
      ...updated,
      siswa: (updated as any).siswa
        ? {
            id: (updated as any).siswa.id,
            namaLengkap: (updated as any).siswa.namaLengkap,
            nis: (updated as any).siswa.nipd,
            nisn: (updated as any).siswa.nisn,
          }
        : null,
    };

    return res.json({
      success: true,
      message: "Asesmen minat bakat berhasil diperbarui",
      data: formatted,
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const deleteAsesmenMinatBakat = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = req.params.id as string;

    if (!sekolahId) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const existing = await prisma.asesmenMinatBakat.findFirst({
      where: {
        id,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Data asesmen tidak ditemukan",
      });
    }

    await prisma.asesmenMinatBakat.update({
      where: { id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: req.user?.userId,
      },
    });

    return res.json({
      success: true,
      message: "Data asesmen berhasil dihapus",
    });
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};