"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Globe,
  Clock,
  Building2,
  MapPin,
  RefreshCw,
  Save,
  Check,
  Search,
  Plus,
  AlertTriangle,
  AlertCircle,
  Filter,
} from "lucide-react";

import {
  getPengaturan,
  upsertPengaturan,
  getPengaturanGlobalSemua,
  updatePengaturanGlobal,
  getPengaturanPresensiSekolah,
  updatePengaturanPresensiSekolah,
} from "@/services/pengaturan.service";
import { getAuditLogs } from "@/services/auditLog.service";
import { getSemuaSekolahPlatform } from "@/services/platform.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_80%,#000))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeInput = "theme-input theme-text";

const themeLabel = "block text-sm font-medium theme-text mb-1.5";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

function unwrapData(response) {
  if (response && typeof response === "object" && "data" in response) {
    return response.data;
  }
  return response;
}

function formatWaktu(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PengaturanSistemPage() {
  const [activeTab, setActiveTab] = useState("platform");

  // ── Tab 1: Informasi Platform ──────────────────────────────────────────────
  const [loadingPlatform, setLoadingPlatform] = useState(true);
  const [savingPlatform, setSavingPlatform] = useState(false);
  const [platformError, setPlatformError] = useState("");
  const [platformNotice, setPlatformNotice] = useState(null);
  const [reloadPlatformToken, setReloadPlatformToken] = useState(0);

  const [identitas, setIdentitas] = useState({
    namaAplikasi: "SmartSchool",
    emailDukungan: "",
    teleponDukungan: "",
    logoUrl: "",
  });

  const [pendaftaran, setPendaftaran] = useState({
    pendaftaranDibuka: true,
    durasiUjiCobaHari: 30,
  });

  const [pemeliharaan, setPemeliharaan] = useState({
    aktif: false,
    pesan: "",
  });
  const [savingPemeliharaan, setSavingPemeliharaan] = useState(false);
  const [pemeliharaanNotice, setPemeliharaanNotice] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getPengaturanGlobalSemua()
      .then((res) => {
        if (!isMounted) return;
        const payload = unwrapData(res);
        if (payload) {
          if (payload.identitas) {
            setIdentitas({
              namaAplikasi: payload.identitas.namaAplikasi || "SmartSchool",
              emailDukungan: payload.identitas.emailDukungan || "",
              teleponDukungan: payload.identitas.teleponDukungan || "",
              logoUrl: payload.identitas.logoUrl || "",
            });
          }
          if (payload.pendaftaran) {
            setPendaftaran({
              pendaftaranDibuka: Boolean(payload.pendaftaran.pendaftaranDibuka),
              durasiUjiCobaHari: Number(payload.pendaftaran.durasiUjiCobaHari || 30),
            });
          }
          if (payload.pemeliharaan) {
            setPemeliharaan({
              aktif: Boolean(payload.pemeliharaan.aktif),
              pesan: payload.pemeliharaan.pesan || "",
            });
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setPlatformError(err?.message || "Gagal memuat pengaturan platform dari server.");
      })
      .finally(() => {
        if (isMounted) setLoadingPlatform(false);
      });

    return () => {
      isMounted = false;
    };
  }, [reloadPlatformToken]);

  const handleSavePlatform = async () => {
    try {
      setSavingPlatform(true);
      setPlatformNotice(null);

      await updatePengaturanGlobal("identitas", {
        namaAplikasi: identitas.namaAplikasi.trim() || "SmartSchool",
        emailDukungan: identitas.emailDukungan.trim() || null,
        teleponDukungan: identitas.teleponDukungan.trim() || null,
        logoUrl: identitas.logoUrl.trim() || null,
      });

      await updatePengaturanGlobal("pendaftaran", {
        pendaftaranDibuka: Boolean(pendaftaran.pendaftaranDibuka),
        durasiUjiCobaHari: Math.max(1, Math.min(365, Number(pendaftaran.durasiUjiCobaHari) || 30)),
      });

      await updatePengaturanGlobal("pemeliharaan", {
        aktif: Boolean(pemeliharaan.aktif),
        pesan: pemeliharaan.pesan.trim() || null,
      });

      setPlatformNotice({
        type: "success",
        text: "Pengaturan platform (identitas, pendaftaran, dan pemeliharaan) berhasil disimpan.",
      });

      setReloadPlatformToken((v) => v + 1);
    } catch (err) {
      setPlatformNotice({
        type: "error",
        text: err?.message || "Gagal menyimpan pengaturan platform.",
      });
    } finally {
      setSavingPlatform(false);
    }
  };

  const handleSavePemeliharaan = async () => {
    try {
      setSavingPemeliharaan(true);
      setPemeliharaanNotice(null);

      await updatePengaturanGlobal("pemeliharaan", {
        aktif: Boolean(pemeliharaan.aktif),
        pesan: pemeliharaan.pesan ? pemeliharaan.pesan.trim() : null,
      });

      setPemeliharaanNotice({
        type: "success",
        text: "Pengaturan mode pemeliharaan berhasil disimpan.",
      });

      setReloadPlatformToken((v) => v + 1);
    } catch (err) {
      setPemeliharaanNotice({
        type: "error",
        text: err?.message || "Gagal menyimpan mode pemeliharaan.",
      });
    } finally {
      setSavingPemeliharaan(false);
    }
  };

  // ── Tab 2: Pengaturan Sekolah ──────────────────────────────────────────────
  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [schoolError, setSchoolError] = useState("");
  const [settings, setSettings] = useState([]);
  const [draft, setDraft] = useState({});
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [reloadSchoolToken, setReloadSchoolToken] = useState(0);
  const [savingSchool, setSavingSchool] = useState(false);
  const [schoolSaveMessage, setSchoolSaveMessage] = useState(null);
  const [newSetting, setNewSetting] = useState({
    kunci: "",
    nilai: "",
    kelompok: "umum",
    keterangan: "",
  });
  const [creatingSetting, setCreatingSetting] = useState(false);

  // Subbagian: Lokasi & Presensi Sekolah
  const [presensi, setPresensi] = useState({
    lintang: "",
    bujur: "",
    radiusAbsensi: 100,
    metodeAbsensiAktif: ["barcode", "lokasi"],
  });
  const [loadingPresensi, setLoadingPresensi] = useState(false);
  const [savingPresensi, setSavingPresensi] = useState(false);
  const [presensiNotice, setPresensiNotice] = useState(null);
  const [reloadPresensiToken, setReloadPresensiToken] = useState(0);

  // Muat daftar sekolah untuk tab sekolah dan dropdown audit log
  useEffect(() => {
    let isMounted = true;
    getSemuaSekolahPlatform()
      .then((daftarSekolah) => {
        if (!isMounted) return;
        const items = daftarSekolah.map((item) => ({
          id: item.id,
          nama: item.nama,
        }));
        setSchools(items);
        setSelectedSchoolId((prev) => (prev ? prev : items[0]?.id || ""));
      })
      .catch((err) => {
        if (!isMounted) return;
        setSchoolError(err?.message || "Gagal memuat daftar sekolah.");
      })
      .finally(() => {
        if (isMounted) setLoadingSchools(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Muat pengaturan key-value per sekolah
  useEffect(() => {
    if (activeTab !== "sekolah" || !selectedSchoolId) return;
    let isMounted = true;
    getPengaturan({ sekolahId: selectedSchoolId })
      .then((response) => {
        if (!isMounted) return;
        const payload = unwrapData(response);
        const list = Array.isArray(payload) ? payload : [];
        setSettings(list);
        setDraft(
          Object.fromEntries(
            list.map((item) => [item.id, String(item.nilai ?? "")])
          )
        );
      })
      .catch((err) => {
        if (!isMounted) return;
        setSettings([]);
        setDraft({});
        setSettingsError(err?.message || "Gagal memuat pengaturan sekolah.");
      })
      .finally(() => {
        if (isMounted) setLoadingSettings(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedSchoolId, reloadSchoolToken]);

  // Muat pengaturan presensi & koordinat GPS per sekolah
  useEffect(() => {
    if (activeTab !== "sekolah" || !selectedSchoolId) return;
    let isMounted = true;
    getPengaturanPresensiSekolah(selectedSchoolId)
      .then((res) => {
        if (!isMounted) return;
        const payload = unwrapData(res);
        if (payload) {
          setPresensi({
            lintang: payload.lintang !== null && payload.lintang !== undefined ? String(payload.lintang) : "",
            bujur: payload.bujur !== null && payload.bujur !== undefined ? String(payload.bujur) : "",
            radiusAbsensi: payload.radiusAbsensi !== null && payload.radiusAbsensi !== undefined ? Number(payload.radiusAbsensi) : 100,
            metodeAbsensiAktif: Array.isArray(payload.metodeAbsensiAktif) && payload.metodeAbsensiAktif.length > 0
              ? payload.metodeAbsensiAktif
              : ["barcode", "lokasi"],
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setPresensiNotice({
          type: "error",
          text: err?.message || "Gagal memuat konfigurasi presensi sekolah.",
        });
      })
      .finally(() => {
        if (isMounted) setLoadingPresensi(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, selectedSchoolId, reloadPresensiToken]);

  const isInternalAcademicKey = (kunci) => {
    if (!kunci) return false;
    return (
      kunci === "hari_aktif_presensi" ||
      kunci === "kkm_mapel" ||
      kunci.startsWith("agregat_rapor:") ||
      kunci.startsWith("agregat_rapor_")
    );
  };

  const visibleSettings = settings.filter(
    (item) => !isInternalAcademicKey(item.kunci)
  );

  const changedSchoolSettings = visibleSettings.filter(
    (item) => String(item.nilai ?? "") !== String(draft[item.id] ?? "")
  );

  const handleSaveSchoolSettings = async () => {
    if (!selectedSchoolId || changedSchoolSettings.length === 0) return;
    try {
      setSavingSchool(true);
      setSchoolSaveMessage(null);
      for (const item of changedSchoolSettings) {
        await upsertPengaturan({
          sekolahId: selectedSchoolId,
          kunci: item.kunci,
          nilai: draft[item.id],
          kelompok: item.kelompok || "umum",
        });
      }
      setSchoolSaveMessage({
        type: "success",
        text: `${changedSchoolSettings.length} pengaturan sekolah berhasil disimpan.`,
      });
      setReloadSchoolToken((v) => v + 1);
    } catch (err) {
      setSchoolSaveMessage({
        type: "error",
        text: err?.message || "Gagal menyimpan pengaturan sekolah.",
      });
    } finally {
      setSavingSchool(false);
    }
  };

  const handleCreateSchoolSetting = async (e) => {
    e.preventDefault();
    if (!selectedSchoolId || !newSetting.kunci.trim()) return;
    try {
      setCreatingSetting(true);
      setSchoolSaveMessage(null);
      await upsertPengaturan({
        sekolahId: selectedSchoolId,
        kunci: newSetting.kunci.trim(),
        nilai: newSetting.nilai,
        kelompok: newSetting.kelompok || "umum",
        keterangan: newSetting.keterangan || undefined,
      });
      setNewSetting({
        kunci: "",
        nilai: "",
        kelompok: "umum",
        keterangan: "",
      });
      setSchoolSaveMessage({
        type: "success",
        text: "Pengaturan baru sekolah berhasil ditambahkan.",
      });
      setReloadSchoolToken((v) => v + 1);
    } catch (err) {
      setSchoolSaveMessage({
        type: "error",
        text: err?.message || "Gagal menambahkan pengaturan sekolah.",
      });
    } finally {
      setCreatingSetting(false);
    }
  };

  const handleToggleMetodePresensi = (metode) => {
    setPresensi((prev) => {
      const aktif = prev.metodeAbsensiAktif.includes(metode);
      if (aktif) {
        if (prev.metodeAbsensiAktif.length <= 1) {
          return prev; // minimal 1 metode wajib aktif sesuai Zod schema
        }
        return {
          ...prev,
          metodeAbsensiAktif: prev.metodeAbsensiAktif.filter((m) => m !== metode),
        };
      }
      return {
        ...prev,
        metodeAbsensiAktif: [...prev.metodeAbsensiAktif, metode],
      };
    });
  };

  const handleSavePresensi = async (e) => {
    e.preventDefault();
    if (!selectedSchoolId) return;

    if (presensi.metodeAbsensiAktif.length === 0) {
      setPresensiNotice({
        type: "error",
        text: "Minimal harus ada 1 metode absensi yang aktif.",
      });
      return;
    }

    try {
      setSavingPresensi(true);
      setPresensiNotice(null);

      const payload = {
        radiusAbsensi: Math.max(1, Math.min(100000, Number(presensi.radiusAbsensi) || 100)),
        metodeAbsensiAktif: presensi.metodeAbsensiAktif,
      };

      if (presensi.lintang !== "" && !Number.isNaN(Number(presensi.lintang))) {
        payload.lintang = Number(presensi.lintang);
      }
      if (presensi.bujur !== "" && !Number.isNaN(Number(presensi.bujur))) {
        payload.bujur = Number(presensi.bujur);
      }

      await updatePengaturanPresensiSekolah(payload, selectedSchoolId);

      setPresensiNotice({
        type: "success",
        text: "Pengaturan lokasi & presensi sekolah berhasil disimpan.",
      });
      setReloadPresensiToken((v) => v + 1);
    } catch (err) {
      setPresensiNotice({
        type: "error",
        text: err?.message || "Gagal menyimpan pengaturan presensi sekolah.",
      });
    } finally {
      setSavingPresensi(false);
    }
  };

  // ── Tab 3: Riwayat Aktivitas ───────────────────────────────────────────────
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [filterSekolahId, setFilterSekolahId] = useState("");
  const [logPage, setLogPage] = useState(1);
  const [logMeta, setLogMeta] = useState({ total: 0, totalPages: 1 });
  const [reloadLogToken, setReloadLogToken] = useState(0);

  useEffect(() => {
    if (activeTab !== "aktivitas") return;
    let isMounted = true;
    getAuditLogs({
      page: logPage,
      limit: 15,
      search: activeSearch,
      sekolahId: filterSekolahId,
    })
      .then((res) => {
        if (!isMounted) return;
        const items = unwrapData(res);
        setLogs(Array.isArray(items) ? items : []);
        if (res?.meta) {
          setLogMeta({
            total: res.meta.totalData || res.meta.total || (Array.isArray(items) ? items.length : 0),
            totalPages: res.meta.totalPages || 1,
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setLogs([]);
        setLogsError(err?.message || "Gagal memuat riwayat aktivitas.");
      })
      .finally(() => {
        if (isMounted) setLogsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, logPage, activeSearch, filterSekolahId, reloadLogToken]);

  const handleSearchLog = (e) => {
    e.preventDefault();
    setLogsLoading(true);
    setLogPage(1);
    setActiveSearch(searchInput.trim());
  };

  const handleFilterSekolahChange = (e) => {
    setLogsLoading(true);
    setLogPage(1);
    setFilterSekolahId(e.target.value);
  };

  const handleRefreshLogs = () => {
    setLogsLoading(true);
    setReloadLogToken((v) => v + 1);
  };

  const tabs = [
    {
      key: "platform",
      label: "Informasi Platform",
      icon: Globe,
    },
    {
      key: "sekolah",
      label: "Pengaturan Sekolah",
      icon: Building2,
    },
    {
      key: "aktivitas",
      label: "Riwayat Aktivitas",
      icon: Clock,
    },
  ];

  return (
    <div className="theme-page theme-text min-h-full w-full min-w-0">
      {/* Perubahan: max-w-[1500px] dan mx-auto dihapus agar konten selalu menempel ke sidebar */}
      <div className="w-full min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-5 sm:space-y-6">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border flex items-center justify-center`}
              >
                <Settings size={19} className={themePrimaryText} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold theme-text">
                Pengaturan Sistem
              </h1>
            </div>
            <p className="text-sm theme-text-secondary mt-1">
              Kelola konfigurasi platform global, pengaturan sekolah, geofencing presensi, serta audit log sistem.
            </p>
          </div>

          {activeTab === "platform" && (
            <button
              type="button"
              onClick={handleSavePlatform}
              disabled={savingPlatform || loadingPlatform}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg ${themePrimaryGradient} text-white text-sm font-medium transition ${themePrimaryShadow} hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {savingPlatform ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Simpan Pengaturan Platform
                </>
              )}
            </button>
          )}

          {activeTab === "sekolah" && (
            <button
              type="button"
              onClick={handleSaveSchoolSettings}
              disabled={
                savingSchool ||
                !selectedSchoolId ||
                changedSchoolSettings.length === 0
              }
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg ${themePrimaryGradient} text-white text-sm font-medium transition ${themePrimaryShadow} hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {savingSchool ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Simpan Pengaturan Kunci
                  {changedSchoolSettings.length > 0
                    ? ` (${changedSchoolSettings.length})`
                    : ""}
                </>
              )}
            </button>
          )}
        </div>

        {/* ── Global Notification ─────────────────────────────────────────── */}
        {platformNotice && activeTab === "platform" && (
          <div
            className={`flex items-center gap-3 p-3.5 rounded-xl border ${
              platformNotice.type === "success"
                ? `${themeSuccessSurface} ${themeSuccessBorder}`
                : `${themeWarningSurface} ${themeWarningBorder}`
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg ${
                platformNotice.type === "success"
                  ? themeSuccessSurface
                  : themeWarningSurface
              } flex items-center justify-center shrink-0`}
            >
              {platformNotice.type === "success" ? (
                <Check size={18} className="text-[var(--color-success)]" />
              ) : (
                <AlertTriangle
                  size={18}
                  className="text-[var(--color-warning)]"
                />
              )}
            </div>
            <p
              className={`text-sm font-semibold ${
                platformNotice.type === "success"
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-warning)]"
              }`}
            >
              {platformNotice.text}
            </p>
          </div>
        )}

        {/* ── Main Tab Shell ──────────────────────────────────────────────── */}
        <div
          className={`theme-card theme-border rounded-xl border ${themeCardShadow} overflow-hidden`}
        >
          {/* Tabs Navigation */}
          <div className={`border-b ${themeDivider} overflow-x-auto`}>
            <div className="flex min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                      isActive
                        ? `${themePrimaryText} border-[var(--color-primary)] ${themePrimarySoft}`
                        : `theme-text-secondary border-transparent ${themeNeutralHover}`
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* ══════════════════════════════════════════════════════════════════
                TAB 1: INFORMASI PLATFORM
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === "platform" && (
              <div className="space-y-6">
                {loadingPlatform ? (
                  <div className="space-y-4 py-8">
                    <div className="flex items-center justify-center gap-3 theme-text-secondary">
                      <RefreshCw size={20} className="animate-spin text-[var(--color-primary)]" />
                      <span className="text-sm">Memuat konfigurasi platform...</span>
                    </div>
                  </div>
                ) : platformError ? (
                  <div className={`rounded-xl border ${themeWarningBorder} ${themeWarningSurface} p-4`}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={18} className="text-[var(--color-warning)]" />
                      <p className="text-sm font-semibold text-[var(--color-warning)]">
                        Gagal Memuat Pengaturan Platform
                      </p>
                    </div>
                    <p className="mt-1 text-xs theme-text-secondary">{platformError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        setLoadingPlatform(true);
                        setReloadPlatformToken((v) => v + 1);
                      }}
                      className="mt-3 text-xs font-medium px-3 py-1.5 rounded-lg border theme-border theme-text-secondary hover:theme-text"
                    >
                      Coba Lagi
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Identitas Platform */}
                    <div className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-5 space-y-4`}>
                      <div className="border-b pb-3 theme-border">
                        <h3 className="text-base font-semibold theme-text flex items-center gap-2">
                          <Globe size={18} className={themePrimaryText} />
                          Identitas & Informasi Platform
                        </h3>
                        <p className="text-xs theme-text-secondary mt-0.5">
                          Konfigurasi nama aplikasi, kontak layanan, dan URL logo platform.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={themeLabel}>
                            Nama Aplikasi <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={identitas.namaAplikasi}
                            onChange={(e) =>
                              setIdentitas((prev) => ({ ...prev, namaAplikasi: e.target.value }))
                            }
                            placeholder="SmartSchool"
                            className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition`}
                          />
                        </div>

                        <div>
                          <label className={themeLabel}>Email Dukungan / Support</label>
                          <input
                            type="email"
                            value={identitas.emailDukungan}
                            onChange={(e) =>
                              setIdentitas((prev) => ({ ...prev, emailDukungan: e.target.value }))
                            }
                            placeholder="support@smartschool.id"
                            className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition`}
                          />
                        </div>

                        <div>
                          <label className={themeLabel}>Nomor Telepon Dukungan</label>
                          <input
                            type="tel"
                            value={identitas.teleponDukungan}
                            onChange={(e) =>
                              setIdentitas((prev) => ({ ...prev, teleponDukungan: e.target.value }))
                            }
                            placeholder="+62 812-3456-7890"
                            className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition`}
                          />
                        </div>

                        <div>
                          <label className={themeLabel}>URL Logo Platform</label>
                          <input
                            type="url"
                            value={identitas.logoUrl}
                            onChange={(e) =>
                              setIdentitas((prev) => ({ ...prev, logoUrl: e.target.value }))
                            }
                            placeholder="https://example.com/logo.png"
                            className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pengaturan Pendaftaran */}
                    <div className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-5 space-y-4`}>
                      <div className="border-b pb-3 theme-border">
                        <h3 className="text-base font-semibold theme-text flex items-center gap-2">
                          <Plus size={18} className={themePrimaryText} />
                          Pengaturan Pendaftaran Tenant
                        </h3>
                        <p className="text-xs theme-text-secondary mt-0.5">
                          Kontrol pembukaan pendaftaran sekolah mandiri dan durasi masa uji coba.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                        <div className="flex items-center justify-between p-3.5 rounded-lg border theme-border bg-[var(--color-card)]">
                          <div>
                            <p className="text-sm font-medium theme-text">Buka Pendaftaran Sekolah</p>
                            <p className="text-xs theme-text-secondary mt-0.5">
                              Izinkan pendaftaran mandiri melalui portal publik daftar sekolah.
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={pendaftaran.pendaftaranDibuka}
                            onChange={(e) =>
                              setPendaftaran((prev) => ({
                                ...prev,
                                pendaftaranDibuka: e.target.checked,
                              }))
                            }
                            className="h-5 w-5 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
                          />
                        </div>

                        <div>
                          <label className={themeLabel}>
                            Durasi Masa Uji Coba (Hari) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            required
                            value={pendaftaran.durasiUjiCobaHari}
                            onChange={(e) =>
                              setPendaftaran((prev) => ({
                                ...prev,
                                durasiUjiCobaHari: Number(e.target.value) || 1,
                              }))
                            }
                            className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition`}
                          />
                          <p className="text-xs theme-text-muted mt-1">
                            Masa trial default untuk pendaftaran tenant baru (rentang 1 - 365 hari).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Mode Pemeliharaan */}
                    <div className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-5 space-y-4`}>
                      <div className="border-b pb-3 theme-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="text-base font-semibold theme-text flex items-center gap-2">
                            <AlertCircle size={18} className="text-[var(--color-warning)]" />
                            Mode Pemeliharaan (Maintenance Mode)
                          </h3>
                          <p className="text-xs theme-text-secondary mt-0.5">
                            Kelola status operasional platform serta pengumuman pemeliharaan bagi pengguna.
                          </p>
                        </div>
                        {/* Status Badge Aktif / Nonaktif */}
                        <div>
                          {pemeliharaan.aktif ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                              Status: AKTIF (Platform dalam Pemeliharaan)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Status: NONAKTIF (Sistem Beroperasi Normal)
                            </span>
                          )}
                        </div>
                      </div>

                      {pemeliharaanNotice && (
                        <div
                          className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-medium ${
                            pemeliharaanNotice.type === "success"
                              ? `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`
                              : `${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)]`
                          }`}
                        >
                          {pemeliharaanNotice.type === "success" ? (
                            <Check size={15} />
                          ) : (
                            <AlertTriangle size={15} />
                          )}
                          <span>{pemeliharaanNotice.text}</span>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-lg border theme-border bg-[var(--color-card)]">
                          <div>
                            <p className="text-sm font-semibold theme-text">
                              {pemeliharaan.aktif ? "Nonaktifkan Mode Pemeliharaan" : "Aktifkan Mode Pemeliharaan"}
                            </p>
                            <p className="text-xs theme-text-secondary mt-0.5">
                              {pemeliharaan.aktif
                                ? "Platform sedang dibatasi. Matikan untuk mengizinkan akses normal ke seluruh modul."
                                : "Jika diaktifkan, portal publik dan pengguna non-admin akan menerima pesan pemeliharaan."}
                            </p>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={pemeliharaan.aktif}
                            onClick={() =>
                              setPemeliharaan((prev) => ({
                                ...prev,
                                aktif: !prev.aktif,
                              }))
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 ${
                              pemeliharaan.aktif ? "bg-[var(--color-warning)]" : "bg-gray-300 dark:bg-gray-700"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                pemeliharaan.aktif ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-medium theme-text">Pesan Pemeliharaan</label>
                            <span className="text-[11px] theme-text-muted">
                              {pemeliharaan.pesan ? pemeliharaan.pesan.length : 0} / 500 karakter
                            </span>
                          </div>
                          <textarea
                            rows={3}
                            maxLength={500}
                            value={pemeliharaan.pesan}
                            onChange={(e) =>
                              setPemeliharaan((prev) => ({ ...prev, pesan: e.target.value }))
                            }
                            placeholder="Sistem sedang dalam peningkatan performa rutin. Silakan kembali beberapa saat lagi."
                            className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition resize-none`}
                          />
                          <p className="text-xs theme-text-muted mt-1">
                            Pesan yang ditampilkan kepada pengunjung selama sistem dalam perbaikan.
                          </p>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleSavePemeliharaan}
                            disabled={savingPemeliharaan}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${themePrimaryGradient} text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed`}
                          >
                            {savingPemeliharaan ? (
                              <RefreshCw size={15} className="animate-spin" />
                            ) : (
                              <Save size={15} />
                            )}
                            {savingPemeliharaan ? "Menyimpan Status..." : "Simpan Status Pemeliharaan"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 2: PENGATURAN SEKOLAH
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === "sekolah" && (
              <div className="space-y-6">
                {schoolSaveMessage && (
                  <div
                    className={`flex items-center gap-3 p-3.5 rounded-xl border ${
                      schoolSaveMessage.type === "success"
                        ? `${themeSuccessSurface} ${themeSuccessBorder}`
                        : `${themeWarningSurface} ${themeWarningBorder}`
                    }`}
                  >
                    <p
                      className={`text-sm font-semibold ${
                        schoolSaveMessage.type === "success"
                          ? "text-[var(--color-success)]"
                          : "text-[var(--color-warning)]"
                      }`}
                    >
                      {schoolSaveMessage.text}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-end gap-4 p-4 rounded-xl border theme-border bg-[var(--color-card)]">
                  <div className="w-full sm:max-w-md">
                    <label className={themeLabel}>
                      Pilih Sekolah Tenant <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedSchoolId}
                      onChange={(e) => setSelectedSchoolId(e.target.value)}
                      disabled={loadingSchools || schools.length === 0}
                      className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition disabled:opacity-60`}
                    >
                      {schools.length === 0 ? (
                        <option value="">Tidak ada sekolah tersedia</option>
                      ) : (
                        schools.map((school) => (
                          <option key={school.id} value={school.id}>
                            {school.nama}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  {selectedSchoolId && (
                    <p className="text-xs theme-text-muted pb-2">
                      ID Institusi: <span className="font-mono">{selectedSchoolId}</span>
                    </p>
                  )}
                </div>

                {loadingSchools && (
                  <p className="text-sm theme-text-secondary">Memuat daftar sekolah...</p>
                )}

                {!loadingSchools && schoolError && (
                  <div className={`rounded-lg border ${themeWarningBorder} ${themeWarningSurface} p-3`}>
                    <p className="text-sm text-[var(--color-warning)]">{schoolError}</p>
                  </div>
                )}

                {selectedSchoolId && (
                  <>
                    {/* ── Subbagian 1: Lokasi & Presensi Sekolah ─────────────── */}
                    <div className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-5 space-y-4`}>
                      <div className="border-b pb-3 theme-border">
                        <h3 className="text-base font-semibold theme-text flex items-center gap-2">
                          <MapPin size={18} className={themePrimaryText} />
                          Lokasi & Geofencing Presensi Sekolah
                        </h3>
                        <p className="text-xs theme-text-secondary mt-0.5">
                          Atur koordinat GPS, radius geofence, dan metode absensi (barcode, lokasi, face) untuk institusi ini.
                        </p>
                      </div>

                      {presensiNotice && (
                        <div
                          className={`flex items-center gap-2 p-3 rounded-lg border text-xs font-medium ${
                            presensiNotice.type === "success"
                              ? `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`
                              : `${themeWarningSurface} ${themeWarningBorder} text-[var(--color-warning)]`
                          }`}
                        >
                          {presensiNotice.type === "success" ? (
                            <Check size={15} />
                          ) : (
                            <AlertTriangle size={15} />
                          )}
                          <span>{presensiNotice.text}</span>
                        </div>
                      )}

                      {loadingPresensi ? (
                        <div className="py-4 text-center text-xs theme-text-secondary">
                          <RefreshCw size={16} className="animate-spin inline mr-2 text-[var(--color-primary)]" />
                          Memuat pengaturan presensi sekolah...
                        </div>
                      ) : (
                        <form onSubmit={handleSavePresensi} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className={themeLabel}>Lintang (Latitude)</label>
                              <input
                                type="number"
                                step="any"
                                min="-90"
                                max="90"
                                value={presensi.lintang}
                                onChange={(e) =>
                                  setPresensi((prev) => ({ ...prev, lintang: e.target.value }))
                                }
                                placeholder="contoh: -6.200000"
                                className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition`}
                              />
                              <p className="text-[11px] theme-text-muted mt-1">Rentang: -90 sampai 90</p>
                            </div>

                            <div>
                              <label className={themeLabel}>Bujur (Longitude)</label>
                              <input
                                type="number"
                                step="any"
                                min="-180"
                                max="180"
                                value={presensi.bujur}
                                onChange={(e) =>
                                  setPresensi((prev) => ({ ...prev, bujur: e.target.value }))
                                }
                                placeholder="contoh: 106.816666"
                                className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition`}
                              />
                              <p className="text-[11px] theme-text-muted mt-1">Rentang: -180 sampai 180</p>
                            </div>

                            <div>
                              <label className={themeLabel}>
                                Radius Absensi (Meter) <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="100000"
                                required
                                value={presensi.radiusAbsensi}
                                onChange={(e) =>
                                  setPresensi((prev) => ({
                                    ...prev,
                                    radiusAbsensi: Number(e.target.value) || 1,
                                  }))
                                }
                                placeholder="100"
                                className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition`}
                              />
                              <p className="text-[11px] theme-text-muted mt-1">Radius geofence presensi (1 - 100.000 meter)</p>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2">
                            <label className={themeLabel}>
                              Metode Absensi yang Diizinkan <span className="text-rose-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {[
                                { key: "barcode", label: "Barcode / QR Code", desc: "Scan barcode presensi kelas" },
                                { key: "lokasi", label: "Geolokasi GPS", desc: "Validasi titik koordinat sekolah" },
                                { key: "face", label: "Face Recognition", desc: "Deteksi wajah perangkat kamera" },
                              ].map((item) => {
                                const isChecked = presensi.metodeAbsensiAktif.includes(item.key);
                                return (
                                  <label
                                    key={item.key}
                                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                                      isChecked
                                        ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_6%,transparent)]"
                                        : "theme-border bg-[var(--color-card)] opacity-70"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleMetodePresensi(item.key)}
                                      className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                    />
                                    <div>
                                      <p className="text-sm font-medium theme-text">{item.label}</p>
                                      <p className="text-[11px] theme-text-secondary">{item.desc}</p>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            <button
                              type="submit"
                              disabled={savingPresensi || !selectedSchoolId}
                              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${themePrimaryGradient} text-white transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed`}
                            >
                              {savingPresensi ? (
                                <RefreshCw size={15} className="animate-spin" />
                              ) : (
                                <Save size={15} />
                              )}
                              {savingPresensi ? "Menyimpan Presensi..." : "Simpan Lokasi & Presensi"}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* ── Subbagian 2: Kunci Konfigurasi Spesifik Sekolah ──────── */}
                    <div className="space-y-4 pt-2">
                      <div className="border-b pb-2 theme-border">
                        <h3 className="text-base font-semibold theme-text flex items-center gap-2">
                          <Building2 size={18} className={themePrimaryText} />
                          Kunci Konfigurasi Sekolah
                        </h3>
                        <p className="text-xs theme-text-secondary mt-0.5">
                          Pengaturan kunci konfigurasi khusus untuk institusi sekolah ini.
                        </p>
                      </div>

                      {loadingSettings ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((item) => (
                            <div
                              key={item}
                              className="h-16 rounded-lg animate-pulse"
                              style={{
                                background:
                                  "color-mix(in srgb, var(--color-text) 6%, transparent)",
                              }}
                            />
                          ))}
                        </div>
                      ) : settingsError ? (
                        <div className={`rounded-lg border ${themeWarningBorder} ${themeWarningSurface} p-3`}>
                          <p className="text-sm text-[var(--color-warning)]">{settingsError}</p>
                        </div>
                      ) : visibleSettings.length === 0 ? (
                        <div className={`rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-6 text-center`}>
                          <Building2 size={28} className="mx-auto text-[var(--color-text-muted)]" />
                          <p className="mt-2 text-sm font-medium theme-text-secondary">
                            Belum ada konfigurasi khusus untuk sekolah ini
                          </p>
                          <p className="mt-1 text-xs theme-text-muted">
                            Tambahkan pengaturan menggunakan formulir di bawah.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {visibleSettings.map((item) => (
                            <div
                              key={item.id}
                              className={`rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-3.5`}
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                  <p className="font-mono text-sm font-medium theme-text break-all">
                                    {item.kunci}
                                  </p>
                                  <p className="text-xs theme-text-muted mt-0.5">
                                    {item.keterangan || `Kelompok: ${item.kelompok || "umum"}`}
                                  </p>
                                </div>
                                <div className="w-full sm:max-w-md">
                                  <input
                                    type="text"
                                    value={draft[item.id] ?? ""}
                                    onChange={(e) =>
                                      setDraft((prev) => ({
                                        ...prev,
                                        [item.id]: e.target.value,
                                      }))
                                    }
                                    className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition`}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Form Tambah Pengaturan Sekolah */}
                      <form
                        onSubmit={handleCreateSchoolSetting}
                        className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4 space-y-4`}
                      >
                        <div className="flex items-center gap-2">
                          <Plus size={16} className={themePrimaryText} />
                          <h4 className="text-sm font-semibold theme-text">
                            Tambah / Timpa Pasangan Kunci Konfigurasi
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className={themeLabel}>Kunci</label>
                            <input
                              type="text"
                              required
                              value={newSetting.kunci}
                              onChange={(e) =>
                                setNewSetting((prev) => ({
                                  ...prev,
                                  kunci: e.target.value,
                                }))
                              }
                              placeholder="contoh: format_nomor_surat"
                              className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition`}
                            />
                          </div>

                          <div>
                            <label className={themeLabel}>Kelompok</label>
                            <input
                              type="text"
                              value={newSetting.kelompok}
                              onChange={(e) =>
                                setNewSetting((prev) => ({
                                  ...prev,
                                  kelompok: e.target.value,
                                }))
                              }
                              placeholder="umum"
                              className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition`}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className={themeLabel}>Nilai</label>
                            <input
                              type="text"
                              value={newSetting.nilai}
                              onChange={(e) =>
                                setNewSetting((prev) => ({
                                  ...prev,
                                  nilai: e.target.value,
                                }))
                              }
                              className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition`}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className={themeLabel}>Keterangan</label>
                            <input
                              type="text"
                              value={newSetting.keterangan}
                              onChange={(e) =>
                                setNewSetting((prev) => ({
                                  ...prev,
                                  keterangan: e.target.value,
                                }))
                              }
                              className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition`}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={creatingSetting || !newSetting.kunci.trim()}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${themePrimarySoft} ${themePrimaryText} border ${themePrimarySoftBorder} transition hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed`}
                          >
                            {creatingSetting ? (
                              <RefreshCw size={15} className="animate-spin" />
                            ) : (
                              <Plus size={15} />
                            )}
                            {creatingSetting ? "Menyimpan..." : "Tambah Pengaturan Kunci"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ══════════════════════════════════════════════════════════════════
                TAB 3: RIWAYAT AKTIVITAS
            ══════════════════════════════════════════════════════════════════ */}
            {activeTab === "aktivitas" && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                    {/* Search Bar */}
                    <form onSubmit={handleSearchLog} className="relative flex-1 max-w-sm">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                      />
                      <input
                        type="text"
                        placeholder="Cari aksi, modul, pengguna..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} placeholder:text-[var(--color-text-placeholder)]`}
                      />
                    </form>

                    {/* Filter Sekolah Dropdown */}
                    <div className="flex items-center gap-2">
                      <Filter size={15} className="theme-text-muted shrink-0 hidden sm:block" />
                      <select
                        value={filterSekolahId}
                        onChange={handleFilterSekolahChange}
                        className={`px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition min-w-[190px]`}
                      >
                        <option value="">Semua Sekolah (Platform)</option>
                        {schools.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nama}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-xs theme-text-secondary">
                      Total: {logMeta.total} entri
                    </span>
                    <button
                      type="button"
                      onClick={handleRefreshLogs}
                      disabled={logsLoading}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border theme-border theme-text-secondary hover:theme-text transition disabled:opacity-60`}
                    >
                      <RefreshCw size={14} className={logsLoading ? "animate-spin" : ""} />
                      Muat Ulang
                    </button>
                  </div>
                </div>

                {logsError && (
                  <div className={`rounded-lg border ${themeWarningBorder} ${themeWarningSurface} p-3`}>
                    <p className="text-sm text-[var(--color-warning)]">{logsError}</p>
                  </div>
                )}

                <div className={`overflow-x-auto rounded-lg border ${themeNeutralBorder}`}>
                  <table className="w-full min-w-[750px] text-sm">
                    <thead>
                      <tr className={`${themeNeutralSurface} border-b ${themeDivider}`}>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider">
                          Pengguna
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider">
                          Aksi
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider hidden sm:table-cell">
                          Modul
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider hidden sm:table-cell">
                          Waktu
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold theme-text-secondary uppercase tracking-wider hidden md:table-cell">
                          Alamat IP
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {logsLoading ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center theme-text-muted">
                            <div className="flex items-center justify-center gap-2">
                              <RefreshCw size={16} className="animate-spin text-[var(--color-primary)]" />
                              <span>Memuat audit log dari server...</span>
                            </div>
                          </td>
                        </tr>
                      ) : logs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center theme-text-muted">
                            Tidak ada aktivitas ditemukan pada kriteria log sistem saat ini.
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => (
                          <tr
                            key={log.id}
                            className={`border-b last:border-b-0 ${themeDivider} ${themeNeutralHover} transition-colors`}
                          >
                            <td className="px-4 py-2.5 font-medium theme-text">
                              <div>
                                <p className="text-sm">{log?.pengguna?.namaLengkap || "Sistem"}</p>
                                {log?.pengguna?.peran?.nama && (
                                  <span className="text-[11px] theme-text-muted">
                                    {log.pengguna.peran.nama}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2.5 theme-text">
                              <span className="inline-block px-2 py-0.5 rounded text-xs font-mono font-medium bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]">
                                {log.aksi || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 theme-text-secondary hidden sm:table-cell">
                              {log.modul || "-"}
                            </td>
                            <td className="px-4 py-2.5 theme-text-secondary hidden sm:table-cell">
                              {formatWaktu(log.waktu)}
                            </td>
                            <td className="px-4 py-2.5 theme-text-muted font-mono text-xs hidden md:table-cell">
                              {log.ipAddress || log.ip || "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {logMeta.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs theme-text-secondary">
                      Halaman {logPage} dari {logMeta.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLogsLoading(true);
                          setLogPage((p) => Math.max(1, p - 1));
                        }}
                        disabled={logPage <= 1 || logsLoading}
                        className="px-3 py-1.5 text-xs rounded border theme-border theme-text-secondary disabled:opacity-40"
                      >
                        Sebelumnya
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLogsLoading(true);
                          setLogPage((p) => Math.min(logMeta.totalPages, p + 1));
                        }}
                        disabled={logPage >= logMeta.totalPages || logsLoading}
                        className="px-3 py-1.5 text-xs rounded border theme-border theme-text-secondary disabled:opacity-40"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className={`text-center text-xs theme-text-muted py-3 border-t ${themeDivider}`}>
          © 2026 SmartSchool Platform • Super Admin Panel
        </div>
      </div>
    </div>
  );
}