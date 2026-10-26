# API pendaftar dan presensi

Perbaikan backend, 26 Oktober 2026. Tidak memerlukan migrasi skema database.

Semua endpoint berikut memakai `Authorization: Bearer <access-token>`.
Pengguna sekolah selalu dibatasi ke sekolah pada sesi yang diverifikasi dari
database. Parameter `sekolahId` hanya boleh memilih sekolah lain untuk super admin.
Record dari sekolah lain atau yang sudah dihapus tidak muncul pada daftar pendaftar.

## Data pendaftar

| Method | Endpoint | Izin | Hasil |
| --- | --- | --- | --- |
| GET | `/api/ppdb/pendaftar` | `ppdb.view` | Daftar, pagination, dan statistik |
| GET | `/api/ppdb/pendaftar/statistik` | `ppdb.view` | Agregat pendaftar sesuai filter |
| GET | `/api/ppdb/pendaftar/:id` | `ppdb.view` | Detail, jalur, gelombang, berkas aktif dan hasil seleksi aktif |

Filter: `search` (nama, NISN, nomor pendaftaran), `jalurPpdbId`,
`gelombangPpdbId`, `status` (`menunggu`, `lulus`, `ditolak`), `sekolahId`.
Daftar memakai `page` mulai 1 dan `limit` 1–1000 (default 20).

Contoh respons daftar:

```json
{
  "success": true,
  "message": "Data pendaftar berhasil diambil",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalData": 0,
    "totalPages": 0,
    "hasNext": false,
    "hasPrev": false
  },
  "statistik": { "total": 0, "menunggu": 0, "lulus": 0, "ditolak": 0 }
}
```

Statistik dihitung dari seluruh record yang cocok dengan filter, bukan hanya
halaman saat ini. Untuk ringkasan sekolah tanpa filter status, panggil endpoint
statistik tanpa parameter `status`. Endpoint statistik mengembalikan objek
tersebut di `data`. Detail menyertakan `jalurPpdb`, `gelombangPpdb`, `berkasPpdb`,
`hasilSeleksiPpdb`, serta identitas dasar pengguna hasil konversi jika ada;
kata sandi, PIN, dan embedding wajah pengguna tidak disertakan.

## Daftar dan koreksi presensi

| Method | Endpoint | Akses | Hasil |
| --- | --- | --- | --- |
| GET | `/api/absensi` | Admin sekolah/super admin; `absensi.view` atau `lms.view` | Semua presensi sekolah, termasuk tanpa kelas |
| PATCH | `/api/absensi/:id` | Admin sekolah/super admin; `absensi.update` atau `lms.update` | Koreksi status/keterangan |

Filter daftar: `tanggal` atau rentang `tanggalMulai`/`tanggalSelesai`, `kelasId`,
`penggunaId`, `shiftKerjaId`, `role`, `status`, `search`, `sekolahId`, `page`, `limit`.
Tanggal berformat `YYYY-MM-DD`; rentang bersifat inklusif. Parameter tanggal
tunggal dan rentang tidak boleh digabung. Tanpa filter tanggal, daftar memuat
seluruh tanggal sesuai pagination. `role` menerima `siswa`, `guru`, `staff`,
`staf`, `pegawai`, `karyawan`, atau `admin_sekolah`. Nilai staf/pegawai diperlakukan
sebagai satu kelompok. `status` menerima `hadir`, `izin`, `sakit`, `alpha`, atau
`terlambat`.

Format respons daftar sama dengan daftar pendaftar: `data`, `meta`, `statistik`.
Statistik presensi berisi `total`, `hadir`, `terlambat`, `izin`, `sakit`, `alpha`.
`hadir` mencakup kehadiran terlambat; `terlambat` merupakan bagiannya, bukan
kelompok tambahan untuk dijumlahkan ke total. Filter `status=terlambat` membaca
status shift dan menit keterlambatan selain status record lama.

Setiap record menyertakan `waktuMasuk`, `waktuKeluar`, `statusShift`,
`terlambatMenit`, relasi `kelas`, `shiftKerja`, dan identitas/peran dasar `pengguna`.
Tidak perlu mengambil detail pengguna satu per satu untuk mengisi tabel.

Contoh body koreksi:

```json
{ "status": "izin", "keterangan": "Koreksi berdasarkan surat izin" }
```

`status` dan `keterangan` bersifat opsional, tetapi minimal satu harus diisi.
Hanya dua field ini yang boleh diubah; ID pengguna, sekolah, kelas, timestamp,
dan data lain tidak dapat diganti melalui endpoint koreksi. Aktor dicatat pada
`diperbaruiOleh`. `keterangan: null` mengosongkan keterangan. Koreksi
`status: "terlambat"` disimpan sebagai `status: "hadir"` dan status shift
terlambat; flag pulang cepat tetap dipertahankan. Menghapus status terlambat
juga mereset menit keterlambatan.

Data lama yang belum memiliki `sekolahId` pada absensi ditentukan sekolahnya
dari kelas; jika tidak ada kelas, dari pengguna. Jika `sekolahId` sudah terisi,
field itu menjadi pemilik record dan tidak ditimpa oleh relasi pengguna/kelas.

## Tanggal, shift dan endpoint lama

- Kolom tanggal PostgreSQL `DATE` dikirim sebagai tanggal kalender pada UTC
  midnight tanpa menggesernya ke tengah malam lokal. Contoh filter 18 Oktober
  tetap mencari `2026-10-18`, bukan 17 Oktober.
- Hari untuk membuat presensi serta check-in/out mengikuti `APP_TIMEZONE`
  (default `Asia/Jakarta`), termasuk jika proses Node berjalan pada UTC.
  Perhitungan terlambat/pulang cepat menggunakan zona waktu yang sama.
- `GET /api/absensi/kelas/:kelasId` mempertahankan respons array pada `data` dan
  mendukung filter tanggal/rentang yang sudah diperbaiki.
- `GET /api/absensi/monitoring-guru` tetap default ke hari ini tanpa filter
  tanggal. Filter tanggal/rentang tidak lagi bergeser.
- `GET /api/absensi/export` memakai filter tanggal yang sama, menyertakan presensi
  tanpa kelas, dan tetap menghasilkan Excel. Header nama sekarang `Nama Pengguna`.
- Riwayat siswa tetap menyertakan record lama tanpa `sekolahId` selama record
  tersebut memang milik sekolahnya.
- `POST /api/absensi` membutuhkan `kelasId`; presensi tanpa kelas memakai alur
  check-in shift. Penyimpanan presensi kelas baru mencatat sekolah dan waktu
  masuk untuk status hadir.

Input tidak valid menghasilkan `400`; sesi tidak ada `401`; akses/izin tidak
sesuai `403`; detail/koreksi record yang tidak ditemukan dalam sekolah `404`.

## Integrasi frontend selanjutnya

Perubahan ini hanya pada backend. Daftar/detail pendaftar yang sudah memanggil
endpoint di atas dapat memakai rute tersebut. Fungsi statistik frontend yang
masih mengembalikan `null` perlu membaca `statistik` atau endpoint statistik.
Halaman presensi perlu beralih dari pengambilan per kelas ke `GET /api/absensi`
untuk menampilkan guru/staf tanpa kelas. Jam masuk/pulang menggunakan
`waktuMasuk`/`waktuKeluar`; handler simpan edit perlu memanggil `PATCH` di atas.

## Pengujian

```powershell
npm test
npm run build
```

Tes integrasi API memakai aplikasi Express, autentikasi, Prisma dan PostgreSQL
sungguhan. Secara default tes integrasi dilewati jika `TEST_DATABASE_URL` tidak
diatur. Untuk menjalankannya, siapkan database PostgreSQL lokal terpisah dengan
skema Prisma, lalu atur `TEST_DATABASE_URL` ke database tersebut dan jalankan
`npm test`. Tes menolak hostname non-lokal, membuat fixture dengan ID unik, dan
membersihkan data fixture setelah selesai. Jangan arahkan tes ke data kerja.

Skenario mencakup daftar/detail/statistik pendaftar, pencarian, pagination,
pembatasan sekolah/izin, filter tanggal dan rentang, record tanpa kelas,
riwayat data lama, monitoring guru, isi Excel, koreksi presensi, penolakan
perubahan field lain, serta penyimpanan presensi/check-in/check-out. Kasus
tanggal 14/15 September dan 18 Oktober dipakai untuk mencegah bug bergeser
satu hari muncul kembali.

Hasil verifikasi lokal: **29 tes lulus pada `TZ=Asia/Jakarta` dan pada `TZ=UTC`**,
tanpa tes integrasi yang dilewati ketika database uji diaktifkan. Build TypeScript
juga lulus. Pengecekan baca saja pada database yang terhubung mengembalikan
2 pendaftar dan 8 catatan presensi untuk sekolah yang diperiksa, serta jumlah
presensi per tanggal 14 September, 15 September, dan 18 Oktober masing-masing
1, 2, dan 1. Pengujian perubahan data hanya dilakukan pada database lokal.
