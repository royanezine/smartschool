"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Command,
  Crown,
  CheckCheck,
  Loader2,
} from "lucide-react";

import {
  getNotifikasi,
  markNotifikasiAsRead,
  markAllNotifikasiAsRead,
} from "../../services/notifikasi.service";

export default function Header({
  notifications = [],
  user = {
    name: "Super Admin",
    email: "admin@smartschool.com",
    avatar: "SA",
  },
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [notifList, setNotifList] = useState(
    Array.isArray(notifications) ? notifications : []
  );

  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [notifError, setNotifError] = useState("");

  // ============================================================
  // DETEKSI ROLE DARI PATHNAME
  // ============================================================

  const resolveRole = (currentPathname) => {
    if (currentPathname?.startsWith("/super-admin")) {
      return "super-admin";
    }

    if (currentPathname?.startsWith("/cmsAdmin")) {
      return "cms-admin";
    }

    if (currentPathname?.startsWith("/admin")) {
      return "admin-sekolah";
    }

    if (currentPathname?.startsWith("/yayasan")) {
      return "yayasan";
    }

    if (currentPathname?.startsWith("/guru")) {
      return "guru";
    }

    if (currentPathname?.startsWith("/siswa")) {
      return "siswa";
    }

    return "super-admin";
  };

  const role = resolveRole(pathname);

  // ============================================================
  // MAPPING PATH PER ROLE
  // ============================================================

  const pathMap = {
    "super-admin": {
      profile: "/super-admin/profileLogout",
      pengaturan: "/super-admin/pengaturanSistem",
      bantuan: "/super-admin/bantuan",
    },

    "cms-admin": {
      profile: "/cmsAdmin/profile",
      pengaturan: "/cmsAdmin/pengaturan",
      bantuan: "/cmsAdmin/bantuan",
    },

    "admin-sekolah": {
      profile: "/admin/profil",
      pengaturan: "/admin/pengaturan",
      bantuan: "/admin/bantuan",
    },

    yayasan: {
      profile: "/yayasan/profil",
      pengaturan: "/yayasan/pengaturan",
      bantuan: "/yayasan/help",
    },

    guru: {
      profile: "/guru/profile-saya",
      pengaturan: "/guru/pengaturan",
      bantuan: "/guru/bantuan",
    },

    siswa: {
      profile: "/siswa/profil-saya",
      pengaturan: "/siswa/pengaturan",
      bantuan: "/siswa/bantuan",
    },
  };

  // ============================================================
  // ROLE LABEL
  // ============================================================

  const roleLabel =
    {
      "super-admin": "Super Admin",
      "cms-admin": "CMS Admin",
      "admin-sekolah": "Admin Sekolah",
      yayasan: "Yayasan",
      guru: "Guru",
      siswa: "Siswa",
    }[role] || "User";

  const roleBadgeColor =
    {
      "super-admin": "text-purple-600 bg-purple-100",
      "cms-admin": "text-teal-600 bg-teal-100",
      "admin-sekolah": "text-orange-600 bg-orange-100",
      yayasan: "text-blue-600 bg-blue-100",
      guru: "text-emerald-600 bg-emerald-100",
      siswa: "text-cyan-600 bg-cyan-100",
    }[role] || "text-slate-600 bg-slate-100";

  // ============================================================
  // LOAD NOTIFIKASI DARI BACKEND
  // ============================================================

  const loadNotifications = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoadingNotif(true);
      }

      setNotifError("");

      const result = await getNotifikasi();

      console.log("📢 RESPONSE NOTIFIKASI:", result);

      /*
       * Backend successResponse kemungkinan menghasilkan:
       *
       * {
       *   success: true,
       *   message: "...",
       *   data: {
       *     unreadCount: 1,
       *     list: [...]
       *   }
       * }
       *
       * Tetapi kita buat fleksibel kalau apiFetch
       * ternyata sudah meng-unwrapping data.
       */

      const notificationData =
        result?.data?.data ??
        result?.data ??
        result ??
        {};

      const list =
        Array.isArray(notificationData?.list)
          ? notificationData.list
          : Array.isArray(result?.list)
            ? result.list
            : Array.isArray(notificationData)
              ? notificationData
              : [];

      const unreadFromBackend =
        notificationData?.unreadCount ??
        result?.unreadCount;

      const unread =
        unreadFromBackend !== undefined &&
        unreadFromBackend !== null
          ? Number(unreadFromBackend)
          : list.filter(
              (item) => !item?.dibaca
            ).length;

      setNotifList(list);

      setUnreadCount(
        Number.isFinite(unread)
          ? unread
          : 0
      );
    } catch (error) {
      console.error(
        "❌ Gagal mengambil notifikasi:",
        error
      );

      /*
       * Jangan langsung menghapus notifikasi lama
       * ketika polling gagal.
       */
      setNotifError(
        error?.message ||
          "Gagal mengambil notifikasi."
      );
    } finally {
      if (showLoading) {
        setLoadingNotif(false);
      }
    }
  }, []);

  // ============================================================
  // LOAD PERTAMA KALI
  // ============================================================

  useEffect(() => {
    loadNotifications(true);
  }, [loadNotifications]);

  // ============================================================
  // AUTO REFRESH NOTIFIKASI
  //
  // Setiap 10 detik.
  // Jadi kalau guru baru menilai tugas,
  // badge notifikasi siswa akan muncul otomatis.
  // ============================================================

  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications(false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [loadNotifications]);

  // ============================================================
  // REFRESH SAAT DROPDOWN DIBUKA
  // ============================================================

  useEffect(() => {
    if (isNotifOpen) {
      loadNotifications(true);
    }
  }, [isNotifOpen, loadNotifications]);

  // ============================================================
  // FORMAT WAKTU
  // ============================================================

  const formatNotificationTime = (dateString) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const diff =
      now.getTime() - date.getTime();

    if (diff < 0) {
      return "Baru saja";
    }

    const seconds = Math.floor(
      diff / 1000
    );

    const minutes = Math.floor(
      seconds / 60
    );

    const hours = Math.floor(
      minutes / 60
    );

    const days = Math.floor(
      hours / 24
    );

    if (seconds < 60) {
      return "Baru saja";
    }

    if (minutes < 60) {
      return `${minutes} menit lalu`;
    }

    if (hours < 24) {
      return `${hours} jam lalu`;
    }

    if (days < 7) {
      return `${days} hari lalu`;
    }

    return date.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ============================================================
  // KLIK NOTIFIKASI
  // ============================================================

  const handleNotificationClick = async (
    notif
  ) => {
    try {
      if (!notif?.id) {
        return;
      }

      if (!notif.dibaca) {
        await markNotifikasiAsRead(
          notif.id
        );

        setNotifList((current) =>
          current.map((item) =>
            item.id === notif.id
              ? {
                  ...item,
                  dibaca: true,
                  dibacaPada:
                    new Date().toISOString(),
                }
              : item
          )
        );

        setUnreadCount((current) =>
          Math.max(0, current - 1)
        );
      }

      setIsNotifOpen(false);

      if (notif.targetUrl) {
        router.push(
          notif.targetUrl
        );
      }
    } catch (error) {
      console.error(
        "Gagal menandai notifikasi:",
        error
      );
    }
  };

  // ============================================================
  // TANDAI SEMUA DIBACA
  // ============================================================

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      await markAllNotifikasiAsRead();

      setNotifList((current) =>
        current.map((item) => ({
          ...item,
          dibaca: true,
          dibacaPada:
            item.dibacaPada ||
            new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Gagal menandai semua notifikasi:",
        error
      );
    }
  };

  // ============================================================
  // NAVIGASI PROFILE
  // ============================================================

  const navigateTo = (path) => {
    setIsProfileOpen(false);

    if (path) {
      router.push(path);
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    setIsProfileOpen(false);

    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    router.push("/login");
  };

  // ============================================================
  // MENU PROFILE
  // ============================================================

  const currentPathMap =
    pathMap[role] ||
    pathMap["super-admin"];

  const menuItems = [
    {
      label: "Profil Saya",
      icon: User,
      path: currentPathMap.profile,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "Pengaturan",
      icon: Settings,
      path: currentPathMap.pengaturan,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      label: "Bantuan",
      icon: HelpCircle,
      path: currentPathMap.bantuan,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <header className="h-16 sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200/70">
      <div className="h-full flex items-center justify-between px-4 md:px-6 lg:px-8">

        {/* ======================================================
            LEFT
        ====================================================== */}

        <div className="flex items-center gap-3 md:gap-5 min-w-0">
          <div className="relative hidden lg:block">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Cari menu, fitur, atau halaman..."
              className="pl-10 pr-16 py-2 bg-slate-50/80 border border-slate-200/60 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-64 xl:w-80 transition-all duration-200 hover:bg-slate-50"
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <kbd className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 flex items-center gap-0.5">
                <Command size={10} />
                K
              </kbd>
            </div>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
            aria-label="Cari"
          >
            <Search size={19} />
          </button>
        </div>

        {/* ======================================================
            RIGHT
        ====================================================== */}

        <div className="flex items-center gap-1 md:gap-2">

          {/* ====================================================
              DARK MODE
          ==================================================== */}

          <button
            type="button"
            onClick={() =>
              setIsDarkMode(
                (current) => !current
              )
            }
            className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 text-slate-400 hover:text-slate-600 hover:scale-105 relative group"
            aria-label={
              isDarkMode
                ? "Mode terang"
                : "Mode gelap"
            }
          >
            {isDarkMode ? (
              <Sun
                size={18}
                className="text-yellow-500"
              />
            ) : (
              <Moon size={18} />
            )}

            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
              {isDarkMode
                ? "Mode Terang"
                : "Mode Gelap"}
            </span>
          </button>

          {/* ====================================================
              NOTIFIKASI
          ==================================================== */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setIsNotifOpen(
                  (current) => !current
                )
              }
              className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 text-slate-400 hover:text-slate-600 hover:scale-105 relative group"
              aria-label="Notifikasi"
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg shadow-red-500/30">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>

                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full animate-ping bg-red-400/30" />
                </>
              )}

              <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Notifikasi
              </span>
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-slate-200/60 py-1 z-40 overflow-hidden">

                {/* HEADER */}

                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Bell
                        size={15}
                        className="text-blue-500"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Notifikasi
                      </p>

                      <p className="text-[10px] text-slate-400">
                        {unreadCount > 0
                          ? `${unreadCount} belum dibaca`
                          : "Semua sudah dibaca"}
                      </p>
                    </div>
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={
                        handleMarkAllAsRead
                      }
                      className="flex items-center gap-1.5 text-[10px] text-blue-600 font-medium hover:text-blue-700 hover:underline"
                    >
                      <CheckCheck size={13} />
                      Tandai semua
                    </button>
                  )}
                </div>

                {/* ISI */}

                <div className="max-h-[360px] overflow-y-auto">
                  {loadingNotif ? (
                    <div className="px-4 py-10 text-center">
                      <Loader2
                        size={25}
                        className="text-blue-500 animate-spin mx-auto mb-2"
                      />

                      <p className="text-xs text-slate-400">
                        Memuat notifikasi...
                      </p>
                    </div>
                  ) : notifError ? (
                    <div className="px-4 py-8 text-center">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-2">
                        <Bell
                          size={18}
                          className="text-red-400"
                        />
                      </div>

                      <p className="text-xs text-red-500 font-medium">
                        Gagal memuat notifikasi
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1 px-4 line-clamp-2">
                        {notifError}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          loadNotifications(
                            true
                          )
                        }
                        className="mt-2 text-[11px] text-blue-600 hover:underline"
                      >
                        Coba lagi
                      </button>
                    </div>
                  ) : notifList.length > 0 ? (
                    notifList
                      .slice(0, 10)
                      .map((notif) => (
                        <button
                          type="button"
                          key={notif.id}
                          onClick={() =>
                            handleNotificationClick(
                              notif
                            )
                          }
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-all duration-150 border-l-4 ${
                            !notif.dibaca
                              ? "border-l-blue-500 bg-blue-50/30"
                              : "border-l-transparent"
                          }`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                !notif.dibaca
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-slate-100 text-slate-400"
                              }`}
                            >
                              <Bell size={14} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className={`text-sm leading-tight ${
                                    !notif.dibaca
                                      ? "font-semibold text-slate-700"
                                      : "font-medium text-slate-600"
                                  }`}
                                >
                                  {notif.judul ||
                                    "Notifikasi"}
                                </p>

                                {!notif.dibaca && (
                                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                                )}
                              </div>

                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                {notif.isi || "-"}
                              </p>

                              <div className="flex items-center gap-2 mt-1.5">
                                {notif.kategori && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                    {notif.kategori}
                                  </span>
                                )}

                                <span className="text-[10px] text-slate-300">
                                  {formatNotificationTime(
                                    notif.dibuatPada
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                  ) : (
                    <div className="px-4 py-10 text-center">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <Bell
                          size={22}
                          className="text-slate-300"
                        />
                      </div>

                      <p className="text-sm font-medium text-slate-500">
                        Tidak ada notifikasi
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        Notifikasi baru akan muncul di sini.
                      </p>
                    </div>
                  )}
                </div>

                {/* FOOTER */}

                <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNotifOpen(false);

                      if (
                        currentPathMap.profile
                      ) {
                        router.push(
                          currentPathMap.profile
                        );
                      }
                    }}
                    className="text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors w-full text-center"
                  >
                    Lihat semua notifikasi →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ====================================================
              PROFILE
          ==================================================== */}

          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setIsProfileOpen(
                  (current) => !current
                )
              }
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
              aria-label="Menu profil"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
                  {user?.avatar ||
                    user?.name?.charAt(0) ||
                    "U"}
                </div>

                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
              </div>

              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-700 leading-tight">
                  {user?.name || "User"}
                </p>

                <p className="text-[10px] text-slate-400 leading-tight">
                  {user?.email || "-"}
                </p>
              </div>

              <ChevronDown
                size={16}
                className={`text-slate-400 transition-all duration-200 group-hover:text-slate-600 ${
                  isProfileOpen
                    ? "rotate-180"
                    : ""
                }`}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200/60 py-1 z-40 overflow-hidden">

                {/* ROLE */}

                <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                  <Crown
                    size={11}
                    className="text-yellow-500"
                  />

                  <span>Role:</span>

                  <span
                    className={`px-2 py-0.5 rounded-full ${roleBadgeColor}`}
                  >
                    {roleLabel}
                  </span>
                </div>

                {/* MENU */}

                <div className="py-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        type="button"
                        key={item.path}
                        onClick={() =>
                          navigateTo(item.path)
                        }
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-all duration-150 group"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center ${item.iconColor} group-hover:scale-110 transition-transform`}
                        >
                          <Icon size={16} />
                        </div>

                        <span>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* LOGOUT */}

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all duration-150 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-400 group-hover:bg-red-100 group-hover:scale-110 transition-all">
                      <LogOut size={16} />
                    </div>

                    <span className="font-medium">
                      Logout
                    </span>
                  </button>
                </div>

                {/* VERSION */}

                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-[10px] text-slate-400 text-center tracking-widest">
                    v2.0.0 • 2026
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}