import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { siswaSchema } from "../validations/siswa.validation";
import bcrypt from "bcrypt";

export const createSiswa = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sekolahId = (req as any).user?.sekolahId;
    if (!sekolahId)
      throw new AppError("Akses ditolak. Sekolah ID tidak ditemukan.", 403);

    const validatedData = siswaSchema.parse(req.body);

    const existingEmail = await prisma.pengguna.findUnique({
      where: { email: validatedData.email },
    });
    if (existingEmail) throw new AppError("Email sudah terdaftar", 400);

    const existingNisn = await prisma.pengguna.findFirst({
      where: { nisn: validatedData.nisn, sekolahId },
    });
    if (existingNisn) throw new AppError("NISN sudah terdaftar", 400);

    const peranSiswa = await prisma.peran.findFirst({
      where: { nama: "siswa" },
    });
    if (!peranSiswa)
      throw new AppError("Role siswa tidak ditemukan dalam sistem", 500);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.nisn, salt);

    const siswa = await prisma.$transaction(async (tx) => {
      const newSiswa = await tx.pengguna.create({
        data: {
          namaLengkap: validatedData.namaLengkap,
          email: validatedData.email,
          namaPengguna: validatedData.nisn,
          kataSandi: hashedPassword,
          nisn: validatedData.nisn,
          nis: validatedData.nis,
          sekolahId,
          peranId: peranSiswa.id,
          status: "aktif",

          // Data detail baru
          nik: validatedData.nik,
          namaAyah: validatedData.namaAyah,
          pekerjaanAyah: validatedData.pekerjaanAyah,
          namaIbu: validatedData.namaIbu,
          pekerjaanIbu: validatedData.pekerjaanIbu,
          alamatKtp: validatedData.alamatKtp,
          alamatDomisili: validatedData.alamatDomisili,
          kecamatan: validatedData.kecamatan,
          kelurahan: validatedData.kelurahan,
          kotaKabupaten: validatedData.kota,
        },
      });

      if (validatedData.kelasId) {
        const kelasExists = await tx.kelas.findFirst({
          where: { id: validatedData.kelasId, sekolahId },
        });
        if (!kelasExists) {
          throw new AppError(
            "Kelas tidak ditemukan atau bukan milik sekolah ini",
            404,
          );
        }

        await tx.anggotaKelas.create({
          data: {
            kelasId: validatedData.kelasId,
            penggunaId: newSiswa.id,
            tahunAjaranId: kelasExists.tahunAjaranId,
          },
        });
      }

      return newSiswa;
    });

    res.status(201).json({
      success: true,
      message: "Data Siswa berhasil dibuat",
      data: {
        id: siswa.id,
        namaLengkap: siswa.namaLengkap,
        email: siswa.email,
        nisn: siswa.nisn,
      },
    });
  } catch (error) {
    next(error);
  }
};
