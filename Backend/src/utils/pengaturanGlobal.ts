import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/db";

type Db = Prisma.TransactionClient | typeof prisma;

export const KELOMPOK_GLOBAL = ["identitas", "pendaftaran", "pemeliharaan"] as const;

export type KelompokGlobal = (typeof KELOMPOK_GLOBAL)[number];

interface SkemaGlobal {
  parse(data: unknown): unknown;
  safeParse(data: unknown): { success: boolean; data?: unknown };
}

const KUNCI: Record<KelompokGlobal, string> = {
  identitas: "identitas_platform",
  pendaftaran: "pendaftaran_platform",
  pemeliharaan: "pemeliharaan_platform",
};

const KELOMPOK_DB = "global";

const skemaIdentitas = z.object({
  namaAplikasi: z.string().trim().min(1).max(100),
  emailDukungan: z.string().trim().email().max(100).nullable(),
  teleponDukungan: z.string().trim().max(30).nullable(),
  logoUrl: z.string().trim().url().max(255).nullable(),
});

const skemaPendaftaran = z.object({
  pendaftaranDibuka: z.boolean(),
  durasiUjiCobaHari: z.number().int().min(1).max(365),
});

const skemaPemeliharaan = z.object({
  aktif: z.boolean(),
  pesan: z.string().trim().max(500).nullable(),
});

const SKEMA_PENUH: Record<KelompokGlobal, SkemaGlobal> = {
  identitas: skemaIdentitas,
  pendaftaran: skemaPendaftaran,
  pemeliharaan: skemaPemeliharaan,
};

export const SKEMA_PARSIAL: Record<KelompokGlobal, SkemaGlobal> = {
  identitas: skemaIdentitas.partial().strict(),
  pendaftaran: skemaPendaftaran.partial().strict(),
  pemeliharaan: skemaPemeliharaan.partial().strict(),
};

export const DEFAULT_GLOBAL: Record<KelompokGlobal, Record<string, unknown>> = {
  identitas: {
    namaAplikasi: "SmartSchool",
    emailDukungan: null,
    teleponDukungan: null,
    logoUrl: null,
  },
  pendaftaran: {
    pendaftaranDibuka: true,
    durasiUjiCobaHari: 30,
  },
  pemeliharaan: {
    aktif: false,
    pesan: null,
  },
};

export const adalahKelompokGlobal = (nilai: string): nilai is KelompokGlobal =>
  (KELOMPOK_GLOBAL as readonly string[]).includes(nilai);

export const bacaGlobal = async (
  db: Db,
  kelompok: KelompokGlobal,
): Promise<Record<string, unknown>> => {
  const bawaan = DEFAULT_GLOBAL[kelompok];

  const baris = await db.pengaturanSistem.findFirst({
    where: { sekolahId: null, kunci: KUNCI[kelompok], dihapusPada: null },
    orderBy: { diperbaruiPada: "desc" },
    select: { nilai: true },
  });

  if (!baris) return { ...bawaan };

  try {
    const hasil = SKEMA_PENUH[kelompok].safeParse({
      ...bawaan,
      ...JSON.parse(baris.nilai),
    });
    return hasil.success ? (hasil.data as Record<string, unknown>) : { ...bawaan };
  } catch {
    return { ...bawaan };
  }
};

export const perbaruiGlobal = async (
  tx: Prisma.TransactionClient,
  kelompok: KelompokGlobal,
  masukan: Record<string, unknown>,
  userId: string,
) => {
  const kunci = KUNCI[kelompok];

  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`pengaturan_global:${kunci}`}))`;

  const lama = await bacaGlobal(tx, kelompok);
  const baru = SKEMA_PENUH[kelompok].parse({ ...lama, ...masukan }) as Record<
    string,
    unknown
  >;
  const isi = JSON.stringify(baru);

  const ada = await tx.pengaturanSistem.findFirst({
    where: { sekolahId: null, kunci, dihapusPada: null },
    orderBy: { diperbaruiPada: "desc" },
    select: { id: true },
  });

  if (ada) {
    await tx.pengaturanSistem.update({
      where: { id: ada.id },
      data: {
        nilai: isi,
        tipeData: "json",
        kelompok: KELOMPOK_DB,
        diperbaruiOleh: userId,
      },
    });
  } else {
    await tx.pengaturanSistem.create({
      data: {
        sekolahId: null,
        kunci,
        nilai: isi,
        tipeData: "json",
        kelompok: KELOMPOK_DB,
        keterangan: `Pengaturan global ${kelompok}`,
        dibuatOleh: userId,
      },
    });
  }

  return { lama, baru, kunci };
};