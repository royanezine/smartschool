import { Prisma } from "@prisma/client";

// Trial tetap dapat digunakan selama masa langganannya berlaku. Status nonaktif
// eksplisit tidak pernah diaktifkan hanya karena mempunyai langganan.
export const availableSchoolWhere = (now = new Date()): Prisma.SekolahWhereInput => ({
  dihapusPada: null,
  OR: [
    { status: "aktif" },
    { status: "uji coba", langgananSekolah: { some: {
      statusLangganan: { in: ["active", "trialing"] },
      tanggalMulai: { lte: now },
      tanggalBerakhir: { gte: now },
    } } },
  ],
});
