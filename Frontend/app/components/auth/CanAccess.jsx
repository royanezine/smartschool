"use client";

import { hasMenuAccess } from "@/lib/auth";

/**
 * Hook untuk mengecek hak akses granular (view, create, update, delete) pada suatu menu baku
 * @param {string} menuName Nama menu baku backend (misal: "keuangan dan kas", "akademik", dll)
 */
export function useMenuAccess(menuName) {
  return {
    canView: hasMenuAccess(menuName, "view"),
    canCreate: hasMenuAccess(menuName, "create"),
    canUpdate: hasMenuAccess(menuName, "update"),
    canDelete: hasMenuAccess(menuName, "delete"),
  };
}

/**
 * Komponen pembungkus deklaratif untuk memproteksi elemen UI / tombol aksi berdasarkan hak akses Jabatan
 * @example
 * <CanAccess menu="keuangan dan kas" action="create">
 *   <button>Tambah Data</button>
 * </CanAccess>
 */
export default function CanAccess({
  menu,
  action = "view",
  fallback = null,
  children,
}) {
  const allowed = hasMenuAccess(menu, action);

  if (!allowed) {
    return fallback;
  }

  return <>{children}</>;
}
