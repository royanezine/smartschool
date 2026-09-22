import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { prisma } from "../config/db";
import bycrypt from "bcryptjs";
import { paginatedResponse } from "../utils/responseFormatter";
import { normalizeRole, canManageRole } from "../utils/rbac";
import { Prisma } from "@prisma/client";

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
    }

    if (status) {
      AND.push({
        status,
      });
    }

    if (requestedRole) {
      AND.push({
        peran: {
          is: {
            nama: normalizeRole(requestedRole),
          },
        },
      });
    }

    if (actorRole === "admin_sekolah") {
      AND.push({
        peran: {
          is: {
            nama: {
              notIn: ["super_admin", "admin_yayasan", "admin_sekolah"],
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

    const passwordHash = await bycrypt.hash(kataSandi, 10);

    const user = await prisma.pengguna.create({
      data: {
        namaPengguna,
        email,
        kataSandi: passwordHash,
        namaLengkap,
        peranId,
        sekolahId: sekolahId || null,

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
    } = req.body;

    const existingUser = await prisma.pengguna.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    const target = await prisma.pengguna.findUnique({
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

    const data: any = {
      ...(namaPengguna !== undefined && { namaPengguna }),
      ...(email !== undefined && { email }),
      ...(namaLengkap !== undefined && { namaLengkap }),
      ...(peranId !== undefined && { peranId }),
      ...(sekolahId !== undefined && { sekolahId }),
      ...(nipd !== undefined && { nipd }),
      ...(nip !== undefined && { nip }),
      ...(nuptk !== undefined && { nuptk }),
      ...(nisn !== undefined && { nisn }),
      ...(jenisKelamin !== undefined && { jenisKelamin }),
      ...(tempatLahir !== undefined && { tempatLahir }),
      ...(tanggalLahir !== undefined && {
        tanggalLahir: new Date(tanggalLahir),
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
      ...(kota !== undefined && { kota }),
    };

    if (kataSandi) {
      data.kataSandi = await bycrypt.hash(kataSandi, 10);
    }

    const user = await prisma.pengguna.update({
      where: { id },
      data,
      select: {
        id: true,
        namaPengguna: true,
        email: true,
        namaLengkap: true,
        status: true,
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
      if (user.sekolahId !== req.user?.sekolahId) {
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

    const updatedUser = await prisma.pengguna.update({
      where: { id },
      data: { status: "nonaktif", dihapusPada: new Date() },
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
          tanggalLahir: new Date(tanggalLahir),
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
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Pengguna tidak ditemukan" });
    }

    // Pengecekan cakupan sekolah jika bukan super_admin/admin_yayasan
    const userRole = await prisma.peran.findUnique({ where: { id: roleId } });
    if (
      userRole?.nama !== "super_admin" &&
      userRole?.nama !== "admin_yayasan" &&
      user.sekolah?.id !== sekolahId
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Akses ditolak: Pengguna berada di luar sekolah Anda",
        });
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Detail pengguna berhasil diambil",
        data: user,
      });
  } catch (error) {
    console.error("Error getUserById:", error);
    return res
      .status(500)
      .json({ success: false, message: "Terjadi kesalahan server" });
  }
};