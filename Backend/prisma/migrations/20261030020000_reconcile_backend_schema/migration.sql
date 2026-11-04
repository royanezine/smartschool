-- Reconcile the historical init with the application schema without deleting
-- business rows or legacy payment columns. Existing db-push objects are guarded.
-- All changes, data copies, and constraints are atomic.
BEGIN;
DO $$ BEGIN CREATE TYPE "KategoriBuku" AS ENUM ('PELAJARAN', 'NOVEL', 'KOMIK', 'ENSIKLOPEDIA', 'KAMUS', 'MAJALAH', 'JURNAL', 'BIOGRAFI', 'AGAMA', 'TEKNOLOGI', 'SAINS', 'SEJARAH', 'BAHASA', 'MATEMATIKA', 'FIKSI', 'NON_FIKSI'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "absensi" DROP CONSTRAINT IF EXISTS "absensi_kelas_id_fkey";

ALTER TABLE "anggota_kelas" DROP CONSTRAINT IF EXISTS "siswa_kelas_tahun_ajaran_id_fkey";

DROP INDEX IF EXISTS "mata_pelajaran_kode_key";

DROP INDEX IF EXISTS "peran_nama_key";

ALTER TABLE "absensi" ADD COLUMN IF NOT EXISTS     "biometrik_wajah_id" TEXT,
ADD COLUMN IF NOT EXISTS     "durasi_jam_kerja" DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS     "durasi_kerja_menit" INTEGER,
ADD COLUMN IF NOT EXISTS     "sekolah_id" TEXT,
ADD COLUMN IF NOT EXISTS     "shift_kerja_id" TEXT,
ADD COLUMN IF NOT EXISTS     "skor_kemiripan" DECIMAL(5,4),
ADD COLUMN IF NOT EXISTS     "status_shift" VARCHAR(30) DEFAULT 'tepat_waktu',
ADD COLUMN IF NOT EXISTS     "terlambat_menit" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS     "waktu_keluar" TIMESTAMP,
ADD COLUMN IF NOT EXISTS     "waktu_masuk" TIMESTAMP,
ALTER COLUMN "kelas_id" DROP NOT NULL;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"anggota_kelas"'::regclass AND conname = 'siswa_kelas_pkey') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"anggota_kelas"'::regclass AND conname = 'anggota_kelas_pkey') THEN ALTER TABLE "anggota_kelas" RENAME CONSTRAINT "siswa_kelas_pkey" TO "anggota_kelas_pkey"; END IF; END $$;

ALTER TABLE "asesmen" ADD COLUMN IF NOT EXISTS     "dihapus_pada" TIMESTAMP,
ADD COLUMN IF NOT EXISTS     "token" VARCHAR(10);

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"asesmen"'::regclass AND conname = 'ujian_pkey') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"asesmen"'::regclass AND conname = 'asesmen_pkey') THEN ALTER TABLE "asesmen" RENAME CONSTRAINT "ujian_pkey" TO "asesmen_pkey"; END IF; END $$;

ALTER TABLE "hasil_asesmen" ADD COLUMN IF NOT EXISTS     "dihapus_pada" TIMESTAMP;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"hasil_asesmen"'::regclass AND conname = 'hasil_ujian_pkey') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"hasil_asesmen"'::regclass AND conname = 'hasil_asesmen_pkey') THEN ALTER TABLE "hasil_asesmen" RENAME CONSTRAINT "hasil_ujian_pkey" TO "hasil_asesmen_pkey"; END IF; END $$;

ALTER TABLE "izin" ALTER COLUMN "status" SET DEFAULT 'aktif';

ALTER TABLE "jawaban_asesmen" ADD COLUMN IF NOT EXISTS     "catatan_guru" TEXT,
ADD COLUMN IF NOT EXISTS     "dihapus_pada" TIMESTAMP;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"jawaban_asesmen"'::regclass AND conname = 'jawaban_ujian_pkey') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"jawaban_asesmen"'::regclass AND conname = 'jawaban_asesmen_pkey') THEN ALTER TABLE "jawaban_asesmen" RENAME CONSTRAINT "jawaban_ujian_pkey" TO "jawaban_asesmen_pkey"; END IF; END $$;

ALTER TABLE "kelas" ADD COLUMN IF NOT EXISTS     "foto_kelas" VARCHAR(255),
ADD COLUMN IF NOT EXISTS     "gedung_id" TEXT,
ADD COLUMN IF NOT EXISTS     "jurusan_id" TEXT,
ADD COLUMN IF NOT EXISTS     "lantai_id" TEXT,
ALTER COLUMN "kapasitas" SET DEFAULT 30;

ALTER TABLE "kelas_mapel" ADD COLUMN IF NOT EXISTS     "dihapus_pada" TIMESTAMP;

ALTER TABLE "langganan_sekolah" ADD COLUMN IF NOT EXISTS     "midtrans_invoice_id" VARCHAR(100),
ADD COLUMN IF NOT EXISTS     "midtrans_payment_link" VARCHAR(255);

ALTER TABLE "materi_pembelajaran" ADD COLUMN IF NOT EXISTS     "dihapus_pada" TIMESTAMP,
ADD COLUMN IF NOT EXISTS     "tipe" VARCHAR(20),
ADD COLUMN IF NOT EXISTS     "url_link" VARCHAR(255);

ALTER TABLE "modul" ALTER COLUMN "status" SET DEFAULT 'aktif';

ALTER TABLE "pendaftaran_ppdb" ADD COLUMN IF NOT EXISTS     "gelombang" VARCHAR(50),
ADD COLUMN IF NOT EXISTS     "nik" VARCHAR(16);

ALTER TABLE "pendaftaran_tenant" ADD COLUMN IF NOT EXISTS     "alamat_yayasan" TEXT,
ADD COLUMN IF NOT EXISTS     "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS     "dikonversi_pada" TIMESTAMP,
ADD COLUMN IF NOT EXISTS     "diperbarui_pada" TIMESTAMP NOT NULL,
ADD COLUMN IF NOT EXISTS     "email_pendaftar" VARCHAR(100) NOT NULL,
ADD COLUMN IF NOT EXISTS     "email_yayasan" VARCHAR(100),
ADD COLUMN IF NOT EXISTS     "kata_sandi_pendaftar" VARCHAR(255) NOT NULL,
ADD COLUMN IF NOT EXISTS     "kode_otp" VARCHAR(10),
ADD COLUMN IF NOT EXISTS     "logo_sekolah" VARCHAR(255),
ADD COLUMN IF NOT EXISTS     "midtrans_order_id" VARCHAR(100),
ADD COLUMN IF NOT EXISTS     "nama_pendaftar" VARCHAR(100) NOT NULL,
ADD COLUMN IF NOT EXISTS     "nama_yayasan" VARCHAR(100),
ADD COLUMN IF NOT EXISTS     "npyp_yayasan" VARCHAR(50),
ADD COLUMN IF NOT EXISTS     "otp_timeout" TIMESTAMP,
ADD COLUMN IF NOT EXISTS     "paket_id" TEXT NOT NULL,
ADD COLUMN IF NOT EXISTS     "pengguna_terbuat_id" TEXT,
ADD COLUMN IF NOT EXISTS     "sekolah_terbuat_id" TEXT,
ADD COLUMN IF NOT EXISTS     "status" VARCHAR(20) NOT NULL DEFAULT 'menunggu_verifikasi',
ADD COLUMN IF NOT EXISTS     "telepon_yayasan" VARCHAR(20),
ADD COLUMN IF NOT EXISTS     "yayasan_terbuat_id" TEXT;

ALTER TABLE "pengguna" ADD COLUMN IF NOT EXISTS     "alamat_domisili" TEXT,
ADD COLUMN IF NOT EXISTS     "alamat_ktp" TEXT,
ADD COLUMN IF NOT EXISTS     "alamat_sesuai_domisili" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS     "golongan" VARCHAR(50),
ADD COLUMN IF NOT EXISTS     "jabatan" VARCHAR(100),
ADD COLUMN IF NOT EXISTS     "kategori_jabatan_id" TEXT,
ADD COLUMN IF NOT EXISTS     "kecamatan" VARCHAR(50),
ADD COLUMN IF NOT EXISTS     "kelurahan" VARCHAR(50),
ADD COLUMN IF NOT EXISTS     "kode_pos" VARCHAR(10),
ADD COLUMN IF NOT EXISTS     "kota_kabupaten" VARCHAR(50),
ADD COLUMN IF NOT EXISTS     "nama_ayah" VARCHAR(100),
ADD COLUMN IF NOT EXISTS     "nama_ibu" VARCHAR(100),
ADD COLUMN IF NOT EXISTS     "nama_wali_peserta_didik" VARCHAR(20),
ADD COLUMN IF NOT EXISTS     "nik" VARCHAR(20),
ADD COLUMN IF NOT EXISTS     "nik_ayah" VARCHAR(20),
ADD COLUMN IF NOT EXISTS     "nik_ibu" VARCHAR(20),
ADD COLUMN IF NOT EXISTS     "nis" VARCHAR(20),
ADD COLUMN IF NOT EXISTS     "no_hp_ayah" VARCHAR(20),
ADD COLUMN IF NOT EXISTS     "no_hp_ibu" VARCHAR(20),
ADD COLUMN IF NOT EXISTS     "pekerjaan_ayah" VARCHAR(50),
ADD COLUMN IF NOT EXISTS     "pekerjaan_ibu" VARCHAR(50),
ADD COLUMN IF NOT EXISTS     "pin_failed_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS     "pin_hash" VARCHAR(255),
ADD COLUMN IF NOT EXISTS     "pin_locked_until" TIMESTAMP,
ADD COLUMN IF NOT EXISTS     "provinsi" VARCHAR(50),
ADD COLUMN IF NOT EXISTS     "shift_kerja" VARCHAR(20),
ADD COLUMN IF NOT EXISTS     "shift_kerja_id" TEXT,
ADD COLUMN IF NOT EXISTS     "yayasan_id" TEXT;

ALTER TABLE "peran" ADD COLUMN IF NOT EXISTS     "sekolah_id" TEXT,
ALTER COLUMN "status" SET DEFAULT 'aktif';

ALTER TABLE "percobaan_asesmen" ADD COLUMN IF NOT EXISTS     "dihapus_pada" TIMESTAMP,
ADD COLUMN IF NOT EXISTS     "token_sesi" VARCHAR(255);

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"percobaan_asesmen"'::regclass AND conname = 'percobaan_ujian_pkey') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"percobaan_asesmen"'::regclass AND conname = 'percobaan_asesmen_pkey') THEN ALTER TABLE "percobaan_asesmen" RENAME CONSTRAINT "percobaan_ujian_pkey" TO "percobaan_asesmen_pkey"; END IF; END $$;

ALTER TABLE "riwayat_pembayaran" ADD COLUMN IF NOT EXISTS     "dihapus_pada" TIMESTAMP,
ADD COLUMN IF NOT EXISTS     "midtrans_invoice_id" VARCHAR(100),
ADD COLUMN IF NOT EXISTS     "midtrans_payment_id" VARCHAR(100),
ADD COLUMN IF NOT EXISTS     "sumber_tagihan" VARCHAR(50);

ALTER TABLE "sekolah" ADD COLUMN IF NOT EXISTS     "bujur" DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS     "favicon_url" VARCHAR(255),
ADD COLUMN IF NOT EXISTS     "jenjang" VARCHAR(20),
ADD COLUMN IF NOT EXISTS     "lintang" DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS     "logo_kecil_url" VARCHAR(255),
ADD COLUMN IF NOT EXISTS     "metode_absensi_aktif" TEXT[],
ADD COLUMN IF NOT EXISTS     "npsn" VARCHAR(50),
ADD COLUMN IF NOT EXISTS     "radius_absensi" INTEGER;

ALTER TABLE "soal_asesmen" ADD COLUMN IF NOT EXISTS     "dihapus_pada" TIMESTAMP;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"soal_asesmen"'::regclass AND conname = 'soal_ujian_pkey') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"soal_asesmen"'::regclass AND conname = 'soal_asesmen_pkey') THEN ALTER TABLE "soal_asesmen" RENAME CONSTRAINT "soal_ujian_pkey" TO "soal_asesmen_pkey"; END IF; END $$;

UPDATE "tahun_ajaran" SET "status" = 'tidak_aktif' WHERE "status" IS NULL;

ALTER TABLE "tahun_ajaran" ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'tidak_aktif';

ALTER TABLE "tugas" ADD COLUMN IF NOT EXISTS     "dihapus_pada" TIMESTAMP;

ALTER TABLE "yayasan" ADD COLUMN IF NOT EXISTS     "npyp" VARCHAR(50),
ADD COLUMN IF NOT EXISTS     "paket_id" TEXT,
ADD COLUMN IF NOT EXISTS     "status_langganan" VARCHAR(20),
ADD COLUMN IF NOT EXISTS     "tanggal_berakhir_langganan" TIMESTAMP,
ADD COLUMN IF NOT EXISTS     "tanggal_mulai_langganan" TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT 'aktif';

CREATE TABLE IF NOT EXISTS "audit_log" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "sekolah_id" TEXT,
    "aksi" VARCHAR(50) NOT NULL,
    "modul" VARCHAR(50) NOT NULL,
    "entitas_id" VARCHAR(50),
    "data_lama" JSONB,
    "data_baru" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" VARCHAR(255),
    "waktu" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "pengaturan_sistem" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "kunci" VARCHAR(100) NOT NULL,
    "nilai" TEXT NOT NULL,
    "tipe_data" VARCHAR(20) NOT NULL,
    "kelompok" VARCHAR(20) NOT NULL,
    "keterangan" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "pengaturan_sistem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "nilai_akhir_mapel" (
    "id" TEXT NOT NULL,
    "kelas_mapel_id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nilai_akhir" DECIMAL(5,2) NOT NULL,
    "predikat" VARCHAR(2) NOT NULL,
    "kkm" INTEGER NOT NULL DEFAULT 75,
    "total_bobot" DECIMAL(5,2) NOT NULL,
    "detail_komponen" JSONB NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "difinalkan_oleh" TEXT,
    "difinalkan_pada" TIMESTAMP,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "nilai_akhir_mapel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "rapot" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "kelas_id" TEXT NOT NULL,
    "tahun_ajaran_id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "semester" VARCHAR(10) NOT NULL,
    "jenis_rapot" VARCHAR(20) NOT NULL,
    "nilai_snapshot" JSONB NOT NULL,
    "rata_rata" DECIMAL(5,2),
    "ranking" INTEGER,
    "catatan_wali_kelas" TEXT,
    "keterangan" TEXT,
    "jumlah_hadir" INTEGER NOT NULL DEFAULT 0,
    "jumlah_izin" INTEGER NOT NULL DEFAULT 0,
    "jumlah_sakit" INTEGER NOT NULL DEFAULT 0,
    "jumlah_alpha" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "dipublish_oleh" TEXT,
    "dipublish_pada" TIMESTAMP,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "rapot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "permohonan_izin" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "penyetuju_id" TEXT,
    "guruPenggantiId" TEXT,
    "jenis" VARCHAR(20) NOT NULL,
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_selesai" DATE NOT NULL,
    "alasan" TEXT NOT NULL,
    "url_bukti" VARCHAR(255),
    "status" VARCHAR(20) NOT NULL DEFAULT 'menunggu',
    "catatan" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "permohonan_izin_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "biometrik_wajah" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "embedding_vector" JSONB,
    "url_foto_referensi" VARCHAR(255),
    "perangkat" VARCHAR(50),
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "biometrik_wajah_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "gedung" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "kode" VARCHAR(20),
    "foto_gedung" VARCHAR(255),
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "gedung_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "lantai" (
    "id" TEXT NOT NULL,
    "gedung_id" TEXT NOT NULL,
    "nama" VARCHAR(50) NOT NULL,
    "nomor_lantai" INTEGER,
    "foto_lantai" VARCHAR(255),
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "lantai_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "jadwal_mengajar" (
    "id" TEXT NOT NULL,
    "kelas_mapel_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "hari" VARCHAR(20) NOT NULL,
    "jam_mulai" VARCHAR(5) NOT NULL,
    "jam_selesai" VARCHAR(5) NOT NULL,
    "ruangan" VARCHAR(100),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "jadwal_mengajar_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "peminjaman_aset" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "peminjam_id" TEXT NOT NULL,
    "petugas_id" TEXT,
    "siswa_pengambil_id" TEXT,
    "nama_siswa_pengambil" VARCHAR(100),
    "siswa_pengembali_id" TEXT,
    "nama_siswa_pengembali" VARCHAR(100),
    "nomor_peminjaman" VARCHAR(50) NOT NULL,
    "keperluan" TEXT NOT NULL,
    "tanggal_pengajuan" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_pinjam" DATE,
    "tanggal_kembali_rencana" DATE NOT NULL,
    "tanggal_kembali_aktual" TIMESTAMP,
    "status" VARCHAR(30) NOT NULL DEFAULT 'menunggu_persetujuan',
    "catatan_penolakan" TEXT,
    "catatan_peminjaman" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "peminjaman_aset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "detail_peminjaman_aset" (
    "id" TEXT NOT NULL,
    "peminjaman_id" TEXT NOT NULL,
    "aset_id" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "kondisi_saat_pinjam" VARCHAR(20) DEFAULT 'baik',
    "kondisi_saat_kembali" VARCHAR(20),
    "catatan_kembali" TEXT,

    CONSTRAINT "detail_peminjaman_aset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "sesi_konseling" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "konselor_id" TEXT,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "tanggal" DATE NOT NULL,
    "waktu_mulai" VARCHAR(5),
    "waktu_selesai" VARCHAR(5),
    "topik" VARCHAR(150) NOT NULL,
    "masalah" TEXT,
    "hasil" TEXT,
    "tindak_lanjut" TEXT,
    "status" VARCHAR(20) DEFAULT 'dijadwalkan',
    "catatan" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "sesi_konseling_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "kategori_pelanggaran" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "poin" INTEGER NOT NULL,
    "status" VARCHAR(20) DEFAULT 'aktif',
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "kategori_pelanggaran_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "pelanggaran_siswa" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "kategori_pelanggaran_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "tanggal" DATE NOT NULL,
    "kronologi" TEXT,
    "poin" INTEGER NOT NULL,
    "status" VARCHAR(20) DEFAULT 'tercatat',
    "tindak_lanjut" TEXT,
    "catatan" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "pelanggaran_siswa_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "buku" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "kode_buku" VARCHAR(50) NOT NULL,
    "judul" VARCHAR(150) NOT NULL,
    "penulis" VARCHAR(100),
    "penerbit" VARCHAR(100),
    "tahun_terbit" INTEGER,
    "isbn" VARCHAR(30),
    "tipe" VARCHAR(20) NOT NULL,
    "kategori" "KategoriBuku",
    "mata_pelajaran_id" TEXT,
    "deskripsi" TEXT,
    "cover_url" VARCHAR(255),
    "url_ebook" VARCHAR(255),
    "jumlah" INTEGER NOT NULL DEFAULT 0,
    "jumlah_tersedia" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) DEFAULT 'aktif',
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "buku_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "peminjaman_buku" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "buku_id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nomor_peminjaman" VARCHAR(50) NOT NULL,
    "tanggal_pinjam" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_jatuh_tempo" DATE NOT NULL,
    "tanggal_kembali" TIMESTAMP,
    "status" VARCHAR(20) NOT NULL DEFAULT 'dipinjam',
    "catatan" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "peminjaman_buku_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "kategori_jabatan" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(100) NOT NULL,
    "kode" VARCHAR(50),
    "keterangan" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'aktif',
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "kategori_jabatan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "kategori_tagihan" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "kode" VARCHAR(20) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "siklus" VARCHAR(20) NOT NULL DEFAULT 'bulanan',
    "deskripsi" TEXT,
    "status" VARCHAR(20) DEFAULT 'aktif',
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "kategori_tagihan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tarif_jabatan" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "kategori_jabatan_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "tarif_per_jam" DECIMAL(12,2) NOT NULL,
    "berlaku_mulai" DATE NOT NULL,
    "berakhir_pada" DATE,
    "catatan" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "tarif_jabatan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "shift_kerja" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(50) NOT NULL,
    "kode" VARCHAR(20),
    "jam_masuk" VARCHAR(5) NOT NULL,
    "jam_keluar" VARCHAR(5) NOT NULL,
    "toleransi_terlambat_menit" INTEGER NOT NULL DEFAULT 15,
    "status" VARCHAR(20) NOT NULL DEFAULT 'aktif',
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "shift_kerja_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "penggajian" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "bulan" SMALLINT NOT NULL,
    "tahun" SMALLINT NOT NULL,
    "tanggal_mulai" DATE NOT NULL,
    "tanggal_selesai" DATE NOT NULL,
    "total_hari_kerja" INTEGER NOT NULL DEFAULT 0,
    "total_jam_kerja" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "tarif_per_jam" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_gaji" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "dibekukan_pada" TIMESTAMP,
    "dibekukan_oleh" TEXT,
    "catatan" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "penggajian_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tarif_tagihan" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "kategori_tagihan_id" TEXT NOT NULL,
    "tahun_ajaran_id" TEXT NOT NULL,
    "kelas_id" TEXT,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "tingkat" VARCHAR(20),
    "nominal" DECIMAL(15,2) NOT NULL,
    "keterangan" TEXT,
    "status" VARCHAR(20) DEFAULT 'aktif',
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "tarif_tagihan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tagihan" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "kategori_tagihan_id" TEXT NOT NULL,
    "tarif_tagihan_id" TEXT,
    "tahun_ajaran_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nomor_tagihan" VARCHAR(50) NOT NULL,
    "periode_bulan" INTEGER,
    "periode_tahun" INTEGER,
    "nominal" DECIMAL(15,2) NOT NULL,
    "diskon" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_tagihan" DECIMAL(15,2) NOT NULL,
    "total_dibayar" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "sisa" DECIMAL(15,2) NOT NULL,
    "jatuh_tempo" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'belum_bayar',
    "keterangan" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "tagihan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "pembayaran_tagihan" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "tagihan_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "akun_kas_id" TEXT NOT NULL,
    "penerima_id" TEXT,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nomor_pembayaran" VARCHAR(50) NOT NULL,
    "jumlah" DECIMAL(15,2) NOT NULL,
    "metode" VARCHAR(30) NOT NULL,
    "tanggal_bayar" DATE NOT NULL,
    "referensi" VARCHAR(100),
    "catatan" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'berhasil',
    "dibatalkan_pada" TIMESTAMP,
    "dibatalkan_oleh" TEXT,
    "alasan_pembatalan" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "pembayaran_tagihan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tabungan_siswa" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "saldo" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(20) DEFAULT 'aktif',
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "tabungan_siswa_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "transaksi_tabungan" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "tabungan_siswa_id" TEXT NOT NULL,
    "akun_kas_id" TEXT NOT NULL,
    "petugas_id" TEXT,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nomor_transaksi" VARCHAR(50) NOT NULL,
    "jenis" VARCHAR(10) NOT NULL,
    "jumlah" DECIMAL(15,2) NOT NULL,
    "saldo_sebelum" DECIMAL(15,2) NOT NULL,
    "saldo_sesudah" DECIMAL(15,2) NOT NULL,
    "tanggal" DATE NOT NULL,
    "keterangan" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'berhasil',
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "transaksi_tabungan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "akun_kas" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "kode" VARCHAR(20) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "tipe" VARCHAR(20) NOT NULL DEFAULT 'kas',
    "saldo_awal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" VARCHAR(20) DEFAULT 'aktif',
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "akun_kas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "jurnal_kas" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "akun_kas_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nomor_jurnal" VARCHAR(50) NOT NULL,
    "tanggal" DATE NOT NULL,
    "jenis" VARCHAR(10) NOT NULL,
    "kategori" VARCHAR(50) NOT NULL,
    "jumlah" DECIMAL(15,2) NOT NULL,
    "keterangan" TEXT,
    "sumber" VARCHAR(30) NOT NULL DEFAULT 'manual',
    "sumber_id" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'aktif',
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "jurnal_kas_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "jurusan" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "kode" VARCHAR(20) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'aktif',
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "jurusan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "asesmen_minat_bakat" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "siswa_id" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "jenis" VARCHAR(100) NOT NULL,
    "minat" TEXT,
    "bakat" TEXT,
    "hasil" TEXT,
    "rekomendasi" TEXT,
    "skor" DECIMAL(5,2),
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "catatan" TEXT,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "asesmen_minat_bakat_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "pengumuman_ppdb" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "judul" VARCHAR(200) NOT NULL,
    "konten" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "dipublikasikan_pada" TIMESTAMP,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "pengumuman_ppdb_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "nilai_akhir_mapel_sekolah_id_idx" ON "nilai_akhir_mapel"("sekolah_id");

CREATE UNIQUE INDEX IF NOT EXISTS "nilai_akhir_mapel_kelas_mapel_id_pengguna_id_key" ON "nilai_akhir_mapel"("kelas_mapel_id", "pengguna_id");

CREATE INDEX IF NOT EXISTS "rapot_sekolah_id_kelas_id_idx" ON "rapot"("sekolah_id", "kelas_id");

CREATE UNIQUE INDEX IF NOT EXISTS "rapot_pengguna_id_kelas_id_tahun_ajaran_id_semester_jenis_r_key" ON "rapot"("pengguna_id", "kelas_id", "tahun_ajaran_id", "semester", "jenis_rapot");

CREATE UNIQUE INDEX IF NOT EXISTS "biometrik_wajah_pengguna_id_key" ON "biometrik_wajah"("pengguna_id");

CREATE UNIQUE INDEX IF NOT EXISTS "peminjaman_aset_nomor_peminjaman_key" ON "peminjaman_aset"("nomor_peminjaman");

CREATE INDEX IF NOT EXISTS "sesi_konseling_sekolah_id_tanggal_idx" ON "sesi_konseling"("sekolah_id", "tanggal");

CREATE INDEX IF NOT EXISTS "sesi_konseling_konselor_id_tanggal_idx" ON "sesi_konseling"("konselor_id", "tanggal");

CREATE UNIQUE INDEX IF NOT EXISTS "buku_sekolah_id_kode_buku_key" ON "buku"("sekolah_id", "kode_buku");

CREATE UNIQUE INDEX IF NOT EXISTS "peminjaman_buku_nomor_peminjaman_key" ON "peminjaman_buku"("nomor_peminjaman");

CREATE INDEX IF NOT EXISTS "kategori_jabatan_sekolah_id_idx" ON "kategori_jabatan"("sekolah_id");

CREATE INDEX IF NOT EXISTS "kategori_tagihan_sekolah_id_idx" ON "kategori_tagihan"("sekolah_id");

CREATE UNIQUE INDEX IF NOT EXISTS "kategori_tagihan_sekolah_id_kode_key" ON "kategori_tagihan"("sekolah_id", "kode");

CREATE INDEX IF NOT EXISTS "tarif_jabatan_sekolah_id_kategori_jabatan_id_idx" ON "tarif_jabatan"("sekolah_id", "kategori_jabatan_id");

CREATE INDEX IF NOT EXISTS "tarif_jabatan_berlaku_mulai_berakhir_pada_idx" ON "tarif_jabatan"("berlaku_mulai", "berakhir_pada");

CREATE INDEX IF NOT EXISTS "shift_kerja_sekolah_id_idx" ON "shift_kerja"("sekolah_id");

CREATE INDEX IF NOT EXISTS "penggajian_sekolah_id_bulan_tahun_idx" ON "penggajian"("sekolah_id", "bulan", "tahun");

CREATE INDEX IF NOT EXISTS "penggajian_pengguna_id_idx" ON "penggajian"("pengguna_id");

CREATE UNIQUE INDEX IF NOT EXISTS "penggajian_sekolah_id_pengguna_id_bulan_tahun_key" ON "penggajian"("sekolah_id", "pengguna_id", "bulan", "tahun");

CREATE INDEX IF NOT EXISTS "tarif_tagihan_sekolah_id_kategori_tagihan_id_tahun_ajaran_i_idx" ON "tarif_tagihan"("sekolah_id", "kategori_tagihan_id", "tahun_ajaran_id");

CREATE UNIQUE INDEX IF NOT EXISTS "tagihan_nomor_tagihan_key" ON "tagihan"("nomor_tagihan");

CREATE INDEX IF NOT EXISTS "tagihan_sekolah_id_status_jatuh_tempo_idx" ON "tagihan"("sekolah_id", "status", "jatuh_tempo");

CREATE INDEX IF NOT EXISTS "tagihan_siswa_id_idx" ON "tagihan"("siswa_id");

CREATE INDEX IF NOT EXISTS "tagihan_sekolah_id_kategori_tagihan_id_tahun_ajaran_id_idx" ON "tagihan"("sekolah_id", "kategori_tagihan_id", "tahun_ajaran_id");

CREATE UNIQUE INDEX IF NOT EXISTS "pembayaran_tagihan_nomor_pembayaran_key" ON "pembayaran_tagihan"("nomor_pembayaran");

CREATE INDEX IF NOT EXISTS "pembayaran_tagihan_sekolah_id_tanggal_bayar_idx" ON "pembayaran_tagihan"("sekolah_id", "tanggal_bayar");

CREATE INDEX IF NOT EXISTS "pembayaran_tagihan_tagihan_id_idx" ON "pembayaran_tagihan"("tagihan_id");

CREATE INDEX IF NOT EXISTS "pembayaran_tagihan_siswa_id_idx" ON "pembayaran_tagihan"("siswa_id");

CREATE UNIQUE INDEX IF NOT EXISTS "tabungan_siswa_sekolah_id_siswa_id_key" ON "tabungan_siswa"("sekolah_id", "siswa_id");

CREATE UNIQUE INDEX IF NOT EXISTS "transaksi_tabungan_nomor_transaksi_key" ON "transaksi_tabungan"("nomor_transaksi");

CREATE INDEX IF NOT EXISTS "transaksi_tabungan_sekolah_id_tanggal_idx" ON "transaksi_tabungan"("sekolah_id", "tanggal");

CREATE INDEX IF NOT EXISTS "transaksi_tabungan_tabungan_siswa_id_idx" ON "transaksi_tabungan"("tabungan_siswa_id");

CREATE UNIQUE INDEX IF NOT EXISTS "akun_kas_sekolah_id_kode_key" ON "akun_kas"("sekolah_id", "kode");

CREATE UNIQUE INDEX IF NOT EXISTS "jurnal_kas_nomor_jurnal_key" ON "jurnal_kas"("nomor_jurnal");

CREATE INDEX IF NOT EXISTS "jurnal_kas_sekolah_id_tanggal_idx" ON "jurnal_kas"("sekolah_id", "tanggal");

CREATE INDEX IF NOT EXISTS "jurnal_kas_akun_kas_id_status_idx" ON "jurnal_kas"("akun_kas_id", "status");

CREATE INDEX IF NOT EXISTS "jurnal_kas_sumber_sumber_id_idx" ON "jurnal_kas"("sumber", "sumber_id");

CREATE UNIQUE INDEX IF NOT EXISTS "jurusan_sekolah_id_kode_key" ON "jurusan"("sekolah_id", "kode");

CREATE INDEX IF NOT EXISTS "asesmen_minat_bakat_sekolah_id_siswa_id_tanggal_idx" ON "asesmen_minat_bakat"("sekolah_id", "siswa_id", "tanggal");

CREATE INDEX IF NOT EXISTS "pengumuman_ppdb_sekolah_id_status_dipublikasikan_pada_idx" ON "pengumuman_ppdb"("sekolah_id", "status", "dipublikasikan_pada");

CREATE INDEX IF NOT EXISTS "absensi_pengguna_id_tanggal_idx" ON "absensi"("pengguna_id", "tanggal");

CREATE INDEX IF NOT EXISTS "absensi_sekolah_id_tanggal_idx" ON "absensi"("sekolah_id", "tanggal");

CREATE INDEX IF NOT EXISTS "absensi_shift_kerja_id_idx" ON "absensi"("shift_kerja_id");

CREATE UNIQUE INDEX IF NOT EXISTS "nilai_pengguna_id_komponen_nilai_id_key" ON "nilai"("pengguna_id", "komponen_nilai_id");

CREATE UNIQUE INDEX IF NOT EXISTS "pendaftaran_tenant_yayasan_terbuat_id_key" ON "pendaftaran_tenant"("yayasan_terbuat_id");

CREATE UNIQUE INDEX IF NOT EXISTS "pendaftaran_tenant_sekolah_terbuat_id_key" ON "pendaftaran_tenant"("sekolah_terbuat_id");

CREATE UNIQUE INDEX IF NOT EXISTS "pendaftaran_tenant_pengguna_terbuat_id_key" ON "pendaftaran_tenant"("pengguna_terbuat_id");

CREATE UNIQUE INDEX IF NOT EXISTS "pengguna_nisn_key" ON "pengguna"("nisn");

CREATE UNIQUE INDEX IF NOT EXISTS "pengguna_nik_key" ON "pengguna"("nik");

CREATE UNIQUE INDEX IF NOT EXISTS "peran_nama_sekolah_id_key" ON "peran"("nama", "sekolah_id");

CREATE UNIQUE INDEX IF NOT EXISTS "sekolah_langganan_aktif_id_key" ON "sekolah"("langganan_aktif_id");

CREATE UNIQUE INDEX IF NOT EXISTS "sekolah_npsn_key" ON "sekolah"("npsn");

CREATE UNIQUE INDEX IF NOT EXISTS "yayasan_npyp_key" ON "yayasan"("npyp");

CREATE INDEX IF NOT EXISTS "yayasan_paket_id_idx" ON "yayasan"("paket_id");

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"anggota_kelas"'::regclass AND conname = 'siswa_kelas_kelas_id_fkey') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"anggota_kelas"'::regclass AND conname = 'anggota_kelas_kelas_id_fkey') THEN ALTER TABLE "anggota_kelas" RENAME CONSTRAINT "siswa_kelas_kelas_id_fkey" TO "anggota_kelas_kelas_id_fkey"; END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"anggota_kelas"'::regclass AND conname = 'siswa_kelas_pengguna_id_fkey') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"anggota_kelas"'::regclass AND conname = 'anggota_kelas_pengguna_id_fkey') THEN ALTER TABLE "anggota_kelas" RENAME CONSTRAINT "siswa_kelas_pengguna_id_fkey" TO "anggota_kelas_pengguna_id_fkey"; END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"asesmen"'::regclass AND conname = 'ujian_kelas_mapel_id_fkey') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"asesmen"'::regclass AND conname = 'asesmen_kelas_mapel_id_fkey') THEN ALTER TABLE "asesmen" RENAME CONSTRAINT "ujian_kelas_mapel_id_fkey" TO "asesmen_kelas_mapel_id_fkey"; END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"hasil_asesmen"'::regclass AND conname = 'hasil_ujian_percobaan_ujian_id_fkey') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"hasil_asesmen"'::regclass AND conname = 'hasil_asesmen_percobaan_asesmen_id_fkey') THEN ALTER TABLE "hasil_asesmen" RENAME CONSTRAINT "hasil_ujian_percobaan_ujian_id_fkey" TO "hasil_asesmen_percobaan_asesmen_id_fkey"; END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"jawaban_asesmen"'::regclass AND conname = 'jawaban_ujian_percobaan_ujian_id_fkey') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"jawaban_asesmen"'::regclass AND conname = 'jawaban_asesmen_percobaan_asesmen_id_fkey') THEN ALTER TABLE "jawaban_asesmen" RENAME CONSTRAINT "jawaban_ujian_percobaan_ujian_id_fkey" TO "jawaban_asesmen_percobaan_asesmen_id_fkey"; END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"percobaan_asesmen"'::regclass AND conname = 'percobaan_ujian_pengguna_id_fkey') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"percobaan_asesmen"'::regclass AND conname = 'percobaan_asesmen_siswa_id_fkey') THEN ALTER TABLE "percobaan_asesmen" RENAME CONSTRAINT "percobaan_ujian_pengguna_id_fkey" TO "percobaan_asesmen_siswa_id_fkey"; END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"percobaan_asesmen"'::regclass AND conname = 'percobaan_ujian_ujian_id_fkey') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"percobaan_asesmen"'::regclass AND conname = 'percobaan_asesmen_asesmen_id_fkey') THEN ALTER TABLE "percobaan_asesmen" RENAME CONSTRAINT "percobaan_ujian_ujian_id_fkey" TO "percobaan_asesmen_asesmen_id_fkey"; END IF; END $$;

DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"soal_asesmen"'::regclass AND conname = 'soal_ujian_ujian_id_fkey') AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"soal_asesmen"'::regclass AND conname = 'soal_asesmen_asesmen_id_fkey') THEN ALTER TABLE "soal_asesmen" RENAME CONSTRAINT "soal_ujian_ujian_id_fkey" TO "soal_asesmen_asesmen_id_fkey"; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pengguna"'::regclass AND conname = 'pengguna_yayasan_id_fkey') THEN ALTER TABLE "pengguna" ADD CONSTRAINT "pengguna_yayasan_id_fkey" FOREIGN KEY ("yayasan_id") REFERENCES "yayasan"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pengguna"'::regclass AND conname = 'pengguna_kategori_jabatan_id_fkey') THEN ALTER TABLE "pengguna" ADD CONSTRAINT "pengguna_kategori_jabatan_id_fkey" FOREIGN KEY ("kategori_jabatan_id") REFERENCES "kategori_jabatan"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pengguna"'::regclass AND conname = 'pengguna_shift_kerja_id_fkey') THEN ALTER TABLE "pengguna" ADD CONSTRAINT "pengguna_shift_kerja_id_fkey" FOREIGN KEY ("shift_kerja_id") REFERENCES "shift_kerja"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"peran"'::regclass AND conname = 'peran_sekolah_id_fkey') THEN ALTER TABLE "peran" ADD CONSTRAINT "peran_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE CASCADE ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"yayasan"'::regclass AND conname = 'yayasan_paket_id_fkey') THEN ALTER TABLE "yayasan" ADD CONSTRAINT "yayasan_paket_id_fkey" FOREIGN KEY ("paket_id") REFERENCES "paket"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pendaftaran_tenant"'::regclass AND conname = 'pendaftaran_tenant_paket_id_fkey') THEN ALTER TABLE "pendaftaran_tenant" ADD CONSTRAINT "pendaftaran_tenant_paket_id_fkey" FOREIGN KEY ("paket_id") REFERENCES "paket"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pendaftaran_tenant"'::regclass AND conname = 'pendaftaran_tenant_yayasan_terbuat_id_fkey') THEN ALTER TABLE "pendaftaran_tenant" ADD CONSTRAINT "pendaftaran_tenant_yayasan_terbuat_id_fkey" FOREIGN KEY ("yayasan_terbuat_id") REFERENCES "yayasan"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"audit_log"'::regclass AND conname = 'audit_log_pengguna_id_fkey') THEN ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"audit_log"'::regclass AND conname = 'audit_log_sekolah_id_fkey') THEN ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pengaturan_sistem"'::regclass AND conname = 'pengaturan_sistem_sekolah_id_fkey') THEN ALTER TABLE "pengaturan_sistem" ADD CONSTRAINT "pengaturan_sistem_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"kelas"'::regclass AND conname = 'kelas_jurusan_id_fkey') THEN ALTER TABLE "kelas" ADD CONSTRAINT "kelas_jurusan_id_fkey" FOREIGN KEY ("jurusan_id") REFERENCES "jurusan"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"kelas"'::regclass AND conname = 'kelas_gedung_id_fkey') THEN ALTER TABLE "kelas" ADD CONSTRAINT "kelas_gedung_id_fkey" FOREIGN KEY ("gedung_id") REFERENCES "gedung"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"kelas"'::regclass AND conname = 'kelas_lantai_id_fkey') THEN ALTER TABLE "kelas" ADD CONSTRAINT "kelas_lantai_id_fkey" FOREIGN KEY ("lantai_id") REFERENCES "lantai"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"nilai_akhir_mapel"'::regclass AND conname = 'nilai_akhir_mapel_kelas_mapel_id_fkey') THEN ALTER TABLE "nilai_akhir_mapel" ADD CONSTRAINT "nilai_akhir_mapel_kelas_mapel_id_fkey" FOREIGN KEY ("kelas_mapel_id") REFERENCES "kelas_mapel"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"nilai_akhir_mapel"'::regclass AND conname = 'nilai_akhir_mapel_pengguna_id_fkey') THEN ALTER TABLE "nilai_akhir_mapel" ADD CONSTRAINT "nilai_akhir_mapel_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"nilai_akhir_mapel"'::regclass AND conname = 'nilai_akhir_mapel_sekolah_id_fkey') THEN ALTER TABLE "nilai_akhir_mapel" ADD CONSTRAINT "nilai_akhir_mapel_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"rapot"'::regclass AND conname = 'rapot_pengguna_id_fkey') THEN ALTER TABLE "rapot" ADD CONSTRAINT "rapot_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"rapot"'::regclass AND conname = 'rapot_kelas_id_fkey') THEN ALTER TABLE "rapot" ADD CONSTRAINT "rapot_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"rapot"'::regclass AND conname = 'rapot_tahun_ajaran_id_fkey') THEN ALTER TABLE "rapot" ADD CONSTRAINT "rapot_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"rapot"'::regclass AND conname = 'rapot_sekolah_id_fkey') THEN ALTER TABLE "rapot" ADD CONSTRAINT "rapot_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"absensi"'::regclass AND conname = 'absensi_sekolah_id_fkey') THEN ALTER TABLE "absensi" ADD CONSTRAINT "absensi_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"absensi"'::regclass AND conname = 'absensi_shift_kerja_id_fkey') THEN ALTER TABLE "absensi" ADD CONSTRAINT "absensi_shift_kerja_id_fkey" FOREIGN KEY ("shift_kerja_id") REFERENCES "shift_kerja"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"absensi"'::regclass AND conname = 'absensi_kelas_id_fkey') THEN ALTER TABLE "absensi" ADD CONSTRAINT "absensi_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"absensi"'::regclass AND conname = 'absensi_biometrik_wajah_id_fkey') THEN ALTER TABLE "absensi" ADD CONSTRAINT "absensi_biometrik_wajah_id_fkey" FOREIGN KEY ("biometrik_wajah_id") REFERENCES "biometrik_wajah"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"permohonan_izin"'::regclass AND conname = 'permohonan_izin_guruPenggantiId_fkey') THEN ALTER TABLE "permohonan_izin" ADD CONSTRAINT "permohonan_izin_guruPenggantiId_fkey" FOREIGN KEY ("guruPenggantiId") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"permohonan_izin"'::regclass AND conname = 'permohonan_izin_sekolah_id_fkey') THEN ALTER TABLE "permohonan_izin" ADD CONSTRAINT "permohonan_izin_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"permohonan_izin"'::regclass AND conname = 'permohonan_izin_pengguna_id_fkey') THEN ALTER TABLE "permohonan_izin" ADD CONSTRAINT "permohonan_izin_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"permohonan_izin"'::regclass AND conname = 'permohonan_izin_penyetuju_id_fkey') THEN ALTER TABLE "permohonan_izin" ADD CONSTRAINT "permohonan_izin_penyetuju_id_fkey" FOREIGN KEY ("penyetuju_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"biometrik_wajah"'::regclass AND conname = 'biometrik_wajah_pengguna_id_fkey') THEN ALTER TABLE "biometrik_wajah" ADD CONSTRAINT "biometrik_wajah_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"jawaban_asesmen"'::regclass AND conname = 'jawaban_asesmen_soal_id_fkey') THEN ALTER TABLE "jawaban_asesmen" ADD CONSTRAINT "jawaban_asesmen_soal_id_fkey" FOREIGN KEY ("soal_id") REFERENCES "soal_asesmen"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pengumpulan_tugas"'::regclass AND conname = 'pengumpulan_tugas_tugas_id_fkey') THEN ALTER TABLE "pengumpulan_tugas" ADD CONSTRAINT "pengumpulan_tugas_tugas_id_fkey" FOREIGN KEY ("tugas_id") REFERENCES "tugas"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"gedung"'::regclass AND conname = 'gedung_sekolah_id_fkey') THEN ALTER TABLE "gedung" ADD CONSTRAINT "gedung_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"lantai"'::regclass AND conname = 'lantai_gedung_id_fkey') THEN ALTER TABLE "lantai" ADD CONSTRAINT "lantai_gedung_id_fkey" FOREIGN KEY ("gedung_id") REFERENCES "gedung"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"jadwal_mengajar"'::regclass AND conname = 'jadwal_mengajar_kelas_mapel_id_fkey') THEN ALTER TABLE "jadwal_mengajar" ADD CONSTRAINT "jadwal_mengajar_kelas_mapel_id_fkey" FOREIGN KEY ("kelas_mapel_id") REFERENCES "kelas_mapel"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"aset"'::regclass AND conname = 'aset_kategori_aset_id_fkey') THEN ALTER TABLE "aset" ADD CONSTRAINT "aset_kategori_aset_id_fkey" FOREIGN KEY ("kategori_aset_id") REFERENCES "kategori_aset"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"aset"'::regclass AND conname = 'aset_gudang_id_fkey') THEN ALTER TABLE "aset" ADD CONSTRAINT "aset_gudang_id_fkey" FOREIGN KEY ("gudang_id") REFERENCES "gudang"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"peminjaman_aset"'::regclass AND conname = 'peminjaman_aset_sekolah_id_fkey') THEN ALTER TABLE "peminjaman_aset" ADD CONSTRAINT "peminjaman_aset_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"peminjaman_aset"'::regclass AND conname = 'peminjaman_aset_peminjam_id_fkey') THEN ALTER TABLE "peminjaman_aset" ADD CONSTRAINT "peminjaman_aset_peminjam_id_fkey" FOREIGN KEY ("peminjam_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"peminjaman_aset"'::regclass AND conname = 'peminjaman_aset_petugas_id_fkey') THEN ALTER TABLE "peminjaman_aset" ADD CONSTRAINT "peminjaman_aset_petugas_id_fkey" FOREIGN KEY ("petugas_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"peminjaman_aset"'::regclass AND conname = 'peminjaman_aset_siswa_pengambil_id_fkey') THEN ALTER TABLE "peminjaman_aset" ADD CONSTRAINT "peminjaman_aset_siswa_pengambil_id_fkey" FOREIGN KEY ("siswa_pengambil_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"peminjaman_aset"'::regclass AND conname = 'peminjaman_aset_siswa_pengembali_id_fkey') THEN ALTER TABLE "peminjaman_aset" ADD CONSTRAINT "peminjaman_aset_siswa_pengembali_id_fkey" FOREIGN KEY ("siswa_pengembali_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"detail_peminjaman_aset"'::regclass AND conname = 'detail_peminjaman_aset_peminjaman_id_fkey') THEN ALTER TABLE "detail_peminjaman_aset" ADD CONSTRAINT "detail_peminjaman_aset_peminjaman_id_fkey" FOREIGN KEY ("peminjaman_id") REFERENCES "peminjaman_aset"("id") ON DELETE CASCADE ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"detail_peminjaman_aset"'::regclass AND conname = 'detail_peminjaman_aset_aset_id_fkey') THEN ALTER TABLE "detail_peminjaman_aset" ADD CONSTRAINT "detail_peminjaman_aset_aset_id_fkey" FOREIGN KEY ("aset_id") REFERENCES "aset"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"laporan_kerusakan"'::regclass AND conname = 'laporan_kerusakan_aset_id_fkey') THEN ALTER TABLE "laporan_kerusakan" ADD CONSTRAINT "laporan_kerusakan_aset_id_fkey" FOREIGN KEY ("aset_id") REFERENCES "aset"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"sesi_konseling"'::regclass AND conname = 'sesi_konseling_sekolah_id_fkey') THEN ALTER TABLE "sesi_konseling" ADD CONSTRAINT "sesi_konseling_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"sesi_konseling"'::regclass AND conname = 'sesi_konseling_siswa_id_fkey') THEN ALTER TABLE "sesi_konseling" ADD CONSTRAINT "sesi_konseling_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"sesi_konseling"'::regclass AND conname = 'sesi_konseling_konselor_id_fkey') THEN ALTER TABLE "sesi_konseling" ADD CONSTRAINT "sesi_konseling_konselor_id_fkey" FOREIGN KEY ("konselor_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"kategori_pelanggaran"'::regclass AND conname = 'kategori_pelanggaran_sekolah_id_fkey') THEN ALTER TABLE "kategori_pelanggaran" ADD CONSTRAINT "kategori_pelanggaran_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pelanggaran_siswa"'::regclass AND conname = 'pelanggaran_siswa_sekolah_id_fkey') THEN ALTER TABLE "pelanggaran_siswa" ADD CONSTRAINT "pelanggaran_siswa_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pelanggaran_siswa"'::regclass AND conname = 'pelanggaran_siswa_siswa_id_fkey') THEN ALTER TABLE "pelanggaran_siswa" ADD CONSTRAINT "pelanggaran_siswa_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pelanggaran_siswa"'::regclass AND conname = 'pelanggaran_siswa_kategori_pelanggaran_id_fkey') THEN ALTER TABLE "pelanggaran_siswa" ADD CONSTRAINT "pelanggaran_siswa_kategori_pelanggaran_id_fkey" FOREIGN KEY ("kategori_pelanggaran_id") REFERENCES "kategori_pelanggaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"buku"'::regclass AND conname = 'buku_mata_pelajaran_id_fkey') THEN ALTER TABLE "buku" ADD CONSTRAINT "buku_mata_pelajaran_id_fkey" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "mata_pelajaran"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"buku"'::regclass AND conname = 'buku_sekolah_id_fkey') THEN ALTER TABLE "buku" ADD CONSTRAINT "buku_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"peminjaman_buku"'::regclass AND conname = 'peminjaman_buku_sekolah_id_fkey') THEN ALTER TABLE "peminjaman_buku" ADD CONSTRAINT "peminjaman_buku_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"peminjaman_buku"'::regclass AND conname = 'peminjaman_buku_buku_id_fkey') THEN ALTER TABLE "peminjaman_buku" ADD CONSTRAINT "peminjaman_buku_buku_id_fkey" FOREIGN KEY ("buku_id") REFERENCES "buku"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"peminjaman_buku"'::regclass AND conname = 'peminjaman_buku_pengguna_id_fkey') THEN ALTER TABLE "peminjaman_buku" ADD CONSTRAINT "peminjaman_buku_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"kategori_jabatan"'::regclass AND conname = 'kategori_jabatan_sekolah_id_fkey') THEN ALTER TABLE "kategori_jabatan" ADD CONSTRAINT "kategori_jabatan_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"kategori_tagihan"'::regclass AND conname = 'kategori_tagihan_sekolah_id_fkey') THEN ALTER TABLE "kategori_tagihan" ADD CONSTRAINT "kategori_tagihan_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"tarif_jabatan"'::regclass AND conname = 'tarif_jabatan_sekolah_id_fkey') THEN ALTER TABLE "tarif_jabatan" ADD CONSTRAINT "tarif_jabatan_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"tarif_jabatan"'::regclass AND conname = 'tarif_jabatan_kategori_jabatan_id_fkey') THEN ALTER TABLE "tarif_jabatan" ADD CONSTRAINT "tarif_jabatan_kategori_jabatan_id_fkey" FOREIGN KEY ("kategori_jabatan_id") REFERENCES "kategori_jabatan"("id") ON DELETE CASCADE ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"shift_kerja"'::regclass AND conname = 'shift_kerja_sekolah_id_fkey') THEN ALTER TABLE "shift_kerja" ADD CONSTRAINT "shift_kerja_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"penggajian"'::regclass AND conname = 'penggajian_sekolah_id_fkey') THEN ALTER TABLE "penggajian" ADD CONSTRAINT "penggajian_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"penggajian"'::regclass AND conname = 'penggajian_pengguna_id_fkey') THEN ALTER TABLE "penggajian" ADD CONSTRAINT "penggajian_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"tarif_tagihan"'::regclass AND conname = 'tarif_tagihan_sekolah_id_fkey') THEN ALTER TABLE "tarif_tagihan" ADD CONSTRAINT "tarif_tagihan_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"tarif_tagihan"'::regclass AND conname = 'tarif_tagihan_kategori_tagihan_id_fkey') THEN ALTER TABLE "tarif_tagihan" ADD CONSTRAINT "tarif_tagihan_kategori_tagihan_id_fkey" FOREIGN KEY ("kategori_tagihan_id") REFERENCES "kategori_tagihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"tarif_tagihan"'::regclass AND conname = 'tarif_tagihan_tahun_ajaran_id_fkey') THEN ALTER TABLE "tarif_tagihan" ADD CONSTRAINT "tarif_tagihan_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"tarif_tagihan"'::regclass AND conname = 'tarif_tagihan_kelas_id_fkey') THEN ALTER TABLE "tarif_tagihan" ADD CONSTRAINT "tarif_tagihan_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"tagihan"'::regclass AND conname = 'tagihan_sekolah_id_fkey') THEN ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"tagihan"'::regclass AND conname = 'tagihan_siswa_id_fkey') THEN ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"tagihan"'::regclass AND conname = 'tagihan_kategori_tagihan_id_fkey') THEN ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_kategori_tagihan_id_fkey" FOREIGN KEY ("kategori_tagihan_id") REFERENCES "kategori_tagihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"tagihan"'::regclass AND conname = 'tagihan_tarif_tagihan_id_fkey') THEN ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_tarif_tagihan_id_fkey" FOREIGN KEY ("tarif_tagihan_id") REFERENCES "tarif_tagihan"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"tagihan"'::regclass AND conname = 'tagihan_tahun_ajaran_id_fkey') THEN ALTER TABLE "tagihan" ADD CONSTRAINT "tagihan_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pembayaran_tagihan"'::regclass AND conname = 'pembayaran_tagihan_sekolah_id_fkey') THEN ALTER TABLE "pembayaran_tagihan" ADD CONSTRAINT "pembayaran_tagihan_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pembayaran_tagihan"'::regclass AND conname = 'pembayaran_tagihan_tagihan_id_fkey') THEN ALTER TABLE "pembayaran_tagihan" ADD CONSTRAINT "pembayaran_tagihan_tagihan_id_fkey" FOREIGN KEY ("tagihan_id") REFERENCES "tagihan"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pembayaran_tagihan"'::regclass AND conname = 'pembayaran_tagihan_siswa_id_fkey') THEN ALTER TABLE "pembayaran_tagihan" ADD CONSTRAINT "pembayaran_tagihan_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pembayaran_tagihan"'::regclass AND conname = 'pembayaran_tagihan_penerima_id_fkey') THEN ALTER TABLE "pembayaran_tagihan" ADD CONSTRAINT "pembayaran_tagihan_penerima_id_fkey" FOREIGN KEY ("penerima_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pembayaran_tagihan"'::regclass AND conname = 'pembayaran_tagihan_akun_kas_id_fkey') THEN ALTER TABLE "pembayaran_tagihan" ADD CONSTRAINT "pembayaran_tagihan_akun_kas_id_fkey" FOREIGN KEY ("akun_kas_id") REFERENCES "akun_kas"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"tabungan_siswa"'::regclass AND conname = 'tabungan_siswa_sekolah_id_fkey') THEN ALTER TABLE "tabungan_siswa" ADD CONSTRAINT "tabungan_siswa_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"tabungan_siswa"'::regclass AND conname = 'tabungan_siswa_siswa_id_fkey') THEN ALTER TABLE "tabungan_siswa" ADD CONSTRAINT "tabungan_siswa_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"transaksi_tabungan"'::regclass AND conname = 'transaksi_tabungan_sekolah_id_fkey') THEN ALTER TABLE "transaksi_tabungan" ADD CONSTRAINT "transaksi_tabungan_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"transaksi_tabungan"'::regclass AND conname = 'transaksi_tabungan_tabungan_siswa_id_fkey') THEN ALTER TABLE "transaksi_tabungan" ADD CONSTRAINT "transaksi_tabungan_tabungan_siswa_id_fkey" FOREIGN KEY ("tabungan_siswa_id") REFERENCES "tabungan_siswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"transaksi_tabungan"'::regclass AND conname = 'transaksi_tabungan_akun_kas_id_fkey') THEN ALTER TABLE "transaksi_tabungan" ADD CONSTRAINT "transaksi_tabungan_akun_kas_id_fkey" FOREIGN KEY ("akun_kas_id") REFERENCES "akun_kas"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"transaksi_tabungan"'::regclass AND conname = 'transaksi_tabungan_petugas_id_fkey') THEN ALTER TABLE "transaksi_tabungan" ADD CONSTRAINT "transaksi_tabungan_petugas_id_fkey" FOREIGN KEY ("petugas_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"akun_kas"'::regclass AND conname = 'akun_kas_sekolah_id_fkey') THEN ALTER TABLE "akun_kas" ADD CONSTRAINT "akun_kas_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"jurnal_kas"'::regclass AND conname = 'jurnal_kas_sekolah_id_fkey') THEN ALTER TABLE "jurnal_kas" ADD CONSTRAINT "jurnal_kas_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"jurnal_kas"'::regclass AND conname = 'jurnal_kas_akun_kas_id_fkey') THEN ALTER TABLE "jurnal_kas" ADD CONSTRAINT "jurnal_kas_akun_kas_id_fkey" FOREIGN KEY ("akun_kas_id") REFERENCES "akun_kas"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"jurusan"'::regclass AND conname = 'jurusan_sekolah_id_fkey') THEN ALTER TABLE "jurusan" ADD CONSTRAINT "jurusan_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"asesmen_minat_bakat"'::regclass AND conname = 'asesmen_minat_bakat_sekolah_id_fkey') THEN ALTER TABLE "asesmen_minat_bakat" ADD CONSTRAINT "asesmen_minat_bakat_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"asesmen_minat_bakat"'::regclass AND conname = 'asesmen_minat_bakat_siswa_id_fkey') THEN ALTER TABLE "asesmen_minat_bakat" ADD CONSTRAINT "asesmen_minat_bakat_siswa_id_fkey" FOREIGN KEY ("siswa_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = '"pengumuman_ppdb"'::regclass AND conname = 'pengumuman_ppdb_sekolah_id_fkey') THEN ALTER TABLE "pengumuman_ppdb" ADD CONSTRAINT "pengumuman_ppdb_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE; END IF; END $$;

ALTER INDEX "hasil_ujian_percobaan_ujian_id_key" RENAME TO "hasil_asesmen_percobaan_asesmen_id_key";

-- The old and current tables can coexist after previous db-push deployments.
-- Copy matching columns with explicit name mapping, retaining source tables.
DO $$
DECLARE pair TEXT[]; col RECORD; targets TEXT; sources TEXT; target_name TEXT;
BEGIN
  FOREACH pair SLICE 1 IN ARRAY ARRAY[
    ['siswa_kelas','anggota_kelas'], ['ujian','asesmen'],
    ['soal_ujian','soal_asesmen'], ['percobaan_ujian','percobaan_asesmen'],
    ['jawaban_ujian','jawaban_asesmen'], ['hasil_ujian','hasil_asesmen']
  ] LOOP
    IF to_regclass(format('%I', pair[1])) IS NOT NULL THEN
      targets := ''; sources := '';
      FOR col IN SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = pair[1] ORDER BY ordinal_position LOOP
        target_name := CASE
          WHEN col.column_name = 'ujian_id' THEN 'asesmen_id'
          WHEN pair[1] = 'ujian' AND col.column_name = 'jenis' THEN 'tipe'
          WHEN pair[1] = 'ujian' AND col.column_name = 'mode_ujian' THEN 'mode_asesmen'
          WHEN pair[1] = 'soal_ujian' AND col.column_name = 'jawaban_benar' THEN 'kunci_jawaban'
          WHEN pair[1] = 'percobaan_ujian' AND col.column_name = 'pengguna_id' THEN 'siswa_id'
          WHEN col.column_name = 'percobaan_ujian_id' THEN 'percobaan_asesmen_id'
          ELSE col.column_name END;
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = pair[2] AND column_name = target_name) THEN
          targets := targets || CASE WHEN targets = '' THEN '' ELSE ', ' END || format('%I', target_name);
          sources := sources || CASE WHEN sources = '' THEN '' ELSE ', ' END || format('%I', col.column_name);
        END IF;
      END LOOP;
      EXECUTE format('INSERT INTO %I (%s) SELECT %s FROM %I ON CONFLICT DO NOTHING', pair[2], targets, sources, pair[1]);
    END IF;
  END LOOP;
END $$;

UPDATE "peran" SET "status" = 'aktif' WHERE "status" IS NULL AND "dihapus_pada" IS NULL;
UPDATE "anggota_kelas" SET "status" = 'aktif' WHERE "status" IS NULL AND "dihapus_pada" IS NULL;
UPDATE "modul" SET "status" = 'aktif' WHERE "status" IS NULL AND "dihapus_pada" IS NULL;
UPDATE "izin" SET "status" = 'aktif' WHERE "status" IS NULL AND "dihapus_pada" IS NULL;
UPDATE "sekolah" SET "metode_absensi_aktif" = ARRAY[]::TEXT[] WHERE "metode_absensi_aktif" IS NULL;
COMMIT;
