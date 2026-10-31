import { Prisma } from "@prisma/client";

export async function provisionSchoolModules(tx: Prisma.TransactionClient, sekolahId: string, paketId: string, actor: string, berakhir: Date | null) {
  const modules = await tx.paketModul.findMany({ where: { paketId, status: "aktif", dihapusPada: null, modul: { status: "aktif", dihapusPada: null } }, select: { modulId: true } });
  const existing = await tx.sekolahModul.findMany({ where: { sekolahId }, select: { modulId: true } });
  const ids = new Set(existing.map(m => m.modulId));
  await tx.sekolahModul.createMany({ data: [...new Set(modules.map(m => m.modulId))].filter(id => !ids.has(id)).map(modulId => ({ sekolahId, modulId, status: "aktif", diaktifkanPada: new Date(), kedaluwarsaPada: berakhir, dibuatOleh: actor })) });
}
