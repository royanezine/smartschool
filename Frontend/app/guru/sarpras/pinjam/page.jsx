"use client";

import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

import {
  Package,
  Sparkles,
  Search,
  Projector,
  Speaker,
  Dumbbell,
  DoorOpen,
  Laptop,
  Wrench,
  X,
  CalendarDays,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { getAset } from "../../../../services/sarpras.service";

// =====================================================
// KATEGORI
// =====================================================

const KATEGORI_DEFAULT = [
  "Semua",
  "Elektronik",
  "Ruangan",
  "Olahraga",
  "Lainnya",
];

// =====================================================
// ICON KATEGORI
// =====================================================

const getKategoriIcon = (kategori = "") => {
  const nama = kategori.toLowerCase();

  if (
    nama.includes("elektronik") ||
    nama.includes("elektronik")
  ) {
    if (nama.includes("sound") || nama.includes("speaker")) {
      return Speaker;
    }

    if (nama.includes("laptop") || nama.includes("komputer")) {
      return Laptop;
    }

    return Projector;
  }

  if (
    nama.includes("ruangan") ||
    nama.includes("ruang")
  ) {
    return DoorOpen;
  }

  if (
    nama.includes("olahraga") ||
    nama.includes("sport")
  ) {
    return Dumbbell;
  }

  return Wrench;
};

// =====================================================
// WARNA KATEGORI
// =====================================================

const getKategoriColor = (kategori = "") => {
  const nama = kategori.toLowerCase();

  if (nama.includes("elektronik")) {
    return "bg-blue-600";
  }

  if (
    nama.includes("ruangan") ||
    nama.includes("ruang")
  ) {
    return "bg-violet-600";
  }

  if (
    nama.includes("olahraga") ||
    nama.includes("sport")
  ) {
    return "bg-emerald-600";
  }

  return "bg-slate-500";
};

// =====================================================
// JAM PEMINJAMAN
// =====================================================

const pilihanJam = [
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
];

// =====================================================
// PAGE
// =====================================================

export default function GuruSarprasPinjamPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ===================================================
  // DATA
  // ===================================================

  const [daftarItem, setDaftarItem] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ===================================================
  // FILTER
  // ===================================================

  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [pencarian, setPencarian] = useState("");

  // ===================================================
  // MODAL
  // ===================================================

  const [itemDipilih, setItemDipilih] = useState(null);
  const [berhasilKirim, setBerhasilKirim] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  // ===================================================
  // FORM
  // ===================================================

  const [tanggalPinjam, setTanggalPinjam] = useState("");
  const [jamMulai, setJamMulai] = useState("");
  const [jamSelesai, setJamSelesai] = useState("");
  const [keperluan, setKeperluan] = useState("");
  const [jumlah, setJumlah] = useState(1);

  // ===================================================
  // LOAD ASET DARI BACKEND
  // ===================================================

  useEffect(() => {
    let mounted = true;

    async function loadAset() {
      try {
        setLoading(true);
        setError("");

        const response = await getAset();

        if (!mounted) return;

        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

        setDaftarItem(data);
      } catch (err) {
        if (!mounted) return;

        console.error("Gagal mengambil data aset:", err);

        setError(
          err?.message ||
            "Gagal mengambil data sarana prasarana."
        );

        setDaftarItem([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadAset();

    return () => {
      mounted = false;
    };
  }, []);

  // ===================================================
  // NOTIFICATION
  // ===================================================

  const notifications = [
    {
      id: 1,
      title: "Pengajuan Disetujui",
      desc: "Dikirim 1 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Batas Pengembalian Alat",
      desc: "Dikirim 4 jam lalu",
      read: false,
    },
  ];

  // ===================================================
  // KATEGORI DINAMIS DARI BACKEND
  // ===================================================

  const KATEGORI = useMemo(() => {
    const kategoriBackend = daftarItem
      .map((item) => item?.kategoriAset?.nama)
      .filter(Boolean);

    const kategoriUnik = [
      ...new Set(kategoriBackend),
    ];

    if (kategoriUnik.length === 0) {
      return KATEGORI_DEFAULT;
    }

    return [
      "Semua",
      ...kategoriUnik,
    ];
  }, [daftarItem]);

  // ===================================================
  // FILTER DATA
  // ===================================================

  const itemTersaring = useMemo(() => {
    return daftarItem.filter((item) => {
      const kategori =
        item?.kategoriAset?.nama || "";

      const nama =
        item?.nama || "";

      const kode =
        item?.kode || "";

      const cocokKategori =
        kategoriAktif === "Semua" ||
        kategori.toLowerCase() ===
          kategoriAktif.toLowerCase();

      const keyword =
        pencarian.trim().toLowerCase();

      const cocokPencarian =
        !keyword ||
        nama.toLowerCase().includes(keyword) ||
        kode.toLowerCase().includes(keyword) ||
        kategori.toLowerCase().includes(keyword);

      return (
        cocokKategori &&
        cocokPencarian
      );
    });
  }, [
    daftarItem,
    kategoriAktif,
    pencarian,
  ]);

  // ===================================================
  // STOK TERSEDIA
  // ===================================================

  const sisaStok = (item) => {
    return Number(item?.jumlahStok ?? 0);
  };

  const jumlahTotal = (item) => {
    return Number(item?.jumlah ?? 0);
  };

  // ===================================================
  // TOGGLE DETAIL
  // ===================================================

  const toggleExpand = (id) => {
    setExpandedId(
      expandedId === id
        ? null
        : id
    );
  };

  // ===================================================
  // BUKA FORM
  // ===================================================

  const bukaForm = (item) => {
    setItemDipilih(item);
    setBerhasilKirim(false);

    setTanggalPinjam("");
    setJamMulai("");
    setJamSelesai("");
    setKeperluan("");
    setJumlah(1);
  };

  // ===================================================
  // TUTUP FORM
  // ===================================================

  const tutupForm = () => {
    setItemDipilih(null);
    setBerhasilKirim(false);
  };

  // ===================================================
  // SUBMIT
  // ===================================================
  //
  // BELUM DIKIRIM KE BACKEND PEMINJAMAN
  //
  // Karena dari controller/routes yang tersedia
  // belum ada endpoint POST peminjaman.
  //
  // ===================================================

  const kirimPengajuan = (e) => {
    e.preventDefault();

    console.log("Data pengajuan:", {
      asetId: itemDipilih?.id,
      tanggalPinjam,
      jamMulai,
      jamSelesai,
      jumlah,
      keperluan,
    });

    /*
      TODO:

      Saat backend sudah memiliki endpoint:

      POST /api/v1/sarpras/peminjaman

      baru bagian ini bisa diganti menjadi:

      await createPeminjaman({
        asetId: itemDipilih.id,
        tanggalPinjam,
        ...
      });
    */

    setBerhasilKirim(true);
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() =>
          setSidebarOpen(!sidebarOpen)
        }
      />

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="flex-1 flex flex-col min-w-0">

        {/* HEADER */}

        <Header
          toggleSidebar={() =>
            setSidebarOpen(!sidebarOpen)
          }
          notifications={notifications}
          user={{
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "AS",
          }}
        />

        {/* MAIN */}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">

          <div className="w-full space-y-6">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

              <div className="min-w-0">

                <div className="flex items-center gap-2.5">

                  <div className="p-2 rounded-lg bg-blue-600 text-white shadow-sm flex-shrink-0">
                    <Package size={18} />
                  </div>

                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800 truncate">
                    Pinjam Sarana Prasarana
                  </h1>

                </div>

                <p className="text-sm text-slate-500 mt-1 ml-[42px] flex items-center gap-1.5">

                  <Sparkles
                    size={14}
                    className="text-slate-400 flex-shrink-0"
                  />

                  <span className="truncate">
                    Cek sisa stok dan jadwal pemakaian,
                    lalu ajukan peminjaman.
                  </span>

                </p>

              </div>

            </div>

            {/* =================================================
                SEARCH + FILTER
            ================================================= */}

            <div className="flex flex-col sm:flex-row gap-3">

              {/* SEARCH */}

              <div className="relative flex-1">

                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={pencarian}
                  onChange={(e) =>
                    setPencarian(e.target.value)
                  }
                  placeholder="Cari item atau ruangan..."
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 placeholder:text-slate-400"
                />

              </div>

              {/* FILTER */}

              <div className="flex gap-1.5 overflow-x-auto sm:overflow-visible">

                {KATEGORI.map((k) => (

                  <button
                    key={k}
                    onClick={() =>
                      setKategoriAktif(k)
                    }
                    className={`px-3.5 py-2 text-xs font-medium rounded-lg border whitespace-nowrap transition-colors ${
                      kategoriAktif === k
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    {k}
                  </button>

                ))}

              </div>

            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">

                <AlertCircle
                  size={18}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />

                <div>

                  <p className="text-sm font-medium text-red-700">
                    Gagal memuat data sarana prasarana
                  </p>

                  <p className="text-xs text-red-600 mt-1">
                    {error}
                  </p>

                </div>

              </div>

            )}

            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (

              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm py-16 flex flex-col items-center justify-center">

                <Loader2
                  size={28}
                  className="animate-spin text-blue-600"
                />

                <p className="text-sm text-slate-500 mt-3">
                  Memuat data sarana prasarana...
                </p>

              </div>

            ) : (

              /* =================================================
                  DAFTAR ITEM
              ================================================= */

              <div className="space-y-3">

                {itemTersaring.map((item) => {

                  const kategori =
                    item?.kategoriAset?.nama ||
                    "Lainnya";

                  const Icon =
                    getKategoriIcon(
                      kategori
                    );

                  const warna =
                    getKategoriColor(
                      kategori
                    );

                  const sisa =
                    sisaStok(item);

                  const total =
                    jumlahTotal(item);

                  const habis =
                    sisa <= 0;

                  const expanded =
                    expandedId === item.id;

                  return (

                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden"
                    >

                      {/* =================================================
                          HEADER ROW
                      ================================================= */}

                      <div className="flex items-center gap-3 p-4 sm:p-5">

                        {/* ICON */}

                        <div
                          className={`p-2.5 rounded-lg text-white shadow-sm flex-shrink-0 ${warna}`}
                        >
                          <Icon size={18} />
                        </div>

                        {/* INFO */}

                        <div className="flex-1 min-w-0">

                          <div className="flex items-center gap-2">

                            <h2 className="text-sm font-semibold text-slate-800 truncate">
                              {item.nama}
                            </h2>

                            <span className="text-[10px] font-medium text-slate-400 flex-shrink-0">
                              {item.kode}
                            </span>

                          </div>

                          <p className="text-xs text-slate-500 mt-0.5">
                            {kategori}
                          </p>

                          {item.lokasi && (

                            <p className="text-[11px] text-slate-400 mt-1 truncate">
                              Lokasi: {item.lokasi}
                            </p>

                          )}

                        </div>

                        {/* ACTION */}

                        <div className="flex items-center gap-2 flex-shrink-0">

                          {/* STOK */}

                          <span
                            className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${
                              habis
                                ? "bg-red-50 text-red-600 border-red-200"
                                : "bg-emerald-50 text-emerald-600 border-emerald-200"
                            }`}
                          >
                            Sisa {sisa}/{total}
                          </span>

                          {/* DETAIL */}

                          <button
                            onClick={() =>
                              toggleExpand(
                                item.id
                              )
                            }
                            className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Detail

                            {expanded ? (
                              <ChevronUp size={12} />
                            ) : (
                              <ChevronDown size={12} />
                            )}

                          </button>

                          {/* AJUKAN */}

                          <button
                            onClick={() =>
                              bukaForm(item)
                            }
                            disabled={habis}
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                              habis
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            }`}
                          >
                            Ajukan
                          </button>

                        </div>

                      </div>

                      {/* =================================================
                          MOBILE DETAIL
                      ================================================= */}

                      <button
                        onClick={() =>
                          toggleExpand(item.id)
                        }
                        className="sm:hidden flex items-center gap-1 text-[11px] font-medium text-slate-500 px-4 pb-3 -mt-1"
                      >
                        Detail

                        {expanded ? (
                          <ChevronUp size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )}

                      </button>

                      {/* =================================================
                          DETAIL ITEM
                      ================================================= */}

                      {expanded && (

                        <div className="border-t border-slate-100 bg-slate-50/60 px-4 sm:px-5 py-3 space-y-2">

                          <div className="flex items-center justify-between text-xs">

                            <span className="text-slate-500">
                              Kode aset
                            </span>

                            <span className="font-medium text-slate-700">
                              {item.kode || "-"}
                            </span>

                          </div>

                          <div className="flex items-center justify-between text-xs">

                            <span className="text-slate-500">
                              Kondisi
                            </span>

                            <span className="font-medium text-slate-700 capitalize">
                              {item.kondisi || "-"}
                            </span>

                          </div>

                          <div className="flex items-center justify-between text-xs">

                            <span className="text-slate-500">
                              Total aset
                            </span>

                            <span className="font-medium text-slate-700">
                              {total}
                            </span>

                          </div>

                          <div className="flex items-center justify-between text-xs">

                            <span className="text-slate-500">
                              Stok tersedia
                            </span>

                            <span className="font-medium text-slate-700">
                              {sisa}
                            </span>

                          </div>

                          {item.gudang?.nama && (

                            <div className="flex items-center justify-between text-xs">

                              <span className="text-slate-500">
                                Gudang
                              </span>

                              <span className="font-medium text-slate-700">
                                {item.gudang.nama}
                              </span>

                            </div>

                          )}

                        </div>

                      )}

                    </div>

                  );

                })}

                {/* =================================================
                    EMPTY
                ================================================= */}

                {itemTersaring.length === 0 && (

                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm text-center py-12">

                    <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">

                      <Package
                        size={18}
                        className="text-slate-400"
                      />

                    </div>

                    <p className="text-sm font-medium text-slate-600 mt-3">
                      Tidak ada aset ditemukan
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Coba ubah kata kunci pencarian
                      atau kategori.
                    </p>

                  </div>

                )}

              </div>

            )}

          </div>

        </main>

      </div>

      {/* =====================================================
          MODAL FORM
      ===================================================== */}

      {itemDipilih && (

        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="flex items-center justify-between p-5 border-b border-slate-100">

              <div>

                <h3 className="text-sm font-semibold text-slate-800">
                  Ajukan Peminjaman
                </h3>

                <p className="text-xs text-slate-500 mt-0.5">
                  {itemDipilih.nama}
                </p>

              </div>

              <button
                onClick={tutupForm}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={16} />
              </button>

            </div>

            {/* =================================================
                SUCCESS
            ================================================= */}

            {berhasilKirim ? (

              <div className="p-8 flex flex-col items-center text-center gap-3">

                <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={28} />
                </div>

                <div>

                  <p className="text-sm font-semibold text-slate-800">
                    Pengajuan berhasil dikirim
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Tampilan ini sementara.
                    Endpoint peminjaman backend
                    belum tersedia.
                  </p>

                </div>

                <button
                  onClick={tutupForm}
                  className="mt-2 px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Selesai
                </button>

              </div>

            ) : (

              /* =================================================
                  FORM
              ================================================= */

              <form
                onSubmit={kirimPengajuan}
                className="p-5 space-y-4"
              >

                {/* =================================================
                    INFO STOK
                ================================================= */}

                <div className="flex items-center justify-between text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">

                  <span className="text-slate-500">
                    Sisa stok saat ini
                  </span>

                  <span className="font-semibold text-slate-700">
                    {sisaStok(itemDipilih)}
                    /
                    {jumlahTotal(itemDipilih)}
                  </span>

                </div>

                {/* =================================================
                    TANGGAL
                ================================================= */}

                <div>

                  <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1">

                    <CalendarDays
                      size={12}
                      className="text-slate-400"
                    />

                    Tanggal Pinjam

                  </label>

                  <input
                    type="date"
                    required
                    value={tanggalPinjam}
                    onChange={(e) =>
                      setTanggalPinjam(
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />

                </div>

                {/* =================================================
                    JAM
                ================================================= */}

                <div className="grid grid-cols-2 gap-3">

                  <div>

                    <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1">

                      <Clock
                        size={12}
                        className="text-slate-400"
                      />

                      Jam Mulai

                    </label>

                    <select
                      required
                      value={jamMulai}
                      onChange={(e) => {
                        setJamMulai(
                          e.target.value
                        );
                        setJamSelesai("");
                      }}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                    >

                      <option
                        value=""
                        disabled
                      >
                        Pilih jam
                      </option>

                      {pilihanJam.map(
                        (jam) => (
                          <option
                            key={jam}
                            value={jam}
                          >
                            {jam}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div>

                    <label className="text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1">

                      <Clock
                        size={12}
                        className="text-slate-400"
                      />

                      Jam Selesai

                    </label>

                    <select
                      required
                      value={jamSelesai}
                      onChange={(e) =>
                        setJamSelesai(
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
                    >

                      <option
                        value=""
                        disabled
                      >
                        Pilih jam
                      </option>

                      {pilihanJam
                        .filter(
                          (jam) =>
                            !jamMulai ||
                            jam > jamMulai
                        )
                        .map(
                          (jam) => (
                            <option
                              key={jam}
                              value={jam}
                            >
                              {jam}
                            </option>
                          )
                        )}

                    </select>

                  </div>

                </div>

                {/* =================================================
                    JUMLAH
                ================================================= */}

                <div>

                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                    Jumlah (maks.{" "}
                    {sisaStok(itemDipilih)})
                  </label>

                  <input
                    type="number"
                    min={1}
                    max={sisaStok(itemDipilih)}
                    required
                    value={jumlah}
                    onChange={(e) => {
                      const value =
                        Number(
                          e.target.value
                        );

                      setJumlah(
                        Math.min(
                          Math.max(
                            value || 1,
                            1
                          ),
                          sisaStok(
                            itemDipilih
                          )
                        )
                      );
                    }}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  />

                </div>

                {/* =================================================
                    KEPERLUAN
                ================================================= */}

                <div>

                  <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                    Keperluan
                  </label>

                  <textarea
                    required
                    rows={3}
                    value={keperluan}
                    onChange={(e) =>
                      setKeperluan(
                        e.target.value
                      )
                    }
                    placeholder="Contoh: Presentasi materi Bab 3 di kelas 9A"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 resize-none placeholder:text-slate-400"
                  />

                </div>

                {/* =================================================
                    BUTTON
                ================================================= */}

                <div className="flex gap-2 pt-1">

                  <button
                    type="button"
                    onClick={tutupForm}
                    className="flex-1 px-4 py-2.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Kirim Pengajuan
                  </button>

                </div>

              </form>

            )}

          </div>

        </div>

      )}

    </div>
  );
}