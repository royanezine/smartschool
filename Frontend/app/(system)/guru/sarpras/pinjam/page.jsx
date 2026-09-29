"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

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
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  MapPin,
  Warehouse,
  RefreshCw,
} from "lucide-react";

import { getAset } from "../../../../../services/sarpras.service";

/* =========================================================
   ICON KATEGORI
========================================================= */

const getKategoriIcon = (kategori = "") => {
  const nama = kategori.toLowerCase();
  if (nama.includes("elektronik")) {
    if (nama.includes("sound") || nama.includes("speaker")) return Speaker;
    if (nama.includes("laptop") || nama.includes("komputer")) return Laptop;
    return Projector;
  }
  if (nama.includes("ruangan") || nama.includes("ruang")) return DoorOpen;
  if (nama.includes("olahraga") || nama.includes("sport")) return Dumbbell;
  return Wrench;
};

const getKategoriColor = (kategori = "") => {
  const nama = kategori.toLowerCase();
  if (nama.includes("elektronik")) {
    return "bg-gradient-to-br from-blue-500 to-blue-700 shadow-blue-500/25";
  }
  if (nama.includes("ruangan") || nama.includes("ruang")) {
    return "bg-gradient-to-br from-violet-500 to-violet-700 shadow-violet-500/25";
  }
  if (nama.includes("olahraga") || nama.includes("sport")) {
    return "bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-emerald-500/25";
  }
  return "bg-gradient-to-br from-slate-500 to-slate-700 shadow-slate-500/25";
};

const getKategoriTone = (kategori = "") => {
  const nama = kategori.toLowerCase();
  if (nama.includes("elektronik")) return "blue";
  if (nama.includes("ruangan") || nama.includes("ruang")) return "violet";
  if (nama.includes("olahraga") || nama.includes("sport")) return "emerald";
  return "slate";
};

/* =========================================================
   PAGE
========================================================= */

export default function GuruSarprasPinjamPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [daftarItem, setDaftarItem] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [kategoriAktif, setKategoriAktif] = useState("Semua");
  const [pencarian, setPencarian] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  /* =======================================================
     LOAD ASET — dipisah biar bisa dipanggil refresh
  ======================================================= */

  const loadAset = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError("");

      const response = await getAset();

      const data = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      setDaftarItem(data);
    } catch (err) {
      console.error("Gagal mengambil data aset:", err);
      setError(err?.message || "Gagal mengambil data sarana prasarana.");
      setDaftarItem([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* LOAD PERTAMA KALI */
  useEffect(() => {
    loadAset(false);
  }, [loadAset]);

  /* HANDLER REFRESH */
  const handleRefresh = () => {
    if (loading || refreshing) return;
    loadAset(true);
  };

  const notifications = [
    {
      id: 1,
      title: "Informasi Peminjaman",
      desc: "Cek status pengajuan peminjaman Anda",
      read: false,
    },
  ];

  /* KATEGORI */
  const kategori = useMemo(() => {
    const kategoriBackend = daftarItem
      .map((item) => item?.kategoriAset?.nama)
      .filter(Boolean);
    const kategoriUnik = [...new Set(kategoriBackend)];
    return ["Semua", ...kategoriUnik];
  }, [daftarItem]);

  /* FILTER */
  const itemTersaring = useMemo(() => {
    return daftarItem.filter((item) => {
      const namaKategori = item?.kategoriAset?.nama || "";
      const nama = item?.nama || "";
      const kode = item?.kode || "";

      const cocokKategori =
        kategoriAktif === "Semua" ||
        namaKategori.toLowerCase() === kategoriAktif.toLowerCase();

      const keyword = pencarian.trim().toLowerCase();
      const cocokPencarian =
        !keyword ||
        nama.toLowerCase().includes(keyword) ||
        kode.toLowerCase().includes(keyword) ||
        namaKategori.toLowerCase().includes(keyword);

      return cocokKategori && cocokPencarian;
    });
  }, [daftarItem, kategoriAktif, pencarian]);

  const getSisaStok = (item) => Number(item?.jumlahStok ?? 0);
  const getJumlahTotal = (item) => Number(item?.jumlah ?? 0);

  const toggleExpand = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  /* NAVIGATE KE HALAMAN AJUKAN */
  const bukaForm = (item) => {
    if (!item?.id) return;
    router.push(`/guru/sarpras/pinjam/ajukan?asetId=${item.id}`);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((v) => !v)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen((v) => !v)}
          notifications={notifications}
          user={{
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 overflow-y-auto relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -top-32 right-0 h-[320px] w-[320px] rounded-full bg-blue-100/40 blur-3xl" />
            <div className="absolute top-1/3 -left-40 h-[280px] w-[280px] rounded-full bg-indigo-100/30 blur-3xl" />
          </div>

          <div className="relative w-full max-w-[1700px] 2xl:max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">

            {/* =================================================
                HEADER + REFRESH
            ================================================= */}

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20">
                  <Package size={22} />
                </div>
                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">
                      Sarana & Prasarana
                    </p>
                  </div>
                  <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-slate-900">
                    Pinjam Sarana Prasarana
                  </h1>
                  <p className="mt-1 text-sm text-slate-500 max-w-2xl flex items-center gap-1.5">
                    <Sparkles size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      Pilih aset yang tersedia dan ajukan peminjaman.
                    </span>
                  </p>
                </div>
              </div>

              {/* TOMBOL REFRESH */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="inline-flex items-center justify-center gap-2 h-11 px-4 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:border-blue-300 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <RefreshCw
                  size={15}
                  className={loading || refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Memuat..." : "Refresh"}
              </button>
            </div>

            {/* =================================================
                SEARCH + KATEGORI
            ================================================= */}

            <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm space-y-3">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={pencarian}
                  onChange={(e) => setPencarian(e.target.value)}
                  placeholder="Cari aset berdasarkan nama, kode, atau kategori..."
                  className="w-full pl-10 pr-3 h-11 text-sm rounded-xl border border-slate-200 bg-slate-50/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {kategori.map((item) => {
                  const aktif = kategoriAktif === item;
                  const tone = item === "Semua" ? "blue" : getKategoriTone(item);

                  const tones = {
                    blue: aktif
                      ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white border-transparent shadow-md shadow-blue-600/25"
                      : "bg-white text-blue-700 border-blue-200 hover:border-blue-400 hover:bg-blue-50",
                    violet: aktif
                      ? "bg-gradient-to-b from-violet-600 to-violet-700 text-white border-transparent shadow-md shadow-violet-600/25"
                      : "bg-white text-violet-700 border-violet-200 hover:border-violet-400 hover:bg-violet-50",
                    emerald: aktif
                      ? "bg-gradient-to-b from-emerald-600 to-emerald-700 text-white border-transparent shadow-md shadow-emerald-600/25"
                      : "bg-white text-emerald-700 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50",
                    slate: aktif
                      ? "bg-gradient-to-b from-slate-700 to-slate-800 text-white border-transparent shadow-md shadow-slate-700/25"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50",
                  };

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setKategoriAktif(item)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border whitespace-nowrap transition-all ${tones[tone]}`}
                    >
                      {item !== "Semua" && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            aktif ? "bg-white/80" : `bg-${tone}-500`
                          }`}
                        />
                      )}
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-500 border border-red-100 flex-shrink-0">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-700">
                    Gagal memuat data aset
                  </p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* =================================================
                LIST
            ================================================= */}

            {loading ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm py-16 flex flex-col items-center justify-center">
                <Loader2 size={28} className="animate-spin text-blue-600" />
                <p className="text-sm text-slate-500 mt-3">Memuat data aset...</p>
              </div>
            ) : (
              <div
                className={`space-y-3 transition-opacity duration-200 ${
                  refreshing ? "opacity-60 pointer-events-none" : "opacity-100"
                }`}
              >
                {itemTersaring.map((item) => {
                  const namaKategori = item?.kategoriAset?.nama || "Lainnya";
                  const Icon = getKategoriIcon(namaKategori);
                  const warna = getKategoriColor(namaKategori);
                  const tone = getKategoriTone(namaKategori);

                  const sisa = getSisaStok(item);
                  const total = getJumlahTotal(item);
                  const tersedia =
                    item?.isTersedia ?? (sisa > 0 && item?.status === "aktif");

                  const expanded = expandedId === item.id;

                  const accentBorder = {
                    blue: "before:bg-gradient-to-b before:from-blue-500 before:to-blue-700",
                    violet: "before:bg-gradient-to-b before:from-violet-500 before:to-violet-700",
                    emerald: "before:bg-gradient-to-b before:from-emerald-500 before:to-emerald-700",
                    slate: "before:bg-gradient-to-b before:from-slate-500 before:to-slate-700",
                  };

                  return (
                    <div
                      key={item.id}
                      className={`relative bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/60 before:content-[''] before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] ${accentBorder[tone]} ${
                        expanded ? "ring-1 ring-blue-100" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 p-4 sm:p-5">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md flex-shrink-0 ${warna}`}
                        >
                          <Icon size={19} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-sm font-bold text-slate-900 truncate">
                              {item?.nama || "-"}
                            </h2>
                            {item?.kode && (
                              <span className="text-[10px] font-mono font-semibold text-slate-400 px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200/70">
                                {item.kode}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500 mt-1">
                            {namaKategori}
                          </p>

                          {item?.lokasi && (
                            <p className="text-[11px] text-slate-400 mt-1 truncate flex items-center gap-1">
                              <MapPin size={10} />
                              {item.lokasi}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                              !tersedia
                                ? "bg-red-50 text-red-600 border-red-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                !tersedia ? "bg-red-500" : "bg-emerald-500"
                              }`}
                            />
                            {!tersedia
                              ? "Tidak tersedia"
                              : `Sisa ${sisa}/${total}`}
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleExpand(item.id)}
                            className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            Detail
                            {expanded ? (
                              <ChevronUp size={12} />
                            ) : (
                              <ChevronDown size={12} />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => bukaForm(item)}
                            disabled={!tersedia}
                            className={`text-xs font-semibold px-3.5 py-2 rounded-lg transition-all flex-shrink-0 ${
                              !tersedia
                                ? "text-slate-300 cursor-not-allowed"
                                : "bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/30"
                            }`}
                          >
                            Ajukan
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className="sm:hidden flex items-center gap-1 text-[11px] font-semibold text-slate-500 px-4 pb-3 -mt-1"
                      >
                        Detail
                        {expanded ? (
                          <ChevronUp size={12} />
                        ) : (
                          <ChevronDown size={12} />
                        )}
                      </button>

                      {expanded && (
                        <div className="border-t border-slate-100 bg-gradient-to-br from-slate-50 to-white px-4 sm:px-5 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <DetailRow label="Kode aset" value={item?.kode || "-"} />
                            <DetailRow
                              label="Kondisi"
                              value={item?.kondisi || "-"}
                              capitalize
                            />
                            <DetailRow
                              label="Status"
                              value={item?.status || "-"}
                              capitalize
                            />
                            <DetailRow label="Total aset" value={total} />
                            <DetailRow label="Stok tersedia" value={sisa} />
                            {item?.lokasi && (
                              <DetailRow
                                label="Lokasi"
                                value={item.lokasi}
                                icon={<MapPin size={11} />}
                              />
                            )}
                            {item?.gudang?.nama && (
                              <DetailRow
                                label="Gudang"
                                value={item.gudang.nama}
                                icon={<Warehouse size={11} />}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {itemTersaring.length === 0 && (
                  <div className="bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm text-center py-16">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Package size={22} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 mt-4">
                      Tidak ada aset ditemukan
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba ubah kata kunci atau kategori.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ROW
========================================================= */

function DetailRow({ label, value, icon, capitalize }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-slate-500 flex items-center gap-1.5 flex-shrink-0">
        {icon}
        {label}
      </span>
      <span
        className={`font-semibold text-slate-800 truncate text-right ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}