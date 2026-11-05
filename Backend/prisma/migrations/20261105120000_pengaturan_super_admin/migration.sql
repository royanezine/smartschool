BEGIN;
-- CreateEnum
CREATE TYPE "KategoriKonfigurasi" AS ENUM ('INTEGRASI', 'KEAMANAN', 'NOTIFIKASI');

-- CreateTable
CREATE TABLE "konfigurasi_sistem" (
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

-- CreateTable
CREATE TABLE "template_notifikasi" (
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

-- CreateIndex
CREATE UNIQUE INDEX "konfigurasi_sistem_kunci_key" ON "konfigurasi_sistem"("kunci");

-- CreateIndex
CREATE INDEX "konfigurasi_sistem_kategori_idx" ON "konfigurasi_sistem"("kategori");

-- CreateIndex
CREATE INDEX "template_notifikasi_kanal_idx" ON "template_notifikasi"("kanal");

-- CreateIndex
CREATE INDEX "template_notifikasi_is_active_idx" ON "template_notifikasi"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "template_notifikasi_event_target_kanal_key" ON "template_notifikasi"("event_target", "kanal");


ALTER TABLE konfigurasi_sistem ADD CONSTRAINT konfigurasi_satu_nilai CHECK (num_nonnulls(nilai_text,nilai_boolean,nilai_angka) <= 1);
ALTER TABLE konfigurasi_sistem ADD CONSTRAINT konfigurasi_rahasia_text CHECK (NOT is_rahasia OR (nilai_boolean IS NULL AND nilai_angka IS NULL));
ALTER TABLE konfigurasi_sistem ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_notifikasi ENABLE ROW LEVEL SECURITY;
COMMIT;
