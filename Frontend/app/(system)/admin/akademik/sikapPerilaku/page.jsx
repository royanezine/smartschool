"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  AlertCircle,
  Calendar,
  Edit3,
  Filter,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
  X,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  createSikapPerilaku,
  deleteSikapPerilaku,
  getSikapPerilaku,
  updateSikapPerilaku,
} from "@/services/sikapPerilaku.service";
import { getUsers } from "@/services/user.service";
import { getKelas } from "@/services/kelas.service";

const EMPTY_FORM = {
  siswaId: "",
  kelasId: "",
  nama: "",
  kelas: "",
  jenis: "Positif",
  catatan: "",
  poin: "10",
  tanggal: new Date().toISOString().slice(0, 10),
};

function getErrorMessage(err, fallback) {
  return (
    err?.response?.data?.message ||
    err?.data?.message ||
    err?.message ||
    fallback
  );
}

function extractArray(res) {
  const payload = res?.data ?? res;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toInputDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toISOString().slice(0, 10);
}

export default function SikapPerilakuPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [records, setRecords] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterKelasId, setFilterKelasId] = useState("Semua");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadMasterData = useCallback(async () => {
    try {
      const [siswaRes, kelasRes] = await Promise.allSettled([
        getUsers({ page: 1, limit: 200, role: "siswa" }),
        getKelas({ page: 1, limit: 100, sortBy: "nama", sortOrder: "asc" }),
      ]);

      if (siswaRes.status === "fulfilled") {
        setSiswaList(extractArray(siswaRes.value));
      }
      if (kelasRes.status === "fulfilled") {
        setKelasList(extractArray(kelasRes.value));
      }
    } catch {
      // Non-blocking: catatan tetap bisa dimuat meski dropdown master sebagian gagal
    }
  }, []);

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSikapPerilaku({
        jenis: filterJenis,
        kelasId: filterKelasId,
        search,
      });

      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, "Gagal memuat data sikap & perilaku."));
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [filterJenis, filterKelasId, search]);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadMasterData();
    });
  }, [loadMasterData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRecords();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadRecords]);

  const stats = useMemo(() => {
    let positif = 0;
    let negatif = 0;
    let netral = 0;
    let totalPoin = 0;

    for (const item of records) {
      const jenis = String(item?.jenis || "").toLowerCase();
      const poin = Number(item?.poin) || 0;
      totalPoin += poin;
      if (jenis === "positif") positif += 1;
      else if (jenis === "negatif") negatif += 1;
      else netral += 1;
    }

    return {
      total: records.length,
      positif,
      negatif,
      netral,
      totalPoin,
    };
  }, [records]);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      siswaId: item?.siswaId || item?.siswa?.id || "",
      kelasId: item?.kelasId || item?.kelasRel?.id || "",
      nama: item?.siswa?.namaLengkap || item?.nama || "",
      kelas: item?.kelasRel?.nama || item?.kelas || "",
      jenis: item?.jenis || "Positif",
      catatan: item?.catatan || "",
      poin: String(item?.poin ?? 0),
      tanggal: toInputDate(item?.tanggal),
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSelectSiswa = (siswaId) => {
    const found = siswaList.find((s) => String(s.id) === String(siswaId));
    const kelasFromSiswa =
      found?.anggotaKelas?.[0]?.kelas || found?.kelas || null;

    setForm((prev) => ({
      ...prev,
      siswaId,
      nama: found?.namaLengkap || found?.name || prev.nama,
      kelasId: kelasFromSiswa?.id ? String(kelasFromSiswa.id) : prev.kelasId,
      kelas: kelasFromSiswa?.nama || prev.kelas,
    }));
  };

  const handleSelectKelas = (kelasId) => {
    const found = kelasList.find((k) => String(k.id) === String(kelasId));
    setForm((prev) => ({
      ...prev,
      kelasId,
      kelas: found?.nama || found?.namaKelas || "",
    }));
  };

  const handleJenisChange = (jenis) => {
    setForm((prev) => {
      let nextPoin = prev.poin;
      if (!editingItem) {
        if (jenis === "Positif") nextPoin = "10";
        else if (jenis === "Negatif") nextPoin = "-10";
        else nextPoin = "0";
      }
      return { ...prev, jenis, poin: nextPoin };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const cleanNama = form.nama.trim();
    const cleanCatatan = form.catatan.trim();

    if (!form.siswaId && !cleanNama) {
      setFormError("Pilih siswa atau isi nama siswa terlebih dahulu.");
      return;
    }

    if (!cleanCatatan) {
      setFormError("Catatan sikap & perilaku wajib diisi.");
      return;
    }

    const parsedPoin = Number(form.poin);
    if (Number.isNaN(parsedPoin) || parsedPoin < -1000 || parsedPoin > 1000) {
      setFormError("Poin harus berupa angka antara -1000 hingga 1000.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        siswaId: form.siswaId || null,
        kelasId: form.kelasId || null,
        nama: cleanNama || undefined,
        kelas: form.kelas.trim() || null,
        jenis: form.jenis,
        catatan: cleanCatatan,
        poin: parsedPoin,
        tanggal: form.tanggal || new Date().toISOString().slice(0, 10),
      };

      if (editingItem?.id) {
        await updateSikapPerilaku(editingItem.id, payload);
        setNotice("Catatan sikap & perilaku berhasil diperbarui.");
      } else {
        await createSikapPerilaku(payload);
        setNotice("Catatan sikap & perilaku berhasil ditambahkan.");
      }

      setModalOpen(false);
      setEditingItem(null);
      await loadRecords();
    } catch (err) {
      setFormError(
        getErrorMessage(err, "Gagal menyimpan catatan sikap & perilaku.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      setDeleting(true);
      await deleteSikapPerilaku(deleteTarget.id);
      setDeleteTarget(null);
      setNotice("Catatan sikap & perilaku berhasil dihapus.");
      await loadRecords();
    } catch (err) {
      setError(getErrorMessage(err, "Gagal menghapus catatan sikap & perilaku."));
    } finally {
      setDeleting(false);
    }
  };

  const getJenisBadgeClass = (jenis) => {
    const val = String(jenis || "").toLowerCase();
    if (val === "positif") {
      return "border-[color-mix(in_srgb,var(--color-success)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]";
    }
    if (val === "negatif") {
      return "border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)]";
    }
    return "border-[color-mix(in_srgb,var(--color-info)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)]";
  };

  return (
    <div className="theme-page theme-text flex h-screen overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          title="Sikap & Perilaku Siswa"
        />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="theme-text flex items-center gap-2 text-xl font-bold sm:text-2xl">
                <Sparkles className="text-[var(--color-primary)]" size={22} />
                Catatan Sikap & Perilaku
              </h1>
              <p className="theme-text-muted mt-1 text-sm">
                Kelola catatan pembinaan, apresiasi poin positif, dan pelanggaran siswa secara real-time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadRecords}
                disabled={loading}
                className="theme-card theme-border theme-text inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:opacity-85 disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
                Muat Ulang
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-95"
              >
                <Plus size={15} />
                Tambah Catatan
              </button>
            </div>
          </div>

          {notice && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-[color-mix(in_srgb,var(--color-success)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] px-4 py-3 text-xs text-[var(--color-success)]">
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Tutup notifikasi"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-4 py-3 text-xs text-[var(--color-danger)]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Gagal Memuat Data</p>
                <p className="mt-0.5">{error}</p>
              </div>
              <button
                type="button"
                onClick={loadRecords}
                className="rounded-lg border border-current px-2.5 py-1 text-[11px] font-semibold"
              >
                Coba Lagi
              </button>
            </div>
          )}

          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="theme-card theme-border rounded-xl border p-4">
              <p className="theme-text-muted text-xs">Total Catatan</p>
              <p className="theme-text mt-1 text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="theme-card theme-border rounded-xl border p-4">
              <p className="theme-text-muted flex items-center gap-1 text-xs">
                <ThumbsUp size={13} className="text-[var(--color-success)]" />
                Positif
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--color-success)]">
                {stats.positif}
              </p>
            </div>
            <div className="theme-card theme-border rounded-xl border p-4">
              <p className="theme-text-muted flex items-center gap-1 text-xs">
                <ThumbsDown size={13} className="text-[var(--color-danger)]" />
                Negatif
              </p>
              <p className="mt-1 text-2xl font-bold text-[var(--color-danger)]">
                {stats.negatif}
              </p>
            </div>
            <div className="theme-card theme-border rounded-xl border p-4">
              <p className="theme-text-muted flex items-center gap-1 text-xs">
                <Award size={13} className="text-[var(--color-primary)]" />
                Akumulasi Poin
              </p>
              <p className="theme-text mt-1 text-2xl font-bold">
                {stats.totalPoin > 0 ? `+${stats.totalPoin}` : stats.totalPoin}
              </p>
            </div>
          </div>

          <div className="theme-card theme-border overflow-hidden rounded-xl border">
            <div className="theme-divider flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="theme-text-muted absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama siswa atau catatan perilaku..."
                  className="theme-input theme-text w-full rounded-lg border py-2 pl-9 pr-3 text-xs focus:border-[var(--color-primary)] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <Filter size={14} className="theme-text-muted" />
                  <select
                    value={filterJenis}
                    onChange={(e) => setFilterJenis(e.target.value)}
                    className="theme-input theme-text rounded-lg border px-2.5 py-2 text-xs"
                  >
                    <option value="Semua">Semua Jenis</option>
                    <option value="Positif">Positif</option>
                    <option value="Negatif">Negatif</option>
                    <option value="Netral">Netral</option>
                  </select>
                </div>

                <select
                  value={filterKelasId}
                  onChange={(e) => setFilterKelasId(e.target.value)}
                  className="theme-input theme-text rounded-lg border px-2.5 py-2 text-xs"
                >
                  <option value="Semua">Semua Kelas</option>
                  {kelasList.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.nama || kelas.namaKelas}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center p-8">
                <Loader2
                  size={28}
                  className="animate-spin text-[var(--color-primary)]"
                />
                <p className="theme-text-muted mt-2 text-xs">
                  Memuat catatan sikap & perilaku...
                </p>
              </div>
            ) : records.length === 0 ? (
              <div className="flex min-h-[240px] flex-col items-center justify-center p-8 text-center">
                <MessageSquare size={28} className="theme-text-muted mb-2" />
                <p className="theme-text text-sm font-semibold">
                  Belum Ada Catatan Sikap & Perilaku
                </p>
                <p className="theme-text-muted mt-1 max-w-sm text-xs">
                  Belum ada data untuk filter saat ini. Klik Tambah Catatan untuk mencatat sikap atau perilaku siswa.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="theme-divider border-b bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Siswa</th>
                      <th className="px-4 py-3 font-semibold">Kelas</th>
                      <th className="px-4 py-3 font-semibold">Jenis</th>
                      <th className="px-4 py-3 font-semibold">Poin</th>
                      <th className="px-4 py-3 font-semibold">Tanggal</th>
                      <th className="px-4 py-3 font-semibold">Catatan</th>
                      <th className="px-4 py-3 text-right font-semibold">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color-mix(in_srgb,var(--color-text)_8%,transparent)]">
                    {records.map((item) => {
                      const namaSiswa =
                        item?.siswa?.namaLengkap || item?.nama || "-";
                      const namaKelas =
                        item?.kelasRel?.nama || item?.kelas || "-";
                      const poinNum = Number(item?.poin) || 0;

                      return (
                        <tr
                          key={item.id}
                          className="transition hover:bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                                <User size={13} />
                              </span>
                              <div>
                                <p className="theme-text font-semibold">
                                  {namaSiswa}
                                </p>
                                {(item?.siswa?.nisn || item?.siswa?.nipd) && (
                                  <p className="theme-text-muted text-[11px]">
                                    {item?.siswa?.nisn || item?.siswa?.nipd}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="theme-text-secondary px-4 py-3">
                            {namaKelas}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getJenisBadgeClass(
                                item.jenis
                              )}`}
                            >
                              {item.jenis}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold">
                            <span
                              className={
                                poinNum > 0
                                  ? "text-[var(--color-success)]"
                                  : poinNum < 0
                                  ? "text-[var(--color-danger)]"
                                  : "theme-text-muted"
                              }
                            >
                              {poinNum > 0 ? `+${poinNum}` : poinNum}
                            </span>
                          </td>
                          <td className="theme-text-secondary whitespace-nowrap px-4 py-3">
                            <span className="inline-flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(item.tanggal)}
                            </span>
                          </td>
                          <td className="theme-text-secondary max-w-xs px-4 py-3">
                            <p className="line-clamp-2">{item.catatan}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="theme-border rounded-lg border p-1.5 text-[var(--color-primary)] transition hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
                                title="Edit catatan"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(item)}
                                className="theme-border rounded-lg border p-1.5 text-[var(--color-danger)] transition hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]"
                                title="Hapus catatan"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="theme-card theme-border w-full max-w-lg rounded-2xl border p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="theme-text text-base font-bold">
                {editingItem
                  ? "Edit Catatan Sikap & Perilaku"
                  : "Tambah Catatan Sikap & Perilaku"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="theme-text-muted rounded-lg p-1 hover:opacity-80"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="mb-3 rounded-lg border border-[color-mix(in_srgb,var(--color-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] px-3 py-2 text-xs text-[var(--color-danger)]">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="theme-text mb-1 block font-semibold">
                  Pilih Siswa Terdaftar
                </label>
                <select
                  value={form.siswaId}
                  onChange={(e) => handleSelectSiswa(e.target.value)}
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2"
                >
                  <option value="">-- Pilih dari data siswa (atau isi nama manual) --</option>
                  {siswaList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.namaLengkap || s.name}
                      {s.nisn ? ` (${s.nisn})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="theme-text mb-1 block font-semibold">
                  Nama Siswa *
                </label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, nama: e.target.value }))
                  }
                  placeholder="Nama lengkap siswa"
                  required
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="theme-text mb-1 block font-semibold">
                    Kelas
                  </label>
                  <select
                    value={form.kelasId}
                    onChange={(e) => handleSelectKelas(e.target.value)}
                    className="theme-input theme-text w-full rounded-lg border px-3 py-2"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama || k.namaKelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="theme-text mb-1 block font-semibold">
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    value={form.tanggal}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, tanggal: e.target.value }))
                    }
                    required
                    className="theme-input theme-text w-full rounded-lg border px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="theme-text mb-1 block font-semibold">
                    Jenis Perilaku *
                  </label>
                  <select
                    value={form.jenis}
                    onChange={(e) => handleJenisChange(e.target.value)}
                    className="theme-input theme-text w-full rounded-lg border px-3 py-2"
                  >
                    <option value="Positif">Positif</option>
                    <option value="Negatif">Negatif</option>
                    <option value="Netral">Netral</option>
                  </select>
                </div>

                <div>
                  <label className="theme-text mb-1 block font-semibold">
                    Poin (-1000 s/d 1000)
                  </label>
                  <input
                    type="number"
                    min={-1000}
                    max={1000}
                    value={form.poin}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, poin: e.target.value }))
                    }
                    className="theme-input theme-text w-full rounded-lg border px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="theme-text mb-1 block font-semibold">
                  Catatan *
                </label>
                <textarea
                  rows={3}
                  value={form.catatan}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, catatan: e.target.value }))
                  }
                  placeholder="Tuliskan kronologi atau catatan perilaku siswa..."
                  required
                  className="theme-input theme-text w-full rounded-lg border px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="theme-border theme-text rounded-lg border px-4 py-2 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-primary)] px-4 py-2 font-semibold text-white disabled:opacity-60"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editingItem ? "Simpan Perubahan" : "Simpan Catatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="theme-card theme-border w-full max-w-sm rounded-2xl border p-5 shadow-xl">
            <h3 className="theme-text text-sm font-bold">
              Hapus Catatan Sikap & Perilaku?
            </h3>
            <p className="theme-text-muted mt-2 text-xs leading-relaxed">
              Catatan milik{" "}
              <span className="theme-text font-semibold">
                {deleteTarget?.siswa?.namaLengkap || deleteTarget?.nama || "siswa ini"}
              </span>{" "}
              akan dihapus dari sistem.
            </p>
            <div className="mt-4 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="theme-border theme-text rounded-lg border px-3.5 py-2 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-danger)] px-3.5 py-2 font-semibold text-white disabled:opacity-60"
              >
                {deleting && <Loader2 size={13} className="animate-spin" />}
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
