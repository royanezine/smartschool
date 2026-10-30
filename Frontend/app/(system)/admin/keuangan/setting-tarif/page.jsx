"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Edit,
  Plus,
  Trash2,
  Tag,
  X,
  Check,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Settings2,
  CircleDollarSign,
  Receipt,
  AlertCircle,
  Loader2,
  Layers,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getKategoriTagihan,
  createKategoriTagihan,
  updateKategoriTagihan,
  deleteKategoriTagihan,
  getTarif,
  createTarif,
  updateTarif,
  deleteTarif,
} from "@/services/tarif.service";

import { getTahunAjaran } from "@/services/tahunAjaran.service";
import { getKelas } from "@/services/kelas.service";


const ENTRIES_PER_PAGE = 8;

const SIKLUS_OPTIONS = [
  { value: "bulanan", label: "Bulanan" },
  { value: "tahunan", label: "Tahunan" },
  { value: "sekali", label: "Sekali" },
];

const STATUS_OPTIONS = [
  { value: "aktif", label: "Aktif" },
  { value: "tidak_aktif", label: "Tidak Aktif" },
];

const TINGKAT_OPTIONS = [
  { value: "10", label: "Tingkat 10" },
  { value: "11", label: "Tingkat 11" },
  { value: "12", label: "Tingkat 12" },
];

const INITIAL_KATEGORI_FORM = {
  kode: "",
  nama: "",
  siklus: "bulanan",
  deskripsi: "",
  status: "aktif",
};

const INITIAL_TARIF_FORM = {
  kategoriTagihanId: "",
  tahunAjaranId: "",
  cakupan: "semua",
  tingkat: "",
  kelasId: "",
  nominal: "",
  keterangan: "",
  status: "aktif",
};


function unwrapList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  return [];
}

function unwrapItem(result) {
  if (result?.data?.data) return result.data.data;
  return result?.data ?? result ?? null;
}

function formatRupiah(value) {
  const number = Number(value);
  if (Number.isNaN(number)) return "Rp 0";
  return `Rp ${number.toLocaleString("id-ID")}`;
}

function siklusLabel(value) {
  return (
    SIKLUS_OPTIONS.find((item) => item.value === value)?.label ||
    value ||
    "-"
  );
}

function statusLabel(value) {
  return (
    STATUS_OPTIONS.find((item) => item.value === value)?.label ||
    value ||
    "-"
  );
}

function isAktif(value) {
  return String(value || "").trim().toLowerCase() === "aktif";
}

function tahunAjaranLabel(item) {
  return (
    item?.nama ||
    item?.tahunAjaran ||
    item?.tahun ||
    item?.id ||
    "-"
  );
}


export default function SettingTarifPage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [tab, setTab] = useState("kategori");

  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  const [kategoriList, setKategoriList] = useState([]);
  const [kategoriMeta, setKategoriMeta] = useState({
    page: 1,
    limit: ENTRIES_PER_PAGE,
    total: 0,
    totalPages: 1,
  });
  const [kategoriSearch, setKategoriSearch] = useState("");
  const [kategoriStatus, setKategoriStatus] = useState("");
  const [kategoriPage, setKategoriPage] = useState(1);

  const [tarifList, setTarifList] = useState([]);
  const [tarifMeta, setTarifMeta] = useState({
    page: 1,
    limit: ENTRIES_PER_PAGE,
    total: 0,
    totalPages: 1,
  });
  const [tarifSearch, setTarifSearch] = useState("");
  const [tarifFilterKategori, setTarifFilterKategori] = useState("");
  const [tarifFilterTahun, setTarifFilterTahun] = useState("");
  const [tarifFilterStatus, setTarifFilterStatus] = useState("");
  const [tarifPage, setTarifPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [kategoriModalMode, setKategoriModalMode] = useState("tambah");
  const [kategoriForm, setKategoriForm] = useState(INITIAL_KATEGORI_FORM);
  const [kategoriSelectedId, setKategoriSelectedId] = useState(null);
  const [showKategoriModal, setShowKategoriModal] = useState(false);

  const [tarifModalMode, setTarifModalMode] = useState("tambah");
  const [tarifForm, setTarifForm] = useState(INITIAL_TARIF_FORM);
  const [tarifSelectedId, setTarifSelectedId] = useState(null);
  const [showTarifModal, setShowTarifModal] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);


  const loadMaster = useCallback(async () => {
    try {
      const [tahunRes, kelasRes] = await Promise.allSettled([
        getTahunAjaran(),
        getKelas({ page: 1, limit: 100 }),
      ]);

      const tahunList =
        tahunRes.status === "fulfilled"
          ? unwrapList(tahunRes.value)
          : [];

      setTahunAjaranList(tahunList);

      const aktif =
        tahunList.find((item) => isAktif(item?.status)) || tahunList[0];

      if (aktif?.id) {
        setTarifFilterTahun((prev) => prev || String(aktif.id));
        setTarifForm((prev) => ({
          ...prev,
          tahunAjaranId: prev.tahunAjaranId || String(aktif.id),
        }));
      }

      setKelasList(
        kelasRes.status === "fulfilled"
          ? unwrapList(kelasRes.value)
          : [],
      );
    } catch (err) {
      console.error("Gagal memuat data pendukung:", err);
    }
  }, []);


  const loadKategori = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getKategoriTagihan({
        page: kategoriPage,
        limit: ENTRIES_PER_PAGE,
        q: kategoriSearch.trim() || undefined,
        status: kategoriStatus || undefined,
      });

      setKategoriList(unwrapList(result));

      setKategoriMeta(
        result?.meta || {
          page: kategoriPage,
          limit: ENTRIES_PER_PAGE,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (err) {
      console.error("Gagal memuat kategori tagihan:", err);
      setError(err?.message || "Gagal memuat kategori tagihan.");
      setKategoriList([]);
    } finally {
      setLoading(false);
    }
  }, [kategoriPage, kategoriSearch, kategoriStatus]);


  const loadTarif = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getTarif({
        page: tarifPage,
        limit: ENTRIES_PER_PAGE,
        kategoriTagihanId: tarifFilterKategori || undefined,
        tahunAjaranId: tarifFilterTahun || undefined,
        status: tarifFilterStatus || undefined,
      });

      setTarifList(unwrapList(result));

      setTarifMeta(
        result?.meta || {
          page: tarifPage,
          limit: ENTRIES_PER_PAGE,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (err) {
      console.error("Gagal memuat tarif:", err);
      setError(err?.message || "Gagal memuat tarif.");
      setTarifList([]);
    } finally {
      setLoading(false);
    }
  }, [
    tarifPage,
    tarifFilterKategori,
    tarifFilterTahun,
    tarifFilterStatus,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadMaster();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadMaster]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadKategori();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadKategori]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTarif();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTarif]);


  useEffect(() => {
    if (!info) return undefined;
    const timer = setTimeout(() => setInfo(""), 4000);
    return () => clearTimeout(timer);
  }, [info]);


  const openTambahKategori = () => {
    router.push("/admin/keuangan/setting-tarif/kategori/tambah");
  };

  const openEditKategori = (item) => {
    if (item?.id) {
      router.push(`/admin/keuangan/setting-tarif/kategori/${item.id}/edit`);
    }
  };

  const handleKategoriChange = (event) => {
    const { name, value } = event.target;
    setKategoriForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleKategoriSave = async () => {
    try {
      setSubmitting(true);
      setError("");

      let result;

      if (kategoriModalMode === "tambah") {
        result = await createKategoriTagihan({
          kode: kategoriForm.kode,
          nama: kategoriForm.nama,
          siklus: kategoriForm.siklus,
          deskripsi: kategoriForm.deskripsi,
        });
      } else {
        result = await updateKategoriTagihan(kategoriSelectedId, {
          kode: kategoriForm.kode,
          nama: kategoriForm.nama,
          siklus: kategoriForm.siklus,
          deskripsi: kategoriForm.deskripsi,
          status: kategoriForm.status,
        });
      }

      setInfo(result?.message || "Kategori tagihan berhasil disimpan.");
      setShowKategoriModal(false);
      setKategoriPage(1);
      await Promise.all([loadKategori(), loadTarif()]);
    } catch (err) {
      console.error("Gagal menyimpan kategori:", err);
      setError(err?.message || "Gagal menyimpan kategori tagihan.");
    } finally {
      setSubmitting(false);
    }
  };


  const openTambahTarif = () => {
    router.push("/admin/keuangan/setting-tarif/tarif/tambah");
  };

  const openEditTarif = (item) => {
    if (item?.id) {
      router.push(`/admin/keuangan/setting-tarif/tarif/${item.id}/edit`);
    }
  };

  const handleTarifChange = (event) => {
    const { name, value } = event.target;
    setTarifForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTarifSave = async () => {
    try {
      setSubmitting(true);
      setError("");

      let result;

      if (tarifModalMode === "tambah") {
        result = await createTarif({
          kategoriTagihanId: tarifForm.kategoriTagihanId,
          tahunAjaranId: tarifForm.tahunAjaranId,
          kelasId:
            tarifForm.cakupan === "kelas"
              ? tarifForm.kelasId || undefined
              : undefined,
          tingkat:
            tarifForm.cakupan === "tingkat"
              ? tarifForm.tingkat || undefined
              : undefined,
          nominal: Number(tarifForm.nominal),
          keterangan: tarifForm.keterangan,
        });
      } else {
        result = await updateTarif(tarifSelectedId, {
          nominal: Number(tarifForm.nominal),
          keterangan: tarifForm.keterangan,
          status: tarifForm.status,
        });
      }

      setInfo(result?.message || "Tarif berhasil disimpan.");
      setShowTarifModal(false);
      setTarifPage(1);
      await loadTarif();
    } catch (err) {
      console.error("Gagal menyimpan tarif:", err);
      setError(err?.message || "Gagal menyimpan tarif.");
    } finally {
      setSubmitting(false);
    }
  };


  const confirmDelete = (type, item) => {
    setDeleteType(type);
    setDeleteTarget(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setSubmitting(true);
      setError("");

      let result;

      if (deleteType === "kategori") {
        result = await deleteKategoriTagihan(deleteTarget.id);
      } else {
        result = await deleteTarif(deleteTarget.id);
      }

      setInfo(result?.message || "Data berhasil dihapus.");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setDeleteType(null);
      await Promise.all([loadKategori(), loadTarif()]);
    } catch (err) {
      console.error("Gagal menghapus data:", err);
      setError(err?.message || "Gagal menghapus data.");
      setShowDeleteModal(false);
    } finally {
      setSubmitting(false);
    }
  };


  const stats = useMemo(() => {
    const tarifAktif = tarifList.filter((item) => isAktif(item?.status));
    const totalNominal = tarifAktif.reduce(
      (sum, item) => sum + (Number(item?.nominal) || 0),
      0,
    );

    return {
      totalKategori: kategoriMeta.total || kategoriList.length,
      totalTarif: tarifMeta.total || tarifList.length,
      tarifAktif: tarifAktif.length,
      totalNominal,
    };
  }, [kategoriList, kategoriMeta, tarifList, tarifMeta]);


  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="settingTarif"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        
        <div className="shrink-0">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          
          <div className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            
            <div className="theme-card theme-border mb-6 overflow-hidden rounded-2xl border p-6 shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_8%,transparent)] sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                    <Settings2 size={28} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                      Keuangan & Kas
                    </p>
                    <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                      Setting Tarif Tagihan
                    </h1>
                    <p className="theme-text-secondary mt-1 text-sm">
                      Kelola kategori tagihan dan tarif biaya sekolah
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      loadKategori();
                      loadTarif();
                    }}
                    className="theme-border theme-card theme-text-secondary inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition hover:text-[var(--color-primary)]"
                  >
                    <RefreshCw size={16} />
                    Muat Ulang
                  </button>

                  {tab === "kategori" ? (
                    <button
                      type="button"
                      onClick={openTambahKategori}
                      className="theme-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] transition hover:opacity-90"
                    >
                      <Plus size={16} />
                      Tambah Kategori
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={openTambahTarif}
                      className="theme-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] transition hover:opacity-90"
                    >
                      <Plus size={16} />
                      Tambah Tarif
                    </button>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="theme-danger mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Terjadi masalah</p>
                  <p className="mt-0.5 text-xs opacity-80">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="ml-auto"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {info && (
              <div className="theme-success mb-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm">
                <Check size={18} className="mt-0.5 shrink-0" />
                <p className="font-medium">{info}</p>
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6">
              <StatCard
                icon={<Layers size={22} />}
                label="Total Kategori"
                value={stats.totalKategori}
                color="primary"
                subtext="Jenis kategori tagihan"
              />
              <StatCard
                icon={<Tag size={22} />}
                label="Total Tarif"
                value={stats.totalTarif}
                color="info"
                subtext="Tarif terdaftar"
              />
              <StatCard
                icon={<Check size={22} />}
                label="Tarif Aktif"
                value={stats.tarifAktif}
                color="success"
                subtext="Pada halaman ini"
              />
              <StatCard
                icon={<CircleDollarSign size={22} />}
                label="Nominal Aktif"
                value={formatRupiah(stats.totalNominal)}
                color="warning"
                subtext="Total tarif aktif (halaman ini)"
              />
            </div>

            <div className="theme-border theme-card mb-4 flex gap-1 rounded-xl border p-1">
              <TabButton
                activeTab={tab === "kategori"}
                onClick={() => setTab("kategori")}
                icon={<Layers size={16} />}
                label="Kategori Tagihan"
              />
              <TabButton
                activeTab={tab === "tarif"}
                onClick={() => setTab("tarif")}
                icon={<Receipt size={16} />}
                label="Tarif"
              />
            </div>

            {tab === "kategori" ? (
              <KategoriTab
                loading={loading}
                list={kategoriList}
                meta={kategoriMeta}
                search={kategoriSearch}
                status={kategoriStatus}
                page={kategoriPage}
                onSearchChange={(value) => {
                  setKategoriSearch(value);
                  setKategoriPage(1);
                }}
                onStatusChange={(value) => {
                  setKategoriStatus(value);
                  setKategoriPage(1);
                }}
                onPageChange={setKategoriPage}
                onRefresh={loadKategori}
                onEdit={openEditKategori}
                onDelete={(item) => confirmDelete("kategori", item)}
              />
            ) : (
              <TarifTab
                loading={loading}
                list={tarifList}
                meta={tarifMeta}
                page={tarifPage}
                kategoriList={kategoriList}
                tahunAjaranList={tahunAjaranList}
                filterKategori={tarifFilterKategori}
                filterTahun={tarifFilterTahun}
                filterStatus={tarifFilterStatus}
                onFilterKategoriChange={(value) => {
                  setTarifFilterKategori(value);
                  setTarifPage(1);
                }}
                onFilterTahunChange={(value) => {
                  setTarifFilterTahun(value);
                  setTarifPage(1);
                }}
                onFilterStatusChange={(value) => {
                  setTarifFilterStatus(value);
                  setTarifPage(1);
                }}
                onPageChange={setTarifPage}
                onRefresh={loadTarif}
                onEdit={openEditTarif}
                onDelete={(item) => confirmDelete("tarif", item)}
              />
            )}

            <footer className="theme-border-soft theme-text-muted mt-8 border-t pt-6 text-center text-xs">
              © 2026 SmartSchool • Setting Tarif Tagihan
            </footer>
          </div>
        </main>
      </div>

      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="theme-card theme-border w-full max-w-md rounded-2xl border shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_20%,transparent)]">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--color-danger)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,var(--color-card))] text-[var(--color-danger)]">
                <AlertCircle size={32} />
              </div>

              <h3 className="theme-text text-lg font-bold">
                Hapus {deleteType === "kategori" ? "Kategori" : "Tarif"}?
              </h3>

              <p className="theme-text-muted mt-2 text-sm">
                {deleteType === "kategori"
                  ? `Kategori "${deleteTarget?.nama}" akan dihapus beserta tarif terkait. Tindakan ini tidak dapat dibatalkan.`
                  : "Tarif ini akan dinonaktifkan dan dihapus. Tindakan ini tidak dapat dibatalkan."}
              </p>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteTarget(null);
                    setDeleteType(null);
                  }}
                  className="theme-border theme-card-soft theme-text-secondary rounded-xl border px-5 py-2.5 text-sm font-semibold transition hover:text-[var(--color-primary)]"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-danger)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_6px_16px_color-mix(in_srgb,var(--color-danger)_22%,transparent)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function TabButton({ activeTab, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
        activeTab
          ? "theme-primary shadow-[0_4px_12px_color-mix(in_srgb,var(--color-primary)_22%,transparent)]"
          : "theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,var(--color-card))] hover:text-[var(--color-primary)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}


function KategoriTab({
  loading,
  list,
  meta,
  search,
  status,
  page,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onRefresh,
  onEdit,
  onDelete,
}) {
  const totalPages = meta?.totalPages || 1;
  const indexOfFirst = (page - 1) * ENTRIES_PER_PAGE;

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
          />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Cari kode atau nama kategori..."
            className="theme-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
          />
        </div>

        <FilterSelect value={status} onChange={(e) => onStatusChange(e.target.value)}>
          <option value="">Semua Status</option>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </FilterSelect>

        <button
          type="button"
          onClick={onRefresh}
          className="theme-border theme-card theme-text-secondary inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:text-[var(--color-primary)]"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="theme-card-soft border-b theme-border">
                {["Kode", "Nama Kategori", "Siklus", "Deskripsi", "Status", "Aksi"].map(
                  (heading, index) => (
                    <th
                      key={heading}
                      className={`theme-text-muted px-4 py-3.5 text-xs font-semibold uppercase tracking-wider ${
                        index === 5 ? "text-center" : "text-left"
                      }`}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border-soft)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="theme-text-muted px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2
                        size={18}
                        className="animate-spin text-[var(--color-primary)]"
                      />
                      Memuat kategori...
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <EmptyState
                  title="Tidak ada kategori ditemukan"
                  hint="Tambah kategori baru atau ubah filter"
                  colSpan={6}
                />
              ) : (
                list.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-card))]"
                  >
                    <td className="theme-text px-4 py-3.5 font-mono font-semibold">
                      {item.kode}
                    </td>
                    <td className="theme-text px-4 py-3.5 font-medium">
                      {item.nama}
                    </td>
                    <td className="theme-text-secondary px-4 py-3.5">
                      {siklusLabel(item.siklus)}
                    </td>
                    <td className="theme-text-secondary px-4 py-3.5">
                      {item.deskripsi || "-"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge aktif={isAktif(item.status)} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <ActionButton
                          title="Edit"
                          icon={<Edit size={16} />}
                          onClick={() => onEdit(item)}
                        />
                        <ActionButton
                          title="Hapus"
                          icon={<Trash2 size={16} />}
                          onClick={() => onDelete(item)}
                          type="danger"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && list.length > 0 && (
          <Pagination
            label={`Menampilkan ${indexOfFirst + 1}-${Math.min(
              indexOfFirst + ENTRIES_PER_PAGE,
              meta?.total || 0,
            )} dari ${meta?.total || 0} kategori`}
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </>
  );
}


function TarifTab({
  loading,
  list,
  meta,
  page,
  kategoriList,
  tahunAjaranList,
  filterKategori,
  filterTahun,
  filterStatus,
  onFilterKategoriChange,
  onFilterTahunChange,
  onFilterStatusChange,
  onPageChange,
  onRefresh,
  onEdit,
  onDelete,
}) {
  const totalPages = meta?.totalPages || 1;
  const indexOfFirst = (page - 1) * ENTRIES_PER_PAGE;

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-2">
          <FilterSelect
            value={filterKategori}
            onChange={(e) => onFilterKategoriChange(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {kategoriList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={filterTahun}
            onChange={(e) => onFilterTahunChange(e.target.value)}
          >
            <option value="">Semua Tahun Ajaran</option>
            {tahunAjaranList.map((item) => (
              <option key={item.id} value={item.id}>
                {tahunAjaranLabel(item)}
                {item?.semester ? ` · ${item.semester}` : ""}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={filterStatus}
            onChange={(e) => onFilterStatusChange(e.target.value)}
          >
            <option value="">Semua Status</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FilterSelect>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="theme-border theme-card theme-text-secondary inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition hover:text-[var(--color-primary)] lg:ml-auto"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="theme-card-soft border-b theme-border">
                {["Kategori", "Tahun Ajaran", "Cakupan", "Nominal", "Keterangan", "Status", "Aksi"].map(
                  (heading, index) => (
                    <th
                      key={heading}
                      className={`theme-text-muted px-4 py-3.5 text-xs font-semibold uppercase tracking-wider ${
                        index === 3 ? "text-right" : index === 6 ? "text-center" : "text-left"
                      }`}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border-soft)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="theme-text-muted px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2
                        size={18}
                        className="animate-spin text-[var(--color-primary)]"
                      />
                      Memuat tarif...
                    </div>
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <EmptyState
                  title="Tidak ada tarif ditemukan"
                  hint="Tambah tarif baru atau ubah filter"
                  colSpan={7}
                />
              ) : (
                list.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-card))]"
                  >
                    <td className="theme-text px-4 py-3.5 font-medium">
                      {item.kategoriTagihan?.nama || "-"}
                    </td>
                    <td className="theme-text-secondary px-4 py-3.5">
                      {tahunAjaranLabel(item.tahunAjaran)}
                    </td>
                    <td className="theme-text-secondary px-4 py-3.5">
                      {item.kelas?.nama
                        ? `Kelas ${item.kelas.nama}`
                        : item.tingkat
                          ? `Tingkat ${item.tingkat}`
                          : "Semua kelas"}
                    </td>
                    <td className="theme-text px-4 py-3.5 text-right font-bold">
                      {formatRupiah(item.nominal)}
                    </td>
                    <td className="theme-text-secondary px-4 py-3.5">
                      {item.keterangan || "-"}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge aktif={isAktif(item.status)} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <ActionButton
                          title="Edit"
                          icon={<Edit size={16} />}
                          onClick={() => onEdit(item)}
                        />
                        <ActionButton
                          title="Hapus"
                          icon={<Trash2 size={16} />}
                          onClick={() => onDelete(item)}
                          type="danger"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && list.length > 0 && (
          <Pagination
            label={`Menampilkan ${indexOfFirst + 1}-${Math.min(
              indexOfFirst + ENTRIES_PER_PAGE,
              meta?.total || 0,
            )} dari ${meta?.total || 0} tarif`}
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </>
  );
}


function EmptyState({ title, hint, colSpan = 6 }) {
  return (
    <tr>
      <td colSpan={colSpan} className="theme-text-muted px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-2">
          <FileText size={32} className="opacity-50" />
          <p className="theme-text-secondary text-sm font-medium">{title}</p>
          <p className="text-xs">{hint}</p>
        </div>
      </td>
    </tr>
  );
}

function Pagination({ label, page, totalPages, onPageChange }) {
  return (
    <div className="theme-card-soft flex items-center justify-between border-t theme-border px-4 py-3">
      <p className="theme-text-muted text-sm">{label}</p>

      <div className="flex items-center gap-1">
        <PaginationButton
          disabled={page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          <ChevronLeft size={16} />
        </PaginationButton>

        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onPageChange(i + 1)}
            className={
              page === i + 1
                ? "theme-primary rounded-lg px-3.5 py-1.5 text-sm font-medium"
                : "theme-text-secondary rounded-lg px-3.5 py-1.5 text-sm font-medium transition hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
            }
          >
            {i + 1}
          </button>
        ))}

        <PaginationButton
          disabled={page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        >
          <ChevronRight size={16} />
        </PaginationButton>
      </div>
    </div>
  );
}

function StatusBadge({ aktif }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
      style={{
        borderColor: aktif
          ? "color-mix(in srgb, var(--color-success) 25%, transparent)"
          : "var(--color-border)",
        backgroundColor: aktif
          ? "color-mix(in srgb, var(--color-success) 10%, var(--color-card))"
          : "color-mix(in srgb, var(--color-text-muted) 8%, var(--color-card))",
        color: aktif
          ? "var(--color-success)"
          : "var(--color-text-muted)",
      }}
    >
      {aktif ? <Check size={12} /> : <X size={12} />}
      {aktif ? "Aktif" : "Tidak Aktif"}
    </span>
  );
}

function StatCard({ icon, label, value, color, subtext }) {
  const colors = {
    primary:
      "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]",
    info: "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)]",
    success: "theme-success",
    warning: "theme-warning",
    danger: "theme-danger",
  };

  return (
    <div className="theme-card theme-border group rounded-2xl border p-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] transition hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_10%,transparent)]">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors[color] || colors.primary} transition group-hover:scale-105`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="theme-text-muted text-xs font-medium">{label}</p>
          <p className="theme-text mt-1 text-lg font-bold">{value}</p>
          {subtext && (
            <p className="theme-text-muted mt-0.5 text-xs">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="theme-input rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
    >
      {children}
    </select>
  );
}

function ActionButton({ title, icon, onClick, type = "primary" }) {
  const styles =
    type === "danger"
      ? "hover:bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] hover:text-[var(--color-danger)]"
      : "hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]";

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`theme-text-muted rounded-lg p-1.5 transition ${styles}`}
    >
      {icon}
    </button>
  );
}

function PaginationButton({ children, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="theme-card theme-text-muted rounded-lg border theme-border p-2 transition hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,var(--color-card))] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function Modal({
  title,
  icon,
  onClose,
  onSave,
  saveLabel = "Simpan",
  disabled = false,
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="theme-card theme-border max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_20%,transparent)]">
        <div className="flex items-center justify-between border-b theme-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
              {icon}
            </div>

            <div>
              <h2 className="theme-text text-lg font-bold">{title}</h2>
              <p className="theme-text-muted text-xs">Isi data dengan benar</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="theme-text-muted rounded-lg p-1.5 transition hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:text-[var(--color-primary)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">{children}</div>

        <div className="flex justify-end gap-3 border-t theme-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="theme-card-soft theme-text-secondary rounded-xl border theme-border px-5 py-2.5 text-sm font-semibold transition hover:brightness-95"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={disabled}
            className="theme-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {disabled && <Loader2 size={16} className="animate-spin" />}
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <label className="theme-text-secondary mb-1.5 block text-sm font-medium">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="theme-input w-full rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
      />
    </div>
  );
}

function FormSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder,
}) {
  return (
    <div>
      <label className="theme-text-secondary mb-1.5 block text-sm font-medium">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="theme-input w-full rounded-xl px-4 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
      >
        {placeholder && <option value="">{placeholder}</option>}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}