import { prisma } from "../config/db";

async function backfillAbsensi() {
  console.log("Memulai backfill sekolah_id pada tabel absensi...");

  // Ambil absensi yang sekolah_id-nya null, sekalian data kelas & pengguna-nya
  const data = await prisma.absensi.findMany({
    where: { sekolahId: null },
    select: {
      id: true,
      kelas: { select: { sekolahId: true } },
      pengguna: { select: { sekolahId: true } },
    },
  });

  if (data.length === 0) {
    console.log("Tidak ada data absensi yang perlu di-backfill.");
    return;
  }

  let updatedCount = 0;
  for (const item of data) {
    // Prioritaskan sekolahId dari kelas, kalau gak ada baru pakai dari pengguna
    const targetSekolahId = item.kelas?.sekolahId || item.pengguna?.sekolahId;
    
    if (!targetSekolahId) {
      console.warn(`Absensi ${item.id} dilewati: tidak ditemukan sekolahId di kelas/pengguna`);
      continue;
    }

    await prisma.absensi.update({
      where: { id: item.id },
      data: { sekolahId: targetSekolahId },
    });
    updatedCount++;
  }

  console.log(`Selesai! Berhasil update ${updatedCount} data absensi.`);
}

backfillAbsensi()
  .catch((e) => {
    console.error("Gagal backfill:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });