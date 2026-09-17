# Dokumentasi Fitur: Peminjaman Aset (Sarana & Prasarana)

Dokumen ini menjelaskan alur, penambahan kode baru, perubahan skema database, serta daftar endpoint API untuk fitur **Peminjaman Aset** di SmartSchool Backend.

---

## 1. Alur Peminjaman (Workflow)

```text
[1. Ketersediaan Aset]
         │
         ▼
[2. Pengajuan Peminjaman] (Guru/Staff) ──► Status: "menunggu_persetujuan"
         │
         ├──► Ditolak (Petugas)        ──► Status: "ditolak" (dengan catatan alasan)
         ▼
[3. Persetujuan] (Petugas Sarpras)    ──► Status: "disetujui"
         │
         ▼
[4. Penyerahan ke Siswa/Pengambil]     ──► Status: "dipinjam"
   (Stok aset otomatis berkurang)
         │
         ▼
[5. Pengembalian oleh Siswa]          ──► Status: "dikembalikan"
   (Stok aset otomatis pulih & kondisi barang dicatat)
```

---

## 2. File yang Ditambahkan & Diubah

### A. File Baru

1. **`src/controllers/peminjamanAset.controller.ts`**
   - Mengatur seluruh logika bisnis peminjaman aset menggunakan transaksi database atomic (`prisma.$transaction`).
   - Fitur utama:
     - `getKetersediaanAset`: Menampilkan aset yang siap dipinjam (`jumlahStok > 0` dan `status === 'aktif'`).
     - `ajukanPeminjaman`: Validasi akumulasi stok per barang, pembuatan nomor otomatis `PINJAM-YYYYMMDD-XXXX`, dan status awal `menunggu_persetujuan`.
     - `verifikasiPengajuan`: Persetujuan/penolakan oleh petugas sarpras.
     - `serahkanKeSiswa`: Serah terima fisik ke siswa, otomatis mengurangi stok aset dan status menjadi `dipinjam`.
     - `kembalikanAset`: Pengembalian barang, otomatis memulihkan stok aset, mencatat kondisi barang (`baik`, `rusak_ringan`, `rusak_berat`), dan status menjadi `dikembalikan`.
     - `getDaftarPeminjaman`: Pagination, search (nomor pinjam, keperluan, nama siswa), filter status, dan filter otomatis untuk role `guru`.
     - `getDetailPeminjaman`: Detail komprehensif data peminjam, petugas, siswa pengambil/pengembali, dan daftar aset.

2. **`src/validations/peminjamanAset.validation.ts`**
   - Skema validasi Zod:
     - `ajukanPeminjamanSchema`: Validasi keperluan (min 3 karakter), tanggal kembali rencana (`YYYY-MM-DD`), dan array aset.
     - `persetujuanPeminjamanSchema`: Validasi status enum (`disetujui` / `ditolak`) dan catatan penolakan.
     - `serahkanPeminjamanSchema`: Validasi identitas siswa pengambil dan kondisi pinjam.
     - `kembalikanPeminjamanSchema`: Validasi identitas siswa pengembali, array barang kembali, dan catatan.

---

### B. File yang Dimodifikasi

1. **`prisma/schema.prisma`**
   - **Model `PeminjamanAset`**:
     - Ditambahkan: `keperluan`, `catatanPenolakan`, `siswaPengambilId`, `namaSiswaPengambil`, `siswaPengembaliId`, `namaSiswaPengembali`, `tanggalPengajuan`, `dihapusPada`, `diperbaruiPada`.
     - `tanggalPinjam` diubah menjadi opsional (`DateTime?`).
     - Relasi ke `Sekolah` dan `Pengguna` (`peminjam`, `petugas`, `siswaPengambil`, `siswaPengembali`).
   - **Model `Pengguna`**:
     - Ditambahkan relasi balik: `peminjamanDiajukan`, `peminjamanDiverifikasi`, `asetDiambil`, dan `asetDikembalikan`.
   - **Model `Sekolah`**:
     - Ditambahkan relasi `peminjamanAset` untuk isolasi multi-tenant.
   - **Model `DetailPeminjamanAset`**:
     - Nilai default kondisi `"baik"` dan relasi `onDelete: Cascade`.

2. **`src/routes/sarpras.routes.ts`**
   - Pendaftaran rute peminjaman aset dengan middleware `authenticate`, `requireTenant`, dan RBAC `requireIzin`.

---

## 3. Daftar Endpoint API

Semua rute berada di bawah prefix rute sarpras (misal: `/api/v1/sarpras`).

| No | Metode | Endpoint | Hak Akses (Izin) | Deskripsi |
| :---: | :--- | :--- | :--- | :--- |
| 1 | **GET** | `/peminjaman/ketersediaan` | Terautentikasi | Cek katalog aset yang siap dipinjam |
| 2 | **POST** | `/peminjaman` | `manajemen_aset.create` | Mengajukan pinjaman aset baru |
| 3 | **GET** | `/peminjaman` | `manajemen_aset.view` | Melihat daftar pengajuan peminjaman |
| 4 | **GET** | `/peminjaman/:id` | `manajemen_aset.view` | Melihat detail satu peminjaman |
| 5 | **PATCH** | `/peminjaman/:id/persetujuan`| `manajemen_aset.update` | Persetujuan atau penolakan oleh petugas |
| 6 | **PATCH** | `/peminjaman/:id/ambil` | `manajemen_aset.update` | Serah terima aset ke siswa (stok berkurang) |
| 7 | **PATCH** | `/peminjaman/:id/kembali`| `manajemen_aset.update` | Pengembalian aset (stok dipulihkan) |

---

## 4. Contoh Payload Request JSON

### A. Pengajuan Peminjaman (`POST /peminjaman`)
```json
{
  "keperluan": "Praktikum Jaringan Komputer Kelas XII TKJ",
  "tanggalKembaliRencana": "2026-09-20",
  "catatanPeminjaman": "Digunakan di Lab Komputer 2",
  "items": [
    {
      "asetId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "jumlah": 2
    },
    {
      "asetId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "jumlah": 5
    }
  ]
}
```

### B. Persetujuan / Penolakan (`PATCH /peminjaman/:id/persetujuan`)
```json
// Jika disetujui:
{
  "status": "disetujui"
}

// Jika ditolak:
{
  "status": "ditolak",
  "catatanPenolakan": "Aset sedang dijadwalkan untuk perawatan berkala"
}
```

### C. Penyerahan Barang ke Siswa (`PATCH /peminjaman/:id/ambil`)
```json
{
  "siswaPengambilId": "4c9e6679-7425-40de-944b-e07fc1f90af8",
  "namaSiswaPengambil": "Budi Santoso",
  "kondisiSaatPinjam": "baik"
}
```

### D. Pengembalian Aset (`PATCH /peminjaman/:id/kembali`)
```json
{
  "siswaPengembaliId": "4c9e6679-7425-40de-944b-e07fc1f90af8",
  "namaSiswaPengembali": "Budi Santoso",
  "items": [
    {
      "asetId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "kondisiSaatKembali": "baik",
      "catatanKembali": "Lengkap dan berfungsi normal"
    },
    {
      "asetId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "kondisiSaatKembali": "rusak_ringan",
      "catatanKembali": "1 kabel konektor longgar"
    }
  ]
}
```
