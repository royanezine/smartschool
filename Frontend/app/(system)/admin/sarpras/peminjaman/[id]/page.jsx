"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

import Sidebar from "../../../../../components/Sidebar";
import Header from "../../../../../components/Header";

import {
  Package,
  ClipboardList,
  Clock3,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowLeft,
  UserRound,
  CalendarDays,
  FileText,
  Boxes,
  AlertCircle,
  Loader2,
  Hash,
  Check,
  HandCoins,
  Undo2,
} from "lucide-react";

import { getDetailPeminjaman } from "../../../../../../services/sarpras.service";

/* =========================================================
   STATUS
========================================================= */

const STATUS = {
  MENUNGGU: "menunggu_persetujuan",
  DISETUJUI: "disetujui",
  DITOLAK: "ditolak",
  DIPINJAM: "dipinjam",
  DIKEMBALIKAN: "dikembalikan",
};

const STATUS_LABEL = {
  menunggu_persetujuan: "Menunggu Persetujuan",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
  dipinjam: "Dipinjam",
  dikembalikan: "Dikembalikan",
};

const getStatusConfig = (status) => {
  switch (status) {
    case STATUS.MENUNGGU:
      return {
        label: "Menunggu",
        className: "bg-amber-50 text-amber-700 border-amber-200/70",
        dot: "bg-amber-500",
        icon: Clock3,
      };
    case STATUS.DISETUJUI:
      return {
        label: "Disetujui",
        className: "bg-blue-50 text-blue-700 border-blue-200/70",
        dot: "bg-blue-500",
        icon: CheckCircle2,
      };
    case STATUS.DITOLAK:
      return {
        label: "Ditolak",
        className: "bg-red-50 text-red-700 border-red-200/70",
        dot: "bg-red-500",
        icon: XCircle,
      };
    case STATUS.DIPINJAM:
      return {
        label: "Dipinjam",
        className: "bg-violet-50 text-violet-700 border-violet-200/70",
        dot: "bg-violet-500",
        icon: Package,
      };
    case STATUS.DIKEMBALIKAN:
      return {
        label: "Dikembalikan",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
        dot: "bg-emerald-500",
        icon: RotateCcw,
      };
    default:
      return {
        label: status || "-",
        className: "bg-slate-50 text-slate-600 border-slate-200",
        dot: "bg-slate-400",
        icon: ClipboardList,
      };
  }
};

/* =========================================================
   HELPERS
========================================================= */

const formatTanggal = (v) => {
  if (!v) return "-";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(v));
  } catch {
    return "-";
  }
};

const formatTanggalWaktu = (v) => {
  if (!v) return "-";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(v));
  } catch {
    return "-";
  }
};

/* =========================================================
   PAGE
========================================================= */

export default function DetailPeminjamanPage() {
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
      title: "Detail Peminjaman",
      desc: "Detail pengajuan peminjaman",
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
          setError("ID peminjaman tidak ditemukan.");
          return;
        }
        const response = await getDetailPeminjaman(id);
        if (!mounted) return;
        setDetail(response?.data ?? response);
      } catch (err) {
        if (!mounted) return;
        console.error(err);
        setError(err?.message || "Gagal mengambil detail peminjaman.");
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

  const handleBack = () => router.push("/admin/sarpras/peminjaman");

  const bukaAksi = (type) => {
    router.push(
      `/admin/sarpras/peminjaman/${id}/aksi?type=${type}`
    );
  };

  const cfg = detail ? getStatusConfig(detail.status) : null;
  const StatusIcon = cfg?.icon;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((v) => !v)}
      />

      <div className="flex flex-1 min-w-0 flex-col">
        <Header
          toggleSidebar={() => setSidebarOpen((v) => !v)}
          notifications={notifications}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 overflow-y-auto bg-[#F8FAFC]">
          <div className="mx-auto w-full max-w-[1400px] space-y-5 p-4 sm:p-6 lg:p-8">

            {/* BACK */}
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#1E3A5F] transition-colors hover:text-[#0F172A]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#60A5FA]/30 bg-white transition-colors hover:border-[#2563EB]">
                <ArrowLeft size={14} />
              </span>
              Kembali ke Peminjaman
            </button>

            {/* LOADING */}
            {loading && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#60A5FA]/20 bg-white py-16">
                <Loader2 size={26} className="animate-spin text-[#2563EB]" />
                <p className="mt-3 text-sm text-slate-500">
                  Memuat detail peminjaman...
                </p>
              </div>
            )}

            {/* ERROR */}
            {!loading && error && (
              <div className="rounded-xl border border-[#60A5FA]/20 bg-white p-6">
                <div className="flex items-start gap-3 rounded-lg border border-red-200/70 bg-red-50/70 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 flex-shrink-0">
                    <AlertCircle size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-800">
                      Gagal memuat detail
                    </p>
                    <p className="mt-1 text-xs text-red-700/80">{error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-5 h-10 rounded-lg bg-[#0F172A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1E3A5F]"
                >
                  Kembali ke Daftar
                </button>
              </div>
            )}

            {/* NOT FOUND */}
            {!loading && !error && !detail && (
              <div className="rounded-xl border border-dashed border-[#60A5FA]/40 bg-white py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] text-[#2563EB]">
                  <ClipboardList size={20} />
                </div>
                <p className="mt-4 text-sm font-bold text-[#0F172A]">
                  Detail tidak ditemukan
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Data peminjaman tidak tersedia atau sudah dihapus.
                </p>
                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 h-10 text-sm font-semibold text-white transition-colors hover:bg-[#1E3A5F]"
                >
                  Kembali ke Daftar
                </button>
              </div>
            )}

            {/* DETAIL */}
            {!loading && !error && detail && (
              <div className="space-y-5">

                {/* HEADER CARD */}
                <div className="rounded-xl border border-[#60A5FA]/20 bg-white overflow-hidden shadow-sm">
                  <div className="flex items-stretch">
                    <div className="w-1 bg-[#2563EB] flex-shrink-0" />

                    <div className="flex-1 p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB]">
                            <ClipboardList size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                              Nomor Peminjaman
                            </p>
                            <h1 className="mt-1 break-all font-mono text-lg font-bold text-[#0F172A] sm:text-xl">
                              {detail.nomorPeminjaman || "-"}
                            </h1>
                            <p className="mt-1.5 text-xs text-slate-500">
                              Diajukan pada{" "}
                              {formatTanggalWaktu(detail.tanggalPengajuan)}
                            </p>
                          </div>
                        </div>

                        {cfg && StatusIcon && (
                          <span
                            className={`inline-flex items-center gap-1.5 self-start rounded-md border px-2.5 py-1 text-[11px] font-semibold flex-shrink-0 ${cfg.className}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                            />
                            {STATUS_LABEL[detail.status] || cfg.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* QUICK STATS */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatCard
                    icon={<UserRound size={15} />}
                    label="Peminjam"
                    value={detail.peminjam?.namaLengkap || "-"}
                  />
                  <StatCard
                    icon={<CalendarDays size={15} />}
                    label="Tgl Pinjam"
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
                    value={formatTanggalWaktu(detail.tanggalKembaliAktual)}
                  />
                </div>

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">

                  {/* LEFT */}
                  <div className="space-y-5">

                    {/* DAFTAR ASET */}
                    <div className="overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm">
                      <div className="flex items-center gap-3 border-b border-[#60A5FA]/15 bg-[#F8FAFC] px-5 py-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB]">
                          <Boxes size={15} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0F172A]">
                            Aset yang Dipinjam
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {detail.detailPeminjaman?.length || 0} jenis aset
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 p-4 sm:p-5">
                        {detail.detailPeminjaman?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-lg border border-[#60A5FA]/20 bg-white p-3.5 transition-colors hover:border-[#2563EB]/40"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB] flex-shrink-0">
                              <Package size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-[#0F172A]">
                                {item.aset?.nama || "-"}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1 text-[10px] font-mono text-slate-400">
                                <Hash size={10} />
                                {item.aset?.kode || "-"}
                              </p>
                            </div>
                            <span className="rounded-md border border-[#2563EB]/20 bg-[#2563EB]/10 px-2.5 py-1 text-xs font-semibold text-[#1E3A5F] flex-shrink-0">
                              ×{item.jumlah}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* KEPERLUAN */}
                    <InfoBlock
                      icon={<FileText size={15} />}
                      title="Keperluan"
                      content={detail.keperluan || "-"}
                    />

                    {/* CATATAN PEMINJAMAN */}
                    {detail.catatanPeminjaman && (
                      <InfoBlock
                        icon={<ClipboardList size={15} />}
                        title="Catatan Peminjaman"
                        content={detail.catatanPeminjaman}
                      />
                    )}

                    {/* CATATAN PENOLAKAN */}
                    {detail.catatanPenolakan && (
                      <div className="overflow-hidden rounded-xl border border-red-200/60 bg-white shadow-sm">
                        <div className="flex items-stretch">
                          <div className="w-1 bg-red-500 flex-shrink-0" />
                          <div className="flex-1 px-5 py-4">
                            <div className="mb-3 flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500">
                                <XCircle size={15} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-[#0F172A]">
                                  Alasan Penolakan
                                </p>
                              </div>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-700">
                              {detail.catatanPenolakan}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SISWA PENGAMBIL */}
                    {(detail.namaSiswaPengambil ||
                      detail.siswaPengambil) && (
                      <InfoBlock
                        icon={<UserRound size={15} />}
                        title="Siswa Pengambil"
                        content={
                          detail.siswaPengambil?.namaLengkap ||
                          detail.namaSiswaPengambil ||
                          "-"
                        }
                      />
                    )}

                    {/* SISWA PENGEMBALI */}
                    {(detail.namaSiswaPengembali ||
                      detail.siswaPengembali) && (
                      <InfoBlock
                        icon={<Undo2 size={15} />}
                        title="Siswa Pengembali"
                        content={
                          detail.siswaPengembali?.namaLengkap ||
                          detail.namaSiswaPengembali ||
                          "-"
                        }
                      />
                    )}
                  </div>

                  {/* RIGHT — ACTIONS */}
                  <aside className="space-y-5 lg:sticky lg:top-6">
                    <div className="overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm">
                      <div className="flex items-center gap-3 border-b border-[#60A5FA]/15 bg-[#F8FAFC] px-5 py-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB]">
                          <CheckCircle2 size={14} />
                        </div>
                        <p className="text-sm font-bold text-[#0F172A]">
                          Aksi Peminjaman
                        </p>
                      </div>

                      <div className="space-y-2.5 p-4">
                        {detail.status === STATUS.MENUNGGU && (
                          <>
                            <button
                              type="button"
                              onClick={() => bukaAksi("setujui")}
                              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] text-sm font-semibold text-white transition-colors hover:bg-[#1E3A5F]"
                            >
                              <Check size={15} />
                              Setujui Pengajuan
                            </button>
                            <button
                              type="button"
                              onClick={() => bukaAksi("tolak")}
                              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
                            >
                              <XCircle size={15} />
                              Tolak Pengajuan
                            </button>
                          </>
                        )}

                        {detail.status === STATUS.DISETUJUI && (
                          <button
                            type="button"
                            onClick={() => bukaAksi("serahkan")}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] text-sm font-semibold text-white transition-colors hover:bg-[#1E3A5F]"
                          >
                            <HandCoins size={15} />
                            Serahkan Aset
                          </button>
                        )}

                        {detail.status === STATUS.DIPINJAM && (
                          <button
                            type="button"
                            onClick={() => bukaAksi("kembalikan")}
                            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                          >
                            <Undo2 size={15} />
                            Proses Pengembalian
                          </button>
                        )}

                        {[STATUS.DITOLAK, STATUS.DIKEMBALIKAN].includes(
                          detail.status
                        ) && (
                          <div className="rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] p-3 text-center">
                            <p className="text-[11px] text-slate-500">
                              Tidak ada aksi tersedia untuk status ini.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleBack}
                      className="w-full h-10 rounded-lg border border-[#60A5FA]/30 bg-white text-xs font-semibold text-[#1E3A5F] transition-colors hover:border-[#2563EB] hover:bg-[#2563EB]/5"
                    >
                      Kembali ke Daftar
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

/* =========================================================
   SUB COMPONENTS
========================================================= */

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-[#60A5FA]/20 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/10 text-[#2563EB]">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-0.5 truncate text-sm font-bold text-[#0F172A]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ icon, title, content }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-[#60A5FA]/15 bg-[#F8FAFC] px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB]">
          {icon}
        </div>
        <p className="text-sm font-bold text-[#0F172A]">{title}</p>
      </div>
      <div className="px-5 py-4">
        <p className="text-sm leading-relaxed text-slate-700">{content}</p>
      </div>
    </div>
  );
}