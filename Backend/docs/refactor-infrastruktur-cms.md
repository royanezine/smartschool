# Refactor infrastruktur dan relasi CMS

Tanggal: 30 Oktober 2026.

## Perubahan

- `createGedung` menggunakan nested create Prisma untuk membuat gedung beserta
  satu lantai (`nama: "Lantai 1"`, `nomorLantai: 1`, `status: "aktif"`). Keduanya
  disimpan atomik; response 201 menyertakan lantai tersebut. Gedung lama tidak
  diubah oleh refactor ini.
- `MenuKonfigurasi.halaman` dihapus dan diganti `halamanCmsId` wajib dengan
  foreign key ke `HalamanCms.id`. Relasi balik bernama `menuKonfigurasi`.
- Upsert memvalidasi UUID halaman, sekolah pemilik dan halaman yang belum
  dihapus. Pembaruan berdasarkan ID menu juga memeriksa sekolah pemilik.
  POST dengan pasangan halaman/section yang sudah ada memperbarui menu tersebut.
- GET menu menyertakan identitas halaman induk. GET halaman admin, daftar/detail
  halaman publik dan profil publik menyertakan `menuKonfigurasi` aktif, berurutan
  berdasarkan `urutan` lalu ID.
- Penghapusan menu tetap menonaktifkan menu. Penghapusan halaman menonaktifkan
  semua menu terkait dan soft-delete halaman dalam satu transaksi. Hard-delete
  halaman yang masih direferensikan ditolak foreign key.
- Konfigurasi publik hanya menampilkan menu aktif milik halaman yang sudah
  dipublikasikan dan belum dihapus, pada sekolah yang sama.
- Seeder sekolah memanggil `seedDefaultHalamanCms` dalam transaksi yang sama,
  membuat Beranda, Tentang dan Kontak dengan status awal `draft`. Slug diberi
  akhiran ID sekolah karena slug halaman bersifat unik secara global. Menjalankan
  seeder berulang tidak menggandakan halaman atau menimpa konten yang sudah diedit.
  Halaman default yang sebelumnya dihapus tidak otomatis dipulihkan.

## Perubahan kontrak frontend

POST/PUT `/api/cms/menu-konfigurasi` harus menggunakan payload berikut:

```json
{
  "halamanCmsId": "UUID-halaman-dari-GET-api-cms-halaman",
  "section": "hero",
  "judul": "Selamat Datang",
  "urutan": 1,
  "status": "aktif"
}
```

Nilai `halamanCmsId` harus UUID asli. Payload `halaman: "beranda"` ditolak 400.
Form frontend perlu mengganti input teks halaman dengan pilihan dari daftar
halaman CMS. Response GET menu berisi `halamanCmsId` dan
`halamanCms: { id, judul, slug }`; judul tampilan diambil dari relasi tersebut.

GET `/api/publik/:subdomain/konfigurasi` sekarang mengelompokkan konfigurasi
sebagai `data[halamanCmsId][section]`. Setiap section berisi identitas halaman
induk. Konsumen yang sebelumnya membaca `data.beranda` perlu memilih halaman
dari daftar halaman publik dan memakai ID-nya, atau memakai `menuKonfigurasi`
langsung dari GET halaman. File frontend belum diubah dalam refactor backend ini.

## Migrasi data

Migrasi baru: `20261030000000_relate_menu_konfigurasi_halaman_cms`.

Migrasi mencocokkan teks halaman lama terhadap ID, slug atau judul halaman di
sekolah yang sama. Pencocokan tidak membedakan huruf besar/kecil dan mengabaikan
spasi tepi teks lama/judul. Jika tidak ada pasangan, dibuat halaman draft untuk
menampung konfigurasi lama. Seluruh baris dan konten menu tetap disimpan;
halaman draft hasil pemetaan perlu ditinjau sebelum dipublikasikan. Migrasi juga
menangani database yang belum memiliki tabel menu karena tabel tersebut belum
ada dalam migrasi awal repository.

Pada database dengan riwayat migrasi yang sudah sesuai, dari folder Backend:

```powershell
npx prisma migrate status
npx prisma migrate deploy
npx prisma generate
npm run build
```

Restart backend setelah migrasi dan generate client. Migrasi ini belum
dijalankan pada database bersama/produksi. Jangan mengganti migrasi ini dengan
`db push` pada database berisi menu lama, karena pemetaan datanya ada di SQL migrasi.

**Hambatan riwayat migrasi lama:** pengujian `migrate deploy` pada database kosong
berhenti di `20261016125800_refactor_pendaftaran_tenant_yayasan_sekolah` dengan
P3018/42P01: tabel `pendaftaran_tenant` belum ada. Ini terjadi sebelum migrasi CMS
baru dan perlu perbaikan/baseline riwayat tersendiri untuk instalasi dari nol.
Jangan menandai migrasi lama sebagai applied tanpa memeriksa kondisi database.

Seeder utama dijalankan dengan `npx prisma db seed` pada lingkungan development
yang sesuai. Seeder tersebut juga mengatur akun dummy, izin dan paket; jangan
menjalankannya pada produksi hanya untuk menambah tiga halaman CMS.

## Verifikasi

- `prisma validate`, `prisma generate`, dan `npm run build` berhasil.
- `npm test`: 45 lulus, 2 integration suite dilewati tanpa `TEST_DATABASE_URL`.
- Suite HTTP/regresi dan migrasi dengan PostgreSQL lokal: 62 lulus, 0 gagal,
  0 dilewati, masing-masing pada `TZ=Asia/Jakarta` dan `TZ=UTC`.
- Kasus yang diuji mencakup lantai default tersimpan, upsert menu, response relasi,
  validasi payload, isolasi sekolah, privasi draft, penghapusan dan pemulihan menu,
  serta penghapusan halaman.
- Migrasi SQL diuji terhadap tabel menu lama berisi data dan database tanpa tabel
  menu: pemetaan judul/slug/ID, teks tanpa pasangan, halaman di sekolah lain,
  halaman terhapus, konten lama, serta constraint foreign key.
- Seeder utama dijalankan dua kali pada database lokal dengan schema terkini;
  masing-masing menghasilkan tepat tiga halaman draft untuk sekolah dummy.
- Database pengujian terpisah dari konfigurasi database aplikasi. Frontend/web
  belum diuji untuk kontrak API baru ini.
