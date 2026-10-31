BEGIN;
-- Targeted permissions: teachers can request assets and read their own loans;
-- approval, inventory updates and school-wide history retain admin permissions.
INSERT INTO "izin" ("id", "nama", "modul", "aksi", "status", "dibuat_pada", "diperbarui_pada")
VALUES (gen_random_uuid()::text, 'peminjaman_aset.view_own', 'manajemen_aset', 'view_own', 'aktif', now(), now()),
       (gen_random_uuid()::text, 'peminjaman_aset.create_own', 'manajemen_aset', 'create_own', 'aktif', now(), now())
ON CONFLICT ("nama") DO NOTHING;

INSERT INTO "peran_izin" ("id", "peran_id", "izin_id", "dibuat_pada", "diperbarui_pada")
SELECT gen_random_uuid()::text, p."id", i."id", now(), now()
FROM "peran" p CROSS JOIN "izin" i
WHERE p."nama" = 'guru' AND p."status" = 'aktif' AND p."dihapus_pada" IS NULL
  AND i."nama" IN ('peminjaman_aset.view_own', 'peminjaman_aset.create_own') AND i."status" = 'aktif' AND i."dihapus_pada" IS NULL
  AND NOT EXISTS (SELECT 1 FROM "peran_izin" pi WHERE pi."peran_id" = p."id" AND pi."izin_id" = i."id");

-- Recover missing entitlements from the school's latest valid subscription.
-- Keep any existing explicit disabled/deleted assignment unchanged.
WITH subscriptions AS (
 SELECT DISTINCT ON (l."sekolah_id") l.* FROM "langganan_sekolah" l
 JOIN "sekolah" s ON s."id" = l."sekolah_id"
 WHERE s."dihapus_pada" IS NULL AND s."status" IN ('aktif', 'uji coba')
   AND l."status_langganan" IN ('active', 'trialing')
   AND (l."tanggal_mulai" IS NULL OR l."tanggal_mulai" <= now())
   AND (l."tanggal_berakhir" IS NULL OR l."tanggal_berakhir" >= now())
 ORDER BY l."sekolah_id", l."dibuat_pada" DESC, l."id"
), entitlements AS (
 SELECT DISTINCT l."sekolah_id", pm."modul_id", l."tanggal_berakhir"
 FROM subscriptions l JOIN "paket_modul" pm ON pm."paket_id" = l."paket_id"
 JOIN "modul" m ON m."id" = pm."modul_id"
 WHERE pm."status" = 'aktif' AND pm."dihapus_pada" IS NULL AND m."status" = 'aktif' AND m."dihapus_pada" IS NULL
)
INSERT INTO "sekolah_modul" ("id", "sekolah_id", "modul_id", "status", "diaktifkan_pada", "kedaluwarsa_pada", "dibuat_pada", "diperbarui_pada")
SELECT gen_random_uuid()::text, e."sekolah_id", e."modul_id", 'aktif', now(), e."tanggal_berakhir", now(), now()
FROM entitlements e WHERE NOT EXISTS (
 SELECT 1 FROM "sekolah_modul" sm WHERE sm."sekolah_id" = e."sekolah_id" AND sm."modul_id" = e."modul_id"
);
COMMIT;
