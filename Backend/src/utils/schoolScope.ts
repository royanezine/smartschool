import { AppError } from "./appError";
import { isSuperAdmin } from "./rbac";

export function resolveSchoolId(
  user: { role?: string; sekolahId?: string } | undefined,
  requestedSchoolId?: string,
): string | undefined {
  if (!user) throw new AppError("Unauthorized", 401);
  if (isSuperAdmin(user.role)) return requestedSchoolId || user.sekolahId;
  if (!user.sekolahId) throw new AppError("Anda tidak terhubung dengan sekolah", 403);
  if (requestedSchoolId && requestedSchoolId !== user.sekolahId) {
    throw new AppError("Akses sekolah lain ditolak", 403);
  }
  return user.sekolahId;
}
