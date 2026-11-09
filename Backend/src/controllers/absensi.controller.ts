import { Response } from "express";
import FormData from "form-data";
import fs from "fs";
import ExcelJS from "exceljs";

import { prisma } from "../config/db";
import {
  createAbsensiSchema,
  checkInShiftSchema,
  checkOutShiftSchema,
  absensiListQuerySchema,
} from "../validations/absensi.validation";
import { AppError } from "../utils/appError";
import { AuthRequest } from "../middlewares/auth.middleware";
import { hitungJarakMeter } from "../utils/geo";
import { assertShiftGps } from "../services/shiftGps.service";
import { successResponse, paginatedResponse } from "../utils/responseFormatter";
import { NextFunction } from "express";
import { normalizeRole, canManageRole, isSuperAdmin } from "../utils/rbac";
import { postToFaceAi } from "../services/faceAi.service";
import { attendanceDateFilter, localClockMinutes, todayDateOnly } from "../utils/dateOnly";
import { assertActiveAttendanceDay } from "../utils/schoolSettings";
import { attendanceInclude, attendanceListFilter, attendanceSchoolFilter } from "../services/absensiQuery.service";
import { resolveSchoolId } from "../utils/schoolScope";

const JENDELA_CHECK_IN_AWAL_MENIT = 120;

async function verifyAttendanceFace(userId: string, file?: Express.Multer.File) {
  if (!file) throw new AppError("Foto wajah dari kamera wajib disertakan", 400);
  const biometrik = await prisma.biometrikWajah.findFirst({
    where: { penggunaId: userId, status: "aktif", dihapusPada: null },
  });
  if (!biometrik?.urlFotoReferensi) throw new AppError(
    "Data biometrik wajah belum terdaftar. Silakan hubungi admin untuk registrasi Face ID terlebih dahulu.", 400,
  );
  const masterPath = process.cwd() + biometrik.urlFotoReferensi;
  if (!fs.existsSync(masterPath)) throw new AppError("Foto referensi wajah tidak tersedia. Hubungi admin untuk registrasi ulang Face ID.", 400);
  const master = fs.createReadStream(masterPath);
  const snapshot = fs.createReadStream(file.path);
  try {
    const formData = new FormData();
    formData.append("master_image", master);
    formData.append("snapshot_image", snapshot);
    const response = await postToFaceAi<{ matched: boolean; message: string }>("/verify-face", formData);
    if (response.data.matched !== true) throw new AppError(`Wajah tidak cocok: ${response.data.message}`, 400);
    return `/uploads/absensi/${file.filename}`;
  } finally {
    master.destroy();
    snapshot.destroy();
  }
}

const clockToMinutes = (value: string): number => {
  const parts = value.split(":");
  return Number(parts[0] || 0) * 60 + Number(parts[1] || 0);
};

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

    const aiResponse = await postToFaceAi<{
      success: boolean;
      embedding: number[];
    }>(
      "/extract-embedding",
      formData,
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
        embeddingVector: aiResponse.data.embedding,
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
      fs.unlinkSync(req.file.path);
    }

    console.error(
      "[AI SERVER ERROR DETAIL]:",
      error.response?.data || error.message || error,
    );

    return next(error);
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
    if (normalizeRole(req.user?.role) !== "siswa") {
      throw new AppError("Endpoint ini hanya untuk absensi siswa di kelas", 403);
    }
    if (!userId) {
      throw new AppError(
        "Data tidak ditemukan atau Anda tidak memiliki akses",
        403,
      );
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
      throw new AppError(
        "Data tidak ditemukan atau Anda tidak memiliki akses",
        403,
      );
    }

    const effectiveSekolahId = siswa.sekolahId;

    if (!isSuper && userSekolahId && effectiveSekolahId !== userSekolahId) {
      throw new AppError(
        "Data tidak ditemukan atau Anda tidak memiliki akses",
        403,
      );
    }

    const kelas = await prisma.kelas.findFirst({
      where: {
        id: data.kelasId,
        sekolahId: effectiveSekolahId,
        dihapusPada: null,
      },
    });

    if (!kelas) {
      throw new AppError(
        "Data tidak ditemukan atau Anda tidak memiliki akses",
        403,
      );
    }

    const sekolah = await prisma.sekolah.findFirst({
      where: {
        id: effectiveSekolahId,
        dihapusPada: null,
      },
    });

    if (!sekolah || sekolah.status !== "aktif") {
      throw new AppError(
        "Data tidak ditemukan atau Anda tidak memiliki akses",
        403,
      );
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

    const urlFotoSaved = data.metode === "face" ? await verifyAttendanceFace(userId, file) : null;

    const waktuMasuk = new Date();
    const hariIni = todayDateOnly(waktuMasuk);
    await assertActiveAttendanceDay(sekolah.id, hariIni);

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

    // Kalkulasi keterlambatan siswa berdasarkan shift kelas
    let terlambatMenitSiswa = 0;
    let statusShiftSiswa: string | null = null;

    if (data.status === "hadir" && kelas.shift) {
      const shiftSiswa = await prisma.shiftSiswa.findFirst({
        where: { sekolahId: effectiveSekolahId, kode: kelas.shift },
      });

      if (shiftSiswa) {
        const menitJadwalMasuk = clockToMinutes(shiftSiswa.jamMasuk);
        const menitSekarang = localClockMinutes(waktuMasuk);
        const selisih = menitSekarang - menitJadwalMasuk;

        if (selisih > shiftSiswa.toleransiTerlambatMenit) {
          terlambatMenitSiswa = selisih;
          statusShiftSiswa = "terlambat";
        } else {
          statusShiftSiswa = "tepat_waktu";
        }
      }
    }

    const absensi = await prisma.absensi.create({
      data: {
        sekolahId: effectiveSekolahId,
        penggunaId: userId,
        kelasId: data.kelasId,
        mataPelajaranId: data.mataPelajaranId || null,
        tanggal: hariIni,
        status: data.status,
        waktuMasuk: data.status === "hadir" ? waktuMasuk : null,
        keterangan: data.keterangan || null,
        metode: data.metode,
        lintang: data.lintang || null,
        bujur: data.bujur || null,
        urlFoto: urlFotoSaved,
        dibuatOleh: userId,
        ...(statusShiftSiswa !== null && {
          terlambatMenit: terlambatMenitSiswa,
          statusShift: statusShiftSiswa,
        }),
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
    const query = absensiListQuerySchema.parse(req.query);
    const tanggalFilter = attendanceDateFilter(query);
    const isSuper = isSuperAdmin(req.user?.role);
    const sekolahId = req.user?.sekolahId;

    if (!isSuper && !sekolahId) {
      throw new AppError(
        "Data tidak ditemukan atau Anda tidak memiliki akses",
        403,
      );
    }

    const kelas = await prisma.kelas.findFirst({
      where: {
        id: kelasId,
        dihapusPada: null,
        ...(!isSuper ? { sekolahId } : {}),
      },
    });

    if (!kelas) {
      throw new AppError(
        "Data tidak ditemukan atau Anda tidak memiliki akses",
        403,
      );
    }

    const where: any = {
      kelasId,
      ...attendanceSchoolFilter(!isSuper ? sekolahId : undefined),
      kelas: {
        dihapusPada: null,
        ...(!isSuper ? { sekolahId } : {}),
      },
    };

    if (tanggalFilter) {
      where.tanggal = tanggalFilter;
    }

    const absensi = await prisma.absensi.findMany({
      where,
      include: attendanceInclude,
      orderBy: {
        dibuatPada: "desc",
      },
    });

    return successResponse(res, "Data absensi kelas berhasil diambil", absensi);
  } catch (error) {
    next(error);
  }
};

export const exportRekapAbsensi = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = absensiListQuerySchema.parse(req.query);
    const sekolahId = resolveSchoolId(req.user, query.sekolahId);
    const where = attendanceListFilter(query, sekolahId);

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
        header: "Nama Pengguna",
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
    next(error);
  }
};

export const checkInShift = async (req: AuthRequest, res: Response) => {
  const file = req.file;
  let photoPersisted = false;
  try {
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

    // Validasi metode absensi yang diizinkan sekolah — dilakukan PERTAMA
    // sebelum pengecekan shift/GPS agar error message tepat sasaran.
    const sekolahMeta = await prisma.sekolah.findFirst({
      where: { id: sekolahId, dihapusPada: null },
      select: { metodeAbsensiAktif: true },
    });
    if (!sekolahMeta) {
      throw new AppError("Sekolah tidak ditemukan", 404);
    }
    if (
      sekolahMeta.metodeAbsensiAktif.length > 0 &&
      !sekolahMeta.metodeAbsensiAktif.includes(data.metode)
    ) {
      throw new AppError(
        `Metode absensi ${data.metode} sedang dinonaktifkan oleh sekolah. Metode yang diizinkan: ${sekolahMeta.metodeAbsensiAktif.join(", ")}`,
        400,
      );
    }

    const pegawai = await prisma.pengguna.findFirst({
      where: { id: userId, sekolahId, dihapusPada: null },
    });

    if (!pegawai) {
      throw new AppError("Data pegawai tidak ditemukan", 404);
    }

    const targetShiftId = pegawai.shiftKerjaId;
    if (!targetShiftId) {
      throw new AppError(
        "Shift kerja belum ditentukan. Silakan hubungi admin untuk penugasan shift.",
        400,
      );
    }

    if (data.shiftKerjaId && data.shiftKerjaId !== targetShiftId) {
      throw new AppError(
        "Shift yang dipilih tidak sesuai dengan penugasan shift Anda",
        403,
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

    await assertShiftGps(sekolahId, data, "check-in");

    const waktuMasuk = new Date();
    const hariIni = todayDateOnly(waktuMasuk);
    await assertActiveAttendanceDay(sekolahId, hariIni);

    const menitJadwalMasuk = clockToMinutes(shift.jamMasuk);
    const menitJadwalKeluar = clockToMinutes(shift.jamKeluar);
    const menitSekarang = localClockMinutes(waktuMasuk);
    const shiftLintasHari = menitJadwalKeluar <= menitJadwalMasuk;

    if (!shiftLintasHari) {
      if (menitSekarang > menitJadwalKeluar) {
        throw new AppError(
          `Check-in ditolak: shift ${shift.nama} (${shift.jamMasuk} - ${shift.jamKeluar}) sudah berakhir`,
          400,
        );
      }
      if (menitSekarang < menitJadwalMasuk - JENDELA_CHECK_IN_AWAL_MENIT) {
        throw new AppError(
          `Check-in ditolak: shift ${shift.nama} baru dimulai pukul ${shift.jamMasuk}`,
          400,
        );
      }
    }

    const sudahAda = await prisma.absensi.findFirst({
      where: {
        penggunaId: userId,
        tanggal: hariIni,
        shiftKerjaId: { not: null },
      },
    });

    if (sudahAda) {
      throw new AppError("Anda sudah melakukan check-in hari ini", 400);
    }

    const selisihMenit = menitSekarang - menitJadwalMasuk;

    let terlambatMenit = 0;
    let statusShift = "tepat_waktu";

    if (selisihMenit > shift.toleransiTerlambatMenit) {
      terlambatMenit = selisihMenit;
      statusShift = "terlambat";
    }

    const urlFoto = data.metode === "face" ? await verifyAttendanceFace(userId, file) : null;
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
        urlFoto,
        dibuatOleh: userId,
      },
      include: {
        shiftKerja: true,
      },
    });

    photoPersisted = urlFoto !== null;
    if (file && !photoPersisted) await fs.promises.rm(file.path, { force: true });
    return successResponse(res, "Check-in shift berhasil dicatat", absensi, 201);
  } finally {
    if (file && !photoPersisted) await fs.promises.rm(file.path, { force: true });
  }
};

export const checkOutShift = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const sekolahId = req.user?.sekolahId;
  if (!sekolahId) throw new AppError("Akses ditolak: Anda tidak terhubung dengan sekolah manapun", 403);
  if (normalizeRole(req.user?.role) === "siswa") {
    throw new AppError("Absensi shift kerja hanya diperuntukkan bagi guru dan staf/pegawai", 403);
  }

  const data = checkOutShiftSchema.parse(req.body);

  // Validasi metode absensi yang diizinkan sekolah — dilakukan PERTAMA
  // sebelum pengecekan GPS agar error message tepat sasaran.
  const sekolahMetaOut = await prisma.sekolah.findFirst({
    where: { id: sekolahId, dihapusPada: null },
    select: { metodeAbsensiAktif: true },
  });
  if (!sekolahMetaOut) {
    throw new AppError("Sekolah tidak ditemukan", 404);
  }
  if (
    sekolahMetaOut.metodeAbsensiAktif.length > 0 &&
    !sekolahMetaOut.metodeAbsensiAktif.includes(data.metode)
  ) {
    throw new AppError(
      `Metode absensi ${data.metode} sedang dinonaktifkan oleh sekolah. Metode yang diizinkan: ${sekolahMetaOut.metodeAbsensiAktif.join(", ")}`,
      400,
    );
  }

  await assertShiftGps(sekolahId, data, "check-out");

  const waktuKeluar = new Date();
  const hariIni = todayDateOnly(waktuKeluar);

  const absensiAktif = await prisma.absensi.findFirst({
    where: {
      penggunaId: userId,
      sekolahId,
      tanggal: hariIni,
      shiftKerjaId: { not: null },
      waktuMasuk: { not: null },
      waktuKeluar: null,
    },
    include: {
      shiftKerja: true,
    },
    orderBy: { waktuMasuk: "desc" },
  });

  if (!absensiAktif || !absensiAktif.waktuMasuk) {
    throw new AppError(
      "Tidak ditemukan absensi check-in aktif untuk di-check-out hari ini",
      400,
    );
  }

  const waktuMasuk = absensiAktif.waktuMasuk;

  const durasiMenitKotor = Math.max(
    0,
    Math.floor((waktuKeluar.getTime() - waktuMasuk.getTime()) / 60000),
  );

  const shift = absensiAktif.shiftKerja;
  let statusShift = absensiAktif.statusShift || "tepat_waktu";

  if (shift) {
    const jadwalPulangMenit = clockToMinutes(shift.jamKeluar);
    const jadwalMasukMenit = clockToMinutes(shift.jamMasuk);
    const shiftLintasHari = jadwalPulangMenit <= jadwalMasukMenit;
    const waktuKeluarMenit = localClockMinutes(waktuKeluar);

    const pulangCepat = shiftLintasHari
      ? waktuKeluarMenit >= jadwalMasukMenit
      : waktuKeluarMenit < jadwalPulangMenit;

    if (pulangCepat) {
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
    const query = absensiListQuerySchema.parse(req.query);
    const sekolahId = resolveSchoolId(req.user, query.sekolahId);

    const where: any = {
      ...attendanceListFilter(query, sekolahId),
      tanggal: attendanceDateFilter(query) || todayDateOnly(),
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
            shiftKerjaId: true,
            shiftKerjaMaster: true,
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
      orderBy: [{ waktuMasuk: "desc" }, { dibuatPada: "desc" }],
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

export const getRiwayatAbsensiSiswa = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const isSuper = isSuperAdmin(req.user?.role);
    const sekolahId = req.user?.sekolahId;
    const siswaId = req.params.siswaId as string;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    if (!isSuper && !sekolahId) throw new AppError("Sekolah tidak ditemukan", 400);

    const siswaData = await prisma.pengguna.findFirst({
      where: {
        id: siswaId,
        dihapusPada: null,
        ...(!isSuper && sekolahId ? { sekolahId } : {}),
      },
      select: { id: true, namaLengkap: true, nisn: true },
    });

    if (!siswaData) {
      throw new AppError("Siswa tidak ditemukan", 404);
    }

    const whereClause: any = {
      penggunaId: siswaId,
      ...attendanceSchoolFilter(!isSuper ? sekolahId : undefined),
    };

    const [data, totalData] = await Promise.all([
      prisma.absensi.findMany({
        where: whereClause,
        orderBy: { tanggal: "desc" },
        skip,
        take: limit,
      }),
      prisma.absensi.count({ where: whereClause }),
    ]);

    const formattedData = data.map((item) => ({
      ...item,
      siswa: siswaData,
    }));

    return paginatedResponse(
      res,
      "Berhasil mengambil riwayat absensi siswa",
      formattedData,
      page,
      limit,
      totalData,
    );
  } catch (error) {
    next(error);
  }
};

export const getRekapAbsensiMapel = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    const isSuper = isSuperAdmin(user?.role);
    const userSekolahId = user?.sekolahId;
    const { mataPelajaranId, kelasId, tanggalMulai, tanggalSelesai } = req.query;

    const where: any = {};
    if (!isSuper && userSekolahId) {
      where.sekolahId = userSekolahId;
    }

    if (mataPelajaranId && typeof mataPelajaranId === "string") {
      where.mataPelajaranId = mataPelajaranId;
    }
    if (kelasId && typeof kelasId === "string") {
      where.kelasId = kelasId;
    }

    if (tanggalMulai || tanggalSelesai) {
      where.tanggal = {};
      if (tanggalMulai) where.tanggal.gte = new Date(tanggalMulai as string);
      if (tanggalSelesai) where.tanggal.lte = new Date(tanggalSelesai as string);
    }

    const absensiList = await prisma.absensi.findMany({
      where,
      include: {
        pengguna: {
          select: {
            id: true,
            namaLengkap: true,
            nipd: true,
            nisn: true,
          },
        },
        kelas: {
          select: {
            id: true,
            nama: true,
            tingkat: true,
          },
        },
        mataPelajaran: {
          select: {
            id: true,
            nama: true,
            kode: true,
          },
        },
      },
      orderBy: [{ tanggal: "desc" }, { dibuatPada: "desc" }],
    });

    const siswaMap: Record<string, any> = {};
    for (const item of absensiList) {
      const sId = item.penggunaId;
      if (!siswaMap[sId]) {
        siswaMap[sId] = {
          siswa: item.pengguna,
          kelas: item.kelas,
          total: 0,
          hadir: 0,
          izin: 0,
          sakit: 0,
          alpha: 0,
          persentaseHadir: 0,
        };
      }
      siswaMap[sId].total += 1;
      const st = (item.status || "").toLowerCase();
      if (st === "hadir") siswaMap[sId].hadir += 1;
      else if (st === "izin") siswaMap[sId].izin += 1;
      else if (st === "sakit") siswaMap[sId].sakit += 1;
      else if (st === "alpha") siswaMap[sId].alpha += 1;
    }

    Object.values(siswaMap).forEach((s: any) => {
      s.persentaseHadir = s.total > 0 ? Math.round((s.hadir / s.total) * 100) : 0;
    });

    return successResponse(res, "Rekap absensi per mata pelajaran berhasil diambil", {
      rekapSiswa: Object.values(siswaMap),
      totalData: absensiList.length,
      riwayat: absensiList,
    });
  } catch (error) {
    next(error);
  }
};

