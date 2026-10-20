import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/db";
import bcrypt from "bcryptjs";
import { paginatedResponse, successResponse } from "../utils/responseFormatter";
import { normalizeRole, canManageRole } from "../utils/rbac";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/appError";
import { normalizeShiftKerja } from "../utils/shiftKerja";

const isGuru = (roleName?: string | null) => normalizeRole(roleName) === "guru";

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const actorRole = normalizeRole(req.user.role);
    const sekolahId = req.user.sekolahId;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const requestedRole = req.query.role as string;
    const status = req.query.status as string;
    const shiftKerjaQuery = req.query.shiftKerja as string | undefined;
    const sortBy = (req.query.sortBy as string) || "dibuatPada";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    const skip = (page - 1) * limit;

    const AND: Prisma.PenggunaWhereInput[] = [
      {
        dihapusPada: null,
      },
    ];

    if (actorRole !== "super_admin") {
      if (!sekolahId) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak terhubung dengan sekolah",
        });
      }

      AND.push({
        sekolahId,
      });

      AND.push({
        peran: {
          is: {
            nama: {
              notIn: ["super_admin", "superadmin", "Super Admin", "SUPER_ADMIN", "super-admin"],
            },
          },
        },
      });
    }

    if (status) {
      AND.push({
        status,
      });
    }

    if (shiftKerjaQuery) {
      const shift = normalizeShiftKerja(shiftKerjaQuery);
      if (!shift) {
        return res.status(400).json({
          success: false,
          message: "Filter shiftKerja tidak valid (pagi / siang)",
        });
      }
      AND.push({ shiftKerja: shift });
    }

    if (requestedRole) {
      const normRequested = normalizeRole(requestedRole);
      if (actorRole !== "super_admin" && (normRequested === "super_admin" || normRequested === "admin_yayasan")) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak memiliki izin untuk memfilter peran tersebut",
          errorCode: "FORBIDDEN_ROLE_FILTER",
        });
      }
      AND.push({
        peran: {
          is: {
            nama: normRequested,
          },
        },
      });
    }

    if (actorRole === "admin_sekolah") {
      AND.push({
        peran: {
          is: {
            nama: {
              notIn: [
                "super_admin", "superadmin", "Super Admin", "SUPER_ADMIN", "super-admin",
                "admin_yayasan", "adminyayasan", "Admin Yayasan", "ADMIN_YAYASAN",
                "admin_sekolah", "adminsekolah", "Admin Sekolah", "ADMIN_SEKOLAH",
              ],
            },
          },
        },
      });
    }

    if (search) {
      AND.push({
        OR: [
          {
            namaLengkap: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            nip: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            nisn: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            namaPengguna: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      });
    }

    const whereClause: Prisma.PenggunaWhereInput = {
      AND,
    };

    const [users, totalData] = await Promise.all([
      prisma.pengguna.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        select: {
          id: true,
          email: true,
          namaPengguna: true,
          namaLengkap: true,
          avatar: true,
          nipd: true,
          nip: true,
          nisn: true,
          jenisKelamin: true,
          status: true,
          dibuatPada: true,
          jabatan: true,
          golongan: true,
          shiftKerja: true,
          sekolahId: true,

          sekolah: {
            select: {
              id: true,
              nama: true,
              kode: true,
            },
          },

          peran: {
            select: {
              id: true,
              nama: true,
              namaTampilan: true,
            },
          },

          biometrikWajah: true,
        },
      }),

      prisma.pengguna.count({
        where: whereClause,
      }),
    ]);

    return paginatedResponse(
      res,
      "Berhasil mengambil data pengguna",
      users,
      page,
      limit,
      totalData,
    );
  } catch (error) {
    console.error("Error getUsers:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const {
      namaPengguna,
      email,
      kataSandi,
      namaLengkap,
      peranId,
      sekolahId,
      nipd,
      nip,
      nuptk,
      nisn,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      alamat,
      noTelepon,
      avatar,
      // Tambahan data
      jabatan,
      golongan,
      nik,
      namaAyah,
      pekerjaanAyah,
      namaIbu,
      pekerjaanIbu,
      alamatKtp,
      alamatDomisili,
      kecamatan,
      kelurahan,
      kota,
      shiftKerja,
    } = req.body;

    if (!namaPengguna || !email || !kataSandi || !namaLengkap || !peranId) {
      return res.status(400).json({
        success: false,
        message: "Data tidak lengkap",
      });
    }

    const existingUser = await prisma.pengguna.findFirst({
      where: {
        OR: [{ email }, { namaPengguna }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email atau username sudah terdaftar",
      });
    }

    const role = await prisma.peran.findUnique({
      where: { id: peranId },
    });

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role tidak ditemukan",
      });
    }

    const actorRole = normalizeRole(req.user?.role);
    const targetRoleName = normalizeRole(role.nama);

    if (actorRole !== "super_admin") {
      if (role.sekolahId !== null && role.sekolahId !== req.user?.sekolahId) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak dapat menggunakan peran dari sekolah lain",
          errorCode: "FORBIDDEN_ROLE_TENANT",
        });
      }

      if (!canManageRole(actorRole, targetRoleName)) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak dapat membuat pengguna dengan level peran tersebut",
          errorCode: "FORBIDDEN",
        });
      }

      if (!req.user?.sekolahId) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak terhubung dengan sekolah",
          errorCode: "NO_TENANT_LINKED",
        });
      }
    }

    const assignedSekolahId =
      actorRole === "super_admin" ? sekolahId || null : req.user?.sekolahId || null;

    // Shift kerja hanya berlaku untuk Guru dan wajib diisi (pagi / siang)
    let shiftValue: string | null = null;
    if (isGuru(role.nama)) {
      shiftValue = normalizeShiftKerja(shiftKerja);
      if (!shiftValue) {
        return res.status(400).json({
          success: false,
          message: "Shift kerja guru wajib diisi (pagi / siang)",
        });
      }
    }

    const passwordHash = await bcrypt.hash(kataSandi, 10);

    const user = await prisma.pengguna.create({
      data: {
        namaPengguna,
        email,
        kataSandi: passwordHash,
        namaLengkap,
        peranId,
        sekolahId: assignedSekolahId,

        nipd: nipd || null,
        nip: nip || null,
        nuptk: nuptk || null,
        nisn: nisn || null,

        jenisKelamin: jenisKelamin || null,
        tempatLahir: tempatLahir || null,
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
        alamat: alamat || null,
        noTelepon: noTelepon || null,
        avatar: avatar || null,

        jabatan: jabatan || null,
        golongan: golongan || null,
        shiftKerja: shiftValue,
        nik: nik || null,
        namaAyah: namaAyah || null,
        pekerjaanAyah: pekerjaanAyah || null,
        namaIbu: namaIbu || null,
        pekerjaanIbu: pekerjaanIbu || null,
        alamatKtp: alamatKtp || null,
        alamatDomisili: alamatDomisili || null,
        kecamatan: kecamatan || null,
        kelurahan: kelurahan || null,
        kotaKabupaten: kota || null,

        status: "aktif",
      },
      select: {
        id: true,
        namaPengguna: true,
        email: true,
        namaLengkap: true,
        status: true,
        shiftKerja: true,
        sekolah: {
          select: { id: true, nama: true },
        },
        peran: {
          select: { id: true, nama: true, namaTampilan: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: `${role.namaTampilan || role.nama} berhasil dibuat`,
      data: user,
    });
  } catch (error) {
    console.error("Error createUser:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const {
      namaPengguna,
      email,
      kataSandi,
      namaLengkap,
      peranId,
      sekolahId,
      nipd,
      nip,
      nuptk,
      nisn,
      jenisKelamin,
      tempatLahir,
      tanggalLahir,
      alamat,
      noTelepon,
      avatar,
      status,
      // Tambahan data
      jabatan,
      golongan,
      nik,
      namaAyah,
      pekerjaanAyah,
      namaIbu,
      pekerjaanIbu,
      alamatKtp,
      alamatDomisili,
      kecamatan,
      kelurahan,
      kota,
      shiftKerja,
    } = req.body;

    const target = await prisma.pengguna.findUnique({
      where: { id },
      select: {
        id: true,
        sekolahId: true,
        shiftKerja: true,
        peran: {
          select: {
            nama: true,
          },
        },
      },
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    const actorRole = normalizeRole(req.user?.role);
    const targetRole = normalizeRole(target.peran?.nama);

    if (actorRole !== "super_admin") {
      if (target.sekolahId !== req.user?.sekolahId) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak dapat mengakses pengguna dari sekolah lain",
        });
      }

      if (!canManageRole(actorRole, targetRole)) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak dapat mengelola role dengan level tersebut",
        });
      }
    }

    // Tentukan role akhir (role lama atau role baru kalau peranId diubah)
    const wasGuru = isGuru(target.peran?.nama);
    let finalRoleName: string | null | undefined = target.peran?.nama;

    if (peranId !== undefined && peranId !== null) {
      const newRole = await prisma.peran.findUnique({ where: { id: peranId } });
      if (!newRole) {
        return res.status(400).json({
          success: false,
          message: "Role tidak ditemukan",
        });
      }
      if (actorRole !== "super_admin") {
        if (newRole.sekolahId !== null && newRole.sekolahId !== req.user?.sekolahId) {
          return res.status(403).json({
            success: false,
            message: "Anda tidak dapat menggunakan peran dari sekolah lain",
            errorCode: "FORBIDDEN_ROLE_TENANT",
          });
        }
        if (!canManageRole(actorRole, newRole.nama)) {
          return res.status(403).json({
            success: false,
            message: "Anda tidak dapat memberikan peran dengan level tersebut",
            errorCode: "FORBIDDEN",
          });
        }
      }
      finalRoleName = newRole.nama;
    }

    // Self-demotion protection
    if (
      target.id === req.user?.userId &&
      (status === "nonaktif" ||
        (peranId && normalizeRole(finalRoleName) !== "super_admin" && targetRole === "super_admin"))
    ) {
      return res.status(400).json({
        success: false,
        message: "Anda tidak dapat menonaktifkan atau menurunkan peran akun Anda sendiri",
        errorCode: "SELF_DEMOTION_FORBIDDEN",
      });
    }

    // Last superadmin protection
    if (
      targetRole === "super_admin" &&
      (status === "nonaktif" ||
        (peranId && normalizeRole(finalRoleName) !== "super_admin"))
    ) {
      const activeSuperAdminCount = await prisma.pengguna.count({
        where: {
          peran: { nama: "super_admin" },
          status: "aktif",
          dihapusPada: null,
          id: { not: target.id },
        },
      });

      if (activeSuperAdminCount === 0) {
        return res.status(400).json({
          success: false,
          message: "Tidak dapat menonaktifkan atau menurunkan peran super admin terakhir dalam sistem",
          errorCode: "LAST_SUPERADMIN_PROTECTION",
        });
      }
    }

    const willBeGuru = isGuru(finalRoleName);

    const data: any = {
      ...(namaPengguna !== undefined && { namaPengguna }),
      ...(email !== undefined && { email }),
      ...(namaLengkap !== undefined && { namaLengkap }),
      ...(peranId !== undefined && { peranId }),
      ...(sekolahId !== undefined && actorRole === "super_admin" && { sekolahId }),
      ...(nipd !== undefined && { nipd }),
      ...(nip !== undefined && { nip }),
      ...(nuptk !== undefined && { nuptk }),
      ...(nisn !== undefined && { nisn }),
      ...(jenisKelamin !== undefined && { jenisKelamin }),
      ...(tempatLahir !== undefined && { tempatLahir }),
      ...(tanggalLahir !== undefined && {
        tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
      }),
      ...(alamat !== undefined && { alamat }),
      ...(noTelepon !== undefined && { noTelepon }),
      ...(avatar !== undefined && { avatar }),
      ...(status !== undefined && { status }),

      ...(jabatan !== undefined && { jabatan }),
      ...(golongan !== undefined && { golongan }),
      ...(nik !== undefined && { nik }),
      ...(namaAyah !== undefined && { namaAyah }),
      ...(pekerjaanAyah !== undefined && { pekerjaanAyah }),
      ...(namaIbu !== undefined && { namaIbu }),
      ...(pekerjaanIbu !== undefined && { pekerjaanIbu }),
      ...(alamatKtp !== undefined && { alamatKtp }),
      ...(alamatDomisili !== undefined && { alamatDomisili }),
      ...(kecamatan !== undefined && { kecamatan }),
      ...(kelurahan !== undefined && { kelurahan }),
      // FIX: field di schema bernama kotaKabupaten, bukan kota
      ...(kota !== undefined && { kotaKabupaten: kota }),
    };

    // Aturan shift kerja: hanya untuk Guru
    if (willBeGuru) {
      const roleBaruJadiGuru = !wasGuru;

      if (shiftKerja !== undefined || roleBaruJadiGuru) {
        const shiftValue = normalizeShiftKerja(shiftKerja);
        if (!shiftValue) {
          return res.status(400).json({
            success: false,
            message: "Shift kerja guru wajib diisi (pagi / siang)",
          });
        }
        data.shiftKerja = shiftValue;
      }
    } else if (target.shiftKerja) {
      // Bukan guru lagi -> bersihkan shift lama
      data.shiftKerja = null;
    }

    if (kataSandi) {
      data.kataSandi = await bcrypt.hash(kataSandi, 10);
    }

    data.diperbaruiOleh = req.user?.userId;

    const user = await prisma.pengguna.update({
      where: { id },
      data,
      select: {
        id: true,
        namaPengguna: true,
        email: true,
        namaLengkap: true,
        status: true,
        shiftKerja: true,
        sekolah: {
          select: { id: true, nama: true },
        },
        peran: {
          select: { id: true, nama: true, namaTampilan: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Pengguna berhasil diperbarui",
      data: user,
    });
  } catch (error) {
    console.error("Error updateUser:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const user = await prisma.pengguna.findUnique({
      where: { id },
      select: {
        id: true,
        sekolahId: true,
        peran: {
          select: {
            nama: true,
          },
        },
      },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }
    const actorRole = normalizeRole(req.user?.role);
    const targetRole = normalizeRole(user.peran?.nama);

    if (actorRole !== "super_admin") {
      if (targetRole === "super_admin" || targetRole === "admin_yayasan") {
        return res.status(403).json({
          success: false,
          message: "Anda tidak dapat mengelola role dengan level tersebut",
          errorCode: "FORBIDDEN",
        });
      }

      if (user.sekolahId !== req.user?.sekolahId) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak dapat mengakses pengguna dari sekolah lain",
          errorCode: "FORBIDDEN",
        });
      }

      if (!canManageRole(actorRole, targetRole)) {
        return res.status(403).json({
          success: false,
          message: "Anda tidak dapat mengelola role dengan level tersebut",
          errorCode: "FORBIDDEN",
        });
      }
    }

    // Self-deletion protection
    if (user.id === req.user?.userId) {
      return res.status(400).json({
        success: false,
        message: "Anda tidak dapat menghapus atau menonaktifkan akun Anda sendiri",
        errorCode: "SELF_DELETION_FORBIDDEN",
      });
    }

    // Last superadmin protection
    if (targetRole === "super_admin") {
      const activeSuperAdminCount = await prisma.pengguna.count({
        where: {
          peran: { nama: "super_admin" },
          status: "aktif",
          dihapusPada: null,
          id: { not: user.id },
        },
      });

      if (activeSuperAdminCount === 0) {
        return res.status(400).json({
          success: false,
          message: "Tidak dapat menghapus super admin terakhir dalam sistem",
          errorCode: "LAST_SUPERADMIN_PROTECTION",
        });
      }
    }

    const updatedUser = await prisma.pengguna.update({
      where: { id },
      data: { status: "nonaktif", dihapusPada: new Date() },
      select: {
        id: true,
        namaPengguna: true,
        email: true,
        namaLengkap: true,
        status: true,
        dihapusPada: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Pengguna berhasil dinonaktifkan",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error deleteUser:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

export const profile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await prisma.pengguna.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        id: true,
        email: true,
        namaPengguna: true,
        namaLengkap: true,
        avatar: true,
        nipd: true,
        nip: true,
        nuptk: true,
        nisn: true,
        nik: true,
        jabatan: true,
        golongan: true,
        shiftKerja: true,
        jenisKelamin: true,
        tempatLahir: true,
        tanggalLahir: true,
        alamat: true,
        alamatDomisili: true,
        noTelepon: true,
        status: true,
        terakhirLogin: true,
        dibuatPada: true,
        diperbaruiPada: true,
        diperbaruiOleh: true,

        sekolah: {
          select: {
            id: true,
            nama: true,
            subdomain: true,
            kode: true,
            alamat: true,
            telepon: true,
            email: true,
            logoBesarUrl: true,
            logoKecilUrl: true,
            status: true,
          },
        },

        peran: {
          select: {
            id: true,
            nama: true,
            namaTampilan: true,
            deskripsi: true,
            status: true,
          },
        },

        biometrikWajah: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile berhasil diambil",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      namaLengkap,
      noTelepon,
      alamat,
      avatar,
      alamatDomisili,
      tempatLahir,
      tanggalLahir,
    } = req.body;

    // shiftKerja sengaja tidak bisa diubah sendiri lewat profil;
    // hanya admin lewat updateUser.
    const user = await prisma.pengguna.update({
      where: {
        id: req.user.userId,
      },
      data: {
        ...(namaLengkap !== undefined && { namaLengkap }),
        ...(noTelepon !== undefined && { noTelepon }),
        ...(alamat !== undefined && { alamat }),
        ...(avatar !== undefined && { avatar }),
        ...(alamatDomisili !== undefined && { alamatDomisili }),
        ...(tempatLahir !== undefined && { tempatLahir }),
        ...(tanggalLahir !== undefined && {
          tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : null,
        }),
      },
      select: {
        id: true,
        namaLengkap: true,
        email: true,
        namaPengguna: true,
        avatar: true,
        noTelepon: true,
        alamat: true,
        alamatDomisili: true,
        shiftKerja: true,
        status: true,

        sekolah: {
          select: { id: true, nama: true, subdomain: true },
        },

        peran: {
          select: { id: true, nama: true, namaTampilan: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile berhasil diupdate",
      data: user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const sekolahId = req.user?.sekolahId;
    const roleId = req.user?.roleId;

    const user = await prisma.pengguna.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        namaPengguna: true,
        namaLengkap: true,
        avatar: true,
        nipd: true,
        nip: true,
        nuptk: true,
        nisn: true,
        nik: true,
        jabatan: true,
        golongan: true,
        shiftKerja: true,
        jenisKelamin: true,
        tempatLahir: true,
        tanggalLahir: true,
        alamat: true,
        alamatDomisili: true,
        noTelepon: true,
        status: true,
        dibuatPada: true,
        sekolah: { select: { id: true, nama: true, kode: true } },
        peran: { select: { id: true, nama: true, namaTampilan: true } },
        biometrikWajah: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan" });
    }

    const actorRole = normalizeRole(req.user?.role);
    const targetRole = normalizeRole(user.peran?.nama);

    if (actorRole !== "super_admin") {
      if (targetRole === "super_admin" || targetRole === "admin_yayasan") {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak: Anda tidak memiliki izin untuk melihat pengguna ini",
          errorCode: "FORBIDDEN",
        });
      }

      if (!user.sekolah?.id || user.sekolah.id !== sekolahId) {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak: Pengguna berada di luar sekolah Anda",
          errorCode: "FORBIDDEN",
        });
      }

      if (!canManageRole(actorRole, targetRole)) {
        return res.status(403).json({
          success: false,
          message: "Akses ditolak: Anda tidak memiliki izin untuk melihat pengguna ini",
          errorCode: "FORBIDDEN",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Detail pengguna berhasil diambil",
      data: user,
    });
  } catch (error) {
    console.error("Error getUserById:", error);
    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server", errorCode: "INTERNAL_SERVER_ERROR" });
  }
};

export const quickResetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const targetUserId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!targetUserId) {
      throw new AppError("ID pengguna tidak valid", 400);
    }

    const adminSekolahId = req.user?.sekolahId;
    const actorRole = normalizeRole(req.user?.role);

    const targetUser = await prisma.pengguna.findUnique({
      where: { id: targetUserId },
      include: {
        peran: {
          select: { nama: true },
        },
      },
    });

    if (!targetUser) throw new AppError("Pengguna tidak ditemukan", 404);

    const targetRole = normalizeRole(targetUser.peran?.nama);

    if (actorRole !== "super_admin") {
      if (targetRole === "super_admin" || targetRole === "admin_yayasan") {
        throw new AppError("Akses ditolak untuk mereset pengguna ini", 403, "FORBIDDEN");
      }
      if (!targetUser.sekolahId || targetUser.sekolahId !== adminSekolahId) {
        throw new AppError("Akses ditolak untuk mereset pengguna ini", 403, "FORBIDDEN");
      }
      if (!canManageRole(actorRole, targetRole)) {
        throw new AppError("Anda tidak dapat mereset kata sandi pengguna dengan level peran tersebut", 403, "FORBIDDEN");
      }
    }

    const requestedPassword = req.body?.kataSandi || req.body?.password;
    if (requestedPassword && requestedPassword.length < 8) {
      throw new AppError("Kata sandi baru minimal 8 karakter", 400, "VALIDATION_ERROR");
    }
    const newPassword = requestedPassword || "12345678";
    const defaultPassword = await bcrypt.hash(newPassword, 10);

    await prisma.pengguna.update({
      where: { id: targetUserId },
      data: { kataSandi: defaultPassword, diperbaruiOleh: req.user?.userId },
    });

    return successResponse(
      res,
      requestedPassword
        ? "Kata sandi berhasil direset"
        : "Kata sandi berhasil direset menjadi: 12345678",
    );
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        errorCode: error.errorCode || (error.statusCode === 403 ? "FORBIDDEN" : "BUSINESS_ERROR"),
      });
    }
    console.error("Error quickResetPassword:", error);
    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server", errorCode: "INTERNAL_SERVER_ERROR" });
  }
};