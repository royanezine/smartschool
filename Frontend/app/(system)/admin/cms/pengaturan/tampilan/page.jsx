"use client";

import { useCallback, useEffect, useState } from "react";
import { getToken as getTokenFromLib } from "@/lib/auth";
import {
  Save,
  Palette,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Paintbrush,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { useCmsTheme } from "@/app/components/CmsThemeProvider";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const apiUrl = API_BASE_URL.replace(/\/+$/, "");

const THEME_API_URL = apiUrl.endsWith("/api")
  ? `${apiUrl}/cms/tema`
  : `${apiUrl}/api/cms/tema`;

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

const GROUP_LABELS = {
  tema: {
    title: "Tema Utama",
    description: "Warna utama tampilan sistem.",
    icon: Palette,
  },
  badgeStatus: {
    title: "Badge Status",
    description: "Warna penanda status di berbagai modul.",
    icon: CheckCircle2,
  },
  labelRole: {
    title: "Label Role",
    description: "Warna label berdasarkan role pengguna.",
    icon: Paintbrush,
  },
  shiftKerja: {
    title: "Shift Kerja",
    description: "Warna pembeda shift kerja.",
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

function cloneTema(data = DEFAULT_TEMA) {
  return JSON.parse(JSON.stringify(data));
}

function isValidHex(value) {
  return (
    typeof value === "string" &&
    /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.trim())
  );
}

function normalizeHex(value) {
  let hex = String(value).trim().replace("#", "").toUpperCase();

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  return `#${hex}`;
}

function extractHex(value, fallback) {
  const hex =
    typeof value === "string"
      ? value
      : value && typeof value === "object"
        ? value.hex
        : null;

  return isValidHex(hex) ? normalizeHex(hex) : fallback;
}

function normalizeTemaResponse(data) {
  const normalized = cloneTema();

  if (!data || typeof data !== "object") {
    return normalized;
  }

  for (const group of Object.keys(normalized)) {
    if (!data[group] || typeof data[group] !== "object") {
      continue;
    }

    for (const key of Object.keys(normalized[group])) {
      normalized[group][key] = extractHex(
        data[group][key],
        normalized[group][key]
      );
    }
  }

  return normalized;
}

function getContrastColor(hex) {
  if (!isValidHex(hex)) return "#0F172A";

  const value = normalizeHex(hex);
  const r = parseInt(value.slice(1, 3), 16);
  const g = parseInt(value.slice(3, 5), 16);
  const b = parseInt(value.slice(5, 7), 16);

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.6 ? "#0F172A" : "#FFFFFF";
}

async function readResponse(response, fallbackMessage) {
  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message || result?.error || fallbackMessage
    );
  }

  return result?.data ?? result?.result ?? result;
}

export default function TampilanPage() {
  const { updateTema } = useCmsTheme();

  const [active, setActive] = useState("pengaturan");
  const [collapsed, setCollapsed] = useState(false);

  const [tema, setTema] = useState(() => cloneTema());
  const [temaAwal, setTemaAwal] = useState(() => cloneTema());

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

  
  const getToken = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return getTokenFromLib();
  }, []);

  const getHeaders = useCallback(
    (json = false) => {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Token login tidak ditemukan. Silakan login kembali."
        );
      }

      return {
        Authorization: `Bearer ${token}`,
        ...(json ? { "Content-Type": "application/json" } : {}),
      };
    },
    [getToken]
  );

  const fetchTema = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(THEME_API_URL, {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      });

      const data = await readResponse(
        response,
        "Gagal mengambil pengaturan tema."
      );

      const normalized = normalizeTemaResponse(data);

      setTema(normalized);
      setTemaAwal(cloneTema(normalized));
      updateTema(normalized);
    } catch (err) {
      console.error("GET TEMA ERROR:", err);
      setError(
        err?.message ||
          "Terjadi kesalahan saat mengambil pengaturan tema."
      );
    } finally {
      setLoading(false);
    }
  }, [getHeaders, updateTema]);

  useEffect(() => {
    fetchTema();
  }, [fetchTema]);

  const handleColorChange = (group, key, value) => {
    const nextTema = {
      ...tema,
      [group]: {
        ...tema[group],
        [key]: value,
      },
    };

    setTema(nextTema);

    if (isValidHex(value)) {
      const normalizedValue = normalizeHex(value);

      const normalizedTema = {
        ...nextTema,
        [group]: {
          ...nextTema[group],
          [key]: normalizedValue,
        },
      };

      updateTema(normalizedTema);
    }

    setError("");
    setSuccess("");
  };

  const handleHexBlur = (group, key) => {
    const current = tema[group][key];

    const nextValue = isValidHex(current)
      ? normalizeHex(current)
      : temaAwal[group]?.[key] ?? DEFAULT_TEMA[group][key];

    handleColorChange(group, key, nextValue);
  };

  const toggleGroup = (group) => {
    setOpenGroups((previous) => ({
      ...previous,
      [group]: !previous[group],
    }));
  };

  function getChangedColors() {
    const changes = [];

    for (const [group, colors] of Object.entries(tema)) {
      for (const [key, value] of Object.entries(colors)) {
        if (!isValidHex(value)) {
          throw new Error(
            `Warna ${group}.${key} tidak valid. Gunakan format HEX, misalnya #2563EB.`
          );
        }

        const newColor = normalizeHex(value);
        const oldColor = normalizeHex(
          temaAwal[group]?.[key] ?? DEFAULT_TEMA[group][key]
        );

        if (newColor !== oldColor) {
          changes.push({
            group,
            key,
            value: newColor,
          });
        }
      }
    }

    return changes;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving || resetting) return;

    let changes;

    try {
      changes = getChangedColors();
    } catch (err) {
      setError(err.message);
      setSuccess("");
      return;
    }

    if (changes.length === 0) {
      setSuccess("Tidak ada perubahan warna untuk disimpan.");
      setError("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const savedChanges = [];

      for (const change of changes) {
        const payload = {
          [change.group]: {
            [change.key]: change.value,
          },
        };

        const response = await fetch(THEME_API_URL, {
          method: "PUT",
          headers: getHeaders(true),
          body: JSON.stringify(payload),
        });

        await readResponse(
          response,
          `Gagal menyimpan warna ${change.group}.${change.key}.`
        );

        savedChanges.push(change);
      }

      const nextTemaAwal = cloneTema(temaAwal);

      for (const change of savedChanges) {
        nextTemaAwal[change.group][change.key] = change.value;
      }

      const nextTema = cloneTema(tema);

      for (const change of savedChanges) {
        nextTema[change.group][change.key] = change.value;
      }

      setTemaAwal(nextTemaAwal);
      setTema(nextTema);
      updateTema(nextTema);

      setSuccess(
        `${savedChanges.length} perubahan warna berhasil disimpan.`
      );
    } catch (err) {
      console.error("UPDATE TEMA ERROR:", err);

      setError(
        `${err?.message || "Gagal menyimpan tema."} ` +
          "Sebagian warna mungkin sudah tersimpan. Tekan Muat Ulang untuk memeriksa data terbaru."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (saving || resetting) return;

    const confirmed = window.confirm(
      "Yakin ingin mengembalikan semua warna ke default?"
    );

    if (!confirmed) return;

    try {
      setResetting(true);
      setError("");
      setSuccess("");

      const response = await fetch(THEME_API_URL, {
        method: "DELETE",
        headers: getHeaders(),
      });

      const data = await readResponse(
        response,
        "Gagal mereset tema."
      );

      const normalized = normalizeTemaResponse(data);

      setTema(normalized);
      setTemaAwal(cloneTema(normalized));
      updateTema(normalized);

      setSuccess("Tema berhasil dikembalikan ke warna default.");
    } catch (err) {
      console.error("RESET TEMA ERROR:", err);
      setError(
        err?.message || "Terjadi kesalahan saat mereset tema."
      );
    } finally {
      setResetting(false);
    }
  };

  const preview = tema.tema;

  const previewBackground = isValidHex(preview.background)
    ? normalizeHex(preview.background)
    : DEFAULT_TEMA.tema.background;

  const previewSurface = isValidHex(preview.surface)
    ? normalizeHex(preview.surface)
    : DEFAULT_TEMA.tema.surface;

  const previewText = isValidHex(preview.text)
    ? normalizeHex(preview.text)
    : DEFAULT_TEMA.tema.text;

  const previewPrimary = isValidHex(preview.primary)
    ? normalizeHex(preview.primary)
    : DEFAULT_TEMA.tema.primary;

  const previewSecondary = isValidHex(preview.secondary)
    ? normalizeHex(preview.secondary)
    : DEFAULT_TEMA.tema.secondary;

  const previewBorder = isValidHex(preview.border)
    ? normalizeHex(preview.border)
    : DEFAULT_TEMA.tema.border;

  const previewAccent = isValidHex(preview.accent)
    ? normalizeHex(preview.accent)
    : DEFAULT_TEMA.tema.accent;

  return (
    <div
      className="flex min-h-screen w-full"
      style={{
        backgroundColor: previewBackground,
        color: previewText,
      }}
    >
      <Sidebar
        active={active}
        setActive={setActive}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title="Pengaturan Tampilan"
          user={{
            name: "CMS Admin",
            email: "cms@smartschool.com",
            avatar: "CA",
          }}
          notifications={[]}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-none space-y-6">
            <nav className="flex items-center gap-2 text-sm">
              <a
                href="/admin/cms"
                style={{ color: previewSecondary }}
                className="hover:opacity-70"
              >
                Dashboard
              </a>

              <ChevronRight className="h-4 w-4" />

              <a
                href="/admin/cms/pengaturan"
                style={{ color: previewSecondary }}
                className="hover:opacity-70"
              >
                Pengaturan
              </a>

              <ChevronRight className="h-4 w-4" />

              <span
                className="font-semibold"
                style={{ color: previewPrimary }}
              >
                Tampilan
              </span>
            </nav>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div
                  className="rounded-xl border p-3"
                  style={{
                    backgroundColor: `${previewPrimary}15`,
                    borderColor: `${previewPrimary}30`,
                    color: previewPrimary,
                  }}
                >
                  <Palette className="h-6 w-6" />
                </div>

                <div>
                  <div
                    className="mb-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${previewPrimary}10`,
                      borderColor: `${previewPrimary}25`,
                      color: previewPrimary,
                    }}
                  >
                    <Sparkles className="h-3 w-3" />
                    Tampilan Website
                  </div>

                  <h1 className="text-2xl font-bold">
                    Pengaturan Tampilan
                  </h1>

                  <p
                    className="mt-1 text-sm"
                    style={{ color: previewSecondary }}
                  >
                    Atur warna tema SmartSchool.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                disabled={resetting || saving}
                className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-50"
                style={{
                  backgroundColor: previewSurface,
                  color: previewSecondary,
                  borderColor: previewBorder,
                }}
              >
                {resetting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}

                {resetting ? "Mereset..." : "Kembalikan Default"}
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="text-sm font-semibold">
                    Penyimpanan belum berhasil sepenuhnya
                  </p>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="text-sm font-semibold">Berhasil</p>
                  <p className="mt-1 text-sm">{success}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div
                className="flex min-h-80 items-center justify-center rounded-xl border"
                style={{
                  backgroundColor: previewSurface,
                  borderColor: previewBorder,
                  color: previewSecondary,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Memuat pengaturan tema...
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {Object.entries(tema).map(([group, colors]) => {
                  const config = GROUP_LABELS[group];
                  const GroupIcon = config?.icon || Palette;
                  const isOpen = openGroups[group];

                  return (
                    <section
                      key={group}
                      className="overflow-hidden rounded-xl border shadow-sm"
                      style={{
                        backgroundColor: previewSurface,
                        borderColor: previewBorder,
                        color: previewText,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleGroup(group)}
                        className="flex w-full items-center justify-between gap-3 border-b px-5 py-4 text-left"
                        style={{
                          backgroundColor: previewBackground,
                          borderColor: previewBorder,
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-lg"
                            style={{
                              backgroundColor: `${previewPrimary}15`,
                              color: previewPrimary,
                            }}
                          >
                            <GroupIcon className="h-4 w-4" />
                          </div>

                          <div>
                            <h2 className="text-sm font-semibold">
                              {config?.title || group}
                            </h2>

                            <p
                              className="mt-0.5 text-xs"
                              style={{ color: previewSecondary }}
                            >
                              {config?.description || "Pengaturan warna"}
                            </p>
                          </div>
                        </div>

                        <ChevronRight
                          className={`h-5 w-5 transition-transform ${
                            isOpen ? "rotate-90" : ""
                          }`}
                          style={{ color: previewSecondary }}
                        />
                      </button>

                      {isOpen && (
                        <div className="p-5">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Object.entries(colors).map(([key, value]) => {
                              const safeValue = isValidHex(value)
                                ? normalizeHex(value)
                                : "#000000";

                              return (
                                <div
                                  key={key}
                                  className="overflow-hidden rounded-xl border"
                                  style={{
                                    backgroundColor: previewSurface,
                                    borderColor: previewBorder,
                                  }}
                                >
                                  <div
                                    className="flex h-20 items-center justify-center"
                                    style={{
                                      backgroundColor: safeValue,
                                    }}
                                  >
                                    <span
                                      className="rounded-md px-2 py-1 font-mono text-xs font-semibold"
                                      style={{
                                        color: getContrastColor(safeValue),
                                        backgroundColor:
                                          getContrastColor(safeValue) === "#FFFFFF"
                                            ? "rgba(0,0,0,0.15)"
                                            : "rgba(255,255,255,0.55)",
                                      }}
                                    >
                                      {safeValue}
                                    </span>
                                  </div>

                                  <div className="space-y-3 p-3">
                                    <div>
                                      <label
                                        htmlFor={`${group}-${key}-text`}
                                        className="text-xs font-semibold"
                                      >
                                        {LABELS[key] || key}
                                      </label>

                                      <p
                                        className="mt-0.5 text-[10px]"
                                        style={{ color: previewSecondary }}
                                      >
                                        {group}.{key}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <input
                                        type="color"
                                        aria-label={`Pilih warna ${LABELS[key] || key}`}
                                        value={safeValue}
                                        onChange={(event) =>
                                          handleColorChange(
                                            group,
                                            key,
                                            event.target.value
                                          )
                                        }
                                        className="h-10 w-10 cursor-pointer rounded-lg border p-0.5"
                                        style={{
                                          backgroundColor: previewSurface,
                                          borderColor: previewBorder,
                                        }}
                                      />

                                      <input
                                        id={`${group}-${key}-text`}
                                        type="text"
                                        aria-label={`Kode HEX ${LABELS[key] || key}`}
                                        value={value}
                                        onChange={(event) =>
                                          handleColorChange(
                                            group,
                                            key,
                                            event.target.value
                                          )
                                        }
                                        onBlur={() =>
                                          handleHexBlur(group, key)
                                        }
                                        className="min-w-0 flex-1 rounded-lg border px-3 py-2 font-mono text-xs uppercase outline-none"
                                        style={{
                                          backgroundColor: previewBackground,
                                          color: previewText,
                                          borderColor: previewBorder,
                                        }}
                                        placeholder="#2563EB"
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </section>
                  );
                })}

                <section
                  className="overflow-hidden rounded-xl border shadow-sm"
                  style={{
                    backgroundColor: previewSurface,
                    borderColor: previewBorder,
                    color: previewText,
                  }}
                >
                  <div
                    className="flex items-center gap-2 border-b px-5 py-4"
                    style={{
                      backgroundColor: previewBackground,
                      borderColor: previewBorder,
                    }}
                  >
                    <Eye className="h-4 w-4" />

                    <div>
                      <h2 className="text-sm font-semibold">Live Preview</h2>
                      <p
                        className="mt-0.5 text-xs"
                        style={{ color: previewSecondary }}
                      >
                        Contoh tampilan berdasarkan warna pilihan.
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    <div
                      className="overflow-hidden rounded-xl border"
                      style={{
                        backgroundColor: previewBackground,
                        borderColor: previewBorder,
                      }}
                    >
                      <div
                        className="flex items-center justify-between px-5 py-4"
                        style={{
                          backgroundColor: previewPrimary,
                          color: getContrastColor(previewPrimary),
                        }}
                      >
                        <span className="text-sm font-semibold">
                          SmartSchool
                        </span>

                        <span
                          className="rounded-md px-2.5 py-1 text-[10px] font-semibold"
                          style={{
                            backgroundColor: previewAccent,
                            color: getContrastColor(previewAccent),
                          }}
                        >
                          CMS Admin
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
                        <div
                          className="rounded-xl border p-5 md:col-span-2"
                          style={{
                            backgroundColor: previewSurface,
                            borderColor: previewBorder,
                          }}
                        >
                          <p
                            className="mb-2 text-xs"
                            style={{ color: previewSecondary }}
                          >
                            Contoh Tampilan
                          </p>

                          <h3 className="text-lg font-bold">
                            Selamat Datang di SmartSchool
                          </h3>

                          <p
                            className="mt-2 text-xs leading-relaxed"
                            style={{ color: previewSecondary }}
                          >
                            Preview warna utama dan warna pendukung sistem.
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rounded-lg px-3 py-2 text-xs font-semibold"
                              style={{
                                backgroundColor: previewPrimary,
                                color: getContrastColor(previewPrimary),
                              }}
                            >
                              Tombol Utama
                            </button>

                            <button
                              type="button"
                              className="rounded-lg border px-3 py-2 text-xs font-semibold"
                              style={{
                                backgroundColor: previewSurface,
                                borderColor: previewBorder,
                                color: previewText,
                              }}
                            >
                              Sekunder
                            </button>
                          </div>
                        </div>

                        <div
                          className="rounded-xl border p-5"
                          style={{
                            backgroundColor: previewSurface,
                            borderColor: previewBorder,
                          }}
                        >
                          <p className="mb-3 text-xs font-semibold">
                            Status
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {[
                              ["aktif", "Aktif"],
                              ["menunggu", "Menunggu"],
                              ["ditolak", "Ditolak"],
                              ["hadir", "Hadir"],
                            ].map(([key, label]) => {
                              const color = tema.badgeStatus[key];

                              return (
                                <span
                                  key={key}
                                  className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                                  style={{
                                    backgroundColor: `${color}18`,
                                    color,
                                  }}
                                >
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="flex flex-col justify-end gap-3 pt-1 sm:flex-row">
                  <button
                    type="button"
                    onClick={fetchTema}
                    disabled={loading || saving || resetting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium disabled:opacity-50"
                    style={{
                      backgroundColor: previewSurface,
                      color: previewSecondary,
                      borderColor: previewBorder,
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Muat Ulang
                  </button>

                  <button
                    type="submit"
                    disabled={saving || resetting}
                    className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium shadow-md disabled:opacity-60"
                    style={{
                      backgroundColor: previewPrimary,
                      color: getContrastColor(previewPrimary),
                    }}
                  >
                    {saving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <footer
              className="border-t pt-4 text-center text-xs"
              style={{
                borderColor: previewBorder,
                color: previewSecondary,
              }}
            >
              © 2026 SmartSchool CMS • Pengaturan Tampilan
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}