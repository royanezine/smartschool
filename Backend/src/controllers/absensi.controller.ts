import { Response } from "express";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import ExcelJS from "exceljs";

import { prisma } from "../config/db";
import { createAbsensiSchema } from "../validations/absensi.validation";
import { AppError } from "../utils/appError";
import { AuthRequest } from "../middlewares/auth.middleware";
import { hitungJarakMeter } from "../utils/geo";
import { successResponse } from "../utils/responseFormatter";

export const createAbsensi = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.user!.userId;
  const sekolahId = req.user!.sekolahId;
  const file = req.file;

  const data = createAbsensiSchema.parse(req.body);

  try {
    const sekolah = await prisma.sekolah.findUnique({
      where: { id: sekolahId! },
    });

    if (!sekolah) {
      throw new AppError("Data sekolah tidak ditemukan", 404);
    }

    if (
      sekolah.metodeAbsensiAktif.length > 0 &&
      !sekolah.metodeAbsensiAktif.includes(data.metode)
    ) {
      throw new AppError(
        `Metode absensi ${data.metode} sedang dinonaktifkan oleh sekolah`,
        400
      );
    }

    const siswa = await prisma.pengguna.findUnique({
      where: { id: userId },
    });

    if (!siswa) {
      throw new AppError("Data siswa tidak ditemukan", 404);
    }

    if (data.metode === "barcode") {
      if (!data.barcodeData) {
        throw new AppError("Data barcode wajib dikirim", 400);
      }

      if (data.barcodeData !== siswa.nisn) {
        throw new AppError(
          "QR Code tidak cocok dengan kartu identitas Anda",
          403
        );
      }
    }

    if (data.metode === "lokasi" || data.metode === "face") {
      if (!data.lintang || !data.bujur) {
        throw new AppError(
          "Akses lokasi (GPS) wajib diaktifkan untuk metode ini",
          400
        );
      }

      if (!sekolah.lintang || !sekolah.bujur) {
        throw new AppError(
          "Admin sekolah belum mengatur titik koordinat sekolah",
          400
        );
      }

      const jarak = hitungJarakMeter(
        data.lintang,
        data.bujur,
        Number(sekolah.lintang),
        Number(sekolah.bujur)
      );

      const radiusMaks = sekolah.radiusAbsensi || 50;

      if (jarak > radiusMaks) {
        throw new AppError(
          `Anda berada ${Math.round(
            jarak
          )} meter dari sekolah. Anda harus berada di dalam radius ${radiusMaks} meter untuk absen.`,
          403
        );
      }
    }

    let urlFotoSaved = null;
if (data.metode === "face") {
  if (!file) {
    throw new AppError("Foto wajah dari kamera wajib disertakan", 400);
  }

  // CEK DATA BIOMETRIK ALIH-ALIH AVATAR
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
  const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8032";

  // Ambil foto referensi dari tabel biometrik_wajah
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
      throw new AppError(`Wajah tidak cocok: ${aiResponse.data.message}`, 400);
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
      throw new AppError(
        "Anda sudah melakukan absensi hari ini",
        400
      );
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

    return successResponse(
      res,
      "Absensi berhasil dicatat",
      absensi,
      201
    );
  } catch (error) {
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    throw error;
  }
};

export const getAbsensiSaya = async (
  req: AuthRequest,
  res: Response
) => {
  const absensi = await prisma.absensi.findMany({
    where: {
      penggunaId: req.user!.userId,
    },
    orderBy: {
      dibuatPada: "desc",
    },
  });

  return successResponse(
    res,
    "Data absensi berhasil diambil",
    absensi
  );
};

export const getAbsensiKelas = async (
  req: AuthRequest,
  res: Response
) => {
  const kelasId = req.params.kelasId as string;
  const { tanggal } = req.query;

  const where: any = {
    kelasId,
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

  return successResponse(
    res,
    "Data absensi kelas berhasil diambil",
    absensi
  );
};

export const exportRekapAbsensi = async (
  req: AuthRequest,
  res: Response
) => {
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

    const worksheet = workbook.addWorksheet(
      "Rekap Absensi"
    );

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
        kelas: item.kelas.nama,
        status: item.status,
        metode: item.metode ?? "",
        keterangan: item.keterangan ?? "",
      });
    });

    worksheet.getRow(1).font = {
      bold: true,
    };

    worksheet.getColumn("tanggal").numFmt =
      "dd/mm/yyyy";

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="rekap-absensi.xlsx"'
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error(
      "Error export rekap absensi:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Gagal mengekspor rekap absensi",
    });
  }
};
