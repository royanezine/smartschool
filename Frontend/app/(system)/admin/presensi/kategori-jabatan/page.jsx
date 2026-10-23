"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getKategoriJabatan,
  getKategoriJabatanById,
  createKategoriJabatan,
  updateKategoriJabatan,
  tambahTarifKategoriJabatan,
  deleteKategoriJabatan,
} from "@/services/kategoriJabatan.service";

import {
  BriefcaseBusiness,
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  Wallet,
  Users,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  History,
  Info,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const initialForm = {
  nama: "",
  kode: "",
  keterangan: "",
  status: "aktif",
  tarifPerJam: "",
  berlakuMulai: new Date().toISOString().slice(0, 10),
  catatanTarif: "",
};

const initialTarifForm = {
  tarifPerJam: "",
  berlakuMulai: new Date().toISOString().slice(0, 10),
  catatan: "",
};

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatTanggal(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan. Silakan coba kembali.";
}

function StatusBadge({ status }) {
  const aktif = status === "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        aktif
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/60"
          : "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-muted ring-1 ring-[color-mix(in_srgb,var(--color-text)_8%,transparent)]"
      }`}
    >
      {aktif ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
      {aktif ? "Aktif" : "Nonaktif"}
    </span>
  );
}

function Modal({ title, description, onClose, children, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`theme-card my-auto w-full ${
          wide ? "max-w-2xl" : "max-w-xl"
        } overflow-hidden rounded-2xl border theme-border shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b theme-border px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold theme-text">{title}</h2>
            {description && (
              <p className="mt-1 text-sm theme-text-muted">{description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="rounded-lg p-2 theme-text-muted transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] hover:theme-text"
          >
            <X size={19} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
          {children}
        </div>
      </section>
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium theme-text">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
      {hint && (
        <span className="block text-xs theme-text-muted">{hint}</span>
      )}
    </label>
  );
}

function SortableHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSort,
  align = "left",
}) {
  const active = sortBy === column;

  return (
    <th
      className={`px-5 py-4 font-semibold ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <button
        type="button"
        onClick={() => onSort(column)}
        className={`inline-flex items-center gap-1.5 transition hover:theme-text ${
          active ? "theme-primary-text" : ""
        }`}
        title={`Urutkan ${label} ${
          active && sortOrder === "asc" ? "DESC" : "ASC"
        }`}
      >
        {label}
        {active ? (
          sortOrder === "asc" ? (
            <ArrowUp size={13} />
          ) : (
            <ArrowDown size={13} />
          )
        ) : (
          <ArrowUpDown size={13} className="opacity-40" />
        )}
      </button>
    </th>
  );
}

const inputClass =
  "theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-50";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-3.5 py-2.5 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 transition";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl theme-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 transition";

export default function KategoriJabatanPage() {
  const [items, setItems] = useState([]);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const [sortBy, setSortBy] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");

  function handleSort(column) {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  }

  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [tarifForm, setTarifForm] = useState(initialTarifForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(
    async ({ quiet = false } = {}) => {
      if (quiet) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const result = await getKategoriJabatan({
          page,
          limit,
          search: search || undefined,
          status: statusFilter || undefined,
        });

        setItems(result.data);
        setPagination({
          total: result.total,
          totalPages: Math.max(1, result.totalPages),
        });
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, search, statusFilter],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!notice) return;

    const timeout = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timeout);
  }, [notice]);

  const sortedItems = useMemo(() => {
    const data = [...items];

    data.sort((a, b) => {
      let valA;
      let valB;

      switch (sortBy) {
        case "tarif":
          valA = Number(a.tarifAktif?.tarifPerJam ?? 0);
          valB = Number(b.tarifAktif?.tarifPerJam ?? 0);
          break;
        case "pegawai":
          valA = Number(a.jumlahPengguna ?? 0);
          valB = Number(b.jumlahPengguna ?? 0);
          break;
        case "status":
          valA = String(a.status ?? "").toLowerCase();
          valB = String(b.status ?? "").toLowerCase();
          break;
        case "kode":
          valA = String(a.kode ?? "").toLowerCase();
          valB = String(b.kode ?? "").toLowerCase();
          break;
        case "nama":
        default:
          valA = String(a.nama ?? "").toLowerCase();
          valB = String(b.nama ?? "").toLowerCase();
          break;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [items, sortBy, sortOrder]);

  const summary = useMemo(() => {
    const active = items.filter((item) => item.status === "aktif").length;
    const employees = items.reduce(
      (total, item) => total + Number(item.jumlahPengguna ?? 0),
      0,
    );

    return {
      active,
      employees,
      shown: items.length,
    };
  }, [items]);

  function closeModal() {
    if (saving) return;
    setModal(null);
    setSelected(null);
    setError("");
  }

  function openCreate() {
    router.push("/admin/presensi/kategori-jabatan/tambah");
  }

  function openEdit(item) {
    router.push(`/admin/presensi/kategori-jabatan/${item.id}/edit`);
  }

  function openDetail(item) {
    router.push(`/admin/presensi/kategori-jabatan/${item.id}`);
  }

  function openTarif(item) {
    setError("");
    setSelected(item);
    setTarifForm({
      ...initialTarifForm,
      berlakuMulai: new Date().toISOString().slice(0, 10),
    });
    setModal("tarif");
  }

  function updateForm(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function updateTarifForm(field, value) {
    setTarifForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const nama = form.nama.trim();

    if (!nama) {
      setError("Nama kategori jabatan wajib diisi.");
      return;
    }

    if (modal === "create") {
      if (
        form.tarifPerJam === "" ||
        !Number.isFinite(Number(form.tarifPerJam)) ||
        Number(form.tarifPerJam) < 0
      ) {
        setError("Tarif per jam wajib berupa angka minimal 0.");
        return;
      }

      if (!form.berlakuMulai) {
        setError("Tanggal mulai berlaku tarif wajib diisi.");
        return;
      }
    }

    setSaving(true);

    try {
      if (modal === "create") {
        await createKategoriJabatan({
          nama,
          kode: form.kode.trim() || undefined,
          keterangan: form.keterangan.trim() || undefined,
          status: form.status,
          tarifPerJam: Number(form.tarifPerJam),
          berlakuMulai: form.berlakuMulai,
          catatanTarif: form.catatanTarif.trim() || undefined,
        });

        setNotice("Kategori jabatan berhasil ditambahkan.");
      } else {
        await updateKategoriJabatan(selected.id, {
          nama,
          kode: form.kode.trim(),
          keterangan: form.keterangan.trim(),
          status: form.status,
        });

        setNotice("Kategori jabatan berhasil diperbarui.");
      }

      setModal(null);
      setSelected(null);
      await loadData({ quiet: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleTarifSubmit(event) {
    event.preventDefault();
    setError("");

    const tarif = Number(tarifForm.tarifPerJam);

    if (
      tarifForm.tarifPerJam === "" ||
      !Number.isFinite(tarif) ||
      tarif < 0
    ) {
      setError("Tarif per jam wajib berupa angka minimal 0.");
      return;
    }

    if (!tarifForm.berlakuMulai) {
      setError("Tanggal mulai berlaku wajib diisi.");
      return;
    }

    setSaving(true);

    try {
      await tambahTarifKategoriJabatan(selected.id, {
        tarifPerJam: tarif,
        berlakuMulai: tarifForm.berlakuMulai,
        catatan: tarifForm.catatan.trim() || undefined,
      });

      setNotice("Tarif baru berhasil disimpan.");
      setModal(null);
      setSelected(null);
      await loadData({ quiet: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Nonaktifkan kategori "${item.nama}"?\n\nSistem akan menolak penghapusan jika kategori masih digunakan oleh pegawai.`,
    );

    if (!confirmed) return;

    setError("");

    try {
      await deleteKategoriJabatan(item.id);
      setNotice("Permintaan penghapusan kategori berhasil diproses.");
      await loadData({ quiet: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleSearch(event) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  const currentTarif = selected?.tarifAktif;

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto theme-page theme-text">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-7xl space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                    <BriefcaseBusiness size={23} />
                  </div>

                  <div>
                   
                    <h1 className="mt-1 text-2xl font-bold tracking-tight theme-text">
                      Kategori Jabatan
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm leading-6 theme-text-secondary">
                      Kelola kategori jabatan pegawai dan tarif per jam
                      sebagai dasar perhitungan penggajian.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadData({ quiet: true })}
                    disabled={loading || refreshing}
                    className={buttonSecondary}
                  >
                    <RefreshCw
                      size={16}
                      className={refreshing ? "animate-spin" : ""}
                    />
                    Refresh
                  </button>

                  <button
                    type="button"
                    onClick={openCreate}
                    className={buttonPrimary}
                  >
                    <Plus size={17} />
                    Tambah Kategori
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border theme-border theme-card p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                  <Info size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium theme-text">
                    Perubahan tarif disimpan sebagai riwayat baru
                  </p>
                  <p className="mt-1 text-xs leading-5 theme-text-muted">
                    Perhitungan gaji mengikuti aturan sistem dan riwayat tarif
                    yang berlaku pada periode penggajian.
                  </p>
                </div>
              </div>

              {notice && (
                <div
                  role="status"
                  className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300"
                >
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <p className="flex-1">{notice}</p>
                  <button
                    type="button"
                    onClick={() => setNotice("")}
                    aria-label="Tutup pemberitahuan"
                    className="rounded p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {error && !modal && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                >
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">Permintaan gagal</p>
                    <p className="mt-1 break-words">{error}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Tutup pesan error"
                    onClick={() => setError("")}
                    className="rounded p-1 hover:bg-red-100 dark:hover:bg-red-900/40"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
                <SummaryCard
                  title="Kategori pada halaman"
                  value={loading ? "—" : pagination.total}
                  description="Total sesuai hasil sistem"
                  icon={BriefcaseBusiness}
                  tone="blue"
                />
                <SummaryCard
                  title="Kategori aktif"
                  value={loading ? "—" : summary.active}
                  description="Dari data halaman saat ini"
                  icon={CheckCircle2}
                  tone="emerald"
                />
                <SummaryCard
                  title="Pegawai pada halaman"
                  value={loading ? "—" : summary.employees}
                  description="Berdasarkan jumlah pengguna per kategori"
                  icon={Users}
                  tone="indigo"
                />
              </div>

              <section className="theme-card overflow-hidden rounded-xl border theme-border shadow-sm">
                <div className="border-b theme-border p-4 sm:p-5">
                  <form
                    onSubmit={handleSearch}
                    className="flex flex-col gap-3 md:flex-row"
                  >
                    <div className="relative min-w-0 flex-1">
                      <Search
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                      />
                      <input
                        value={searchInput}
                        onChange={(event) =>
                          setSearchInput(event.target.value)
                        }
                        placeholder="Cari nama atau kode kategori..."
                        className={`${inputClass} pl-10`}
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={(event) => {
                        setStatusFilter(event.target.value);
                        setPage(1);
                      }}
                      className={`${inputClass} md:w-48`}
                      aria-label="Filter status kategori"
                    >
                      <option value="">Semua status</option>
                      <option value="aktif">Aktif</option>
                      <option value="nonaktif">Nonaktif</option>
                    </select>

                    <button type="submit" className={buttonPrimary}>
                      <Search size={16} />
                      Cari
                    </button>
                  </form>
                </div>

                <div className="relative">
                  {loading ? (
                    <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                      <LoaderCircle
                        size={28}
                        className="animate-spin theme-primary-text"
                      />
                      <p className="mt-3 text-sm font-medium theme-text">
                        Memuat kategori jabatan...
                      </p>
                      <p className="mt-1 text-xs theme-text-muted">
                        Mengambil data dari sistem
                      </p>
                    </div>
                  ) : sortedItems.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-muted">
                        <BriefcaseBusiness size={23} />
                      </div>
                      <p className="mt-4 font-semibold theme-text">
                        Belum ada kategori jabatan
                      </p>
                      <p className="mt-1 max-w-sm text-sm theme-text-muted">
                        Coba ubah pencarian atau tambahkan kategori baru.
                      </p>
                      <button
                        type="button"
                        onClick={openCreate}
                        className={`${buttonPrimary} mt-4`}
                      >
                        <Plus size={16} />
                        Tambah Kategori
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs uppercase tracking-wide theme-text-muted border-b theme-border">
                          <tr>
                            <th className="px-5 py-4 font-semibold w-16">No</th>
                            <SortableHeader
                              label="Kategori"
                              column="nama"
                              sortBy={sortBy}
                              sortOrder={sortOrder}
                              onSort={handleSort}
                            />
                            <SortableHeader
                              label="Tarif per jam"
                              column="tarif"
                              sortBy={sortBy}
                              sortOrder={sortOrder}
                              onSort={handleSort}
                            />
                            <SortableHeader
                              label="Pegawai"
                              column="pegawai"
                              sortBy={sortBy}
                              sortOrder={sortOrder}
                              onSort={handleSort}
                            />
                            <SortableHeader
                              label="Status"
                              column="status"
                              sortBy={sortBy}
                              sortOrder={sortOrder}
                              onSort={handleSort}
                            />
                            <th className="px-5 py-4 text-right font-semibold">
                              Tindakan
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                          {sortedItems.map((item, index) => (
                            <tr
                              key={item.id}
                              className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] transition"
                            >
                              <td className="px-5 py-4">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] text-xs font-semibold theme-text-secondary">
                                  {(page - 1) * limit + index + 1}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                                    <BriefcaseBusiness size={18} />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-semibold theme-text">
                                      {item.nama || "-"}
                                    </p>
                                    <p className="mt-1 text-xs theme-text-muted">
                                      Kode: {item.kode || "Tidak ada kode"}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4">
                                <p className="font-semibold theme-text">
                                  {item.tarifAktif
                                    ? formatRupiah(item.tarifAktif.tarifPerJam)
                                    : "Belum diatur"}
                                </p>
                                {item.tarifAktif?.berlakuMulai && (
                                  <p className="mt-1 text-xs theme-text-muted">
                                    Berlaku sejak{" "}
                                    {formatTanggal(
                                      item.tarifAktif.berlakuMulai,
                                    )}
                                  </p>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <span className="inline-flex items-center gap-1.5 theme-text-secondary">
                                  <Users
                                    size={15}
                                    className="theme-text-muted"
                                  />
                                  {Number(item.jumlahPengguna ?? 0)}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <StatusBadge status={item.status} />
                              </td>

                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openDetail(item)}
                                    title="Detail dan riwayat tarif"
                                    aria-label={`Detail ${item.nama}`}
                                    className="rounded-lg p-2 theme-text-muted transition hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                                  >
                                    <Eye size={17} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openEdit(item)}
                                    title="Edit kategori"
                                    aria-label={`Edit ${item.nama}`}
                                    className="rounded-lg p-2 theme-text-muted transition hover:bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] hover:theme-text"
                                  >
                                    <Pencil size={17} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => openTarif(item)}
                                    title="Atur tarif baru"
                                    aria-label={`Atur tarif ${item.nama}`}
                                    className="rounded-lg p-2 theme-text-muted transition hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                                  >
                                    <Wallet size={17} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDelete(item)}
                                    title="Nonaktifkan kategori"
                                    aria-label={`Nonaktifkan ${item.nama}`}
                                    className="rounded-lg p-2 theme-text-muted transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                                  >
                                    <Trash2 size={17} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 border-t theme-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <p className="text-sm theme-text-muted">
                    Menampilkan{" "}
                    <span className="font-medium theme-text">
                      {sortedItems.length}
                    </span>{" "}
                    data pada halaman ini dari{" "}
                    <span className="font-medium theme-text">
                      {pagination.total}
                    </span>{" "}
                    kategori
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={page <= 1 || loading}
                      onClick={() => setPage((current) => current - 1)}
                      className={buttonSecondary}
                    >
                      <ChevronLeft size={16} />
                      Sebelumnya
                    </button>

                    <span className="min-w-20 text-center text-sm theme-text">
                      {page} / {pagination.totalPages}
                    </span>

                    <button
                      type="button"
                      disabled={page >= pagination.totalPages || loading}
                      onClick={() => setPage((current) => current + 1)}
                      className={buttonSecondary}
                    >
                      Berikutnya
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="border-t theme-border px-5 py-3 text-xs theme-text-muted">
                  Data kategori jabatan diambil dari sistem.
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {(modal === "create" || modal === "edit") && (
        <Modal
          title={
            modal === "create"
              ? "Tambah Kategori Jabatan"
              : "Edit Kategori Jabatan"
          }
          description={
            modal === "create"
              ? "Lengkapi identitas kategori dan tarif awal."
              : "Perbarui informasi kategori jabatan."
          }
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nama kategori" required>
                <input
                  required
                  maxLength={100}
                  value={form.nama}
                  onChange={(event) =>
                    updateForm("nama", event.target.value)
                  }
                  placeholder="Contoh: Guru"
                  className={inputClass}
                />
              </Field>

              <Field
                label="Kode kategori"
                hint="Opsional, maksimal 50 karakter."
              >
                <input
                  maxLength={50}
                  value={form.kode}
                  onChange={(event) =>
                    updateForm("kode", event.target.value)
                  }
                  placeholder="Contoh: GR"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Keterangan">
              <textarea
                rows={3}
                value={form.keterangan}
                onChange={(event) =>
                  updateForm("keterangan", event.target.value)
                }
                placeholder="Keterangan tambahan kategori..."
                className={inputClass}
              />
            </Field>

            <Field label="Status">
              <select
                value={form.status}
                onChange={(event) =>
                  updateForm("status", event.target.value)
                }
                className={inputClass}
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </Field>

            {modal === "create" && (
              <div className="space-y-4 rounded-lg border theme-border bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] p-4">
                <div className="flex items-center gap-2">
                  <Wallet size={18} className="theme-primary-text" />
                  <h3 className="font-semibold theme-text">Tarif awal</h3>
                </div>

                <Field label="Tarif per jam (Rp)" required>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.tarifPerJam}
                    onChange={(event) =>
                      updateForm("tarifPerJam", event.target.value)
                    }
                    placeholder="Contoh: 25000"
                    className={inputClass}
                  />
                </Field>

                <Field label="Berlaku mulai" required>
                  <input
                    required
                    type="date"
                    value={form.berlakuMulai}
                    onChange={(event) =>
                      updateForm("berlakuMulai", event.target.value)
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Catatan tarif">
                  <textarea
                    rows={2}
                    value={form.catatanTarif}
                    onChange={(event) =>
                      updateForm("catatanTarif", event.target.value)
                    }
                    placeholder="Opsional"
                    className={inputClass}
                  />
                </Field>
              </div>
            )}

            {modal === "edit" && (
              <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs leading-5 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                Tarif tidak diubah dari formulir ini. Gunakan tindakan Atur
                Tarif agar riwayat tarif lama tetap tersimpan.
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 border-t theme-border pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className={buttonSecondary}
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className={buttonPrimary}
              >
                {saving ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {saving
                  ? "Menyimpan..."
                  : modal === "create"
                    ? "Simpan Kategori"
                    : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "tarif" && selected && (
        <Modal
          title="Atur Tarif Jabatan"
          description={`Tambahkan tarif baru untuk kategori ${selected.nama}.`}
          onClose={closeModal}
        >
          <form onSubmit={handleTarifSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="rounded-lg bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] border theme-border p-4">
              <p className="text-xs theme-text-muted">Tarif saat ini</p>
              <p className="mt-1 text-xl font-bold tabular-nums theme-text">
                {selected.tarifAktif
                  ? formatRupiah(selected.tarifAktif.tarifPerJam)
                  : "Belum diatur"}
              </p>
            </div>

            <Field label="Tarif baru per jam (Rp)" required>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={tarifForm.tarifPerJam}
                onChange={(event) =>
                  updateTarifForm("tarifPerJam", event.target.value)
                }
                placeholder="Masukkan tarif baru"
                className={inputClass}
              />
            </Field>

            <Field label="Berlaku mulai" required>
              <input
                required
                type="date"
                value={tarifForm.berlakuMulai}
                onChange={(event) =>
                  updateTarifForm("berlakuMulai", event.target.value)
                }
                className={inputClass}
              />
            </Field>

            <Field label="Catatan perubahan">
              <textarea
                rows={3}
                value={tarifForm.catatan}
                onChange={(event) =>
                  updateTarifForm("catatan", event.target.value)
                }
                placeholder="Contoh: penyesuaian tarif periode baru"
                className={inputClass}
              />
            </Field>

            <p className="text-xs leading-5 theme-text-muted">
              Sistem yang mengatur penutupan tarif sebelumnya dan pembuatan
              riwayat tarif baru.
            </p>

            <div className="flex flex-col-reverse gap-2 border-t theme-border pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className={buttonSecondary}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className={buttonPrimary}
              >
                {saving ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Wallet size={16} />
                )}
                {saving ? "Menyimpan..." : "Simpan Tarif"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {modal === "detail" && selected && (
        <Modal
          title="Detail Kategori Jabatan"
          description="Informasi kategori dan riwayat tarif dari sistem."
          onClose={closeModal}
          wide
        >
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            <div className="flex flex-col justify-between gap-3 rounded-lg border theme-border p-4 sm:flex-row sm:items-start">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                  <BriefcaseBusiness size={21} />
                </div>
                <div>
                  <h3 className="font-semibold theme-text">
                    {selected.nama}
                  </h3>
                  <p className="mt-1 text-sm theme-text-muted">
                    Kode: {selected.kode || "-"}
                  </p>
                  <p className="mt-2 text-sm theme-text-secondary">
                    {selected.keterangan || "Tidak ada keterangan."}
                  </p>
                </div>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] border theme-border p-4">
                <p className="text-sm theme-text-muted">Tarif aktif</p>
                <p className="mt-2 text-xl font-bold tabular-nums theme-text">
                  {currentTarif
                    ? formatRupiah(currentTarif.tarifPerJam)
                    : "Belum diatur"}
                </p>
                {currentTarif?.berlakuMulai && (
                  <p className="mt-1 text-xs theme-text-muted">
                    Sejak {formatTanggal(currentTarif.berlakuMulai)}
                  </p>
                )}
              </div>

              <div className="rounded-lg bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] border theme-border p-4">
                <p className="text-sm theme-text-muted">Jumlah pegawai</p>
                <p className="mt-2 text-xl font-bold tabular-nums theme-text">
                  {Number(selected.jumlahPengguna ?? 0)}
                </p>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <History size={18} className="theme-text-muted" />
                <h3 className="font-semibold theme-text">Riwayat Tarif</h3>
              </div>

              {!selected.tarifRiwayat?.length ? (
                <div className="rounded-lg border border-dashed theme-border p-6 text-center text-sm theme-text-muted">
                  Belum ada riwayat tarif yang tersedia.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border theme-border">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)] text-xs theme-text-muted border-b theme-border">
                      <tr>
                        <th className="px-4 py-3 font-medium w-12">No</th>
                        <th className="px-4 py-3 font-medium">Tarif per jam</th>
                        <th className="px-4 py-3 font-medium">
                          Mulai berlaku
                        </th>
                        <th className="px-4 py-3 font-medium">Berakhir</th>
                        <th className="px-4 py-3 font-medium">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_5%,transparent)]">
                      {selected.tarifRiwayat.map((tarif, index) => (
                        <tr
                          key={tarif.id ?? `${tarif.berlakuMulai}-${index}`}
                          className="hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] transition"
                        >
                          <td className="px-4 py-3">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] text-[11px] font-semibold theme-text-secondary">
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold tabular-nums theme-text">
                            {formatRupiah(tarif.tarifPerJam)}
                          </td>
                          <td className="px-4 py-3 theme-text-secondary">
                            {formatTanggal(tarif.berlakuMulai)}
                          </td>
                          <td className="px-4 py-3 theme-text-secondary">
                            {tarif.berakhirPada
                              ? formatTanggal(tarif.berakhirPada)
                              : "Masih berlaku"}
                          </td>
                          <td className="px-4 py-3 theme-text-secondary">
                            {tarif.catatan || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t theme-border pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className={buttonSecondary}
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => openTarif(selected)}
                className={buttonPrimary}
              >
                <Wallet size={16} />
                Tambah Tarif
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


function SummaryCard({ title, value, description, icon: Icon, tone = "blue" }) {
  const toneClasses = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
    emerald:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    indigo:
      "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
    slate:
      "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-muted",
  };

  return (
    <div className="theme-card flex h-full flex-col rounded-xl border theme-border p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium theme-text-muted">{title}</span>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone] ?? toneClasses.blue}`}
        >
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums theme-text">
        {typeof value === "number" ? value.toLocaleString("id-ID") : value}
      </p>
      <p className="mt-1 text-xs theme-text-muted">{description}</p>
    </div>
  );
}