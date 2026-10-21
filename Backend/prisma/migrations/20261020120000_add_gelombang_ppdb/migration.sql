CREATE TABLE "gelombang_ppdb" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "jalur_ppdb_id" TEXT,
    "nama" VARCHAR(50) NOT NULL,
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_selesai" DATE NOT NULL,
    "kuota" INTEGER,
    "status" VARCHAR(20) DEFAULT 'aktif',
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "gelombang_ppdb_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "gelombang_ppdb_sekolah_id_idx" ON "gelombang_ppdb"("sekolah_id");

CREATE INDEX "gelombang_ppdb_jalur_ppdb_id_idx" ON "gelombang_ppdb"("jalur_ppdb_id");

ALTER TABLE "pendaftaran_ppdb" ADD COLUMN "gelombang_ppdb_id" TEXT;

CREATE INDEX "pendaftaran_ppdb_sekolah_id_idx" ON "pendaftaran_ppdb"("sekolah_id");

CREATE INDEX "pendaftaran_ppdb_jalur_ppdb_id_idx" ON "pendaftaran_ppdb"("jalur_ppdb_id");

CREATE INDEX "pendaftaran_ppdb_gelombang_ppdb_id_idx" ON "pendaftaran_ppdb"("gelombang_ppdb_id");

ALTER TABLE "gelombang_ppdb" ADD CONSTRAINT "gelombang_ppdb_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "gelombang_ppdb" ADD CONSTRAINT "gelombang_ppdb_jalur_ppdb_id_fkey" FOREIGN KEY ("jalur_ppdb_id") REFERENCES "jalur_ppdb"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pendaftaran_ppdb" ADD CONSTRAINT "pendaftaran_ppdb_gelombang_ppdb_id_fkey" FOREIGN KEY ("gelombang_ppdb_id") REFERENCES "gelombang_ppdb"("id") ON DELETE SET NULL ON UPDATE CASCADE;