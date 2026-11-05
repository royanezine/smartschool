import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";

export const STATUS_SEKOLAH_AKTIF = "aktif";
export const STATUS_SEKOLAH_UJI_COBA = "uji coba";
export const STATUS_SEKOLAH_TIDAK_AKTIF = "tidak aktif";

const STATUS_LANGGANAN_AKTIF = ["active", "trialing"];

const STATUS_PEMBAYARAN_TIDAK_VALID = [
  "pending",
  "failed",
  "expired",
  "cancel",
  "cancelled",
  "deny",
];

const SINONIM_TIDAK_AKTIF = [STATUS_SEKOLAH_TIDAK_AKTIF, "tidak_aktif", "nonaktif"];

export const LANGGANAN_DIBAYAR_WHERE: Prisma.LanggananSekolahWhereInput = {
  OR: [
    { statusPembayaran: null },
    { statusPembayaran: { notIn: STATUS_PEMBAYARAN_TIDAK_VALID } },
  ],
};

const langgananSekolahBerlaku = (now: Date): Prisma.LanggananSekolahWhereInput => ({
  statusLangganan: { in: STATUS_LANGGANAN_AKTIF },
  AND: [
    LANGGANAN_DIBAYAR_WHERE,
    { OR: [{ tanggalMulai: null }, { tanggalMulai: { lte: now } }] },
    { OR: [{ tanggalBerakhir: null }, { tanggalBerakhir: { gte: now } }] },
  ],
});

const yayasanBerlaku = (now: Date): Prisma.YayasanWhereInput => ({
  dihapusPada: null,
  status: "aktif",
  paketId: { not: null },
  statusLangganan: { in: STATUS_LANGGANAN_AKTIF },
  tanggalBerakhirLangganan: { gt: now },
  OR: [
    { tanggalMulaiLangganan: null },
    { tanggalMulaiLangganan: { lte: now } },
  ],
});

export const sekolahBerlanggananWhere = (
  now = new Date(),
): Prisma.SekolahWhereInput => ({
  OR: [
    { langgananSekolah: { some: langgananSekolahBerlaku(now) } },
    { yayasan: { is: yayasanBerlaku(now) } },
  ],
});

export const ambilSekolahBerlangganan = async (
  schoolIds: string[],
  now = new Date(),
) => {
  if (schoolIds.length === 0) return new Set<string>();
  const rows = await prisma.sekolah.findMany({
    where: {
      AND: [
        { id: { in: schoolIds } },
        { dihapusPada: null },
        sekolahBerlanggananWhere(now),
      ],
    },
    select: { id: true },
  });
  return new Set(rows.map((r) => r.id));
};

export const ambilSemuaIdSekolahBerlangganan = async (
  now = new Date(),
  dasar: Prisma.SekolahWhereInput = {},
) => {
  const rows = await prisma.sekolah.findMany({
    where: {
      AND: [{ dihapusPada: null }, dasar, sekolahBerlanggananWhere(now)],
    },
    select: { id: true },
  });
  return rows.map((r) => r.id);
};

export const statusEfektifSekolah = (
  status: string | null,
  berlangganan: boolean,
): string | null => {
  if (status === STATUS_SEKOLAH_AKTIF || status === STATUS_SEKOLAH_UJI_COBA) {
    return berlangganan ? status : STATUS_SEKOLAH_TIDAK_AKTIF;
  }
  return status;
};

export const labelStatusSekolah = <T extends { id: string; status: string | null }>(
  items: T[],
  berlangganan: Set<string>,
) =>
  items.map((item) => {
    const aktif = berlangganan.has(item.id);
    return {
      ...item,
      status: statusEfektifSekolah(item.status, aktif),
      statusTersimpan: item.status,
      berlangganan: aktif,
    };
  });

export const filterStatusSekolah = async (
  status: string,
  now = new Date(),
  dasar: Prisma.SekolahWhereInput = {},
): Promise<Prisma.SekolahWhereInput> => {
  const normal = status.trim().toLowerCase();

  if (normal === STATUS_SEKOLAH_AKTIF || normal === STATUS_SEKOLAH_UJI_COBA) {
    const ids = await ambilSemuaIdSekolahBerlangganan(now, dasar);
    return { status: normal, id: { in: ids } };
  }

  if (SINONIM_TIDAK_AKTIF.includes(normal)) {
    const ids = await ambilSemuaIdSekolahBerlangganan(now, dasar);
    return {
      OR: [
        { status: null },
        { status: { notIn: [STATUS_SEKOLAH_AKTIF, STATUS_SEKOLAH_UJI_COBA] } },
        {
          status: { in: [STATUS_SEKOLAH_AKTIF, STATUS_SEKOLAH_UJI_COBA] },
          id: { notIn: ids },
        },
      ],
    };
  }

  return { status };
};