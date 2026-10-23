"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  Wallet,
  Loader2,
  RefreshCw,
  CreditCard,
  AlertCircle,
  Receipt,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  getTagihan,
  getRingkasanTagihan,
  getDetailTagihan,
  generateTagihan,
  batalkanTagihan,
  bayarTagihan,
  getAkunKas,
} from "@/services/tagihan.service";

import { getKategoriTagihan } from "@/services/tarif.service";
import { getTahunAjaran } from "@/services/tahunAjaran.service";
import { getKelas } from "@/services/kelas.service";


const ENTRIES_PER_PAGE = 10;

const NAMA_BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const STATUS_OPTIONS = [
  { value: "belum_bayar", label: "Belum Bayar" },
  { value: "sebagian", label: "Sebagian" },
  { value: "lunas", label: "Lunas" },
  { value: "batal", label: "Batal" },
];

const METODE_OPTIONS = [
  { value: "tunai", label: "Tunai" },
  { value: "transfer", label: "Transfer" },
  { value: "qris", label: "QRIS" },
  { value: "lainnya", label: "Lainnya" },
];

const INITIAL_GENERATE_FORM = {
  kategoriTagihanId: "",
  tahunAjaranId: "",
  kelasId: "",
  periodeBulan: String(new Date().getMonth() + 1),
  periodeTahun: String(new Date().getFullYear()),
  jatuhTempo: "",
  keterangan: "",
};

const INITIAL_BAYAR_FORM = {
  akunKasId: "",
  metode: "tunai",
  jumlah: "",
  tanggalBayar: new Date().toISOString().slice(0, 10),
  referensi: "",
  catatan: "",
};


function unwrapList(result) {
  if (Array.isArray(result)) {
    return result;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.data?.data)) {
    return result.data.data;
  }

  return [];
}

function unwrapItem(result) {
  if (result?.data?.data) {
    return result.data.data;
  }

  return result?.data ?? result ?? null;
}

function formatRupiah(value) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "Rp 0";
  }

  return `Rp ${number.toLocaleString("id-ID")}`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return "-";
  }
}

function periodeLabel(item) {
  if (item?.periodeBulan && item?.periodeTahun) {
    return `${
      NAMA_BULAN[Number(item.periodeBulan) - 1] ||
      item.periodeBulan
    } ${item.periodeTahun}`;
  }

  if (item?.periodeTahun) {
    return String(item.periodeTahun);
  }

  return "-";
}

function statusLabel(status) {
  const found = STATUS_OPTIONS.find(
    (option) => option.value === status,
  );

  return found?.label || status || "-";
}

function isTunggakan(item) {
  if (!item) return false;

  const aktif =
    item.status === "belum_bayar" ||
    item.status === "sebagian";

  if (!aktif) return false;

  if (!item.jatuhTempo) return false;

  return new Date(item.jatuhTempo).getTime() < Date.now();
}


export default function SPPPage() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [tagihanList, setTagihanList] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: ENTRIES_PER_PAGE,
    total: 0,
    totalPages: 1,
  });
  const [ringkasan, setRingkasan] = useState(null);

  const [kategoriList, setKategoriList] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [akunKasList, setAkunKasList] = useState([]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [filterTahunAjaran, setFilterTahunAjaran] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState(
    INITIAL_GENERATE_FORM,
  );

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState(null);

  const [showBayarModal, setShowBayarModal] = useState(false);
  const [bayarTarget, setBayarTarget] = useState(null);
  const [bayarForm, setBayarForm] = useState(INITIAL_BAYAR_FORM);

  const [showBatalModal, setShowBatalModal] = useState(false);
  const [batalTarget, setBatalTarget] = useState(null);
  const [batalAlasan, setBatalAlasan] = useState("");

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);


  const loadMaster = useCallback(async () => {
    try {
      const [
        kategoriRes,
        tahunRes,
        kelasRes,
        akunRes,
      ] = await Promise.allSettled([
        getKategoriTagihan({ page: 1, limit: 100 }),
        getTahunAjaran(),
        getKelas({ page: 1, limit: 100 }),
        getAkunKas({ status: "aktif" }),
      ]);

      setKategoriList(
        kategoriRes.status === "fulfilled"
          ? unwrapList(kategoriRes.value)
          : [],
      );

      const tahunList =
        tahunRes.status === "fulfilled"
          ? unwrapList(tahunRes.value)
          : [];

      setTahunAjaranList(tahunList);

      const aktif =
        tahunList.find(
          (item) =>
            String(item?.status || "")
              .trim()
              .toLowerCase() === "aktif",
        ) || tahunList[0];

      if (aktif?.id) {
        setFilterTahunAjaran((prev) => prev || String(aktif.id));
        setGenerateForm((prev) => ({
          ...prev,
          tahunAjaranId: prev.tahunAjaranId || String(aktif.id),
        }));
      }

      setKelasList(
        kelasRes.status === "fulfilled"
          ? unwrapList(kelasRes.value)
          : [],
      );

      const akun = unwrapList(
        akunRes.status === "fulfilled"
          ? akunRes.value
          : [],
      );

      setAkunKasList(akun);

      if (akun[0]?.id) {
        setBayarForm((prev) => ({
          ...prev,
          akunKasId: prev.akunKasId || String(akun[0].id),
        }));
      }
    } catch (err) {
      console.error("Gagal memuat data pendukung:", err);
    }
  }, []);


  const loadTagihan = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [listRes, ringkasRes] = await Promise.allSettled([
        getTagihan({
          page: currentPage,
          limit: ENTRIES_PER_PAGE,
          q: search.trim() || undefined,
          status: filterStatus || undefined,
          kategoriTagihanId: filterKategori || undefined,
          kelasId: filterKelas || undefined,
          tahunAjaranId: filterTahunAjaran || undefined,
        }),
        getRingkasanTagihan({
          tahunAjaranId: filterTahunAjaran || undefined,
        }),
      ]);

      if (listRes.status === "fulfilled") {
        setTagihanList(unwrapList(listRes.value));
        setMeta(
          listRes.value?.meta || {
            page: currentPage,
            limit: ENTRIES_PER_PAGE,
            total: 0,
            totalPages: 1,
          },
        );
      } else {
        setTagihanList([]);
        throw listRes.reason;
      }

      if (ringkasRes.status === "fulfilled") {
        setRingkasan(unwrapItem(ringkasRes.value));
      } else {
        setRingkasan(null);
      }
    } catch (err) {
      console.error("Gagal memuat tagihan:", err);
      setError(
        err?.message ||
          "Gagal memuat data tagihan dari server.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    search,
    filterStatus,
    filterKategori,
    filterKelas,
    filterTahunAjaran,
  ]);

  useEffect(() => {
    loadMaster();
  }, [loadMaster]);

  useEffect(() => {
    loadTagihan();
  }, [loadTagihan]);


  useEffect(() => {
    if (!info) return undefined;

    const timer = setTimeout(() => setInfo(""), 4000);

    return () => clearTimeout(timer);
  }, [info]);

  const totalPages = meta?.totalPages || 1;
  const indexOfFirst = (currentPage - 1) * ENTRIES_PER_PAGE;

  const kategoriTerpilih = useMemo(
    () =>
      kategoriList.find(
        (item) =>
          String(item.id) === String(generateForm.kategoriTagihanId),
      ),
    [kategoriList, generateForm.kategoriTagihanId],
  );

  const isBulanan =
    String(kategoriTerpilih?.siklus || "").toLowerCase() ===
    "bulanan";


  const handleFilterChange = (setter, value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    loadTagihan();
  };


  const handleGenerateChange = (event) => {
    const { name, value } = event.target;

    setGenerateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerate = async () => {
    try {
      setSubmitting(true);
      setError("");

      const result = await generateTagihan({
        kategoriTagihanId: generateForm.kategoriTagihanId,
        tahunAjaranId: generateForm.tahunAjaranId,
        kelasId: generateForm.kelasId || undefined,
        jatuhTempo: generateForm.jatuhTempo,
        periodeBulan: isBulanan
          ? Number(generateForm.periodeBulan)
          : undefined,
        periodeTahun: generateForm.periodeTahun
          ? Number(generateForm.periodeTahun)
          : undefined,
        keterangan: generateForm.keterangan,
      });

      setInfo(
        result?.message ||
          "Tagihan berhasil digenerate.",
      );

      setShowGenerateModal(false);
      setGenerateForm((prev) => ({
        ...INITIAL_GENERATE_FORM,
        tahunAjaranId: prev.tahunAjaranId,
      }));
      setCurrentPage(1);
      await loadTagihan();
    } catch (err) {
      console.error("Gagal generate tagihan:", err);
      setError(
        err?.message ||
          "Gagal generate tagihan. Periksa tarif dan periode.",
      );
    } finally {
      setSubmitting(false);
    }
  };


  const handleViewDetail = async (item) => {
    setSelectedTagihan(item);
    setShowDetailModal(true);
    setDetailLoading(true);

    try {
      const result = await getDetailTagihan(item.id);
      const detail = unwrapItem(result);

      if (detail) {
        setSelectedTagihan(detail);
      }
    } catch (err) {
      console.error("Gagal mengambil detail tagihan:", err);
    } finally {
      setDetailLoading(false);
    }
  };


  const openBayarModal = (item) => {
    setBayarTarget(item);

    setBayarForm({
      ...INITIAL_BAYAR_FORM,
      akunKasId:
        bayarForm.akunKasId ||
        (akunKasList[0]?.id
          ? String(akunKasList[0].id)
          : ""),
      jumlah: String(Number(item?.sisa) || ""),
    });

    setShowBayarModal(true);
  };

  const handleBayarChange = (event) => {
    const { name, value } = event.target;

    setBayarForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBayar = async () => {
    if (!bayarTarget) return;

    try {
      setSubmitting(true);
      setError("");

      const result = await bayarTagihan({
        tagihanId: bayarTarget.id,
        akunKasId: bayarForm.akunKasId,
        metode: bayarForm.metode,
        jumlah: Number(bayarForm.jumlah),
        tanggalBayar: bayarForm.tanggalBayar || undefined,
        referensi: bayarForm.referensi,
        catatan: bayarForm.catatan,
      });

      setInfo(
        result?.message || "Pembayaran berhasil dicatat.",
      );

      setShowBayarModal(false);
      setBayarTarget(null);
      setShowDetailModal(false);
      await loadTagihan();
    } catch (err) {
      console.error("Gagal menyimpan pembayaran:", err);
      setError(
        err?.message || "Gagal menyimpan pembayaran.",
      );
    } finally {
      setSubmitting(false);
    }
  };


  const openBatalModal = (item) => {
    setBatalTarget(item);
    setBatalAlasan("");
    setShowBatalModal(true);
  };

  const handleBatal = async () => {
    if (!batalTarget) return;

    try {
      setSubmitting(true);
      setError("");

      const result = await batalkanTagihan(
        batalTarget.id,
        batalAlasan,
      );

      setInfo(
        result?.message || "Tagihan dibatalkan.",
      );

      setShowBatalModal(false);
      setBatalTarget(null);
      setShowDetailModal(false);
      await loadTagihan();
    } catch (err) {
      console.error("Gagal membatalkan tagihan:", err);
      setError(
        err?.message || "Gagal membatalkan tagihan.",
      );
    } finally {
      setSubmitting(false);
    }
  };


  const getStatusBadge = (status, item) => {
    if (isTunggakan(item)) {
      return (
        <span className="theme-danger inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold">
          <AlertCircle size={12} />
          Tunggakan
        </span>
      );
    }

    const map = {
      lunas: {
        className: "theme-success",
        icon: <CheckCircle2 size={12} />,
      },
      sebagian: {
        className: "theme-warning",
        icon: <Clock size={12} />,
      },
      belum_bayar: {
        className: "theme-warning",
        icon: <Clock size={12} />,
      },
      batal: {
        className: "theme-danger",
        icon: <XCircle size={12} />,
      },
    };

    const selected =
      map[status] || {
        className: "theme-card-soft theme-text-muted",
        icon: <Clock size={12} />,
      };

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${selected.className}`}
      >
        {selected.icon}
        {statusLabel(status)}
      </span>
    );
  };

  const canBayar = (item) =>
    item?.status === "belum_bayar" || item?.status === "sebagian";

  const canBatal = (item) =>
    item?.status === "belum_bayar" &&
    Number(item?.totalDibayar || 0) === 0;


  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spp"
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

        <main className="theme-page min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
            <div className="theme-card mb-6 overflow-hidden rounded-2xl border theme-border shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
              <div className="flex flex-col gap-4 p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                      <Wallet size={28} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                        Keuangan & Kas
                      </p>

                      <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                        SPP & Tagihan
                      </h1>

                      <p className="theme-text-secondary mt-1 text-sm">
                        Kelola tagihan dan pembayaran siswa
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleRefresh}
                      className="theme-card-soft theme-text-secondary inline-flex items-center gap-2 rounded-lg border theme-border px-4 py-2.5 text-sm font-medium transition hover:brightness-95"
                    >
                      <RefreshCw size={16} />
                      Muat Ulang
                    </button>

                    <Link
                      href="/admin/keuangan/laporan"
                      className="theme-card-soft theme-text-secondary inline-flex items-center gap-2 rounded-lg border theme-border px-4 py-2.5 text-sm font-medium transition hover:brightness-95"
                    >
                      <FileText size={16} />
                      Laporan
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setShowGenerateModal(true);
                      }}
                      className="theme-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-[0_6px_18px_color-mix(in_srgb,var(--color-primary)_25%,transparent)] transition hover:brightness-95"
                    >
                      <Plus size={16} />
                      Generate Tagihan
                    </button>
                  </div>
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
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <p className="font-medium">{info}</p>
              </div>
            )}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                icon={<Receipt size={22} />}
                label="Total Tagihan"
                value={Number(
                  ringkasan?.totalTagihan || 0,
                ).toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                })}
                color="primary"
                subtext={`${ringkasan?.jumlahTagihan || 0} tagihan`}
              />

              <StatCard
                icon={<CheckCircle2 size={22} />}
                label="Sudah Dibayar"
                value={Number(
                  ringkasan?.totalDibayar || 0,
                ).toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                })}
                color="success"
                subtext="Total pembayaran diterima"
              />

              <StatCard
                icon={<Wallet size={22} />}
                label="Sisa Tagihan"
                value={Number(
                  ringkasan?.totalSisa || 0,
                ).toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                })}
                color="warning"
                subtext="Belum tertagih lunas"
              />

              <StatCard
                icon={<AlertCircle size={22} />}
                label="Tunggakan"
                value={Number(
                  ringkasan?.totalTunggakan || 0,
                ).toLocaleString("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  maximumFractionDigits: 0,
                })}
                color="danger"
                subtext={`${ringkasan?.jumlahTunggakan || 0} tagihan lewat jatuh tempo`}
              />
            </div>

            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Cari nomor tagihan, nama siswa, atau NIS..."
                  className="theme-input w-full rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[color-mix(in_srgb,var(--color-primary)_12%,transparent)]"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <FilterSelect
                  value={filterStatus}
                  onChange={(event) =>
                    handleFilterChange(
                      setFilterStatus,
                      event.target.value,
                    )
                  }
                >
                  <option value="">Semua Status</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </FilterSelect>

                <FilterSelect
                  value={filterKategori}
                  onChange={(event) =>
                    handleFilterChange(
                      setFilterKategori,
                      event.target.value,
                    )
                  }
                >
                  <option value="">Semua Kategori</option>
                  {kategoriList.map((kategori) => (
                    <option
                      key={kategori.id}
                      value={kategori.id}
                    >
                      {kategori.nama}
                    </option>
                  ))}
                </FilterSelect>

                <FilterSelect
                  value={filterTahunAjaran}
                  onChange={(event) =>
                    handleFilterChange(
                      setFilterTahunAjaran,
                      event.target.value,
                    )
                  }
                >
                  <option value="">Semua Tahun Ajaran</option>
                  {tahunAjaranList.map((tahun) => (
                    <option key={tahun.id} value={tahun.id}>
                      {tahun.nama ||
                        tahun.tahunAjaran ||
                        tahun.id}
                      {tahun.semester
                        ? ` · ${tahun.semester}`
                        : ""}
                    </option>
                  ))}
                </FilterSelect>

                <FilterSelect
                  value={filterKelas}
                  onChange={(event) =>
                    handleFilterChange(
                      setFilterKelas,
                      event.target.value,
                    )
                  }
                >
                  <option value="">Semua Kelas</option>
                  {kelasList.map((kelas) => (
                    <option key={kelas.id} value={kelas.id}>
                      {kelas.nama}
                    </option>
                  ))}
                </FilterSelect>
              </div>
            </div>

            <div className="theme-card overflow-hidden rounded-2xl border theme-border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                  <thead>
                    <tr className="theme-card-soft border-b theme-border">
                      {[
                        "No",
                        "Siswa",
                        "Kategori",
                        "Periode",
                        "Total",
                        "Dibayar",
                        "Sisa",
                        "Status",
                        "Jatuh Tempo",
                        "Aksi",
                      ].map((heading, index) => (
                        <th
                          key={heading}
                          className={`theme-text-muted px-4 py-3.5 text-xs font-semibold uppercase tracking-wider ${
                            index >= 4 && index <= 6
                              ? "text-right"
                              : index === 9
                                ? "text-center"
                                : "text-left"
                          }`}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[var(--color-border-soft)]">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="theme-text-muted px-4 py-12 text-center"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <Loader2
                              size={18}
                              className="animate-spin text-[var(--color-primary)]"
                            />
                            <span className="text-sm">
                              Memuat data tagihan...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : tagihanList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={10}
                          className="theme-text-muted px-4 py-12 text-center"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <FileText
                              size={32}
                              className="opacity-50"
                            />
                            <p className="theme-text-secondary text-sm font-medium">
                              Tidak ada data tagihan
                            </p>
                            <p className="text-xs">
                              Ubah filter atau generate tagihan baru
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      tagihanList.map((item, index) => (
                        <tr
                          key={item.id}
                          className="theme-text-secondary transition hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,var(--color-card))]"
                        >
                          <td className="theme-text-muted px-4 py-3.5 text-sm">
                            {indexOfFirst + index + 1}
                          </td>

                          <td className="px-4 py-3.5">
                            <p className="theme-text font-medium">
                              {item.siswa?.namaLengkap || "-"}
                            </p>
                            <p className="theme-text-muted text-xs">
                              {item.siswa?.nis
                                ? `NIS ${item.siswa.nis}`
                                : item.nomorTagihan}
                            </p>
                          </td>

                          <td className="px-4 py-3.5">
                            {item.kategoriTagihan?.nama || "-"}
                          </td>

                          <td className="px-4 py-3.5">
                            {periodeLabel(item)}
                          </td>

                          <td className="theme-text px-4 py-3.5 text-right font-semibold">
                            {formatRupiah(item.totalTagihan)}
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            {formatRupiah(item.totalDibayar)}
                          </td>

                          <td className="theme-text px-4 py-3.5 text-right font-bold">
                            {formatRupiah(item.sisa)}
                          </td>

                          <td className="px-4 py-3.5">
                            {getStatusBadge(item.status, item)}
                          </td>

                          <td className="px-4 py-3.5">
                            {formatDate(item.jatuhTempo)}
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-1">
                              <ActionButton
                                title="Lihat detail"
                                icon={<Eye size={16} />}
                                onClick={() =>
                                  handleViewDetail(item)
                                }
                                type="primary"
                              />

                              {canBayar(item) && (
                                <ActionButton
                                  title="Catat pembayaran"
                                  icon={<CreditCard size={16} />}
                                  onClick={() =>
                                    openBayarModal(item)
                                  }
                                  type="primary"
                                />
                              )}

                              {canBatal(item) && (
                                <ActionButton
                                  title="Batalkan tagihan"
                                  icon={<XCircle size={16} />}
                                  onClick={() =>
                                    openBatalModal(item)
                                  }
                                  type="danger"
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!loading && tagihanList.length > 0 && (
                <div className="theme-card-soft flex items-center justify-between border-t theme-border px-4 py-3">
                  <p className="theme-text-muted text-sm">
                    Menampilkan {indexOfFirst + 1}-
                    {Math.min(
                      indexOfFirst + ENTRIES_PER_PAGE,
                      meta?.total || 0,
                    )}{" "}
                    dari {meta?.total || 0} data
                  </p>

                  <div className="flex items-center gap-1">
                    <PaginationButton
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.max(1, page - 1),
                        )
                      }
                    >
                      <ChevronLeft size={16} />
                    </PaginationButton>

                    {Array.from(
                      { length: totalPages },
                      (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            setCurrentPage(i + 1)
                          }
                          className={
                            currentPage === i + 1
                              ? "theme-primary rounded-lg px-3.5 py-1.5 text-sm font-medium"
                              : "theme-text-secondary rounded-lg px-3.5 py-1.5 text-sm font-medium transition hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]"
                          }
                        >
                          {i + 1}
                        </button>
                      ),
                    )}

                    <PaginationButton
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1),
                        )
                      }
                    >
                      <ChevronRight size={16} />
                    </PaginationButton>
                  </div>
                </div>
              )}
            </div>

            <footer className="theme-text-muted mt-8 border-t theme-border-soft pt-6 text-center text-xs">
              © 2026 SmartSchool • SPP & Tagihan
            </footer>
          </div>
        </main>
      </div>

      {showGenerateModal && (
        <Modal
          title="Generate Tagihan"
          icon={<Plus size={20} />}
          onClose={() => setShowGenerateModal(false)}
          onSave={handleGenerate}
          saveLabel={submitting ? "Memproses..." : "Generate"}
          disabled={submitting}
        >
          <FormSelect
            label="Kategori Tagihan"
            name="kategoriTagihanId"
            value={generateForm.kategoriTagihanId}
            onChange={handleGenerateChange}
            placeholder="Pilih kategori"
            options={kategoriList.map((item) => ({
              value: item.id,
              label: `${item.nama} (${
                item.siklus || "bulanan"
              })`,
            }))}
          />

          <FormSelect
            label="Tahun Ajaran"
            name="tahunAjaranId"
            value={generateForm.tahunAjaranId}
            onChange={handleGenerateChange}
            placeholder="Pilih tahun ajaran"
            options={tahunAjaranList.map((item) => ({
              value: item.id,
              label: `${
                item.nama || item.tahunAjaran || item.id
              }${item.semester ? ` · ${item.semester}` : ""}`,
            }))}
          />

          <FormSelect
            label="Kelas (opsional)"
            name="kelasId"
            value={generateForm.kelasId}
            onChange={handleGenerateChange}
            placeholder="Semua kelas"
            options={kelasList.map((item) => ({
              value: item.id,
              label: item.nama,
            }))}
          />

          {isBulanan && (
            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Bulan"
                name="periodeBulan"
                value={generateForm.periodeBulan}
                onChange={handleGenerateChange}
                options={NAMA_BULAN.map((nama, index) => ({
                  value: String(index + 1),
                  label: nama,
                }))}
              />

              <FormInput
                label="Tahun"
                name="periodeTahun"
                type="number"
                value={generateForm.periodeTahun}
                onChange={handleGenerateChange}
                placeholder="2026"
              />
            </div>
          )}

          <FormInput
            label="Jatuh Tempo"
            name="jatuhTempo"
            type="date"
            value={generateForm.jatuhTempo}
            onChange={handleGenerateChange}
          />

          <FormInput
            label="Keterangan (opsional)"
            name="keterangan"
            value={generateForm.keterangan}
            onChange={handleGenerateChange}
            placeholder="Catatan tagihan"
          />
        </Modal>
      )}

      {showDetailModal && selectedTagihan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="theme-card max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border theme-border shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_20%,transparent)]">
            <div className="flex items-center justify-between border-b theme-border px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                  <Eye size={20} />
                </div>

                <div>
                  <h2 className="theme-text text-lg font-bold">
                    Detail Tagihan
                  </h2>
                  <p className="theme-text-muted text-xs">
                    {selectedTagihan.nomorTagihan}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="theme-text-muted rounded-lg p-1.5 transition hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)] hover:text-[var(--color-primary)]"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {detailLoading ? (
                <div className="theme-text-muted flex items-center justify-center gap-2 py-6 text-sm">
                  <Loader2
                    size={18}
                    className="animate-spin text-[var(--color-primary)]"
                  />
                  Memuat detail...
                </div>
              ) : (
                <>
                  <DetailRow
                    label="Siswa"
                    value={selectedTagihan.siswa?.namaLengkap}
                  />
                  <DetailRow
                    label="NIS / NISN"
                    value={`${selectedTagihan.siswa?.nis || "-"} / ${
                      selectedTagihan.siswa?.nisn || "-"
                    }`}
                  />
                  <DetailRow
                    label="Kategori"
                    value={selectedTagihan.kategoriTagihan?.nama}
                  />
                  <DetailRow
                    label="Periode"
                    value={periodeLabel(selectedTagihan)}
                  />
                  <DetailRow
                    label="Tahun Ajaran"
                    value={
                      selectedTagihan.tahunAjaran?.tahunAjaran
                    }
                  />
                  <DetailRow
                    label="Nominal"
                    value={formatRupiah(
                      selectedTagihan.nominal,
                    )}
                  />
                  <DetailRow
                    label="Diskon"
                    value={formatRupiah(
                      selectedTagihan.diskon,
                    )}
                  />
                  <DetailRow
                    label="Total Tagihan"
                    value={formatRupiah(
                      selectedTagihan.totalTagihan,
                    )}
                  />
                  <DetailRow
                    label="Total Dibayar"
                    value={formatRupiah(
                      selectedTagihan.totalDibayar,
                    )}
                  />
                  <DetailRow
                    label="Sisa"
                    value={formatRupiah(
                      selectedTagihan.sisa,
                    )}
                  />
                  <DetailRow
                    label="Jatuh Tempo"
                    value={formatDate(
                      selectedTagihan.jatuhTempo,
                    )}
                  />
                  <DetailRow
                    label="Status"
                    valueBadge={getStatusBadge(
                      selectedTagihan.status,
                      selectedTagihan,
                    )}
                  />
                  <DetailRow
                    label="Keterangan"
                    value={selectedTagihan.keterangan || "-"}
                  />

                  <div className="pt-2">
                    <p className="theme-text-secondary mb-2 text-sm font-semibold">
                      Riwayat Pembayaran
                    </p>

                    {Array.isArray(
                      selectedTagihan.pembayaran,
                    ) &&
                    selectedTagihan.pembayaran.length > 0 ? (
                      <div className="theme-border overflow-hidden rounded-xl border">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="theme-card-soft border-b theme-border">
                              <th className="theme-text-muted px-3 py-2 text-left font-semibold">
                                Nomor
                              </th>
                              <th className="theme-text-muted px-3 py-2 text-left font-semibold">
                                Tanggal
                              </th>
                              <th className="theme-text-muted px-3 py-2 text-left font-semibold">
                                Metode
                              </th>
                              <th className="theme-text-muted px-3 py-2 text-right font-semibold">
                                Jumlah
                              </th>
                              <th className="theme-text-muted px-3 py-2 text-left font-semibold">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--color-border-soft)]">
                            {selectedTagihan.pembayaran.map(
                              (bayar) => (
                                <tr key={bayar.id}>
                                  <td className="theme-text-muted px-3 py-2">
                                    {bayar.nomorPembayaran}
                                  </td>
                                  <td className="theme-text-secondary px-3 py-2">
                                    {formatDate(
                                      bayar.tanggalBayar,
                                    )}
                                  </td>
                                  <td className="theme-text-secondary px-3 py-2 capitalize">
                                    {bayar.metode}
                                  </td>
                                  <td className="theme-text px-3 py-2 text-right font-semibold">
                                    {formatRupiah(
                                      bayar.jumlah,
                                    )}
                                  </td>
                                  <td className="theme-text-secondary px-3 py-2 capitalize">
                                    {bayar.status}
                                  </td>
                                </tr>
                              ),
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="theme-text-muted text-xs">
                        Belum ada pembayaran tercatat.
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t theme-border px-6 py-4">
              {canBatal(selectedTagihan) && (
                <button
                  type="button"
                  onClick={() => openBatalModal(selectedTagihan)}
                  className="theme-danger rounded-xl border px-5 py-2.5 text-sm font-semibold transition hover:brightness-95"
                >
                  Batalkan
                </button>
              )}

              {canBayar(selectedTagihan) && (
                <button
                  type="button"
                  onClick={() => openBayarModal(selectedTagihan)}
                  className="theme-primary rounded-xl px-6 py-2.5 text-sm font-semibold transition hover:brightness-95"
                >
                  Catat Pembayaran
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="theme-card-soft theme-text-secondary rounded-xl border theme-border px-5 py-2.5 text-sm font-semibold transition hover:brightness-95"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {showBayarModal && bayarTarget && (
        <Modal
          title="Catat Pembayaran"
          icon={<CreditCard size={20} />}
          onClose={() => setShowBayarModal(false)}
          onSave={handleBayar}
          saveLabel={submitting ? "Menyimpan..." : "Simpan"}
          disabled={submitting}
        >
          <div className="theme-card-soft rounded-xl px-4 py-3 text-sm">
            <p className="theme-text font-semibold">
              {bayarTarget.siswa?.namaLengkap}
            </p>
            <p className="theme-text-muted mt-0.5 text-xs">
              {bayarTarget.nomorTagihan} • Sisa{" "}
              {formatRupiah(bayarTarget.sisa)}
            </p>
          </div>

          <FormSelect
            label="Akun Kas"
            name="akunKasId"
            value={bayarForm.akunKasId}
            onChange={handleBayarChange}
            placeholder="Pilih akun kas"
            options={akunKasList.map((item) => ({
              value: item.id,
              label: `${item.nama} (${item.kode})`,
            }))}
          />

          <FormSelect
            label="Metode"
            name="metode"
            value={bayarForm.metode}
            onChange={handleBayarChange}
            options={METODE_OPTIONS}
          />

          <FormInput
            label="Jumlah"
            name="jumlah"
            type="number"
            value={bayarForm.jumlah}
            onChange={handleBayarChange}
            placeholder="0"
          />

          <FormInput
            label="Tanggal Bayar"
            name="tanggalBayar"
            type="date"
            value={bayarForm.tanggalBayar}
            onChange={handleBayarChange}
          />

          <FormInput
            label="Referensi (opsional)"
            name="referensi"
            value={bayarForm.referensi}
            onChange={handleBayarChange}
            placeholder="No. referensi / bukti"
          />

          <FormInput
            label="Catatan (opsional)"
            name="catatan"
            value={bayarForm.catatan}
            onChange={handleBayarChange}
            placeholder="Catatan pembayaran"
          />
        </Modal>
      )}

      {showBatalModal && batalTarget && (
        <Modal
          title="Batalkan Tagihan"
          icon={<XCircle size={20} />}
          onClose={() => setShowBatalModal(false)}
          onSave={handleBatal}
          saveLabel={submitting ? "Memproses..." : "Batalkan"}
          disabled={submitting}
        >
          <p className="theme-text-secondary text-sm">
            Tagihan{" "}
            <span className="theme-text font-semibold">
              {batalTarget.nomorTagihan}
            </span>{" "}
            untuk{" "}
            <span className="theme-text font-semibold">
              {batalTarget.siswa?.namaLengkap}
            </span>{" "}
            akan dibatalkan.
          </p>

          <FormInput
            label="Alasan Pembatalan"
            name="alasan"
            value={batalAlasan}
            onChange={(event) =>
              setBatalAlasan(event.target.value)
            }
            placeholder="Masukkan alasan pembatalan"
          />
        </Modal>
      )}
    </div>
  );
}


function StatCard({ icon, label, value, color, subtext }) {
  const colors = {
    primary:
      "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]",
    success: "theme-success",
    warning: "theme-warning",
    danger: "theme-danger",
  };

  return (
    <div className="theme-card group rounded-2xl border theme-border p-5 shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] transition hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-text)_10%,transparent)]">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors[color] || colors.primary} transition group-hover:scale-105`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="theme-text-muted text-xs font-medium">
            {label}
          </p>

          <p className="theme-text mt-1 text-lg font-bold">
            {value}
          </p>

          {subtext && (
            <p className="theme-text-muted mt-0.5 text-xs">
              {subtext}
            </p>
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
      <div className="theme-card max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border theme-border shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_20%,transparent)]">
        <div className="flex items-center justify-between border-b theme-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
              {icon}
            </div>

            <div>
              <h2 className="theme-text text-lg font-bold">
                {title}
              </h2>
              <p className="theme-text-muted text-xs">
                Isi data dengan benar
              </p>
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
            {disabled && (
              <Loader2 size={16} className="animate-spin" />
            )}
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


function DetailRow({ label, value, valueBadge }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b theme-border-soft pb-3 last:border-b-0 last:pb-0">
      <span className="theme-text-muted text-sm font-medium">
        {label}
      </span>

      {valueBadge ? (
        <span>{valueBadge}</span>
      ) : (
        <span className="theme-text text-right text-sm font-semibold">
          {value || "-"}
        </span>
      )}
    </div>
  );
}
