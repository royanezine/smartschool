"use client"; // <--- PENTING! Agar bisa menggunakan state

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  X, 
  ArrowLeft,
  Users,
  Table as TableIcon,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function ImporSiswaPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // State untuk File & Preview Data
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Simulasi Data Preview (Mockup, nanti diganti dengan parser CSV/Excel asli)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Simulasi data hasil parsing (nanti akan dari library seperti xlsx atau papaparse)
      setPreviewData([
        { nis: "20241001", nama: "Ahmad Fauzi", email: "ahmad@sekolah.id", kelas: "XII IPA 1" },
        { nis: "20241002", nama: "Budi Santoso", email: "budi@sekolah.id", kelas: "XII IPA 1" },
        { nis: "20241003", nama: "Citra Dewi", email: "citra@sekolah.id", kelas: "XII IPS 2" },
        { nis: "20241004", nama: "Dedi Kurniawan", email: "dedi@sekolah.id", kelas: "XII IPA 1" },
        { nis: "20241005", nama: "Eka Putri", email: "eka@sekolah.id", kelas: "XII IPS 2" },
      ]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreviewData([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulasi proses insert ke pengguna & siswa_kelas
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 4000); // Hilang setelah 4 detik
    }, 2000);
  };

  const downloadTemplate = () => {
    // Simulasi download file template
    alert("Mendownload Template Excel/CSV... (Mockup)");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* 1. BREADCRUMB & BACK */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <nav className="flex text-sm font-medium text-gray-500 tracking-wide">
            <ol className="inline-flex items-center space-x-2 md:space-x-3">
              <li><a href="/admin" className="hover:text-indigo-600">Dashboard</a></li>
              <li className="text-gray-300">/</li>
              <li><a href="/admin/siswa" className="hover:text-indigo-600">Manajemen Siswa</a></li>
              <li className="text-gray-300">/</li>
              <li className="text-indigo-600 font-semibold">Impor Data</li>
            </ol>
          </nav>
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>
        </div>

        {/* 2. HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100">
              <UploadCloud className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">Impor Data Siswa</h1>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Upload file Excel (.xlsx) atau CSV untuk menambahkan siswa baru secara massal ke dalam sistem.
              </p>
            </div>
          </div>
          <button 
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <Download className="w-4 h-4" /> Download Template
          </button>
        </div>

        {/* 3. STATISTIK RINGKASAN */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Siswa", value: "1.247", icon: Users, color: "blue" },
            { label: "Kelas Aktif", value: "24", icon: TableIcon, color: "indigo" },
            { label: "Format File", value: ".xlsx / .csv", icon: FileSpreadsheet, color: "green" },
            { label: "Terakhir Impor", value: "Kemarin", icon: CheckCircle, color: "purple" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-${stat.color}-500 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${stat.color}-50 text-${stat.color}-600 rounded-lg`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg md:text-xl font-bold tracking-tight text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 4. KARTU UPLOAD & PREVIEW */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          
          {/* Bagian Upload File */}
          <div className="p-6 md:p-8 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Upload Berkas</h2>
            <p className="text-sm text-gray-500 mb-4">File harus berekstensi .xlsx, .xls, atau .csv. Kolom wajib: NIS, Nama, Email, Kelas.</p>
            
            <div className="relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center text-center
              ${file ? 'border-indigo-300 bg-indigo-50/30' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/30'}"
            >
              {file ? (
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-800 truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB • Siap diproses</p>
                    </div>
                  </div>
                  <button type="button" onClick={removeFile} className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-full transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center w-full">
                  <div className="p-5 bg-gray-100 rounded-full mb-4 hover:scale-105 transition-transform">
                    <UploadCloud className="w-10 h-10 text-indigo-600" />
                  </div>
                  <p className="text-base font-semibold text-gray-800">Klik untuk upload atau drag & drop</p>
                  <p className="text-sm text-gray-500 mt-1">Maksimal 5MB</p>
                  <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

          {/* Bagian Preview Data (Hanya muncul jika data ada) */}
          {previewData.length > 0 && (
            <div className="p-6 md:p-8 bg-slate-50/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">📋 Preview Data yang Akan Diimpor</h3>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                  {previewData.length} Data
                </span>
              </div>
              
              {/* Tabel Responsif (Scroll horizontal di mobile) */}
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">NIS</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kelas</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {previewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">{row.nis}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{row.nama}</td>
                        <td className="px-6 py-3 text-sm text-gray-500">{row.email}</td>
                        <td className="px-6 py-3 text-sm">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {row.kelas}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-gray-400">* Data di atas adalah preview. Pastikan format sudah benar sebelum menyimpan.</p>
            </div>
          )}

          {/* Footer / Action Buttons */}
          <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row gap-3 justify-end items-center">
            {isSuccess ? (
              <div className="w-full sm:w-auto flex items-center gap-3 px-6 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
                <CheckCircle className="w-5 h-5" /> Berhasil mengimpor data ke sistem!
              </div>
            ) : (
              <>
                <button type="button" onClick={() => router.back()} className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition">Batal</button>
                <button 
                  type="submit" 
                  disabled={!file || isLoading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memproses Data...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" /> Simpan & Proses
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </form>

      </div>
    </div>
  );
}