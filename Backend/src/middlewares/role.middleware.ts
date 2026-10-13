import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { prisma } from "../config/db";
import { normalizeRole, isSuperAdmin } from "../utils/rbac";

export const authorizeRoles = (...allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
          errorCode: "UNAUTHORIZED",
        });
      }

      if (isSuperAdmin(req.user.role)) {
        return next();
      }

      const roleName =
        req.user.role ||
        (req.user.roleId
          ? (
              await prisma.peran.findUnique({
                where: { id: req.user.roleId },
                select: { nama: true },
              })
            )?.nama
          : null);

      if (!roleName) {
        return res.status(403).json({
          success: false,
          message: "Akses Ditolak: Peran pengguna tidak valid",
          errorCode: "ROLE_NOT_FOUND",
        });
      }

      const normalizedUserRole = normalizeRole(roleName);
      const normalizedAllowed = allowedRoles.map(normalizeRole);

      if (!normalizedAllowed.includes(normalizedUserRole)) {
        return res.status(403).json({
          success: false,
          message: "Akses Ditolak: Anda tidak memiliki izin untuk tindakan ini",
          errorCode: "FORBIDDEN_ROLE",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
