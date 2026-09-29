"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import {
  Package,
  Layers,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Search,
  Sparkles,
  Crown,
  Star,
  Zap,
  Users,
  CircleDollarSign,
  BadgeCheck,
  BookOpen,
  Wallet,
  UserCog,
  Library,
  ClipboardCheck,
  UserPlus,
  MessageSquare,
  Boxes,
  MoreHorizontal,
  Copy,
  ShieldCheck,
  Loader2,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

import {
  getPaket,
  getFitur,
  deletePaket,
  updatePaket,
} from "../../../services/paket.service";

/* =========================================================
   ICON MODULE
========================================================= */

const ICON_MAP = {
  akademik: BookOpen,
  keuangan: Wallet,
  kepegawaian: UserCog,
  perpustakaan: Library,
  presensi: ClipboardCheck,
  ppdb: UserPlus,
  komunikasi: MessageSquare,
  inventaris: Boxes,
};

/* =========================================================
   PACKAGE THEMES
========================================================= */

const PACKAGE_THEMES = {
  blue: {
    card: "bg-blue-600",
    button: "bg-blue-600 hover:bg-blue-700",
  },

  indigo: {
    card: "bg-indigo-600",
    button: "bg-indigo-600 hover:bg-indigo-700",
  },

  slate: {
    card: "bg-slate-700",
    button: "bg-slate-700 hover:bg-slate-800",
  },
};

/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(value) {
  const angka = Number(value || 0);

  if (angka === 0) {
    return "Gratis";
  }

  return "Rp" + angka.toLocaleString("id-ID");
}

/* =========================================================
   RESPONSE HELPER
========================================================= */

function getResponseData(response) {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.result)) {
    return response.result;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  return [];
}

/* =========================================================
   PACKAGE HELPERS
========================================================= */

function getPaketId(paket) {
  return (
    paket?.id ??
    paket?.paketId ??
    paket?.paket_id ??
    null
  );
}

function getPaketName(paket) {
  return (
    paket?.nama ??
    paket?.namaPaket ??
    paket?.nama_paket ??
    paket?.name ??
    "Tanpa Nama"
  );
}

function getPaketPrice(paket) {
  return Number(
    paket?.harga ??
      paket?.hargaBulanan ??
      paket?.harga_bulanan ??
      paket?.hargaPerBulan ??
      paket?.harga_per_bulan ??
      0
  );
}

function getPaketDescription(paket) {
  return (
    paket?.deskripsi ??
    paket?.description ??
    paket?.keterangan ??
    ""
  );
}

/* =========================================================
   STATUS
========================================================= */

function getPaketStatus(paket) {
  const status = String(
    paket?.status ??
      paket?.statusPaket ??
      paket?.status_paket ??
      "aktif"
  ).toLowerCase();

  return status === "aktif" ? "aktif" : "nonaktif";
}

/* =========================================================
   DURASI
========================================================= */

function getPaketDuration(paket) {
  const durasi = Number(paket?.durasi ?? 1);

  if (!Number.isFinite(durasi) || durasi <= 0) {
    return 1;
  }

  return durasi;
}

/* =========================================================
   SUBSCRIBERS
========================================================= */

function getPaketSubscribers(paket) {
  return Number(
    paket?.langganan ??
      paket?.jumlahLangganan ??
      paket?.jumlah_langganan ??
      paket?.jumlahSekolah ??
      paket?.jumlah_sekolah ??
      paket?._count?.langgananSekolah ??
      0
  );
}

/* =========================================================
   GET FEATURE DARI PAKET
========================================================= */

function getPaketFeatures(paket) {
  if (!paket) {
    return [];
  }

  /*
    Response backend:

    {
      id,
      nama,
      deskripsi,
      harga,
      durasi,
      fitur: [
        {
          id,
          kode,
          nama,
          deskripsi,
          ikon
        }
      ]
    }
  */

  if (Array.isArray(paket.fitur)) {
    return paket.fitur;
  }

  /*
    Fallback jika response menggunakan paketModul
  */

  if (Array.isArray(paket.paketModul)) {
    return paket.paketModul
      .map((item) => item?.modul || item?.fitur || null)
      .filter(Boolean);
  }

  return [];
}

/* =========================================================
   NORMALIZE FEATURE
========================================================= */

function normalizeFeature(item, index) {
  if (!item) {
    return {
      id: `fitur-${index}`,
      kode: "",
      nama: "Fitur",
      deskripsi: "",
      icon: Layers,
    };
  }

  const id =
    item?.id ??
    item?.modulId ??
    item?.modul_id ??
    item?.fiturId ??
    item?.fitur_id ??
    item?.kode ??
    `fitur-${index}`;

  const nama =
    item?.nama ??
    item?.namaFitur ??
    item?.nama_fitur ??
    item?.namaModul ??
    item?.nama_modul ??
    item?.name ??
    item?.label ??
    item?.judul ??
    "Fitur";

  const deskripsi =
    item?.deskripsi ??
    item?.description ??
    item?.keterangan ??
    "";

  const kode = String(item?.kode ?? "").toLowerCase();

  const namaKey = String(nama)
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z]/g, "");

  const Icon =
    ICON_MAP[kode] ||
    ICON_MAP[namaKey] ||
    Layers;

  return {
    ...item,
    id,
    kode,
    nama,
    deskripsi,
    icon: Icon,
  };
}

/* =========================================================
   PACKAGE THEME
========================================================= */

function getPackageTheme(paket, index) {
  const name = getPaketName(paket).toLowerCase();

  if (
    name.includes("premium") ||
    name.includes("enterprise") ||
    name.includes("professional")
  ) {
    return PACKAGE_THEMES.indigo;
  }

  if (name.includes("custom")) {
    return PACKAGE_THEMES.blue;
  }

  if (
    name.includes("basic") ||
    name.includes("starter") ||
    name.includes("trial")
  ) {
    return PACKAGE_THEMES.slate;
  }

  const themes = [
    PACKAGE_THEMES.blue,
    PACKAGE_THEMES.indigo,
    PACKAGE_THEMES.slate,
  ];

  return themes[index % themes.length];
}

/* =========================================================
   PACKAGE ICON
========================================================= */

function getPackageIcon(paket, index) {
  const nama = getPaketName(paket).toLowerCase();

  if (
    nama.includes("enterprise") ||
    nama.includes("premium")
  ) {
    return Crown;
  }

  if (
    nama.includes("professional") ||
    nama.includes("custom")
  ) {
    return Zap;
  }

  if (nama.includes("trial")) {
    return Sparkles;
  }

  if (
    nama.includes("starter") ||
    nama.includes("basic")
  ) {
    return Star;
  }

  const icons = [
    Star,
    Zap,
    Crown,
    Sparkles,
  ];

  return icons[index % icons.length];
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function PaketModulPage() {
  const router = useRouter();

  const [activeMenu, setActiveMenu] = useState("paket-modul");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [paketList, setPaketList] = useState([]);
  const [fiturList, setFiturList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState("");

  const notifications = [
    {
      id: 1,
      title: "Pembaruan Sistem v2.0",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Pengingat: Backup Data",
      desc: "Dikirim 1 hari lalu",
      read: false,
    },
  ];

  /* =======================================================
     LOAD DATA
  ======================================================= */

  async function loadData(showLoading = true) {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const [paketResponse, fiturResponse] =
        await Promise.all([
          getPaket(),
          getFitur(),
        ]);

      const paketData = getResponseData(paketResponse);
      const fiturData = getResponseData(fiturResponse);

      console.log(
        "===================================="
      );

      console.log(
        "DATA PAKET DARI BACKEND:",
        paketData
      );

      console.log(
        "DATA MODUL DARI BACKEND:",
        fiturData
      );

      paketData.forEach((paket) => {
        console.log(
          "PAKET:",
          paket?.nama
        );

        console.log(
          "ID:",
          paket?.id
        );

        console.log(
          "DURASI:",
          paket?.durasi
        );

        console.log(
          "FITUR:",
          paket?.fitur
        );

        console.log(
          "JUMLAH FITUR:",
          Array.isArray(paket?.fitur)
            ? paket.fitur.length
            : 0
        );
      });

      console.log(
        "===================================="
      );

      setPaketList(
        Array.isArray(paketData)
          ? paketData
          : []
      );

      setFiturList(
        Array.isArray(fiturData)
          ? fiturData
              .map((item, index) =>
                normalizeFeature(
                  item,
                  index
                )
              )
              .filter(
                (item) => item.id
              )
          : []
      );
    } catch (err) {
      console.error(
        "Gagal memuat data paket:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data paket dari server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  /* =======================================================
     NORMALIZED PACKAGE
  ======================================================= */

  const normalizedPaket = useMemo(() => {
    return paketList.map(
      (paket, index) => {
        const features =
          getPaketFeatures(paket);

        return {
          ...paket,

          id: getPaketId(paket),

          nama: getPaketName(paket),

          harga: getPaketPrice(paket),

          deskripsi:
            getPaketDescription(paket),

          status:
            getPaketStatus(paket),

          durasi:
            getPaketDuration(paket),

          langganan:
            getPaketSubscribers(paket),

          fitur: features,

          theme:
            getPackageTheme(
              paket,
              index
            ),

          icon:
            getPackageIcon(
              paket,
              index
            ),

          populer:
            paket?.populer === true ||
            paket?.isPopular === true ||
            paket?.is_popular === true,
        };
      }
    );
  }, [paketList]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalPaket =
    normalizedPaket.length;

  const paketAktif =
    normalizedPaket.filter(
      (p) =>
        p.status === "aktif"
    ).length;

  const totalLangganan =
    normalizedPaket.reduce(
      (sum, p) =>
        sum +
        Number(
          p.langganan || 0
        ),
      0
    );

  const totalPendapatan =
    normalizedPaket.reduce(
      (sum, p) =>
        sum +
        Number(p.harga || 0) *
          Number(
            p.langganan || 0
          ),
      0
    );

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredPaket =
    normalizedPaket.filter(
      (paket) =>
        paket.nama
          .toLowerCase()
          .includes(
            search
              .toLowerCase()
              .trim()
          )
    );

  /* =======================================================
     NAVIGATION
  ======================================================= */

  function navigateToTambah() {
    router.push(
      "/super-admin/paketModul/tambah"
    );
  }

  function navigateToEdit(paket) {
    const id = getPaketId(paket);

    if (!id) {
      setError(
        "ID paket tidak ditemukan."
      );
      return;
    }

    router.push(
      `/super-admin/paketModul/edit/${id}`
    );
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function hapusPaket(paket) {
    try {
      setError("");

      const id = getPaketId(paket);

      if (!id) {
        throw new Error(
          "ID paket tidak ditemukan."
        );
      }

      await deletePaket(id);

      setPaketList(
        (current) =>
          current.filter(
            (item) =>
              getPaketId(item) !== id
          )
      );

      setConfirmDelete(null);
    } catch (err) {
      console.error(
        "Gagal menghapus paket:",
        err
      );

      setError(
        err?.message ||
          "Gagal menghapus paket."
      );
    }
  }

  /* =======================================================
     TOGGLE STATUS
  ======================================================= */

  async function toggleStatus(paket) {
    try {
      setError("");

      const id = getPaketId(paket);

      if (!id) {
        throw new Error(
          "ID paket tidak ditemukan."
        );
      }

      const currentStatus =
        getPaketStatus(paket);

      const nextStatus =
        currentStatus === "aktif"
          ? "nonaktif"
          : "aktif";

      const modulIds =
        getPaketFeatures(paket)
          .map(
            (feature) =>
              feature?.id ??
              feature?.modulId ??
              feature?.modul_id
          )
          .filter(Boolean);

      await updatePaket(id, {
        nama: getPaketName(paket),

        deskripsi:
          getPaketDescription(paket),

        harga:
          getPaketPrice(paket),

        durasi:
          getPaketDuration(paket),

        modulIds,

        status: nextStatus,
      });

      setPaketList(
        (current) =>
          current.map(
            (item) => {
              if (
                getPaketId(item) !==
                id
              ) {
                return item;
              }

              return {
                ...item,
                status:
                  nextStatus,
              };
            }
          )
      );
    } catch (err) {
      console.error(
        "Gagal mengubah status:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengubah status paket."
      );
    }
  }

  /* =======================================================
     DUPLICATE
  ======================================================= */

  function duplikatPaket(paket) {
    const modulIds =
      getPaketFeatures(paket)
        .map(
          (feature) =>
            feature?.id ??
            feature?.modulId ??
            feature?.modul_id
        )
        .filter(Boolean);

    const data = {
      nama: `${getPaketName(
        paket
      )} (Salinan)`,

      deskripsi:
        getPaketDescription(paket),

      harga:
        getPaketPrice(paket),

      durasi:
        getPaketDuration(paket),

      modulIds,

      populer: false,

      langganan: 0,
    };

    sessionStorage.setItem(
      "duplikatPaket",
      JSON.stringify(data)
    );

    router.push(
      "/super-admin/paketModul/tambah?duplikat=true"
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar
          active={activeMenu}
          setActive={setActiveMenu}
          collapsed={!sidebarOpen}
          setCollapsed={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            toggleSidebar={() =>
              setSidebarOpen(
                !sidebarOpen
              )
            }
            notifications={
              notifications
            }
            user={{
              name: "Sarah",
              email:
                "sarah@smartschool.com",
              avatar: "SA",
            }}
          />

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Loader2
                  size={24}
                  className="animate-spin text-white"
                />
              </div>

              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">
                  Memuat paket...
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Menyiapkan data paket
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =======================================================
     RETURN
  ======================================================= */

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* SIDEBAR */}

      <Sidebar
        active={activeMenu}
        setActive={setActiveMenu}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(
            !sidebarOpen
          )
        }
      />

      {/* CONTENT */}

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() =>
            setSidebarOpen(
              !sidebarOpen
            )
          }
          notifications={
            notifications
          }
          user={{
            name: "Sarah",
            email:
              "sarah@smartschool.com",
            avatar: "SA",
          }}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1500px] mx-auto space-y-6">
            {/* PAGE HEADER */}

            <section className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 md:p-7 shadow-lg shadow-blue-900/10">
              <div className="absolute -right-10 -top-16 w-56 h-56 rounded-full bg-blue-400/10 blur-2xl" />

              <div className="absolute right-24 bottom-[-80px] w-48 h-48 rounded-full bg-blue-400/10 blur-2xl" />

              <div className="relative flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Package
                        size={21}
                        className="text-white"
                      />
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
                        Product Management
                      </p>

                      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        Paket Langganan
                      </h1>
                    </div>
                  </div>

                  <p className="text-sm text-blue-100/80 mt-3 max-w-xl">
                    Kelola paket
                    langganan dan
                    fitur yang
                    tersedia untuk
                    setiap sekolah.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() =>
                      loadData(false)
                    }
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-medium backdrop-blur-sm transition disabled:opacity-50"
                  >
                    <RefreshCw
                      size={15}
                      className={
                        refreshing
                          ? "animate-spin"
                          : ""
                      }
                    />

                    Refresh
                  </button>

                  <button
                    onClick={
                      navigateToTambah
                    }
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 text-sm font-semibold shadow-lg transition"
                  >
                    <Plus size={16} />

                    Tambah Paket
                  </button>
                </div>
              </div>
            </section>

            {/* ERROR */}

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50">
                <AlertCircle
                  size={18}
                  className="text-rose-500 mt-0.5"
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-rose-700">
                    Terjadi kesalahan
                  </p>

                  <p className="text-xs text-rose-600 mt-1 break-words">
                    {error}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setError("")
                  }
                  className="text-rose-400 hover:text-rose-600"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* STATS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard
                icon={Package}
                label="Total Paket"
                value={totalPaket}
                description="Paket tersedia"
                theme="blue"
              />

              <StatCard
                icon={BadgeCheck}
                label="Paket Aktif"
                value={paketAktif}
                description="Sedang tersedia"
                theme="emerald"
              />

              <StatCard
                icon={Users}
                label="Total Langganan"
                value={totalLangganan}
                description="Sekolah berlangganan"
                theme="slate"
              />

              <StatCard
                icon={CircleDollarSign}
                label="Estimasi Pendapatan"
                value={formatRupiah(
                  totalPendapatan
                )}
                description="Per periode"
                theme="blue"
              />
            </div>

            {/* SEARCH */}

            <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-800">
                  Paket Tersedia
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Setiap paket
                  menampilkan fitur
                  yang didapatkan
                  berdasarkan data
                  backend.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-full md:w-72">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    placeholder="Cari paket..."
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
                  />
                </div>

                <span className="hidden sm:flex items-center whitespace-nowrap px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-500">
                  {filteredPaket.length}{" "}
                  paket
                </span>
              </div>
            </section>

            {/* PACKAGE GRID */}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
              {filteredPaket.map(
                (paket) => (
                  <PaketCard
                    key={paket.id}
                    paket={paket}
                    onEdit={() =>
                      navigateToEdit(
                        paket
                      )
                    }
                    onDelete={() =>
                      setConfirmDelete(
                        paket
                      )
                    }
                    onDuplicate={() =>
                      duplikatPaket(
                        paket
                      )
                    }
                    onToggleStatus={() =>
                      toggleStatus(
                        paket
                      )
                    }
                  />
                )
              )}

              {filteredPaket.length ===
                0 && (
                <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Package
                      size={25}
                      className="text-slate-400"
                    />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-600">
                    Paket tidak
                    ditemukan
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Coba gunakan
                    kata kunci
                    pencarian lain.
                  </p>
                </div>
              )}
            </div>

            {/* MODULE MATRIX */}

            <ModulMatrix
              paketList={normalizedPaket}
              fiturList={fiturList}
            />
          </div>
        </main>
      </div>

      {/* DELETE MODAL */}

      {confirmDelete && (
        <ConfirmDeleteModal
          paket={confirmDelete}
          onCancel={() =>
            setConfirmDelete(null)
          }
          onConfirm={() =>
            hapusPaket(
              confirmDelete
            )
          }
        />
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  theme,
}) {
  const themes = {
    blue: {
      icon: "bg-blue-100 text-blue-700",
      glow: "bg-blue-500/10",
    },

    emerald: {
      icon: "bg-emerald-100 text-emerald-700",
      glow: "bg-emerald-500/10",
    },

    slate: {
      icon: "bg-slate-200 text-slate-700",
      glow: "bg-slate-500/10",
    },
  };

  const t =
    themes[theme] ||
    themes.blue;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div
        className={`absolute right-0 top-0 w-24 h-24 rounded-full blur-2xl ${t.glow}`}
      />

      <div className="relative flex items-center gap-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${t.icon}`}
        >
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="text-xl font-bold text-slate-800 truncate mt-0.5">
            {value}
          </p>

          <p className="text-[11px] text-slate-400 mt-0.5">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PACKAGE CARD
========================================================= */

function PaketCard({
  paket,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleStatus,
}) {
  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const Icon =
    paket.icon || Package;

  const theme =
    paket.theme ||
    PACKAGE_THEMES.blue;

  const selectedFeatures =
    Array.isArray(paket.fitur)
      ? paket.fitur
      : [];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition flex flex-col">
      {/* HEADER */}

      <div
        className={`relative h-24 ${theme.card} overflow-hidden`}
      >
        <div className="absolute -right-8 -top-12 w-32 h-32 rounded-full bg-white/10" />

        <div className="absolute right-8 bottom-[-35px] w-24 h-24 rounded-full bg-white/5" />

        <div className="relative flex items-center justify-between p-5">
          <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon
              size={21}
              className="text-white"
            />
          </div>

          <div className="relative">
            <button
              onClick={() =>
                setMenuOpen(
                  (value) =>
                    !value
                )
              }
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <MoreHorizontal size={18} />
            </button>

            {menuOpen && (
              <div
                onMouseLeave={() =>
                  setMenuOpen(false)
                }
                className="absolute right-0 top-10 w-44 rounded-xl border border-slate-200 bg-white shadow-xl py-1.5 z-30"
              >
                <MenuButton
                  icon={Pencil}
                  label="Edit Paket"
                  onClick={() => {
                    onEdit();
                    setMenuOpen(
                      false
                    );
                  }}
                />

                <MenuButton
                  icon={Copy}
                  label="Duplikat"
                  onClick={() => {
                    onDuplicate();
                    setMenuOpen(
                      false
                    );
                  }}
                />

                <MenuButton
                  icon={ShieldCheck}
                  label={
                    paket.status ===
                    "aktif"
                      ? "Nonaktifkan"
                      : "Aktifkan"
                  }
                  onClick={() => {
                    onToggleStatus();
                    setMenuOpen(
                      false
                    );
                  }}
                />

                <MenuButton
                  icon={Trash2}
                  label="Hapus"
                  danger
                  onClick={() => {
                    onDelete();
                    setMenuOpen(
                      false
                    );
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CONTENT */}

      <div className="flex flex-col flex-1 p-5">
        {/* NAME */}

        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-800 break-words">
              {paket.nama}
            </h3>

            {paket.populer && (
              <span className="shrink-0 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-[9px] font-bold uppercase tracking-wide">
                Populer
              </span>
            )}
          </div>

          <p className="text-xs leading-relaxed text-slate-400 mt-1.5 min-h-[36px]">
            {paket.deskripsi ||
              "Paket layanan SmartSchool untuk kebutuhan sekolah."}
          </p>
        </div>

        {/* PRICE */}

        <div className="mt-5">
          <div className="flex items-end gap-1 flex-wrap">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {formatRupiah(
                paket.harga
              )}
            </span>

            {paket.harga > 0 && (
              <span className="text-xs text-slate-400 pb-1">
                / {paket.durasi} bulan
              </span>
            )}
          </div>
        </div>

        {/* STATUS */}

        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pb-4 border-b border-slate-100">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
              paket.status ===
              "aktif"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                paket.status ===
                "aktif"
                  ? "bg-emerald-500"
                  : "bg-slate-400"
              }`}
            />

            {paket.status ===
            "aktif"
              ? "Aktif"
              : "Nonaktif"}
          </span>

          <span className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users size={13} />

            {paket.langganan} sekolah
          </span>
        </div>

        {/* FITUR PAKET */}

        <div className="mt-4 flex-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Fitur yang didapat
            </p>

            <span className="text-[10px] font-bold text-blue-600">
              {selectedFeatures.length}{" "}
              fitur
            </span>
          </div>

          {selectedFeatures.length >
          0 ? (
            <div className="space-y-2.5">
              {selectedFeatures.map(
                (
                  feature,
                  index
                ) => {
                  const nama =
                    feature?.nama ||
                    "Fitur";

                  const deskripsi =
                    feature?.deskripsi ||
                    "";

                  const kode =
                    String(
                      feature?.kode ||
                        ""
                    ).toLowerCase();

                  const namaKey =
                    String(nama)
                      .toLowerCase()
                      .replace(
                        /\s+/g,
                        ""
                      )
                      .replace(
                        /[^a-z]/g,
                        ""
                      );

                  const FeatureIcon =
                    ICON_MAP[
                      kode
                    ] ||
                    ICON_MAP[
                      namaKey
                    ] ||
                    Layers;

                  return (
                    <div
                      key={
                        feature?.id ||
                        feature?.kode ||
                        `${nama}-${index}`
                      }
                      className="flex items-center gap-2.5 min-w-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <FeatureIcon
                          size={14}
                          className="text-blue-600"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          {nama}
                        </p>

                        {deskripsi && (
                          <p className="text-[10px] text-slate-400 truncate">
                            {deskripsi}
                          </p>
                        )}
                      </div>

                      <Check
                        size={15}
                        className="text-emerald-500 shrink-0"
                      />
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Layers
                    size={14}
                    className="text-slate-300"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-500">
                    Belum ada fitur
                  </p>

                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Belum ada modul
                    yang ditambahkan
                    ke paket ini.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BUTTON */}

        <button
          onClick={onEdit}
          className={`group/btn mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white ${theme.button} shadow-sm transition`}
        >
          Kelola Paket

          <ArrowUpRight
            size={15}
            className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
          />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   MENU BUTTON
========================================================= */

function MenuButton({
  icon: Icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs transition ${
        danger
          ? "text-rose-500 hover:bg-rose-50"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Icon size={14} />

      {label}
    </button>
  );
}

/* =========================================================
   MODULE MATRIX
========================================================= */

function ModulMatrix({
  paketList,
  fiturList,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}

      <div className="px-5 md:px-6 py-5 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Layers size={18} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Matriks Fitur per Paket
            </h3>

            <p className="text-xs text-slate-400 mt-0.5">
              Perbandingan fitur yang
              tersedia di setiap paket
              berdasarkan data backend.
            </p>
          </div>
        </div>
      </div>

      {/* EMPTY */}

      {fiturList.length === 0 ? (
        <div className="py-12 text-center">
          <Layers
            size={28}
            className="mx-auto text-slate-300"
          />

          <p className="text-sm text-slate-400 mt-3">
            Belum ada data modul dari
            backend.
          </p>
        </div>
      ) : paketList.length === 0 ? (
        <div className="py-12 text-center">
          <Package
            size={28}
            className="mx-auto text-slate-300"
          />

          <p className="text-sm text-slate-400 mt-3">
            Belum ada data paket.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-slate-50/70 text-left">
                <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-400 sticky left-0 bg-slate-50 z-10">
                  Fitur
                </th>

                {paketList.map(
                  (paket) => (
                    <th
                      key={paket.id}
                      className="px-4 py-3 text-center text-[10px] uppercase tracking-wider font-bold text-slate-400"
                    >
                      <div className="max-w-[130px] mx-auto truncate">
                        {paket.nama}
                      </div>
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {fiturList.map(
                (fitur) => {
                  const Icon =
                    fitur.icon ||
                    Layers;

                  return (
                    <tr
                      key={fitur.id}
                      className="border-t border-slate-100 hover:bg-blue-50/30 transition"
                    >
                      {/* FEATURE */}

                      <td className="px-5 py-3.5 sticky left-0 bg-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <Icon
                              size={14}
                              className="text-slate-500"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-slate-700 truncate">
                              {fitur.nama}
                            </p>

                            {fitur.deskripsi && (
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[250px]">
                                {
                                  fitur.deskripsi
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* PACKAGE CHECK */}

                      {paketList.map(
                        (paket) => {
                          const active =
                            getPaketFeatures(
                              paket
                            ).some(
                              (
                                feature
                              ) => {
                                const featureId =
                                  typeof feature ===
                                  "object"
                                    ? feature?.id ??
                                      feature?.modulId ??
                                      feature?.modul_id ??
                                      feature?.fiturId ??
                                      feature?.fitur_id ??
                                      ""
                                    : feature;

                                const featureKode =
                                  typeof feature ===
                                  "object"
                                    ? String(
                                        feature?.kode ||
                                          ""
                                      ).toLowerCase()
                                    : "";

                                const fiturId =
                                  String(
                                    fitur.id ||
                                      ""
                                  );

                                const fiturKode =
                                  String(
                                    fitur.kode ||
                                      ""
                                  ).toLowerCase();

                                if (
                                  featureId &&
                                  fiturId &&
                                  String(
                                    featureId
                                  ) ===
                                    fiturId
                                ) {
                                  return true;
                                }

                                if (
                                  featureKode &&
                                  fiturKode &&
                                  featureKode ===
                                    fiturKode
                                ) {
                                  return true;
                                }

                                return false;
                              }
                            );

                          return (
                            <td
                              key={
                                paket.id
                              }
                              className="px-4 py-3.5 text-center"
                            >
                              {active ? (
                                <div className="w-7 h-7 mx-auto rounded-full bg-emerald-50 flex items-center justify-center">
                                  <Check
                                    size={
                                      14
                                    }
                                    className="text-emerald-600"
                                  />
                                </div>
                              ) : (
                                <div className="w-7 h-7 mx-auto rounded-full bg-slate-50 flex items-center justify-center">
                                  <X
                                    size={
                                      13
                                    }
                                    className="text-slate-300"
                                  />
                                </div>
                              )}
                            </td>
                          );
                        }
                      )}
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   DELETE MODAL
========================================================= */

function ConfirmDeleteModal({
  paket,
  onCancel,
  onConfirm,
}) {
  const [
    deleting,
    setDeleting,
  ] = useState(false);

  async function handleDelete() {
    try {
      setDeleting(true);
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* BACKDROP */}

      <div
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={
          deleting
            ? undefined
            : onCancel
        }
      />

      {/* MODAL */}

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* TOP */}

        <div className="bg-rose-600 p-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Trash2
              size={24}
              className="text-white"
            />
          </div>
        </div>

        {/* CONTENT */}

        <div className="p-6">
          <h3 className="text-center text-lg font-bold text-slate-800">
            Hapus paket?
          </h3>

          <p className="text-center text-sm text-slate-500 mt-2 leading-relaxed">
            Kamu akan menghapus
            paket{" "}
            <span className="font-semibold text-slate-700">
              "{paket.nama}"
            </span>
            . Tindakan ini akan
            menghapus paket dari
            daftar aktif.
          </p>

          {paket.langganan > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700">
              Paket ini masih
              memiliki{" "}
              <strong>
                {paket.langganan} sekolah
              </strong>{" "}
              yang berlangganan.
            </div>
          )}

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
            >
              Batal
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm transition disabled:opacity-60"
            >
              {deleting && (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              )}

              {deleting
                ? "Menghapus..."
                : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}