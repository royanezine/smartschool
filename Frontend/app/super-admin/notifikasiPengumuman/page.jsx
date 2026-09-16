"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import {
  Bell,
  Megaphone,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  Check,
  X,
  Plus,
  Search,
  Sparkles,
  Calendar,
  User,
  Mail,
  Send,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Edit,
  Copy,
  Archive,
  Pin,
  PinOff,
  AlertCircle,
  Info,
  AlertTriangle,
  Award,
  FileText,
  RefreshCw,
  Save,
} from "lucide-react";

// ===== DATA DUMMY =====
const dummyNotifications = [
  {
    id: 1,
    judul: "Pembaruan Sistem v2.0",
    isi: "SmartSchool telah diperbarui ke versi 2.0 dengan fitur-fitur baru seperti LMS, manajemen aset, dan dashboard eksekutif.",
    kategori: "Sistem",
    tipe: "info",
    dibaca: false,
    dibuatPada: "2026-08-11T10:30:00Z",
    pengirim: "Super Admin",
    targetUrl: "/super-admin/pengaturan",
  },
  {
    id: 2,
    judul: "Pengingat: Backup Data",
    isi: "Lakukan backup data secara rutin setiap hari Jumat untuk menghindari kehilangan data penting.",
    kategori: "Keamanan",
    tipe: "warning",
    dibaca: false,
    dibuatPada: "2026-08-10T08:15:00Z",
    pengirim: "Sistem",
    targetUrl: null,
  },
  {
    id: 3,
    judul: "Yayasan baru mendaftar",
    isi: "Yayasan Pendidikan Harapan telah mendaftar di SmartSchool dan menunggu verifikasi.",
    kategori: "Yayasan",
    tipe: "success",
    dibaca: true,
    dibuatPada: "2026-08-09T14:45:00Z",
    pengirim: "Super Admin",
    targetUrl: "/super-admin/yayasan/1",
  },
  {
    id: 4,
    judul: "Sekolah baru terdaftar",
    isi: "SMA Bina Bangsa telah terdaftar sebagai sekolah baru dan siap digunakan.",
    kategori: "Sekolah",
    tipe: "info",
    dibaca: true,
    dibuatPada: "2026-08-08T09:00:00Z",
    pengirim: "Super Admin",
    targetUrl: "/super-admin/sekolah/2",
  },
  {
    id: 5,
    judul: "Pembayaran langganan gagal",
    isi: "Pembayaran langganan untuk SMA Taruna Nusantara gagal diproses. Segera hubungi sekolah.",
    kategori: "Langganan",
    tipe: "error",
    dibaca: false,
    dibuatPada: "2026-08-07T16:20:00Z",
    pengirim: "Sistem",
    targetUrl: "/super-admin/langgananSekolah/lang-004",
  },
  {
    id: 6,
    judul: "Modul baru: E-Kantin",
    isi: "Fitur E-Kantin telah tersedia untuk semua sekolah. Aktifkan melalui pengaturan modul.",
    kategori: "Sistem",
    tipe: "info",
    dibaca: false,
    dibuatPada: "2026-08-06T11:00:00Z",
    pengirim: "Super Admin",
    targetUrl: "/super-admin/paketModul",
  },
];

const dummyAnnouncements = [
  {
    id: 1,
    judul: "Libur Nasional 17 Agustus",
    isi: "Seluruh aktivitas SmartSchool diliburkan pada tanggal 17 Agustus 2026 dalam rangka Hari Kemerdekaan RI.",
    kategori: "Pengumuman",
    status: "published",
    dibuatPada: "2026-08-10T07:00:00Z",
    dipublikasikanPada: "2026-08-10T08:00:00Z",
    prioritas: "high",
    penulis: "Super Admin",
  },
  {
    id: 2,
    judul: "Pelatihan Penggunaan LMS",
    isi: "Akan diadakan pelatihan penggunaan LMS bagi seluruh guru pada 20 Agustus 2026 pukul 09.00 WIB.",
    kategori: "Acara",
    status: "draft",
    dibuatPada: "2026-08-09T13:00:00Z",
    dipublikasikanPada: null,
    prioritas: "medium",
    penulis: "Super Admin",
  },
  {
    id: 3,
    judul: "Pembaruan Kebijakan Privasi",
    isi: "Kebijakan privasi SmartSchool telah diperbarui. Silakan baca di halaman kebijakan privasi.",
    kategori: "Kebijakan",
    status: "published",
    dibuatPada: "2026-08-08T10:00:00Z",
    dipublikasikanPada: "2026-08-08T11:00:00Z",
    prioritas: "low",
    penulis: "Super Admin",
  },
];

// ===== UTILITY =====
const formatTanggal = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTanggalShort = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getTipeColor = (tipe) => {
  const map = {
    info: "bg-blue-50 text-blue-600 border-blue-200",
    success: "bg-emerald-50 text-emerald-600 border-emerald-200",
    warning: "bg-amber-50 text-amber-600 border-amber-200",
    error: "bg-rose-50 text-rose-600 border-rose-200",
  };
  return map[tipe] || map.info;
};

const getTipeIcon = (tipe) => {
  const map = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
  };
  return map[tipe] || Info;
};

const getPrioritasColor = (prioritas) => {
  const map = {
    high: "bg-rose-50 text-rose-600 border-rose-200",
    medium: "bg-amber-50 text-amber-600 border-amber-200",
    low: "bg-blue-50 text-blue-600 border-blue-200",
  };
  return map[prioritas] || map.low;
};

const getPrioritasLabel = (prioritas) => {
  const map = {
    high: "Penting",
    medium: "Sedang",
    low: "Rendah",
  };
  return map[prioritas] || prioritas;
};

const getStatusBadge = (status) => {
  const map = {
    published: { bg: "bg-emerald-50 text-emerald-600 border-emerald-200", label: "Dipublikasikan" },
    draft: { bg: "bg-slate-50 text-slate-500 border-slate-200", label: "Draf" },
    archived: { bg: "bg-rose-50 text-rose-500 border-rose-200", label: "Diarsipkan" },
  };
  return map[status] || map.draft;
};

const getStatusLabel = (status) => {
  const map = {
    published: "Dipublikasikan",
    draft: "Draf",
    archived: "Diarsipkan",
  };
  return map[status] || status;
};

// ===== MAIN COMPONENT =====

export default function NotifikasiPengumumanPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu] = useState("notifikasi");
  const [activeTab, setActiveTab] = useState("notifikasi");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [filterDibaca, setFilterDibaca] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);

  const notificationsData = [
    { id: 1, title: "Pembaruan Sistem v2.0", desc: "Dikirim 2 jam lalu", read: false },
    { id: 2, title: "Pengingat: Backup Data", desc: "Dikirim 1 hari lalu", read: false },
  ];

  // State untuk data
  const [notifications, setNotifications] = useState(dummyNotifications);
  const [announcements, setAnnouncements] = useState(dummyAnnouncements);

  // State untuk form pengumuman baru
  const [newAnnouncement, setNewAnnouncement] = useState({
    judul: "",
    isi: "",
    kategori: "Pengumuman",
    prioritas: "medium",
  });

  // Filter Notifikasi
  const filteredNotifs = notifications.filter((n) => {
    const matchSearch =
      n.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.isi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = filterKategori === "Semua" || n.kategori === filterKategori;
    const matchDibaca =
      filterDibaca === "Semua" ||
      (filterDibaca === "Belum Dibaca" && !n.dibaca) ||
      (filterDibaca === "Sudah Dibaca" && n.dibaca);
    return matchSearch && matchKategori && matchDibaca;
  });

  // Filter Pengumuman
  const filteredAnnounces = announcements.filter((a) => {
    const matchSearch =
      a.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.isi.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = filterKategori === "Semua" || a.kategori === filterKategori;
    return matchSearch && matchKategori;
  });

  const unreadCount = notifications.filter((n) => !n.dibaca).length;

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, dibaca: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
  };

  const handleDeleteNotif = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDeleteAnnounce = (id) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleStatus = (id) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: a.status === "published" ? "draft" : "published",
              dipublikasikanPada: a.status === "draft" ? new Date().toISOString() : null,
            }
          : a
      )
    );
  };

  const handleCreateAnnouncement = () => {
    if (!newAnnouncement.judul.trim() || !newAnnouncement.isi.trim()) return;
    const newItem = {
      id: announcements.length + 1,
      ...newAnnouncement,
      status: "draft",
      dibuatPada: new Date().toISOString(),
      dipublikasikanPada: null,
      penulis: "Super Admin",
    };
    setAnnouncements([newItem, ...announcements]);
    setShowNewAnnouncement(false);
    setNewAnnouncement({ judul: "", isi: "", kategori: "Pengumuman", prioritas: "medium" });
  };

  const totalPagesNotif = Math.ceil(filteredNotifs.length / 5);
  const paginatedNotifs = filteredNotifs.slice(
    (currentPage - 1) * 5,
    currentPage * 5
  );

  const categories = ["Semua", "Sistem", "Keamanan", "Yayasan", "Sekolah", "Langganan", "Pengumuman", "Acara", "Kebijakan"];

  return (
  <div className="flex min-h-screen bg-slate-50">
    <Sidebar
      active={activeMenu}
      setActive={() => {}}
      collapsed={!sidebarOpen}
      setCollapsed={() => setSidebarOpen(!sidebarOpen)}
    />

    <div className="flex-1 flex flex-col min-w-0">
      <Header
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        notifications={notificationsData}
        user={{
          name: "Super Admin",
          email: "admin@smartschool.com",
          avatar: "SA",
        }}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="w-full space-y-6">


            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-600 text-white shadow-sm">
                    <Bell size={18} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
                    Notifikasi & Pengumuman
                  </h1>
                 
                  {unreadCount > 0 && (
                    <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200">
                      {unreadCount} belum dibaca
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 ml-[52px] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-slate-400" />
                  Kelola notifikasi dan kirim pengumuman ke seluruh pengguna.
                </p>
              </div>
              <div className="flex items-center gap-2.5 ml-[52px] sm:ml-0">
                {activeTab === "notifikasi" && unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <CheckCircle size={16} />
                    Tandai Semua Dibaca
                  </button>
                )}
                {activeTab === "pengumuman" && (
                  <button
                    onClick={() => setShowNewAnnouncement(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow"
                  >
                    <Plus size={16} />
                    Buat Pengumuman
                  </button>
                )}
              </div>
            </div>

            {/* TABS */}
            <div className="border-b border-slate-200/80 overflow-x-auto">
              <nav className="flex gap-1 min-w-max">
                <button
                  onClick={() => setActiveTab("notifikasi")}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors
                    ${activeTab === "notifikasi"
                      ? "border-blue-600 text-blue-600 bg-blue-50/50"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }
                  `}
                >
                  <Bell size={16} />
                  Notifikasi
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-600 border border-rose-200">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("pengumuman")}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors
                    ${activeTab === "pengumuman"
                      ? "border-blue-600 text-blue-600 bg-blue-50/50"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }
                  `}
                >
                  <Megaphone size={16} />
                  Pengumuman
                  {announcements.filter((a) => a.status === "published").length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                      {announcements.filter((a) => a.status === "published").length}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* SEARCH & FILTER */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={activeTab === "notifikasi" ? "Cari notifikasi..." : "Cari pengumuman..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder:text-slate-400"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={filterKategori}
                    onChange={(e) => setFilterKategori(e.target.value)}
                    className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-600 min-w-[120px]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {activeTab === "notifikasi" && (
                    <select
                      value={filterDibaca}
                      onChange={(e) => setFilterDibaca(e.target.value)}
                      className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 text-slate-600 min-w-[120px]"
                    >
                      <option value="Semua">Semua Status</option>
                      <option value="Belum Dibaca">Belum Dibaca</option>
                      <option value="Sudah Dibaca">Sudah Dibaca</option>
                    </select>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterKategori("Semua");
                      setFilterDibaca("Semua");
                    }}
                    className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              {activeTab === "notifikasi" ? (
                <>
                  {paginatedNotifs.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell size={48} className="text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-600">Tidak ada notifikasi</p>
                      <p className="text-xs text-slate-400 mt-1">Belum ada notifikasi yang masuk</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {paginatedNotifs.map((notif) => {
                        const Icon = getTipeIcon(notif.tipe);
                        const tipeColor = getTipeColor(notif.tipe);
                        return (
                          <div
                            key={notif.id}
                            className={`p-4 sm:p-5 hover:bg-slate-50/60 transition-colors cursor-pointer ${
                              !notif.dibaca ? "bg-blue-50/30 border-l-4 border-l-blue-500" : ""
                            }`}
                            onClick={() => {
                              if (!notif.dibaca) handleMarkRead(notif.id);
                              if (notif.targetUrl) router.push(notif.targetUrl);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${tipeColor} flex-shrink-0 mt-0.5`}>
                                <Icon size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                  <h4 className={`text-sm font-medium ${!notif.dibaca ? "text-slate-800" : "text-slate-600"}`}>
                                    {notif.judul}
                                    {!notif.dibaca && (
                                      <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500" />
                                    )}
                                  </h4>
                                  <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                                    <span className="text-xs text-slate-400">{formatTanggal(notif.dibuatPada)}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                      {notif.kategori}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">{notif.isi}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <User size={12} />
                                    {notif.pengirim}
                                  </span>
                                  {notif.targetUrl && (
                                    <span className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                      Lihat Detail →
                                    </span>
                                  )}
                                  <div className="flex items-center gap-0.5 ml-auto">
                                    {!notif.dibaca && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                                        className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                                        title="Tandai Dibaca"
                                      >
                                        <Check size={14} />
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteNotif(notif.id); }}
                                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                      title="Hapus"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPagesNotif > 1 && (
                    <div className="px-4 py-3 border-t border-slate-200/80 flex flex-col xs:flex-row items-center justify-between gap-2">
                      <p className="text-xs text-slate-500 text-center xs:text-left">
                        Menampilkan {paginatedNotifs.length} dari {filteredNotifs.length} notifikasi
                      </p>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        {[...Array(Math.min(totalPagesNotif, 5))].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                              currentPage === i + 1
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-500 hover:bg-slate-100"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        {totalPagesNotif > 5 && (
                          <>
                            <span className="text-slate-400 px-0.5">…</span>
                            <button
                              onClick={() => setCurrentPage(totalPagesNotif)}
                              className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                                currentPage === totalPagesNotif
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : "text-slate-500 hover:bg-slate-100"
                              }`}
                            >
                              {totalPagesNotif}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPagesNotif, currentPage + 1))}
                          disabled={currentPage === totalPagesNotif}
                          className="px-3 py-1 text-sm text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {filteredAnnounces.length === 0 ? (
                    <div className="p-8 text-center">
                      <Megaphone size={48} className="text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-600">Tidak ada pengumuman</p>
                      <p className="text-xs text-slate-400 mt-1">Buat pengumuman pertama Anda</p>
                      <button
                        onClick={() => setShowNewAnnouncement(true)}
                        className="mt-3 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus size={16} className="inline mr-1" />
                        Buat Pengumuman
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {filteredAnnounces.map((announce) => {
                        const statusBadge = getStatusBadge(announce.status);
                        return (
                          <div key={announce.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 flex-shrink-0 mt-0.5">
                                <Megaphone size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                  <h4 className="text-sm font-medium text-slate-800">{announce.judul}</h4>
                                  <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge.bg}`}>
                                      {statusBadge.label}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getPrioritasColor(announce.prioritas)}`}>
                                      {getPrioritasLabel(announce.prioritas)}
                                    </span>
                                    <span className="text-xs text-slate-400">{formatTanggal(announce.dibuatPada)}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">{announce.isi}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <User size={12} />
                                    {announce.penulis}
                                  </span>
                                  <span className="text-xs text-slate-400 flex items-center gap-1">
                                    <Calendar size={12} />
                                    {announce.dipublikasikanPada
                                      ? formatTanggal(announce.dipublikasikanPada)
                                      : "Belum dipublikasikan"}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                    {announce.kategori}
                                  </span>
                                  <div className="flex items-center gap-0.5 ml-auto">
                                    <button
                                      onClick={() => handleToggleStatus(announce.id)}
                                      className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
                                      title={announce.status === "published" ? "Arsipkan" : "Publikasikan"}
                                    >
                                      {announce.status === "published" ? <Archive size={14} /> : <Send size={14} />}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAnnounce(announce.id)}
                                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                      title="Hapus"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* FOOTER */}
            <div className="text-center text-xs text-slate-400/80 py-2 border-t border-slate-200/40">
              © 2026 SmartSchool • {activeTab === "notifikasi" ? "Notifikasi" : "Pengumuman"} terakhir diperbarui hari ini
            </div>
          </div>
        </main>
      </div>

      {/* MODAL BUAT PENGUMUMAN */}
      {showNewAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Megaphone size={18} />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">Buat Pengumuman Baru</h3>
              </div>
              <button
                onClick={() => setShowNewAnnouncement(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Judul Pengumuman <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAnnouncement.judul}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, judul: e.target.value })}
                  placeholder="Masukkan judul pengumuman"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">
                  Isi Pengumuman <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={newAnnouncement.isi}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isi: e.target.value })}
                  rows={4}
                  placeholder="Tulis isi pengumuman di sini..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition resize-none placeholder:text-slate-400"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Kategori</label>
                  <select
                    value={newAnnouncement.kategori}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, kategori: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-600"
                  >
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Acara">Acara</option>
                    <option value="Kebijakan">Kebijakan</option>
                    <option value="Peringatan">Peringatan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Prioritas</label>
                  <select
                    value={newAnnouncement.prioritas}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, prioritas: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition cursor-pointer text-slate-600"
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Penting</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setShowNewAnnouncement(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCreateAnnouncement}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm hover:shadow flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Simpan Sebagai Draf
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}