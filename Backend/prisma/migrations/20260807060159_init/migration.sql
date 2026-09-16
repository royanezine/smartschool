-- CreateTable
CREATE TABLE "pengguna" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT,
    "peran_id" TEXT,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama_pengguna" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "kata_sandi" VARCHAR(255) NOT NULL,
    "nama_lengkap" VARCHAR(100) NOT NULL,
    "avatar" VARCHAR(255),
    "nipd" VARCHAR(20),
    "nip" VARCHAR(20),
    "nuptk" VARCHAR(20),
    "nisn" VARCHAR(20),
    "jenis_kelamin" VARCHAR(10),
    "tempat_lahir" VARCHAR(50),
    "tanggal_lahir" DATE,
    "alamat" TEXT,
    "no_telepon" VARCHAR(20),
    "status" VARCHAR(20),
    "terakhir_login" TIMESTAMP,
    "kode_otp" VARCHAR(10),
    "otp_timeout" TIMESTAMP,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "pengguna_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peran" (
    "id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(50) NOT NULL,
    "nama_tampilan" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "peran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "izin" (
    "id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(100) NOT NULL,
    "modul" VARCHAR(50) NOT NULL,
    "aksi" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "izin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peran_izin" (
    "id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "peran_id" TEXT NOT NULL,
    "izin_id" TEXT NOT NULL,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "peran_izin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sekolah" (
    "id" TEXT NOT NULL,
    "yayasan_id" TEXT,
    "langganan_aktif_id" TEXT,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(100) NOT NULL,
    "subdomain" VARCHAR(50) NOT NULL,
    "kode" VARCHAR(20) NOT NULL,
    "alamat" TEXT,
    "telepon" VARCHAR(20),
    "email" VARCHAR(100),
    "logo" VARCHAR(255),
    "status" VARCHAR(20),
    "konfigurasi" JSONB,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "sekolah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yayasan" (
    "id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(100) NOT NULL,
    "alamat" TEXT,
    "telepon" VARCHAR(20),
    "email" VARCHAR(100),
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "yayasan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paket" (
    "id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "harga" DECIMAL(15,2) NOT NULL,
    "durasi" INTEGER NOT NULL,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "paket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modul" (
    "id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "kode" VARCHAR(20) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "ikon" VARCHAR(50),
    "sistem" BOOLEAN,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "modul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paket_modul" (
    "id" TEXT NOT NULL,
    "paket_id" TEXT NOT NULL,
    "modul_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "paket_modul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sekolah_modul" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "modul_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "status" VARCHAR(20),
    "diaktifkan_pada" TIMESTAMP,
    "kedaluwarsa_pada" TIMESTAMP,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "sekolah_modul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "langganan_sekolah" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "paket_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "status_pembayaran" VARCHAR(20),
    "status_langganan" VARCHAR(20),
    "tanggal_mulai" TIMESTAMP,
    "tanggal_berakhir" TIMESTAMP,
    "harga_saat_berlangganan" DECIMAL(15,2),
    "siklus_penagihan" VARCHAR(20),
    "fitur_aktif" JSONB,
    "xendit_invoice_id" VARCHAR(100),
    "xendit_payment_link" VARCHAR(255),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "langganan_sekolah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riwayat_pembayaran" (
    "id" TEXT NOT NULL,
    "langganan_sekolah_id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "jumlah" DECIMAL(15,2),
    "metode" VARCHAR(50),
    "status" VARCHAR(20),
    "xendit_payment_id" VARCHAR(100),
    "xendit_invoice_id" VARCHAR(100),
    "webhook_raw_payload" JSONB,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riwayat_pembayaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "pengirim_id" TEXT,
    "judul" VARCHAR(100) NOT NULL,
    "isi" TEXT NOT NULL,
    "tipe" VARCHAR(20),
    "kategori" VARCHAR(30),
    "target_url" VARCHAR(255),
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "dibaca_pada" TIMESTAMP,
    "dikirim_email" BOOLEAN NOT NULL DEFAULT false,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tahun_ajaran" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "tahun_ajaran" VARCHAR(20) NOT NULL,
    "semester" VARCHAR(10) NOT NULL,
    "tanggal_mulai" DATE,
    "tanggal_selesai" DATE,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "tahun_ajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelas" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "tahun_ajaran_id" TEXT NOT NULL,
    "wali_kelas_id" TEXT,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(50) NOT NULL,
    "tingkat" VARCHAR(20) NOT NULL,
    "ruangan" VARCHAR(20),
    "kapasitas" INTEGER,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mata_pelajaran" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(100) NOT NULL,
    "kode" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "mata_pelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelas_mapel" (
    "id" TEXT NOT NULL,
    "kelas_id" TEXT NOT NULL,
    "mata_pelajaran_id" TEXT NOT NULL,
    "guru_pengajar_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "kelas_mapel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "siswa_kelas" (
    "id" TEXT NOT NULL,
    "kelas_id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "tahun_ajaran_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "siswa_kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "komponen_nilai" (
    "id" TEXT NOT NULL,
    "kelas_mapel_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(50) NOT NULL,
    "jenis" VARCHAR(20) NOT NULL,
    "bobot" DECIMAL(5,2) NOT NULL,
    "nilai_maksimum" DECIMAL(5,2) NOT NULL,
    "kelompok" VARCHAR(30) NOT NULL,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "komponen_nilai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nilai" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "kelas_mapel_id" TEXT NOT NULL,
    "komponen_nilai_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nilai" DECIMAL(5,2) NOT NULL,
    "sumber" VARCHAR(20),
    "sumber_id" TEXT,
    "catatan" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "nilai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absensi" (
    "id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "kelas_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "tanggal" DATE NOT NULL,
    "status" VARCHAR(10) NOT NULL,
    "keterangan" TEXT,
    "metode" VARCHAR(20),
    "lintang" DECIMAL(10,8),
    "bujur" DECIMAL(11,8),
    "url_foto" VARCHAR(255),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "absensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ujian" (
    "id" TEXT NOT NULL,
    "kelas_mapel_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "judul" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "jenis" VARCHAR(20) NOT NULL,
    "durasi" INTEGER NOT NULL,
    "waktu_mulai" TIMESTAMP,
    "waktu_selesai" TIMESTAMP,
    "nilai_kelulusan" DECIMAL(5,2),
    "dipublikasikan" BOOLEAN NOT NULL DEFAULT false,
    "mode_ujian" VARCHAR(20),
    "penilaian_otomatis" BOOLEAN NOT NULL DEFAULT true,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "ujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soal_ujian" (
    "id" TEXT NOT NULL,
    "ujian_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "teks_soal" TEXT NOT NULL,
    "jenis_soal" VARCHAR(20) NOT NULL,
    "pilihan" JSONB,
    "jawaban_benar" TEXT,
    "poin" DECIMAL(5,2) NOT NULL,
    "nomor_urut" INTEGER NOT NULL,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "soal_ujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "percobaan_ujian" (
    "id" TEXT NOT NULL,
    "ujian_id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "dimulai_pada" TIMESTAMP NOT NULL,
    "selesai_pada" TIMESTAMP,
    "nilai" DECIMAL(5,2),
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "percobaan_ujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jawaban_ujian" (
    "id" TEXT NOT NULL,
    "percobaan_ujian_id" TEXT NOT NULL,
    "soal_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "jawaban" TEXT,
    "nilai" DECIMAL(5,2),
    "benar" BOOLEAN,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "jawaban_ujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hasil_ujian" (
    "id" TEXT NOT NULL,
    "percobaan_ujian_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "total_nilai" DECIMAL(5,2) NOT NULL,
    "jumlah_benar" INTEGER NOT NULL,
    "jumlah_salah" INTEGER NOT NULL,
    "jumlah_lewati" INTEGER NOT NULL,
    "detail" JSONB,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "hasil_ujian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tugas" (
    "id" TEXT NOT NULL,
    "kelas_mapel_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "judul" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "batas_waktu" TIMESTAMP,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "tugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengumpulan_tugas" (
    "id" TEXT NOT NULL,
    "tugas_id" TEXT NOT NULL,
    "pengguna_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "url_file" VARCHAR(255),
    "status" VARCHAR(20),
    "nilai" DECIMAL(5,2),
    "keterangan" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "pengumpulan_tugas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materi_pembelajaran" (
    "id" TEXT NOT NULL,
    "kelas_mapel_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "judul" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "url_file" VARCHAR(255),
    "kategori" VARCHAR(50),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,

    CONSTRAINT "materi_pembelajaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aset" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "kategori_aset_id" TEXT NOT NULL,
    "gudang_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(100) NOT NULL,
    "kode" VARCHAR(50) NOT NULL,
    "kondisi" VARCHAR(20) NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "jumlah_stok" INTEGER NOT NULL,
    "stok_minimum" INTEGER NOT NULL,
    "lokasi" VARCHAR(100),
    "status" VARCHAR(20),
    "tanggal_pembelian" DATE,
    "perawatan_terakhir" DATE,
    "tanggal_rusak" DATE,
    "deskripsi_kerusakan" TEXT,
    "status_perbaikan" VARCHAR(20),
    "catatan" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "aset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gudang" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(100) NOT NULL,
    "lokasi" VARCHAR(255),
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "gudang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori_aset" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "kategori_aset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laporan_kerusakan" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "aset_id" TEXT NOT NULL,
    "dilaporkan_oleh" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "tanggal_laporan" TIMESTAMP NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "status" VARCHAR(20),
    "catatan_perbaikan" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "laporan_kerusakan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "halaman_cms" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "judul" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "konten" TEXT,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "halaman_cms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artikel_cms" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "kategori_artikel_id" TEXT,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "judul" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "konten" TEXT,
    "ringkasan" TEXT,
    "gambar_utama" VARCHAR(255),
    "status" VARCHAR(20),
    "dipublikasikan_pada" TIMESTAMP,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "artikel_cms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kategori_artikel" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "kategori_artikel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jalur_ppdb" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama" VARCHAR(50) NOT NULL,
    "deskripsi" TEXT,
    "kuota" INTEGER NOT NULL,
    "tanggal_mulai" DATE,
    "tanggal_selesai" DATE,
    "status" VARCHAR(20),
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "jalur_ppdb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendaftaran_ppdb" (
    "id" TEXT NOT NULL,
    "sekolah_id" TEXT NOT NULL,
    "jalur_ppdb_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nomor_pendaftaran" VARCHAR(20) NOT NULL,
    "nama_lengkap" VARCHAR(100) NOT NULL,
    "nisn" VARCHAR(20) NOT NULL,
    "tempat_lahir" VARCHAR(50) NOT NULL,
    "tanggal_lahir" DATE NOT NULL,
    "jenis_kelamin" VARCHAR(10) NOT NULL,
    "alamat" TEXT NOT NULL,
    "telepon" VARCHAR(20),
    "email" VARCHAR(100),
    "nama_ayah" VARCHAR(100),
    "nama_ibu" VARCHAR(100),
    "asal_sekolah" VARCHAR(100),
    "nilai_rapor" DECIMAL(5,2),
    "status" VARCHAR(20),
    "kelas_id" TEXT,
    "dikonversi_ke_pengguna_id" TEXT,
    "dikonversi_pada" TIMESTAMP,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "pendaftaran_ppdb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "berkas_ppdb" (
    "id" TEXT NOT NULL,
    "pendaftaran_ppdb_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nama_berkas" VARCHAR(50) NOT NULL,
    "url_file" VARCHAR(255) NOT NULL,
    "status" VARCHAR(20),
    "keterangan" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "berkas_ppdb_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hasil_seleksi_ppdb" (
    "id" TEXT NOT NULL,
    "pendaftaran_ppdb_id" TEXT NOT NULL,
    "dibuat_oleh" TEXT,
    "diperbarui_oleh" TEXT,
    "dihapus_oleh" TEXT,
    "nilai_tes" DECIMAL(5,2),
    "peringkat" INTEGER,
    "status_kelulusan" VARCHAR(20),
    "catatan" TEXT,
    "dibuat_pada" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diperbarui_pada" TIMESTAMP NOT NULL,
    "dihapus_pada" TIMESTAMP,

    CONSTRAINT "hasil_seleksi_ppdb_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_nama_pengguna_key" ON "pengguna"("nama_pengguna");

-- CreateIndex
CREATE UNIQUE INDEX "pengguna_email_key" ON "pengguna"("email");

-- CreateIndex
CREATE UNIQUE INDEX "peran_nama_key" ON "peran"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "izin_nama_key" ON "izin"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "sekolah_subdomain_key" ON "sekolah"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "sekolah_kode_key" ON "sekolah"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "modul_kode_key" ON "modul"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "mata_pelajaran_kode_key" ON "mata_pelajaran"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "hasil_ujian_percobaan_ujian_id_key" ON "hasil_ujian"("percobaan_ujian_id");

-- CreateIndex
CREATE UNIQUE INDEX "aset_kode_key" ON "aset"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "halaman_cms_slug_key" ON "halaman_cms"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "artikel_cms_slug_key" ON "artikel_cms"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_artikel_slug_key" ON "kategori_artikel"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pendaftaran_ppdb_nomor_pendaftaran_key" ON "pendaftaran_ppdb"("nomor_pendaftaran");

-- CreateIndex
CREATE UNIQUE INDEX "pendaftaran_ppdb_nisn_key" ON "pendaftaran_ppdb"("nisn");

-- CreateIndex
CREATE UNIQUE INDEX "hasil_seleksi_ppdb_pendaftaran_ppdb_id_key" ON "hasil_seleksi_ppdb"("pendaftaran_ppdb_id");

-- AddForeignKey
ALTER TABLE "pengguna" ADD CONSTRAINT "pengguna_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengguna" ADD CONSTRAINT "pengguna_peran_id_fkey" FOREIGN KEY ("peran_id") REFERENCES "peran"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peran_izin" ADD CONSTRAINT "peran_izin_peran_id_fkey" FOREIGN KEY ("peran_id") REFERENCES "peran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peran_izin" ADD CONSTRAINT "peran_izin_izin_id_fkey" FOREIGN KEY ("izin_id") REFERENCES "izin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sekolah" ADD CONSTRAINT "sekolah_yayasan_id_fkey" FOREIGN KEY ("yayasan_id") REFERENCES "yayasan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paket_modul" ADD CONSTRAINT "paket_modul_paket_id_fkey" FOREIGN KEY ("paket_id") REFERENCES "paket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paket_modul" ADD CONSTRAINT "paket_modul_modul_id_fkey" FOREIGN KEY ("modul_id") REFERENCES "modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sekolah_modul" ADD CONSTRAINT "sekolah_modul_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sekolah_modul" ADD CONSTRAINT "sekolah_modul_modul_id_fkey" FOREIGN KEY ("modul_id") REFERENCES "modul"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "langganan_sekolah" ADD CONSTRAINT "langganan_sekolah_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "langganan_sekolah" ADD CONSTRAINT "langganan_sekolah_paket_id_fkey" FOREIGN KEY ("paket_id") REFERENCES "paket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pembayaran" ADD CONSTRAINT "riwayat_pembayaran_langganan_sekolah_id_fkey" FOREIGN KEY ("langganan_sekolah_id") REFERENCES "langganan_sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_pembayaran" ADD CONSTRAINT "riwayat_pembayaran_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_pengirim_id_fkey" FOREIGN KEY ("pengirim_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahun_ajaran" ADD CONSTRAINT "tahun_ajaran_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_wali_kelas_id_fkey" FOREIGN KEY ("wali_kelas_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mata_pelajaran" ADD CONSTRAINT "mata_pelajaran_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas_mapel" ADD CONSTRAINT "kelas_mapel_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas_mapel" ADD CONSTRAINT "kelas_mapel_mata_pelajaran_id_fkey" FOREIGN KEY ("mata_pelajaran_id") REFERENCES "mata_pelajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas_mapel" ADD CONSTRAINT "kelas_mapel_guru_pengajar_id_fkey" FOREIGN KEY ("guru_pengajar_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siswa_kelas" ADD CONSTRAINT "siswa_kelas_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siswa_kelas" ADD CONSTRAINT "siswa_kelas_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "siswa_kelas" ADD CONSTRAINT "siswa_kelas_tahun_ajaran_id_fkey" FOREIGN KEY ("tahun_ajaran_id") REFERENCES "tahun_ajaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "komponen_nilai" ADD CONSTRAINT "komponen_nilai_kelas_mapel_id_fkey" FOREIGN KEY ("kelas_mapel_id") REFERENCES "kelas_mapel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_kelas_mapel_id_fkey" FOREIGN KEY ("kelas_mapel_id") REFERENCES "kelas_mapel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nilai" ADD CONSTRAINT "nilai_komponen_nilai_id_fkey" FOREIGN KEY ("komponen_nilai_id") REFERENCES "komponen_nilai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absensi" ADD CONSTRAINT "absensi_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ujian" ADD CONSTRAINT "ujian_kelas_mapel_id_fkey" FOREIGN KEY ("kelas_mapel_id") REFERENCES "kelas_mapel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soal_ujian" ADD CONSTRAINT "soal_ujian_ujian_id_fkey" FOREIGN KEY ("ujian_id") REFERENCES "ujian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "percobaan_ujian" ADD CONSTRAINT "percobaan_ujian_ujian_id_fkey" FOREIGN KEY ("ujian_id") REFERENCES "ujian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "percobaan_ujian" ADD CONSTRAINT "percobaan_ujian_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jawaban_ujian" ADD CONSTRAINT "jawaban_ujian_percobaan_ujian_id_fkey" FOREIGN KEY ("percobaan_ujian_id") REFERENCES "percobaan_ujian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_ujian" ADD CONSTRAINT "hasil_ujian_percobaan_ujian_id_fkey" FOREIGN KEY ("percobaan_ujian_id") REFERENCES "percobaan_ujian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tugas" ADD CONSTRAINT "tugas_kelas_mapel_id_fkey" FOREIGN KEY ("kelas_mapel_id") REFERENCES "kelas_mapel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengumpulan_tugas" ADD CONSTRAINT "pengumpulan_tugas_pengguna_id_fkey" FOREIGN KEY ("pengguna_id") REFERENCES "pengguna"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materi_pembelajaran" ADD CONSTRAINT "materi_pembelajaran_kelas_mapel_id_fkey" FOREIGN KEY ("kelas_mapel_id") REFERENCES "kelas_mapel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aset" ADD CONSTRAINT "aset_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "halaman_cms" ADD CONSTRAINT "halaman_cms_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artikel_cms" ADD CONSTRAINT "artikel_cms_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artikel_cms" ADD CONSTRAINT "artikel_cms_kategori_artikel_id_fkey" FOREIGN KEY ("kategori_artikel_id") REFERENCES "kategori_artikel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jalur_ppdb" ADD CONSTRAINT "jalur_ppdb_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran_ppdb" ADD CONSTRAINT "pendaftaran_ppdb_sekolah_id_fkey" FOREIGN KEY ("sekolah_id") REFERENCES "sekolah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran_ppdb" ADD CONSTRAINT "pendaftaran_ppdb_jalur_ppdb_id_fkey" FOREIGN KEY ("jalur_ppdb_id") REFERENCES "jalur_ppdb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran_ppdb" ADD CONSTRAINT "pendaftaran_ppdb_dikonversi_ke_pengguna_id_fkey" FOREIGN KEY ("dikonversi_ke_pengguna_id") REFERENCES "pengguna"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "berkas_ppdb" ADD CONSTRAINT "berkas_ppdb_pendaftaran_ppdb_id_fkey" FOREIGN KEY ("pendaftaran_ppdb_id") REFERENCES "pendaftaran_ppdb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hasil_seleksi_ppdb" ADD CONSTRAINT "hasil_seleksi_ppdb_pendaftaran_ppdb_id_fkey" FOREIGN KEY ("pendaftaran_ppdb_id") REFERENCES "pendaftaran_ppdb"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
