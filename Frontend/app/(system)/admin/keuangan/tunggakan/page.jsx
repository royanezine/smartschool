"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Eye,
  AlertCircle,
  CheckCircle2,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar,
  Printer,
  FileText,
  Loader2,
  RefreshCw,
  Ban,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  getTunggakan,
  batalkanTagihan,
} from "@/services/tagihan.service";

export default function TrackingTunggakanPage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);

  const [tunggakan, setTunggakan] = useState([]);
  const [summary, setSummary] = useState({
    totalTunggakan: 0,
    jumlahTagihan: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTunggakan, setSelectedTunggakan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getTunggakan({
        page: 1,
        limit: 100,
      });

      const list = Array.isArray(response?.data) ? response.data : [];
      const mapped = list.map((item) => ({
        id: item.id,
        siswa: item.siswa?.nama || "-",
        kelas: item.siswa?.kelas?.nama || "-",
        nisn: item.siswa?.nisn || item.siswa?.nis || "-",
        tagihan: item.kategoriTagihan?.nama || `Tagihan #${item.kode || item.id}`,
        nominal: Number(item.jumlah) || 0,
        terbayar: Number(item.terbayar) || 0,
        sisa: Number(item.sisa) || 0,
        jatuhTempo: item.jatuhTempo ? String(item.jatuhTempo).slice(0, 10) : "-",
        hari: Number(item.hariTerlambat) || 0,
        status:
          item.status === "lunas"
            ? "Lunas"
            : item.status === "sebagian"
            ? "Sebagian"
            : "Menunggak",
        kategori: item.kategoriTagihan?.nama || "Tagihan",
        totalTagihan: Number(item.sisa) > 0 ? Number(item.sisa) : Number(item.jumlah) || 0,
        tanggalTagihan: item.createdAt ? String(item.createdAt).slice(0, 10) : "-",
      }));

      setTunggakan(mapped);

      if (response?.ringkasan) {
        setSummary({
          totalTunggakan: Number(response.ringkasan.totalTunggakan) || 0,
          jumlahTagihan: Number(response.ringkasan.jumlahTagihan) || mapped.length,
        });
      }
    } catch (err) {
      console.error("[TrackingTunggakan] Gagal mengambil data:", err);
      setError(err?.message || "Gagal memuat data tunggakan dari server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const totalMenunggak = tunggakan.filter((t) => t.status === "Menunggak").length;
  const totalLunas = tunggakan.filter((t) => t.status === "Lunas").length;

  const totalNominalTunggak =
    summary.totalTunggakan ||
    tunggakan
      .filter((t) => t.status === "Menunggak" || t.status === "Sebagian")
      .reduce((a, b) => a + b.totalTagihan, 0);

  const totalSiswaTunggak = new Set(
    tunggakan
      .filter((t) => t.status === "Menunggak" || t.status === "Sebagian")
      .map((t) => t.siswa)
  ).size;

  const filtered = tunggakan.filter((t) => {
    const keyword = search.trim().toLowerCase();
    const matchSearch =
      t.siswa.toLowerCase().includes(keyword) ||
      t.kelas.toLowerCase().includes(keyword) ||
      t.nisn.toLowerCase().includes(keyword) ||
      t.tagihan.toLowerCase().includes(keyword);

    const matchFilter =
      filter === "semua" || t.status.toLowerCase() === filter.toLowerCase();

    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const safeCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  const indexOfLast = safeCurrentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentEntries = filtered.slice(indexOfFirst, indexOfLast);

  const handleViewDetail = (item) => {
    setSelectedTunggakan(item);
    setShowDetailModal(true);
  };

  const handleBatalTagihan = async (item) => {
    const alasan = window.prompt(`Masukkan alasan pembatalan tagihan ${item.tagihan} untuk ${item.siswa}:`);
    if (!alasan || !alasan.trim()) return;

    try {
      await batalkanTagihan(item.id, alasan.trim());
      setShowDetailModal(false);
      setSelectedTunggakan(null);
      await loadData();
    } catch (err) {
      console.error("Gagal membatalkan tagihan:", err);
      alert(err?.message || "Gagal membatalkan tagihan.");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden theme-page">
      <Sidebar
        active="trackingTunggakan"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden theme-page">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            <div className="mb-6 flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={() => router.push("/admin/keuangan")}
                className="inline-flex items-center gap-1.5 theme-text-secondary transition hover:text-[var(--color-primary)]"
              >
                <ArrowLeft size={16} />
                <span className="font-medium">Kembali</span>
              </button>
              <span className="theme-text-placeholder">/</span>
              <span className="theme-text-muted">Keuangan</span>
              <span className="theme-text-placeholder">/</span>
              <span className="font-medium theme-primary">Tracking Tunggakan</span>
            </div>

            <div className="mb-6 rounded-2xl theme-header p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_12%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] theme-danger">
                    <AlertCircle size={28} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider theme-primary">
                      Keuangan & Tagihan
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight theme-text sm:text-3xl">
                      Tracking Tunggakan
                    </h1>
                    <p className="mt-1 text-sm theme-text-secondary">
                      Pantau dan kelola data tagihan serta tunggakan siswa langsung dari server
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-lg theme-card-soft px-4 py-2.5 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]"
                  >
                    <Printer size={16} />
                    Cetak
                  </button>

                  <button
                    type="button"
                    onClick={loadData}
                    className="inline-flex items-center gap-2 rounded-lg theme-card-soft px-4 py-2.5 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)]"
                  >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Segarkan
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/admin/keuangan/SPP")}
                    className="inline-flex items-center gap-2 rounded-lg theme-primary px-4 py-2.5 text-sm font-medium transition shadow-[0_10px_30px_color-mix(in_srgb,var(--color-primary)_20%,transparent)] hover:brightness-95"
                  >
                    <Plus size={16} />
                    Kelola Tagihan & Bayar
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<AlertCircle size={22} />}
                label="Total Tunggakan"
                value={totalMenunggak}
                color="red"
                subtext="Tagihan belum lunas"
              />

              <StatCard
                icon={<DollarSign size={22} />}
                label="Total Nominal Tunggak"
                value={`Rp ${Number(totalNominalTunggak || 0).toLocaleString("id-ID")}`}
                color="blue"
                subtext="Total sisa tagihan siswa"
              />

              <StatCard
                icon={<Users size={22} />}
                label="Siswa Menunggak"
                value={totalSiswaTunggak}
                color="purple"
                subtext="Jumlah siswa dengan tunggakan"
              />

              <StatCard
                icon={<CheckCircle2 size={22} />}
                label="Lunas"
                value={totalLunas}
                color="emerald"
                subtext="Tagihan terselesaikan"
              />
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari siswa, kelas, NISN, atau tagihan..."
                  className="w-full rounded-xl theme-input py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:theme-text-placeholder focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-xl theme-input px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]"
                >
                  <option value="semua">Semua Status</option>
                  <option value="menunggak">Menunggak</option>
                  <option value="sebagian">Sebagian</option>
                  <option value="lunas">Lunas</option>
                </select>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border theme-border theme-card shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]">
                      <TableHead>Siswa</TableHead>
                      <TableHead>Kelas</TableHead>
                      <TableHead>Tagihan</TableHead>
                      <TableHead align="right">Jumlah Tagihan</TableHead>
                      <TableHead align="right">Terbayar</TableHead>
                      <TableHead align="right">Sisa Tunggakan</TableHead>
                      <TableHead>Jatuh Tempo</TableHead>
                      <TableHead align="center">Status</TableHead>
                      <TableHead align="center">Aksi</TableHead>
                    </tr>
                  </thead>

                  <tbody className="divide-y theme-border-soft">
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center theme-text-muted">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 size={28} className="animate-spin text-[var(--color-primary)]" />
                            <p className="text-sm">Memuat data tunggakan dari server...</p>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center theme-text-muted">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <AlertCircle size={28} className="text-[var(--color-danger)]" />
                            <p className="text-sm font-medium text-[var(--color-danger)]">{error}</p>
                            <button
                              type="button"
                              onClick={loadData}
                              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline"
                            >
                              <RefreshCw size={12} /> Coba lagi
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : currentEntries.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center theme-text-muted">
                          <div className="flex flex-col items-center gap-2">
                            <FileText size={32} className="theme-text-placeholder" />
                            <p className="text-sm font-medium">Tidak ada data tunggakan ditemukan</p>
                            <p className="text-xs">Coba ubah kata kunci atau filter pencarian</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentEntries.map((item) => (
                        <tr
                          key={item.id}
                          className="group transition hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"
                        >
                          <td className="px-4 py-3.5">
                            <div>
                              <p className="font-medium theme-text">{item.siswa}</p>
                              <p className="text-xs theme-text-muted">NISN/NIS: {item.nisn}</p>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 theme-text-secondary">{item.kelas}</td>

                          <td className="px-4 py-3.5">
                            <div>
                              <p className="theme-text-secondary">{item.tagihan}</p>
                              <p className="text-xs theme-text-muted">{item.kategori}</p>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-right font-medium theme-text-secondary">
                            Rp {item.nominal.toLocaleString("id-ID")}
                          </td>

                          <td className="px-4 py-3.5 text-right font-medium theme-success">
                            Rp {item.terbayar.toLocaleString("id-ID")}
                          </td>

                          <td className="px-4 py-3.5 text-right font-bold theme-text">
                            Rp {item.sisa.toLocaleString("id-ID")}
                          </td>

                          <td className="px-4 py-3.5 theme-text-secondary">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={14} className="theme-text-muted" />
                              {item.jatuhTempo}
                              {item.hari > 0 && (
                                <span className="ml-1 rounded-full theme-danger bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-2 py-0.5 text-xs font-medium">
                                  +{item.hari} hari
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <StatusBadge status={item.status} />
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <ActionButton
                                onClick={() => handleViewDetail(item)}
                                type="primary"
                                title="Lihat detail"
                              >
                                <Eye size={16} />
                              </ActionButton>

                              {item.status !== "Lunas" && (
                                <ActionButton
                                  onClick={() => handleBatalTagihan(item)}
                                  type="danger"
                                  title="Batalkan tagihan"
                                >
                                  <Ban size={16} />
                                </ActionButton>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {filtered.length > 0 && (
                <div className="flex items-center justify-between border-t theme-border bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] px-4 py-3">
                  <p className="text-sm theme-text-muted">
                    Menampilkan {indexOfFirst + 1}-{Math.min(indexOfLast, filtered.length)} dari {filtered.length} data
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={safeCurrentPage === 1}
                      className="rounded-lg border theme-border theme-card p-2 theme-text-muted transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                          safeCurrentPage === i + 1
                            ? "theme-primary shadow-[0_4px_12px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]"
                            : "theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safeCurrentPage === totalPages}
                      className="rounded-lg border theme-border theme-card p-2 theme-text-muted transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <footer className="mt-8 border-t theme-border-soft pt-6 text-center text-xs theme-text-muted">
              © 2026 SmartSchool • Tracking Tunggakan
            </footer>
          </div>
        </main>
      </div>

      {showDetailModal && selectedTunggakan && (
        <Modal
          title="Detail Tagihan & Tunggakan"
          onClose={() => setShowDetailModal(false)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DetailItem label="Siswa" value={selectedTunggakan.siswa} />
              <DetailItem label="NISN/NIS" value={selectedTunggakan.nisn} />
              <DetailItem label="Kelas" value={selectedTunggakan.kelas} />
              <DetailItem label="Kategori" value={selectedTunggakan.kategori} />
              <DetailItem label="Tagihan" value={selectedTunggakan.tagihan} />
              <div>
                <p className="text-xs font-medium theme-text-muted">Status</p>
                <StatusBadge status={selectedTunggakan.status} />
              </div>
              <DetailItem label="Total Tagihan" value={`Rp ${selectedTunggakan.nominal.toLocaleString("id-ID")}`} />
              <DetailItem label="Sudah Terbayar" value={`Rp ${selectedTunggakan.terbayar.toLocaleString("id-ID")}`} valueClass="theme-success" />
              <DetailItem
                label="Sisa Tunggakan"
                value={`Rp ${selectedTunggakan.sisa.toLocaleString("id-ID")}`}
                valueClass="theme-text"
                bold
              />
              <DetailItem label="Jatuh Tempo" value={selectedTunggakan.jatuhTempo} />
            </div>

            <div className="flex justify-end gap-2 border-t theme-border-soft pt-4">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="rounded-xl border theme-border theme-card-soft px-4 py-2 text-sm font-medium theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
              >
                Tutup
              </button>

              <button
                type="button"
                onClick={() => router.push("/admin/keuangan/SPP")}
                className="rounded-xl theme-primary px-4 py-2 text-sm font-medium transition hover:brightness-95"
              >
                Kelola & Bayar di SPP
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function TableHead({ children, align = "left" }) {
  const aligns = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <th className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider theme-text-muted ${aligns[align]}`}>
      {children}
    </th>
  );
}

function StatusBadge({ status }) {
  const s = String(status).toLowerCase();
  if (s === "lunas") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full theme-success bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-2.5 py-1 text-xs font-medium">
        <CheckCircle2 size={12} />
        Lunas
      </span>
    );
  }
  if (s === "sebagian") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full theme-info bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] px-2.5 py-1 text-xs font-medium">
        Sebagian
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full theme-danger bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-2.5 py-1 text-xs font-medium">
      <AlertCircle size={12} />
      Menunggak
    </span>
  );
}

function ActionButton({ children, onClick, type = "primary", title }) {
  const styles = {
    primary: "theme-text-muted hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:theme-primary",
    danger: "theme-text-muted hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] hover:theme-danger",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-lg p-1.5 transition ${styles[type]}`}
    >
      {children}
    </button>
  );
}

function DetailItem({ label, value, valueClass = "theme-text", bold = false }) {
  return (
    <div>
      <p className="text-xs font-medium theme-text-muted">{label}</p>
      <p className={`mt-0.5 text-sm ${bold ? "font-bold" : "font-medium"} ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function StatCard({ icon, label, value, color, subtext }) {
  const colors = {
    emerald: "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]",
    red: "bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]",
    blue: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]",
    purple: "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)]",
  };

  return (
    <div className="group rounded-2xl border theme-border theme-card p-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] transition hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_10%,transparent)]">
      <div className="flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${colors[color]}`}>
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium theme-text-muted">{label}</p>
          <p className="mt-1 text-xl font-bold theme-text">{value}</p>
          {subtext && <p className="mt-0.5 text-xs theme-text-muted">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-text)_55%,transparent)] p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl theme-card p-6 shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_20%,transparent)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold theme-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 theme-text-muted transition hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] hover:text-[var(--color-text)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="divide-y theme-border-soft">{children}</div>
      </div>
    </div>
  );
}
