import { Prisma } from "@prisma/client";
import { z } from "zod";
import { attendanceDateFilter } from "../utils/dateOnly";
import { absensiListQuerySchema } from "../validations/absensi.validation";

export function attendanceSchoolFilter(sekolahId?: string): Prisma.AbsensiWhereInput {
  if (!sekolahId) return {};
  // An explicit school owns the record. Legacy records fall back to class,
  // then to the user's school only when the record has no class.
  return { OR: [
    { sekolahId },
    { sekolahId: null, kelas: { is: { sekolahId } } },
    { sekolahId: null, kelasId: null, pengguna: { is: { sekolahId } } },
  ] };
}

export const lateAttendanceFilter: Prisma.AbsensiWhereInput = {
  OR: [
    { status: "terlambat" },
    { status: "hadir", OR: [
      { statusShift: { contains: "terlambat" } },
      { terlambatMenit: { gt: 0 } },
    ] },
  ],
};

export function attendanceListFilter(
  query: z.infer<typeof absensiListQuerySchema>,
  sekolahId?: string,
): Prisma.AbsensiWhereInput {
  const AND: Prisma.AbsensiWhereInput[] = [attendanceSchoolFilter(sekolahId)];
  if (query.status === "terlambat") AND.push(lateAttendanceFilter);
  else if (query.status) AND.push({ status: query.status });
  const roleNames = query.role && ["staff", "staf", "pegawai", "karyawan"].includes(query.role)
    ? ["staff", "staf", "pegawai", "karyawan"] : query.role ? [query.role] : [];
  if (roleNames.length) AND.push({ pengguna: { peran: {
    OR: roleNames.map(nama => ({ nama: { equals: nama, mode: "insensitive" } })),
  } } });
  if (query.search) AND.push({ pengguna: { OR: [
    { namaLengkap: { contains: query.search, mode: "insensitive" } },
    { nisn: { contains: query.search, mode: "insensitive" } },
    { nip: { contains: query.search, mode: "insensitive" } },
    { nuptk: { contains: query.search, mode: "insensitive" } },
    { email: { contains: query.search, mode: "insensitive" } },
    { namaPengguna: { contains: query.search, mode: "insensitive" } },
  ] } });
  return {
    AND,
    ...(query.kelasId && { kelasId: query.kelasId }),
    ...(query.penggunaId && { penggunaId: query.penggunaId }),
    ...(query.shiftKerjaId && { shiftKerjaId: query.shiftKerjaId }),
    tanggal: attendanceDateFilter(query),
  };
}

export const attendanceInclude = {
  pengguna: { select: {
    id: true, namaLengkap: true, namaPengguna: true,
    nisn: true, nis: true, nip: true, nipd: true, jabatan: true, avatar: true,
    peran: { select: { id: true, nama: true, namaTampilan: true } },
  } },
  kelas: { select: { id: true, nama: true, tingkat: true } },
  shiftKerja: { select: { id: true, nama: true, kode: true, jamMasuk: true, jamKeluar: true } },
} satisfies Prisma.AbsensiInclude;
