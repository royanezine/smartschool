import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import path from "path";
import { globalErrorHandler } from "./middlewares/error.middleware";

// Import Semua Routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import tenantRoutes from "./routes/tenant.routes";
import webhookRoutes from "./routes/webhook.routes";
import paketRoutes from "./routes/paket.routes";
import sarprasRoutes from "./routes/sarpras.routes";
import cmsRoutes from "./routes/cms.routes";
import publikRoutes from "./routes/publik.routes";
import siswaRoutes from "./routes/siswa.routes";
import tahunAjaranRoutes from "./routes/tahunAjaran.routes";
import kelasRoutes from "./routes/kelas.routes";
import mataPelajaranRoutes from "./routes/mataPelajaran";
import kelasMapelRoutes from "./routes/kelasMapel.routes";
import jadwalMengajar from "./routes/jadwalMengajar.routes";
import materiPembelajaran from "./routes/materiPembelajaran.routes";
import tugasRoutes from "./routes/tugas.routes";
import notifikasiRoutes from "./routes/notifikasi.routes";
import { prisma } from "./config/db";
import absensiRoutes from "./routes/absensi.routes";
import soalUjianRoutes from "./routes/soalUjian.routes";
import ujianRoutes from "./routes/ujian.routes";
import infrastrukturRoutes from "./routes/infrastruktur.routes";
import nilaiRoutes from "./routes/nilai.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import roleRoutes from "./routes/peran.routes";
import bkRoutes from "./routes/bk.routes";
import yayasanRoutes from "./routes/yayasan.routes";
import ppdbRoutes from "./routes/ppdb.routes";
import jalurPpdbRoutes from "./routes/jalurPpdb.routes";
import gelombangPpdbRoutes from "./routes/gelombangPpdb.routes";
import perpustakaanRoutes from "./routes/perpustakaan.routes";
import permohonanIzinRoutes from "./routes/permohonanIzin.routes";
import peminjamanAsetRoutes from "./routes/peminjamanAset.routes";
import raportRoutes from "./routes/raport.routes";
import kkmRoutes from "./routes/kkm.routes";
import keuanganRoutes from "./routes/keuangan.routes";
import { jurusanRoutes, asesmenMinatRoutes, pengumumanRoutes } from "./routes/qaResources.routes";
import platformRoutes from "./routes/platform.routes";

// IMPORT ROUTES BARU (YANG SEBELUMNYA HILANG)
import auditLogRoutes from "./routes/auditLog.routes";
import pengaturanSistemRoutes from "./routes/pengaturanSistem.routes";

// IMPORT ROUTES SISTEM SHIFT & PENGGAJIAN
import kategoriJabatanRoutes from "./routes/kategoriJabatan.routes";
import shiftKerjaRoutes from "./routes/shiftKerja.routes";
import penggajianRoutes from "./routes/penggajian.routes";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "SmartSchool API is running smoothly! 🚀",
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/ready", async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: "unready",
      database: "disconnected",
      message: (error as Error).message,
    });
  }
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Pendaftaran Routes Utama
app.use("/api/auth", authRoutes);
app.use("/api/platform", platformRoutes);
app.use("/api/users", userRoutes);
app.use("/api/langganan/sekolah", subscriptionRoutes);
app.use("/api/tenant", tenantRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/paket", paketRoutes);
app.use("/api/sarpras", sarprasRoutes);
app.use("/api/cms", cmsRoutes);
app.use("/api/publik", publikRoutes);
app.use("/api/siswa", siswaRoutes);
app.use("/api/tahun-ajaran", tahunAjaranRoutes);
app.use("/api/kelas", kelasRoutes);
app.use("/api/mata-pelajaran", mataPelajaranRoutes);
app.use("/api/kelas-mapel", kelasMapelRoutes);
app.use("/api/jadwal-mengajar", jadwalMengajar);
app.use("/api/materi-pembelajaran", materiPembelajaran);
app.use("/api/tugas", tugasRoutes);
app.use("/api/notifikasi", notifikasiRoutes);
app.use("/api/absensi", absensiRoutes);
app.use("/api/soal-ujian", soalUjianRoutes);
app.use("/api/ujian", ujianRoutes);
app.use("/api/infrastruktur", infrastrukturRoutes);
app.use("/api/nilai", nilaiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/bk", bkRoutes);
app.use("/api/jurusan", jurusanRoutes);
app.use("/api/bk/asesmen-minat-bakat", asesmenMinatRoutes);
app.use("/api/ppdb/pengumuman", pengumumanRoutes);
app.use("/api/yayasan", yayasanRoutes);
app.use("/api/ppdb", ppdbRoutes);
app.use("/api/jalur-ppdb", jalurPpdbRoutes);
app.use("/api/gelombang-ppdb", gelombangPpdbRoutes);
app.use("/api/perpustakaan", perpustakaanRoutes);
app.use("/api/peminjaman-aset", peminjamanAsetRoutes);
app.use("/api/raport", raportRoutes);
app.use("/api/permohonan-izin", permohonanIzinRoutes);
app.use("/api/audit-log", auditLogRoutes);
app.use("/api/pengaturan", pengaturanSistemRoutes);
app.use("/api/pengaturan/kkm", kkmRoutes);
app.use("/api/kategori-jabatan", kategoriJabatanRoutes);
app.use("/api/shift-kerja", shiftKerjaRoutes);
app.use("/api/penggajian", penggajianRoutes);
app.use("/api/keuangan", keuanganRoutes);

app.use(globalErrorHandler);

export default app;
