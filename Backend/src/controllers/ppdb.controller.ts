import { Request, Response, NextFunction } from "express";
import fs from "fs";
import { prisma } from "../config/db";
import bcrypt from "bcryptjs";

import {
  validasiUmurPpdb,
  generateNomorPendaftaran,
} from "../utils/ppdb.utils";
import {
  generatePpdbUploadToken,
  verifyPpdbUploadToken,
  verifyPpdbAccessToken,
  verifyAccessToken,
} from "../utils/generateToken";
import { isSuperAdmin } from "../utils/rbac";
import { availableSchoolWhere } from "../utils/schoolAvailability";
import { todayDateOnly } from "../utils/dateOnly";
import { AppError } from "../utils/appError";
import { sendPpdbRegistrationEmail } from "../utils/email";
import { BERKAS_PPDB } from "../utils/spmb.constants";
import {
  ambilPengaturanSpmb,
  ambilRankingJalur,
  hitungJarakKm,
  keAngka,
} from "../services/spmb.service";

const hapusFileUpload = (req: Request) => {
  if (req.file && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
  }
};

const tokenPendaftarValid = (
  rawToken: string,
  pendaftaranId: string,
  sekolahId: string,
): boolean => {
  try {
    const payload = verifyPpdbUploadToken(rawToken);
    if (
      payload.pendaftaranId === pendaftaranId &&
      payload.sekolahId === sekolahId
    ) {
      return true;
    }
  } catch {}

  try {
    const payload = verifyPpdbAccessToken(rawToken);
    if (
      payload.pendaftaranId === pendaftaranId &&
      payload.sekolahId === sekolahId
    ) {
      return true;
    }
  } catch {}

  return false;
};

const parseKoordinat = (nilai: unknown): number | null => {
  if (nilai === undefined || nilai === null || nilai === "") {
    return null;
  }

  const angka = Number(nilai);

  return Number.isFinite(angka) ? angka : null;
};

export const daftarPpdb = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      sekolahId,
      jalurPpdbId,
      jurusanId,
      nik,
      gelombangPpdbId,
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
      lintang,
      bujur,
    } = req.body;

    if (
      !sekolahId ||
      !jalurPpdbId ||
      !namaLengkap ||
      !nisn ||
      !tanggalLahir ||
      !nik ||
      !email
    ) {
      throw new AppError("Data wajib belum lengkap", 400);
    }

    const sekolah = await prisma.sekolah.findFirst({
      where: {
        id: sekolahId,
        ...availableSchoolWhere(),
      },
    });

    if (!sekolah) {
      throw new AppError("Sekolah tidak ditemukan", 404);
    }

    const pengaturan = await ambilPengaturanSpmb(sekolahId);

    if (!pengaturan.pendaftaranDibuka) {
      throw new AppError("Pendaftaran SPMB sedang ditutup", 400);
    }

    const jalur = await prisma.jalurPpdb.findFirst({
      where: {
        id: jalurPpdbId,
        sekolahId,
        status: "aktif",
        dihapusPada: null,
      },
    });

    if (!jalur) {
      throw new AppError("Jalur PPDB tidak ditemukan", 404);
    }

    const sekarang = todayDateOnly();

    if (jalur.tanggalMulai && sekarang < jalur.tanggalMulai) {
      throw new AppError("Pendaftaran PPDB belum dibuka", 400);
    }

    if (jalur.tanggalSelesai && sekarang > jalur.tanggalSelesai) {
      throw new AppError("Pendaftaran PPDB sudah ditutup", 400);
    }

    const sekolahSmk =
      (sekolah.jenjang || "").toUpperCase().trim() === "SMK";

    if (sekolahSmk) {
      if (!jurusanId) {
        throw new AppError("Jurusan wajib dipilih untuk sekolah SMK", 400);
      }

      const jurusan = await prisma.jurusan.findFirst({
        where: {
          id: jurusanId,
          sekolahId,
          status: "aktif",
          dihapusPada: null,
        },
      });

      if (!jurusan) {
        throw new AppError("Jurusan tidak ditemukan di sekolah ini", 404);
      }
    } else if (jurusanId) {
      throw new AppError("Pilihan jurusan hanya untuk sekolah SMK", 400);
    }

    if (pengaturan.batasiPendaftarSesuaiKuota) {
      const jumlahPendaftar = await prisma.pendaftaranPpdb.count({
        where: {
          jalurPpdbId,
          status: { not: "ditolak" },
          dihapusPada: null,
        },
      });

      if (jumlahPendaftar >= jalur.kuota) {
        throw new AppError("Kuota jalur PPDB sudah penuh", 400);
      }
    }

    const validasiUsia = validasiUmurPpdb(
      sekolah.jenjang || "",
      new Date(tanggalLahir),
    );

    if (!validasiUsia.valid) {
      throw new AppError(validasiUsia.message, 400);
    }

    const nisnExist = await prisma.pendaftaranPpdb.findFirst({
      where: {
        nisn,
        dihapusPada: null,
      },
    });

    if (nisnExist) {
      throw new AppError("NISN sudah terdaftar", 409);
    }

    const nikExist = await prisma.pendaftaranPpdb.findFirst({
      where: {
        nik,
        dihapusPada: null,
      },
    });

    if (nikExist) {
      throw new AppError("NIK sudah terdaftar", 409);
    }

    const penggunaExist = await prisma.pengguna.findUnique({
      where: {
        nisn,
      },
    });

    if (penggunaExist) {
      throw new AppError("NISN sudah digunakan oleh pengguna", 409);
    }

    const nilaiAngka = parseKoordinat(nilaiRapor);
    const nilaiMinimal = keAngka(jalur.nilaiMinimal);

    if (
      (jalur.metodeRanking === "nilai" || nilaiMinimal !== null) &&
      nilaiAngka === null
    ) {
      throw new AppError("Nilai rapor wajib diisi untuk jalur ini", 400);
    }

    if (
      nilaiMinimal !== null &&
      nilaiAngka !== null &&
      nilaiAngka < nilaiMinimal
    ) {
      throw new AppError(
        `Nilai rapor di bawah minimal ${nilaiMinimal} untuk jalur ini`,
        422,
      );
    }

    const lintangRumah = parseKoordinat(lintang);
    const bujurRumah = parseKoordinat(bujur);

    if ((lintangRumah === null) !== (bujurRumah === null)) {
      throw new AppError("Lintang dan bujur harus diisi bersamaan", 400);
    }

    const jarakMaksimal = keAngka(jalur.jarakMaksimalKm);
    const butuhLokasi =
      jalur.metodeRanking === "jarak" ||
      jalur.kategori === "zonasi" ||
      jarakMaksimal !== null ||
      pengaturan.wajibLokasi;

    if (butuhLokasi && (lintangRumah === null || bujurRumah === null)) {
      throw new AppError(
        "Lokasi rumah (lintang dan bujur) wajib diisi",
        400,
      );
    }

    const lintangSekolah = keAngka(sekolah.lintang);
    const bujurSekolah = keAngka(sekolah.bujur);

    let jarakKm: number | null = null;

    if (lintangRumah !== null && bujurRumah !== null) {
      if (lintangSekolah === null || bujurSekolah === null) {
        if (butuhLokasi) {
          throw new AppError(
            "Koordinat sekolah belum diatur oleh admin sekolah",
            409,
          );
        }
      } else {
        jarakKm = hitungJarakKm(
          lintangSekolah,
          bujurSekolah,
          lintangRumah,
          bujurRumah,
        );
      }
    }

    if (jarakMaksimal !== null && jarakKm !== null && jarakKm > jarakMaksimal) {
      throw new AppError(
        `Jarak rumah ${jarakKm} km melebihi batas ${jarakMaksimal} km untuk jalur ini`,
        422,
      );
    }

    const pendaftaran = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM jalur_ppdb WHERE id = ${jalurPpdbId} FOR UPDATE`;

      if (pengaturan.batasiPendaftarSesuaiKuota) {
        const occupied = await tx.pendaftaranPpdb.count({
          where: {
            jalurPpdbId,
            dihapusPada: null,
            status: { not: "ditolak" },
          },
        });

        if (occupied >= jalur.kuota) {
          throw new AppError("Kuota jalur PPDB sudah penuh", 409);
        }
      }

      if (gelombangPpdbId) {
        await tx.$executeRaw`SELECT id FROM gelombang_ppdb WHERE id = ${gelombangPpdbId} FOR UPDATE`;

        const wave = await tx.gelombangPpdb.findFirst({
          where: {
            id: gelombangPpdbId,
            sekolahId,
            dihapusPada: null,
            status: "aktif",
            OR: [{ jalurPpdbId }, { jalurPpdbId: null }],
          },
        });

        if (
          !wave ||
          sekarang < wave.tanggalMulai ||
          sekarang > wave.tanggalSelesai
        ) {
          throw new AppError(
            "Gelombang PPDB tidak tersedia untuk jalur ini",
            400,
          );
        }

        if (
          wave.kuota !== null &&
          (await tx.pendaftaranPpdb.count({
            where: {
              gelombangPpdbId,
              dihapusPada: null,
              status: { not: "ditolak" },
            },
          })) >= wave.kuota
        ) {
          throw new AppError("Kuota gelombang PPDB penuh", 409);
        }
      }

      let nomorPendaftaran = generateNomorPendaftaran();

      for (let percobaan = 0; percobaan < 5; percobaan += 1) {
        const ada = await tx.pendaftaranPpdb.findUnique({
          where: { nomorPendaftaran },
        });

        if (!ada) {
          break;
        }

        nomorPendaftaran = generateNomorPendaftaran();
      }

      return tx.pendaftaranPpdb.create({
        data: {
          sekolahId,
          jalurPpdbId,
          jurusanId: sekolahSmk ? jurusanId : undefined,
          nik,
          gelombangPpdbId,
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
          nilaiRapor: nilaiAngka ?? undefined,
          lintang: lintangRumah ?? undefined,
          bujur: bujurRumah ?? undefined,
          jarakKm: jarakKm ?? undefined,
          status: "menunggu",
        },
      });
    });

    const uploadToken = generatePpdbUploadToken(
      pendaftaran.id,
      pendaftaran.nomorPendaftaran,
      pendaftaran.sekolahId,
    );

    if (pengaturan.kirimEmailKonfirmasi) {
      sendPpdbRegistrationEmail({
        email,
        namaLengkap,
        nomorPendaftaran: pendaftaran.nomorPendaftaran,
        namaSekolah: sekolah.nama,
      }).catch((error: any) => {
        console.error(
          "[PPDB] Gagal mengirim email konfirmasi:",
          error?.message,
        );
      });
    }

    return res.status(201).json({
      success: true,
      message: "Pendaftaran PPDB berhasil dikirim",
      data: {
        ...pendaftaran,
        tokenPendaftaran: uploadToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadBerkasPpdb = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const pendaftaran = await prisma.pendaftaranPpdb.findFirst({
      where: {
        id: id as string,
        dihapusPada: null,
      },
    });

    if (!pendaftaran) {
      hapusFileUpload(req);
      return res.status(404).json({
        success: false,
        message: "Data pendaftaran tidak ditemukan",
      });
    }

    let authorized = false;

    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (bearerToken) {
      try {
        const decoded = verifyAccessToken(bearerToken);
        if (decoded && decoded.userId) {
          const isSuper = isSuperAdmin(decoded.role);
          if (
            isSuper ||
            (decoded.sekolahId && decoded.sekolahId === pendaftaran.sekolahId)
          ) {
            authorized = true;
          }
        }
      } catch {}
    }

    if (!authorized) {
      const rawToken =
        (req.headers["x-ppdb-token"] as string) ||
        bearerToken ||
        (req.body.token as string) ||
        (req.body.tokenPendaftaran as string) ||
        (req.query.token as string) ||
        (req.query.tokenPendaftaran as string);

      if (!rawToken) {
        hapusFileUpload(req);
        return res.status(403).json({
          success: false,
          message:
            "Akses ditolak: Token pendaftaran diperlukan untuk mengunggah berkas",
          errorCode: "REGISTRATION_TOKEN_REQUIRED",
        });
      }

      authorized = tokenPendaftarValid(
        rawToken,
        pendaftaran.id,
        pendaftaran.sekolahId,
      );

      if (!authorized) {
        hapusFileUpload(req);
        return res.status(403).json({
          success: false,
          message:
            "Akses ditolak: Token pendaftaran tidak valid atau telah kadaluarsa",
          errorCode: "INVALID_REGISTRATION_TOKEN",
        });
      }
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File belum diupload",
      });
    }

    const namaBerkas = req.body.namaBerkas;

    if (!(BERKAS_PPDB as readonly string[]).includes(namaBerkas)) {
      hapusFileUpload(req);
      return res.status(400).json({
        success: false,
        message: `namaBerkas harus salah satu dari: ${BERKAS_PPDB.join(", ")}`,
      });
    }

    const existing = await prisma.berkasPpdb.findFirst({
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

    const fileUrl = `/uploads/ppdb/${req.file.filename}`;

    const berkas = await prisma.berkasPpdb.create({
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
    hapusFileUpload(req);
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengupload berkas",
    });
  }
};

export const verifikasiPpdb = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, kelasId, abaikanKuota } = req.body;

    const adminId = (req as any).user?.userId;
    const sekolahId = (req as any).user?.sekolahId;

    if (!sekolahId) {
      return res.status(400).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    if (!["lulus", "ditolak"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status hanya boleh lulus atau ditolak",
      });
    }

    const pendaftaran = await prisma.pendaftaranPpdb.findFirst({
      where: {
        id: id as string,
        sekolahId,
        dihapusPada: null,
      },
    });

    if (!pendaftaran) {
      return res.status(404).json({
        success: false,
        message: "Pendaftaran PPDB tidak ditemukan",
      });
    }

    if (pendaftaran.status === "lulus" && pendaftaran.dikonversiKePenggunaId) {
      return res.status(400).json({
        success: false,
        message: "Pendaftar sudah dikonversi menjadi siswa",
      });
    }

    if (status === "ditolak") {
      const updated = await prisma.pendaftaranPpdb.update({
        where: {
          id: pendaftaran.id,
        },
        data: {
          status: "ditolak",
          diperbaruiOleh: adminId,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Pendaftaran berhasil ditolak",
        data: updated,
      });
    }

    if (!kelasId) {
      return res.status(400).json({
        success: false,
        message: "kelasId wajib diisi untuk pendaftar yang lulus",
      });
    }

    const ranking = await ambilRankingJalur(pendaftaran.jalurPpdbId, sekolahId);
    const entri = ranking?.daftar.find((item) => item.id === pendaftaran.id);

    if (!ranking || !entri) {
      return res.status(400).json({
        success: false,
        message: "Pendaftar tidak termasuk dalam peringkat jalur",
      });
    }

    if (!entri.memenuhiKriteria) {
      return res.status(400).json({
        success: false,
        message: `Pendaftar belum memenuhi kriteria: ${entri.alasanTidakMemenuhi.join("; ")}`,
        data: {
          peringkat: entri.peringkat,
          alasan: entri.alasanTidakMemenuhi,
        },
      });
    }

    if (abaikanKuota !== true && !entri.masukKuota) {
      return res.status(400).json({
        success: false,
        message: `Peringkat ${entri.peringkat} berada di luar kuota ${ranking.kuota}`,
        data: {
          peringkat: entri.peringkat,
          kuota: ranking.kuota,
        },
      });
    }

    const kelas = await prisma.kelas.findFirst({
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
      kelas.jurusanId &&
      pendaftaran.jurusanId &&
      kelas.jurusanId !== pendaftaran.jurusanId
    ) {
      return res.status(400).json({
        success: false,
        message: "Jurusan kelas tidak sesuai dengan jurusan pilihan pendaftar",
      });
    }

    if (kelas.kapasitas !== null && kelas.kapasitas !== undefined) {
      const jumlahSiswa = await prisma.anggotaKelas.count({
        where: {
          kelasId: kelas.id,
        },
      });

      if (jumlahSiswa >= kelas.kapasitas) {
        return res.status(400).json({
          success: false,
          message: "Kapasitas kelas sudah penuh",
        });
      }
    }

    const roleSiswa = await prisma.peran.findFirst({
      where: {
        nama: "siswa",
        dihapusPada: null,
      },
    });

    if (!roleSiswa) {
      return res.status(500).json({
        success: false,
        message: "Role siswa belum tersedia",
      });
    }

    const existingUser = await prisma.pengguna.findUnique({
      where: {
        nisn: pendaftaran.nisn,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "NISN sudah terdaftar sebagai pengguna",
      });
    }

    const usernameBase = pendaftaran.nisn;

    const email = pendaftaran.email || `${pendaftaran.nisn}@smartschool.local`;

    const existingEmail = await prisma.pengguna.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email sudah digunakan oleh pengguna lain",
      });
    }

    const password = await bcrypt.hash(pendaftaran.nisn, 10);

    const result = await prisma.$transaction(async (tx) => {
      const pengguna = await tx.pengguna.create({
        data: {
          sekolahId,
          peranId: roleSiswa.id,
          namaPengguna: usernameBase,
          email,
          kataSandi: password,
          namaLengkap: pendaftaran.namaLengkap,
          nisn: pendaftaran.nisn,
          nik: pendaftaran.nik ?? undefined,
          status: "aktif",
          tempatLahir: pendaftaran.tempatLahir,
          tanggalLahir: pendaftaran.tanggalLahir,
          jenisKelamin: pendaftaran.jenisKelamin,
          alamat: pendaftaran.alamat,
          noTelepon: pendaftaran.telepon,
          namaAyah: pendaftaran.namaAyah,
          namaIbu: pendaftaran.namaIbu,
          dibuatOleh: adminId,
          diperbaruiOleh: adminId,
        },
      });

      const anggota = await tx.anggotaKelas.create({
        data: {
          kelasId: kelas.id,
          penggunaId: pengguna.id,
          tahunAjaranId: kelas.tahunAjaranId,
        },
      });

      const updated = await tx.pendaftaranPpdb.update({
        where: {
          id: pendaftaran.id,
        },
        data: {
          status: "lulus",
          kelasId: kelas.id,
          dikonversiKePenggunaId: pengguna.id,
          dikonversiPada: new Date(),
          diperbaruiOleh: adminId,
        },
      });

      return {
        pengguna,
        anggota,
        pendaftaran: updated,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Pendaftar berhasil dikonversi menjadi siswa",
      data: {
        pengguna: {
          id: result.pengguna.id,
          namaPengguna: result.pengguna.namaPengguna,
          email: result.pengguna.email,
          namaLengkap: result.pengguna.namaLengkap,
          nisn: result.pengguna.nisn,
        },
        kelasId: result.anggota.kelasId,
        pendaftaranId: result.pendaftaran.id,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Gagal melakukan verifikasi dan konversi PPDB",
    });
  }
};