import { Response, NextFunction } from "express";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
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
import { catatAuditLog } from "../utils/auditLog";

const hariIniWib = () => new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

const waktuBertabrakan = (mulaiA: string, selesaiA: string, mulaiB?: string | null, selesaiB?: string | null) => {
  if (!mulaiB || !selesaiB) return false;
  return mulaiA < selesaiB && mulaiB < selesaiA;
};

export const getSesiKonseling = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 401);

    const actorRole = normalizeRole(req.user?.role);
    const where: any = { sekolahId, dihapusPada: null };
    if (actorRole === "siswa") where.siswaId = req.user?.userId;

    const status = req.query.status;
    if (typeof status === "string" && status) where.status = status;

    const data = await prisma.sesiKonseling.findMany({
      where,
      include: { siswa: { select: { id: true, namaLengkap: true, nis: true, nisn: true } }, konselor: { select: { id: true, namaLengkap: true, nip: true } } },
      orderBy: { tanggal: "desc" },
    });

    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getSesiKonselingById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 401);

    const data = await prisma.sesiKonseling.findFirst({ where: { id, sekolahId, dihapusPada: null }, include: { siswa: true, konselor: true } });
    if (!data) throw new AppError("Sesi konseling tidak ditemukan", 404);

    const actorRole = normalizeRole(req.user?.role);
    if (actorRole === "siswa" && data.siswaId !== req.user?.userId) throw new AppError("Akses ditolak", 403);

    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const ajukanSesiKonseling = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const siswaId = req.user?.userId;
    if (!sekolahId || !siswaId) throw new AppError("Sekolah tidak ditemukan", 401);
    if (normalizeRole(req.user?.role) !== "siswa") throw new AppError("Hanya siswa yang dapat mengajukan sesi konseling", 403);

    const validated = ajukanSesiKonselingSchema.parse(req.body);
    const tanggalStr = validated.tanggal;
    const mulai = validated.waktuMulai;
    const selesai = validated.waktuSelesai;
    const topikStr = validated.topik;
    const masalah = validated.masalah;
    const konselorId = validated.konselorId;

    if (tanggalStr < hariIniWib()) throw new AppError("Tanggal pengajuan tidak boleh di masa lalu", 400);

    const data = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`konseling_siswa:${sekolahId}:${siswaId}:${tanggalStr}`}))`;

      if (konselorId) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`konseling_konselor:${sekolahId}:${konselorId}:${tanggalStr}`}))`;

        const konselor = await tx.pengguna.findFirst({
          where: { id: String(konselorId), sekolahId, dihapusPada: null, status: "aktif" },
          select: { id: true, peran: { select: { nama: true } } },
        });

        if (!konselor || normalizeRole(konselor.peran?.nama) === "siswa") throw new AppError("Konselor tidak ditemukan", 404);

        const sesiKonselor = await tx.sesiKonseling.findMany({
          where: { sekolahId, konselorId: String(konselorId), tanggal: new Date(tanggalStr), dihapusPada: null, status: { in: ["diajukan", "dijadwalkan", "berlangsung"] } },
          select: { waktuMulai: true, waktuSelesai: true },
        });

        if (sesiKonselor.some((s) => waktuBertabrakan(mulai, selesai, s.waktuMulai, s.waktuSelesai))) {
          throw new AppError("Konselor sudah memiliki jadwal konseling pada jam tersebut", 409);
        }
      }

      const sesiSiswa = await tx.sesiKonseling.findMany({
        where: { sekolahId, siswaId, tanggal: new Date(tanggalStr), dihapusPada: null, status: { in: ["diajukan", "dijadwalkan", "berlangsung"] } },
        select: { waktuMulai: true, waktuSelesai: true },
      });

      if (sesiSiswa.some((s) => waktuBertabrakan(mulai, selesai, s.waktuMulai, s.waktuSelesai))) {
        throw new AppError("Anda sudah memiliki pengajuan atau sesi pada jam tersebut", 409);
      }

      return await tx.sesiKonseling.create({
        data: {
          sekolahId, siswaId, konselorId: konselorId ? String(konselorId) : null, tanggal: new Date(tanggalStr), waktuMulai: mulai, waktuSelesai: selesai, topik: topikStr, masalah: masalah ? String(masalah) : null, status: "diajukan", dibuatOleh: siswaId,
        },
        include: { konselor: { select: { id: true, namaLengkap: true } } },
      });
    });

    try {
      await prisma.notifikasi.create({
        data: {
          penggunaId: siswaId,
          pengirimId: null,
          judul: "Pengajuan Konseling Terkirim",
          isi: `Pengajuan sesi konseling Anda pada tanggal ${validated.tanggal} pukul ${validated.waktuMulai} berhasil dikirim dan sedang menunggu konfirmasi guru BK.`,
          tipe: "info",
          kategori: "bk_konseling",
          targetUrl: `/bk/konseling/${data.id}`,
        },
      });
    } catch (notifErr) {
      console.error("[NOTIFIKASI BK] Gagal membuat notifikasi pengajuan konseling:", notifErr);
    }

    return res.status(201).json({
      success: true,
      message: "Pengajuan sesi konseling berhasil dikirim",
      data,
    });
    return res.status(201).json({ success: true, message: "Pengajuan sesi konseling berhasil dikirim", data });
  } catch (error) {
    next(error);
  }
};

export const putuskanPengajuanKonseling = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const userId = req.user?.userId;
    const id = String(req.params.id);
    if (!sekolahId || !userId) throw new AppError("Sekolah tidak ditemukan", 401);
    if (normalizeRole(req.user?.role) === "siswa") throw new AppError("Siswa tidak dapat memproses pengajuan konseling", 403);

    const { keputusan, konselorId, catatan } = req.body;
    if (keputusan !== "setujui" && keputusan !== "tolak") throw new AppError("keputusan harus berisi setujui atau tolak", 400);

    const existing = await prisma.sesiKonseling.findFirst({ where: { id, sekolahId, dihapusPada: null } });
    if (!existing) throw new AppError("Pengajuan konseling tidak ditemukan", 404);
    if (existing.status !== "diajukan") throw new AppError("Pengajuan ini sudah diproses", 400);

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

      try {
        await prisma.notifikasi.create({
          data: {
            penggunaId: existing.siswaId,
            pengirimId: userId,
            judul: "Pengajuan Konseling Ditolak",
            isi: `Pengajuan sesi konseling Anda untuk tanggal ${new Date(existing.tanggal).toLocaleDateString("id-ID")} ditolak. Alasan: ${catatan}`,
            tipe: "info",
            kategori: "bk_konseling",
            targetUrl: `/bk/konseling/${id}`,
          },
        });
      } catch (notifErr) {
        console.error("[NOTIFIKASI BK] Gagal mengirim notifikasi penolakan konseling:", notifErr);
      }

      return res.json({
        success: true,
        message: "Pengajuan konseling ditolak",
        data,
      });
      if (!catatan || !String(catatan).trim()) throw new AppError("Alasan penolakan wajib diisi pada catatan", 400);
      const data = await prisma.sesiKonseling.update({ where: { id }, data: { status: "ditolak", catatan: String(catatan).trim(), diperbaruiOleh: userId } });
      await catatAuditLog(req, "REJECT_KONSELING", "bk", id, { status: existing.status }, { status: "ditolak" });
      return res.json({ success: true, message: "Pengajuan konseling ditolak", data });
    }

    if (!existing.waktuMulai || !existing.waktuSelesai) throw new AppError("Pengajuan tidak memiliki jam sesi yang valid", 400);

    const konselorFinal = konselorId ? String(konselorId) : existing.konselorId ?? userId;
    const konselor = await prisma.pengguna.findFirst({ where: { id: konselorFinal, sekolahId, dihapusPada: null, status: "aktif" }, select: { id: true, peran: { select: { nama: true } } } });
    if (!konselor || normalizeRole(konselor.peran?.nama) === "siswa") throw new AppError("Konselor tidak ditemukan", 404);

    const sesiKonselor = await prisma.sesiKonseling.findMany({ where: { sekolahId, konselorId: konselorFinal, tanggal: existing.tanggal, dihapusPada: null, status: "dijadwalkan", id: { not: id } }, select: { waktuMulai: true, waktuSelesai: true } });
    if (sesiKonselor.some((s) => waktuBertabrakan(existing.waktuMulai as string, existing.waktuSelesai as string, s.waktuMulai, s.waktuSelesai))) throw new AppError("Konselor sudah memiliki sesi pada jam tersebut", 409);

    const data = await prisma.sesiKonseling.update({
      where: { id },
      data: { status: "dijadwalkan", konselorId: konselorFinal, catatan: catatan ? String(catatan).trim() : undefined, diperbaruiOleh: userId },
      include: { siswa: { select: { id: true, namaLengkap: true } }, konselor: { select: { id: true, namaLengkap: true } } },
    });

    try {
      await prisma.notifikasi.create({
        data: {
          penggunaId: existing.siswaId,
          pengirimId: userId,
          judul: "Pengajuan Konseling Disetujui",
          isi: `Pengajuan sesi konseling Anda telah disetujui untuk tanggal ${new Date(existing.tanggal).toLocaleDateString("id-ID")} pukul ${existing.waktuMulai} - ${existing.waktuSelesai}.`,
          tipe: "info",
          kategori: "bk_konseling",
          targetUrl: `/bk/konseling/${id}`,
        },
      });
    } catch (notifErr) {
      console.error("[NOTIFIKASI BK] Gagal mengirim notifikasi persetujuan konseling:", notifErr);
    }

    return res.json({
      success: true,
      message: "Pengajuan konseling disetujui",
      data,
    });
    await catatAuditLog(req, "APPROVE_KONSELING", "bk", id, { status: existing.status }, { status: "dijadwalkan" });

    return res.json({ success: true, message: "Pengajuan konseling disetujui", data });
  } catch (error) {
    next(error);
  }
};

export const batalkanPengajuanKonseling = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const siswaId = req.user?.userId;
    const id = String(req.params.id);
    if (!sekolahId || !siswaId) throw new AppError("Sekolah tidak ditemukan", 401);
    if (normalizeRole(req.user?.role) !== "siswa") throw new AppError("Hanya siswa yang dapat membatalkan pengajuannya", 403);

    const existing = await prisma.sesiKonseling.findFirst({ where: { id, sekolahId, siswaId, dihapusPada: null } });
    if (!existing) throw new AppError("Pengajuan konseling tidak ditemukan", 404);
    if (existing.status !== "diajukan") throw new AppError("Hanya pengajuan yang masih menunggu yang dapat dibatalkan", 400);

    const data = await prisma.sesiKonseling.update({ where: { id }, data: { status: "dibatalkan", diperbaruiOleh: siswaId } });
    return res.json({ success: true, message: "Pengajuan konseling dibatalkan", data });
  } catch (error) {
    next(error);
  }
};

export const createSesiKonseling = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const isSuper = isSuperAdmin(req.user?.role);
    const sekolahId = req.user?.sekolahId;
    if (!isSuper && !sekolahId) throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);

    const validated = createSesiKonselingSchema.parse(req.body);
    const { siswaId, konselorId, tanggal, waktuMulai, waktuSelesai, topik, masalah, hasil, tindakLanjut, status, catatan } = validated;

    const siswa = await prisma.pengguna.findFirst({ where: { id: siswaId, dihapusPada: null, ...(!isSuper ? { sekolahId } : {}) } });
    if (!siswa || !siswa.sekolahId) throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);

    const targetSekolahId = siswa.sekolahId;
    if (!isSuper && sekolahId && targetSekolahId !== sekolahId) throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);

    if (konselorId) {
      const konselor = await prisma.pengguna.findFirst({ where: { id: konselorId, sekolahId: targetSekolahId, dihapusPada: null } });
      if (!konselor) throw new AppError("Konselor tidak ditemukan", 404);
    }

    const data = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`konseling_siswa:${targetSekolahId}:${siswaId}:${tanggal}`}))`;
      if (konselorId) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`konseling_konselor:${targetSekolahId}:${konselorId}:${tanggal}`}))`;
      }

      return await tx.sesiKonseling.create({
        data: {
          sekolahId: targetSekolahId, siswaId, konselorId: konselorId || null, tanggal: new Date(tanggal), waktuMulai, waktuSelesai, topik, masalah: masalah || null, hasil: hasil || null, tindakLanjut: tindakLanjut || null, status: status || "dijadwalkan", catatan: catatan || null, dibuatOleh: req.user?.userId,
        },
      });
    });

    return res.status(201).json({ success: true, message: "Sesi konseling berhasil dibuat", data });
  } catch (error) {
    next(error);
  }
};

export const updateSesiKonseling = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const isSuper = isSuperAdmin(req.user?.role);
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);
    if (!isSuper && !sekolahId) throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);

    const existing = await prisma.sesiKonseling.findFirst({ where: { id, dihapusPada: null, ...(!isSuper ? { sekolahId } : {}) } });
    if (!existing) throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 404);

    const targetSekolahId = existing.sekolahId;
    const validated = updateSesiKonselingSchema.parse(req.body);
    const { konselorId, tanggal, waktuMulai, waktuSelesai, topik, masalah, hasil, tindakLanjut, status, catatan } = validated;

    if (konselorId && konselorId !== existing.konselorId) {
      const konselor = await prisma.pengguna.findFirst({ where: { id: konselorId, sekolahId: targetSekolahId, dihapusPada: null } });
      if (!konselor) throw new AppError("Konselor tidak ditemukan", 404);
    }

    const data = await prisma.sesiKonseling.update({
      where: { id },
      data: { konselorId: konselorId !== undefined ? konselorId : undefined, tanggal: tanggal ? new Date(tanggal) : undefined, waktuMulai, waktuSelesai, topik, masalah, hasil, tindakLanjut, status, catatan, diperbaruiOleh: req.user?.userId },
    });

    if (status && status !== existing.status) {
      try {
        const statusStr = String(status);
        let notifJudul = "Update Status Sesi Konseling";
        let notifIsi = `Status sesi konseling Anda telah diperbarui menjadi ${statusStr}.`;
        if (statusStr === "dijadwalkan" || statusStr === "disetujui") {
          notifJudul = "Sesi Konseling Disetujui / Dijadwalkan";
          notifIsi = `Sesi konseling Anda telah dijadwalkan pada ${new Date(data.tanggal).toLocaleDateString("id-ID")} pukul ${data.waktuMulai} - ${data.waktuSelesai}.`;
        } else if (statusStr === "ditolak" || statusStr === "dibatalkan") {
          notifJudul = "Sesi Konseling Dibatalkan / Ditolak";
          notifIsi = `Sesi konseling Anda pada ${new Date(data.tanggal).toLocaleDateString("id-ID")} telah dibatalkan.`;
        } else if (statusStr === "selesai") {
          notifJudul = "Sesi Konseling Selesai";
          notifIsi = `Sesi konseling Anda pada ${new Date(data.tanggal).toLocaleDateString("id-ID")} telah selesai.`;
        }

        await prisma.notifikasi.create({
          data: {
            penggunaId: existing.siswaId,
            pengirimId: req.user?.userId || null,
            judul: notifJudul,
            isi: notifIsi,
            tipe: "info",
            kategori: "bk_konseling",
            targetUrl: `/bk/konseling/${id}`,
          },
        });
      } catch (notifErr) {
        console.error("[NOTIFIKASI BK] Gagal membuat notifikasi update konseling:", notifErr);
      }
    }

    return res.json({
      success: true,
      message: "Sesi konseling berhasil diperbarui",
      data,
    });
    return res.json({ success: true, message: "Sesi konseling berhasil diperbarui", data });
  } catch (error) {
    next(error);
  }
};

export const deleteSesiKonseling = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 401);

    const existing = await prisma.sesiKonseling.findFirst({ where: { id, sekolahId, dihapusPada: null } });
    if (!existing) throw new AppError("Sesi konseling tidak ditemukan", 404);

    await prisma.sesiKonseling.update({ where: { id }, data: { dihapusPada: new Date(), dihapusOleh: req.user?.userId } });
    return res.json({ success: true, message: "Sesi konseling berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};

export const getKategoriPelanggaran = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 401);
    const data = await prisma.kategoriPelanggaran.findMany({ where: { sekolahId, dihapusPada: null }, orderBy: { nama: "asc" } });
    return res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createKategoriPelanggaran = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 401);

    const validated = createKategoriPelanggaranSchema.parse(req.body);

    const duplikat = await prisma.kategoriPelanggaran.findFirst({
      where: { sekolahId, nama: { equals: validated.nama, mode: "insensitive" }, dihapusPada: null },
    });

    if (duplikat) throw new AppError("Kategori pelanggaran dengan nama tersebut sudah ada", 400);

    const data = await prisma.kategoriPelanggaran.create({
      data: { sekolahId, nama: validated.nama, deskripsi: validated.deskripsi || null, poin: validated.poin, status: validated.status || "aktif", dibuatOleh: req.user?.userId },
    });
    
    await catatAuditLog(req, "CREATE_KATEGORI_PELANGGARAN", "bk", data.id, null, { nama: validated.nama, poin: validated.poin });

    return res.status(201).json({ success: true, message: "Kategori pelanggaran berhasil dibuat", data });
  } catch (error) {
    next(error);
  }
};

export const updateKategoriPelanggaran = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 401);

    const existing = await prisma.kategoriPelanggaran.findFirst({ where: { id, sekolahId, dihapusPada: null } });
    if (!existing) throw new AppError("Kategori pelanggaran tidak ditemukan", 404);

    const validated = updateKategoriPelanggaranSchema.parse(req.body);

    if (validated.nama && validated.nama.toLowerCase() !== existing.nama.toLowerCase()) {
      const duplikat = await prisma.kategoriPelanggaran.findFirst({
        where: { sekolahId, nama: { equals: validated.nama, mode: "insensitive" }, dihapusPada: null, id: { not: existing.id } },
      });
      if (duplikat) throw new AppError("Kategori pelanggaran dengan nama tersebut sudah ada", 400);
    }

    const data = await prisma.kategoriPelanggaran.update({
      where: { id },
      data: { nama: validated.nama !== undefined ? validated.nama : undefined, deskripsi: validated.deskripsi !== undefined ? validated.deskripsi : undefined, poin: validated.poin !== undefined ? validated.poin : undefined, status: validated.status !== undefined ? validated.status : undefined, diperbaruiOleh: req.user?.userId },
    });

    return res.json({ success: true, message: "Kategori pelanggaran berhasil diperbarui", data });
  } catch (error) {
    next(error);
  }
};

export const deleteKategoriPelanggaran = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 401);

    const existing = await prisma.kategoriPelanggaran.findFirst({ where: { id, sekolahId, dihapusPada: null } });
    if (!existing) throw new AppError("Kategori pelanggaran tidak ditemukan", 404);

    await prisma.kategoriPelanggaran.update({ where: { id }, data: { dihapusPada: new Date(), dihapusOleh: req.user?.userId } });
    return res.json({ success: true, message: "Kategori pelanggaran berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};

export const buildPelanggaranWhere = (req: AuthRequest) => {
  const sekolahId = req.user?.sekolahId;
  if (!sekolahId) {
    return { sekolahId: undefined, where: null };
  }

  const actorRole = normalizeRole(req.user?.role);
  const where: any = {
    sekolahId,
    dihapusPada: null,
  };

  if (actorRole === "siswa") {
    where.siswaId = req.user?.userId;
  } else if (req.query.siswaId) {
    where.siswaId = String(req.query.siswaId);
  }

  const kategoriId = (req.query.kategoriId || req.query.kategoriPelanggaranId) as string | undefined;
  if (kategoriId) {
    where.kategoriPelanggaranId = String(kategoriId);
  }

  const status = req.query.status as string | undefined;
  if (status) {
    where.status = String(status);
  }

  const tanggalMulai = (req.query.tanggalMulai || req.query.startDate) as string | undefined;
  const tanggalSelesai = (req.query.tanggalSelesai || req.query.endDate) as string | undefined;
  if (tanggalMulai || tanggalSelesai) {
    where.tanggal = {};
    if (tanggalMulai) {
      where.tanggal.gte = new Date(tanggalMulai);
    }
    if (tanggalSelesai) {
      const end = new Date(tanggalSelesai);
      if (tanggalSelesai.length <= 10) {
        end.setHours(23, 59, 59, 999);
      }
      where.tanggal.lte = end;
    }
  }

  const search = (req.query.search as string)?.trim();
  if (search) {
    where.OR = [
      {
        siswa: {
          namaLengkap: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        siswa: {
          nis: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        kategoriPelanggaran: {
          nama: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        kronologi: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  return { sekolahId, where };
};

export const getPelanggaranSiswa = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sekolahId, where } = buildPelanggaranWhere(req);
    if (!sekolahId || !where) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }
    const sekolahId = req.user?.sekolahId;
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 401);

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const actorRole = normalizeRole(req.user?.role);
    const where: any = { sekolahId, dihapusPada: null };
    if (actorRole === "siswa") where.siswaId = req.user?.userId;

    if (actorRole === "siswa") {
      where.siswaId = req.user?.userId;
    } else if (req.query.siswaId) {
      where.siswaId = String(req.query.siswaId);
    }

    const kategoriId = (req.query.kategoriId || req.query.kategoriPelanggaranId) as string | undefined;
    if (kategoriId) where.kategoriPelanggaranId = String(kategoriId);

    const status = req.query.status as string | undefined;
    if (status) where.status = String(status);

    const tanggalMulai = (req.query.tanggalMulai || req.query.startDate) as string | undefined;
    const tanggalSelesai = (req.query.tanggalSelesai || req.query.endDate) as string | undefined;
    if (tanggalMulai || tanggalSelesai) {
      where.tanggal = {};
      if (tanggalMulai) where.tanggal.gte = new Date(tanggalMulai);
      if (tanggalSelesai) {
        const end = new Date(tanggalSelesai);
        if (tanggalSelesai.length <= 10) end.setHours(23, 59, 59, 999);
        where.tanggal.lte = end;
      }
    }

    const search = (req.query.search as string)?.trim();
    if (search) {
      where.OR = [
        { siswa: { namaLengkap: { contains: search, mode: "insensitive" } } },
        { siswa: { nis: { contains: search, mode: "insensitive" } } },
        { kategoriPelanggaran: { nama: { contains: search, mode: "insensitive" } } },
        { kronologi: { contains: search, mode: "insensitive" } },
      ];
    }

    const [totalData, data] = await Promise.all([
      prisma.pelanggaranSiswa.count({ where }),
      prisma.pelanggaranSiswa.findMany({
        where, skip, take: limit,
        include: { siswa: { select: { id: true, namaLengkap: true, nis: true, nisn: true } }, kategoriPelanggaran: true },
        orderBy: { tanggal: "desc" },
      }),
    ]);

    const totalPages = totalData > 0 ? Math.ceil(totalData / limit) : 0;
    const hasNext = page < totalPages;
    const hasPrev = page > 1 && totalPages > 0;

    return res.status(200).json({
      success: true, message: "Berhasil mengambil data pelanggaran siswa", data,
      pagination: { totalData, totalPages, currentPage: page, limit, hasNext, hasPrev },
      meta: { page, limit, total: totalData, totalData, totalPages, hasNext, hasPrev },
      totalData, totalPages, currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

export const exportPelanggaranExcel = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const { sekolahId, where } = buildPelanggaranWhere(req);
    if (!sekolahId || !where) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
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

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "SmartSchool BK System";
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet("Daftar Pelanggaran");

    worksheet.columns = [
      { header: "No", key: "no", width: 6 },
      { header: "Tanggal", key: "tanggal", width: 14 },
      { header: "NIS", key: "nis", width: 15 },
      { header: "NISN", key: "nisn", width: 18 },
      { header: "Nama Siswa", key: "namaSiswa", width: 28 },
      { header: "Kategori Pelanggaran", key: "kategori", width: 25 },
      { header: "Poin", key: "poin", width: 8 },
      { header: "Status", key: "status", width: 14 },
      { header: "Kronologi", key: "kronologi", width: 35 },
      { header: "Tindak Lanjut", key: "tindakLanjut", width: 30 },
      { header: "Catatan", key: "catatan", width: 25 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A8A" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 24;

    data.forEach((item, index) => {
      const row = worksheet.addRow({
        no: index + 1,
        tanggal: item.tanggal ? new Date(item.tanggal).toISOString().slice(0, 10) : "-",
        nis: item.siswa?.nis || "-",
        nisn: item.siswa?.nisn || "-",
        namaSiswa: item.siswa?.namaLengkap || "-",
        kategori: item.kategoriPelanggaran?.nama || "-",
        poin: item.poin,
        status: item.status || "tercatat",
        kronologi: item.kronologi || "-",
        tindakLanjut: item.tindakLanjut || "-",
        catatan: item.catatan || "-",
      });

      row.alignment = { vertical: "middle" };
      row.getCell("no").alignment = { horizontal: "center" };
      row.getCell("tanggal").alignment = { horizontal: "center" };
      row.getCell("nis").alignment = { horizontal: "center" };
      row.getCell("poin").alignment = { horizontal: "center" };
      row.getCell("status").alignment = { horizontal: "center" };
    });

    const filename = `daftar_pelanggaran_${Date.now()}.xlsx`;
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const exportPelanggaranPdf = async (
  req: AuthRequest,
  res: Response,
  next?: NextFunction
) => {
  try {
    const { sekolahId, where } = buildPelanggaranWhere(req);
    if (!sekolahId || !where) {
      return res.status(401).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const data = await prisma.pelanggaranSiswa.findMany({
      where,
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
      orderBy: {
        tanggal: "desc",
      },
    });

    const filename = `daftar_pelanggaran_${Date.now()}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });
    doc.pipe(res);

    doc.fontSize(16).font("Helvetica-Bold").text("LAPORAN DAFTAR PELANGGARAN SISWA", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica").text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID")}`, { align: "center" });
    doc.moveDown(1);

    const tableTop = doc.y;
    const colX = {
      no: 30,
      tanggal: 60,
      nis: 140,
      nama: 220,
      kategori: 400,
      poin: 580,
      status: 630,
      tindakLanjut: 700,
    };

    doc.rect(30, tableTop, 780, 20).fill("#1E3A8A");
    doc.fillColor("#FFFFFF").fontSize(9).font("Helvetica-Bold");
    doc.text("No", colX.no + 5, tableTop + 5);
    doc.text("Tanggal", colX.tanggal, tableTop + 5);
    doc.text("NIS", colX.nis, tableTop + 5);
    doc.text("Nama Siswa", colX.nama, tableTop + 5);
    doc.text("Pelanggaran", colX.kategori, tableTop + 5);
    doc.text("Poin", colX.poin, tableTop + 5);
    doc.text("Status", colX.status, tableTop + 5);
    doc.text("Tindak Lanjut", colX.tindakLanjut, tableTop + 5);

    let currentY = tableTop + 24;
    doc.fillColor("#000000").font("Helvetica").fontSize(8);

    data.forEach((item, index) => {
      if (currentY > 530) {
        doc.addPage({ margin: 30, size: "A4", layout: "landscape" });
        currentY = 40;
        doc.rect(30, currentY, 780, 20).fill("#1E3A8A");
        doc.fillColor("#FFFFFF").fontSize(9).font("Helvetica-Bold");
        doc.text("No", colX.no + 5, currentY + 5);
        doc.text("Tanggal", colX.tanggal, currentY + 5);
        doc.text("NIS", colX.nis, currentY + 5);
        doc.text("Nama Siswa", colX.nama, currentY + 5);
        doc.text("Pelanggaran", colX.kategori, currentY + 5);
        doc.text("Poin", colX.poin, currentY + 5);
        doc.text("Status", colX.status, currentY + 5);
        doc.text("Tindak Lanjut", colX.tindakLanjut, currentY + 5);
        currentY += 24;
        doc.fillColor("#000000").font("Helvetica").fontSize(8);
      }

      if (index % 2 === 1) {
        doc.rect(30, currentY - 2, 780, 16).fill("#F3F4F6");
        doc.fillColor("#000000");
      }

      const tglStr = item.tanggal ? new Date(item.tanggal).toISOString().slice(0, 10) : "-";
      doc.text(String(index + 1), colX.no + 5, currentY, { width: 25 });
      doc.text(tglStr, colX.tanggal, currentY, { width: 75 });
      doc.text(item.siswa?.nis || "-", colX.nis, currentY, { width: 75 });
      doc.text((item.siswa?.namaLengkap || "-").slice(0, 32), colX.nama, currentY, { width: 175 });
      doc.text((item.kategoriPelanggaran?.nama || "-").slice(0, 32), colX.kategori, currentY, { width: 175 });
      doc.text(String(item.poin), colX.poin, currentY, { width: 45 });
      doc.text(item.status || "tercatat", colX.status, currentY, { width: 65 });
      doc.text((item.tindakLanjut || "-").slice(0, 20), colX.tindakLanjut, currentY, { width: 105 });

      currentY += 16;
    });

    doc.end();
  } catch (error) {
    if (next) return next(error);
    throw error;
  }
};

export const createPelanggaranSiswa = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 401);

    const validated = createPelanggaranSiswaSchema.parse(req.body);
    const { siswaId, kategoriPelanggaranId, tanggal, kronologi, poin, status, tindakLanjut, catatan } = validated;

    const siswa = await prisma.pengguna.findFirst({ where: { id: siswaId, sekolahId, dihapusPada: null } });
    if (!siswa) throw new AppError("Siswa tidak ditemukan", 404);

    const kategori = await prisma.kategoriPelanggaran.findFirst({ where: { id: kategoriPelanggaranId, sekolahId, dihapusPada: null } });
    if (!kategori) throw new AppError("Kategori pelanggaran tidak ditemukan", 404);

    const data = await prisma.pelanggaranSiswa.create({
      data: { sekolahId, siswaId, kategoriPelanggaranId, tanggal: new Date(tanggal), kronologi: kronologi || null, poin: poin !== undefined ? Number(poin) : kategori.poin, status: status || "tercatat", tindakLanjut: tindakLanjut || null, catatan: catatan || null, dibuatOleh: req.user?.userId },
      include: { siswa: { select: { id: true, namaLengkap: true, nis: true } }, kategoriPelanggaran: true },
    });

    try {
      await prisma.notifikasi.create({
        data: {
          penggunaId: data.siswaId,
          pengirimId: req.user?.userId || null,
          judul: "Catatan Pelanggaran Baru",
          isi: `Pelanggaran "${kategori.nama}" telah dicatat pada tanggal ${new Date(tanggal).toLocaleDateString("id-ID")} dengan ${data.poin} poin.`,
          tipe: "warning",
          kategori: "bk_pelanggaran",
          targetUrl: "/bk/pelanggaran",
        },
      });
    } catch (notifErr) {
      console.error("[NOTIFIKASI BK] Gagal membuat notifikasi pelanggaran:", notifErr);
    }

    return res.status(201).json({
      success: true,
      message: "Pelanggaran siswa berhasil dicatat",
      data,
    });
    await catatAuditLog(req, "CREATE_PELANGGARAN", "bk", data.id, null, { siswaId, kategoriPelanggaranId, poin: data.poin });

    return res.status(201).json({ success: true, message: "Pelanggaran siswa berhasil dicatat", data });
  } catch (error) {
    next(error);
  }
};

export const updatePelanggaranSiswa = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 401);

    const existing = await prisma.pelanggaranSiswa.findFirst({ where: { id, sekolahId, dihapusPada: null } });
    if (!existing) throw new AppError("Data pelanggaran tidak ditemukan", 404);

    const validated = updatePelanggaranSiswaSchema.parse(req.body);
    const { kategoriPelanggaranId, tanggal, kronologi, poin, status, tindakLanjut, catatan } = validated;

    const data = await prisma.pelanggaranSiswa.update({
      where: { id },
      data: { kategoriPelanggaranId, tanggal: tanggal ? new Date(tanggal) : undefined, kronologi: kronologi !== undefined ? (kronologi || null) : undefined, poin: poin !== undefined ? Number(poin) : undefined, status, tindakLanjut: tindakLanjut !== undefined ? (tindakLanjut || null) : undefined, catatan: catatan !== undefined ? (catatan || null) : undefined, diperbaruiOleh: req.user?.userId },
    });

    return res.json({ success: true, message: "Data pelanggaran berhasil diperbarui", data });
  } catch (error) {
    next(error);
  }
};

export const deletePelanggaranSiswa = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sekolahId = req.user?.sekolahId;
    const id = String(req.params.id);
    if (!sekolahId) throw new AppError("Sekolah tidak ditemukan", 401);

    const existing = await prisma.pelanggaranSiswa.findFirst({ where: { id, sekolahId, dihapusPada: null } });
    if (!existing) throw new AppError("Data pelanggaran tidak ditemukan", 404);

    await prisma.pelanggaranSiswa.update({ where: { id }, data: { dihapusPada: new Date(), dihapusOleh: req.user?.userId } });

    await catatAuditLog(req, "DELETE_PELANGGARAN", "bk", id, existing, { status: "dihapus" });

    return res.json({ success: true, message: "Data pelanggaran berhasil dihapus" });
  } catch (error) {
    next(error);
  }
};