# AI Face Service

Service Python ini harus berjalan bersamaan dengan backend Node.js. Port default
adalah **8032**. Folder project bernama `aiservices` dan file aplikasi adalah
`index.py`.

## Menjalankan di Windows (PowerShell)

Dari folder utama repository:

```powershell
cd aiservices
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe index.py
```

Biarkan terminal ini tetap berjalan. Tunggu sampai muncul
`Uvicorn running on http://0.0.0.0:8032` dan `Application startup complete`.
Tidak perlu mengaktifkan virtual environment melalui `Activate.ps1`.

Di terminal lain, periksa server:

```powershell
Invoke-RestMethod http://127.0.0.1:8032/health
```

Hasilnya harus menampilkan `status: ok`. Dokumentasi API tersedia di
<http://127.0.0.1:8032/docs>.

Pastikan `Backend/.env` berisi:

```dotenv
AI_SERVICE_URL=http://127.0.0.1:8032
```

Jalankan atau restart backend setelah mengubah `.env`, kemudian coba registrasi
Face ID kembali. Variabel ini dibaca oleh backend, bukan frontend.

## Endpoint

| Method | Path | Input | Hasil |
| --- | --- | --- | --- |
| GET | `/health` | - | Status service setelah model berhasil dimuat |
| POST | `/extract-embedding` | Multipart file `image` | `success` dan array `embedding` untuk registrasi Face ID |
| POST | `/verify-face` | Multipart file `master_image` dan `snapshot_image` | `matched`, `similarity_score`, dan `message` untuk absensi |

Model `yunet.onnx` dan `sface.onnx` dimuat dari folder `aiservices`, terlepas dari
direktori saat perintah dijalankan. Jika model belum ada, service mengunduhnya
saat startup; tunggu hingga proses selesai dan periksa error di terminal Python.

## Jika koneksi gagal

- `ECONNREFUSED ::1:8032` / `127.0.0.1:8032`: koneksi backend ke port AI ditolak.
  Periksa terminal Python dan hasil `/health`; service mungkin belum berjalan,
  gagal startup, atau menggunakan host/port lain. Ini terjadi sebelum foto
  diproses oleh AI.
- `Could not import module "main"`: file aplikasi bernama `index.py`. Gunakan
  perintah startup di atas. Untuk menjalankan dengan reload saat pengembangan,
  gunakan `.\.venv\Scripts\python.exe -m uvicorn index:app --host 0.0.0.0 --port 8032 --reload`
  dari folder `aiservices`.
- `404` pada `/extract-embedding`: pastikan service menggunakan kode terbaru
  yang menyediakan endpoint registrasi tersebut, lalu restart Python.
- `Wajah tidak terdeteksi`: koneksi sudah berhasil. Gunakan foto wajah yang
  jelas, terang, dan menghadap kamera.

Jika menggunakan port lain, atur `$env:PORT = "8033"` di terminal Python sebelum
menjalankan `index.py`, lalu sesuaikan `AI_SERVICE_URL` di backend dan restart
backend. Perintah `uvicorn` menggunakan opsi `--port` sendiri.

Jika backend berjalan di komputer atau container berbeda, `127.0.0.1` menunjuk
ke komputer/container backend tersebut. Isi `AI_SERVICE_URL` dengan alamat
komputer atau hostname service Python yang dapat dijangkau dari backend.

## Tes regresi

Dari folder utama repository, setelah dependensi Python terpasang:

```powershell
.\aiservices\.venv\Scripts\python.exe -m unittest discover -s aiservices -p test_service.py -v
```

Tes menjalankan server sungguhan pada port sementara, memuat model OpenCV,
memeriksa `/health`, endpoint registrasi, validasi foto, serta startup dari
direktori lain. Dua tes dengan wajah asli dilewati secara default. Untuk
menyertakannya, atur `$env:AI_TEST_FACE_IMAGE` ke path absolut foto contoh yang
boleh digunakan untuk pengujian sebelum menjalankan perintah tersebut. Foto
dan embedding tidak dicetak atau dimasukkan ke repository oleh tes.

Tes integrasi HTTP client backend dapat dijalankan dari folder `Backend`:

```powershell
npm test
npm run build
```

Lihat [TEST_NOTES.md](TEST_NOTES.md) untuk hasil pengujian alur web dan batasannya.
