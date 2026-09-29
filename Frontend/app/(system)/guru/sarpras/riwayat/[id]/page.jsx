"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Sidebar from "../../../../../components/Sidebar";
import Header from "../../../../../components/Header";

import {
  FileText,
  Package,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Info,
  RotateCcw,
  ClipboardList,
  MessageSquare,
  Clock,
} from "lucide-react";

import { getDetailPeminjaman } from "../../../../../../services/sarpras.service";

// =========================================================
// STATUS CONFIG — solid, no gradient
// =========================================================

const hasilConfig = {
  dikembalikan: {
    label: "Dikembalikan",
    icon: CheckCircle2,
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
    dot: "bg-emerald-500",
  },
  terlambat: {
    label: "Dikembalikan Terlambat",
    icon: AlertTriangle,
    pill: "bg-amber-50 text-amber-700 border-amber-200/70",
    dot: "bg-amber-500",
  },
  ditolak: {
    label: "Ditolak",
    icon: XCircle,
    pill: "bg-red-50 text-red-700 border-red-200/70",
    dot: "bg-red-500",
  },
};

function getHasil(peminjaman) {
  if (peminjaman?.status === "ditolak") return "ditolak";
  if (peminjaman?.status === "dikembalikan") {
    const rencana = peminjaman?.tanggalKembaliRencana;
    const aktual = peminjaman?.tanggalKembaliAktual;
    if (rencana && aktual) {
      if (new Date(aktual) > new Date(rencana)) return "terlambat";
    }
    return "dikembalikan";
  }
  return null;
}

// =========================================================
// HELPERS
// =========================================================

function formatTanggal(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTanggalLengkap(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTanggalWaktu(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getKategori(peminjaman) {
  const detail = peminjaman?.detailPeminjaman?.[0];
  const aset = detail?.aset;
  if (!aset) return "Lainnya";
  const kategori =
    aset?.kategori?.nama || aset?.kategori?.namaKategori || aset?.kategoriNama;
  if (!kategori) return "Lainnya";
  const k = kategori.toLowerCase();
  if (
    k.includes("elektronik") ||
    k.includes("laptop") ||
    k.includes("proyektor") ||
    k.includes("speaker")
  )
    return "Elektronik";
  if (k.includes("ruang") || k.includes("gedung")) return "Ruangan";
  if (k.includes("olahraga") || k.includes("sport")) return "Olahraga";
  return "Lainnya";
}

function getNamaAset(peminjaman) {
  const details = peminjaman?.detailPeminjaman || [];
  if (details.length === 0) return "Aset";
  if (details.length === 1) {
    return (
      details[0]?.aset?.nama ||
      details[0]?.aset?.namaAset ||
      details[0]?.namaAset ||
      "Aset"
    );
  }
  const namaPertama =
    details[0]?.aset?.nama ||
    details[0]?.aset?.namaAset ||
    details[0]?.namaAset ||
    "Aset";
  return `${namaPertama} + ${details.length - 1} aset`;
}

function getJumlah(peminjaman) {
  const details = peminjaman?.detailPeminjaman || [];
  return details.reduce((total, item) => total + Number(item?.jumlah || 0), 0);
}

// =========================================================
// PAGE
// =========================================================

export default function DetailRiwayatPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const notifications = [
    {
      id: 1,
      title: "Riwayat Peminjaman",
      desc: "Detail riwayat peminjaman",
      read: false,
    },
  ];

  useEffect(() => {
    let mounted = true;

    async function loadDetail() {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          setError("ID riwayat tidak ditemukan.");
          return;
        }

        const response = await getDetailPeminjaman(id);
        if (!mounted) return;

        const data = response?.data || response?.data?.data || response;
        setDetail(data || null);
      } catch (err) {
        if (!mounted) return;
        console.error("Gagal mengambil detail riwayat:", err);
        setError(err?.message || "Gagal mengambil detail riwayat.");
        setDetail(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDetail();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleBack = () => router.push("/guru/sarpras/riwayat");

  const hasil = detail ? getHasil(detail) : null;
  const cfg = hasil ? hasilConfig[hasil] : null;
  const StatusIcon = cfg?.icon;
  const totalUnit = detail ? getJumlah(detail) : 0;

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-5">

            {/* BACK */}
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#1E3A5F] hover:text-[#0F172A] transition-colors"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-[#60A5FA]/30 hover:border-[#2563EB] transition-colors">
                <ArrowLeft size={14} />
              </span>
              Kembali ke Riwayat
            </button>

            {/* LOADING */}
            {loading && (
              <div className="bg-white border border-[#60A5FA]/20 rounded-xl py-16 flex flex-col items-center justify-center">
                <Loader2 size={24} className="animate-spin text-[#2563EB]" />
                <p className="text-sm text-slate-500 mt-3">
                  Memuat detail riwayat...
                </p>
              </div>
            )}

            {/* ERROR */}
            {!loading && error && (
              <div className="bg-white border border-[#60A5FA]/20 rounded-xl p-6">
                <div className="flex items-start gap-3 bg-red-50/70 border border-red-200/70 rounded-lg p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-500 border border-red-100 flex-shrink-0">
                    <AlertTriangle size={15} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-800">
                      Gagal memuat detail
                    </p>
                    <p className="text-xs text-red-700/80 mt-1">{error}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-5 h-10 px-4 text-sm font-semibold rounded-lg bg-[#0F172A] text-white hover:bg-[#1E3A5F] transition-colors"
                >
                  Kembali ke Riwayat
                </button>
              </div>
            )}

            {/* NOT FOUND */}
            {!loading && !error && !detail && (
              <div className="bg-white border border-dashed border-[#60A5FA]/40 rounded-xl text-center py-16">
                <div className="mx-auto w-12 h-12 rounded-lg bg-[#F8FAFC] flex items-center justify-center border border-[#60A5FA]/20">
                  <FileText size={20} className="text-[#2563EB]" />
                </div>
                <p className="text-sm font-bold text-[#0F172A] mt-4">
                  Detail tidak ditemukan
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Data riwayat tidak tersedia atau sudah dihapus.
                </p>
                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-5 inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold rounded-lg bg-[#0F172A] text-white hover:bg-[#1E3A5F] transition-colors"
                >
                  Kembali ke Riwayat
                </button>
              </div>
            )}

            {/* DETAIL CONTENT */}
            {!loading && !error && detail && (
              <div className="space-y-5">

                {/* ==========================================
                    HEADER CARD — solid biru, no gradient
                ========================================== */}

                <div className="bg-[#1E3A5F] rounded-xl overflow-hidden shadow-sm">
                  <div className="flex items-stretch">
                    <div className="w-1 bg-[#60A5FA] flex-shrink-0" />

                    <div className="flex-1 p-5 sm:p-6 text-white">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                            <FileText size={18} />
                          </div>

                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#60A5FA]">
                              Riwayat Peminjaman
                            </p>
                            <h1 className="text-lg sm:text-xl font-bold mt-1 font-mono break-all">
                              {detail.nomorPeminjaman || "-"}
                            </h1>
                            <p className="text-xs text-blue-100/80 mt-1.5">
                              {formatTanggalLengkap(detail.tanggalPengajuan)}
                            </p>
                          </div>
                        </div>

                        {cfg && StatusIcon && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-[11px] font-semibold self-start flex-shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
                            {cfg.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* QUICK STATS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard
                    icon={<CalendarDays size={15} />}
                    label="Tanggal Pinjam"
                    value={formatTanggal(detail.tanggalPinjam)}
                  />
                  <StatCard
                    icon={<CalendarDays size={15} />}
                    label="Rencana Kembali"
                    value={formatTanggal(detail.tanggalKembaliRencana)}
                  />
                  <StatCard
                    icon={<RotateCcw size={15} />}
                    label="Aktual Kembali"
                    value={formatTanggal(detail.tanggalKembaliAktual)}
                  />
                  <StatCard
                    icon={<Package size={15} />}
                    label="Total Unit"
                    value={`${totalUnit} unit`}
                  />
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">

                  {/* LEFT COLUMN */}
                  <div className="space-y-5">

                    {/* DAFTAR ASET */}
                    <div className="bg-white rounded-xl border border-[#60A5FA]/20 overflow-hidden shadow-sm">
                      <div className="px-5 py-4 border-b border-[#60A5FA]/15 bg-[#F8FAFC] flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB]">
                            <Package size={15} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#0F172A]">
                              Aset yang Dipinjam
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {(detail.detailPeminjaman || []).length} jenis aset • {totalUnit} total unit
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5">
                        {(detail.detailPeminjaman || []).length > 0 ? (
                          <div className="space-y-2">
                            {(detail.detailPeminjaman || []).map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 rounded-lg border border-[#60A5FA]/20 bg-white p-3.5 hover:border-[#2563EB]/40 transition-colors"
                              >
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] flex-shrink-0">
                                  <Package size={16} />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-[#0F172A] truncate">
                                    {item?.aset?.nama || "Aset"}
                                  </p>
                                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                                    {item?.aset?.kode || "-"}
                                  </p>
                                </div>

                                <span className="text-xs font-semibold text-[#1E3A5F] bg-[#2563EB]/10 border border-[#2563EB]/20 px-2.5 py-1 rounded-md flex-shrink-0">
                                  {item.jumlah} unit
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-lg border border-dashed border-[#60A5FA]/40 px-4 py-10 text-center">
                            <Info size={18} className="mx-auto text-[#60A5FA]" />
                            <p className="text-xs text-slate-500 mt-2">
                              Detail aset tidak tersedia.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* KEPERLUAN */}
                    <InfoBlock
                      icon={<ClipboardList size={15} />}
                      title="Keperluan"
                      content={detail.keperluan || "-"}
                    />

                    {/* CATATAN */}
                    {detail.catatanPeminjaman && (
                      <InfoBlock
                        icon={<MessageSquare size={15} />}
                        title="Catatan Peminjaman"
                        content={detail.catatanPeminjaman}
                      />
                    )}

                    {/* DIKEMBALIKAN / TERLAMBAT */}
                    {(hasil === "dikembalikan" || hasil === "terlambat") && (
                      <div className="bg-white rounded-xl border border-[#60A5FA]/20 overflow-hidden shadow-sm">
                        <div className="flex items-stretch">
                          <div
                            className={`w-1 flex-shrink-0 ${
                              hasil === "terlambat" ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                          />

                          <div className="flex-1 px-5 py-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div
                                className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                                  hasil === "terlambat"
                                    ? "bg-amber-50 border-amber-200 text-amber-600"
                                    : "bg-emerald-50 border-emerald-200 text-emerald-600"
                                }`}
                              >
                                {hasil === "terlambat" ? (
                                  <AlertTriangle size={15} />
                                ) : (
                                  <RotateCcw size={15} />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#0F172A]">
                                  {hasil === "terlambat"
                                    ? "Dikembalikan Terlambat"
                                    : "Dikembalikan Tepat Waktu"}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {formatTanggalWaktu(detail.tanggalKembaliAktual)}
                                </p>
                              </div>
                            </div>

                            {hasil === "terlambat" && (
                              <p className="text-xs text-amber-700 leading-relaxed">
                                Aset dikembalikan melewati tanggal rencana
                                pengembalian ({formatTanggal(detail.tanggalKembaliRencana)}).
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DITOLAK */}
                    {detail.status === "ditolak" && detail.catatanPenolakan && (
                      <div className="bg-white rounded-xl border border-red-200/60 overflow-hidden shadow-sm">
                        <div className="flex items-stretch">
                          <div className="w-1 bg-red-500 flex-shrink-0" />

                          <div className="flex-1 px-5 py-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 border border-red-100 text-red-500">
                                <XCircle size={15} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#0F172A]">
                                  Alasan Penolakan
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  Pengajuan ini tidak dapat disetujui
                                </p>
                              </div>
                            </div>

                            <p className="text-sm text-slate-700 leading-relaxed">
                              {detail.catatanPenolakan}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN */}
                  <aside className="space-y-5 lg:sticky lg:top-6">

                    {/* INFO CARD */}
                    <div className="bg-white rounded-xl border border-[#60A5FA]/20 overflow-hidden shadow-sm">
                      <div className="px-5 py-4 border-b border-[#60A5FA]/15 bg-[#F8FAFC] flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB]">
                          <Clock size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">
                            Informasi Peminjaman
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Detail waktu & kategori
                          </p>
                        </div>
                      </div>

                      <div className="px-5 py-4 space-y-3.5">
                        <InfoRow
                          label="Nomor Pengajuan"
                          value={detail.nomorPeminjaman || "-"}
                          mono
                        />
                        <Divider />
                        <InfoRow
                          label="Tanggal Pengajuan"
                          value={formatTanggalLengkap(detail.tanggalPengajuan)}
                        />
                        <Divider />
                        <InfoRow
                          label="Tanggal Pinjam"
                          value={formatTanggal(detail.tanggalPinjam)}
                        />
                        <Divider />
                        <InfoRow
                          label="Rencana Kembali"
                          value={formatTanggal(detail.tanggalKembaliRencana)}
                        />
                        <Divider />
                        <InfoRow
                          label="Kategori"
                          value={getKategori(detail)}
                        />
                        <Divider />
                        <InfoRow
                          label="Total Unit"
                          value={`${totalUnit} unit`}
                        />
                      </div>
                    </div>

                    {/* NAMA ASET */}
                    <div className="bg-white rounded-xl border border-[#60A5FA]/20 overflow-hidden shadow-sm">
                      <div className="px-5 py-4 border-b border-[#60A5FA]/15 bg-[#F8FAFC] flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB]">
                          <Package size={14} />
                        </div>
                        <p className="text-sm font-bold text-[#0F172A]">
                          Ringkasan Aset
                        </p>
                      </div>

                      <div className="px-5 py-4">
                        <p className="text-sm font-bold text-[#0F172A] leading-relaxed">
                          {getNamaAset(detail)}
                        </p>
                      </div>
                    </div>

                    {/* ACTION */}
                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-full h-10 text-xs font-semibold rounded-lg border border-[#60A5FA]/30 bg-white text-[#1E3A5F] hover:border-[#2563EB] hover:bg-[#2563EB]/5 transition-colors"
                    >
                      Kembali ke Riwayat
                    </button>
                  </aside>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// =========================================================
// SUB COMPONENTS
// =========================================================

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-[#60A5FA]/20 p-4 shadow-sm hover:border-[#2563EB]/40 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] flex-shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">
            {label}
          </p>
          <p className="text-sm font-bold text-[#0F172A] mt-0.5 truncate">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ icon, title, content }) {
  return (
    <div className="bg-white rounded-xl border border-[#60A5FA]/20 overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-[#60A5FA]/15 bg-[#F8FAFC] flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB]">
          {icon}
        </div>
        <p className="text-sm font-bold text-[#0F172A]">{title}</p>
      </div>

      <div className="px-5 py-4">
        <p className="text-sm text-slate-700 leading-relaxed">{content}</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="text-slate-500 flex-shrink-0">{label}</span>
      <span
        className={`font-semibold text-[#0F172A] text-right break-all ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-[#60A5FA]/15" />;
}