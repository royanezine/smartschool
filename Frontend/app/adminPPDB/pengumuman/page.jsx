"use client";

import { useState, useMemo } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import {
  ChevronRight,
  Search,
  X,
  Plus,
  Megaphone,
  Eye,
  Pencil,
  Send,
  Archive,
  Trash2,
  Calendar,
  FileText,
  Paperclip,
  Printer,
  Download,
  CheckCircle2,
  Clock3,
  School,
  Layers,
} from "lucide-react";

// ================= DATA AWAL =================

const TAHUN_AJARAN_AKTIF = "2026/2027";
const NAMA_SEKOLAH = "SMK SmartSchool";
const ALAMAT_SEKOLAH = "Jl. Pendidikan No. 17, Kota Bandung, Jawa Barat";

const JURUSAN_LIST = ["RPL", "TKJ", "Multimedia", "Akuntansi"];

const GELOMBANG_LIST = ["Gelombang 1", "Gelombang 2"];
const JALUR_LIST = ["Reguler", "Prestasi", "Afirmasi"];

const initialPengumuman = [
  {
    id: 1,
    judul: "Pengumuman Hasil Seleksi PPDB Gelombang 1",
    tahunAjaran: "2026/2027",
    gelombang: "Gelombang 1",
    jalur: "Reguler",
    status: "Dipublikasikan",
    tanggalDibuat: "2026-06-10",
    tanggalPublikasi: "2026-06-12",
    dibuatOleh: "Admin PPDB",
    lampiran: "SK-Hasil-Seleksi-Gel1.pdf",
    konten:
      "Sehubungan dengan telah selesainya proses seleksi Penerimaan Peserta Didik Baru (PPDB) Gelombang 1 Tahun Ajaran 2026/2027, dengan ini kami umumkan bahwa peserta yang dinyatakan LULUS, CADANGAN, dan TIDAK LULUS dapat dilihat pada rincian di bawah ini.\n\nBagi peserta yang dinyatakan LULUS, diwajibkan melakukan daftar ulang paling lambat 5 (lima) hari kerja setelah tanggal pengumuman ini diterbitkan. Kelalaian melakukan daftar ulang pada batas waktu yang ditentukan dapat mengakibatkan pengunduran status kelulusan dan digantikan oleh peserta cadangan sesuai urutan ranking.\n\nBagi peserta yang dinyatakan CADANGAN, dimohon untuk tetap memantau informasi lebih lanjut melalui laman resmi maupun kontak panitia PPDB.",
    ringkasan: {
      RPL: { lulus: 3, cadangan: 1, tidakLulus: 2 },
      TKJ: { lulus: 3, cadangan: 1, tidakLulus: 1 },
      Multimedia: { lulus: 2, cadangan: 1, tidakLulus: 1 },
      Akuntansi: { lulus: 2, cadangan: 1, tidakLulus: 1 },
    },
  },
  {
    id: 2,
    judul: "Jadwal Daftar Ulang Peserta Lulus Gelombang 1",
    tahunAjaran: "2026/2027",
    gelombang: "Gelombang 1",
    jalur: "Reguler",
    status: "Dipublikasikan",
    tanggalDibuat: "2026-06-13",
    tanggalPublikasi: "2026-06-13",
    dibuatOleh: "Admin PPDB",
    lampiran: null,
    konten:
      "Menindaklanjuti pengumuman hasil seleksi PPDB Gelombang 1, berikut kami sampaikan jadwal daftar ulang bagi peserta yang dinyatakan LULUS. Daftar ulang dilaksanakan mulai 15 Juni 2026 sampai dengan 19 Juni 2026 bertempat di ruang Tata Usaha sekolah pada jam kerja.\n\nBerkas yang perlu dibawa saat daftar ulang akan diinformasikan menyusul melalui grup resmi wali peserta didik.",
    ringkasan: null,
  },
  {
    id: 3,
    judul: "Pengumuman Hasil Seleksi PPDB Gelombang 2 (Jalur Prestasi)",
    tahunAjaran: "2026/2027",
    gelombang: "Gelombang 2",
    jalur: "Prestasi",
    status: "Draft",
    tanggalDibuat: "2026-08-20",
    tanggalPublikasi: null,
    dibuatOleh: "Admin PPDB",
    lampiran: null,
    konten:
      "Draf pengumuman hasil seleksi PPDB Gelombang 2 jalur prestasi. Dokumen ini masih dalam proses verifikasi data oleh panitia dan belum dapat dipublikasikan kepada peserta.",
    ringkasan: {
      RPL: { lulus: 2, cadangan: 1, tidakLulus: 0 },
      TKJ: { lulus: 1, cadangan: 1, tidakLulus: 0 },
      Multimedia: { lulus: 1, cadangan: 0, tidakLulus: 0 },
      Akuntansi: { lulus: 1, cadangan: 1, tidakLulus: 0 },
    },
  },
];

const STATUS_STYLES = {
  Dipublikasikan: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Draft: "bg-slate-100 text-slate-500 border-slate-200",
};

const STATUS_ICON = {
  Dipublikasikan: CheckCircle2,
  Draft: Clock3,
};

const GELOMBANG_FILTER_OPTIONS = ["Semua Gelombang", ...GELOMBANG_LIST];
const STATUS_FILTER_OPTIONS = ["Semua Status", "Dipublikasikan", "Draft"];

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const HARI_INI_ISO = "2026-08-26";

function formatTanggal(iso) {
  if (!iso) return "-";
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

const emptyForm = {
  judul: "",
  tahunAjaran: TAHUN_AJARAN_AKTIF,
  gelombang: GELOMBANG_LIST[0],
  jalur: JALUR_LIST[0],
  konten: "",
  lampiran: "",
};

export default function PengumumanPPDBPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pengumumanList, setPengumumanList] = useState(initialPengumuman);

  const [search, setSearch] = useState("");
  const [filterGelombang, setFilterGelombang] = useState("Semua Gelombang");
  const [filterStatus, setFilterStatus] = useState("Semua Status");

  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [previewTarget, setPreviewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  // ================= FILTER =================

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pengumumanList
      .filter((p) => {
        const matchSearch = !q || p.judul.toLowerCase().includes(q);
        const matchGelombang =
          filterGelombang === "Semua Gelombang" || p.gelombang === filterGelombang;
        const matchStatus = filterStatus === "Semua Status" || p.status === filterStatus;
        return matchSearch && matchGelombang && matchStatus;
      })
      .sort((a, b) => new Date(b.tanggalDibuat) - new Date(a.tanggalDibuat));
  }, [pengumumanList, search, filterGelombang, filterStatus]);

  const activeFilterCount =
    (filterGelombang !== "Semua Gelombang" ? 1 : 0) +
    (filterStatus !== "Semua Status" ? 1 : 0) +
    (search ? 1 : 0);

  const resetFilters = () => {
    setSearch("");
    setFilterGelombang("Semua Gelombang");
    setFilterStatus("Semua Status");
  };

  // ================= RINGKASAN =================

  const ringkasanAtas = useMemo(() => {
    const total = pengumumanList.length;
    const dipublikasikan = pengumumanList.filter((p) => p.status === "Dipublikasikan").length;
    const draft = pengumumanList.filter((p) => p.status === "Draft").length;
    const tanggalTerakhir = pengumumanList
      .filter((p) => p.tanggalPublikasi)
      .map((p) => p.tanggalPublikasi)
      .sort((a, b) => new Date(b) - new Date(a))[0];
    return { total, dipublikasikan, draft, tanggalTerakhir };
  }, [pengumumanList]);

  // ================= EDITOR (BUAT / EDIT) =================

  const openCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowEditor(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      judul: item.judul,
      tahunAjaran: item.tahunAjaran,
      gelombang: item.gelombang,
      jalur: item.jalur,
      konten: item.konten,
      lampiran: item.lampiran ?? "",
    });
    setShowEditor(true);
  };

  const closeEditor = () => {
    setShowEditor(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleSimpan = (publish) => {
    if (!formData.judul.trim()) return;

    if (editingId) {
      setPengumumanList((prev) =>
        prev.map((p) => {
          if (p.id !== editingId) return p;
          const statusBaru = publish ? "Dipublikasikan" : p.status;
          return {
            ...p,
            ...formData,
            lampiran: formData.lampiran.trim() || null,
            status: statusBaru,
            tanggalPublikasi:
              statusBaru === "Dipublikasikan" ? p.tanggalPublikasi ?? HARI_INI_ISO : p.tanggalPublikasi,
          };
        })
      );
    } else {
      const baru = {
        id: Date.now(),
        ...formData,
        lampiran: formData.lampiran.trim() || null,
        status: publish ? "Dipublikasikan" : "Draft",
        tanggalDibuat: HARI_INI_ISO,
        tanggalPublikasi: publish ? HARI_INI_ISO : null,
        dibuatOleh: "Admin PPDB",
        ringkasan: null,
      };
      setPengumumanList((prev) => [baru, ...prev]);
    }
    closeEditor();
  };

  // ================= AKSI STATUS & HAPUS =================

  const togglePublish = (item) => {
    setPengumumanList((prev) =>
      prev.map((p) => {
        if (p.id !== item.id) return p;
        if (p.status === "Dipublikasikan") {
          return { ...p, status: "Draft" };
        }
        return { ...p, status: "Dipublikasikan", tanggalPublikasi: p.tanggalPublikasi ?? HARI_INI_ISO };
      })
    );
    setPreviewTarget((prev) =>
      prev && prev.id === item.id
        ? {
            ...prev,
            status: prev.status === "Dipublikasikan" ? "Draft" : "Dipublikasikan",
            tanggalPublikasi: prev.tanggalPublikasi ?? HARI_INI_ISO,
          }
        : prev
    );
  };

  const handleHapus = () => {
    setPengumumanList((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="flex h-screen w-full bg-[#EEF0F2] overflow-hidden">
      <Sidebar
        role="adminPPDB"
        active="pengumuman"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{ name: "Admin PPDB", email: "adminppdb@smartschool.com", avatar: "PP" }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 md:p-6 lg:p-8">
            <div className="w-full space-y-5 max-w-[1320px] mx-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>PPDB</span>
                <ChevronRight size={12} />
                <span className="text-slate-600 font-medium">Pengumuman</span>
              </div>

              {/* ===== KARTU RINGKASAN ===== */}
              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">Total Pengumuman</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">{ringkasanAtas.total}</p>
                </div>
                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">Dipublikasikan</p>
                  <p className="text-2xl font-bold text-emerald-500 mt-2">{ringkasanAtas.dipublikasikan}</p>
                </div>
                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">Draft</p>
                  <p className="text-2xl font-bold text-slate-500 mt-2">{ringkasanAtas.draft}</p>
                </div>
                <div className="bg-[#F6F7F8] rounded-xl p-5">
                  <p className="text-xs text-slate-400">Publikasi Terakhir</p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    {formatTanggal(ringkasanAtas.tanggalTerakhir)}
                  </p>
                </div>
              </section>

              {/* ===== TOOLBAR ===== */}
              <section className="bg-white rounded-xl overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500 border border-slate-200 rounded-md px-3 py-2 flex-1 min-w-[200px]">
                    <Search size={13} className="text-slate-400 flex-shrink-0" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Cari judul pengumuman..."
                      className="outline-none bg-transparent placeholder:text-slate-400 w-full"
                    />
                  </div>

                  <select
                    value={filterGelombang}
                    onChange={(e) => setFilterGelombang(e.target.value)}
                    className="text-xs text-slate-600 border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400 bg-white"
                  >
                    {GELOMBANG_FILTER_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-xs text-slate-600 border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400 bg-white"
                  >
                    {STATUS_FILTER_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X size={12} />
                      Reset ({activeFilterCount})
                    </button>
                  )}

                  <button
                    onClick={openCreate}
                    className="flex items-center gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors ml-auto"
                  >
                    <Plus size={13} />
                    Buat Pengumuman
                  </button>
                </div>

                {/* ===== DAFTAR PENGUMUMAN ===== */}
                <div className="divide-y divide-slate-50">
                  {filtered.length === 0 && (
                    <div className="px-5 py-14 text-center">
                      <Megaphone size={22} className="text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">
                        Belum ada pengumuman yang cocok dengan pencarian/filter.
                      </p>
                    </div>
                  )}

                  {filtered.map((p) => {
                    const StatusIcon = STATUS_ICON[p.status];
                    return (
                      <div key={p.id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Megaphone size={16} className="text-blue-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{p.judul}</p>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[11px] text-slate-400">
                                <span className="flex items-center gap-1">
                                  <School size={11} />
                                  T.A. {p.tahunAjaran}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Layers size={11} />
                                  {p.gelombang} &middot; {p.jalur}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar size={11} />
                                  {p.status === "Dipublikasikan"
                                    ? `Dipublikasikan ${formatTanggal(p.tanggalPublikasi)}`
                                    : `Dibuat ${formatTanggal(p.tanggalDibuat)}`}
                                </span>
                                {p.lampiran && (
                                  <span className="flex items-center gap-1 text-slate-400">
                                    <Paperclip size={11} />
                                    {p.lampiran}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                                {p.konten}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`flex-shrink-0 inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[p.status]}`}
                          >
                            <StatusIcon size={11} />
                            {p.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-end gap-1 mt-3">
                          <button
                            onClick={() => setPreviewTarget(p)}
                            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:bg-slate-100 px-2.5 py-1.5 rounded-md transition-colors"
                          >
                            <Eye size={13} />
                            Preview
                          </button>
                          <button
                            onClick={() => openEdit(p)}
                            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-md transition-colors"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            onClick={() => togglePublish(p)}
                            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${
                              p.status === "Dipublikasikan"
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {p.status === "Dipublikasikan" ? (
                              <>
                                <Archive size={13} />
                                Jadikan Draft
                              </>
                            ) : (
                              <>
                                <Send size={13} />
                                Publikasikan
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-rose-500 hover:bg-rose-50 px-2.5 py-1.5 rounded-md transition-colors"
                          >
                            <Trash2 size={13} />
                            Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <footer className="text-center text-[11px] text-slate-400 py-3">
                © 2026 SmartSchool &middot; Dashboard Admin PPDB &middot; All rights reserved
              </footer>
            </div>
          </div>
        </main>
      </div>

      {/* ===== MODAL EDITOR (BUAT / EDIT) ===== */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-slate-800">
                {editingId ? "Edit Pengumuman" : "Buat Pengumuman Baru"}
              </h3>
              <button onClick={closeEditor} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-slate-400">Judul Pengumuman</label>
                <input
                  value={formData.judul}
                  onChange={(e) => setFormData((f) => ({ ...f, judul: e.target.value }))}
                  placeholder="Contoh: Pengumuman Hasil Seleksi PPDB Gelombang 1"
                  className="mt-1 w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400">Tahun Ajaran</label>
                  <input
                    value={formData.tahunAjaran}
                    onChange={(e) => setFormData((f) => ({ ...f, tahunAjaran: e.target.value }))}
                    className="mt-1 w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Gelombang</label>
                  <select
                    value={formData.gelombang}
                    onChange={(e) => setFormData((f) => ({ ...f, gelombang: e.target.value }))}
                    className="mt-1 w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400 bg-white"
                  >
                    {GELOMBANG_LIST.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Jalur</label>
                  <select
                    value={formData.jalur}
                    onChange={(e) => setFormData((f) => ({ ...f, jalur: e.target.value }))}
                    className="mt-1 w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400 bg-white"
                  >
                    {JALUR_LIST.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Isi Pengumuman</label>
                <textarea
                  value={formData.konten}
                  onChange={(e) => setFormData((f) => ({ ...f, konten: e.target.value }))}
                  rows={7}
                  placeholder="Tuliskan isi pengumuman secara lengkap di sini..."
                  className="mt-1 w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Lampiran (opsional)</label>
                <div className="flex items-center gap-2 mt-1 border border-slate-200 rounded-md px-3 py-2">
                  <Paperclip size={13} className="text-slate-400 flex-shrink-0" />
                  <input
                    value={formData.lampiran}
                    onChange={(e) => setFormData((f) => ({ ...f, lampiran: e.target.value }))}
                    placeholder="nama-file-lampiran.pdf"
                    className="text-sm outline-none bg-transparent w-full placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-5 mt-5 border-t border-slate-100">
              <button
                onClick={closeEditor}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 px-4 py-2"
              >
                Batal
              </button>
              <button
                onClick={() => handleSimpan(false)}
                disabled={!formData.judul.trim()}
                className="flex items-center gap-1.5 text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FileText size={13} />
                Simpan sebagai Draft
              </button>
              <button
                onClick={() => handleSimpan(true)}
                disabled={!formData.judul.trim()}
                className="flex items-center gap-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={13} />
                Simpan &amp; Publikasikan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL PREVIEW (TAMPILAN RESMI) ===== */}
      {previewTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[previewTarget.status]}`}
                >
                  {previewTarget.status}
                </span>
                <span className="text-xs text-slate-400">Pratinjau Pengumuman</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:bg-slate-100 px-2.5 py-1.5 rounded-md transition-colors"
                >
                  <Printer size={13} />
                  Cetak
                </button>
                <button
                  className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:bg-slate-100 px-2.5 py-1.5 rounded-md transition-colors"
                >
                  <Download size={13} />
                  Unduh PDF
                </button>
                <button
                  onClick={() => setPreviewTarget(null)}
                  className="text-slate-400 hover:text-slate-600 ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Kop Surat */}
              <div className="text-center border-b-4 border-double border-slate-700 pb-4 mb-6">
                <p className="text-base font-bold text-slate-800 tracking-wide">{NAMA_SEKOLAH}</p>
                <p className="text-xs text-slate-500 mt-0.5">{ALAMAT_SEKOLAH}</p>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Pengumuman Hasil Seleksi
                </p>
                <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Penerimaan Peserta Didik Baru (PPDB)
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Nomor: 421.7/{String(previewTarget.id).padStart(3, "0")}/PPDB/2026
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-5 bg-slate-50 rounded-lg p-4">
                <p><span className="text-slate-400">Judul</span><br /><span className="text-slate-700 font-medium">{previewTarget.judul}</span></p>
                <p><span className="text-slate-400">Tahun Ajaran</span><br /><span className="text-slate-700 font-medium">{previewTarget.tahunAjaran}</span></p>
                <p><span className="text-slate-400">Gelombang / Jalur</span><br /><span className="text-slate-700 font-medium">{previewTarget.gelombang} &middot; {previewTarget.jalur}</span></p>
                <p><span className="text-slate-400">Tanggal Publikasi</span><br /><span className="text-slate-700 font-medium">{formatTanggal(previewTarget.tanggalPublikasi)}</span></p>
              </div>

              <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-6">
                {previewTarget.konten}
              </div>

              {previewTarget.ringkasan && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Rekapitulasi Hasil Seleksi per Jurusan</p>
                  <table className="w-full text-xs border border-slate-100 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500">
                        <th className="text-left font-medium px-3 py-2">Jurusan</th>
                        <th className="text-center font-medium px-3 py-2">Lulus</th>
                        <th className="text-center font-medium px-3 py-2">Cadangan</th>
                        <th className="text-center font-medium px-3 py-2">Tidak Lulus</th>
                        <th className="text-center font-medium px-3 py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {JURUSAN_LIST.map((j) => {
                        const r = previewTarget.ringkasan[j] ?? { lulus: 0, cadangan: 0, tidakLulus: 0 };
                        const total = r.lulus + r.cadangan + r.tidakLulus;
                        return (
                          <tr key={j} className="border-t border-slate-100">
                            <td className="px-3 py-2 text-slate-700 font-medium">{j}</td>
                            <td className="px-3 py-2 text-center text-emerald-600">{r.lulus}</td>
                            <td className="px-3 py-2 text-center text-amber-600">{r.cadangan}</td>
                            <td className="px-3 py-2 text-center text-rose-500">{r.tidakLulus}</td>
                            <td className="px-3 py-2 text-center text-slate-500">{total}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {previewTarget.lampiran && (
                <div className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-md px-3 py-2 mb-6 w-fit">
                  <Paperclip size={13} />
                  {previewTarget.lampiran}
                </div>
              )}

              <div className="flex justify-end">
                <div className="text-center text-xs text-slate-500 w-48">
                  <p>Bandung, {formatTanggal(previewTarget.tanggalPublikasi ?? previewTarget.tanggalDibuat)}</p>
                  <p className="mt-1">Kepala Sekolah</p>
                  <div className="h-16" />
                  <p className="font-medium text-slate-700 border-t border-slate-300 pt-1">
                    Nama Kepala Sekolah
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => togglePublish(previewTarget)}
                className={`flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-md transition-colors ${
                  previewTarget.status === "Dipublikasikan"
                    ? "border border-amber-200 text-amber-600 hover:bg-amber-50"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {previewTarget.status === "Dipublikasikan" ? (
                  <>
                    <Archive size={13} />
                    Jadikan Draft
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    Publikasikan Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL KONFIRMASI HAPUS ===== */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center mb-3">
              <Trash2 size={17} className="text-rose-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">Hapus pengumuman ini?</h3>
            <p className="text-xs text-slate-500 mt-1.5">
              &ldquo;{deleteTarget.judul}&rdquo; akan dihapus permanen dan tidak dapat dikembalikan.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 px-4 py-2"
              >
                Batal
              </button>
              <button
                onClick={handleHapus}
                className="flex items-center gap-1.5 text-xs font-medium bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                <Trash2 size={13} />
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}