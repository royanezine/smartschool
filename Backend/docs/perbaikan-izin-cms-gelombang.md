# Perbaikan izin, detail pengguna, CMS publik, dan gelombang PPDB

Tanggal: **29 Oktober 2026**. Perubahan terbatas pada backend; tidak ada perubahan
skema atau migrasi baru. Perubahan lokal pada dua controller pengguna/izin
dipertahankan dan dilengkapi dengan pengujian.

## 1. Identitas pengaju permohonan izin

Lokasi: `src/controllers/permohonanIzin.controller.ts`, fungsi `getDaftarIzin`.
Endpoint: `GET /api/permohonan-izin`.

Sebelumnya respons `pengguna` hanya menyertakan ID, nama, NISN, dan NIP. Frontend
tidak memperoleh jabatan atau peran untuk membedakan pengaju siswa dan guru.
Respons kini menyertakan:

```text
pengguna.id
pengguna.namaLengkap
pengguna.nisn
pengguna.nip
pengguna.jabatan
pengguna.peran.id
pengguna.peran.nama
pengguna.peran.namaTampilan
```

Filter sekolah dan pembatasan siswa ke permohonan miliknya tetap berlaku.
Kata sandi, PIN, dan embedding wajah tidak ditambahkan ke respons daftar izin.

## 2. Shift dan jabatan pada detail pengguna

Lokasi: `src/controllers/user.controller.ts`, fungsi `getUserById`.
Endpoint: `GET /api/users/:id`.

Field yang dibutuhkan frontend sudah disertakan bersama field detail lainnya:

| Kelompok | Field |
| --- | --- |
| Shift | `shiftKerja`, `shiftKerjaId`, `shiftKerjaMaster` |
| Jabatan | `jabatan`, `golongan`, `kategoriJabatanId`, `kategoriJabatan` |

`shiftKerja` adalah label lama seperti `pagi`/`siang`, sedangkan
`shiftKerjaMaster` merupakan data master shift yang direferensikan oleh ID.
Keduanya dikirim. Jika pengguna belum ditugaskan ke shift atau kategori,
field ID dan relasinya bernilai `null`. Batas sekolah, izin lihat pengguna,
dan hierarki peran tetap diperiksa.

## 3. Status publikasi CMS

Lokasi: `src/utils/cmsPublication.ts`, `src/validations/cms.validation.ts`,
dan `src/controllers/publik.controller.ts`.

**Gunakan `dipublikasikan` untuk halaman/artikel yang dipublikasikan.**
Untuk data lama, backend tetap membaca `publikasi` dan `aktif` sebagai status
publik. Ketika salah satu alias tersebut dikirim saat membuat atau memperbarui
halaman/artikel, nilainya disimpan sebagai `dipublikasikan`.

Status `draft`, `nonaktif`, dan `arsip` tetap privat. Status yang tidak dikenal
ditolak dengan `400`. Aturan ini khusus konten halaman/artikel; status sekolah,
menu, dan kategori yang menggunakan `aktif`/`nonaktif` tidak dinormalisasi.

Sebelumnya filter berbeda pada profil sekolah, daftar halaman, dan artikel.
Detail halaman berdasarkan slug bahkan belum memiliki filter publikasi.
Sekarang aturan publik yang sama dipakai pada:

- `GET /api/publik/:subdomain/profil` untuk `halamanCms` dan `daftarCms`.
- `GET /api/publik/:subdomain/halaman`.
- `GET /api/publik/:subdomain/halaman/:slug`.
- `GET /api/publik/:subdomain/artikel`.

Halaman draft/privat, halaman yang dihapus, dan slug sekolah lain menghasilkan
`404` pada endpoint detail publik. Endpoint publik juga menolak sekolah yang
tidak aktif atau sudah dihapus.

## 4. Rute gelombang PPDB

Lokasi baru: `src/routes/gelombangPpdb.routes.ts`,
`src/controllers/gelombangPpdb.controller.ts`, dan
`src/validations/gelombangPpdb.validation.ts`. Router didaftarkan di `src/app.ts`.

Penyebab `Cannot GET /api/gelombang-ppdb` adalah tidak adanya router/controller
gelombang, meskipun model Prisma dan migration tabelnya sudah tersedia.
Backend sekarang menyediakan kontrak yang dipakai service frontend:

| Method | Endpoint | Izin |
| --- | --- | --- |
| GET | `/api/gelombang-ppdb` | `ppdb.view` |
| GET | `/api/gelombang-ppdb/:id` | `ppdb.view` |
| POST | `/api/gelombang-ppdb` | `ppdb.create` |
| PUT | `/api/gelombang-ppdb/:id` | `ppdb.update` |
| DELETE | `/api/gelombang-ppdb/:id` | `ppdb.delete` |

Semua rute memakai autentikasi, pemeriksaan sekolah, dan langganan seperti
modul jalur PPDB. Daftar mengembalikan array pada `data` dengan filter
`search`, `status`, serta `jalurPpdbId`. Relasi `jalurPpdb` memuat `id` dan `nama`.

Contoh payload tambah/ubah:

```json
{
  "nama": "Gelombang 1",
  "jalurPpdbId": null,
  "tanggalMulai": "2026-10-01",
  "tanggalSelesai": "2026-11-01",
  "kuota": null,
  "status": "aktif"
}
```

Nama dan kedua tanggal wajib diisi; tanggal harus valid dan berurutan.
`jalurPpdbId: null` berlaku untuk semua jalur sekolah. Jalur yang dipilih harus
berada dalam sekolah yang sama dan belum dihapus. `kuota` menerima bilangan
bulat mulai 0, atau `null` jika tidak ditentukan. Status hanya `aktif`/`nonaktif`.
Tanggal disimpan sebagai tanggal kalender sehingga tidak bergeser karena zona
waktu server. Aktor tambah, ubah, dan hapus dicatat. Penghapusan bersifat soft
delete sehingga tidak membuang record gelombang dan referensi historisnya.

Admin sekolah tidak dapat mengganti konteks sekolah melalui query atau payload.
Super admin dapat memilih `?sekolahId=<uuid>`; untuk membuat gelombang tanpa
sekolah pada sesi, sekolah harus dipilih secara eksplisit.

## Pengujian dan menjalankan setelah pull

Build backend lulus. **51 tes lulus pada masing-masing `TZ=Asia/Jakarta` dan
`TZ=UTC`**, tanpa tes integrasi yang dilewati ketika database uji diaktifkan.
Pengujian HTTP menggunakan Express, autentikasi, Prisma, dan PostgreSQL lokal
terpisah, mencakup seluruh masalah di atas serta regresi pendaftar/presensi.
Tidak ada perubahan data pada database bersama.

Setelah pull, restart proses backend. Jika environment belum menerapkan skema
gelombang yang sudah ada di repository, terapkan migration
`20261020120000_add_gelombang_ppdb` melalui alur migrasi project dan regenerasi
Prisma Client. Error `Cannot GET` menunjukkan router belum berjalan; error tabel
atau model Prisma yang hilang merupakan masalah skema/client yang berbeda.

Pemeriksaan dasar dari folder `Backend`:

```powershell
npm test
npm run build
```

Tes integrasi dilewati secara default tanpa `TEST_DATABASE_URL`. Untuk menjalankan
seluruh tes, gunakan database PostgreSQL lokal terpisah dengan skema Prisma yang
sesuai, atur `TEST_DATABASE_URL`, lalu jalankan `npm test`. Fixture dibuat dengan
ID unik dan dibersihkan setelah pengujian.
