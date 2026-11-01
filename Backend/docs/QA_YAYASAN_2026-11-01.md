# Perbaikan dan audit API Yayasan — 1 November 2026

Perubahan hanya backend, tanpa push atau migrasi database bersama. Perubahan package.json/package-lock.json yang sudah ada saat pekerjaan dimulai tidak disentuh.

## Hasil analisis

Insert admin pada cabang konversi yayasan sebenarnya sudah ada. Tanpa log kegagalan dari lingkungan QA, penyebab kejadian spesifik tidak bisa dipastikan. Pemeriksaan kode menemukan risiko username melebihi VARCHAR(50), konversi paralel, serta reuse yayasan berdasarkan NPYP. Perbaikan menutup risiko tersebut dan menguji alur pembayaran simulasi sampai akun admin dapat login.

Konversi mengunci pendaftaran dengan FOR UPDATE. Yayasan, langganan, admin (sekolahId:null, peran admin_yayasan aktif), dan ID hasil konversi disimpan dalam transaksi yang sama. Username dibatasi panjangnya. NPYP terpakai ditolak, bukan dipakai untuk mengambil alih yayasan yang sudah ada. Status aktif lama dengan akun admin hilang dapat diperbaiki saat notifikasi settlement valid diproses ulang, hanya jika relasi yayasan/NPYP pendaftaran cocok. Konflik email/relasi memerlukan rekonsiliasi administrator dan tidak ditimpa otomatis.

## File dan lokasi perubahan

Nomor baris menunjuk awal fungsi/blok pada snapshot ini.

| File (relatif terhadap Backend) | Baris | Perubahan |
|---|---:|---|
| src/controllers/yayasan.controller.ts | 1, 45, 81, 91, 98, 121, 150 | Ekspor list global, hitung pengguna aktif, validasi profil/admin, pembatasan scope, CRUD yayasan/admin dan naungan sekolah. |
| src/routes/yayasan.routes.ts | 26, 29, 47, 66 | Daftar endpoint baru dan role guard; summary/detail lama kini konsisten memakai guard yayasan + langganan. |
| src/controllers/platformDirectory.controller.ts | 29 | List/detail global menyertakan paket lengkap, metadata langganan, sekolah non-deleted dan filter berlangganan. |
| src/controllers/tenant.controller.ts | 49, 75, 160, 170, 201, 214 | Duplikasi NPYP termasuk pendaftaran berjalan, lock transaksi, recovery admin historis, username terbatas dan penolakan reuse yayasan. |
| src/validations/tenant.validation.ts | 39, 124 | NPYP trim, panjang 3–50, wajib untuk jenis yayasan. Tidak mengarang pola NPYP resmi yang belum disepakati. |
| src/controllers/webhook.controller.ts | 47 | Early return aktivasi hanya jika akun hasil konversi masih ada; memungkinkan recovery pendaftaran historis lewat notifikasi valid. |
| src/controllers/dashboard.controller.ts | 125, 133 | Scope eksplisit; blok platform/yayasan/sekolah, rincian jumlah siswa/guru/kelas per sekolah yayasan. |
| src/utils/yayasanLangganan.ts | 3 | Langganan bertanggal mulai di masa depan belum dianggap aktif. |
| test/backendCompletion.integration.test.ts | 250, 263 | Tes CRUD, batas tenant, admin terakhir, hierarchy, callback paralel, username panjang, recovery admin, login dan NPYP duplikat. |
| docs/QA_YAYASAN_2026-11-01.md | 1 | Laporan ini. |

## Audit kelengkapan dan endpoint baru

Endpoint lama sudah mencakup tambah/list cabang sekolah, detail sekolah, summary yayasan dan monitoring lintas sekolah. Yang belum ada adalah resource CRUD yayasan, admin yayasan dan pengaturan naungan sekolah yang sudah ada.

| Method / path | Akses |
|---|---|
| GET /api/yayasan | Super admin; pagination, search, status, berlangganan=true/false. |
| POST /api/yayasan | Super admin; membuat profil, tanpa otomatis mengaktifkan langganan berbayar. |
| GET /api/yayasan/:yayasanId | Super admin atau admin yayasan pemilik dengan yayasan.view. |
| PUT /api/yayasan/:yayasanId | Super admin atau pemilik dengan yayasan.update; pemilik tidak dapat mengganti status yayasan. |
| DELETE /api/yayasan/:yayasanId | Super admin; soft delete. Harus melepas sekolah dahulu; admin yayasan ikut dinonaktifkan/soft delete dalam transaksi yang sama. |
| GET /api/yayasan/:yayasanId/sekolah | Super admin atau pemilik dengan yayasan.view; menyertakan langganan/paket sekolah terbaru. |
| PUT /api/yayasan/:yayasanId/sekolah/:sekolahId | Super admin; menautkan sekolah tanpa yayasan atau mempertahankan naungan yang sama. Sekolah yayasan lain ditolak. |
| DELETE /api/yayasan/:yayasanId/sekolah/:sekolahId | Super admin; melepas naungan, bukan menghapus sekolah atau mengganti kontrak langganan. |
| GET /api/yayasan/:yayasanId/admin | Super admin atau pemilik dengan yayasan.view; hanya identitas/status/waktu login, tanpa hash password. |
| POST /api/yayasan/:yayasanId/admin | Super admin; membuat akun admin dengan role global aktif dan yayasanId yang sesuai. |
| PUT /api/yayasan/:yayasanId/admin/:adminId | Super admin; perubahan identitas/status, tanpa mengganti password atau role dari payload ini. |
| DELETE /api/yayasan/:yayasanId/admin/:adminId | Super admin; soft delete. Tidak boleh menonaktifkan diri sendiri atau admin aktif terakhir melalui endpoint admin. |

GET /api/platform/yayasan dan /api/platform/yayasan/:id tetap tersedia dengan projection paket/sekolah yang sama. Daftar sekolah dibatasi yang belum dihapus; tidak memakai sekolah:true tanpa filter soft delete.

## Catatan kontrak FE

- Registrasi tetap memakai `npypYayasan`, bukan `npyp`. Untuk jenisPendaftaran:yayasan field ini wajib; spasi luar dibuang. NPYP duplikat menghasilkan 409. Pemeriksaan mencakup yayasan yang sudah ada serta pendaftaran menunggu verifikasi/pembayaran. Constraint unik database tetap menjadi pengaman akhir saat proses bersamaan.
- Profil yayasan melalui endpoint CRUD memakai `{nama,npyp,alamat?,telepon?,email?,status?}`. PUT menerima sebagian field. Field langganan tidak dapat diubah melalui payload profil.
- Tambah admin memakai `{namaPengguna,namaLengkap,email,kataSandi,status?}`. Password minimal 8 karakter, maksimum 72 byte. PUT menerima sebagian identitas/status, bukan kataSandi. Password/hash tidak dikirim pada response.
- List global: `data` array dan `meta`; setiap yayasan membawa `paket`, `statusLangganan`, `tanggalMulaiLangganan`, `tanggalBerakhirLangganan`, serta `sekolah` array. Default mencakup semua profil. Gunakan `?berlangganan=true` untuk yang memiliki paket; ini tidak berarti semuanya masih aktif. Tampilkan status dan masa berlaku secara terpisah.
- Membuat profil yayasan dari super admin tidak membuat akun/langganan otomatis. Akun dibuat melalui POST admin; aktivasi berbayar tetap melalui proses billing/onboarding. Ini berbeda dari registrasi tenant yang membuat akun otomatis setelah konversi sukses.
- Dashboard: baca `data.scope`. `data.yayasan` berisi total lintas sekolah dan `sekolah:[{id,nama,totalSiswa,totalGuru,totalKelas}]`; `data.sekolah` berisi metrik sekolah yang dipilih; `data.platform` untuk super admin tanpa filter sekolah. Blok yang tidak berlaku bernilai null. `data.cabang` dipertahankan sebagai kompatibilitas, jangan menganggapnya satu sekolah ketika scope yayasan.
- Summary dan detail cabang lama memerlukan admin yayasan dengan langganan berlaku. Gunakan direktori global untuk halaman super admin. Profil yayasan tetap dapat dibaca pemilik meskipun langganan berakhir agar kebutuhan administrasi profil tidak terblokir.
- Aksi melepas naungan tidak memigrasikan paket atau menghapus akun sekolah. FE perlu menampilkan konsekuensi cakupan langganan dan operator perlu memeriksa langganan mandiri sekolah sebelum menggunakannya di luar yayasan.

## Validasi

Build TypeScript dan git diff --check lulus. Suite HTTP PostgreSQL lokal: **88/88 lulus dalam TZ Asia/Jakarta dan 88/88 lulus dalam TZ UTC**, termasuk callback settlement bertanda tangan memakai secret dummy. Tidak ada pembayaran Midtrans atau email nyata yang dijalankan. Tidak ada perubahan schema untuk task ini, sehingga tidak ada migrasi baru yang perlu ditambahkan dari task ini.
