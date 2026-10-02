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
import { triggerDeadlineH1Notification } from "./controllers/notifikasi.controller";
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
import perpustakaanRoutes from "./routes/perpustakaan.routes";
import permohonanIzinRoutes from "./routes/permohonanIzin.routes";
import peminjamanAsetRoutes from "./routes/peminjamanAset.routes";
import raportRoutes from "./routes/raport.routes";

// IMPORT ROUTES BARU (YANG SEBELUMNYA HILANG)
import auditLogRoutes from "./routes/auditLog.routes";
import pengaturanSistemRoutes from "./routes/pengaturanSistem.routes";

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

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Pendaftaran Routes Utama
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/v1/langganan/sekolah", subscriptionRoutes);
app.use("/api/v1/tenant", tenantRoutes);
app.use("/api/v1/webhooks", webhookRoutes);
app.use("/api/v1/paket", paketRoutes);
app.use("/api/v1/sarpras", sarprasRoutes);
app.use("/api/v1/cms", cmsRoutes);
app.use("/api/v1/publik", publikRoutes);
app.use("/api/v1/siswa", siswaRoutes);
app.use("/api/tahun-ajaran", tahunAjaranRoutes);
app.use("/api/kelas", kelasRoutes);
app.use("/api/mata-pelajaran", mataPelajaranRoutes);
app.use("/api/kelas-mapel", kelasMapelRoutes);
app.use("/api/v1/jadwal-mengajar", jadwalMengajar);
app.use("/api/v1/materi-pembelajaran", materiPembelajaran);
app.use("/api/v1/tugas", tugasRoutes);
app.use("/api/v1/notifikasi", notifikasiRoutes);
app.use("/api/v1/absensi", absensiRoutes);
app.use("/api/v1/soal-ujian", soalUjianRoutes);
app.use("/api/v1/ujian", ujianRoutes);
app.use("/api/v1/infrastruktur", infrastrukturRoutes);
app.use("/api/v1/nilai", nilaiRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/role", roleRoutes);
app.use("/api/bk", bkRoutes);
app.use("/api/v1/yayasan", yayasanRoutes);
app.use("/api/v1/ppdb", ppdbRoutes);
app.use("/api/v1/jalur-ppdb", jalurPpdbRoutes);
app.use("/api/v1/perpustakaan", perpustakaanRoutes);
app.use("/api/v1/peminjaman-aset", peminjamanAsetRoutes);
app.use("/api/v1/raport", raportRoutes);
app.use("/api/v1/permohonan-izin", permohonanIzinRoutes);

app.use("/api/v1/audit-log", auditLogRoutes);
app.use("/api/v1/pengaturan", pengaturanSistemRoutes);

setInterval(
  () => {
    triggerDeadlineH1Notification().catch(console.error);
  },
  30 * 60 * 1000,
);

app.use(globalErrorHandler);

export default app;
