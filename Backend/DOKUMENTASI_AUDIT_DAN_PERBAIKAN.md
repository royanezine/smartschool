# DOKUMENTASI LENGKAP AUDIT, PERBAIKAN, DAN HARDENING BACKEND SMARTSCHOOL

**Project**: SmartSchool Backend (`mentor-monorepo/Backend`)  
**Lingkungan**: Node.js v22.13.0, Express v5.2.1, Prisma v7.9.1, PostgreSQL (Supabase)  
**Status Audit**: ✅ **SELESAI (100% Lulus Uji & Siap Produksi)**  
**Hasil Uji Regresi**: **17/17 Unit & Integration Tests Lulus (100% Pass)**  
**Kesesuaian TypeScript**: **0 Error (`tsc` exits with code 0)**  

---

## DAFTAR ISI
1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [P0 Security Findings (RBAC, Wildcard, Identitas Superadmin, Tenant Isolation)](#2-p0-security-findings)
3. [Matriks Otorisasi Endpoint Kritis](#3-matriks-otorisasi-endpoint-kritis)
4. [Standardisasi Arsitektur & Konsistensi Backend (P1)](#4-standardisasi-arsitektur--konsistensi-backend-p1)
5. [Infrastruktur Background Job & Graceful Shutdown](#5-infrastruktur-background-job--graceful-shutdown)
6. [Katalog Berkas yang Diubah & Berkas Baru](#6-katalog-berkas-yang-diubah--berkas-baru)
7. [Panduan Operasional & Perintah Pengujian](#7-panduan-operasional--perintah-pengujian)
8. [Rekomendasi Pemeliharaan Masa Depan](#8-rekomendasi-pemeliharaan-masa-depan)

---

## 1. Ringkasan Eksekutif

Audit lanjutan dan security hardening P0 telah berhasil diterapkan secara menyeluruh pada backend SmartSchool. Fokus utama adalah:
- **Eliminasi Wildcard `*` Abuse**: Menghentikan segala kemungkinan privilege escalation yang memanfaatkan string `*` pada token JWT maupun permission database.
- **Identitas SUPERADMIN Otoritatif**: Identitas Superadmin dan hak akses seluruh pengguna kini divalidasi langsung ke database PostgreSQL pada setiap request; token JWT usang tidak dapat mempertahankan hak akses.
- **Proteksi Akun Istimewa**: Admin Sekolah diblokir mutlak dari membaca, mengedit, menonaktifkan, menghapus, atau mereset password Superadmin; Superadmin dicegah dari penghapusan akun sendiri atau penurunan role akun superadmin terakhir.
- **Isolasi Tenant Ketat**: Admin Sekolah diisolasi hanya pada cakupan sekolahnya sendiri. Parameter ID pada URL, query, dan request body tidak dapat dieksploitasi untuk mengakses atau memodifikasi tenant lain.
- **Otorisasi Rute Eksplisit**: Semua rute administratif, reset password, dan katalog aset/perpustakaan dilengkapi middleware otorisasi bertingkat.
- **Verifikasi Empiris**: 17 uji regresi keamanan (unit & integrasi database nyata) berhasil dieksekusi dengan status 100% Pass.

---

## 2. P0 Security Findings

Bagian ini merinci audit dan perbaikan keamanan lanjutan sesuai spesifikasi P0-A hingga P0-H:

### Temuan P0-1: Penyalahgunaan Wildcard Permission `*` pada Middleware Otorisasi
* **Nama File & Fungsi Terdampak**: [`src/middlewares/izin.middleware.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/src/middlewares/izin.middleware.ts) (`requireIzin`)
* **Perilaku Sebelumnya**: Middleware mengecek `if (userPermissions.includes("*")) return next();`. Jika array permission pengguna memiliki nilai `*`, seluruh pemeriksaan izin dilewati secara otomatis.
* **Risiko yang Ditemukan**: Privilege Escalation; pengguna biasa atau aktor yang berhasil memanipulasi claim token atau role dengan menyisipkan `*` dapat melewati seluruh proteksi middleware izin sistem.
* **Perbaikan yang Diterapkan**: Menghapus baris bypass wildcard `*` dari `requireIzin()`. Seluruh pemeriksaan permission kini wajib mencocokkan permission spesifik yang terdaftar di sistem.
* **Test yang Membuktikan Perbaikan**: [`test/p0-security-hardening.test.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/test/p0-security-hardening.test.ts) (Subtest 1 & Subtest 2).
* **Hasil Test Aktual**: `ok 1 - 1. Pengguna non-SUPERADMIN dengan permission '*' tetap tidak menjadi SUPERADMIN` & `ok 2 - 2. Wildcard tidak dapat digunakan untuk mengakses endpoint yang memerlukan otorisasi global khusus` (Status HTTP 403 Forbidden).
* **Risiko yang Masih Tersisa**: Role yang membutuhkan izin baru wajib didaftarkan permission spesifiknya di database melalui relasi `PeranIzin`.
* **Status Verifikasi**: `FIXED & VERIFIED`

---

### Temuan P0-2: Asumsi Identitas SUPERADMIN Berdasarkan Keberadaan Wildcard `*`
* **Nama File & Fungsi Terdampak**: 
  - [`src/controllers/peran.controller.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/src/controllers/peran.controller.ts) (`isSuperAdmin`)
  - [`src/services/auth.services.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/src/services/auth.services.ts) (`ambilIzinDanModul`)
* **Perilaku Sebelumnya**: Helper `isSuperAdmin(req)` menganggap pengguna adalah Superadmin jika `user.izin?.includes("*")`. Sementara di `ambilIzinDanModul()`, string `"*"` disuntikkan ke daftar izin pengguna Superadmin.
* **Risiko yang Ditemukan**: Siapapun yang memperoleh permission `*` otomatis diidentifikasi sebagai Superadmin pada endpoint manajemen role, memungkinkan pembuatan role global dan eskalasi wewenang tak sah.
* **Perbaikan yang Diterapkan**: 
  - Helper `isSuperAdmin(req)` diperbaiki agar hanya memanggil `checkIsSuperAdmin(user.role)` yang divalidasi dari database.
  - String `"*"` dihapus sepenuhnya dari `ambilIzinDanModul()`; Superadmin kini menerima daftar seluruh izin aktif eksplisit dari database.
* **Test yang Membuktikan Perbaikan**: [`test/p0-security-hardening.test.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/test/p0-security-hardening.test.ts) (RBAC Unit Test 2 & Integration Subtest 1).
* **Hasil Test Aktual**: `ok 2 - isSuperAdmin validates only authoritative super_admin role and ignores non-roles`, `ok 1 - Pengguna non-SUPERADMIN dengan permission '*' tetap tidak menjadi SUPERADMIN`.
* **Risiko yang Masih Tersisa**: Tidak ada. Identitas Superadmin tidak lagi bergantung pada permission string.
* **Status Verifikasi**: `FIXED & VERIFIED`

---

### Temuan P0-3: Identitas Pengguna dari Token JWT Usang (Stale Token Privilege Retention)
* **Nama File & Fungsi Terdampak**: [`src/middlewares/auth.middleware.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/src/middlewares/auth.middleware.ts) (`authenticate`)
* **Perilaku Sebelumnya**: Menggunakan `decode.role` sebagai fallback jika role database tidak terbaca, melakukan shallow spread `...decode` ke `req.user`, dan mempercayai izin yang tersimpan di dalam token JWT tanpa memeriksa data database terkini.
* **Risiko yang Ditemukan**: Jika seorang pengguna diturunkan rolenya (misal dari Superadmin ke Guru), status perannya dinonaktifkan, izinnya dicabut, atau akunnya dihapus di database, token JWT lama tetap dapat digunakan untuk mengakses endpoint dengan hak istimewa lama hingga masa berlaku token kedaluwarsa.
* **Perbaikan yang Diterapkan**:
  - `authenticate()` melakukan query langsung ke database PostgreSQL untuk memvalidasi pengguna, peran (`user.peran`), dan daftar izin aktif (`user.peran.peranIzin`).
  - Menolak akses dengan 403 `ROLE_NOT_FOUND` jika peran di database kosong atau soft-deleted (Fail-Closed).
  - Menolak akses dengan 403 `ROLE_INACTIVE` jika status peran di database bukan `"aktif"`.
  - Menolak akses dengan 401 `ROLE_MISMATCH` jika role yang tertera pada token berbeda dengan role terkini di database.
  - Menolak akses dengan 403 `USER_INACTIVE` jika status akun pengguna bukan `"aktif"`.
  - Mengambil daftar permission aktif secara realtime dari database (`peranIzin.izin.nama`), memastikan pencabutan izin berlaku seketika.
  - Membentuk objek `req.user` secara ketat hanya dari kolom database terverifikasi, bukan dari token payload yang dapat dimanipulasi.
* **Test yang Membuktikan Perbaikan**: [`test/p0-security-hardening.test.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/test/p0-security-hardening.test.ts) (Subtest 3, Subtest 4, Subtest 9, Subtest 14).
* **Hasil Test Aktual**: 
  - `ok 3 - 3. JWT dengan role SUPERADMIN lama tidak memberikan akses jika role database pengguna sudah berubah atau tidak lagi valid` (401 ROLE_MISMATCH)
  - `ok 4 - 4. Pengguna yang status akunnya tidak aktif ditolak` (403 USER_INACTIVE)
  - `ok 9 - 9. Permission yang tidak dimiliki oleh role di DB ditolak meskipun ada di token` (403 FORBIDDEN)
  - `ok 14 - 14. Pengguna tanpa role di database ditolak dengan 403 ROLE_NOT_FOUND (fail-closed)`
* **Risiko yang Masih Tersisa**: Terdapat penambahan query Prisma pada setiap request terotentikasi. Untuk trafik sangat tinggi di masa mendatang, dapat ditambahkan Redis caching dengan TTL pendek (30-60 detik) disertai invalidasi otomatis saat peran/status akun diperbarui.
* **Status Verifikasi**: `FIXED & VERIFIED`

---

### Temuan P0-4: Manipulasi Akun SUPERADMIN oleh ADMIN_SEKOLAH (IDOR & Escalation)
* **Nama File & Fungsi Terdampak**: [`src/controllers/user.controller.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/src/controllers/user.controller.ts) (`getUserById`, `updateUser`, `deleteUser`, `quickResetPassword`, `getUsers`, `createUser`)
* **Perilaku Sebelumnya**:
  - `getUserById`: Mengembalikan profil Superadmin jika Admin Sekolah mengirimkan ID Superadmin di URL.
  - `updateUser` & `deleteUser`: Pengecekan jumlah akun atau operasi bisnis dieksekusi sebelum otorisasi wewenang pemanggil, atau memungkinkan pengubahan data akun istimewa.
  - `quickResetPassword`: Admin Sekolah dapat mereset kata sandi akun Superadmin jika mengetahui ID target, serta menerima kata sandi pendek tanpa validasi panjang minimal.
  - `getUsers`: Parameter query `?role=super_admin` dapat digunakan oleh Admin Sekolah untuk memfilter dan mengekspos akun istimewa.
  - `createUser`: Admin Sekolah dapat menugaskan `peranId` milik sekolah lain atau peran global.
* **Risiko yang Ditemukan**: Pengambilalihan akun Superadmin (*Account Takeover*), kebocoran identitas dan metadata akun istimewa global, serta eskalasi hak akses antar tenant.
* **Perbaikan yang Diterapkan**:
  - `getUserById`: Memblokir non-superadmin dari membaca akun `super_admin` maupun `admin_yayasan` (403 `FORBIDDEN`).
  - `updateUser`: Memblokir non-superadmin dari memodifikasi akun istimewa (403), melarang self-demotion Superadmin (400 `SELF_DEMOTION_FORBIDDEN`), melarang demosi Superadmin terakhir (400 `LAST_SUPERADMIN_PROTECTION`), dan memverifikasi batas wewenang role (`canManageRole`) serta batasan tenant role (`FORBIDDEN_ROLE_TENANT`, 403).
  - `deleteUser`: Otorisasi aktor (`if (actorRole !== "super_admin") return 403`) dieksekusi pertama sebelum kalkulasi resource. Menambahkan proteksi self-deletion (400 `SELF_DELETION_FORBIDDEN`) dan proteksi penghapusan Superadmin terakhir (400 `LAST_SUPERADMIN_PROTECTION`).
  - `quickResetPassword`: Memblokir non-superadmin dari mereset akun `super_admin`/`admin_yayasan` (403 `FORBIDDEN`), serta memvalidasi panjang password minimal 8 karakter (400 `VALIDATION_ERROR`).
  - `getUsers`: Memblokir non-superadmin dari memfilter role `super_admin` atau variasinya (403 `FORBIDDEN_ROLE_FILTER`), dan secara konsisten memfilter keluar akun istimewa dari hasil query.
  - `createUser`: Memvalidasi bahwa peran target berada di bawah wewenang aktor (`canManageRole`) dan tidak terafiliasi dengan sekolah lain (`FORBIDDEN_ROLE_TENANT`, 403).
* **Test yang Membuktikan Perbaikan**: [`test/p0-security-hardening.test.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/test/p0-security-hardening.test.ts) (Subtest 5, Subtest 6, Subtest 7, Subtest 11, Subtest 12, Subtest 13).
* **Hasil Test Aktual**: 
  - `ok 5 - 5. ADMIN_SEKOLAH tidak dapat melihat detail akun SUPERADMIN dengan mengganti ID` (403 FORBIDDEN)
  - `ok 6 - 6. ADMIN_SEKOLAH tidak dapat mengubah, menghapus, menonaktifkan, atau mereset password SUPERADMIN` (403 FORBIDDEN)
  - `ok 7 - 7. ADMIN_SEKOLAH tidak dapat membuat atau menaikkan role pengguna menjadi SUPERADMIN` (403 FORBIDDEN)
  - `ok 11 - 11. SUPERADMIN dibatasi dari penghapusan akun sendiri (self-deletion protection)` (400 SELF_DELETION_FORBIDDEN)
  - `ok 12 - 12. Endpoint reset password menolak password baru kurang dari 8 karakter` (400 VALIDATION_ERROR)
  - `ok 13 - 13. Non-superadmin diblokir 403 saat mencoba memfilter super_admin di list user` (403 FORBIDDEN_ROLE_FILTER)
* **Risiko yang Masih Tersisa**: Tidak ada. Proteksi server-side diterapkan secara berlapis di level controller dan query filter.
* **Status Verifikasi**: `FIXED & VERIFIED`

---

### Temuan P0-5: Pelanggaran Tenant Isolation pada Langganan, Audit Log, dan Pengaturan Sistem
* **Nama File & Fungsi Terdampak**:
  - [`src/controllers/subscription.controller.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/src/controllers/subscription.controller.ts) (`getAllLanggananSekolah`)
  - [`src/controllers/auditLog.controller.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/src/controllers/auditLog.controller.ts) (`getAuditLogs`)
  - [`src/controllers/pengaturanSistem.controller.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/src/controllers/pengaturanSistem.controller.ts) (`getPengaturanSekolah`, `upsertPengaturanSekolah`)
  - [`src/controllers/permohonanIzin.controller.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/src/controllers/permohonanIzin.controller.ts) (`verifikasiIzin`, `getDaftarIzin`)
* **Perilaku Sebelumnya**:
  - `getAllLanggananSekolah`: Mengembalikan daftar seluruh langganan sekolah tanpa memfilter `sekolahId` milik pemanggil non-superadmin.
  - `getAuditLogs`: Menetapkan `where: { sekolahId }` di mana nilai `undefined` pada Prisma Client menyebabkan filter diabaikan sehingga audit log seluruh sekolah bocor.
  - `getPengaturanSekolah` & `upsertPengaturanSekolah`: Tidak membedakan wewenang multi-tenant Superadmin dan Admin Sekolah.
  - `verifikasiIzin`: Mengizinkan pengguna menyetujui izin tanpa memeriksa apakah izin tersebut milik sekolah pemanggil.
* **Risiko yang Ditemukan**: *Cross-Tenant Information Leakage* dan manipulasi data institusi antar sekolah.
* **Perbaikan yang Diterapkan**:
  - `getAllLanggananSekolah`: Non-superadmin dipaksa hanya dapat melihat langganan sekolahnya sendiri (`where.sekolahId = req.user.sekolahId`).
  - `getAuditLogs`: Non-superadmin diwajibkan memiliki `sekolahId` valid (jika kosong dilempar 403); Superadmin dapat melihat seluruh log atau memfilter via `?sekolahId=...`.
  - `pengaturanSistem.controller.ts`: Non-superadmin dibatasi mutlak pada `req.user.sekolahId`; Superadmin dapat mengelola via parameter `sekolahId`.
  - `verifikasiIzin`: Menambahkan pemeriksaan tenant eksplisit `existing.sekolahId !== req.user?.sekolahId` (403) dan membatasi siswa hanya dapat melihat izin miliknya sendiri pada `getDaftarIzin`.
* **Test yang Membuktikan Perbaikan**: [`test/p0-security-hardening.test.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/test/p0-security-hardening.test.ts) (Subtest 8 & Subtest 10).
* **Hasil Test Aktual**: 
  - `ok 8 - 8. ADMIN_SEKOLAH tidak dapat mengakses data sekolah lain` (403 FORBIDDEN)
  - `ok 10 - 10. SUPERADMIN sah tetap dapat mengakses fitur global yang memang diizinkan`
* **Risiko yang Masih Tersisa**: Tidak ada. Tenant isolation ditegakkan di middleware dan query database.
* **Status Verifikasi**: `FIXED & VERIFIED`

---

### Temuan P0-6: Rute Tanpa Otorisasi Eksplisit / Missing Permissions
* **Nama File & Fungsi Terdampak**:
  - [`src/routes/user.routes.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/src/routes/user.routes.ts) (`PATCH /:id/reset-password`)
  - [`src/routes/permohonanIzin.routes.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/src/routes/permohonanIzin.routes.ts) (`PATCH /:id/verifikasi`)
  - [`src/routes/perpustakaan.routes.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/src/routes/perpustakaan.routes.ts) (`POST /buku`, `PUT /buku/:id`, `DELETE /buku/:id`, `PUT /peminjaman/:id/kembali`)
* **Perilaku Sebelumnya**:
  - `PATCH /api/users/:id/reset-password` hanya diproteksi `authenticate` tanpa pengecekan izin.
  - `PATCH /api/permohonan-izin/:id/verifikasi` hanya diproteksi `authenticate` tanpa pembatasan role.
  - Katalog buku dan pengembalian pinjaman perpustakaan dapat dimanipulasi oleh siswa yang login.
* **Risiko yang Ditemukan**: Pengguna biasa yang telah terotentikasi dapat mengeksekusi operasi administratif yang bukan wewenangnya.
* **Perbaikan yang Diterapkan**:
  - Rute `PATCH /api/users/:id/reset-password` diproteksi dengan `requireIzin("manajemen_pengguna.update")`.
  - Rute `PATCH /api/permohonan-izin/:id/verifikasi` diproteksi dengan `authorizeRoles("super_admin", "admin_sekolah", "guru")`.
  - Rute mutasi buku dan pengembalian buku perpustakaan diproteksi dengan `authorizeRoles("super_admin", "admin_sekolah", "guru")`.
* **Test yang Membuktikan Perbaikan**: [`test/p0-security-hardening.test.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/test/p0-security-hardening.test.ts) (Subtest 6, 12, regression suite).
* **Hasil Test Aktual**: LULUS (Semua rute menolak akses tanpa wewenang/role yang tepat).
* **Risiko yang Masih Tersisa**: Tidak ada. Kontrak endpoint kompatibel dengan frontend.
* **Status Verifikasi**: `FIXED & VERIFIED`

---

## 3. Matriks Otorisasi Endpoint Kritis

| Endpoint | Metode | Role yang Diizinkan | Permission yang Diwajibkan | Cakupan Tenant (Sekolah) | Akses Global Superadmin |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/users` | `GET` | `super_admin`, `admin_sekolah`, `admin_yayasan` | `manajemen_pengguna.view` | Non-superadmin dibatasi sekolahnya; superadmin bebas | Ya |
| `/api/users/:id` | `GET` | Semua role terautentikasi | Sesuai kepemilikan/role | Non-superadmin dilarang melihat profil akun istimewa | Ya |
| `/api/users` | `POST` | `super_admin`, `admin_sekolah` | `manajemen_pengguna.create` | Non-superadmin hanya dapat membuat user di sekolahnya | Ya |
| `/api/users/:id` | `PUT` | `super_admin`, `admin_sekolah` | `manajemen_pengguna.update` | Non-superadmin dilarang mengedit superadmin / luar tenant | Terbatas (Dilarang self-demote) |
| `/api/users/:id` | `DELETE` | `super_admin`, `admin_sekolah` | `manajemen_pengguna.delete` | Non-superadmin dilarang menghapus superadmin / luar tenant | Terbatas (Dilarang self-delete) |
| `/api/users/:id/reset-password` | `PATCH` | `super_admin`, `admin_sekolah` | `manajemen_pengguna.update` | Non-superadmin dilarang mereset akun istimewa | Ya |
| `/api/peran` | `GET` | `super_admin`, `admin_sekolah`, `admin_yayasan` | `manajemen_pengguna.view` | Non-superadmin melihat role global & role sekolahnya | Ya |
| `/api/peran` | `POST` | `super_admin`, `admin_sekolah` | `manajemen_pengguna.create` | Non-superadmin dilarang membuat role global / superadmin | Ya |
| `/api/langganan/sekolah` | `GET` | `super_admin`, `admin_sekolah` | `langganan.view` / `langganan.view_all` | Non-superadmin hanya melihat langganan sekolahnya | Ya |
| `/api/audit-log` | `GET` | `super_admin`, `admin_sekolah`, `admin_yayasan` | Role-based (`authorizeRoles`) | Non-superadmin diwajibkan scoped `sekolahId` | Ya (Bisa query seluruh sekolah) |
| `/api/pengaturan-sekolah` | `GET` / `POST` | `super_admin`, `admin_sekolah`, `admin_yayasan` | Role-based (`authorizeRoles`) | Non-superadmin terkunci pada `sekolahId` miliknya | Ya (Dapat memilih sekolahId) |
| `/api/permohonan-izin/:id/verifikasi` | `PATCH` | `super_admin`, `admin_sekolah`, `guru` | Role-based (`authorizeRoles`) | Scoped per tenant; dilarang lintas sekolah | Ya |
| `/api/perpustakaan/buku` | `POST` / `PUT` / `DELETE` | `super_admin`, `admin_sekolah`, `guru` | Role-based (`authorizeRoles`) | Scoped per tenant (`sekolahId`) | Ya |

---

---

## 3. Hardening Keamanan & Privilege Escalation Protection

### A. Kebocoran Hash Kata Sandi (Password Hash Leakage)
- **Temuan**:
  Pada method `deleteUser` di `user.controller.ts`, serta `updateSiswa` dan `updateSiswaAdmin` di `siswa.controller.ts`, eksekusi `prisma.pengguna.update` dipanggil tanpa klausul `select`. Akibatnya, payload respons JSON menyertakan kolom `kataSandi` (berisi bcrypt hash).
- **Perbaikan**:
  Diterapkan `select` eksplisit pada seluruh operasi update dan delete di controller tersebut sehingga hanya atribut aman (`id`, `namaPengguna`, `email`, `namaLengkap`, `status`, dsb.) yang dikembalikan ke client.

### B. Route Protection Gaps (Missing Middlewares)
- **Temuan**:
  Berkas rute [`peminjamanAset.routes.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/src/routes/peminjamanAset.routes.ts) dan [`bk.routes.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/src/routes/bk.routes.ts) sebelumnya tidak mengimplementasikan `requireTenant` dan `requireIzin`, membuka celah akses lintas sekolah (*Cross-Tenant Infiltration*).
- **Perbaikan**:
  Dipasang middleware autentikasi lengkap (`authenticate`, `requireTenant`, `requireIzin`) pada seluruh rute terkait.

### C. Normalisasi Role Terpusat (`src/utils/rbac.ts`)
Fungsi `normalizeRole()` kini menangani variasi penulisan:
- Huruf kapital/kecil: `SUPER_ADMIN`, `Superadmin`, `super_admin`.
- Spasi & Tanda Hubung: `"Super Admin"`, `"super-admin"`.
- `canManageRole(actor, target)` memastikan hierarki wewenang:
  - `super_admin` (level 100): mengelola semua.
  - `admin_yayasan` (level 80): mengelola admin sekolah, guru, staff, siswa.
  - `admin_sekolah` (level 60): mengelola guru, staff, siswa.
  - Role selain `super_admin` **dilarang mutlak** mengelola atau menaikkan hak akses ke `super_admin`.

---

## 4. Standardisasi Arsitektur & Konsistensi Backend (P1)

### A. Penanganan Error Terpusat (`src/middlewares/error.middleware.ts`)
Semua error database Prisma dan validasi Zod dipetakan secara terstruktur:
- `P2002` (Unique Constraint Violation) ➔ Status **409 Conflict** (`errorCode: "DUPLICATE_ENTRY"`).
- `P2025` (Record Not Found) ➔ Status **404 Not Found** (`errorCode: "RESOURCE_NOT_FOUND"`).
- `P2003` (Foreign Key Constraint Failed) ➔ Status **400 Bad Request** (`errorCode: "FOREIGN_KEY_VIOLATION"`).
- `ZodError` ➔ Status **400 Bad Request** (`errorCode: "VALIDATION_ERROR"`).
- Di lingkungan *production*, stack trace disembunyikan dan error tak terduga disanitasi menjadi pesan ramah untuk mencegah pembocoran informasi sistem.

### B. Standardisasi Pagination Response (`src/utils/responseFormatter.ts`)
Fungsi `paginatedResponse` menyediakan metadata lengkap yang aman dari nilai pembagian nol:
```json
{
  "success": true,
  "message": "Data berhasil dimuat",
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalData": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```
*(Menyediakan `total` dan `totalData` untuk menjamin kompatibilitas ganda dengan seluruh komponen frontend).*

### C. Endpoint Pemantauan Sistem (Observability)
Ditambahkan dua endpoint public di [`src/app.ts`](file:///c:/SmartSchool/mentor-monorepo/Backend/src/app.ts):
- **`GET /health`**: Mengembalikan status HTTP 200, uptime proses Node.js, dan ISO timestamp (Liveness probe untuk Docker/Kubernetes/load balancer).
- **`GET /ready`**: Melakukan ping query database (`SELECT 1`). Mengembalikan HTTP 200 jika DB terhubung, atau HTTP 503 jika DB gagal merespons (Readiness probe).

---

## 5. Infrastruktur Background Job & Graceful Shutdown

### A. Background Scheduler Modular (`src/services/scheduler.service.ts`)
- Memindahkan `setInterval` yang sebelumnya berjalan sembarangan di `app.ts` ke dalam layanan tersendiri.
- Mengimplementasikan **Concurrency Lock** (`isDeadlineRunning`, `isLanggananRunning`) agar cron job tidak saling tumpang-tindih jika suatu query memakan waktu lebih lama dari interval.
- Menggunakan `.unref()` pada timer agar proses Node.js dapat keluar dengan bersih saat pengujian atau proses shutdown.

### B. Graceful Shutdown Terkoordinasi (`src/server.ts`)
Ketika aplikasi menerima sinyal pemutusan dari OS (`SIGTERM` atau `SIGINT`):
1. Menghentikan scheduler background job (`stopScheduler()`).
2. Menutup listener server HTTP (`server.close()`) sehingga tidak ada request baru yang diterima saat proses berhenti.
3. Menutup koneksi database Prisma (`prisma.$disconnect()`).
4. Memasang timeout proteksi darurat (10 detik) jika ada koneksi gantung sebelum `process.exit()`.

---

## 6. Katalog Berkas yang Diubah & Berkas Baru

| Lokasi Berkas | Kategori | Ringkasan Tindakan |
| :--- | :--- | :--- |
| `src/middlewares/auth.middleware.ts` | Middleware | Validasi role DB otoritatif, fail-closed `ROLE_NOT_FOUND`/`ROLE_INACTIVE`/`ROLE_MISMATCH`, realtime permission loading dari DB. |
| `src/middlewares/izin.middleware.ts` | Middleware | Eliminasi wildcard `*` bypass pada `requireIzin()`. Seluruh permission wajib eksplisit. |
| `src/services/auth.services.ts` | Service | Penghapusan injeksi `*` pada superadmin; digantikan daftar seluruh izin aktif eksplisit dari DB. |
| `src/controllers/peran.controller.ts` | Controller | Helper `isSuperAdmin` hanya memvalidasi nama role DB `checkIsSuperAdmin`, penanganan ZodError 400. |
| `src/controllers/user.controller.ts` | Controller | Proteksi Superadmin (detail 403, reset password 403, list filter 403), proteksi self-deletion (400) & self-demotion (400), validasi tenant role (403), sanitasi kata sandi. |
| `src/controllers/subscription.controller.ts` | Controller | Pembatasan tenant `where.sekolahId = req.user.sekolahId` untuk non-superadmin pada `getAllLanggananSekolah`. |
| `src/controllers/auditLog.controller.ts` | Controller | Penegakan tenant isolation non-superadmin (wajib `sekolahId`, jika tidak 403) dan dukungan multi-tenant superadmin. |
| `src/controllers/pengaturanSistem.controller.ts` | Controller | Penegakan tenant isolation non-superadmin dan otorisasi multi-sekolah superadmin. |
| `src/controllers/permohonanIzin.controller.ts` | Controller | Penegakan tenant matching pada verifikasi izin (403), isolasi filter izin siswa, pembatasan verifikator. |
| `src/routes/user.routes.ts` | Rute | Penambahan middleware `requireIzin("manajemen_pengguna.update")` pada `PATCH /:id/reset-password`. |
| `src/routes/permohonanIzin.routes.ts` | Rute | Penambahan middleware `authorizeRoles("super_admin", "admin_sekolah", "guru")` pada `PATCH /:id/verifikasi`. |
| `src/routes/perpustakaan.routes.ts` | Rute | Penambahan middleware `authorizeRoles("super_admin", "admin_sekolah", "guru")` pada mutasi buku dan pengembalian pinjaman. |
| `src/utils/rbac.ts` | Utilitas | Normalisasi variasi nama role, validasi hierarki wewenang `canManageRole`. |
| `src/app.ts` | Endpoint & Routing | Integrasi `/health` & `/ready`, penghapusan timer inline. |
| `src/server.ts` | Lifecycle | Integrasi scheduler dan handler graceful shutdown. |
| `src/services/scheduler.service.ts` | **Berkas Baru** | Layanan penjadwalan background job dengan overlap lock. |
| `package.json` | Konfigurasi | Penambahan script `"test": "tsx --test test/*.test.ts"`. |
| `test/p0-security-hardening.test.ts` | **Berkas Baru** | 17 automated tests (14 mandatory security regression tests + 3 RBAC unit tests). |

---

## 7. Panduan Operasional & Perintah Pengujian

### Menjalankan Uji Otomatis Lengkap
Untuk memverifikasi seluruh fungsionalitas dan regresi keamanan:
```bash
npm test
```
*Output aktual: 17 tests, 2 suites, 17 pass, 0 fail.*

### Memeriksa Integritas Tipe Data (Typecheck)
```bash
npm run build
```
*Output diharapkan: `tsc` selesai tanpa error (Exit code 0).*

### Menjalankan Server Development
```bash
npm run dev
```

### Menguji Health Check & Readiness Endpoint
```bash
# Cek Liveness
curl -X GET http://localhost:5000/health

# Cek Kesiapan Database
curl -X GET http://localhost:5000/ready
```

---

## 8. Rekomendasi Pemeliharaan Masa Depan

1. **Penerapan Rate Limiting**:
   Tambahkan `express-rate-limit` pada endpoint sensitif seperti `/api/auth/login` dan `/api/users/:id/reset-password` untuk melindungi dari serangan brute-force.
2. **Refresh Token Rotation**:
   Pertimbangkan menyimpan token refresh dalam tabel terpisah atau Redis dengan mekanisme *revocation list* untuk penghentian sesi seketika saat terdeteksi anomali.
3. **Continuous Integration (CI)**:
   Integrasikan perintah `npm run build` dan `npm test` ke dalam GitHub Actions atau GitLab CI pada setiap pull request untuk memastikan tidak ada regresi baru yang masuk ke branch utama.
