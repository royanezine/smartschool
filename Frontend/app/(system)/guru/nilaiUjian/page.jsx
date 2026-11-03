"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

// Sesuaikan path import ini dengan lokasi service API-mu
import { 
  getNilaiKelasSaya, 
  getGridNilai, 
  getKomponenNilai,
  exportRekapNilai,
  downloadRekapNilai,
  importNilaiExcel
} from "@/services/nilai.service";
import ExcelJS from "exceljs";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Loader2,
  Search,
  Upload,
  X,
} from "lucide-react";


const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// Perbaikan: Definisikan string class-nya di sini
const themeTextMuted = "theme-text-muted";
const themeTextSecondary = "theme-text-secondary";


export default function NilaiUjianGuruPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // State Data
  const [daftarKelas, setDaftarKelas] = useState([]);
  const [selectedKelasId, setSelectedKelasId] = useState("");
  
  const [gridNilai, setGridNilai] = useState(null);
  const [komponen, setKomponen] = useState([]);
  
  // State UI
  const [loadingKelas, setLoadingKelas] = useState(true);
  const [loadingNilai, setLoadingNilai] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  // State Import Excel
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importKomponenId, setImportKomponenId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [globalSuccess, setGlobalSuccess] = useState("");


  // 1. Ambil daftar kelas yang diampu
  const loadKelas = useCallback(async () => {
    try {
      setLoadingKelas(true);
      setError("");

      const data = await getNilaiKelasSaya();
      setDaftarKelas(data || []);

      if (data && data.length > 0) {
        setSelectedKelasId(data[0].kelasMapelId);
      }
    } catch (err) {
      console.error("Gagal memuat kelas:", err);
      setError(err?.message || "Gagal memuat daftar kelas.");
    } finally {
      setLoadingKelas(false);
    }
  }, []);

  // 2. Ambil grid nilai & komponen berdasarkan kelas yang dipilih
  const loadGridNilai = useCallback(async (kelasMapelId) => {
    if (!kelasMapelId) return;

    try {
      setLoadingNilai(true);
      setError("");

      // Ambil data grid dan komponen secara paralel
      const [gridRes, komponenRes] = await Promise.all([
        getGridNilai(kelasMapelId),
        getKomponenNilai(kelasMapelId)
      ]);

      setGridNilai(gridRes);
      setKomponen(komponenRes?.komponen || []);
    } catch (err) {
      console.error("Gagal memuat nilai:", err);
      setError(err?.message || "Gagal memuat data nilai siswa.");
      setGridNilai(null);
      setKomponen([]);
    } finally {
      setLoadingNilai(false);
    }
  }, []);

  // 3. Efek saat pertama kali dimuat & saat kelas berubah
  useEffect(() => {
    const timer = setTimeout(() => {
      loadKelas();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadKelas]);

  useEffect(() => {
    if (selectedKelasId) {
      const timer = setTimeout(() => {
        loadGridNilai(selectedKelasId);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedKelasId, loadGridNilai]);

  // 4. Handler Export Excel
  const handleExport = async () => {
    if (!selectedKelasId) return;

    try {
      setExporting(true);
      const kelasData = daftarKelas.find(k => k.kelasMapelId === selectedKelasId);
      
      const blob = await exportRekapNilai({ 
        kelasId: kelasData?.kelas?.id,
        kelasMapelId: selectedKelasId 
      });

      const fileName = `Rekap_Nilai_${kelasData?.kelas?.nama || 'Kelas'}_${kelasData?.mataPelajaran?.nama || 'Mapel'}.xlsx`;
      downloadRekapNilai(blob, fileName);
    } catch (err) {
      alert(err?.message || "Gagal mengunduh file Excel.");
    } finally {
      setExporting(false);
    }
  };

  // Komponen target default jika belum dipilih manual
  const activeKomponenId =
    importKomponenId || (komponen.length > 0 ? komponen[0].id : "");

  // Handler Pilih File Excel
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setImportError("");
    setImportSuccess("");
    if (!file) {
      setImportFile(null);
      return;
    }

    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".xlsx") && !lower.endsWith(".xls")) {
      setImportError("Format file harus Excel (.xlsx atau .xls).");
      setImportFile(null);
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImportError("Ukuran file melebihi batas maksimal 5 MB.");
      setImportFile(null);
      e.target.value = "";
      return;
    }

    setImportFile(file);
  };

  // Handler Submit Import Excel
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      setImportError("Pilih file Excel terlebih dahulu.");
      return;
    }
    if (!activeKomponenId) {
      setImportError("Pilih komponen nilai target terlebih dahulu.");
      return;
    }
    if (!selectedKelasId) {
      setImportError("Kelas dan Mata Pelajaran belum dipilih.");
      return;
    }

    try {
      setIsUploading(true);
      setImportError("");
      setImportSuccess("");

      const result = await importNilaiExcel({
        file: importFile,
        kelasMapelId: selectedKelasId,
        komponenNilaiId: activeKomponenId,
      });

      const count =
        result?.data?.jumlahBerhasil ??
        result?.data?.importedCount ??
        result?.data?.jumlahBarisValid ??
        0;

      const successMsg = `${count} nilai berhasil diimport.`;
      setImportSuccess(successMsg);
      setGlobalSuccess(successMsg);
      setImportResult(result?.data || null);

      // Refresh data nilai yang sedang ditampilkan agar hasil import langsung terlihat
      await loadGridNilai(selectedKelasId);

      // Tutup modal setelah jeda singkat jika tidak ada baris yang dilewati
      if (!result?.data?.detailDilewati?.length) {
        setTimeout(() => {
          setIsImportModalOpen(false);
          setImportFile(null);
        }, 1500);
      }
    } catch (err) {
      console.error("Import nilai gagal:", err);
      setImportError(err?.message || "Gagal mengimport nilai dari Excel.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handler Download Template Excel
  const handleDownloadTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Nilai");

      worksheet.columns = [
        { header: "NISN", key: "nisn", width: 18 },
        { header: "NIS", key: "nis", width: 14 },
        { header: "Nama Siswa", key: "nama", width: 30 },
        { header: "Nilai", key: "nilai", width: 12 },
      ];

      worksheet.getRow(1).font = { bold: true };

      if (gridNilai?.siswa && gridNilai.siswa.length > 0) {
        gridNilai.siswa.forEach((s) => {
          worksheet.addRow({
            nisn: s.nisn || "",
            nis: s.nis || "",
            nama: s.namaLengkap || "",
            nilai: "",
          });
        });
      } else {
        worksheet.addRow({
          nisn: "0012345678",
          nis: "12345",
          nama: "Contoh Siswa",
          nilai: "85",
        });
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const kelasData = daftarKelas.find((k) => k.kelasMapelId === selectedKelasId);
      const targetKomponen = komponen.find((k) => k.id === activeKomponenId);
      a.download = `Template_Nilai_${kelasData?.kelas?.nama || "Kelas"}_${targetKomponen?.nama || "Komponen"}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Gagal membuat template:", err);
    }
  };

  // 5. Filter Pencarian Siswa
  const filteredSiswa = useMemo(() => {
    if (!gridNilai?.siswa) return [];

    const keyword = search.trim().toLowerCase();
    if (!keyword) return gridNilai.siswa;

    return gridNilai.siswa.filter(siswa => 
      String(siswa.namaLengkap || "").toLowerCase().includes(keyword) ||
      String(siswa.nis || "").toLowerCase().includes(keyword) ||
      String(siswa.nisn || "").toLowerCase().includes(keyword)
    );
  }, [gridNilai, search]);

  // 6. Statistik (Hitung Rata-rata & Progress)
  const statistik = useMemo(() => {
    if (!gridNilai?.siswa || !komponen.length) {
      return { total: 0, progress: 0, rataRata: 0 };
    }

    const totalSiswa = gridNilai.siswa.length;
    let siswaDenganNilai = 0;
    let totalNilaiKeseluruhan = 0;
    let jumlahNilaiTerisi = 0;

    gridNilai.siswa.forEach(siswa => {
      let hasNilai = false;
      Object.values(siswa.nilai || {}).forEach(val => {
        if (val !== null && val !== undefined) {
          hasNilai = true;
          totalNilaiKeseluruhan += Number(val);
          jumlahNilaiTerisi++;
        }
      });
      if (hasNilai) siswaDenganNilai++;
    });

    const rataRata = jumlahNilaiTerisi > 0 ? (totalNilaiKeseluruhan / jumlahNilaiTerisi) : 0;
    const progress = totalSiswa > 0 ? Math.round((siswaDenganNilai / totalSiswa) * 100) : 0;

    return { total: totalSiswa, progress, rataRata };
  }, [gridNilai, komponen]);

  const currentKelasData = daftarKelas.find(k => k.kelasMapelId === selectedKelasId);

  return (
    <div className="theme-page flex h-screen min-h-0 overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar
        role="guru"
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Body: sidebar + main sejajar */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        
        {/* Header */}
        <div className="shrink-0">
          <Header
            toggleSidebar={() => setIsCollapsed(!isCollapsed)}
            notifications={[]}
            user={{
              name: "Guru",
              email: "guru@smartschool.com",
              avatar: "GR",
            }}
          />
        </div>

        {/* Main Content Scroll Area */}
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-5 lg:p-6 xl:p-8">

            {/* Tombol Kembali & Header Halaman */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => router.push("/guru/ujian")}
                className={`theme-card ${themeNeutralBorder} theme-text-secondary mb-4 inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold ${themeNeutralHover} ${themeSmallShadow} transition-all hover:text-[var(--color-primary)] sm:text-sm`}
              >
                <ArrowLeft size={15} />
                Kembali ke Ujian
              </button>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="theme-text text-2xl font-bold sm:text-3xl">
                    Rekap Nilai Siswa
                  </h1>
                  <p className="theme-text-secondary mt-1 text-sm">
                    Pantau dan unduh rekapitulasi nilai dari komponen yang telah dibuat.
                  </p>
                </div>

                {/* Tombol Aksi Excel (Import & Export) */}
                {selectedKelasId && (
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsImportModalOpen(true);
                        setImportError("");
                        setImportSuccess("");
                        setImportResult(null);
                        setImportFile(null);
                        if (komponen.length > 0 && !importKomponenId) {
                          setImportKomponenId(komponen[0].id);
                        }
                      }}
                      disabled={loadingNilai || komponen.length === 0}
                      className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} theme-text inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <Upload size={16} className="text-[var(--color-primary)]" />
                      Import Excel
                    </button>

                    <button
                      type="button"
                      onClick={handleExport}
                      disabled={exporting || loadingNilai}
                      className={`${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      {exporting ? "Mengunduh..." : "Export Excel"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {globalSuccess && (
              <div className={`mb-5 flex items-start justify-between gap-3 rounded-xl border p-4 ${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Berhasil</p>
                    <p className="mt-1 text-sm opacity-90">{globalSuccess}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGlobalSuccess("")}
                  className="rounded-lg p-1 hover:bg-black/5"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {error && (
              <div className={`mb-5 flex items-start gap-3 rounded-xl border p-4 ${themeDangerSurface} ${themeDangerBorder} theme-danger`}>
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Terjadi Kesalahan</p>
                  <p className="mt-1 text-sm opacity-80">{error}</p>
                </div>
              </div>
            )}

            {/* Panel Pilihan Kelas */}
            <div className={`theme-card mb-6 rounded-2xl border ${themeNeutralBorder} ${themeCardShadow} p-5`}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}>
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h2 className="theme-text font-bold">Pilih Kelas & Mapel</h2>
                    <p className="theme-text-secondary text-xs">Pilih data yang ingin dilihat</p>
                  </div>
                </div>

                <div className="relative flex-1 sm:max-w-md sm:ml-auto">
                  <select
                    value={selectedKelasId}
                    onChange={(e) => setSelectedKelasId(e.target.value)}
                    disabled={loadingKelas || daftarKelas.length === 0}
                    className={`theme-input w-full appearance-none rounded-xl border px-4 py-3 pr-10 text-sm font-semibold outline-none transition ${themeFocus} disabled:opacity-60`}
                  >
                    {loadingKelas ? (
                      <option value="">Memuat kelas...</option>
                    ) : daftarKelas.length === 0 ? (
                      <option value="">Belum ada kelas</option>
                    ) : (
                      daftarKelas.map((item) => (
                        <option key={item.kelasMapelId} value={item.kelasMapelId}>
                          {item.kelas?.nama || "Kelas"} — {item.mataPelajaran?.nama || "Mapel"}
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown className="theme-text-muted pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Area Konten (Stat & Tabel) */}
            {loadingNilai ? (
              <div className={`theme-card flex flex-col items-center justify-center rounded-2xl border py-20 ${themeNeutralBorder} ${themeCardShadow}`}>
                <Loader2 size={32} className={`animate-spin ${themePrimaryText}`} />
                <p className="theme-text-secondary mt-4 font-medium">Memuat data nilai...</p>
              </div>
            ) : !gridNilai ? (
              <div className={`theme-card rounded-2xl border border-dashed py-16 text-center ${themeNeutralBorder}`}>
                <FileText size={40} className="theme-text-muted mx-auto mb-4" />
                <h3 className="theme-text font-bold text-lg">Data tidak ditemukan</h3>
                <p className="theme-text-secondary mt-1 text-sm">Pilih kelas untuk melihat data nilai.</p>
              </div>
            ) : (
              <>
                {/* 6 Stat Cards (Responsive 2xl:grid-cols-6) */}
                <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
                  <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl border p-4`}>
                    <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">Total Siswa</p>
                    <p className="theme-text mt-1 text-2xl font-bold">{statistik.total}</p>
                  </div>
                  <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl border p-4`}>
                    <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">Progres Input</p>
                    <p className={`mt-1 text-2xl font-bold ${themePrimaryText}`}>{statistik.progress}%</p>
                  </div>
                  <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl border p-4`}>
                    <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">Rata-rata Nilai</p>
                    <p className={`mt-1 text-2xl font-bold ${statistik.rataRata >= 75 ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"}`}>
                      {statistik.rataRata.toFixed(1)}
                    </p>
                  </div>
                  <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl border p-4`}>
                    <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">Total Komponen</p>
                    <p className="theme-text mt-1 text-2xl font-bold">{komponen.length}</p>
                  </div>
                  <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl border p-4`}>
                    <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">Status Nilai</p>
                    <p className={`mt-1 text-sm font-bold uppercase ${gridNilai.status === 'final' ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                      {gridNilai.status || "Draft"}
                    </p>
                  </div>
                  <div className={`theme-card ${themeNeutralBorder} ${themeSmallShadow} rounded-xl border p-4`}>
                    <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wide">Mapel</p>
                    <p className="theme-text mt-1 text-sm font-bold truncate">
                      {currentKelasData?.mataPelajaran?.nama || "-"}
                    </p>
                  </div>
                </div>

                {/* Tabel Grid Nilai */}
                <div className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}>
                  <div className={`border-b ${themeDivider} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet size={20} className={themePrimaryText} />
                      <h3 className="theme-text font-bold">Tabel Nilai Siswa</h3>
                    </div>
                    
                    <div className="relative w-full sm:w-64">
                      <Search size={16} className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari nama / NIS..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={`theme-input w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none ${themeFocus}`}
                      />
                    </div>
                  </div>

                  {/* Wrapper overflow-x-auto agar responsif di HP */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left border-collapse">
                      <thead>
                        <tr className={`${themeNeutralSurface} border-b ${themeDivider}`}>
                          <th className={`px-4 py-3 text-xs font-bold uppercase ${themeTextMuted} w-12 text-center`}>No</th>
                          <th className={`px-4 py-3 text-xs font-bold uppercase ${themeTextMuted} min-w-[200px]`}>Nama Siswa</th>
                          
                          {/* Render Header Komponen Dinamis */}
                          {komponen.map((k) => (
                            <th key={k.id} className={`px-4 py-3 text-xs font-bold uppercase ${themeTextMuted} text-center min-w-[120px]`}>
                              {k.nama}
                              <span className="block text-[10px] font-normal opacity-70">Bobot: {k.bobot}%</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSiswa.length === 0 ? (
                          <tr>
                            <td colSpan={komponen.length + 2} className="px-4 py-10 text-center theme-text-muted">
                              Tidak ada data siswa yang sesuai.
                            </td>
                          </tr>
                        ) : (
                          filteredSiswa.map((siswa, idx) => (
                            <tr key={siswa.penggunaId} className={`border-b ${themeDivider} ${themeNeutralHover} transition-colors`}>
                              <td className={`px-4 py-3 text-center ${themeTextSecondary} text-sm`}>{idx + 1}</td>
                              <td className="px-4 py-3">
                                <p className="theme-text font-semibold text-sm">{siswa.namaLengkap}</p>
                                <p className="theme-text-muted text-xs">
                                  NIS: {siswa.nis || "-"} | NISN: {siswa.nisn || "-"}
                                </p>
                              </td>
                              
                              {/* Render Nilai per Komponen */}
                              {komponen.map((k) => {
                                const nilaiSiswa = siswa.nilai?.[k.id];
                                const isFilled = nilaiSiswa !== null && nilaiSiswa !== undefined;

                                return (
                                  <td key={k.id} className="px-4 py-3 text-center">
                                    {isFilled ? (
                                      <span className={`inline-flex h-8 w-12 items-center justify-center rounded-lg font-bold text-sm ${
                                        Number(nilaiSiswa) >= 75 
                                          ? `${themeSuccessSurface} text-[var(--color-success)]`
                                          : `${themeWarningSurface} text-[var(--color-warning)]`
                                      }`}>
                                        {Number(nilaiSiswa)}
                                      </span>
                                    ) : (
                                      <span className="theme-text-muted text-sm">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Footer Tabel */}
                  <div className={`p-4 border-t ${themeDivider} ${themeNeutralSurface} text-xs ${themeTextMuted} text-center sm:text-left`}>
                    Menampilkan {filteredSiswa.length} dari {gridNilai.siswa.length} siswa.
                  </div>
                </div>
              </>
            )}

          </div>
        </main>
      </div>

      {/* Modal Dialog Import Excel */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className={`theme-card ${themeNeutralBorder} ${themeCardShadow} w-full max-w-lg rounded-2xl border p-6 shadow-2xl`}>
            <div className={`flex items-center justify-between border-b ${themeDivider} pb-4`}>
              <div className="flex items-center gap-2.5">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}>
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h3 className="theme-text text-base font-bold">Import Nilai dari Excel</h3>
                  <p className="theme-text-secondary text-xs">Unggah file .xlsx untuk input nilai masal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isUploading) setIsImportModalOpen(false);
                }}
                disabled={isUploading}
                className="theme-text-muted rounded-lg p-1.5 transition hover:bg-black/5 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="mt-5 space-y-4">
              {importError && (
                <div className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs ${themeDangerSurface} ${themeDangerBorder} theme-danger`}>
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p className="flex-1 font-medium">{importError}</p>
                </div>
              )}

              {importSuccess && (
                <div className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-xs ${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`}>
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold">{importSuccess}</p>
                    {importResult?.detailDilewati?.length > 0 && (
                      <p className="mt-1 opacity-80">
                        {importResult.detailDilewati.length} baris dilewati (NISN/NIS tidak cocok).
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="theme-text mb-1.5 block text-xs font-bold">
                  Komponen Nilai Target <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={activeKomponenId}
                    onChange={(e) => setImportKomponenId(e.target.value)}
                    disabled={isUploading || komponen.length === 0}
                    className={`theme-input w-full appearance-none rounded-xl border px-3.5 py-2.5 pr-10 text-sm font-medium outline-none transition ${themeFocus} disabled:opacity-60`}
                  >
                    {komponen.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama} (Bobot: {k.bobot}%)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="theme-text-muted pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2" />
                </div>
                <p className="theme-text-muted mt-1 text-[11px]">
                  Nilai dari Excel akan disimpan ke komponen penilaian ini.
                </p>
              </div>

              <div>
                <label className="theme-text mb-1.5 block text-xs font-bold">
                  Pilih File Excel (.xlsx / .xls) <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="theme-input block w-full rounded-xl border px-3 py-2 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="theme-text-muted mt-1 text-[11px]">
                  Maksimal 5 MB. Kolom header wajib: <strong>NISN</strong> atau <strong>NIS</strong>, dan <strong>Nilai</strong>.
                </p>
              </div>

              {/* Template Download Helper */}
              <div className={`rounded-xl border border-dashed ${themeNeutralBorder} ${themeNeutralSurface} p-3.5 text-xs theme-text-secondary`}>
                <div className="flex items-center justify-between">
                  <span>Belum punya format Excel?</span>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    disabled={isUploading}
                    className="font-bold text-[var(--color-primary)] hover:underline disabled:opacity-50"
                  >
                    Unduh Template Siswa
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  disabled={isUploading}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold theme-text-secondary hover:bg-black/5 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !importFile || !activeKomponenId}
                  className={`${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow} inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Mengunggah & Memproses...
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      Mulai Import
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}