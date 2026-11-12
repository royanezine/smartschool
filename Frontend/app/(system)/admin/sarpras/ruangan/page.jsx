"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getRuangan, deleteRuangan } from "@/services/sarpras.service";
import {
  DoorOpen, Plus, Search, RefreshCw, Pencil, Trash2, Eye,
  MapPin, Users, Loader2, AlertCircle, ClipboardList,
  CheckCircle2, X, Building2, Layers3,
} from "lucide-react";

function extractData(response) {
  if (Array.isArray(response)) return response;

  const candidates = [
    response?.data?.ruangan,
    response?.data?.items,
    response?.data?.data,
    response?.data,
    response?.ruangan,
    response?.items,
    response?.result,
  ];

  for (const value of candidates) {
    if (Array.isArray(value)) return value;

    if (value && typeof value === "object") {
      if (Array.isArray(value.ruangan)) return value.ruangan;
      if (Array.isArray(value.items)) return value.items;
      if (Array.isArray(value.data)) return value.data;
    }
  }

  return [];
}

function firstValue(...values) {
  return values.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  );
}

function getRelation(item, keys) {
  for (const key of keys) {
    if (item?.[key] !== undefined && item?.[key] !== null) {
      return item[key];
    }
  }
  return null;
}

function normalizeRuangan(item) {
  const gedung = getRelation(item, [
    "gedung", "Gedung", "dataGedung", "data_gedung",
  ]);

  const lantai = getRelation(item, [
    "lantai", "Lantai", "dataLantai", "data_lantai",
  ]);

  const namaGedung =
    typeof gedung === "string"
      ? gedung
      : firstValue(
          gedung?.nama,
          gedung?.namaGedung,
          gedung?.nama_gedung,
          gedung?.name
        ) || "";

  const kodeGedung =
    firstValue(
      gedung?.kode,
      gedung?.kodeGedung,
      gedung?.kode_gedung,
      gedung?.code
    ) || "";

  const namaLantai =
    typeof lantai === "string"
      ? lantai
      : firstValue(
          lantai?.nama,
          lantai?.namaLantai,
          lantai?.nama_lantai,
          lantai?.name
        ) || "";

  const nomorLantai =
    firstValue(
      lantai?.nomorLantai,
      lantai?.nomor_lantai,
      lantai?.nomor,
      lantai?.level
    ) ?? "";

  return {
    ...item,
    id: item.id,
    nama: item.nama ?? item.name ?? "",
    lokasi: item.lokasi ?? item.location ?? "",
    kapasitas: item.kapasitas ?? item.capacity ?? null,
    keterangan: item.keterangan ?? item.description ?? "",
    gedung,
    lantai,
    gedungId:
      item.gedungId ?? item.gedung_id ?? gedung?.id ?? null,
    lantaiId:
      item.lantaiId ?? item.lantai_id ?? lantai?.id ?? null,
    namaGedung,
    kodeGedung,
    namaLantai,
    nomorLantai,
  };
}

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    "Terjadi kesalahan. Silakan coba lagi."
  );
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("id-ID");
}

function InfoKosong({ children = "Belum terhubung" }) {
  return (
    <span className="theme-text-muted text-xs italic">
      {children}
    </span>
  );
}

function Stat({ label, value, subtitle, icon: Icon }) {
  const toneClass =
    "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text";

  return (
    <div className="theme-card h-full rounded-2xl border theme-border p-5 shadow-xl transition hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider theme-text-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight theme-text">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${toneClass}`}
        >
          <Icon size={20} />
        </div>
      </div>

      {subtitle && (
        <p className="mt-3 text-xs font-medium theme-text-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function RuanganPage() {
  const router = useRouter();

  const [ruanganList, setRuanganList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadRuangan = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      setErrorMessage("");

      const response = await getRuangan();
      console.log("RESPONSE RUANGAN:", response);

      if (response?.success === false) {
        throw new Error(response.message || "Gagal mengambil data ruangan.");
      }

      const normalized = extractData(response).map(normalizeRuangan);
      console.log("DATA RUANGAN NORMALIZED:", normalized);

      setRuanganList(normalized);
    } catch (error) {
      console.error("Gagal mengambil data ruangan:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRuangan();
  }, [loadRuangan]);

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  const filteredRuangan = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return ruanganList;

    return ruanganList.filter((item) =>
      [
        item.nama,
        item.lokasi,
        item.keterangan,
        item.namaGedung,
        item.kodeGedung,
        item.namaLantai,
        item.nomorLantai,
        item.gedungId,
        item.lantaiId,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(keyword)
      )
    );
  }, [ruanganList, searchTerm]);

  const totalKapasitas = ruanganList.reduce(
    (total, item) => total + (Number(item.kapasitas) || 0),
    0
  );

  const totalGedung = ruanganList.filter(
    (item) => item.gedungId || item.namaGedung
  ).length;

  const totalLantai = ruanganList.filter(
    (item) =>
      item.lantaiId ||
      item.namaLantai ||
      item.nomorLantai !== ""
  ).length;

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setErrorMessage("");

      const response = await deleteRuangan(deleteTarget.id);

      if (response?.success === false) {
        throw new Error(response.message || "Gagal menghapus ruangan.");
      }

      setSuccessMessage(
        `Ruangan "${deleteTarget.nama}" berhasil dihapus.`
      );
      setDeleteTarget(null);
      await loadRuangan(false);
    } catch (error) {
      console.error("Gagal menghapus ruangan:", error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={false}
        setCollapsed={() => {}}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => {}}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8 2xl:px-12">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white shadow-lg">
                  <DoorOpen size={28} />
                </div>
                <div>
                  <h1 className="theme-text text-2xl font-bold sm:text-3xl">
                    Pengelolaan Ruangan
                  </h1>
                  <p className="theme-text-muted mt-1 text-sm">
                    Kelola ruangan berdasarkan gedung, lantai, lokasi, dan kapasitas sekolah.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => loadRuangan(false)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 rounded-xl border theme-border px-4 py-2.5 text-sm font-medium theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                  Refresh
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/admin/sarpras/ruangan/tambah")}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
                >
                  <Plus size={18} />
                  Tambah Ruangan
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-600">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div className="flex-1 font-medium">{errorMessage}</div>
                <button type="button" onClick={() => setErrorMessage("")}>
                  <X size={16} />
                </button>
              </div>
            )}

            {successMessage && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-600">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <div className="flex-1 font-medium">{successMessage}</div>
                <button type="button" onClick={() => setSuccessMessage("")}>
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                label="Total Ruangan"
                value={formatNumber(ruanganList.length)}
                subtitle="Ruangan terdaftar"
                icon={DoorOpen}
              />

              <Stat
                label="Total Kapasitas"
                value={formatNumber(totalKapasitas)}
                subtitle="Total daya tampung"
                icon={Users}
              />

              <Stat
                label="Terhubung Gedung"
                value={formatNumber(totalGedung)}
                subtitle="Memiliki data gedung"
                icon={Building2}
              />

              <Stat
                label="Terhubung Lantai"
                value={formatNumber(totalLantai)}
                subtitle="Memiliki data lantai"
                icon={Layers3}
              />
            </div>

            <section className="theme-card overflow-hidden rounded-2xl border theme-border shadow-sm">
              <div className="flex flex-col gap-4 border-b theme-border p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="theme-text text-lg font-bold">Data Ruangan Sekolah</h2>
                  <p className="theme-text-muted mt-0.5 text-xs">
                    Informasi ruangan beserta gedung dan lantainya.
                  </p>
                </div>

                <div className="relative w-full sm:max-w-sm">
                  <Search size={18} className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Cari ruangan, gedung, lantai..."
                    className="theme-input w-full rounded-xl border theme-border py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px] text-left">
                  <thead className="border-b theme-border">
                    <tr className="bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)]">
                      {["No", "Nama Ruangan", "Gedung", "Lantai", "Lokasi", "Kapasitas", "Keterangan", "Aksi"].map((label) => (
                        <th key={label} className="theme-text-muted px-5 py-4 text-[11px] font-bold uppercase tracking-wider">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--color-border-soft)]">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-20 text-center">
                          <Loader2 size={32} className="mx-auto animate-spin text-[var(--color-primary)]" />
                          <p className="theme-text-muted mt-4 text-sm">Memuat data ruangan...</p>
                        </td>
                      </tr>
                    ) : filteredRuangan.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-20 text-center">
                          <ClipboardList size={32} className="mx-auto text-[var(--color-primary)]" />
                          <h3 className="theme-text mt-4 font-bold">
                            {searchTerm ? "Data Tidak Ditemukan" : "Belum Ada Ruangan"}
                          </h3>
                          <p className="theme-text-muted mt-1 text-sm">
                            {searchTerm
                              ? "Tidak ada data yang cocok dengan pencarian."
                              : "Silakan tambahkan ruangan baru."}
                          </p>
                          {!searchTerm && (
                            <button
                              type="button"
                              onClick={() => router.push("/admin/sarpras/ruangan/tambah")}
                              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white"
                            >
                              <Plus size={16} /> Tambah Ruangan
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      filteredRuangan.map((item, index) => (
                        <tr key={item.id || index} className="group hover:bg-[color-mix(in_srgb,var(--color-primary)_3%,transparent)]">
                          <td className="theme-text-muted px-5 py-4 text-center font-mono text-xs">
                            {String(index + 1).padStart(2, "0")}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] text-[var(--color-primary)]">
                                <DoorOpen size={18} />
                              </div>
                              <div>
                                <p className="theme-text text-sm font-semibold">{item.nama || "-"}</p>
                                <p className="theme-text-muted mt-0.5 text-[11px]">ID: {item.id || "-"}</p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            {item.namaGedung ? (
                              <div className="flex items-center gap-2.5">
                                <Building2 size={17} className="text-[var(--color-info)]" />
                                <div>
                                  <p className="theme-text text-sm font-semibold">{item.namaGedung}</p>
                                  <p className="theme-text-muted text-xs">
                                    {item.kodeGedung ? `Kode: ${item.kodeGedung}` : "Gedung"}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <InfoKosong>
                                {item.gedungId ? `ID: ${item.gedungId}` : "Belum terhubung"}
                              </InfoKosong>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {item.namaLantai || item.nomorLantai !== "" ? (
                              <div className="flex items-center gap-2.5">
                                <Layers3 size={17} className="text-[var(--color-warning)]" />
                                <div>
                                  <p className="theme-text text-sm font-semibold">
                                    {item.namaLantai || `Lantai ${item.nomorLantai}`}
                                  </p>
                                  {item.namaLantai && item.nomorLantai !== "" && (
                                    <p className="theme-text-muted text-xs">
                                      Nomor lantai: {item.nomorLantai}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <InfoKosong>
                                {item.lantaiId ? `ID: ${item.lantaiId}` : "Belum terhubung"}
                              </InfoKosong>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            {item.lokasi ? (
                              <div className="flex items-center gap-2">
                                <MapPin size={15} className="text-[var(--color-primary)]" />
                                <span className="theme-text-secondary text-sm">{item.lokasi}</span>
                              </div>
                            ) : <InfoKosong>Belum diatur</InfoKosong>}
                          </td>

                          <td className="px-5 py-4">
                            {item.kapasitas !== null && item.kapasitas !== undefined && item.kapasitas !== "" ? (
                              <div className="inline-flex items-center gap-2 rounded-lg bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)] px-3 py-1.5">
                                <Users size={14} className="text-[var(--color-success)]" />
                                <span className="theme-text text-sm font-semibold">{formatNumber(item.kapasitas)}</span>
                                <span className="theme-text-muted text-xs">Orang</span>
                              </div>
                            ) : <InfoKosong>Belum ditentukan</InfoKosong>}
                          </td>

                          <td className="px-5 py-4">
                            <span title={item.keterangan || ""} className="theme-text-secondary block max-w-[220px] truncate text-xs">
                              {item.keterangan || "-"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                title="Lihat Detail"
                                onClick={() => router.push(`/admin/sarpras/ruangan/${item.id}`)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg theme-text-muted hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
                              >
                                <Eye size={17} />
                              </button>
                              <button
                                type="button"
                                title="Edit Ruangan"
                                onClick={() => router.push(`/admin/sarpras/ruangan/${item.id}/edit`)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg theme-text-muted hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
                              >
                                <Pencil size={17} />
                              </button>
                              <button
                                type="button"
                                title="Hapus Ruangan"
                                onClick={() => setDeleteTarget(item)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-danger)] hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]"
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

              {!loading && filteredRuangan.length > 0 && (
                <div className="flex flex-col gap-2 border-t theme-border px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="theme-text-muted text-xs">
                    Menampilkan <strong className="theme-text">{filteredRuangan.length}</strong> dari{" "}
                    <strong className="theme-text">{ruanganList.length}</strong> ruangan
                  </p>
                  <p className="theme-text-muted text-xs">
                    Total kapasitas: <strong className="theme-text">{formatNumber(totalKapasitas)} orang</strong>
                  </p>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup dialog"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="theme-card relative w-full max-w-sm rounded-2xl border theme-border p-6 shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <AlertCircle size={28} />
            </div>
            <h3 className="theme-text text-center text-lg font-bold">Hapus Ruangan?</h3>
            <p className="theme-text-secondary mt-2 text-center text-sm">
              Apakah Anda yakin ingin menghapus ruangan{" "}
              <strong className="theme-text">"{deleteTarget.nama}"</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border theme-border py-2.5 text-sm font-semibold theme-text-secondary disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}