import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import {
  validasiUmurPpdb,
  generateNomorPendaftaran,
} from "../utils/ppdb.utils";

const prisma = new PrismaClient();

export const daftarPpdb = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      sekolahId,
      jalurPpdbId,
      namaLengkap,
      nisn,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      alamat,
      telepon,
      email,
      namaAyah,
      namaIbu,
      asalSekolah,
      nilaiRapor,
    } = req.body;

    if (
      !sekolahId ||
      !jalurPpdbId ||
      !namaLengkap ||
      !nisn ||
      !tanggalLahir
    ) {
      return res.status(400).json({
        success: false,
        message: "Data wajib belum lengkap",
      });
    }

    const sekolah =
      await prisma.sekolah.findFirst({
        where: {
          id: sekolahId,
          dihapusPada: null,
        },
      });

    if (!sekolah) {
      return res.status(404).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    const jalur =
      await prisma.jalurPpdb.findFirst({
        where: {
          id: jalurPpdbId,
          sekolahId,
          dihapusPada: null,
        },
      });

    if (!jalur) {
      return res.status(404).json({
        success: false,
        message: "Jalur PPDB tidak ditemukan",
      });
    }

    const sekarang = new Date();

    if (
      jalur.tanggalMulai &&
      sekarang < jalur.tanggalMulai
    ) {
      return res.status(400).json({
        success: false,
        message: "Pendaftaran PPDB belum dibuka",
      });
    }

    if (
      jalur.tanggalSelesai &&
      sekarang > jalur.tanggalSelesai
    ) {
      return res.status(400).json({
        success: false,
        message: "Pendaftaran PPDB sudah ditutup",
      });
    }

    const jumlahPendaftar =
      await prisma.pendaftaranPpdb.count({
        where: {
          jalurPpdbId,
          status: {
            not: "ditolak",
          },
          dihapusPada: null,
        },
      });

    if (jumlahPendaftar >= jalur.kuota) {
      return res.status(400).json({
        success: false,
        message: "Kuota jalur PPDB sudah penuh",
      });
    }

    const validasiUsia =
      validasiUmurPpdb(
        sekolah.jenjang || "",
        new Date(tanggalLahir)
      );

    if (!validasiUsia.valid) {
      return res.status(400).json({
        success: false,
        message: validasiUsia.message,
        umur: validasiUsia.umur,
        batasUmur: validasiUsia.batas,
      });
    }

    const nisnExist =
      await prisma.pendaftaranPpdb.findFirst({
        where: {
          nisn,
          dihapusPada: null,
        },
      });

    if (nisnExist) {
      return res.status(409).json({
        success: false,
        message: "NISN sudah terdaftar",
      });
    }

    const penggunaExist =
      await prisma.pengguna.findUnique({
        where: {
          nisn,
        },
      });

    if (penggunaExist) {
      return res.status(409).json({
        success: false,
        message: "NISN sudah digunakan oleh pengguna",
      });
    }

    const nomorPendaftaran =
      generateNomorPendaftaran();

    const pendaftaran =
      await prisma.pendaftaranPpdb.create({
        data: {
          sekolahId,
          jalurPpdbId,
          nomorPendaftaran,
          namaLengkap,
          nisn,
          tempatLahir,
          tanggalLahir: new Date(tanggalLahir),
          jenisKelamin,
          alamat,
          telepon,
          email,
          namaAyah,
          namaIbu,
          asalSekolah,
          nilaiRapor:
            nilaiRapor !== undefined
              ? Number(nilaiRapor)
              : undefined,
          status: "menunggu",
        },
      });

    return res.status(201).json({
      success: true,
      message:
        "Pendaftaran PPDB berhasil dikirim",
      data: pendaftaran,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal melakukan pendaftaran PPDB",
    });
  }
};

export const uploadBerkasPpdb = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const pendaftaran =
      await prisma.pendaftaranPpdb.findFirst({
        where: {
          id: id as string,
          dihapusPada: null,
        },
      });

    if (!pendaftaran) {
      return res.status(404).json({
        success: false,
        message: "Data pendaftaran tidak ditemukan",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File belum diupload",
      });
    }

    const namaBerkas = req.body.namaBerkas;

    const allowedBerkas = [
      "KK",
      "AKTE",
      "IJAZAH",
    ];

    if (!allowedBerkas.includes(namaBerkas)) {
      return res.status(400).json({
        success: false,
        message:
          "namaBerkas harus KK, AKTE, atau IJAZAH",
      });
    }

    const existing =
      await prisma.berkasPpdb.findFirst({
        where: {
          pendaftaranPpdbId: id as string,
          namaBerkas,
          dihapusPada: null,
        },
      });

    if (existing) {
      await prisma.berkasPpdb.update({
        where: {
          id: existing.id,
        },
        data: {
          dihapusPada: new Date(),
          status: "diganti",
        },
      });
    }

    const fileUrl =
      `/uploads/ppdb/${req.file.filename}`;

    const berkas =
      await prisma.berkasPpdb.create({
        data: {
          pendaftaranPpdbId: id as string,
          namaBerkas,
          urlFile: fileUrl,
          status: "menunggu",
        },
      });

    return res.status(201).json({
      success: true,
      message: `${namaBerkas} berhasil diupload`,
      data: berkas,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengupload berkas",
    });
  }
};

export const verifikasiPpdb = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status, kelasId } = req.body;

    const adminId = (req as any).user?.id;
    const sekolahId = (req as any).user?.sekolahId;

    if (!sekolahId) {
      return res.status(400).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    if (
      !["lulus", "ditolak"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status hanya boleh lulus atau ditolak",
      });
    }

    const pendaftaran =
      await prisma.pendaftaranPpdb.findFirst({
        where: {
          id: id as string,
          sekolahId,
          dihapusPada: null,
        },
      });

    if (!pendaftaran) {
      return res.status(404).json({
        success: false,
        message:
          "Pendaftaran PPDB tidak ditemukan",
      });
    }

    if (
      pendaftaran.status === "lulus" &&
      pendaftaran.dikonversiKePenggunaId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Pendaftar sudah dikonversi menjadi siswa",
      });
    }

    if (status === "ditolak") {
      const updated =
        await prisma.pendaftaranPpdb.update({
          where: {
            id: pendaftaran.id,
          },
          data: {
            status: "ditolak",
            diperbaruiPada: new Date(),
          },
        });

      return res.status(200).json({
        success: true,
        message:
          "Pendaftaran berhasil ditolak",
        data: updated,
      });
    }

    if (!kelasId) {
      return res.status(400).json({
        success: false,
        message:
          "kelasId wajib diisi untuk pendaftar yang lulus",
      });
    }

    const kelas =
      await prisma.kelas.findFirst({
        where: {
          id: kelasId,
          sekolahId,
          dihapusPada: null,
        },
      });

    if (!kelas) {
      return res.status(404).json({
        success: false,
        message: "Kelas tidak ditemukan",
      });
    }

    if (
      kelas.kapasitas !== null &&
      kelas.kapasitas !== undefined
    ) {
      const jumlahSiswa =
        await prisma.anggotaKelas.count({
          where: {
            kelasId: kelas.id,
          },
        });

      if (jumlahSiswa >= kelas.kapasitas) {
        return res.status(400).json({
          success: false,
          message:
            "Kapasitas kelas sudah penuh",
        });
      }
    }

    const roleSiswa =
      await prisma.peran.findFirst({
        where: {
          nama: "siswa",
        },
      });

    if (!roleSiswa) {
      return res.status(500).json({
        success: false,
        message:
          "Role siswa belum tersedia",
      });
    }

    const existingUser =
      await prisma.pengguna.findUnique({
        where: {
          nisn: pendaftaran.nisn,
        },
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "NISN sudah terdaftar sebagai pengguna",
      });
    }

    const usernameBase =
      pendaftaran.nisn;

    const email =
      pendaftaran.email ||
      `${pendaftaran.nisn}@smartschool.local`;

    const existingEmail =
      await prisma.pengguna.findUnique({
        where: {
          email,
        },
      });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message:
          "Email sudah digunakan oleh pengguna lain",
      });
    }

    const password =
      await bcrypt.hash(
        pendaftaran.nisn,
        10
      );

    const result =
      await prisma.$transaction(
        async (tx) => {
          const pengguna =
            await tx.pengguna.create({
              data: {
                sekolahId,
                peranId: roleSiswa.id,
                namaPengguna:
                  usernameBase,
                email,
                kataSandi: password,
                namaLengkap:
                  pendaftaran.namaLengkap,
                nisn: pendaftaran.nisn,
                status: "aktif",

                tempatLahir:
                  pendaftaran.tempatLahir,

                tanggalLahir:
                  pendaftaran.tanggalLahir,

                jenisKelamin:
                  pendaftaran.jenisKelamin,

                alamat:
                  pendaftaran.alamat,

                noTelepon:
                  pendaftaran.telepon,

                namaAyah:
                  pendaftaran.namaAyah,

                namaIbu:
                  pendaftaran.namaIbu,

                dibuatOleh: adminId,
                diperbaruiOleh: adminId,
              },
            });

          const anggota =
            await tx.anggotaKelas.create({
              data: {
                kelasId: kelas.id,
                penggunaId: pengguna.id,
                tahunAjaranId: kelas.tahunAjaranId,
              },
            });

          const updated =
            await tx.pendaftaranPpdb.update({
              where: {
                id: pendaftaran.id,
              },
              data: {
                status: "lulus",
                kelasId: kelas.id,
                dikonversiKePenggunaId:
                  pengguna.id,
                dikonversiPada: new Date(),
                diperbaruiOleh: adminId,
              },
            });

          return {
            pengguna,
            anggota,
            pendaftaran: updated,
          };
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Pendaftar berhasil dikonversi menjadi siswa",
      data: {
        pengguna: {
          id: result.pengguna.id,
          namaPengguna:
            result.pengguna.namaPengguna,
          email: result.pengguna.email,
          namaLengkap:
            result.pengguna.namaLengkap,
          nisn: result.pengguna.nisn,
        },
        kelasId: result.anggota.kelasId,
        pendaftaranId:
          result.pendaftaran.id,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Gagal melakukan verifikasi dan konversi PPDB",
    });
  }
};