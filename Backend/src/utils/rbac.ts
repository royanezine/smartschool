export const ROLE_LEVEL: Record<string, number> = {
  super_admin: 100,
  admin_yayasan: 80,
  admin_sekolah: 60,
  guru: 40,
  siswa: 20,
};

export const normalizeRole = (role?: string | null): string => {
  return role?.trim().toLowerCase() ?? "";
};

export const isSuperAdmin = (role?: string | null): boolean => {
  return normalizeRole(role) === "super_admin";
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

  const actorLevel = ROLE_LEVEL[actor] ?? 0;
  const targetLevel = ROLE_LEVEL[target] ?? 0;

  return actorLevel > targetLevel;
};
