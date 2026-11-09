import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { isSuperAdmin } from "../utils/rbac";
import { prisma } from "../config/db";
import { AksiMenu } from "../constants/menu.constant";

interface ItemAksesMenu {
  menu: string;
  permissions: string[];
}

/**
 * Normalisasi string nama menu untuk perbandingan toleran (case-insensitive & trim).
 */
const normalizeMenuName = (name: string): string =>
  name.trim().toLowerCase().replace(/\s+/g, " ");

/**
 * Middleware granular untuk memvalidasi hak akses menu pengguna berdasarkan Jabatan (RBAC Jabatan).
 *
 * Aturan:
 * 1. Pengguna wajib sudah terautentikasi (req.user).
 * 2. Fallback Role: Super Admin selalu lolos (full access).
 * 3. Jika pengguna tidak memiliki Jabatan yang aktif/terdaftar, akses ditolak (403).
 * 4. Jika menu atau aksi (view, create, update, delete) tidak diizinkan untuk Jabatan pengguna, akses ditolak (403).
 *
 * @param menuName Nama menu baku yang dibutuhkan (misal: "perpustakaan", "absen saya", dll)
 * @param action Aksi yang diminta (default: "view")
 */
export const requireAksesMenu = (
  menuName: string,
  action: AksiMenu | string = "view",
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: Anda belum login",
          errorCode: "UNAUTHORIZED",
        });
      }

      // 1. Fallback Super Admin: Memiliki akses penuh ke seluruh menu platform
      if (isSuperAdmin(user.role)) {
        return next();
      }

      // 2. Ambil daftar aksesMenu dari session req.user atau fallback fetch dari database
      let daftarAkses: ItemAksesMenu[] = Array.isArray(user.aksesMenu)
        ? (user.aksesMenu as ItemAksesMenu[])
        : [];

      if (daftarAkses.length === 0) {
        const dbUser = await prisma.pengguna.findUnique({
          where: { id: user.userId },
          select: {
            jabatanRef: {
              select: {
                id: true,
                namaJabatan: true,
                aksesMenu: true,
              },
            },
          },
        });

        const dbAkses = dbUser?.jabatanRef?.aksesMenu;
        if (Array.isArray(dbAkses)) {
          daftarAkses = dbAkses as unknown as ItemAksesMenu[];
        }
      }

      // 3. Jika user tidak memiliki jabatan atau daftar aksesMenu kosong
      if (daftarAkses.length === 0) {
        return res.status(403).json({
          success: false,
          message: `Akses ditolak: Anda tidak memiliki jabatan atau hak akses menu untuk "${menuName}"`,
          errorCode: "FORBIDDEN_NO_JABATAN",
        });
      }

      // 4. Cari izin untuk menu yang diminta (case-insensitive)
      const targetMenuNormalized = normalizeMenuName(menuName);
      const izinMenu = daftarAkses.find(
        (item) => normalizeMenuName(item.menu) === targetMenuNormalized,
      );

      if (!izinMenu) {
        return res.status(403).json({
          success: false,
          message: `Akses ditolak: Jabatan Anda tidak memiliki izin akses ke menu "${menuName}"`,
          errorCode: "FORBIDDEN_MENU_ACCESS",
        });
      }

      // 5. Periksa apakah aksi yang diminta diizinkan
      const targetActionNormalized = action.trim().toLowerCase();
      const actionPermissions = Array.isArray(izinMenu.permissions)
        ? izinMenu.permissions.map((p) => String(p).trim().toLowerCase())
        : [];

      if (!actionPermissions.includes(targetActionNormalized)) {
        return res.status(403).json({
          success: false,
          message: `Akses ditolak: Jabatan Anda tidak memiliki izin "${action}" pada menu "${menuName}"`,
          errorCode: "FORBIDDEN_ACTION_PERMISSION",
        });
      }

      // Lolos otorisasi hak akses menu berbasis jabatan
      return next();
    } catch (error) {
      console.error("[requireAksesMenu] Terjadi kesalahan evaluasi akses menu:", error);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada verifikasi hak akses menu",
        errorCode: "INTERNAL_SERVER_ERROR",
      });
    }
  };
};
