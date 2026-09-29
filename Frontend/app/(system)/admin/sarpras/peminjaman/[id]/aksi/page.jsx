"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

import Sidebar from "../../../../../../components/Sidebar";
import Header from "../../../../../../components/Header";

import {
  Package,
  ClipboardList,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
  Ban,
  HandCoins,
  Undo2,
  UserRound,
  Hash,
} from "lucide-react";

import {
  getDetailPeminjaman,
  verifikasiPeminjaman,
  serahkanPeminjaman,
  kembalikanPeminjaman,
} from "../../../../../../../services/sarpras.service";

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

const ACTION_CONFIG = {
  setujui: {
    title: "Setujui Pengajuan",
    subtitle: "Konfirmasi persetujuan peminjaman aset",
    icon: CheckCircle2,
    primaryLabel: "Setujui Pengajuan",
    primaryClass: "bg-[#2563EB] hover:bg-[#1E3A5F]",
  },
  tolak: {
    title: "Tolak Pengajuan",
    subtitle: "Berikan alasan penolakan pengajuan",
    icon: Ban,
    primaryLabel: "Tolak Pengajuan",
    primaryClass: "bg-red-600 hover:bg-red-700",
  },
  serahkan: {
    title: "Serahkan Aset",
    subtitle: "Catat siswa pengambil dan kondisi aset",
    icon: HandCoins,
    primaryLabel: "Konfirmasi Penyerahan",
    primaryClass: "bg-[#2563EB] hover:bg-[#1E3A5F]",
  },
  kembalikan: {
    title: "Proses Pengembalian",
    subtitle: "Catat siswa pengembali dan kondisi aset",
    icon: Undo2,
    primaryLabel: "Konfirmasi Pengembalian",
    primaryClass: "bg-emerald-600 hover:bg-emerald-700",
  },
};

/* =========================================================
   PAGE
========================================================= */

function AksiContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const id = params?.id;
  const type = searchParams.get("type") || "setujui";

  const config = ACTION_CONFIG[type] || ACTION_CONFIG.setujui;
  const HeaderIcon = config.icon;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  /* Form state */
  const [catatanPenolakan, setCatatanPenolakan] = useState("");
  const [siswaPengambilId, setSiswaPengambilId] = useState("");
  const [namaSiswaPengambil, setNamaSiswaPengambil] = useState("");
  const [kondisiSaatPinjam, setKondisiSaatPinjam] = useState("baik");
  const [siswaPengembaliId, setSiswaPengembaliId] = useState("");
  const [namaSiswaPengembali, setNamaSiswaPengembali] = useState("");
  const [kondisiKembali, setKondisiKembali] = useState({});
  const [catatanKembali, setCatatanKembali] = useState({});

  const notifications = [
    {
      id: 1,
      title: config.title,
      desc: config.subtitle,
      read: false,
    },
  ];

  /* Load detail */
  useEffect(() => {
    let mounted = true;
    async function load() {
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
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleBack = () =>
    router.push(`/admin/sarpras/peminjaman/${id}`);

  /* SUBMIT */
  const handleSubmit = async () => {
    if (!detail) return;
    setActionError("");

    try {
      setSubmitting(true);

      if (type === "setujui") {
        await verifikasiPeminjaman(detail.id, {
          status: STATUS.DISETUJUI,
          catatanPenolakan: null,
        });
      } else if (type === "tolak") {
        if (!catatanPenolakan.trim()) {
          setActionError("Alasan penolakan wajib diisi.");
          setSubmitting(false);
          return;
        }
        await verifikasiPeminjaman(detail.id, {
          status: STATUS.DITOLAK,
          catatanPenolakan: catatanPenolakan.trim(),
        });
      } else if (type === "serahkan") {
        if (!siswaPengambilId && !namaSiswaPengambil.trim()) {
          setActionError(
            "Isi siswa pengambil atau nama siswa pengambil."
          );
          setSubmitting(false);
          return;
        }
        await serahkanPeminjaman(detail.id, {
          siswaPengambilId: siswaPengambilId || null,
          namaSiswaPengambil: namaSiswaPengambil.trim() || null,
          kondisiSaatPinjam,
        });
      } else if (type === "kembalikan") {
        if (!siswaPengembaliId && !namaSiswaPengembali.trim()) {
          setActionError(
            "Isi siswa pengembali atau nama siswa pengembali."
          );
          setSubmitting(false);
          return;
        }

        const items =
          detail.detailPeminjaman?.map((item) => ({
            asetId: item.asetId,
            kondisiSaatKembali: kondisiKembali[item.asetId] || "baik",
            catatanKembali:
              catatanKembali[item.asetId]?.trim() || null,
          })) || [];

        if (items.length === 0) {
          setActionError("Detail aset tidak ditemukan.");
          setSubmitting(false);
          return;
        }

        await kembalikanPeminjaman(detail.id, {
          siswaPengembaliId: siswaPengembaliId || null,
          namaSiswaPengembali: namaSiswaPengembali.trim() || null,
          items,
        });
      }

      router.push("/admin/sarpras/peminjaman");
    } catch (err) {
      console.error("Gagal memproses aksi:", err);
      setActionError(err?.message || "Gagal memproses aksi.");
    } finally {
      setSubmitting(false);
    }
  };

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
          <div className="mx-auto w-full max-w-[900px] space-y-5 p-4 sm:p-6 lg:p-8">

            {/* BACK */}
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#1E3A5F] transition-colors hover:text-[#0F172A] disabled:opacity-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#60A5FA]/30 bg-white transition-colors hover:border-[#2563EB]">
                <ArrowLeft size={14} />
              </span>
              Kembali ke Detail Peminjaman
            </button>

            {/* HEADER */}
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm">
                <HeaderIcon size={20} />
              </div>
              <div className="min-w-0">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#2563EB]">
                    Aksi Peminjaman
                  </p>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-[28px]">
                  {config.title}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {config.subtitle}
                </p>
              </div>
            </div>

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
              <div className="rounded-xl border border-red-200/70 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="mt-0.5 text-red-500" />
                  <div>
                    <p className="text-sm font-bold text-red-800">
                      Gagal memuat data
                    </p>
                    <p className="mt-1 text-xs text-red-700/80">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* FORM */}
            {!loading && !error && detail && (
              <div className="space-y-5">

                {/* INFO ITEM */}
                <div className="overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm">
                  <div className="flex items-center gap-3 border-b border-[#60A5FA]/15 bg-[#F8FAFC] px-5 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB]">
                      <ClipboardList size={14} />
                    </div>
                    <p className="text-sm font-bold text-[#0F172A]">
                      Informasi Peminjaman
                    </p>
                  </div>

                  <div className="space-y-3 p-5">
                    <InfoRow
                      label="Nomor Peminjaman"
                      value={detail.nomorPeminjaman || "-"}
                      mono
                    />
                    <Divider />
                    <InfoRow
                      label="Peminjam"
                      value={detail.peminjam?.namaLengkap || "-"}
                    />
                    <Divider />
                    <InfoRow
                      label="Keperluan"
                      value={detail.keperluan || "-"}
                    />
                    <Divider />
                    <InfoRow
                      label="Total Aset"
                      value={`${detail.detailPeminjaman?.length || 0} jenis`}
                    />
                  </div>
                </div>

                {/* FORM SETUJUI */}
                {type === "setujui" && (
                  <div className="rounded-xl border border-[#2563EB]/30 bg-[#2563EB]/5 p-4">
                    <div className="flex gap-3">
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0 text-[#2563EB]"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#1E3A5F]">
                          Konfirmasi Persetujuan
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-[#1E3A5F]/80">
                          Setelah disetujui, pengajuan dapat diproses untuk
                          penyerahan aset kepada siswa.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* FORM TOLAK */}
                {type === "tolak" && (
                  <div className="overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-[#60A5FA]/15 bg-[#F8FAFC] px-5 py-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-500">
                        <XCircle size={14} />
                      </div>
                      <p className="text-sm font-bold text-[#0F172A]">
                        Alasan Penolakan
                      </p>
                    </div>

                    <div className="p-5">
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Alasan <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={catatanPenolakan}
                        onChange={(e) => setCatatanPenolakan(e.target.value)}
                        placeholder="Tuliskan alasan pengajuan ditolak..."
                        className="w-full resize-none rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] px-3.5 py-2.5 text-xs text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-500/10"
                      />
                    </div>
                  </div>
                )}

                {/* FORM SERAHKAN */}
                {type === "serahkan" && (
                  <div className="overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-[#60A5FA]/15 bg-[#F8FAFC] px-5 py-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB]">
                        <HandCoins size={14} />
                      </div>
                      <p className="text-sm font-bold text-[#0F172A]">
                        Data Penyerahan
                      </p>
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="rounded-lg border border-amber-100 bg-amber-50 p-3">
                        <p className="text-[11px] leading-5 text-amber-700">
                          Saat aset diserahkan, backend akan mengurangi stok
                          aset dan mengubah status menjadi{" "}
                          <strong>Dipinjam</strong>.
                        </p>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                          ID Siswa Pengambil
                        </label>
                        <input
                          type="text"
                          value={siswaPengambilId}
                          onChange={(e) => setSiswaPengambilId(e.target.value)}
                          placeholder="Masukkan ID siswa jika tersedia"
                          className="w-full rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] px-3.5 py-2.5 text-xs text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-[#60A5FA]/15" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          atau
                        </span>
                        <div className="h-px flex-1 bg-[#60A5FA]/15" />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                          Nama Siswa Pengambil
                        </label>
                        <input
                          type="text"
                          value={namaSiswaPengambil}
                          onChange={(e) =>
                            setNamaSiswaPengambil(e.target.value)
                          }
                          placeholder="Nama lengkap siswa"
                          className="w-full rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] px-3.5 py-2.5 text-xs text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                          Kondisi Saat Pinjam
                        </label>
                        <select
                          value={kondisiSaatPinjam}
                          onChange={(e) =>
                            setKondisiSaatPinjam(e.target.value)
                          }
                          className="w-full rounded-lg border border-[#60A5FA]/20 bg-white px-3.5 py-2.5 text-xs text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                        >
                          <option value="baik">Baik</option>
                          <option value="rusak_ringan">Rusak Ringan</option>
                          <option value="rusak_berat">Rusak Berat</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* FORM KEMBALIKAN */}
                {type === "kembalikan" && (
                  <div className="overflow-hidden rounded-xl border border-[#60A5FA]/20 bg-white shadow-sm">
                    <div className="flex items-center gap-3 border-b border-[#60A5FA]/15 bg-[#F8FAFC] px-5 py-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600">
                        <Undo2 size={14} />
                      </div>
                      <p className="text-sm font-bold text-[#0F172A]">
                        Data Pengembalian
                      </p>
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                        <p className="text-[11px] leading-5 text-emerald-700">
                          Saat pengembalian diproses, stok aset akan
                          dikembalikan oleh backend dan status berubah menjadi{" "}
                          <strong>Dikembalikan</strong>.
                        </p>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                          ID Siswa Pengembali
                        </label>
                        <input
                          type="text"
                          value={siswaPengembaliId}
                          onChange={(e) =>
                            setSiswaPengembaliId(e.target.value)
                          }
                          placeholder="Masukkan ID siswa jika tersedia"
                          className="w-full rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] px-3.5 py-2.5 text-xs text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-[#60A5FA]/15" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          atau
                        </span>
                        <div className="h-px flex-1 bg-[#60A5FA]/15" />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                          Nama Siswa Pengembali
                        </label>
                        <input
                          type="text"
                          value={namaSiswaPengembali}
                          onChange={(e) =>
                            setNamaSiswaPengembali(e.target.value)
                          }
                          placeholder="Nama lengkap siswa"
                          className="w-full rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] px-3.5 py-2.5 text-xs text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/10"
                        />
                      </div>

                      <div className="space-y-3 pt-2">
                        <p className="text-xs font-bold text-[#0F172A]">
                          Kondisi Aset Saat Kembali
                        </p>

                        {detail.detailPeminjaman?.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-lg border border-[#60A5FA]/20 bg-[#F8FAFC] p-3.5"
                          >
                            <div className="mb-3 flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/10 text-[#2563EB]">
                                <Package size={14} />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-[#0F172A]">
                                  {item.aset?.nama || "-"}
                                </p>
                                <p className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                                  <Hash size={10} />
                                  {item.aset?.kode || "-"} • ×{item.jumlah}
                                </p>
                              </div>
                            </div>

                            <select
                              value={kondisiKembali[item.asetId] || "baik"}
                              onChange={(e) =>
                                setKondisiKembali((c) => ({
                                  ...c,
                                  [item.asetId]: e.target.value,
                                }))
                              }
                              className="mb-2 w-full rounded-lg border border-[#60A5FA]/20 bg-white px-3 py-2 text-xs outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                            >
                              <option value="baik">Baik</option>
                              <option value="rusak_ringan">
                                Rusak Ringan
                              </option>
                              <option value="rusak_berat">
                                Rusak Berat
                              </option>
                              <option value="hilang">Hilang</option>
                            </select>

                            <textarea
                              rows={2}
                              value={catatanKembali[item.asetId] || ""}
                              onChange={(e) =>
                                setCatatanKembali((c) => ({
                                  ...c,
                                  [item.asetId]: e.target.value,
                                }))
                              }
                              placeholder="Catatan kondisi / pengembalian..."
                              className="w-full resize-none rounded-lg border border-[#60A5FA]/20 bg-white px-3 py-2 text-[11px] outline-none placeholder:text-slate-400 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ACTION ERROR */}
                {actionError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-red-200/70 bg-red-50 p-3.5">
                    <AlertCircle
                      size={15}
                      className="mt-0.5 shrink-0 text-red-500"
                    />
                    <p className="text-xs leading-5 text-red-600">
                      {actionError}
                    </p>
                  </div>
                )}

                {/* BUTTONS */}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={submitting}
                    className="h-11 rounded-xl border border-[#60A5FA]/30 bg-white px-5 text-sm font-semibold text-slate-600 transition-colors hover:border-[#2563EB] hover:text-[#2563EB] disabled:opacity-50 sm:order-1"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all disabled:opacity-60 sm:order-2 ${config.primaryClass}`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Check size={15} />
                        {config.primaryLabel}
                      </>
                    )}
                  </button>
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

function InfoRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="flex-shrink-0 text-slate-500">{label}</span>
      <span
        className={`text-right font-semibold text-[#0F172A] break-all ${
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

/* =========================================================
   WRAPPER
========================================================= */

export default function AksiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#F8FAFC]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-[#2563EB]" />
            <p className="text-sm text-slate-500">Memuat...</p>
          </div>
        </div>
      }
    >
      <AksiContent />
    </Suspense>
  );
}