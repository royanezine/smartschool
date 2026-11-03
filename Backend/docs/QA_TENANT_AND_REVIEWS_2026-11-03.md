# Investigasi Admin Yayasan dan Review Pengguna — 3 November 2026

## Temuan dan perbaikan tenant

Tanpa log/database lingkungan QA, penyebab kejadian spesifik tidak dapat dipastikan. Namun kode memiliki bug yang dapat direproduksi: `tenantStatus.controller.ts` langsung mengembalikan sukses jika `pendaftaran.status === "aktif"`, tanpa memeriksa apakah akun admin hasil konversi masih ada. Jalur ini melewati mekanisme recovery yang sudah tersedia di konversi tenant.

Sekarang pengecekan status dan webhook menggunakan transaksi konversi bersama, termasuk untuk pendaftaran aktif. Di dalam transaksi, pendaftaran dikunci dengan FOR UPDATE; create yayasan, langganan, create pengguna dan pengisian penggunaTerbuatId bersifat atomik. Admin dibuat memakai email/nama/hash password pendaftaran, yayasanId hasil konversi, sekolahId:null, dan role global admin_yayasan yang belum dihapus serta aktif.

Pendaftaran aktif yang kehilangan admin dipulihkan hanya terhadap yayasan yang sudah ditautkan dan NPYP yang cocok. Akun dari yayasan/role/email yang berbeda tidak diadopsi; response 409 TENANT_ADMIN_LINK_INVALID. Role global tidak tersedia menghasilkan 409 TENANT_ADMIN_ROLE_UNAVAILABLE, bukan sukses semu. Perbaiki konfigurasi role lalu ulangi status/callback yang sah; kode tidak mengaktifkan role yang sengaja dinonaktifkan.

Error webhook diteruskan ke global error handler sehingga transaksi yang gagal tidak dibalas sukses. Konfigurasi server key yang kosong ditolak. Kegagalan API status Midtrans selain not-found menghasilkan error 502 dan permintaan dibatasi timeout 15 detik. Notifikasi gagal yang datang terlambat tidak boleh menimpa status aktif. Tidak ada pengiriman email atau transaksi pembayaran nyata pada pengujian.

## Model review

Model `ReviewPengguna` dipetakan ke `review_pengguna`, dengan penggunaId unik (satu review per akun), rating integer 1–5, komentar non-kosong maksimal 500 karakter, status menunggu/tampil/disembunyikan, dibuatPada dan diperbaruiPada. Relasi Pengguna memakai onDelete Cascade; soft delete/nonaktif pengguna menyebabkan review tidak muncul di endpoint publik. Tidak ada review dummy atau publikasi otomatis.

## Kontrak API

| Method/path | Akses dan perilaku |
|---|---|
| GET /api/users/review | Admin Yayasan/Sekolah: review sendiri atau data:null. |
| POST /api/users/review | Admin Yayasan/Sekolah: `{rating:5,komentar:"Sistem sangat membantu"}`. Status selalu menunggu; review kedua menghasilkan 409. |
| PUT /api/users/review | Pemilik: rating/komentar sebagian atau keduanya. PenggunaId/status tidak boleh dikirim. Setiap edit kembali menunggu moderasi; review yang belum dibuat menghasilkan 404. |
| GET /api/reviews | Super admin: pagination page/limit, filter status/rating/penggunaId. |
| POST /api/reviews | Super admin: `{penggunaId,rating,komentar,status?}`. Target harus Admin Yayasan/Sekolah aktif; status default menunggu. |
| GET /api/reviews/:id | Super admin: detail review. |
| PUT /api/reviews/:id | Super admin: `{status:"tampil"}` atau `{status:"disembunyikan"}`; rating/komentar juga dapat diedit. Perubahan konten tanpa status eksplisit kembali menunggu. |
| DELETE /api/reviews/:id | Super admin: menghapus review. |
| GET /api/publik/reviews | Tanpa login: hanya status tampil dan pengguna/peran aktif yang belum dihapus; pagination page/limit. Filter status dari pengunjung tidak dapat membuka review privat. |

Moderasi PUT dapat mengirim `diperbaruiPada` dari response GET sebagai optimistic concurrency check. Timestamp tidak cocok menghasilkan 409; FE sebaiknya mengirimkannya agar admin tidak menyetujui versi konten yang belum dibaca.

Response daftar: `{success:true,data:[...],meta:{page,limit,total,totalPages,...}}`. Response satu review memakai data berupa objek. Identitas pengguna pada endpoint publik hanya:

```json
{
  "namaLengkap": "Nama Admin",
  "jabatan": null,
  "peran": {"nama": "admin_yayasan", "namaTampilan": "Admin Yayasan"}
}
```

FE memakai `pengguna.namaLengkap` dan `pengguna.jabatan ?? pengguna.peran.namaTampilan` sebagai label jabatan. Render komentar sebagai teks, jangan sebagai HTML. Endpoint publik tidak mengirim email, username, ID pengguna, PIN, password/hash atau data biometrik. UI pengiriman perlu menampilkan status moderasi, termasuk ketika review yang tadinya tampil diedit kembali oleh pemilik. Backend tidak mengubah frontend.

## File implementasi

- prisma/schema.prisma: ReviewPengguna dan relasi Pengguna.
- prisma/migrations/20261103120000_add_review_pengguna/migration.sql: tabel, FK, unique/index, CHECK rating/komentar/status.
- src/validations/review.validation.ts: validasi pemilik, admin dan filter.
- src/controllers/review.controller.ts: kepemilikan, moderasi, proyeksi publik.
- src/routes/review.routes.ts, src/routes/user.routes.ts, src/routes/publik.routes.ts, src/app.ts: registrasi route dan role guard.
- src/controllers/tenant.controller.ts, tenantStatus.controller.ts, webhook.controller.ts: recovery dan propagasi error konversi.
- test/backendCompletion.integration.test.ts dan test/reviewMigration.integration.test.ts: tes HTTP/transaksi dan SQL.

## Migrasi

File migrasi sudah dibuat. Arahkan environment ke database tujuan yang benar (`prisma.config.ts` memprioritaskan DIRECT_URL atas DATABASE_URL), lalu dari Backend:

```powershell
npx prisma migrate status
npx prisma migrate deploy
npx prisma generate
npm run build
```

Tidak perlu membuat migrasi kedua dengan migrate dev untuk model yang sama. Migrasi ini menambahkan tabel review; tidak menghapus tabel bisnis lain. Jangan memakai db push sebagai pengganti deploy karena constraint CHECK tambahan berada di SQL migrasi. Database yang belum memiliki riwayat migrasi yang sesuai perlu direkonsiliasi sebelum deploy; jangan migrate reset database berisi data.

Tabel review memakai RLS tanpa policy anon/authenticated: akses publik tetap melalui Express agar draft tidak terbaca dari Supabase Data API. Koneksi Prisma backend harus memakai role server tepercaya (pemilik tabel/BYPASSRLS, seperti koneksi postgres Supabase), bukan token anon/browser. Instalasi yang memakai role database custom perlu menyediakan akses backend yang sesuai sebelum deploy.

## Verifikasi

TypeScript build dan Prisma validate lulus. Migrasi seluruh riwayat pada PostgreSQL lokal kosong lulus. Tes SQL terpisah memastikan rating/komentar/status invalid dan review duplikat ditolak serta cascade/RLS bekerja. **127/127 tes lulus dalam TZ Asia/Jakarta dan 127/127 dalam TZ UTC, tanpa tes dilewati.** Suite penuh mencakup status polling sukses, pemulihan admin hilang, role nonaktif, rollback transaksi setelah insert, callback paralel, ownership review, moderasi, dan pembatasan identitas publik. Supabase bersama tidak dimigrasikan dan kode belum di-push.
