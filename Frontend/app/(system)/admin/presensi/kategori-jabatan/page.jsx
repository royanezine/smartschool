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
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800"
          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
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
        className={`my-auto w-full ${
          wide ? "max-w-2xl" : "max-w-xl"
        } overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
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
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
      {hint && (
        <span className="block text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </span>
      )}
    </label>
  );
}

/**
 * Header kolom yang bisa diklik untuk sorting ASC/DESC.
 */
function SortableHeader({ label, column, sortBy, sortOrder, onSort, align = "left" }) {
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
        className={`inline-flex items-center gap-1.5 transition hover:text-slate-800 dark:hover:text-slate-100 ${
          active ? "text-blue-700 dark:text-blue-300" : ""
        }`}
        title={`Urutkan ${label} ${active && sortOrder === "asc" ? "DESC" : "ASC"}`}
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
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:disabled:bg-slate-900";

const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50";

export default function KategoriJabatanPage() {
  const [items, setItems] = useState([]);
  const router = useRouter();
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

  // ============================================================
  // SORTING STATE
  // ============================================================
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

  // ============================================================
  // DATA YANG SUDAH DI-SORT
  // ============================================================
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
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <BriefcaseBusiness size={23} />
                </div>

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Presensi dan Kepegawaian
                  </p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Kategori Jabatan
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
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

            {notice && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <p>{notice}</p>
                <button
                  type="button"
                  onClick={() => setNotice("")}
                  className="ml-auto rounded-md p-1"
                  aria-label="Tutup pemberitahuan"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {error && !modal && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="min-w-0 flex-1">{error}</p>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Tutup pesan error"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-3">
              <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Kategori pada halaman
                  </span>
                  <BriefcaseBusiness
                    size={19}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "—" : pagination.total}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Total sesuai hasil endpoint
                </p>
              </div>

              <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Kategori aktif
                  </span>
                  <CheckCircle2
                    size={19}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "—" : summary.active}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Dari data halaman saat ini
                </p>
              </div>

              <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Pegawai pada halaman
                  </span>
                  <Users
                    size={19}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                  {loading ? "—" : summary.employees}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Berdasarkan jumlah pengguna per kategori
                </p>
              </div>
            </div>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 p-4 dark:border-slate-800 sm:p-5">
                <form
                  onSubmit={handleSearch}
                  className="flex flex-col gap-3 md:flex-row"
                >
                  <div className="relative min-w-0 flex-1">
                    <Search
                      size={18}
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={searchInput}
                      onChange={(event) => setSearchInput(event.target.value)}
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

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950/70 dark:text-slate-400">
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

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <LoaderCircle
                            size={25}
                            className="mx-auto animate-spin text-blue-600"
                          />
                          <p className="mt-3 text-sm text-slate-500">
                            Memuat kategori jabatan...
                          </p>
                        </td>
                      </tr>
                    ) : sortedItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800">
                            <BriefcaseBusiness size={22} />
                          </div>
                          <p className="mt-3 font-medium text-slate-800 dark:text-slate-200">
                            Belum ada kategori jabatan
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
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
                        </td>
                      </tr>
                    ) : (
                      sortedItems.map((item, index) => (
                        <tr
                          key={item.id}
                          className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                        >
                          <td className="px-5 py-4">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {(page - 1) * limit + index + 1}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                <BriefcaseBusiness size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {item.nama || "-"}
                                </p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                  Kode: {item.kode || "Tidak ada kode"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {item.tarifAktif
                                ? formatRupiah(item.tarifAktif.tarifPerJam)
                                : "Belum diatur"}
                            </p>
                            {item.tarifAktif?.berlakuMulai && (
                              <p className="mt-1 text-xs text-slate-500">
                                Berlaku sejak{" "}
                                {formatTanggal(item.tarifAktif.berlakuMulai)}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                              <Users size={15} className="text-slate-400" />
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
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950/50 dark:hover:text-blue-300"
                              >
                                <Eye size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => openEdit(item)}
                                title="Edit kategori"
                                aria-label={`Edit ${item.nama}`}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => openTarif(item)}
                                title="Atur tarif baru"
                                aria-label={`Atur tarif ${item.nama}`}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300"
                              >
                                <Wallet size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                title="Nonaktifkan kategori"
                                aria-label={`Nonaktifkan ${item.nama}`}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Menampilkan{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {sortedItems.length}
                  </span>{" "}
                  data pada halaman ini dari{" "}
                  <span className="font-medium text-slate-700 dark:text-slate-200">
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

                  <span className="min-w-20 text-center text-sm text-slate-600 dark:text-slate-300">
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
            </section>

            <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
              <Info size={18} className="mt-0.5 shrink-0" />
              <p className="leading-6">
                Perubahan tarif disimpan sebagai riwayat baru. Perhitungan
                gaji tetap mengikuti aturan sistem dan riwayat tarif yang
                berlaku pada periode penggajian.
              </p>
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
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
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
                  onChange={(event) => updateForm("nama", event.target.value)}
                  placeholder="Contoh: Guru"
                  className={inputClass}
                />
              </Field>

              <Field label="Kode kategori" hint="Opsional, maksimal 50 karakter.">
                <input
                  maxLength={50}
                  value={form.kode}
                  onChange={(event) => updateForm("kode", event.target.value)}
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
                onChange={(event) => updateForm("status", event.target.value)}
                className={inputClass}
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </Field>

            {modal === "create" && (
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <Wallet size={18} className="text-blue-600" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Tarif awal
                  </h3>
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
              <p className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
                Tarif tidak diubah dari formulir ini. Gunakan tindakan Atur
                Tarif agar riwayat tarif lama tetap tersimpan.
              </p>
            )}

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className={buttonSecondary}
              >
                Batal
              </button>

              <button type="submit" disabled={saving} className={buttonPrimary}>
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
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tarif saat ini
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
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

            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              Sistem yang mengatur penutupan tarif sebelumnya dan pembuatan
              riwayat tarif baru.
            </p>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className={buttonSecondary}
              >
                Batal
              </button>
              <button type="submit" disabled={saving} className={buttonPrimary}>
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
          description="Informasi kategori dan riwayat tarif yang dikembalikan sistem."
          onClose={closeModal}
          wide
        >
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-start">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  <BriefcaseBusiness size={21} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {selected.nama}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Kode: {selected.kode || "-"}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {selected.keterangan || "Tidak ada keterangan."}
                  </p>
                </div>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Tarif aktif
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                  {currentTarif
                    ? formatRupiah(currentTarif.tarifPerJam)
                    : "Belum diatur"}
                </p>
                {currentTarif?.berlakuMulai && (
                  <p className="mt-1 text-xs text-slate-500">
                    Sejak {formatTanggal(currentTarif.berlakuMulai)}
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Jumlah pegawai
                </p>
                <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                  {Number(selected.jumlahPengguna ?? 0)}
                </p>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2">
                <History size={18} className="text-slate-500" />
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Riwayat Tarif
                </h3>
              </div>

              {!selected.tarifRiwayat?.length ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
                  Belum ada riwayat tarif yang tersedia.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full min-w-[600px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium w-12">No</th>
                        <th className="px-4 py-3 font-medium">Tarif per jam</th>
                        <th className="px-4 py-3 font-medium">Mulai berlaku</th>
                        <th className="px-4 py-3 font-medium">Berakhir</th>
                        <th className="px-4 py-3 font-medium">Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selected.tarifRiwayat.map((tarif, index) => (
                        <tr key={tarif.id ?? `${tarif.berlakuMulai}-${index}`}>
                          <td className="px-4 py-3">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                            {formatRupiah(tarif.tarifPerJam)}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {formatTanggal(tarif.berlakuMulai)}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {tarif.berakhirPada
                              ? formatTanggal(tarif.berakhirPada)
                              : "Masih berlaku"}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                            {tarif.catatan || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
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