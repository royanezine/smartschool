import { prisma } from "../config/db";

export const cekLanggananYayasan = async (yayasanId: string) => {
  const yayasan = await prisma.yayasan.findFirst({
    where: { id: yayasanId, dihapusPada: null },
    select: {
      id: true,
      status: true,
      paketId: true,
      statusLangganan: true,
      tanggalBerakhirLangganan: true,
    },
  });

  const aktif =
    !!yayasan &&
    yayasan.status === "aktif" &&
    !!yayasan.paketId &&
    ["active", "trialing"].includes(yayasan.statusLangganan ?? "") &&
    !!yayasan.tanggalBerakhirLangganan &&
    yayasan.tanggalBerakhirLangganan.getTime() > Date.now();

  return { aktif, yayasan };
};