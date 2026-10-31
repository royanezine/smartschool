ALTER TABLE "jalur_ppdb" ADD COLUMN IF NOT EXISTS "kategori" VARCHAR(20) NOT NULL DEFAULT 'reguler',
ADD COLUMN IF NOT EXISTS "jarak_maksimal_km" DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS "metode_ranking" VARCHAR(10) NOT NULL DEFAULT 'jarak',
ADD COLUMN IF NOT EXISTS "nilai_minimal" DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS "berkas_wajib" JSONB NOT NULL DEFAULT '["KK","AKTE","IJAZAH"]';

ALTER TABLE "pendaftaran_ppdb" ADD COLUMN IF NOT EXISTS "jurusan_id" TEXT,
ADD COLUMN IF NOT EXISTS "lintang" DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS "bujur" DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS "jarak_km" DECIMAL(8,3);

CREATE INDEX IF NOT EXISTS "pendaftaran_ppdb_jurusan_id_idx" ON "pendaftaran_ppdb"("jurusan_id");

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pendaftaran_ppdb"'::regclass AND conname = 'pendaftaran_ppdb_jurusan_id_fkey') THEN ALTER TABLE "pendaftaran_ppdb" ADD CONSTRAINT "pendaftaran_ppdb_jurusan_id_fkey" FOREIGN KEY ("jurusan_id") REFERENCES "jurusan"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

CREATE TABLE IF NOT EXISTS "pengaturan_spmb" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "pendaftaran_dibuka" BOOLEAN NOT NULL DEFAULT true,
    "wajib_lokasi" BOOLEAN NOT NULL DEFAULT true,
    "batasi_pendaftar_sesuai_kuota" BOOLEAN NOT NULL DEFAULT false,
    "ranking_terbuka" BOOLEAN NOT NULL DEFAULT true,
    "kirim_email_konfirmasi" BOOLEAN NOT NULL DEFAULT true,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengaturan_spmb_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "pengaturan_spmb_sekolah_id_key" ON "pengaturan_spmb"("sekolah_id");

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pengaturan_spmb"'::regclass AND conname = 'pengaturan_spmb_sekolah_id_fkey') THEN ALTER TABLE "pengaturan_spmb" ADD CONSTRAINT "pengaturan_spmb_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;