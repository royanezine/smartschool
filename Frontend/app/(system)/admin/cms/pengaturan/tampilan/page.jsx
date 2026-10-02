"use client";

import { useEffect, useState } from "react";
import {
  Save,
  Palette,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Paintbrush,
} from "lucide-react";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ============================================================
   DEFAULT TEMA
============================================================ */

const DEFAULT_TEMA = {
  tema: {
    primary: "#2563EB",
    secondary: "#64748B",
    accent: "#F59E0B",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    text: "#0F172A",
    border: "#E2E8F0",
  },

  badgeStatus: {
    aktif: "#16A34A",
    nonaktif: "#6B7280",
    menunggu: "#F59E0B",
    disetujui: "#16A34A",
    ditolak: "#DC2626",
    hadir: "#16A34A",
    izin: "#2563EB",
    sakit: "#F59E0B",
    alpa: "#DC2626",
    terlambat: "#EA580C",
  },

  labelRole: {
    super_admin: "#7C3AED",
    admin_yayasan: "#4F46E5",
    admin_sekolah: "#2563EB",
    guru: "#0D9488",
    siswa: "#0EA5E9",
  },

  shiftKerja: {
    pagi: "#F59E0B",
    siang: "#6366F1",
  },
};

/* ============================================================
   LABEL
============================================================ */

const GROUP_LABELS = {
  tema: {
    title: "Tema Utama",
    description:
      "Warna utama yang digunakan pada tampilan dan komponen sistem.",
    icon: Palette,
  },

  badgeStatus: {
    title: "Badge Status",
    description:
      "Warna yang digunakan untuk menunjukkan status pada berbagai modul.",
    icon: CheckCircle2,
  },

  labelRole: {
    title: "Label Role",
    description:
      "Warna label berdasarkan role pengguna dalam sistem.",
    icon: Paintbrush,
  },

  shiftKerja: {
    title: "Shift Kerja",
    description:
      "Warna yang digunakan untuk membedakan shift kerja.",
    icon: Sparkles,
  },
};

const LABELS = {
  primary: "Primary",
  secondary: "Secondary",
  accent: "Accent",
  background: "Background",
  surface: "Surface",
  text: "Text",
  border: "Border",

  aktif: "Aktif",
  nonaktif: "Nonaktif",
  menunggu: "Menunggu",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
  hadir: "Hadir",
  izin: "Izin",
  sakit: "Sakit",
  alpa: "Alpa",
  terlambat: "Terlambat",

  super_admin: "Super Admin",
  admin_yayasan: "Admin Yayasan",
  admin_sekolah: "Admin Sekolah",
  guru: "Guru",
  siswa: "Siswa",

  pagi: "Pagi",
  siang: "Siang",
};

/* ============================================================
   HELPER
============================================================ */

function cloneDefaultTema() {
  return JSON.parse(JSON.stringify(DEFAULT_TEMA));
}

function extractHex(value, fallback = "#000000") {
  if (!value) return fallback;

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value.hex) {
    return value.hex;
  }

  return fallback;
}

function normalizeHex(value) {
  if (!value) return "#000000";

  let hex = String(value).replace("#", "").toUpperCase();

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  return `#${hex}`;
}

function isValidHex(value) {
  return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(value);
}

function getContrastColor(hex) {
  if (!isValidHex(hex)) {
    return "#0F172A";
  }

  const normalized = normalizeHex(hex);

  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);

  const luminance =
    (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.6 ? "#0F172A" : "#FFFFFF";
}

function convertResponseToEditableTema(data) {
  const result = cloneDefaultTema();

  if (!data || typeof data !== "object") {
    return result;
  }

  Object.keys(result).forEach((group) => {
    if (!data[group]) return;

    Object.keys(result[group]).forEach((key) => {
      const serverValue = data[group][key];

      if (serverValue) {
        const extracted = extractHex(
          serverValue,
          result[group][key]
        );

        if (isValidHex(extracted)) {
          result[group][key] = normalizeHex(extracted);
        }
      }
    });
  });

  return result;
}

/* ============================================================
   COMPONENT
============================================================ */

export default function TampilanPage() {
  const [active, setActive] = useState("pengaturan");
  const [collapsed, setCollapsed] = useState(false);

  const [tema, setTema] = useState(cloneDefaultTema());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [openGroups, setOpenGroups] = useState({
    tema: true,
    badgeStatus: true,
    labelRole: true,
    shiftKerja: true,
  });

  const apiUrl = API_BASE_URL.replace(/\/$/, "");

  /* ==========================================================
     API URL
     Menghindari /api/api/v1 jika env sudah punya /api
  ========================================================== */

  const themeApiUrl = apiUrl.endsWith("/api")
    ? `${apiUrl}/v1/cms/tema`
    : `${apiUrl}/api/v1/cms/tema`;

  /* ==========================================================
     TOKEN
  ========================================================== */

  const getToken = () => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  };

  /* ==========================================================
     GET TEMA
  ========================================================== */

  const fetchTema = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Token login tidak ditemukan. Silakan login kembali."
        );
      }

      const response = await fetch(themeApiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Gagal mengambil pengaturan tema."
        );
      }

      const responseData =
        result?.data ?? result?.result ?? result;

      setTema(
        convertResponseToEditableTema(responseData)
      );
    } catch (err) {
      console.error("GET TEMA ERROR:", err);

      setError(
        err?.message ||
          "Terjadi kesalahan saat mengambil pengaturan tema."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     LOAD PERTAMA
  ========================================================== */

  useEffect(() => {
    fetchTema();
  }, []);

  /* ==========================================================
     CHANGE COLOR
  ========================================================== */

  const handleColorChange = (group, key, value) => {
    setTema((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value,
      },
    }));

    setSuccess("");
    setError("");
  };

  /* ==========================================================
     TOGGLE GROUP
  ========================================================== */

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  /* ==========================================================
     PAYLOAD
  ========================================================== */

  const buildPayload = () => {
    const payload = {};

    Object.entries(tema).forEach(
      ([group, colors]) => {
        payload[group] = {};

        Object.entries(colors).forEach(
          ([key, value]) => {
            if (isValidHex(value)) {
              payload[group][key] =
                normalizeHex(value);
            }
          }
        );
      }
    );

    return payload;
  };

  /* ==========================================================
     SAVE
  ========================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Token login tidak ditemukan. Silakan login kembali."
        );
      }

      const payload = buildPayload();

      const response = await fetch(themeApiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Gagal menyimpan pengaturan tema."
        );
      }

      const responseData =
        result?.data ?? result?.result ?? result;

      setTema(
        convertResponseToEditableTema(responseData)
      );

      setSuccess(
        "Pengaturan warna berhasil disimpan."
      );

      window.setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.error("UPDATE TEMA ERROR:", err);

      setError(
        err?.message ||
          "Terjadi kesalahan saat menyimpan pengaturan tema."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     RESET
  ========================================================== */

  const handleReset = async () => {
    const confirmed = window.confirm(
      "Yakin ingin mengembalikan semua warna ke default?"
    );

    if (!confirmed) return;

    try {
      setResetting(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Token login tidak ditemukan. Silakan login kembali."
        );
      }

      const response = await fetch(themeApiUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Gagal mereset tema."
        );
      }

      const responseData =
        result?.data ?? result?.result ?? result;

      setTema(
        convertResponseToEditableTema(responseData)
      );

      setSuccess(
        "Tema berhasil dikembalikan ke warna default."
      );

      window.setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.error("RESET TEMA ERROR:", err);

      setError(
        err?.message ||
          "Terjadi kesalahan saat mereset tema."
      );
    } finally {
      setResetting(false);
    }
  };

  /* ==========================================================
     PREVIEW
  ========================================================== */

  const previewPrimary = isValidHex(
    tema.tema.primary
  )
    ? tema.tema.primary
    : DEFAULT_TEMA.tema.primary;

  const previewSecondary = isValidHex(
    tema.tema.secondary
  )
    ? tema.tema.secondary
    : DEFAULT_TEMA.tema.secondary;

  const previewAccent = isValidHex(
    tema.tema.accent
  )
    ? tema.tema.accent
    : DEFAULT_TEMA.tema.accent;

  const previewBackground = isValidHex(
    tema.tema.background
  )
    ? tema.tema.background
    : DEFAULT_TEMA.tema.background;

  const previewSurface = isValidHex(
    tema.tema.surface
  )
    ? tema.tema.surface
    : DEFAULT_TEMA.tema.surface;

  const previewText = isValidHex(
    tema.tema.text
  )
    ? tema.tema.text
    : DEFAULT_TEMA.tema.text;

  const previewBorder = isValidHex(
    tema.tema.border
  )
    ? tema.tema.border
    : DEFAULT_TEMA.tema.border;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      className="flex min-h-screen w-full"
      style={{
        backgroundColor: previewBackground,
        color: previewText,
      }}
    >
      {/* SIDEBAR */}
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* HEADER */}
        <Header
          title="Pengaturan Tampilan"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
          notifications={[]}
        />

        <main className="flex-1 min-w-0 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="w-full min-w-0 max-w-none space-y-6">

            {/* =================================================
                BREADCRUMB
            ================================================= */}
            <nav className="flex items-center gap-2 text-sm">
              <a
                href="/admin/cms"
                className="transition hover:opacity-70"
                style={{
                  color: previewSecondary,
                }}
              >
                Dashboard
              </a>

              <ChevronRight
                className="w-4 h-4"
                style={{
                  color: previewBorder,
                }}
              />

              <a
                href="/admin/cms/pengaturan"
                className="transition hover:opacity-70"
                style={{
                  color: previewSecondary,
                }}
              >
                Pengaturan
              </a>

              <ChevronRight
                className="w-4 h-4"
                style={{
                  color: previewBorder,
                }}
              />

              <span
                className="font-semibold"
                style={{
                  color: previewPrimary,
                }}
              >
                Tampilan
              </span>
            </nav>

            {/* =================================================
                PAGE HEADER
            ================================================= */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className="shrink-0 p-3 rounded-xl border"
                  style={{
                    backgroundColor: `${previewPrimary}15`,
                    color: previewPrimary,
                    borderColor: `${previewPrimary}25`,
                  }}
                >
                  <Palette className="w-6 h-6" />
                </div>

                <div>
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider mb-1.5"
                    style={{
                      backgroundColor: `${previewPrimary}10`,
                      borderColor: `${previewPrimary}20`,
                      color: previewPrimary,
                    }}
                  >
                    <Sparkles className="w-3 h-3" />
                    Tampilan Website
                  </div>

                  <h1
                    className="text-2xl font-bold"
                    style={{
                      color: previewText,
                    }}
                  >
                    Pengaturan Tampilan
                  </h1>

                  <p
                    className="text-sm mt-1"
                    style={{
                      color: previewSecondary,
                    }}
                  >
                    Atur warna tema yang digunakan
                    di seluruh sistem SmartSchool.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                disabled={resetting || saving}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition disabled:opacity-50"
                style={{
                  backgroundColor: previewSurface,
                  color: previewSecondary,
                  borderColor: previewBorder,
                }}
              >
                {resetting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}

                {resetting
                  ? "Mereset..."
                  : "Kembalikan Default"}
              </button>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}
            {error && (
              <div
                className="flex items-start gap-3 p-4 rounded-xl border"
                style={{
                  backgroundColor: "#FEF2F2",
                  borderColor: "#FECACA",
                  color: "#B91C1C",
                }}
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    Terjadi kesalahan
                  </p>

                  <p className="text-sm mt-0.5">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================= */}
            {success && (
              <div
                className="flex items-start gap-3 p-4 rounded-xl border"
                style={{
                  backgroundColor: "#F0FDF4",
                  borderColor: "#BBF7D0",
                  color: "#15803D",
                }}
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />

                <div>
                  <p className="text-sm font-semibold">
                    Berhasil
                  </p>

                  <p className="text-sm mt-0.5">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                LOADING
            ================================================= */}
            {loading ? (
              <div
                className="flex items-center justify-center min-h-[400px] rounded-xl border"
                style={{
                  backgroundColor: previewSurface,
                  borderColor: previewBorder,
                }}
              >
                <div
                  className="flex flex-col items-center gap-3"
                  style={{
                    color: previewSecondary,
                  }}
                >
                  <Loader2 className="w-7 h-7 animate-spin" />

                  <span className="text-sm">
                    Memuat pengaturan tema...
                  </span>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                {/* =================================================
                    COLOR GROUPS
                ================================================= */}
                {Object.entries(tema).map(
                  ([group, colors]) => {
                    const config =
                      GROUP_LABELS[group];

                    const GroupIcon =
                      config?.icon || Palette;

                    const isOpen =
                      openGroups[group];

                    return (
                      <section
                        key={group}
                        className="rounded-xl border shadow-sm overflow-hidden"
                        style={{
                          backgroundColor:
                            previewSurface,
                          borderColor:
                            previewBorder,
                        }}
                      >
                        {/* GROUP HEADER */}
                        <button
                          type="button"
                          onClick={() =>
                            toggleGroup(group)
                          }
                          className="w-full px-5 py-4 border-b flex items-center justify-between text-left transition"
                          style={{
                            borderColor:
                              previewBorder,
                            backgroundColor:
                              previewBackground,
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-lg flex items-center justify-center"
                              style={{
                                backgroundColor: `${previewPrimary}12`,
                                color: previewPrimary,
                              }}
                            >
                              <GroupIcon className="w-4 h-4" />
                            </div>

                            <div>
                              <h2
                                className="text-sm font-semibold"
                                style={{
                                  color: previewText,
                                }}
                              >
                                {config?.title ||
                                  group}
                              </h2>

                              <p
                                className="text-xs mt-0.5"
                                style={{
                                  color:
                                    previewSecondary,
                                }}
                              >
                                {config?.description ||
                                  "Pengaturan warna"}
                              </p>
                            </div>
                          </div>

                          <ChevronRight
                            className={`w-5 h-5 transition-transform ${
                              isOpen
                                ? "rotate-90"
                                : ""
                            }`}
                            style={{
                              color:
                                previewSecondary,
                            }}
                          />
                        </button>

                        {/* GROUP CONTENT */}
                        {isOpen && (
                          <div className="p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {Object.entries(
                                colors
                              ).map(
                                ([key, value]) => {
                                  const safeValue =
                                    isValidHex(
                                      value
                                    )
                                      ? normalizeHex(
                                          value
                                        )
                                      : "#000000";

                                  const textColor =
                                    getContrastColor(
                                      safeValue
                                    );

                                  return (
                                    <div
                                      key={key}
                                      className="border rounded-xl overflow-hidden"
                                      style={{
                                        backgroundColor:
                                          previewSurface,
                                        borderColor:
                                          previewBorder,
                                      }}
                                    >
                                      {/* COLOR PREVIEW */}
                                      <div
                                        className="h-20 relative flex items-center justify-center"
                                        style={{
                                          backgroundColor:
                                            safeValue,
                                        }}
                                      >
                                        <span
                                          className="text-xs font-semibold px-2 py-1 rounded-md"
                                          style={{
                                            color:
                                              textColor,
                                            backgroundColor:
                                              textColor ===
                                              "#FFFFFF"
                                                ? "rgba(0,0,0,0.15)"
                                                : "rgba(255,255,255,0.55)",
                                          }}
                                        >
                                          {safeValue}
                                        </span>
                                      </div>

                                      {/* COLOR CONTROL */}
                                      <div className="p-3 space-y-3">
                                        <div>
                                          <label
                                            className="text-xs font-semibold"
                                            style={{
                                              color:
                                                previewText,
                                            }}
                                          >
                                            {LABELS[
                                              key
                                            ] || key}
                                          </label>

                                          <p
                                            className="text-[10px] mt-0.5"
                                            style={{
                                              color:
                                                previewSecondary,
                                            }}
                                          >
                                            {group}.
                                            {key}
                                          </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          {/* COLOR PICKER */}
                                          <input
                                            type="color"
                                            value={
                                              safeValue
                                            }
                                            onChange={(
                                              event
                                            ) =>
                                              handleColorChange(
                                                group,
                                                key,
                                                event
                                                  .target
                                                  .value
                                              )
                                            }
                                            className="w-10 h-10 p-0.5 rounded-lg border cursor-pointer"
                                            style={{
                                              borderColor:
                                                previewBorder,
                                              backgroundColor:
                                                previewSurface,
                                            }}
                                          />

                                          {/* HEX INPUT */}
                                          <input
                                            type="text"
                                            value={value}
                                            onChange={(
                                              event
                                            ) =>
                                              handleColorChange(
                                                group,
                                                key,
                                                event
                                                  .target
                                                  .value
                                              )
                                            }
                                            onBlur={() => {
                                              const current =
                                                tema[
                                                  group
                                                ][
                                                  key
                                                ];

                                              if (
                                                !isValidHex(
                                                  current
                                                )
                                              ) {
                                                handleColorChange(
                                                  group,
                                                  key,
                                                  safeValue
                                                );
                                              } else {
                                                handleColorChange(
                                                  group,
                                                  key,
                                                  normalizeHex(
                                                    current
                                                  )
                                                );
                                              }
                                            }}
                                            className="flex-1 min-w-0 px-3 py-2 text-xs font-mono uppercase rounded-lg outline-none border"
                                            style={{
                                              color:
                                                previewText,
                                              backgroundColor:
                                                previewBackground,
                                              borderColor:
                                                previewBorder,
                                            }}
                                            placeholder="#000000"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}
                      </section>
                    );
                  }
                )}

                {/* =================================================
                    LIVE PREVIEW
                ================================================= */}
                <section
                  className="rounded-xl border overflow-hidden shadow-sm"
                  style={{
                    backgroundColor:
                      previewSurface,
                    borderColor:
                      previewBorder,
                  }}
                >
                  <div
                    className="px-5 py-4 flex items-center gap-2 border-b"
                    style={{
                      borderColor:
                        previewBorder,
                      backgroundColor:
                        previewBackground,
                    }}
                  >
                    <Eye
                      className="w-4 h-4"
                      style={{
                        color:
                          previewSecondary,
                      }}
                    />

                    <div>
                      <h2
                        className="text-sm font-semibold"
                        style={{
                          color: previewText,
                        }}
                      >
                        Live Preview
                      </h2>

                      <p
                        className="text-xs mt-0.5"
                        style={{
                          color:
                            previewSecondary,
                        }}
                      >
                        Preview berdasarkan warna
                        yang sedang dipilih
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <div
                      className="rounded-xl border overflow-hidden"
                      style={{
                        backgroundColor:
                          previewBackground,
                        borderColor:
                          previewBorder,
                      }}
                    >
                      {/* NAVBAR PREVIEW */}
                      <div
                        className="px-5 py-4 flex items-center justify-between"
                        style={{
                          backgroundColor:
                            previewPrimary,
                          color:
                            getContrastColor(
                              previewPrimary
                            ),
                        }}
                      >
                        <div className="font-semibold text-sm">
                          SmartSchool
                        </div>

                        <span
                          className="px-2.5 py-1 rounded-md text-[10px] font-semibold"
                          style={{
                            backgroundColor:
                              previewAccent,
                            color:
                              getContrastColor(
                                previewAccent
                              ),
                          }}
                        >
                          CMS Admin
                        </span>
                      </div>

                      {/* CONTENT PREVIEW */}
                      <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div
                            className="md:col-span-2 rounded-xl border p-5"
                            style={{
                              backgroundColor:
                                previewSurface,
                              borderColor:
                                previewBorder,
                            }}
                          >
                            <p
                              className="text-xs font-medium mb-2"
                              style={{
                                color:
                                  previewSecondary,
                              }}
                            >
                              Contoh Tampilan
                            </p>

                            <h3
                              className="text-lg font-bold"
                              style={{
                                color:
                                  previewText,
                              }}
                            >
                              Selamat Datang di
                              SmartSchool
                            </h3>

                            <p
                              className="text-xs mt-2 leading-relaxed"
                              style={{
                                color:
                                  previewSecondary,
                              }}
                            >
                              Warna pada komponen
                              sistem akan mengikuti
                              konfigurasi tema yang
                              disimpan melalui
                              backend.
                            </p>

                            <div className="flex flex-wrap gap-2 mt-4">
                              <button
                                type="button"
                                className="px-3 py-2 rounded-lg text-xs font-semibold"
                                style={{
                                  backgroundColor:
                                    previewPrimary,
                                  color:
                                    getContrastColor(
                                      previewPrimary
                                    ),
                                }}
                              >
                                Tombol Utama
                              </button>

                              <button
                                type="button"
                                className="px-3 py-2 rounded-lg text-xs font-semibold border"
                                style={{
                                  backgroundColor:
                                    previewSurface,
                                  color:
                                    previewText,
                                  borderColor:
                                    previewBorder,
                                }}
                              >
                                Sekunder
                              </button>
                            </div>
                          </div>

                          {/* STATUS */}
                          <div
                            className="rounded-xl border p-5"
                            style={{
                              backgroundColor:
                                previewSurface,
                              borderColor:
                                previewBorder,
                            }}
                          >
                            <p
                              className="text-xs font-semibold mb-3"
                              style={{
                                color:
                                  previewText,
                              }}
                            >
                              Status
                            </p>

                            <div className="flex flex-wrap gap-2">
                              {[
                                [
                                  "aktif",
                                  "Aktif",
                                ],
                                [
                                  "menunggu",
                                  "Menunggu",
                                ],
                                [
                                  "ditolak",
                                  "Ditolak",
                                ],
                                [
                                  "hadir",
                                  "Hadir",
                                ],
                              ].map(
                                ([key, label]) => {
                                  const badgeColor =
                                    isValidHex(
                                      tema
                                        .badgeStatus[
                                        key
                                      ]
                                    )
                                      ? tema
                                          .badgeStatus[
                                          key
                                        ]
                                      : "#64748B";

                                  return (
                                    <span
                                      key={key}
                                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
                                      style={{
                                        backgroundColor: `${badgeColor}18`,
                                        color:
                                          badgeColor,
                                      }}
                                    >
                                      {label}
                                    </span>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* =================================================
                    ACTION
                ================================================= */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={fetchTema}
                    disabled={
                      loading ||
                      saving ||
                      resetting
                    }
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 w-full sm:w-auto text-sm font-medium rounded-lg border transition disabled:opacity-50"
                    style={{
                      backgroundColor:
                        previewSurface,
                      color:
                        previewSecondary,
                      borderColor:
                        previewBorder,
                    }}
                  >
                    <RotateCcw className="w-4 h-4" />

                    Muat Ulang
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving || resetting
                    }
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 w-full sm:w-auto text-white text-sm font-medium rounded-lg shadow-md transition disabled:opacity-60"
                    style={{
                      backgroundColor:
                        previewPrimary,
                      boxShadow: `0 4px 12px ${previewPrimary}25`,
                    }}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* =================================================
                FOOTER
            ================================================= */}
            <footer
              className="pt-4 border-t text-center text-xs"
              style={{
                borderColor: previewBorder,
                color: previewSecondary,
              }}
            >
              © 2026 SmartSchool CMS • Pengaturan
              Tampilan
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}