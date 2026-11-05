-- Preserve class location data before removing the legacy columns.
-- No subscription/payment columns or other historical objects are modified.
BEGIN;
SET LOCAL lock_timeout = '10s';
SET LOCAL statement_timeout = '5min';

-- Ruangan previously existed in schema/db-push installations without a migration.
CREATE TABLE IF NOT EXISTS "ruangan" (
  "id" TEXT NOT NULL,
  "sekolah_id" TEXT NOT NULL,
  "nama" VARCHAR(100) NOT NULL,
  "lokasi" VARCHAR(255),
  "kapasitas" INTEGER,
  "keterangan" VARCHAR(255),
  "dibuat_pada" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "diperbarui_pada" TIMESTAMP(6) NOT NULL,
  "dihapus_pada" TIMESTAMP(6),
  CONSTRAINT "ruangan_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "ruangan" ADD COLUMN IF NOT EXISTS "gedung_id" TEXT,
  ADD COLUMN IF NOT EXISTS "lantai_id" TEXT;
ALTER TABLE "kelas" ADD COLUMN IF NOT EXISTS "ruangan_id" TEXT;
LOCK TABLE "kelas", "ruangan", "gedung", "lantai" IN SHARE ROW EXCLUSIVE MODE;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM kelas k
    LEFT JOIN gedung g ON g.id = k.gedung_id
    LEFT JOIN lantai l ON l.id = k.lantai_id
    LEFT JOIN gedung lg ON lg.id = l.gedung_id
    WHERE (k.gedung_id IS NOT NULL AND (g.id IS NULL OR g.sekolah_id <> k.sekolah_id))
       OR (k.lantai_id IS NOT NULL AND (l.id IS NULL OR lg.id IS NULL OR lg.sekolah_id <> k.sekolah_id))
       OR (k.gedung_id IS NOT NULL AND k.lantai_id IS NOT NULL AND k.gedung_id <> l.gedung_id)
  ) THEN RAISE EXCEPTION 'Lokasi kelas tidak konsisten: periksa tenant/gedung/lantai sebelum migrasi; tidak ada data yang dihapus'; END IF;
  IF EXISTS (
    SELECT 1 FROM kelas k WHERE k.ruangan_id IS NOT NULL
      AND (k.nomor_ruangan IS NOT NULL OR k.gedung_id IS NOT NULL OR k.lantai_id IS NOT NULL)
  ) THEN RAISE EXCEPTION 'Kelas sudah memiliki ruangan_id dan lokasi lama sekaligus; rekonsiliasi manual diperlukan'; END IF;
  IF EXISTS (
    SELECT 1 FROM kelas k JOIN ruangan r ON r.id = md5('legacy-ruangan-kelas:' || k.id)::uuid::text
    WHERE k.nomor_ruangan IS NOT NULL OR k.gedung_id IS NOT NULL OR k.lantai_id IS NOT NULL
  ) THEN RAISE EXCEPTION 'ID ruangan migrasi bertabrakan dengan ruangan yang ada; migrasi dibatalkan'; END IF;
END $$;

-- One room per legacy class: do not guess whether similarly named rooms are identical.
-- Original room number (including whitespace/empty value) is retained in lokasi.
INSERT INTO ruangan (id, sekolah_id, nama, lokasi, gedung_id, lantai_id,
                     keterangan, dibuat_pada, diperbarui_pada, dihapus_pada)
SELECT md5('legacy-ruangan-kelas:' || k.id)::uuid::text, k.sekolah_id,
       COALESCE(NULLIF(k.nomor_ruangan, ''), 'Ruangan kelas ' || k.nama), k.nomor_ruangan,
       COALESCE(k.gedung_id, l.gedung_id), k.lantai_id,
       'Migrasi lokasi kelas ' || k.id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, k.dihapus_pada
FROM kelas k LEFT JOIN lantai l ON l.id = k.lantai_id
WHERE k.nomor_ruangan IS NOT NULL OR k.gedung_id IS NOT NULL OR k.lantai_id IS NOT NULL;

UPDATE kelas k SET ruangan_id = md5('legacy-ruangan-kelas:' || k.id)::uuid::text
WHERE k.nomor_ruangan IS NOT NULL OR k.gedung_id IS NOT NULL OR k.lantai_id IS NOT NULL;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM kelas k LEFT JOIN ruangan r ON r.id = k.ruangan_id
    WHERE (k.nomor_ruangan IS NOT NULL OR k.gedung_id IS NOT NULL OR k.lantai_id IS NOT NULL)
      AND (r.id IS NULL OR r.sekolah_id <> k.sekolah_id OR r.lokasi IS DISTINCT FROM k.nomor_ruangan
           OR r.lantai_id IS DISTINCT FROM k.lantai_id)) THEN
    RAISE EXCEPTION 'Backfill lokasi kelas tidak lengkap; migrasi dibatalkan';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='ruangan'::regclass AND conname='ruangan_sekolah_id_fkey') THEN
    ALTER TABLE ruangan ADD CONSTRAINT ruangan_sekolah_id_fkey FOREIGN KEY (sekolah_id) REFERENCES sekolah(id) ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='ruangan'::regclass AND conname='ruangan_gedung_id_fkey') THEN
    ALTER TABLE ruangan ADD CONSTRAINT ruangan_gedung_id_fkey FOREIGN KEY (gedung_id) REFERENCES gedung(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='ruangan'::regclass AND conname='ruangan_lantai_id_fkey') THEN
    ALTER TABLE ruangan ADD CONSTRAINT ruangan_lantai_id_fkey FOREIGN KEY (lantai_id) REFERENCES lantai(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='kelas'::regclass AND conname='kelas_ruangan_id_fkey') THEN
    ALTER TABLE kelas ADD CONSTRAINT kelas_ruangan_id_fkey FOREIGN KEY (ruangan_id) REFERENCES ruangan(id) ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE kelas DROP CONSTRAINT IF EXISTS kelas_gedung_id_fkey,
  DROP CONSTRAINT IF EXISTS kelas_lantai_id_fkey;
ALTER TABLE kelas DROP COLUMN gedung_id, DROP COLUMN lantai_id, DROP COLUMN nomor_ruangan;
COMMIT;
