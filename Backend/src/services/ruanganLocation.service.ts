import { prisma } from "../config/db";
import { AppError } from "../utils/appError";

type Location = { gedungId?: string | null; lantaiId?: string | null };

export async function resolveRoomLocation(sekolahId: string, input: Location, current?: Location) {
  const lantaiId = input.lantaiId === undefined ? current?.lantaiId ?? null : input.lantaiId;
  let gedungId = input.gedungId === undefined ? current?.gedungId ?? null : input.gedungId;
  if (lantaiId) {
    const floor = await prisma.lantai.findFirst({
      where: { id: lantaiId, dihapusPada: null, gedung: { sekolahId, dihapusPada: null } },
      select: { gedungId: true },
    });
    if (!floor) throw new AppError("Lantai tidak ditemukan di sekolah ini", 400);
    if (gedungId && gedungId !== floor.gedungId) throw new AppError("Lantai tidak berada di gedung yang dipilih", 400);
    gedungId = floor.gedungId;
  }
  if (gedungId && !await prisma.gedung.findFirst({ where: { id: gedungId, sekolahId, dihapusPada: null }, select: { id: true } })) {
    throw new AppError("Gedung tidak ditemukan di sekolah ini", 400);
  }
  return { gedungId, lantaiId };
}

export async function assertRoomForSchool(ruanganId: string, sekolahId: string) {
  const room = await prisma.ruangan.findFirst({where: {id: ruanganId, sekolahId, dihapusPada: null}});
  if (!room) throw new AppError("Ruangan tidak ditemukan di sekolah ini", 400);
  await resolveRoomLocation(sekolahId, room);
}
