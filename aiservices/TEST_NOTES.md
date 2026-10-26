# Notes perbaikan dan pengujian AI Face Service

Tanggal pengujian: **26 Oktober 2026**.

## Penyebab dan perubahan

- Startup sebelumnya mencoba memuat `main:app`, sedangkan file aplikasinya
  `index.py`. `python index.py` sekarang menjalankan instance FastAPI yang benar.
- Registrasi backend memanggil `/extract-embedding`, tetapi endpoint tersebut
  belum tersedia. Endpoint baru menerima multipart file `image` dan mengembalikan
  `success` beserta 128 nilai fitur SFace dalam array `embedding`.
- Port default backend disamakan dengan Python menjadi `8032`. Backend memakai
  `http://127.0.0.1:8032` jika `AI_SERVICE_URL` tidak diatur.
- Registrasi dan verifikasi memakai HTTP client yang sama, timeout 30 detik, dan
  penanganan error yang konsisten: `503` untuk layanan tidak terjangkau, `400`
  untuk foto tidak valid, serta `502` untuk endpoint atau respons server AI yang
  bermasalah. Pesan validasi FastAPI pada field `detail` diteruskan ke pengguna.
- Kesalahan database atau kesalahan lain di controller registrasi diteruskan ke
  middleware sesuai jenisnya, sehingga tidak semuanya dilaporkan sebagai gagal
  menghubungi AI server.
- Lokasi model diikat ke folder `aiservices`, sehingga menjalankan Python dari
  direktori lain tetap memuat model yang benar.
- Ditambahkan `/health`, penanganan file kosong, tes regresi backend dan Python,
  pengabaian folder `.venv`, serta panduan menjalankan service di Windows.

## Pengujian web

Frontend Next.js (`3000`), backend Express (`5000`), dan AI FastAPI (`8032`)
dijalankan bersama. Backend menggunakan **database PostgreSQL lokal khusus tes**
pada port `55432`, dengan skema Prisma asli, sekolah, langganan, admin, kelas,
dan pengguna uji. Data sekolah pada Supabase tidak diubah.

Pengujian browser dilakukan dengan Google Chrome dan Playwright. Kamera
disimulasikan memakai foto contoh publik OpenCV dan frame kosong. Pengambilan
gambar melalui `getUserMedia`, tombol kamera, pengiriman multipart, endpoint AI,
dan penyimpanan database tetap memakai alur aplikasi yang sebenarnya.

| Skenario | Hasil |
| --- | --- |
| Login admin melalui form web dan autentikasi backend | Lulus |
| Pilih pengguna, aktifkan kamera, ambil foto, simpan Face ID | `201`; 128 fitur dan foto referensi tersimpan |
| Daftar Face ID setelah registrasi | Pengguna tampil `Terdaftar` |
| Edit Face ID dan ambil foto baru | `201`; memperbarui record biometrik yang sama |
| Foto tanpa wajah | `400`; pesan jelas, tanpa record biometrik baru |
| Python dimatikan saat menyimpan | `503` / `AI_FACE_UNAVAILABLE`; petunjuk pemulihan tampil di web |
| Python dinyalakan kembali dan simpan foto yang sama | `201`; frontend dan backend tidak perlu direstart |
| Admin mendaftarkan pengguna dari sekolah lain | `403`; akses ditolak |
| Pengguna non-admin mencoba registrasi wajah | `403`; akses ditolak |
| Wajah terdaftar dipakai pada endpoint absensi | `201`; absensi tersimpan di database |
| Unhandled JavaScript page error pada alur yang diuji | Tidak ditemukan |

Enam tes HTTP client backend lulus. Delapan tes Python lulus ketika foto contoh
diberikan melalui `AI_TEST_FACE_IMAGE`, termasuk ekstraksi dan verifikasi wajah
asli. Pemeriksaan build TypeScript backend dilakukan sebelum publikasi commit.

## Catatan pemakaian dan batas pengujian

- AI service harus dijalankan pada terminal/proses terpisah dan dibiarkan hidup.
  Menjalankan frontend serta backend saja tidak menyalakan Python otomatis.
- Gunakan `AI_SERVICE_URL=http://127.0.0.1:8032` untuk backend dan Python yang
  berjalan pada komputer yang sama. Restart backend setelah mengubah `.env`.
- Console error `400` dan `503` memang muncul pada skenario kegagalan yang
  sengaja diuji. Keduanya bukan kegagalan registrasi dengan foto valid saat
  seluruh service aktif.
- Webcam fisik, izin kamera pada perangkat teman, deployment Vercel/produksi,
  dan akurasi pencocokan pada banyak orang belum diuji. Pengujian ini memastikan
  integrasi aplikasi, bukan evaluasi ketepatan atau anti-spoofing model.
- Foto contoh, video kamera simulasi, database, akun uji, kredensial, log, dan
  screenshot pengujian tidak dimasukkan ke commit.
