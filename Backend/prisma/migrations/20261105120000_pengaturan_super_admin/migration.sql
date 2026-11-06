BEGIN;

DO $$ BEGIN
  CREATE TYPE "KategoriKonfigurasi" AS ENUM ('INTEGRASI', 'KEAMANAN', 'NOTIFIKASI');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "konfigurasi_sistem" (
    "id" TEXT NOT NULL,
    "kategori" "KategoriKonfigurasi" NOT NULL,
    "kunci" VARCHAR(100) NOT NULL,
    "nilai_text" TEXT,
    "nilai_boolean" BOOLEAN,
    "nilai_angka" DECIMAL(20,6),
    "is_rahasia" BOOLEAN NOT NULL DEFAULT false,
    "keterangan" TEXT,
    "dibuat_pada" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(6) NOT NULL,
    "diperbarui_oleh" TEXT,

    CONSTRAINT "konfigurasi_sistem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "template_notifikasi" (
    "id" TEXT NOT NULL,
    "event_target" VARCHAR(100) NOT NULL,
    "kanal" VARCHAR(50) NOT NULL,
    "subjek" VARCHAR(255),
    "isi_template" TEXT NOT NULL,
    "variabel" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "dibuat_pada" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(6) NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,

    CONSTRAINT "template_notifikasi_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "konfigurasi_sistem_kunci_key" ON "konfigurasi_sistem"("kunci");

CREATE INDEX IF NOT EXISTS "konfigurasi_sistem_kategori_idx" ON "konfigurasi_sistem"("kategori");

CREATE INDEX IF NOT EXISTS "template_notifikasi_kanal_idx" ON "template_notifikasi"("kanal");

CREATE INDEX IF NOT EXISTS "template_notifikasi_is_active_idx" ON "template_notifikasi"("is_active");

CREATE UNIQUE INDEX IF NOT EXISTS "template_notifikasi_event_target_kanal_key" ON "template_notifikasi"("event_target", "kanal");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.konfigurasi_sistem'::regclass
      AND conname = 'konfigurasi_satu_nilai'
  ) THEN
    ALTER TABLE konfigurasi_sistem
      ADD CONSTRAINT konfigurasi_satu_nilai
      CHECK (num_nonnulls(nilai_text, nilai_boolean, nilai_angka) <= 1);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.konfigurasi_sistem'::regclass
      AND conname = 'konfigurasi_rahasia_text'
  ) THEN
    ALTER TABLE konfigurasi_sistem
      ADD CONSTRAINT konfigurasi_rahasia_text
      CHECK (NOT is_rahasia OR (nilai_boolean IS NULL AND nilai_angka IS NULL));
  END IF;
END $$;

ALTER TABLE konfigurasi_sistem ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_notifikasi ENABLE ROW LEVEL SECURITY;

COMMIT;