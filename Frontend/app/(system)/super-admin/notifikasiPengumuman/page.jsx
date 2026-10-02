"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Megaphone,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Check,
  X,
  Plus,
  Search,
  Sparkles,
  Calendar,
  User,
  Send,
  Archive,
  AlertTriangle,
  Info,
  Save,
} from "lucide-react";

// ============================================================
// THEME HELPERS
// ============================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// ============================================================
// DATA DUMMY
// ============================================================

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

// ============================================================
// UTILITY
// ============================================================

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

const getTipeColor = (tipe) => {
  const map = {
    info: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
    success: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
    warning: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
    error: `${themeDangerSurface} text-[var(--color-warning)] ${themeDangerBorder}`,
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
    high: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
    medium: `${themeWarningSurface} text-[var(--color-warning)] ${themeWarningBorder}`,
    low: `${themeInfoSurface} text-[var(--color-info)] ${themeInfoBorder}`,
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
    published: {
      bg: `${themeSuccessSurface} text-[var(--color-success)] ${themeSuccessBorder}`,
      label: "Dipublikasikan",
    },
    draft: {
      bg: `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`,
      label: "Draf",
    },
    archived: {
      bg: `${themeDangerSurface} text-[var(--color-warning)] ${themeDangerBorder}`,
      label: "Diarsipkan",
    },
  };

  return map[status] || map.draft;
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function NotifikasiPengumumanPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("notifikasi");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterKategori, setFilterKategori] = useState("Semua");
  const [filterDibaca, setFilterDibaca] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);

  const notificationsData = [
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

  const [notifications, setNotifications] = useState(
    dummyNotifications
  );

  const [announcements, setAnnouncements] = useState(
    dummyAnnouncements
  );

  const [newAnnouncement, setNewAnnouncement] = useState({
    judul: "",
    isi: "",
    kategori: "Pengumuman",
    prioritas: "medium",
  });

  // ============================================================
  // FILTER NOTIFIKASI
  // ============================================================

  const filteredNotifs = notifications.filter((n) => {
    const matchSearch =
      n.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.isi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchKategori =
      filterKategori === "Semua" ||
      n.kategori === filterKategori;

    const matchDibaca =
      filterDibaca === "Semua" ||
      (filterDibaca === "Belum Dibaca" && !n.dibaca) ||
      (filterDibaca === "Sudah Dibaca" && n.dibaca);

    return matchSearch && matchKategori && matchDibaca;
  });

  // ============================================================
  // FILTER PENGUMUMAN
  // ============================================================

  const filteredAnnounces = announcements.filter((a) => {
    const matchSearch =
      a.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.isi.toLowerCase().includes(searchQuery.toLowerCase());

    const matchKategori =
      filterKategori === "Semua" ||
      a.kategori === filterKategori;

    return matchSearch && matchKategori;
  });

  const unreadCount = notifications.filter(
    (n) => !n.dibaca
  ).length;

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleMarkRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, dibaca: true }
          : n
      )
    );
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        dibaca: true,
      }))
    );
  };

  const handleDeleteNotif = (id) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );
  };

  const handleDeleteAnnounce = (id) => {
    setAnnouncements((prev) =>
      prev.filter((a) => a.id !== id)
    );
  };

  const handleToggleStatus = (id) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status:
                a.status === "published"
                  ? "draft"
                  : "published",
              dipublikasikanPada:
                a.status === "draft"
                  ? new Date().toISOString()
                  : null,
            }
          : a
      )
    );
  };

  const handleCreateAnnouncement = () => {
    if (
      !newAnnouncement.judul.trim() ||
      !newAnnouncement.isi.trim()
    ) {
      return;
    }

    const newItem = {
      id: announcements.length + 1,
      ...newAnnouncement,
      status: "draft",
      dibuatPada: new Date().toISOString(),
      dipublikasikanPada: null,
      penulis: "Super Admin",
    };

    setAnnouncements([
      newItem,
      ...announcements,
    ]);

    setShowNewAnnouncement(false);

    setNewAnnouncement({
      judul: "",
      isi: "",
      kategori: "Pengumuman",
      prioritas: "medium",
    });
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const totalPagesNotif = Math.ceil(
    filteredNotifs.length / 5
  );

  const paginatedNotifs = filteredNotifs.slice(
    (currentPage - 1) * 5,
    currentPage * 5
  );

  const categories = [
    "Semua",
    "Sistem",
    "Keamanan",
    "Yayasan",
    "Sekolah",
    "Langganan",
    "Pengumuman",
    "Acara",
    "Kebijakan",
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="theme-page theme-text min-h-full">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
        <div className="space-y-5 lg:space-y-6">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                >
                  <Bell size={18} />
                </div>

                <h1 className="text-xl sm:text-2xl font-semibold theme-text">
                  Notifikasi & Pengumuman
                </h1>

                {unreadCount > 0 && (
                  <span
                    className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${themeWarningSurface} text-[var(--color-warning)] border ${themeWarningBorder}`}
                  >
                    {unreadCount} belum dibaca
                  </span>
                )}
              </div>

              <p className="theme-text-muted text-sm ml-[52px] mt-1 flex items-center gap-1.5">
                <Sparkles
                  size={14}
                  className="theme-text-muted"
                />
                Kelola notifikasi dan kirim pengumuman ke
                seluruh pengguna.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {activeTab === "notifikasi" &&
                unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${themePrimaryText} ${themePrimarySoft} border ${themePrimarySoftBorder} rounded-lg hover:bg-[color-mix(in_srgb,var(--color-primary)_14%,transparent)] transition-colors`}
                  >
                    <CheckCircle size={16} />
                    Tandai Semua Dibaca
                  </button>
                )}

              {activeTab === "pengumuman" && (
                <button
                  onClick={() =>
                    setShowNewAnnouncement(true)
                  }
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} rounded-lg transition-all ${themePrimaryShadow}`}
                >
                  <Plus size={16} />
                  Buat Pengumuman
                </button>
              )}
            </div>
          </div>

          {/* ==================================================
              TABS
          ================================================== */}

          <div
            className={`border-b ${themeDivider} overflow-x-auto`}
          >
            <nav className="flex gap-1 min-w-max">

              <button
                onClick={() => {
                  setActiveTab("notifikasi");
                  setCurrentPage(1);
                }}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                  rounded-t-lg border-b-2 transition-colors
                  ${
                    activeTab === "notifikasi"
                      ? `border-[var(--color-primary)] ${themePrimaryText} ${themePrimarySoft}`
                      : `border-transparent theme-text-secondary ${themeNeutralHover}`
                  }
                `}
              >
                <Bell size={16} />

                Notifikasi

                {unreadCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${themeWarningSurface} text-[var(--color-warning)] border ${themeWarningBorder}`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab("pengumuman");
                  setCurrentPage(1);
                }}
                className={`
                  flex items-center gap-2 px-4 py-2.5 text-sm font-medium
                  rounded-t-lg border-b-2 transition-colors
                  ${
                    activeTab === "pengumuman"
                      ? `border-[var(--color-primary)] ${themePrimaryText} ${themePrimarySoft}`
                      : `border-transparent theme-text-secondary ${themeNeutralHover}`
                  }
                `}
              >
                <Megaphone size={16} />

                Pengumuman

                {announcements.filter(
                  (a) => a.status === "published"
                ).length > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${themeSuccessSurface} text-[var(--color-success)] border ${themeSuccessBorder}`}
                  >
                    {
                      announcements.filter(
                        (a) => a.status === "published"
                      ).length
                    }
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* ==================================================
              SEARCH & FILTER
          ================================================== */}

          <div
            className={`theme-card rounded-xl border theme-border p-4 ${themeCardShadow}`}
          >
            <div className="flex flex-col sm:flex-row gap-3">

              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                />

                <input
                  type="text"
                  placeholder={
                    activeTab === "notifikasi"
                      ? "Cari notifikasi..."
                      : "Cari pengumuman..."
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`theme-input theme-text w-full pl-9 pr-3 py-2 text-sm rounded-lg ${themeFocus} transition-all placeholder:text-[var(--color-text-placeholder)]`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">

                <select
                  value={filterKategori}
                  onChange={(e) => {
                    setFilterKategori(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`theme-input theme-text w-full sm:w-auto px-3 py-2 text-sm rounded-lg ${themeFocus} min-w-[120px]`}
                >
                  {categories.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                    >
                      {cat}
                    </option>
                  ))}
                </select>

                {activeTab === "notifikasi" && (
                  <select
                    value={filterDibaca}
                    onChange={(e) => {
                      setFilterDibaca(e.target.value);
                      setCurrentPage(1);
                    }}
                    className={`theme-input theme-text w-full sm:w-auto px-3 py-2 text-sm rounded-lg ${themeFocus} min-w-[120px]`}
                  >
                    <option value="Semua">
                      Semua Status
                    </option>
                    <option value="Belum Dibaca">
                      Belum Dibaca
                    </option>
                    <option value="Sudah Dibaca">
                      Sudah Dibaca
                    </option>
                  </select>
                )}

                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterKategori("Semua");
                    setFilterDibaca("Semua");
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 text-sm theme-text-secondary ${themeNeutralHover} rounded-lg transition-colors`}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <div
            className={`theme-card rounded-xl border theme-border ${themeCardShadow} overflow-hidden`}
          >
            {activeTab === "notifikasi" ? (
              <>
                {paginatedNotifs.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell
                      size={48}
                      className="theme-text-muted mx-auto mb-3"
                    />

                    <p className="text-sm font-medium theme-text-secondary">
                      Tidak ada notifikasi
                    </p>

                    <p className="text-xs theme-text-muted mt-1">
                      Belum ada notifikasi yang masuk
                    </p>
                  </div>
                ) : (
                  <div>
                    {paginatedNotifs.map((notif, index) => {
                      const Icon = getTipeIcon(notif.tipe);
                      const tipeColor = getTipeColor(
                        notif.tipe
                      );

                      return (
                        <div
                          key={notif.id}
                          className={`
                            p-4 sm:p-5
                            transition-colors cursor-pointer
                            hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]
                            ${
                              index <
                              paginatedNotifs.length - 1
                                ? `border-b ${themeDivider}`
                                : ""
                            }
                            ${
                              !notif.dibaca
                                ? "border-l-4 border-l-[var(--color-primary)]"
                                : ""
                            }
                          `}
                          onClick={() => {
                            if (!notif.dibaca) {
                              handleMarkRead(notif.id);
                            }

                            if (notif.targetUrl) {
                              router.push(notif.targetUrl);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">

                            <div
                              className={`p-2 rounded-lg ${tipeColor} flex-shrink-0 mt-0.5 border`}
                            >
                              <Icon size={16} />
                            </div>

                            <div className="flex-1 min-w-0">

                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">

                                <h4
                                  className={`text-sm font-medium ${
                                    !notif.dibaca
                                      ? "theme-text"
                                      : "theme-text-secondary"
                                  }`}
                                >
                                  {notif.judul}

                                  {!notif.dibaca && (
                                    <span className="ml-2 inline-block w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                                  )}
                                </h4>

                                <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">

                                  <span className="text-xs theme-text-muted">
                                    {formatTanggal(
                                      notif.dibuatPada
                                    )}
                                  </span>

                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${themeNeutralSurface} theme-text-secondary border ${themeNeutralBorder}`}
                                  >
                                    {notif.kategori}
                                  </span>
                                </div>
                              </div>

                              <p className="text-sm theme-text-secondary mt-1">
                                {notif.isi}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 mt-2">

                                <span className="text-xs theme-text-muted flex items-center gap-1">
                                  <User size={12} />
                                  {notif.pengirim}
                                </span>

                                {notif.targetUrl && (
                                  <span
                                    className={`text-xs ${themePrimaryText} hover:underline font-medium`}
                                  >
                                    Lihat Detail →
                                  </span>
                                )}

                                <div className="flex items-center gap-0.5 ml-auto">

                                  {!notif.dibaca && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkRead(
                                          notif.id
                                        );
                                      }}
                                      className={`p-1.5 rounded-lg theme-text-muted hover:${themePrimaryText} ${themePrimarySoft} transition-colors`}
                                      title="Tandai Dibaca"
                                    >
                                      <Check size={14} />
                                    </button>
                                  )}

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNotif(
                                        notif.id
                                      );
                                    }}
                                    className={`p-1.5 rounded-lg theme-text-muted hover:text-[var(--color-warning)] ${themeWarningSurface} transition-colors`}
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

                {/* PAGINATION */}

                {totalPagesNotif > 1 && (
                  <div
                    className={`px-4 py-3 border-t ${themeDivider} flex flex-col sm:flex-row items-center justify-between gap-2`}
                  >
                    <p className="text-xs theme-text-muted text-center sm:text-left">
                      Menampilkan{" "}
                      {paginatedNotifs.length} dari{" "}
                      {filteredNotifs.length} notifikasi
                    </p>

                    <div className="flex items-center gap-0.5">

                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.max(
                              1,
                              currentPage - 1
                            )
                          )
                        }
                        disabled={currentPage === 1}
                        className={`px-3 py-1 text-sm theme-text-secondary ${themeNeutralHover} rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
                      >
                        Previous
                      </button>

                      {[
                        ...Array(
                          Math.min(
                            totalPagesNotif,
                            5
                          )
                        ),
                      ].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() =>
                            setCurrentPage(i + 1)
                          }
                          className={`
                            w-8 h-8 text-sm rounded-lg transition-colors
                            ${
                              currentPage === i + 1
                                ? `${themePrimaryGradient} text-[var(--color-card)] ${themeSmallShadow}`
                                : `theme-text-secondary ${themeNeutralHover}`
                            }
                          `}
                        >
                          {i + 1}
                        </button>
                      ))}

                      {totalPagesNotif > 5 && (
                        <>
                          <span className="theme-text-muted px-0.5">
                            …
                          </span>

                          <button
                            onClick={() =>
                              setCurrentPage(
                                totalPagesNotif
                              )
                            }
                            className={`
                              w-8 h-8 text-sm rounded-lg transition-colors
                              ${
                                currentPage ===
                                totalPagesNotif
                                  ? `${themePrimaryGradient} text-[var(--color-card)] ${themeSmallShadow}`
                                  : `theme-text-secondary ${themeNeutralHover}`
                              }
                            `}
                          >
                            {totalPagesNotif}
                          </button>
                        </>
                      )}

                      <button
                        onClick={() =>
                          setCurrentPage(
                            Math.min(
                              totalPagesNotif,
                              currentPage + 1
                            )
                          )
                        }
                        disabled={
                          currentPage === totalPagesNotif
                        }
                        className={`px-3 py-1 text-sm theme-text-secondary ${themeNeutralHover} rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
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

                    <Megaphone
                      size={48}
                      className="theme-text-muted mx-auto mb-3"
                    />

                    <p className="text-sm font-medium theme-text-secondary">
                      Tidak ada pengumuman
                    </p>

                    <p className="text-xs theme-text-muted mt-1">
                      Buat pengumuman pertama Anda
                    </p>

                    <button
                      onClick={() =>
                        setShowNewAnnouncement(true)
                      }
                      className={`mt-3 px-4 py-2 text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} rounded-lg ${themePrimaryShadow} transition-all`}
                    >
                      <Plus
                        size={16}
                        className="inline mr-1"
                      />
                      Buat Pengumuman
                    </button>
                  </div>
                ) : (
                  <div>
                    {filteredAnnounces.map(
                      (announce, index) => {
                        const statusBadge =
                          getStatusBadge(
                            announce.status
                          );

                        return (
                          <div
                            key={announce.id}
                            className={`
                              p-4 sm:p-5
                              hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]
                              transition-colors
                              ${
                                index <
                                filteredAnnounces.length - 1
                                  ? `border-b ${themeDivider}`
                                  : ""
                              }
                            `}
                          >
                            <div className="flex items-start gap-3">

                              <div
                                className={`p-2 rounded-lg ${themePrimarySoft} ${themePrimaryText} border ${themePrimarySoftBorder} flex-shrink-0 mt-0.5`}
                              >
                                <Megaphone size={16} />
                              </div>

                              <div className="flex-1 min-w-0">

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">

                                  <h4 className="text-sm font-medium theme-text">
                                    {announce.judul}
                                  </h4>

                                  <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">

                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge.bg}`}
                                    >
                                      {
                                        statusBadge.label
                                      }
                                    </span>

                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full border ${getPrioritasColor(
                                        announce.prioritas
                                      )}`}
                                    >
                                      {getPrioritasLabel(
                                        announce.prioritas
                                      )}
                                    </span>

                                    <span className="text-xs theme-text-muted">
                                      {formatTanggal(
                                        announce.dibuatPada
                                      )}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-sm theme-text-secondary mt-1">
                                  {announce.isi}
                                </p>

                                <div className="flex flex-wrap items-center gap-2 mt-2">

                                  <span className="text-xs theme-text-muted flex items-center gap-1">
                                    <User size={12} />
                                    {announce.penulis}
                                  </span>

                                  <span className="text-xs theme-text-muted flex items-center gap-1">
                                    <Calendar size={12} />
                                    {announce.dipublikasikanPada
                                      ? formatTanggal(
                                          announce.dipublikasikanPada
                                        )
                                      : "Belum dipublikasikan"}
                                  </span>

                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full ${themeNeutralSurface} theme-text-secondary border ${themeNeutralBorder}`}
                                  >
                                    {announce.kategori}
                                  </span>

                                  <div className="flex items-center gap-0.5 ml-auto">

                                    <button
                                      onClick={() =>
                                        handleToggleStatus(
                                          announce.id
                                        )
                                      }
                                      className={`p-1.5 rounded-lg theme-text-muted hover:text-[var(--color-warning)] ${themeWarningSurface} transition-colors`}
                                      title={
                                        announce.status ===
                                        "published"
                                          ? "Arsipkan"
                                          : "Publikasikan"
                                      }
                                    >
                                      {announce.status ===
                                      "published" ? (
                                        <Archive
                                          size={14}
                                        />
                                      ) : (
                                        <Send size={14} />
                                      )}
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleDeleteAnnounce(
                                          announce.id
                                        )
                                      }
                                      className={`p-1.5 rounded-lg theme-text-muted hover:text-[var(--color-warning)] ${themeWarningSurface} transition-colors`}
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
                      }
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div
            className={`text-center text-xs theme-text-muted py-2 border-t ${themeDivider}`}
          >
            © 2026 SmartSchool •{" "}
            {activeTab === "notifikasi"
              ? "Notifikasi"
              : "Pengumuman"}{" "}
            terakhir diperbarui hari ini
          </div>
        </div>
      </div>

      {/* ======================================================
          MODAL BUAT PENGUMUMAN
      ====================================================== */}

      {showNewAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[color-mix(in_srgb,var(--color-text)_42%,transparent)] backdrop-blur-sm p-4">

          <div
            className={`theme-card rounded-xl ${themeCardShadow} w-full max-w-lg max-h-[90vh] overflow-y-auto border theme-border`}
          >

            {/* MODAL HEADER */}

            <div
              className={`flex items-center justify-between px-5 py-4 border-b ${themeDivider} sticky top-0 theme-card z-10`}
            >
              <div className="flex items-center gap-2.5">

                <div
                  className={`p-1.5 rounded-lg ${themePrimarySoft} ${themePrimaryText} border ${themePrimarySoftBorder}`}
                >
                  <Megaphone size={18} />
                </div>

                <h3 className="text-sm font-semibold theme-text">
                  Buat Pengumuman Baru
                </h3>
              </div>

              <button
                onClick={() =>
                  setShowNewAnnouncement(false)
                }
                className={`p-1.5 rounded-lg theme-text-muted ${themeNeutralHover} hover:theme-text transition-colors`}
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="p-5 space-y-4">

              {/* JUDUL */}

              <div>
                <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                  Judul Pengumuman{" "}
                  <span className="text-[var(--color-warning)]">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={newAnnouncement.judul}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      judul: e.target.value,
                    })
                  }
                  placeholder="Masukkan judul pengumuman"
                  className={`theme-input theme-text w-full px-3 py-2 text-sm rounded-lg ${themeFocus} transition placeholder:text-[var(--color-text-placeholder)]`}
                />
              </div>

              {/* ISI */}

              <div>
                <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                  Isi Pengumuman{" "}
                  <span className="text-[var(--color-warning)]">
                    *
                  </span>
                </label>

                <textarea
                  value={newAnnouncement.isi}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      isi: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Tulis isi pengumuman di sini..."
                  className={`theme-input theme-text w-full px-3 py-2 text-sm rounded-lg ${themeFocus} transition resize-none placeholder:text-[var(--color-text-placeholder)]`}
                />
              </div>

              {/* KATEGORI + PRIORITAS */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                    Kategori
                  </label>

                  <select
                    value={newAnnouncement.kategori}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        kategori: e.target.value,
                      })
                    }
                    className={`theme-input theme-text w-full px-3 py-2 text-sm rounded-lg ${themeFocus} transition cursor-pointer`}
                  >
                    <option value="Pengumuman">
                      Pengumuman
                    </option>
                    <option value="Acara">
                      Acara
                    </option>
                    <option value="Kebijakan">
                      Kebijakan
                    </option>
                    <option value="Peringatan">
                      Peringatan
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium theme-text-secondary mb-1.5">
                    Prioritas
                  </label>

                  <select
                    value={newAnnouncement.prioritas}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        prioritas: e.target.value,
                      })
                    }
                    className={`theme-input theme-text w-full px-3 py-2 text-sm rounded-lg ${themeFocus} transition cursor-pointer`}
                  >
                    <option value="low">
                      Rendah
                    </option>
                    <option value="medium">
                      Sedang
                    </option>
                    <option value="high">
                      Penting
                    </option>
                  </select>
                </div>
              </div>

              {/* MODAL ACTION */}

              <div
                className={`flex flex-col-reverse sm:flex-row items-center gap-3 pt-2 border-t ${themeDivider}`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowNewAnnouncement(false)
                  }
                  className={`w-full sm:flex-1 py-2 rounded-lg text-sm font-medium theme-text-secondary border ${themeNeutralBorder} ${themeNeutralHover} transition-colors`}
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleCreateAnnouncement}
                  className={`w-full sm:flex-1 py-2 rounded-lg text-sm font-medium text-[var(--color-card)] ${themePrimaryGradient} transition-all ${themePrimaryShadow} flex items-center justify-center gap-2`}
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