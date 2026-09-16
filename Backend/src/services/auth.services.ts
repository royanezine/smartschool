import { prisma } from "../config/db";

export async function ambilIzinDanModul(
  peranId: string | null,
  sekolahId: string | null,
  isSuperAdmin: boolean = false,
): Promise<{ izin: string[]; modulAktif: string[] }> {
  const rowsPeran: { izin: { nama: string } }[] = peranId
    ? await prisma.peranIzin.findMany({
        where: { peranId },
        select: { izin: { select: { nama: true } } },
      })
    : [];

  let modulAktif: string[] = [];

  if (isSuperAdmin) {
    const semuaModul = await prisma.modul.findMany({
      where: { sistem: false },
      select: { kode: true },
    });
    modulAktif = semuaModul.map((m) => m.kode);
  } else if (sekolahId) {
    const rowsModul: { modul: { kode: string } }[] =
      await prisma.sekolahModul.findMany({
        where: { sekolahId, status: "aktif", dihapusPada: null },
        select: { modul: { select: { kode: true } } },
      });
    modulAktif = rowsModul.map((m) => m.modul.kode);
  }

  return {
    izin: rowsPeran.map((p) => p.izin.nama),
    modulAktif,
  };
}
