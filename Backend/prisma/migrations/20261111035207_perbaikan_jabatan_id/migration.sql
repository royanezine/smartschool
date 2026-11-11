/*
  Warnings:

  - You are about to drop the column `xendit_invoice_id` on the `langganan_sekolah` table. All the data in the column will be lost.
  - You are about to drop the column `xendit_payment_link` on the `langganan_sekolah` table. All the data in the column will be lost.
  - You are about to drop the column `xendit_invoice_id` on the `riwayat_pembayaran` table. All the data in the column will be lost.
  - You are about to drop the column `xendit_payment_id` on the `riwayat_pembayaran` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pengguna_id,kelas_id,tanggal]` on the table `absensi` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `asesmen` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sekolah_id,nama]` on the table `kategori_pelanggaran` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pengguna_id,kategori,target_url]` on the table `notifikasi` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sekolah_id,nik]` on the table `pendaftaran_ppdb` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sekolah_id,nisn]` on the table `pendaftaran_ppdb` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sekolah_id,konselor_id,tanggal,waktu_mulai]` on the table `sesi_konseling` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sekolah_id,siswa_id,kategori_tagihan_id,tahun_ajaran_id,periode_bulan,periode_tahun]` on the table `tagihan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "absensi" ADD COLUMN     "mata_pelajaran_id" TEXT;

-- AlterTable
ALTER TABLE "aset" ADD COLUMN     "keterangan" VARCHAR(255),
ADD COLUMN     "ruangan_id" TEXT;

-- AlterTable
ALTER TABLE "gudang" ADD COLUMN     "keterangan" VARCHAR(255);

-- AlterTable
ALTER TABLE "kategori_aset" ADD COLUMN     "keterangan" VARCHAR(255);

-- AlterTable
ALTER TABLE "langganan_sekolah" DROP COLUMN "xendit_invoice_id",
DROP COLUMN "xendit_payment_link";

-- AlterTable
ALTER TABLE "pengaturan_spmb" ALTER COLUMN "diperbarui_pada" DROP DEFAULT;

-- AlterTable
ALTER TABLE "pengguna" ADD COLUMN     "jabatan_id" TEXT,
ADD COLUMN     "jurusan_id" TEXT;

-- AlterTable
ALTER TABLE "riwayat_pembayaran" DROP COLUMN "xendit_invoice_id",
DROP COLUMN "xendit_payment_id";

-- CreateTable
CREATE TABLE "jabatan" (
    "id" TEXT NOT NULL,
    "nama_jabatan" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "akses_menu" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "jabatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prestasi" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "siswa_id" TEXT,
    "kelas_id" TEXT,
    "nama_siswa" VARCHAR(150) NOT NULL,
    "kelas" VARCHAR(50),
    "nama_lomba" VARCHAR(200) NOT NULL,
    "tingkat" VARCHAR(50) NOT NULL,
    "juara" VARCHAR(50) NOT NULL,
    "bulan" VARCHAR(20),
    "tahun" INTEGER NOT NULL,
    "penyelenggara" VARCHAR(200) NOT NULL,
    "keterangan" TEXT,
    "sertifikat_url" VARCHAR(255),
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "dibuat_pada" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(6) NOT NULL,
    "dihapus_pada" TIMESTAMP(6),

    CONSTRAINT "prestasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sikap_perilaku" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "siswa_id" TEXT,
    "kelas_id" TEXT,
    "nama" VARCHAR(150) NOT NULL,
    "kelas" VARCHAR(50),
    "jenis" VARCHAR(20) NOT NULL,
    "catatan" TEXT NOT NULL,
    "poin" INTEGER NOT NULL DEFAULT 0,
    "tanggal" DATE NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "dibuat_pada" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(6) NOT NULL,
    "dihapus_pada" TIMESTAMP(6),

    CONSTRAINT "sikap_perilaku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fasilitas" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "nama" VARCHAR(150) NOT NULL,
    "lokasi" VARCHAR(150) NOT NULL,
    "kategori" VARCHAR(50) NOT NULL,
    "kondisi" VARCHAR(50) NOT NULL,
    "kapasitas" VARCHAR(50),
    "deskripsi" TEXT,
    "foto" VARCHAR(255),
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "dibuat_pada" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP(6) NOT NULL,
    "dihapus_pada" TIMESTAMP(6),

    CONSTRAINT "fasilitas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jabatan_nama_jabatan_key" ON "jabatan"("nama_jabatan");

-- CreateIndex
CREATE INDEX "prestasi_sekolah_id_tahun_idx" ON "prestasi"("sekolah_id", "tahun");

-- CreateIndex
CREATE INDEX "sikap_perilaku_sekolah_id_tanggal_idx" ON "sikap_perilaku"("sekolah_id", "tanggal");

-- CreateIndex
CREATE INDEX "fasilitas_sekolah_id_idx" ON "fasilitas"("sekolah_id");

-- CreateIndex
CREATE UNIQUE INDEX "absensi_pengguna_id_kelas_id_tanggal_key" ON "absensi"("pengguna_id", "kelas_id", "tanggal");

-- CreateIndex
CREATE UNIQUE INDEX "asesmen_token_key" ON "asesmen"("token");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_pelanggaran_sekolah_id_nama_key" ON "kategori_pelanggaran"("sekolah_id", "nama");

-- CreateIndex
CREATE UNIQUE INDEX "notifikasi_pengguna_id_kategori_target_url_key" ON "notifikasi"("pengguna_id", "kategori", "target_url");

-- CreateIndex
CREATE UNIQUE INDEX "pendaftaran_ppdb_sekolah_id_nik_key" ON "pendaftaran_ppdb"("sekolah_id", "nik");

-- CreateIndex
CREATE UNIQUE INDEX "pendaftaran_ppdb_sekolah_id_nisn_key" ON "pendaftaran_ppdb"("sekolah_id", "nisn");

-- CreateIndex
CREATE INDEX "pengguna_jabatan_id_idx" ON "pengguna"("jabatan_id");

-- CreateIndex
CREATE INDEX "pengguna_jurusan_id_idx" ON "pengguna"("jurusan_id");

-- CreateIndex
CREATE UNIQUE INDEX "sesi_konseling_sekolah_id_konselor_id_tanggal_waktu_mulai_key" ON "sesi_konseling"("sekolah_id", "konselor_id", "tanggal", "waktu_mulai");

-- CreateIndex
CREATE UNIQUE INDEX "tagihan_sekolah_id_siswa_id_kategori_tagihan_id_tahun_ajara_key" ON "tagihan"("sekolah_id", "siswa_id", "kategori_tagihan_id", "tahun_ajaran_id", "periode_bulan", "periode_tahun");

-- AddForeignKey
ALTER TABLE "pengguna" ADD CONSTRAINT "pengguna_jabatan_id_fkey" FOREIGN KEY ("jabatan_id") REFERENCES "jabatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengguna" ADD CONSTRAINT "pengguna_jurusan_id_fkey" FOREIGN KEY ("jurusan_id") REFERENCES "jurusan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_mata_pelajaran_id_fkey" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "mata_pelajaran"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aset" ADD CONSTRAINT "aset_ruangan_id_fkey" FOREIGN KEY ("ruangan_id") REFERENCES "ruangan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestasi" ADD CONSTRAINT "prestasi_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestasi" ADD CONSTRAINT "prestasi_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prestasi" ADD CONSTRAINT "prestasi_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sikap_perilaku" ADD CONSTRAINT "sikap_perilaku_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sikap_perilaku" ADD CONSTRAINT "sikap_perilaku_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sikap_perilaku" ADD CONSTRAINT "sikap_perilaku_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fasilitas" ADD CONSTRAINT "fasilitas_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
