import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  createRoleSchema,
  updateRoleSchema,
} from "../validations/role.validation";

// Helper
function isSuperAdmin(req: AuthRequest): boolean {
  const user = req.user;
  if (!user) return false;
  if (user.role === "super_admin") return true;
  return user.izin.includes("*");
}

// Get Izin
export const getIzin = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Belum login" });
    }

    const superAdmin = isSuperAdmin(req);

    const izin = await prisma.izin.findMany({
      where: {
        status: "aktif",
        dihapusPada: null,
        ...(superAdmin ? {} : { nama: { in: user.izin } }),
      },
      orderBy: [{ modul: "asc" }, { aksi: "asc" }],
    });

    return res.status(200).json({
      success: true,
      message: "Daftar izin",
      data: izin,
    });
  } catch (error) {
    console.error("Get izin error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil daftar izin" });
  }
};

// Get Role
export const getRoles = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Belum login" });
    }

    const superAdmin = isSuperAdmin(req);
    const baseWhere = { dihapusPada: null };

    const where = superAdmin
      ? baseWhere
      : user.sekolahId
        ? {
            ...baseWhere,
            OR: [{ sekolahId: null }, { sekolahId: user.sekolahId }],
          }
        : { ...baseWhere, sekolahId: null };

    const roles = await prisma.peran.findMany({
      where,
      include: {
        _count: { select: { peranIzin: true, pengguna: true } },
        sekolah: { select: { id: true, nama: true } },
      },
      orderBy: [{ sekolahId: "asc" }, { nama: "asc" }],
    });

    return res.status(200).json({
      success: true,
      message: "Daftar role",
      data: roles,
    });
  } catch (error) {
    console.error("Get roles error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil daftar role" });
  }
};

// Get izin role
export const getRoleById = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Belum login" });
    }

    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "ID role tidak valid" });
    }

    const role = await prisma.peran.findFirst({
      where: { id, dihapusPada: null },
      include: { peranIzin: { include: { izin: true } } },
    });

    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role tidak ditemukan" });
    }

    const superAdmin = isSuperAdmin(req);
    if (!superAdmin && role.sekolahId && role.sekolahId !== user.sekolahId) {
      return res.status(403).json({ success: false, message: "Akses ditolak" });
    }

    return res.status(200).json({
      success: true,
      message: "Detail role",
      data: {
        id: role.id,
        nama: role.nama,
        namaTampilan: role.namaTampilan,
        deskripsi: role.deskripsi,
        sekolahId: role.sekolahId,
        izinIds: role.peranIzin.map((pi) => pi.izinId),
        izin: role.peranIzin.map((pi) => ({
          id: pi.izin.id,
          nama: pi.izin.nama,
          modul: pi.izin.modul,
          aksi: pi.izin.aksi,
        })),
      },
    });
  } catch (error) {
    console.error("Get role by id error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengambil detail role" });
  }
};

// get role by sekolah
export const createRole = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Belum login" });
    }

    const body = createRoleSchema.parse(req.body);
    const superAdmin = isSuperAdmin(req);
    const sekolahId: string | null = superAdmin
      ? null
      : (user.sekolahId ?? null);

    if (!superAdmin && !sekolahId) {
      return res
        .status(403)
        .json({ success: false, message: "User tidak terikat sekolah" });
    }

    // Cek nama unik dalam scope
    const existing = await prisma.peran.findFirst({
      where: { nama: body.nama, sekolahId },
    });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Nama role sudah dipakai" });
    }

    // Ambil izin dari DB
    const izinRecords = await prisma.izin.findMany({
      where: { id: { in: body.izinIds }, dihapusPada: null },
      select: { id: true, nama: true },
    });

    if (izinRecords.length !== body.izinIds.length) {
      return res
        .status(400)
        .json({ success: false, message: "Beberapa izin tidak ditemukan" });
    }

    // Admin sekolah: hanya boleh assign izin yang dia punya
    if (!superAdmin) {
      const izinUser = new Set(user.izin);
      const terlarang = izinRecords.filter((i) => !izinUser.has(i.nama));

      if (terlarang.length > 0) {
        return res.status(403).json({
          success: false,
          message: `Tidak boleh assign izin yang tidak Anda miliki: ${terlarang
            .map((i) => i.nama)
            .join(", ")}`,
        });
      }
    }

    const role = await prisma.peran.create({
      data: {
        nama: body.nama,
        namaTampilan: body.namaTampilan,
        deskripsi: body.deskripsi ?? null,
        sekolahId,
        status: "aktif",
        dibuatOleh: user.userId,
        diperbaruiOleh: user.userId,
        peranIzin: {
          create: body.izinIds.map((izinId) => ({
            izinId,
            dibuatOleh: user.userId,
            diperbaruiOleh: user.userId,
          })),
        },
      },
      include: { peranIzin: { include: { izin: true } } },
    });

    return res.status(201).json({
      success: true,
      message: "Role berhasil dibuat",
      data: role,
    });
  } catch (error) {
    console.error("Create role error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal membuat role" });
  }
};

// ============================================
// PUT /api/v1/role/:id
// Update role + replace daftar izin
// ============================================
export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Belum login" });
    }

    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "ID role tidak valid" });
    }

    const body = updateRoleSchema.parse(req.body);
    const superAdmin = isSuperAdmin(req);

    const role = await prisma.peran.findFirst({
      where: { id, dihapusPada: null },
    });
    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role tidak ditemukan" });
    }

    // Guard: admin sekolah hanya boleh edit role custom sekolahnya
    if (!superAdmin) {
      if (role.sekolahId === null) {
        return res.status(403).json({
          success: false,
          message: "Role global hanya bisa diubah super admin",
        });
      }
      if (role.sekolahId !== user.sekolahId) {
        return res
          .status(403)
          .json({ success: false, message: "Akses ditolak" });
      }
    }

    // Validasi izin kalau ada perubahan
    if (body.izinIds) {
      const izinRecords = await prisma.izin.findMany({
        where: { id: { in: body.izinIds }, dihapusPada: null },
        select: { id: true, nama: true },
      });

      if (izinRecords.length !== body.izinIds.length) {
        return res
          .status(400)
          .json({ success: false, message: "Beberapa izin tidak ditemukan" });
      }

      if (!superAdmin) {
        const izinUser = new Set(user.izin);
        const terlarang = izinRecords.filter((i) => !izinUser.has(i.nama));

        if (terlarang.length > 0) {
          return res.status(403).json({
            success: false,
            message: `Tidak boleh assign izin yang tidak Anda miliki: ${terlarang
              .map((i) => i.nama)
              .join(", ")}`,
          });
        }
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Replace izin kalau dikirim
      if (body.izinIds) {
        await tx.peranIzin.deleteMany({ where: { peranId: role.id } });
        await tx.peranIzin.createMany({
          data: body.izinIds.map((izinId) => ({
            peranId: role.id,
            izinId,
            dibuatOleh: user.userId,
            diperbaruiOleh: user.userId,
          })),
        });
      }

      return tx.peran.update({
        where: { id: role.id },
        data: {
          ...(body.nama !== undefined && { nama: body.nama }),
          ...(body.namaTampilan !== undefined && {
            namaTampilan: body.namaTampilan,
          }),
          ...(body.deskripsi !== undefined && { deskripsi: body.deskripsi }),
          diperbaruiOleh: user.userId,
        },
        include: { peranIzin: { include: { izin: true } } },
      });
    });

    return res.status(200).json({
      success: true,
      message: "Role berhasil diupdate",
      data: updated,
    });
  } catch (error) {
    console.error("Update role error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal mengupdate role" });
  }
};

// ============================================
// DELETE /api/v1/role/:id
// Soft delete — set dihapusPada, tidak hapus row
// ============================================
export const deleteRole = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Belum login" });
    }

    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "ID role tidak valid" });
    }

    const role = await prisma.peran.findFirst({
      where: { id, dihapusPada: null },
    });
    if (!role) {
      return res
        .status(404)
        .json({ success: false, message: "Role tidak ditemukan" });
    }

    const superAdmin = isSuperAdmin(req);
    if (!superAdmin) {
      if (role.sekolahId === null) {
        return res.status(403).json({
          success: false,
          message: "Role global hanya bisa dihapus super admin",
        });
      }
      if (role.sekolahId !== user.sekolahId) {
        return res
          .status(403)
          .json({ success: false, message: "Akses ditolak" });
      }
    }

    // Cek apakah masih dipakai pengguna aktif
    const dipakai = await prisma.pengguna.count({
      where: { peranId: role.id, dihapusPada: null },
    });

    if (dipakai > 0) {
      return res.status(400).json({
        success: false,
        message: `Role masih dipakai oleh ${dipakai} pengguna. Pindahkan dulu sebelum hapus.`,
      });
    }

    // Soft delete
    await prisma.peran.update({
      where: { id: role.id },
      data: {
        dihapusPada: new Date(),
        dihapusOleh: user.userId,
        status: "nonaktif",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Role berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete role error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Gagal menghapus role" });
  }
};
