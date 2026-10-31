import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/db";
import { AppError } from "./appError";

export const activeDaysSchema = z.object({ hariAktif: z.array(z.number().int().min(0).max(6)).min(1).max(7).refine(v => new Set(v).size === v.length, "Hari tidak boleh duplikat") }).strict();
const weight = z.number().min(0).max(100);
export const subjectAggregateSchema = z.object({
  mataPelajaranId: z.string().uuid(), tugas: weight, uts: weight, uas: weight, praktik: weight,
  kkm: z.number().int().min(0).max(100),
}).strict().refine(v => Math.abs(v.tugas + v.uts + v.uas + v.praktik - 100) < 0.001, "Total bobot harus 100%");
export const aggregateSchema = z.object({ tahunAjaranId: z.string().uuid(), mataPelajaran: z.array(subjectAggregateSchema).max(500) }).strict()
  .refine(v => new Set(v.mataPelajaran.map(m => m.mataPelajaranId)).size === v.mataPelajaran.length, "Mata pelajaran tidak boleh duplikat");
export type AggregateSubject = z.infer<typeof subjectAggregateSchema>;
export const aggregateKey = (year: string) => `agregat_rapor:${year}`;

export async function readSetting<T>(sekolahId: string | null, kunci: string, fallback: T, db: Pick<Prisma.TransactionClient, "pengaturanSistem"> = prisma): Promise<T> {
  const row = await db.pengaturanSistem.findFirst({ where: { sekolahId, kunci, dihapusPada: null }, orderBy: { diperbaruiPada: "desc" } });
  if (!row) return fallback;
  try { return JSON.parse(row.nilai) as T; }
  catch { throw new AppError(`Pengaturan ${kunci} tidak valid. Hubungi administrator.`, 409); }
}

export async function writeSetting(tx: Prisma.TransactionClient, sekolahId: string | null, kunci: string, nilai: unknown, actor: string) {
  // Serialize writes even on databases that predate a uniqueness constraint.
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${sekolahId ?? "global"}:${kunci}`}))`;
  const existing = await tx.pengaturanSistem.findFirst({ where: { sekolahId, kunci, dihapusPada: null }, orderBy: { diperbaruiPada: "desc" } });
  const data = { nilai: JSON.stringify(nilai), tipeData: "json", diperbaruiOleh: actor };
  if (existing) return tx.pengaturanSistem.update({ where: { id: existing.id }, data });
  return tx.pengaturanSistem.create({ data: { ...data, sekolahId, kunci, kelompok: sekolahId ? "sekolah" : "global", dibuatOleh: actor } });
}

export async function assertActiveAttendanceDay(sekolahId: string, date: Date) {
  const setting = await readSetting<{ hariAktif: number[] } | null>(sekolahId, "hari_aktif_presensi", null);
  // Existing schools retain their behaviour until an administrator saves a policy.
  if (setting && !activeDaysSchema.parse(setting).hariAktif.includes(date.getUTCDay())) throw new AppError("Hari ini bukan hari aktif presensi sekolah", 400);
}

export async function getAggregateSubject(sekolahId: string, tahunAjaranId: string, mataPelajaranId: string, db?: Pick<Prisma.TransactionClient, "pengaturanSistem">) {
  const config = await readSetting<z.infer<typeof aggregateSchema> | null>(sekolahId, aggregateKey(tahunAjaranId), null, db);
  return config ? aggregateSchema.parse(config).mataPelajaran.find(m => m.mataPelajaranId === mataPelajaranId) : undefined;
}

export function aggregateWeights(components: { id: string; kelompok: string; jenis: string; bobot: unknown }[], config?: AggregateSubject) {
  if (!config) return new Map(components.map(c => [c.id, Number(c.bobot)]));
  const groups = ["tugas", "uts", "uas", "praktik"] as const;
  const groupOf = (c: typeof components[number]) => groups.find(g => g === c.kelompok.toLowerCase() || g === c.jenis.toLowerCase());
  if (components.some(c => !groupOf(c))) throw new AppError("Kelompok komponen harus tugas, uts, uas, atau praktik untuk memakai agregat rapor", 400);
  for (const group of groups) if (config[group] > 0 && !components.some(c => groupOf(c) === group)) throw new AppError(`Komponen ${group} belum tersedia`, 400);
  return new Map(components.map(c => {
    const group = groupOf(c)!;
    return [c.id, config[group] / components.filter(item => groupOf(item) === group).length];
  }));
}
