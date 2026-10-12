import { prisma } from "../config/db";

export async function ambilIzinDanModul(
  peranId: string | null,
  sekolahId: string | null,
  isSuperAdmin: boolean = false,
): Promise<{ izin: string[]; modulAktif: string[] }> {
  let izin: string[] = [];
  let modulAktif: string[] = [];

  if (isSuperAdmin) {
    const [semuaModul, semuaIzin] = await Promise.all([
      prisma.modul.findMany({
        select: { kode: true },
      }),
      prisma.izin.findMany({
        where: { status: "aktif", dihapusPada: null },
        select: { nama: true },
      }),
    ]);
    modulAktif = semuaModul.map((m) => m.kode);
    izin = semuaIzin.map((i) => i.nama);
  } else {
    if (peranId) {
      const rowsPeran = await prisma.peranIzin.findMany({
        where: { peranId, dihapusPada: null },
        select: { izin: { select: { nama: true } } },
      });
      izin = rowsPeran.map((p) => p.izin.nama);
    }

    if (sekolahId) {
      const rowsModul = await prisma.sekolahModul.findMany({
        where: { sekolahId, status: "aktif", dihapusPada: null },
        select: { modul: { select: { kode: true } } },
      });
      modulAktif = rowsModul.map((m) => m.modul.kode);
    }
  }

  return {
    izin,
    modulAktif,
  };
}
