import { Response } from "express";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import ExcelJS from "exceljs";

import { prisma } from "../config/db";
import {
  createAbsensiSchema,
  checkInShiftSchema,
  checkOutShiftSchema,
} from "../validations/absensi.validation";
import { AppError } from "../utils/appError";
import { AuthRequest } from "../middlewares/auth.middleware";
import { hitungJarakMeter } from "../utils/geo";
import { successResponse, paginatedResponse } from "../utils/responseFormatter";
import { NextFunction } from "express";
import { normalizeRole, canManageRole, isSuperAdmin } from "../utils/rbac";

export const registerFaceIdByAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { targetUserId } = req.body;
    const file = req.file;

    if (!targetUserId)
      throw new AppError("ID Pengguna (targetUserId) wajib diisi", 400);
    if (!file) throw new AppError("Foto wajah wajib diunggah", 400);

    const targetUser = await prisma.pengguna.findUnique({
      where: { id: targetUserId },
      include: {
        peran: { select: { nama: true } },
      },
    });
    if (!targetUser) {
      if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new AppError("Pengguna tidak ditemukan", 404);
    }

    const actorRole = normalizeRole(req.user?.role);
    const targetRole = normalizeRole(targetUser.peran?.nama);

    if (actorRole !== "super_admin") {
      if (
        !targetUser.sekolahId ||
        targetUser.sekolahId !== req.user?.sekolahId
      ) {
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        throw new AppError(
          "Akses ditolak: Pengguna berada di luar sekolah Anda",
          403,
          "FORBIDDEN",
        );
      }
      if (!canManageRole(actorRole, targetRole)) {
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
        throw new AppError(
          "Akses ditolak: Anda tidak dapat mengelola biometrik pengguna dengan level peran tersebut",
          403,
          "FORBIDDEN",
        );
      }
    }

    const formData = new FormData();
    formData.append("image", fs.createReadStream(file.path));

    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";

    const aiResponse = await axios.post(
      `${aiServiceUrl}/extract-embedding`,
      formData,
      {
        headers: formData.getHeaders(),
      },
    );

    if (!aiResponse.data.success || !aiResponse.data.embedding) {
      fs.unlinkSync(file.path);
      throw new AppError(
        "Gagal mengekstrak wajah. Pastikan foto terang dan jelas.",
        400,
      );
    }

    const biometrik = await prisma.biometrikWajah.upsert({
      where: { penggunaId: targetUserId },
      update: {
        urlFotoReferensi: `/uploads/biometrik/${file.filename}`,
        embeddingVector: aiResponse.data.embedding, // Prisma akan otomatis menyimpan sebagai JSON
        perangkat: "Didaftarkan Admin",
        status: "aktif",
        diperbaruiOleh: req.user?.userId,
      },
      create: {
        penggunaId: targetUserId,
        urlFotoReferensi: `/uploads/biometrik/${file.filename}`,
        embeddingVector: aiResponse.data.embedding,
        perangkat: "Didaftarkan Admin",
        status: "aktif",
        dibuatOleh: req.user?.userId,
      },
    });

    return successResponse(res, "Face ID berhasil didaftarkan", biometrik, 201);
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path); // Hapus gambar jika proses gagal
    }

    if (error instanceof AppError) return next(error);
    return next(
      new AppError(
        error.response?.data?.message || "Gagal menghubungi AI Face Server",
        500,
      ),
    );
  }
};

export const createAbsensi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.user?.userId;
  const isSuper = isSuperAdmin(req.user?.role);
  const userSekolahId = req.user?.sekolahId;
  const file = req.file;

  try {
    if (!userId) {
      throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
    }

    const data = createAbsensiSchema.parse(req.body);

    const siswa = await prisma.pengguna.findFirst({
      where: {
        id: userId,
        status: "aktif",
        dihapusPada: null,
        ...(!isSuper && userSekolahId ? { sekolahId: userSekolahId } : {}),
      },
    });

    if (!siswa || !siswa.sekolahId) {
      throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
    }

    const effectiveSekolahId = siswa.sekolahId;

    if (!isSuper && userSekolahId && effectiveSekolahId !== userSekolahId) {
      throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
    }

    // Pastikan kelas berada pada sekolah yang sama
    const kelas = await prisma.kelas.findFirst({
      where: {
        id: data.kelasId,
        sekolahId: effectiveSekolahId,
        dihapusPada: null,
      },
    });

    if (!kelas) {
      throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
    }

    const sekolah = await prisma.sekolah.findFirst({
      where: {
        id: effectiveSekolahId,
        dihapusPada: null,
      },
    });

    if (!sekolah || sekolah.status !== "aktif") {
      throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
    }

    if (
      sekolah.metodeAbsensiAktif.length > 0 &&
      !sekolah.metodeAbsensiAktif.includes(data.metode)
    ) {
      throw new AppError(
        `Metode absensi ${data.metode} sedang dinonaktifkan oleh sekolah`,
        400,
      );
    }

    if (data.metode === "barcode") {
      if (!data.barcodeData) {
        throw new AppError("Data barcode wajib dikirim", 400);
      }

      if (data.barcodeData !== siswa.nisn) {
        throw new AppError(
          "QR Code tidak cocok dengan kartu identitas Anda",
          403,
        );
      }
    }

    if (data.metode === "lokasi" || data.metode === "face") {
      if (!data.lintang || !data.bujur) {
        throw new AppError(
          "Akses lokasi (GPS) wajib diaktifkan untuk metode ini",
          400,
        );
      }

      if (!sekolah.lintang || !sekolah.bujur) {
        throw new AppError(
          "Admin sekolah belum mengatur titik koordinat sekolah",
          400,
        );
      }

      const jarak = hitungJarakMeter(
        data.lintang,
        data.bujur,
        Number(sekolah.lintang),
        Number(sekolah.bujur),
      );

      const radiusMaks = sekolah.radiusAbsensi || 50;

      if (jarak > radiusMaks) {
        throw new AppError(
          `Anda berada ${Math.round(
            jarak,
          )} meter dari sekolah. Anda harus berada di dalam radius ${radiusMaks} meter untuk absen.`,
          403,
        );
      }
    }

    let urlFotoSaved = null;
    if (data.metode === "face") {
      if (!file) {
        throw new AppError("Foto wajah dari kamera wajib disertakan", 400);
      }

      const biometrik = await prisma.biometrikWajah.findUnique({
        where: { penggunaId: userId },
      });

      if (!biometrik || !biometrik.urlFotoReferensi) {
        throw new AppError(
          "Data biometrik wajah belum terdaftar. Silakan hubungi admin untuk registrasi Face ID terlebih dahulu.",
          400,
        );
      }

      const formData = new FormData();
      const aiServiceUrl =
        process.env.AI_SERVICE_URL || "http://localhost:8000";

      const masterPath = process.cwd() + biometrik.urlFotoReferensi;

      formData.append("master_image", fs.createReadStream(masterPath));
      formData.append("snapshot_image", fs.createReadStream(file.path));

      try {
        const aiResponse = await axios.post(
          `${aiServiceUrl}/verify-face`,
          formData,
          {
            headers: formData.getHeaders(),
          },
        );

        if (!aiResponse.data.matched) {
          throw new AppError(
            `Wajah tidak cocok: ${aiResponse.data.message}`,
            400,
          );
        }
      } catch (error: any) {
        if (error instanceof AppError) throw error;
        throw new AppError(
          error.response?.data?.message || "Gagal menghubungi AI Face Server",
          500,
        );
      }

      urlFotoSaved = `/uploads/absensi/${file.filename}`;
    }

    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    const absensiSudahAda = await prisma.absensi.findFirst({
      where: {
        penggunaId: userId,
        kelasId: data.kelasId,
        tanggal: hariIni,
      },
    });

    if (absensiSudahAda) {
      throw new AppError("Anda sudah melakukan absensi hari ini", 400);
    }

    const absensi = await prisma.absensi.create({
      data: {
        penggunaId: userId,
        kelasId: data.kelasId,
        tanggal: hariIni,
        status: data.status,
        keterangan: data.keterangan || null,
        metode: data.metode,
        lintang: data.lintang || null,
        bujur: data.bujur || null,
        urlFoto: urlFotoSaved,
        dibuatOleh: userId,
      },
    });

    if (file && data.metode !== "face") {
      fs.unlinkSync(file.path);
    }

    return successResponse(res, "Absensi berhasil dicatat", absensi, 201);
  } catch (error) {
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    next(error);
  }
};

export const getAbsensiSaya = async (req: AuthRequest, res: Response) => {
  const absensi = await prisma.absensi.findMany({
    where: {
      penggunaId: req.user!.userId,
    },
    orderBy: {
      dibuatPada: "desc",
    },
  });

  return successResponse(res, "Data absensi berhasil diambil", absensi);
};

export const getAbsensiKelas = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const kelasId = req.params.kelasId as string;
    const { tanggal } = req.query;
    const isSuper = isSuperAdmin(req.user?.role);
    const sekolahId = req.user?.sekolahId;

    if (!isSuper && !sekolahId) {
      throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
    }

    const kelas = await prisma.kelas.findFirst({
      where: {
        id: kelasId,
        dihapusPada: null,
        ...(!isSuper ? { sekolahId } : {}),
      },
    });

    if (!kelas) {
      throw new AppError("Data tidak ditemukan atau Anda tidak memiliki akses", 403);
    }

    const where: any = {
      kelasId,
      kelas: {
        dihapusPada: null,
        ...(!isSuper ? { sekolahId } : {}),
      },
    };

    if (tanggal) {
      const tanggalFilter = new Date(tanggal as string);
      tanggalFilter.setHours(0, 0, 0, 0);

      where.tanggal = tanggalFilter;
    }

    const absensi = await prisma.absensi.findMany({
      where,
      include: {
        pengguna: {
          select: {
            id: true,
            namaLengkap: true,
            nisn: true,
          },
        },
      },
      orderBy: {
        dibuatPada: "desc",
      },
    });

    return successResponse(res, "Data absensi kelas berhasil diambil", absensi);
  } catch (error) {
    next(error);
  }
};

export const exportRekapAbsensi = async (req: AuthRequest, res: Response) => {
  try {
    const sekolahId = req.user?.sekolahId;

    if (!sekolahId) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    const { tanggalMulai, tanggalSelesai, kelasId } = req.query;

    const where: any = {
      kelas: {
        sekolahId,
      },
    };

    if (kelasId) {
      where.kelasId = String(kelasId);
    }

    if (tanggalMulai || tanggalSelesai) {
      where.tanggal = {};

      if (tanggalMulai) {
        const mulai = new Date(String(tanggalMulai));
        mulai.setHours(0, 0, 0, 0);
        where.tanggal.gte = mulai;
      }

      if (tanggalSelesai) {
        const selesai = new Date(String(tanggalSelesai));
        selesai.setHours(23, 59, 59, 999);
        where.tanggal.lte = selesai;
      }
    }

    const absensi = await prisma.absensi.findMany({
      where,
      include: {
        pengguna: {
          select: {
            namaLengkap: true,
            nisn: true,
            nis: true,
          },
        },
        kelas: {
          select: {
            nama: true,
          },
        },
      },
      orderBy: [
        {
          tanggal: "asc",
        },
        {
          pengguna: {
            namaLengkap: "asc",
          },
        },
      ],
    });

    const workbook = new ExcelJS.Workbook();

    const worksheet = workbook.addWorksheet("Rekap Absensi");

    worksheet.columns = [
      {
        header: "No",
        key: "no",
        width: 8,
      },
      {
        header: "Tanggal",
        key: "tanggal",
        width: 15,
      },
      {
        header: "Nama Siswa",
        key: "nama",
        width: 30,
      },
      {
        header: "NISN",
        key: "nisn",
        width: 20,
      },
      {
        header: "NIS",
        key: "nis",
        width: 20,
      },
      {
        header: "Kelas",
        key: "kelas",
        width: 20,
      },
      {
        header: "Status",
        key: "status",
        width: 15,
      },
      {
        header: "Metode",
        key: "metode",
        width: 15,
      },
      {
        header: "Keterangan",
        key: "keterangan",
        width: 35,
      },
    ];

    absensi.forEach((item, index) => {
      worksheet.addRow({
        no: index + 1,
        tanggal: item.tanggal,
        nama: item.pengguna.namaLengkap,
        nisn: item.pengguna.nisn ?? "",
        nis: item.pengguna.nis ?? "",
        kelas: item.kelas?.nama ?? "-",
        status: item.status,
        metode: item.metode ?? "",
        keterangan: item.keterangan ?? "",
      });
    });

    worksheet.getRow(1).font = {
      bold: true,
    };

    worksheet.getColumn("tanggal").numFmt = "dd/mm/yyyy";

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="rekap-absensi.xlsx"',
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error("Error export rekap absensi:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengekspor rekap absensi",
    });
  }
};

export const checkInShift = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const sekolahId = req.user!.sekolahId;
  const userRole = normalizeRole(req.user?.role);

  if (userRole === "siswa") {
    throw new AppError(
      "Absensi shift kerja hanya diperuntukkan bagi guru dan staf/pegawai",
      403,
    );
  }

  if (!sekolahId) {
    throw new AppError(
      "Akses ditolak: Anda tidak terhubung dengan sekolah manapun",
      403,
    );
  }

  const data = checkInShiftSchema.parse(req.body);

  const pegawai = await prisma.pengguna.findUnique({
    where: { id: userId },
    include: { shiftKerjaMaster: true },
  });

  if (!pegawai) {
    throw new AppError("Data pegawai tidak ditemukan", 404);
  }

  const targetShiftId = data.shiftKerjaId || pegawai.shiftKerjaId;
  if (!targetShiftId) {
    throw new AppError(
      "Shift kerja belum ditentukan. Silakan pilih shift kerja atau hubungi admin.",
      400,
    );
  }

  const shift = await prisma.shiftKerja.findFirst({
    where: { id: targetShiftId, sekolahId, dihapusPada: null, status: "aktif" },
  });

  if (!shift) {
    throw new AppError(
      "Shift kerja tidak ditemukan atau tidak aktif di sekolah Anda",
      404,
    );
  }

  if (data.metode === "lokasi" || data.metode === "face") {
    if (!data.lintang || !data.bujur) {
      throw new AppError(
        "Akses lokasi (GPS) wajib diaktifkan untuk metode ini",
        400,
      );
    }

    const sekolah = await prisma.sekolah.findUnique({
      where: { id: sekolahId },
    });

    if (
      sekolah?.metodeAbsensiAktif &&
      sekolah.metodeAbsensiAktif.length > 0 &&
      !sekolah.metodeAbsensiAktif.includes(data.metode)
    ) {
      throw new AppError(
        `Metode absensi ${data.metode} sedang dinonaktifkan oleh sekolah. Metode yang diizinkan: ${sekolah.metodeAbsensiAktif.join(", ")}`,
        400,
      );
    }

    if (sekolah?.lintang && sekolah?.bujur) {
      const jarak = hitungJarakMeter(
        data.lintang,
        data.bujur,
        Number(sekolah.lintang),
        Number(sekolah.bujur),
      );
      const radiusMaks = sekolah.radiusAbsensi || 100;
      if (jarak > radiusMaks) {
        throw new AppError(
          `Anda berada ${Math.round(jarak)} meter dari sekolah. Anda harus berada di dalam radius ${radiusMaks} meter untuk check-in.`,
          403,
        );
      }
    }
  }

  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  const sudahAda = await prisma.absensi.findFirst({
    where: {
      penggunaId: userId,
      shiftKerjaId: shift.id,
      tanggal: hariIni,
    },
  });

  if (sudahAda) {
    throw new AppError(
      "Anda sudah melakukan check-in untuk shift ini hari ini",
      400,
    );
  }

  const waktuMasuk = new Date();

  const partsMasuk = shift.jamMasuk.split(":");
  const jamJadwal = Number(partsMasuk[0] || 0);
  const menitJadwal = Number(partsMasuk[1] || 0);
  const totalMenitJadwal = jamJadwal * 60 + menitJadwal;
  const totalMenitAktual = waktuMasuk.getHours() * 60 + waktuMasuk.getMinutes();
  const selisihMenit = totalMenitAktual - totalMenitJadwal;

  let terlambatMenit = 0;
  let statusShift = "tepat_waktu";

  if (selisihMenit > shift.toleransiTerlambatMenit) {
    terlambatMenit = selisihMenit;
    statusShift = "terlambat";
  }

  const absensi = await prisma.absensi.create({
    data: {
      sekolahId,
      penggunaId: userId,
      shiftKerjaId: shift.id,
      tanggal: hariIni,
      waktuMasuk,
      status: data.status,
      statusShift,
      terlambatMenit,
      keterangan: data.keterangan || null,
      metode: data.metode,
      lintang: data.lintang !== undefined ? data.lintang : null,
      bujur: data.bujur !== undefined ? data.bujur : null,
      dibuatOleh: userId,
    },
    include: {
      shiftKerja: true,
    },
  });

  return successResponse(res, "Check-in shift berhasil dicatat", absensi, 201);
};

export const checkOutShift = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const data = checkOutShiftSchema.parse(req.body);

  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);

  const absensiAktif = await prisma.absensi.findFirst({
    where: {
      penggunaId: userId,
      tanggal: hariIni,
      shiftKerjaId: { not: null },
      waktuKeluar: null,
    },
    include: {
      shiftKerja: true,
    },
    orderBy: { dibuatPada: "desc" },
  });

  if (!absensiAktif || !absensiAktif.waktuMasuk) {
    throw new AppError(
      "Tidak ditemukan absensi check-in aktif untuk di-check-out hari ini",
      400,
    );
  }

  const waktuKeluar = new Date();
  const waktuMasuk = absensiAktif.waktuMasuk;

  const durasiMenitKotor = Math.max(
    0,
    Math.floor((waktuKeluar.getTime() - waktuMasuk.getTime()) / 60000),
  );

  const shift = absensiAktif.shiftKerja;
  let statusShift = absensiAktif.statusShift || "tepat_waktu";

  if (shift) {
    const partsPulang = shift.jamKeluar.split(":");
    const jamPulang = Number(partsPulang[0] || 0);
    const menitPulang = Number(partsPulang[1] || 0);
    const jadwalPulangMenit = jamPulang * 60 + menitPulang;
    const waktuKeluarMenit =
      waktuKeluar.getHours() * 60 + waktuKeluar.getMinutes();

    if (waktuKeluarMenit < jadwalPulangMenit) {
      statusShift =
        statusShift === "terlambat"
          ? "terlambat_dan_pulang_cepat"
          : "pulang_cepat";
    }
  }

  const durasiJamKerja = parseFloat((durasiMenitKotor / 60).toFixed(2));

  const updatedAbsensi = await prisma.absensi.update({
    where: { id: absensiAktif.id },
    data: {
      waktuKeluar,
      durasiKerjaMenit: durasiMenitKotor,
      durasiJamKerja,
      statusShift,
      keterangan: data.keterangan
        ? absensiAktif.keterangan
          ? `${absensiAktif.keterangan} | Pulang: ${data.keterangan}`
          : data.keterangan
        : absensiAktif.keterangan,
      diperbaruiOleh: userId,
    },
    include: {
      shiftKerja: true,
    },
  });

  return successResponse(
    res,
    "Check-out shift berhasil dicatat. Durasi jam kerja valid telah dihitung.",
    updatedAbsensi,
  );
};

export const getRiwayatShiftSaya = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const where = {
    penggunaId: userId,
    shiftKerjaId: { not: null },
  };

  const [total, data] = await Promise.all([
    prisma.absensi.count({ where }),
    prisma.absensi.findMany({
      where,
      skip,
      take: limit,
      include: {
        shiftKerja: true,
      },
      orderBy: { dibuatPada: "desc" },
    }),
  ]);

  return paginatedResponse(
    res,
    "Riwayat absensi shift berhasil diambil",
    data,
    page,
    limit,
    total,
  );
};

export const getMetodeAbsensiAktif = async (
  req: AuthRequest,
  res: Response,
) => {
  const sekolahId = req.user?.sekolahId;

  if (!sekolahId) {
    throw new AppError(
      "Akses ditolak: Anda tidak terhubung dengan sekolah manapun",
      403,
    );
  }

  const sekolah = await prisma.sekolah.findUnique({
    where: { id: sekolahId },
    select: { metodeAbsensiAktif: true },
  });

  if (!sekolah) {
    throw new AppError("Sekolah tidak ditemukan", 404);
  }

  return successResponse(res, "Berhasil mengambil metode absensi aktif", {
    metodeAktif: sekolah.metodeAbsensiAktif,
  });
};

export const getMonitoringGuru = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isSuper = isSuperAdmin(req.user?.role);
    const sekolahId = req.user?.sekolahId;

    if (!isSuper && !sekolahId) {
      throw new AppError(
        "Data tidak ditemukan atau Anda tidak memiliki akses",
        403,
      );
    }

    const { tanggal, status, search, shiftKerjaId } = req.query;

    let targetDate = new Date();
    if (tanggal) {
      const parsed = new Date(String(tanggal));
      if (!isNaN(parsed.getTime())) {
        targetDate = parsed;
      }
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const where: any = {
      tanggal: {
        gte: startOfDay,
        lte: endOfDay,
      },
      ...(!isSuper && sekolahId
        ? {
            OR: [
              { sekolahId },
              { pengguna: { sekolahId } },
            ],
          }
        : {}),
      pengguna: {
        dihapusPada: null,
        peran: {
          is: {
            OR: [
              {
                nama: {
                  in: [
                    "guru",
                    "staf",
                    "pegawai",
                    "karyawan",
                    "Guru",
                    "Staf",
                    "Pegawai",
                    "Karyawan",
                  ],
                },
              },
              { nama: { contains: "guru", mode: "insensitive" } },
              { nama: { contains: "staf", mode: "insensitive" } },
              { nama: { contains: "pegawai", mode: "insensitive" } },
            ],
          },
        },
      },
    };

    if (status) {
      where.status = String(status);
    }

    if (shiftKerjaId) {
      where.shiftKerjaId = String(shiftKerjaId);
    }

    if (search) {
      const searchStr = String(search);
      where.pengguna = {
        ...where.pengguna,
        OR: [
          { namaLengkap: { contains: searchStr, mode: "insensitive" } },
          { nip: { contains: searchStr, mode: "insensitive" } },
          { nuptk: { contains: searchStr, mode: "insensitive" } },
          { email: { contains: searchStr, mode: "insensitive" } },
        ],
      };
    }

    const absensiGuru = await prisma.absensi.findMany({
      where,
      include: {
        pengguna: {
          select: {
            id: true,
            namaLengkap: true,
            email: true,
            avatar: true,
            nip: true,
            nuptk: true,
            jabatan: true,
            shiftKerja: true,
            peran: {
              select: {
                id: true,
                nama: true,
                namaTampilan: true,
              },
            },
            biometrikWajah: {
              select: {
                id: true,
                status: true,
                urlFotoReferensi: true,
              },
            },
          },
        },
        shiftKerja: true,
        kelas: {
          select: {
            id: true,
            nama: true,
          },
        },
      },
      orderBy: [
        { waktuMasuk: "desc" },
        { dibuatPada: "desc" },
      ],
    });

    return successResponse(
      res,
      "Data monitoring absensi guru berhasil diambil",
      absensiGuru,
    );
  } catch (error) {
    next(error);
  }
};