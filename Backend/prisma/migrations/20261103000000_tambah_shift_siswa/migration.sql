CREATE TABLE "shift_siswa" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "kode" VARCHAR(10) NOT NULL,
    "nama" VARCHAR(50) NOT NULL,
    "jam_masuk" VARCHAR(5) NOT NULL,
    "jam_keluar" VARCHAR(5) NOT NULL,
    "toleransi_terlambat_menit" INTEGER NOT NULL DEFAULT 15,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "shift_siswa_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "shift_siswa_sekolah_id_idx" ON "shift_siswa"("sekolah_id");

CREATE UNIQUE INDEX "shift_siswa_sekolah_id_kode_key" ON "shift_siswa"("sekolah_id", "kode");

ALTER TABLE "shift_siswa" ADD CONSTRAINT "shift_siswa_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;