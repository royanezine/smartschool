"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import {
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  X,
  Search,
  RefreshCw,
} from "lucide-react";

import {
  getJalurPpdb,
  createJalurPpdb,
  updateJalurPpdb,
  deleteJalurPpdb,
} from "../../../services/jalurPpdb.service";

// =========================================================
// STYLE
// =========================================================

const STATUS_STYLES = {
  aktif: "bg-emerald-50 text-emerald-600 border-emerald-100",
  nonaktif: "bg-slate-100 text-slate-500 border-slate-200",
};

const STATUS_FILTERS = ["Semua", "Aktif", "Nonaktif"];

const PRESET_COLORS = [
  "#3B82F6",
  "#D97706",
  "#E11D48",
  "#7C3AED",
  "#059669",
  "#0EA5E9",
];

function formatNumber(n) {
  return Number(n || 0).toLocaleString("id-ID");
}

function emptyForm() {
  return {
    id: null,
    nama: "",
    deskripsi: "",
    kuota: "",
    status: "aktif",
    tanggalMulai: "",
    tanggalSelesai: "",
  };
}

function normalizeStatus(status) {
  if (!status) return "aktif";

  const value = String(status).toLowerCase();

  if (
    value === "aktif" ||
    value === "active"
  ) {
    return "aktif";
  }

  return "nonaktif";
}

function statusLabel(status) {
  return normalizeStatus(status) === "aktif"
    ? "Aktif"
    : "Nonaktif";
}

function getColor(index) {
  return PRESET_COLORS[index % PRESET_COLORS.length];
}

export default function JalurPPDBPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [jalurList, setJalurList] = useState([]);

  const [activeStatus, setActiveStatus] = useState("Semua");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState(emptyForm());

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD DATA
  // =========================================================

  const fetchJalur = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getJalurPpdb();

      const data =
        response?.data ??
        response?.result ??
        [];

      setJalurList(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error("Error fetch jalur PPDB:", err);

      setError(
        err?.message ||
          "Gagal mengambil data jalur PPDB"
      );

      setJalurList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJalur();
  }, [fetchJalur]);

  // =========================================================
  // FILTER
  // =========================================================

  const filtered = useMemo(() => {
    return jalurList.filter((j) => {
      const status = normalizeStatus(j.status);

      const matchStatus =
        activeStatus === "Semua" ||
        statusLabel(status) === activeStatus;

      const matchSearch =
        String(j.nama || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchStatus && matchSearch;
    });
  }, [jalurList, activeStatus, search]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalKuota = useMemo(() => {
    return jalurList.reduce(
      (total, j) =>
        total + Number(j.kuota || 0),
      0
    );
  }, [jalurList]);

  const aktifCount = useMemo(() => {
    return jalurList.filter(
      (j) => normalizeStatus(j.status) === "aktif"
    ).length;
  }, [jalurList]);

  /*
   * Backend getJalurPpdb saat ini belum mengirim jumlah
   * pendaftar per jalur.
   *
   * Jadi untuk sementara persentase "Kuota Terisi"
   * tidak dihitung dari dummy.
   *
   * Nanti bisa dibuat endpoint statistik/count
   * dari backend.
   */
  const totalPendaftar = 0;

  // =========================================================
  // TAMBAH
  // =========================================================

  const openTambah = () => {
    setError("");
    setForm(emptyForm());
    setShowModal(true);
  };

  // =========================================================
  // EDIT
  // =========================================================

  const openEdit = (j) => {
    setError("");

    setForm({
      id: j.id,
      nama: j.nama || "",
      deskripsi: j.deskripsi || "",
      kuota: j.kuota ?? "",
      status: normalizeStatus(j.status),
      tanggalMulai: j.tanggalMulai
        ? String(j.tanggalMulai).slice(0, 10)
        : "",
      tanggalSelesai: j.tanggalSelesai
        ? String(j.tanggalSelesai).slice(0, 10)
        : "",
    });

    setShowModal(true);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nama.trim()) {
      setError("Nama jalur wajib diisi.");
      return;
    }

    if (
      form.kuota === "" ||
      Number(form.kuota) <= 0
    ) {
      setError("Kuota harus lebih dari 0.");
      return;
    }

    if (
      form.tanggalMulai &&
      form.tanggalSelesai &&
      new Date(form.tanggalSelesai) <
        new Date(form.tanggalMulai)
    ) {
      setError(
        "Tanggal selesai tidak boleh sebelum tanggal mulai."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        nama: form.nama.trim(),
        deskripsi: form.deskripsi.trim() || undefined,
        kuota: Number(form.kuota),
        tanggalMulai:
          form.tanggalMulai || undefined,
        tanggalSelesai:
          form.tanggalSelesai || undefined,
        status: form.status,
      };

      if (form.id) {
        await updateJalurPpdb(
          form.id,
          payload
        );
      } else {
        await createJalurPpdb(payload);
      }

      setShowModal(false);
      setForm(emptyForm());

      await fetchJalur();
    } catch (err) {
      console.error(
        "Error simpan jalur PPDB:",
        err
      );

      setError(
        err?.message ||
          "Gagal menyimpan jalur PPDB"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;

    try {
      setDeleting(true);
      setError("");

      await deleteJalurPpdb(
        deleteTarget.id
      );

      setDeleteTarget(null);

      await fetchJalur();
    } catch (err) {
      console.error(
        "Error hapus jalur PPDB:",
        err
      );

      setError(
        err?.message ||
          "Gagal menghapus jalur PPDB"
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // SIDEBAR
  // =========================================================

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="flex h-screen w-full bg-[#EEF0F2] overflow-hidden">
      <Sidebar
        role="adminPPDB"
        active="jalur"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin PPDB",
            email: "adminppdb@smartschool.com",
            avatar: "PP",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full p-4 md:p-6 lg:p-8">
            <div className="w-full space-y-5 max-w-[1320px] mx-auto">

              {/* BREADCRUMB */}

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>PPDB</span>
                <ChevronRight size={12} />
                <span className="text-slate-600 font-medium">
                  Jalur Pendaftaran
                </span>
              </div>

              {/* ERROR */}

              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-lg px-4 py-3 text-xs flex items-center justify-between gap-3">
                  <span>{error}</span>

                  <button
                    onClick={() => setError("")}
                    className="text-rose-400 hover:text-rose-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {/* SUMMARY */}

              <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">
                    Total Jalur
                  </p>

                  <p className="text-2xl font-bold text-slate-800 mt-2">
                    {loading
                      ? "..."
                      : jalurList.length}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">
                    Jalur Aktif
                  </p>

                  <p className="text-2xl font-bold text-emerald-500 mt-2">
                    {loading
                      ? "..."
                      : aktifCount}
                  </p>
                </div>

                <div className="bg-white rounded-xl p-5">
                  <p className="text-xs text-slate-400">
                    Total Kuota
                  </p>

                  <p className="text-2xl font-bold text-slate-800 mt-2">
                    {loading
                      ? "..."
                      : formatNumber(totalKuota)}
                  </p>
                </div>

                <div className="bg-[#F6F7F8] rounded-xl p-5 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-slate-400">
                    Kuota Terisi
                  </p>

                  <p className="text-3xl font-bold text-slate-500 mt-3">
                    {totalKuota > 0
                      ? Math.round(
                          (totalPendaftar /
                            totalKuota) *
                            100
                        )
                      : 0}
                    %
                  </p>

                  <p className="text-[10px] text-slate-400 mt-1">
                    Menunggu data pendaftar
                  </p>
                </div>
              </section>

              {/* PANEL */}

              <section className="bg-white rounded-xl overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 pb-4 border-b border-slate-100">

                  <div className="flex items-center gap-5">
                    {STATUS_FILTERS.map((f) => (
                      <button
                        key={f}
                        onClick={() =>
                          setActiveStatus(f)
                        }
                        className={`relative pb-2.5 text-sm font-medium transition-colors ${
                          activeStatus === f
                            ? "text-blue-600"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {f}

                        {activeStatus === f && (
                          <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-blue-600 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">

                    <button
                      onClick={fetchJalur}
                      disabled={loading}
                      className="flex items-center justify-center border border-slate-200 hover:border-slate-300 text-slate-500 rounded-md p-2 transition-colors disabled:opacity-50"
                      title="Refresh"
                    >
                      <RefreshCw
                        size={14}
                        className={
                          loading
                            ? "animate-spin"
                            : ""
                        }
                      />
                    </button>

                    <div className="flex items-center gap-2 text-xs text-slate-500 border border-slate-200 rounded-md px-3 py-1.5">
                      <Search
                        size={13}
                        className="text-slate-400"
                      />

                      <input
                        value={search}
                        onChange={(e) =>
                          setSearch(e.target.value)
                        }
                        placeholder="Cari jalur..."
                        className="outline-none bg-transparent placeholder:text-slate-400 w-32"
                      />
                    </div>

                    <button
                      onClick={openTambah}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-2 rounded-md transition-colors"
                    >
                      <Plus size={14} />
                      Tambah Jalur
                    </button>
                  </div>
                </div>

                {/* DAFTAR */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">

                  {loading && (
                    <>
                      {[1, 2, 3, 4].map(
                        (item) => (
                          <div
                            key={item}
                            className="border border-slate-100 rounded-xl p-4 animate-pulse"
                          >
                            <div className="h-4 bg-slate-100 rounded w-32" />
                            <div className="h-3 bg-slate-100 rounded w-full mt-4" />
                            <div className="h-3 bg-slate-100 rounded w-3/4 mt-2" />
                            <div className="h-2 bg-slate-100 rounded w-full mt-6" />
                          </div>
                        )
                      )}
                    </>
                  )}

                  {!loading &&
                    filtered.length === 0 && (
                      <p className="text-center text-slate-400 text-sm col-span-2 py-10">
                        {search ||
                        activeStatus !==
                          "Semua"
                          ? "Tidak ada jalur ditemukan."
                          : "Belum ada jalur PPDB."}
                      </p>
                    )}

                  {!loading &&
                    filtered.map(
                      (j, index) => {
                        const color =
                          getColor(index);

                        /*
                         * Backend saat ini belum
                         * mengirim jumlah pendaftar.
                         */
                        const pendaftar = 0;

                        const persen =
                          Number(j.kuota) > 0
                            ? Math.min(
                                100,
                                Math.round(
                                  (pendaftar /
                                    Number(
                                      j.kuota
                                    )) *
                                    100
                                )
                              )
                            : 0;

                        const status =
                          normalizeStatus(
                            j.status
                          );

                        return (
                          <div
                            key={j.id}
                            className="border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-start justify-between gap-2">

                              <div className="flex items-center gap-2.5">
                                <span
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor:
                                      color,
                                  }}
                                />

                                <h4 className="text-sm font-semibold text-slate-700">
                                  {j.nama}
                                </h4>
                              </div>

                              <span
                                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${
                                  STATUS_STYLES[
                                    status
                                  ] ||
                                  STATUS_STYLES
                                    .nonaktif
                                }`}
                              >
                                {statusLabel(
                                  status
                                )}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                              {j.deskripsi ||
                                "Tidak ada deskripsi."}
                            </p>

                            {/* INFO TANGGAL */}

                            {(j.tanggalMulai ||
                              j.tanggalSelesai) && (
                              <div className="mt-3 text-[10px] text-slate-400">
                                Periode:{" "}
                                {j.tanggalMulai
                                  ? new Date(
                                      j.tanggalMulai
                                    ).toLocaleDateString(
                                      "id-ID"
                                    )
                                  : "-"}

                                {" - "}

                                {j.tanggalSelesai
                                  ? new Date(
                                      j.tanggalSelesai
                                    ).toLocaleDateString(
                                      "id-ID"
                                    )
                                  : "-"}
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-4">
                              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${persen}%`,
                                    backgroundColor:
                                      color,
                                  }}
                                />
                              </div>

                              <span className="text-xs text-slate-500 font-mono tabular-nums whitespace-nowrap">
                                {formatNumber(
                                  pendaftar
                                )}
                                /
                                {formatNumber(
                                  j.kuota
                                )}
                              </span>
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-3.5 pt-3 border-t border-slate-50">

                              <button
                                onClick={() =>
                                  openEdit(j)
                                }
                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors"
                              >
                                <Pencil size={12} />
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  setDeleteTarget(
                                    j
                                  )
                                }
                                className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors"
                              >
                                <Trash2 size={12} />
                                Hapus
                              </button>
                            </div>
                          </div>
                        );
                      }
                    )}
                </div>
              </section>

              <footer className="text-center text-[11px] text-slate-400 py-3">
                © 2026 SmartSchool · Dashboard Admin
                PPDB · All rights reserved
              </footer>
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          MODAL TAMBAH / EDIT
      ====================================================== */}

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-slate-800">
                {form.id
                  ? "Edit Jalur"
                  : "Tambah Jalur"}
              </h3>

              <button
                onClick={() =>
                  !saving &&
                  setShowModal(false)
                }
                className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* ERROR MODAL */}

              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 rounded-md px-3 py-2 text-xs">
                  {error}
                </div>
              )}

              {/* NAMA */}

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Nama Jalur
                </label>

                <input
                  value={form.nama}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      nama: e.target.value,
                    })
                  }
                  placeholder="Contoh: Jalur Zonasi"
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400"
                  required
                  disabled={saving}
                />
              </div>

              {/* DESKRIPSI */}

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Deskripsi
                </label>

                <textarea
                  value={form.deskripsi}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      deskripsi: e.target.value,
                    })
                  }
                  placeholder="Penjelasan singkat mengenai jalur ini"
                  rows={2}
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400 resize-none"
                  disabled={saving}
                />
              </div>

              {/* KUOTA */}

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Kuota
                </label>

                <input
                  type="number"
                  min="1"
                  value={form.kuota}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      kuota: e.target.value,
                    })
                  }
                  placeholder="500"
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400"
                  required
                  disabled={saving}
                />
              </div>

              {/* TANGGAL MULAI */}

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Tanggal Mulai
                </label>

                <input
                  type="date"
                  value={form.tanggalMulai}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tanggalMulai:
                        e.target.value,
                    })
                  }
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400"
                  disabled={saving}
                />
              </div>

              {/* TANGGAL SELESAI */}

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Tanggal Selesai
                </label>

                <input
                  type="date"
                  value={form.tanggalSelesai}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tanggalSelesai:
                        e.target.value,
                    })
                  }
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400"
                  disabled={saving}
                />
              </div>

              {/* STATUS */}

              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value,
                    })
                  }
                  className="w-full text-sm border border-slate-200 rounded-md px-3 py-2 outline-none focus:border-blue-400 bg-white"
                  disabled={saving}
                >
                  <option value="aktif">
                    Aktif
                  </option>

                  <option value="nonaktif">
                    Nonaktif
                  </option>
                </select>
              </div>

              {/* BUTTON */}

              <div className="flex items-center justify-end gap-2 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="text-xs font-medium text-slate-500 hover:text-slate-700 px-4 py-2"
                  disabled={saving}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Menyimpan..."
                    : form.id
                    ? "Simpan Perubahan"
                    : "Tambah Jalur"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL HAPUS
      ====================================================== */}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">

            <h3 className="text-sm font-semibold text-slate-800 mb-2">
              Hapus Jalur?
            </h3>

            <p className="text-xs text-slate-500 mb-5">
              Jalur{" "}
              <span className="font-medium text-slate-700">
                {deleteTarget.nama}
              </span>{" "}
              akan dinonaktifkan dari data PPDB.
            </p>

            <div className="flex items-center justify-end gap-2">

              <button
                onClick={() =>
                  !deleting &&
                  setDeleteTarget(null)
                }
                className="text-xs font-medium text-slate-500 hover:text-slate-700 px-4 py-2"
                disabled={deleting}
              >
                Batal
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-60"
              >
                {deleting
                  ? "Menghapus..."
                  : "Ya, Hapus"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}