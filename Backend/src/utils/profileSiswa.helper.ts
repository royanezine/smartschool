import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { normalizeShiftKerja } from "./shiftKerja";

export const buatShiftSiswa = (value?: string | null) => {
  const kode = normalizeShiftKerja(value);
  if (!kode) {
    return { kode: null, label: "Belum ditentukan", ditentukan: false };
  }
  return {
    kode,
    label: kode === "pagi" ? "Pagi" : "Siang",
    ditentukan: true,
  };
};

const cariKelasSiswa = async (siswaId: string, sekolahId: string) => {
  const aktif = await prisma.anggotaKelas.findFirst({
    where: {
      penggunaId: siswaId,
      dihapusPada: null,
      kelas: {
        sekolahId,
        dihapusPada: null,
        tahunAjaran: { status: "aktif", dihapusPada: null },
      },
    },
    orderBy: { dibuatPada: "desc" },
    select: { kelasId: true },
  });
  if (aktif) return aktif.kelasId;

  const terakhir = await prisma.anggotaKelas.findFirst({
    where: {
      penggunaId: siswaId,
      dihapusPada: null,
      kelas: { sekolahId, dihapusPada: null },
    },
    orderBy: { dibuatPada: "desc" },
    select: { kelasId: true },
  });
  return terakhir?.kelasId ?? null;
};

export const ambilDataAkademikSiswa = async (
  siswaId: string,
  sekolahId: string,
) => {
  const kelasId = await cariKelasSiswa(siswaId, sekolahId);

  const tabunganPromise = prisma.tabunganSiswa.findFirst({
    where: { sekolahId, siswaId, dihapusPada: null },
    select: { saldo: true, status: true },
  });

  if (!kelasId) {
    const tabungan = await tabunganPromise;
    return {
      kelas: null,
      waliKelas: null,
      shift: buatShiftSiswa(null),
      mataPelajaran: [],
      tabungan: {
        saldo: tabungan?.saldo ?? new Prisma.Decimal(0),
        status: tabungan?.status ?? "belum_ada",
      },
    };
  }

  const [kelas, kelasMapel, tabungan] = await Promise.all([
    prisma.kelas.findFirst({
      where: { id: kelasId, sekolahId, dihapusPada: null },
      select: {
        id: true,
        nama: true,
        tingkat: true,
        shift: true,
        tahunAjaran: {
          select: { id: true, tahunAjaran: true, semester: true },
        },
        waliKelas: {
          select: { id: true, namaLengkap: true },
        },
      },
    }),
    prisma.kelasMapel.findMany({
      where: {
        kelasId,
        dihapusPada: null,
        mataPelajaran: { dihapusPada: null },
      },
      select: {
        id: true,
        mataPelajaran: { select: { id: true, nama: true, kode: true } },
        guruPengajar: { select: { id: true, namaLengkap: true } },
        jadwalMengajar: {
          where: { dihapusPada: null },
          select: { hari: true, jamMulai: true, jamSelesai: true, ruangan: true },
        },
      },
      orderBy: { mataPelajaran: { nama: "asc" } },
    }),
    tabunganPromise,
  ]);

  return {
    kelas: kelas
      ? {
          id: kelas.id,
          nama: kelas.nama,
          tingkat: kelas.tingkat,
          tahunAjaran: kelas.tahunAjaran,
        }
      : null,
    waliKelas: kelas?.waliKelas ?? null,
    shift: buatShiftSiswa(kelas?.shift),
    mataPelajaran: kelasMapel.map((km) => ({
      kelasMapelId: km.id,
      mataPelajaranId: km.mataPelajaran.id,
      nama: km.mataPelajaran.nama,
      kode: km.mataPelajaran.kode,
      guru: km.guruPengajar,
      jadwal: km.jadwalMengajar,
    })),
    tabungan: {
      saldo: tabungan?.saldo ?? new Prisma.Decimal(0),
      status: tabungan?.status ?? "belum_ada",
    },
  };
};