# PIN siswa dan pembatalan asesmen — 2 November 2026

- Field publik PIN adalah `pinConfigured: boolean`. Hash dipilih hanya untuk pemetaan internal, lalu dibuang. Berlaku pada daftar/detail siswa, `/api/siswa/me`, daftar/detail pengguna, dan profil pengguna. FE yang masih memakai `pinSudahDiatur` perlu beralih ke `pinConfigured`.
- Serializer JSON Express juga membuang key `pinHash`, termasuk pada objek nested, sebagai pengaman tambahan. Hash database dan alur verifikasi PIN tetap dipertahankan.
- Model/relasi AsesmenMinatBakat dan route/controller/validator terkait telah dihapus. Endpoint lama mengembalikan 404. Asesmen ujian/LMS dan modul BK lainnya tetap ada.
- Migrasi historis tidak diubah. Database Supabase belum diubah dan file migrasi penghapusan belum dibuat.

Pratinjau `prisma migrate diff` dari schema sebelum perubahan ke schema sesudah perubahan hanya menghasilkan penghapusan dua foreign key dan `DROP TABLE "asesmen_minat_bakat";`.

Untuk membuat migrasi, dari Backend dengan konfigurasi database development/shadow database yang benar:

```powershell
npx prisma migrate dev --name remove_asesmen_minat_bakat --create-only
```

Periksa SQL yang dihasilkan di prisma/migrations. Jika Prisma melaporkan drift atau meminta reset, rekonsiliasi riwayatnya dahulu; jangan reset database berisi data.

Setelah file migrasi ditinjau dan konfigurasi koneksi dialihkan ke Supabase tujuan, terapkan dengan:

```powershell
npx prisma migrate deploy
npx prisma generate
```

`prisma.config.ts` memprioritaskan DIRECT_URL di atas DATABASE_URL. Gunakan koneksi migrasi yang sesuai. DROP TABLE menghapus seluruh data fitur yang dibatalkan; perintah deploy di atas belum dieksekusi pada Supabase.
