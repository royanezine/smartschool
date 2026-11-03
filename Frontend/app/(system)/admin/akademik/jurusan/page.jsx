"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import {
  getJurusan,
  createJurusan,
  updateJurusan,
  deleteJurusan,
} from "@/services/jurusan.service";
import {
  GraduationCap,
  FlaskConical,
  Landmark,
  Languages,
  Code2,
  Palette,
  Calculator,
  Wrench,
  UtensilsCrossed,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Layers3,
  CircleCheck,
  CircleSlash,
  ChevronDown,
  Eye,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";

const ICONS = {
  FlaskConical,
  Landmark,
  Languages,
  Code2,
  Palette,
  Calculator,
  Wrench,
  UtensilsCrossed,
};

const emptyForm = {
  kode: "",
  nama: "",
  deskripsi: "",
  status: "Aktif",
  icon: "Code2",
};

function StatCard({ icon: Icon, label, value, type = "blue" }) {
  const styles = {
    blue: {
      box: "theme-info",
      icon: "text-[var(--color-primary)]",
      value: "theme-text",
    },
    green: {
      box: "theme-success",
      icon: "text-[var(--color-success)]",
      value: "text-[var(--color-success)]",
    },
    red: {
      box: "theme-danger",
      icon: "text-[var(--color-danger)]",
      value: "text-[var(--color-danger)]",
    },
    purple: {
      box: "theme-card-soft",
      icon: "text-[var(--color-info)]",
      value: "theme-text",
    },
  };

  const style = styles[type] || styles.blue;

  return (
    <div className="min-w-0 rounded-xl border theme-border theme-card px-4 py-4 shadow-sm sm:px-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.box} ${style.icon}`}
        >
          <Icon size={19} strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide theme-text-muted">
            {label}
          </p>

          <p
            className={`mt-1 text-2xl font-bold tracking-tight ${style.value}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "Aktif" || status === "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        active
          ? "theme-success"
          : "theme-card-soft theme-text-muted theme-border"
      }`}
    >
      {active ? (
        <CircleCheck size={13} strokeWidth={2} />
      ) : (
        <CircleSlash size={13} strokeWidth={2} />
      )}
      {active ? "Aktif" : "Nonaktif"}
    </span>
  );
}

function JurusanForm({ initial, onCancel, onSave, saving }) {
  const [form, setForm] = useState(initial || emptyForm);
  const [error, setError] = useState("");

  const update = (key) => (e) => {
    setForm((current) => ({
      ...current,
      [key]: e.target.value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    setError("");

    const kodeTrim = form.kode.trim();
    const namaTrim = form.nama.trim();

    if (!kodeTrim) {
      setError("Kode jurusan wajib diisi.");
      return;
    }
    if (kodeTrim.length > 20) {
      setError("Kode jurusan maksimal 20 karakter.");
      return;
    }
    if (!namaTrim) {
      setError("Nama jurusan wajib diisi.");
      return;
    }
    if (namaTrim.length > 100) {
      setError("Nama jurusan maksimal 100 karakter.");
      return;
    }

    onSave({
      ...form,
      kode: kodeTrim.toUpperCase(),
      nama: namaTrim,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold theme-text-secondary">
            Kode Jurusan <span className="text-red-500">*</span>
          </label>

          <input
            required
            maxLength={20}
            value={form.kode}
            onChange={update("kode")}
            placeholder="Contoh: RPL, TKJ, IPA"
            className="theme-input h-11 w-full rounded-lg px-3.5 text-sm uppercase outline-none transition focus:outline-none"
          />
          <p className="mt-1 text-[11px] theme-text-muted">
            Maksimal 20 karakter (unik per sekolah)
          </p>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold theme-text-secondary">
            Status
          </label>

          <div className="relative">
            <select
              value={form.status}
              onChange={update("status")}
              className="theme-input h-11 w-full appearance-none rounded-lg px-3.5 pr-10 text-sm outline-none focus:outline-none"
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold theme-text-secondary">
          Nama Jurusan / Program Keahlian <span className="text-red-500">*</span>
        </label>

        <input
          required
          maxLength={100}
          value={form.nama}
          onChange={update("nama")}
          placeholder="Contoh: Rekayasa Perangkat Lunak"
          className="theme-input h-11 w-full rounded-lg px-3.5 text-sm outline-none transition focus:outline-none"
        />
        <p className="mt-1 text-[11px] theme-text-muted">
          Maksimal 100 karakter
        </p>
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold theme-text-secondary">
          Deskripsi (Opsional)
        </label>

        <textarea
          rows={3}
          value={form.deskripsi || ""}
          onChange={update("deskripsi")}
          placeholder="Ringkasan kompetensi keahlian atau keterangan jurusan..."
          className="theme-input w-full rounded-lg p-3 text-sm outline-none transition focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="mb-2 block text-xs font-semibold theme-text-secondary">
          Ikon Jurusan
        </label>

        <div className="flex flex-wrap gap-2">
          {Object.entries(ICONS).map(([name, Icon]) => {
            const selected = form.icon === name;

            return (
              <button
                key={name}
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    icon: name,
                  }))
                }
                className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                  selected
                    ? "theme-primary theme-border shadow-sm"
                    : "theme-card theme-border theme-text-muted theme-header-hover"
                }`}
              >
                <Icon size={17} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t theme-border pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="theme-card theme-border theme-text-secondary theme-header-hover h-10 rounded-lg border px-5 text-sm font-medium transition disabled:opacity-50"
        >
          Batal
        </button>

        <button
          type="submit"
          disabled={saving}
          className="theme-primary flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold shadow-sm transition disabled:opacity-50"
        >
          {saving && <Loader2 className="animate-spin" size={16} />}
          {saving ? "Menyimpan..." : "Simpan Jurusan"}
        </button>
      </div>
    </form>
  );
}

export default function ListJurusanPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [modalMode, setModalMode] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const loadJurusan = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const res = await getJurusan({ limit: 100 });
      if (res?.data && Array.isArray(res.data)) {
        setData(res.data);
      } else if (Array.isArray(res)) {
        setData(res);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error("Gagal memuat jurusan:", err);
      setErrorMsg(
        err?.message || "Gagal memuat data jurusan dari server Backend."
      );
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadJurusan();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadJurusan]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return data.filter((j) => {
      const matchSearch =
        !q ||
        (j.nama || "").toLowerCase().includes(q) ||
        (j.kode || "").toLowerCase().includes(q) ||
        (j.deskripsi || "").toLowerCase().includes(q);

      const itemStatus = (j.status || "").toLowerCase() === "aktif" ? "Aktif" : "Nonaktif";
      const matchStatus =
        statusFilter === "Semua" || itemStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  const totalAktif = useMemo(() => {
    return data.filter(
      (item) => (item.status || "").toLowerCase() === "aktif"
    ).length;
  }, [data]);

  const totalNonaktif = useMemo(() => {
    return data.filter(
      (item) => (item.status || "").toLowerCase() === "nonaktif"
    ).length;
  }, [data]);

  const totalKelas = useMemo(() => {
    return data.reduce(
      (total, item) => total + (item._count?.kelas ?? item.kelas ?? 0),
      0
    );
  }, [data]);

  const openAdd = () => {
    setActiveItem(emptyForm);
    setModalMode("add");
  };

  const openEdit = (item) => {
    setActiveItem({
      id: item.id,
      kode: item.kode || "",
      nama: item.nama || "",
      deskripsi: item.deskripsi || "",
      status: (item.status || "").toLowerCase() === "nonaktif" ? "Nonaktif" : "Aktif",
      icon: item.icon || "Code2",
    });
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveItem(null);
  };

  const saveItem = async (form) => {
    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      const payload = {
        kode: form.kode.trim().toUpperCase(),
        nama: form.nama.trim(),
        deskripsi: form.deskripsi ? form.deskripsi.trim() : null,
        status:
          form.status.toLowerCase() === "nonaktif" ? "nonaktif" : "aktif",
      };

      if (modalMode === "add") {
        const res = await createJurusan(payload);
        setSuccessMsg(res?.message || "Jurusan baru berhasil dibuat di backend.");
      } else if (modalMode === "edit" && activeItem?.id) {
        const res = await updateJurusan(activeItem.id, payload);
        setSuccessMsg(res?.message || "Jurusan berhasil diperbarui di backend.");
      }

      closeModal();
      await loadJurusan();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Gagal menyimpan jurusan:", err);
      setErrorMsg(err?.message || "Gagal menyimpan jurusan ke backend.");
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (item) => {
    if (!item?.id) return;
    try {
      setDeleting(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await deleteJurusan(item.id);
      setSuccessMsg(res?.message || "Jurusan berhasil dihapus dari backend.");
      setConfirmDeleteItem(null);
      await loadJurusan();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error("Gagal menghapus jurusan:", err);
      setErrorMsg(
        err?.message ||
          "Gagal menghapus jurusan dari backend. Pastikan tidak ada kelas yang terhubung dengan jurusan ini."
      );
    } finally {
      setDeleting(false);
    }
  };

  const resetFilter = () => {
    setSearch("");
    setStatusFilter("Semua");
    loadJurusan();
  };

  return (
    <div className="flex min-h-screen theme-page">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1280px]">
            {/* Header Title & Actions */}
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm">
                  <GraduationCap size={23} strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-[24px] font-bold tracking-tight theme-text sm:text-[27px]">
                    Data Jurusan
                  </h1>

                  <p className="text-sm theme-text-muted">
                    Kelola program keahlian dan data jurusan sekolah secara terintegrasi dengan Backend
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={resetFilter}
                  disabled={loading}
                  className="theme-card theme-border theme-text-secondary theme-header-hover flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition disabled:opacity-50"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={openAdd}
                  disabled={loading}
                  className="theme-primary flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm transition disabled:opacity-50"
                >
                  <Plus size={17} />
                  Tambah Jurusan
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMsg("")}
                  className="rounded p-1 text-red-500 hover:bg-red-500/20 transition"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-500">
                <div className="flex items-center gap-2.5">
                  <CircleCheck size={18} className="shrink-0" />
                  <span>{successMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessMsg("")}
                  className="rounded p-1 text-emerald-500 hover:bg-emerald-500/20 transition"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Layers3}
                label="Total Jurusan"
                value={data.length}
                type="blue"
              />

              <StatCard
                icon={CircleCheck}
                label="Aktif"
                value={totalAktif}
                type="green"
              />

              <StatCard
                icon={CircleSlash}
                label="Nonaktif"
                value={totalNonaktif}
                type="red"
              />

              <StatCard
                icon={Layers3}
                label="Total Kelas"
                value={totalKelas}
                type="purple"
              />
            </div>

            {/* Filter & Search Bar */}
            <div className="theme-card theme-border mt-5 rounded-xl border p-4 shadow-sm sm:p-5">
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-primary)]"
                />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari berdasarkan nama jurusan, kode, atau deskripsi..."
                  className="theme-input h-11 w-full rounded-lg pl-10 pr-4 text-sm outline-none transition focus:outline-none"
                />
              </div>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="theme-input h-10 w-full appearance-none rounded-lg px-3.5 pr-9 text-sm outline-none focus:outline-none"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("Semua");
                  }}
                  className="theme-sidebar-text-active theme-sidebar-hover h-10 rounded-lg px-3 text-sm font-medium transition"
                >
                  Reset Filter
                </button>

                <div className="sm:ml-auto">
                  <span className="text-sm font-medium theme-text-muted">
                    {filtered.length} jurusan ditemukan
                  </span>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="theme-card theme-border mt-5 overflow-hidden rounded-xl border shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] border-collapse text-left">
                  <thead>
                    <tr className="theme-primary text-xs font-semibold uppercase tracking-wide">
                      <th className="w-16 px-5 py-3.5 text-center">No</th>
                      <th className="px-5 py-3.5">Jurusan</th>
                      <th className="px-5 py-3.5">Deskripsi</th>
                      <th className="px-5 py-3.5 text-center">Jumlah Kelas</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-14 text-center text-sm theme-text-muted"
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2
                              className="animate-spin text-[var(--color-primary)]"
                              size={24}
                            />
                            <span>Memuat data jurusan dari server...</span>
                          </div>
                        </td>
                      </tr>
                    )}

                    {!loading &&
                      filtered.map((j, index) => {
                        const Icon = ICONS[j.icon] || GraduationCap;

                        return (
                          <tr
                            key={j.id}
                            className="theme-table-hover border-b theme-border-soft transition last:border-0"
                          >
                            <td className="px-5 py-4 text-center text-sm font-medium theme-text-muted">
                              {index + 1}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                                  <Icon size={18} strokeWidth={2} />
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold theme-text">
                                    {j.nama}
                                  </p>

                                  <p className="mt-0.5 text-xs font-mono theme-text-muted">
                                    {j.kode}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="max-w-[320px] truncate text-sm theme-text-secondary">
                                {j.deskripsi || "-"}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-center text-sm font-medium theme-text-secondary">
                              {j._count?.kelas ?? j.kelas ?? 0}
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge status={j.status} />
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => setViewItem(j)}
                                  title="Lihat detail jurusan"
                                  className="theme-header-hover theme-text-muted flex h-8 w-8 items-center justify-center rounded-md transition"
                                >
                                  <Eye size={16} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openEdit(j)}
                                  title="Edit jurusan"
                                  className="theme-header-hover theme-text-muted flex h-8 w-8 items-center justify-center rounded-md transition"
                                >
                                  <Pencil size={16} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteItem(j)}
                                  title="Hapus jurusan"
                                  className="theme-danger flex h-8 w-8 items-center justify-center rounded-md transition"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-5 py-16 text-center">
                          <div className="theme-card-soft theme-text-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                            <GraduationCap size={21} />
                          </div>

                          <p className="mt-3 text-sm font-semibold theme-text-secondary">
                            {data.length === 0
                              ? "Belum ada data jurusan"
                              : "Jurusan tidak ditemukan"}
                          </p>

                          <p className="mt-1 text-xs theme-text-muted">
                            {data.length === 0
                              ? "Data jurusan belum tersedia di server. Klik tombol 'Tambah Jurusan' di atas untuk membuat jurusan baru."
                              : "Coba ubah kata kunci atau filter pencarian."}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t theme-border-soft theme-card-soft px-5 py-3">
                <p className="text-xs theme-text-muted">
                  Menampilkan{" "}
                  <span className="font-medium theme-text-secondary">
                    {filtered.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium theme-text-secondary">
                    {data.length}
                  </span>{" "}
                  jurusan
                </p>
              </div>
            </div>

            {/* Modal Tambah / Edit */}
            {modalMode && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
                <div className="theme-card theme-border max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border shadow-2xl">
                  <div className="theme-card sticky top-0 z-10 flex items-center justify-between border-b theme-border px-5 py-4 sm:px-6">
                    <div>
                      <h2 className="text-lg font-bold theme-text">
                        {modalMode === "add"
                          ? "Tambah Jurusan"
                          : "Edit Jurusan"}
                      </h2>

                      <p className="mt-0.5 text-xs theme-text-muted">
                        {modalMode === "add"
                          ? "Lengkapi informasi program keahlian baru untuk disimpan ke server"
                          : "Perbarui data jurusan di server"}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={closeModal}
                      className="theme-header-hover theme-text-muted flex h-9 w-9 items-center justify-center rounded-lg transition disabled:opacity-50"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="p-5 sm:p-6">
                    <JurusanForm
                      initial={activeItem}
                      saving={saving}
                      onCancel={closeModal}
                      onSave={saveItem}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Modal View Detail */}
            {viewItem && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
                <div className="theme-card theme-border w-full max-w-lg rounded-2xl border p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b theme-border pb-4">
                    <div className="flex items-center gap-3">
                      <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold theme-text">
                          Detail Jurusan
                        </h2>
                        <p className="text-xs font-mono theme-text-muted">
                          {viewItem.kode}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewItem(null)}
                      className="theme-header-hover theme-text-muted flex h-8 w-8 items-center justify-center rounded-lg transition"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <span className="text-xs font-semibold theme-text-muted">
                        Nama Jurusan:
                      </span>
                      <p className="font-medium theme-text">{viewItem.nama}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold theme-text-muted">
                        Kode Jurusan:
                      </span>
                      <p className="font-mono font-medium theme-text">
                        {viewItem.kode}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold theme-text-muted">
                        Status:
                      </span>
                      <div className="mt-1">
                        <StatusBadge status={viewItem.status} />
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold theme-text-muted">
                        Deskripsi:
                      </span>
                      <p className="theme-text-secondary leading-relaxed">
                        {viewItem.deskripsi || "Tidak ada deskripsi."}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold theme-text-muted">
                        Jumlah Kelas Terdaftar:
                      </span>
                      <p className="font-medium theme-text">
                        {viewItem._count?.kelas ?? viewItem.kelas ?? 0} kelas
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end border-t theme-border pt-4">
                    <button
                      type="button"
                      onClick={() => setViewItem(null)}
                      className="theme-card theme-border theme-text-secondary theme-header-hover h-9 rounded-lg border px-4 text-xs font-medium transition"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            {confirmDeleteItem && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
                <div className="theme-card theme-border w-full max-w-md rounded-2xl border p-6 shadow-2xl">
                  <div className="flex items-start gap-4">
                    <div className="theme-danger flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                      <Trash2 size={20} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold theme-text">
                        Hapus Jurusan?
                      </h2>

                      <p className="mt-1.5 text-sm leading-6 theme-text-muted">
                        Apakah Anda yakin ingin menghapus jurusan{" "}
                        <strong className="theme-text">
                          {confirmDeleteItem.nama} ({confirmDeleteItem.kode})
                        </strong>
                        ?
                      </p>
                      <p className="mt-1 text-xs theme-text-muted">
                        Data jurusan ini akan dihapus dari server. Pastikan tidak
                        ada kelas atau siswa yang masih terhubung dengan jurusan
                        ini.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => setConfirmDeleteItem(null)}
                      className="theme-card theme-border theme-text-secondary theme-header-hover h-10 rounded-lg border px-5 text-sm font-medium transition disabled:opacity-50"
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() => removeItem(confirmDeleteItem)}
                      className="theme-danger flex h-10 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition disabled:opacity-50"
                    >
                      {deleting && (
                        <Loader2 className="animate-spin" size={16} />
                      )}
                      {deleting ? "Menghapus..." : "Ya, Hapus"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
