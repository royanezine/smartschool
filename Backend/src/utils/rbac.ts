export const ROLE_LEVEL: Record<string, number> = {
  super_admin: 100,
  admin_yayasan: 80,
  admin_sekolah: 60,
  guru: 40,
  siswa: 20,
};

export const normalizeRole = (role?: string | null): string => {
  if (!role) return "";
  const cleaned = role.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (cleaned === "superadmin") return "super_admin";
  if (cleaned === "adminyayasan") return "admin_yayasan";
  if (cleaned === "adminsekolah") return "admin_sekolah";
  return cleaned;
};

export const isSuperAdmin = (role?: string | null): boolean => {
  const norm = normalizeRole(role);
  return norm === "super_admin";
};

export const canManageRole = (
  actorRole?: string | null,
  targetRole?: string | null,
): boolean => {
  const actor = normalizeRole(actorRole);
  const target = normalizeRole(targetRole);

  if (actor === "super_admin") {
    return true;
  }

  // Non-superadmin cannot manage or escalate to super_admin under any circumstances
  if (target === "super_admin") {
    return false;
  }

  const actorLevel = ROLE_LEVEL[actor] ?? 0;
  const targetLevel = ROLE_LEVEL[target] ?? 0;

  return actorLevel > targetLevel;
};
