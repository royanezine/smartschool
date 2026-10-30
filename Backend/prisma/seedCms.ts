import { Prisma } from "@prisma/client";

// Called inside the school's seed transaction. Existing content is never overwritten.
export async function seedDefaultHalamanCms(
  tx: Prisma.TransactionClient,
  sekolahId: string,
  dibuatOleh: string,
) {
  for (const judul of ["Beranda", "Tentang", "Kontak"]) {
    const baseSlug = judul.toLowerCase();
    const slug = `${baseSlug}-${sekolahId}`;
    const existing = await tx.halamanCms.findFirst({
      where: {
        sekolahId,
        dihapusPada: null,
        OR: [
          { judul: { equals: judul, mode: "insensitive" } },
          { slug },
        ],
      },
      select: { id: true },
    });
    if (existing) continue;

    // A soft-deleted default retains its unique slug; don't revive it or collide with it.
    await tx.halamanCms.upsert({
      where: { slug },
      update: {},
      create: { sekolahId, judul, slug, status: "draft", dibuatOleh },
    });
  }
}
