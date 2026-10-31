"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Settings,
  Shield,
  Bell,
  Clock,
  RefreshCw,
  Save,
  Check,
  Search,
  Plus,
  Info,
  AlertTriangle,
} from "lucide-react";

import { getPengaturan, upsertPengaturan } from "@/services/pengaturan.service";
import { getAuditLogs } from "@/services/auditLog.service";
import { getSemuaSekolahPlatform } from "@/services/platform.service";


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

const themeInput =
  "theme-input theme-text";

const themeLabel =
  "block text-sm font-medium theme-text mb-1.5";

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
  const [activeTab, setActiveTab] = useState("pengaturan");

  const [schools, setSchools] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState("");
  const [loadingSchools, setLoadingSchools] = useState(true);
  const [schoolError, setSchoolError] = useState("");

  const [settings, setSettings] = useState([]);
  const [draft, setDraft] = useState({});
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const [newSetting, setNewSetting] = useState({
    kunci: "",
    nilai: "",
    kelompok: "umum",
    keterangan: "",
  });
  const [creating, setCreating] = useState(false);

  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState("");
  const [filterLog, setFilterLog] = useState("");


  useEffect(() => {
    let mounted = true;

    async function loadSchools() {
      try {
        setLoadingSchools(true);
        setSchoolError("");

        // Super Admin memakai resource platform global (bukan endpoint yayasan
        // yang mensyaratkan yayasanId).
        const daftarSekolah =
          await getSemuaSekolahPlatform();

        const items = daftarSekolah.map((item) => ({
          id: item.id,
          nama: item.nama,
        }));

        if (!mounted) return;

        setSchools(items);
        setSelectedSchoolId(items[0]?.id ?? "");
      } catch (err) {
        if (!mounted) return;

        setSchoolError(
          err?.message || "Gagal memuat daftar sekolah."
        );
      } finally {
        if (mounted) {
          setLoadingSchools(false);
        }
      }
    }

    loadSchools();

    return () => {
      mounted = false;
    };
  }, []);


  useEffect(() => {
    if (!selectedSchoolId) {
      const timer = setTimeout(() => {
        setSettings([]);
        setDraft({});
      }, 0);
      return () => clearTimeout(timer);
    }

    let mounted = true;

    async function loadSettings() {
      try {
        setLoadingSettings(true);
        setSettingsError("");

        const response = await getPengaturan({ sekolahId: selectedSchoolId });
        const payload = unwrapData(response);

        if (!mounted) return;

        const list = Array.isArray(payload) ? payload : [];

        setSettings(list);
        setDraft(
          Object.fromEntries(
            list.map((item) => [item.id, String(item.nilai ?? "")])
          )
        );
      } catch (err) {
        if (!mounted) return;

        setSettings([]);
        setDraft({});
        setSettingsError(
          err?.message || "Gagal memuat pengaturan sekolah."
        );
      } finally {
        if (mounted) {
          setLoadingSettings(false);
        }
      }
    }

    loadSettings();

    return () => {
      mounted = false;
    };
  }, [selectedSchoolId, reloadToken]);


  useEffect(() => {
    if (activeTab !== "aktivitas") return;

    let mounted = true;

    async function loadLogs() {
      try {
        setLogsLoading(true);
        setLogsError("");

        const response = await getAuditLogs({ limit: 50 });
        const payload = unwrapData(response);

        if (!mounted) return;

        setLogs(Array.isArray(payload) ? payload : []);
      } catch (err) {
        if (!mounted) return;

        setLogs([]);
        setLogsError(err?.message || "Gagal memuat audit log.");
      } finally {
        if (mounted) {
          setLogsLoading(false);
        }
      }
    }

    loadLogs();

    return () => {
      mounted = false;
    };
  }, [activeTab]);


  const groupedSettings = useMemo(() => {
    return settings.reduce((groups, item) => {
      const key = item.kelompok || "umum";

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(item);

      return groups;
    }, {});
  }, [settings]);


  const changedSettings = settings.filter(
    (item) => String(item.nilai ?? "") !== String(draft[item.id] ?? "")
  );

  const filteredLogs = logs.filter((log) => {
    const keyword = filterLog.toLowerCase();

    return (
      String(log?.pengguna?.namaLengkap ?? "").toLowerCase().includes(keyword) ||
      String(log?.aksi ?? "").toLowerCase().includes(keyword) ||
      String(log?.modul ?? "").toLowerCase().includes(keyword) ||
      String(log?.ipAddress ?? "").toLowerCase().includes(keyword)
    );
  });


  const handleSave = async () => {
    if (!selectedSchoolId || changedSettings.length === 0) {
      return;
    }

    try {
      setSaving(true);
      setSaveMessage(null);

      for (const item of changedSettings) {
        await upsertPengaturan({
          sekolahId: selectedSchoolId,
          kunci: item.kunci,
          nilai: draft[item.id],
          kelompok: item.kelompok || "umum",
        });
      }

      setSaveMessage({
        type: "success",
        text: `${changedSettings.length} pengaturan berhasil disimpan.`,
      });

      setReloadToken((value) => value + 1);
    } catch (err) {
      setSaveMessage({
        type: "error",
        text: err?.message || "Gagal menyimpan pengaturan.",
      });
    } finally {
      setSaving(false);
    }
  };


  const handleCreate = async (event) => {
    event.preventDefault();

    if (!selectedSchoolId || !newSetting.kunci.trim()) {
      return;
    }

    try {
      setCreating(true);
      setSaveMessage(null);

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

      setSaveMessage({
        type: "success",
        text: "Pengaturan baru berhasil ditambahkan.",
      });

      setReloadToken((value) => value + 1);
    } catch (err) {
      setSaveMessage({
        type: "error",
        text: err?.message || "Gagal menambahkan pengaturan.",
      });
    } finally {
      setCreating(false);
    }
  };


  const selectedSchool = schools.find(
    (school) => school.id === selectedSchoolId
  );


  const tabs = [
    {
      key: "pengaturan",
      label: "Pengaturan",
      icon: Settings,
    },
    {
      key: "aktivitas",
      label: "Aktivitas",
      icon: Clock,
    },
  ];


  return (
    <div className="theme-page theme-text min-h-full">
      <div className="w-full max-w-[1500px] mx-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8 space-y-5 sm:space-y-6">


        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div
                className={`w-9 h-9 rounded-xl ${themePrimarySoft} ${themePrimarySoftBorder} border flex items-center justify-center`}
              >
                <Settings
                  size={19}
                  className={themePrimaryText}
                />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold theme-text">
                Pengaturan Sistem
              </h1>
            </div>

            <p className="text-sm theme-text-secondary mt-1">
              Kelola konfigurasi sekolah melalui endpoint /api/pengaturan.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              saving ||
              !selectedSchoolId ||
              changedSettings.length === 0
            }
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] text-sm font-medium transition ${themePrimaryShadow} hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <>
                <RefreshCw
                  size={16}
                  className="animate-spin"
                />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} />
                Simpan Perubahan
                {changedSettings.length > 0
                  ? ` (${changedSettings.length})`
                  : ""}
              </>
            )}
          </button>
        </div>


        <div
          className={`flex items-start gap-3 rounded-xl border ${themeWarningBorder} ${themeWarningSurface} p-3.5`}
        >
          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0 text-[var(--color-warning)]"
          />

          <div>
            <p className="text-sm font-medium text-[var(--color-warning)]">
              Pengaturan global belum tersedia di backend
            </p>

            <p className="mt-0.5 text-xs theme-text-secondary">
              Backend hanya menyediakan <code>/api/pengaturan</code> per
              sekolah (memerlukan <code>sekolahId</code>). Tab Integrasi,
              Keamanan, dan Notifikasi pada versi lama belum memiliki endpoint
              penyimpanan, sehingga diganti dengan editor pengaturan berbasis
              data nyata.
            </p>
          </div>
        </div>


        {saveMessage && (
          <div
            className={`flex items-center gap-3 p-3.5 rounded-xl border ${
              saveMessage.type === "success"
                ? `${themeSuccessSurface} ${themeSuccessBorder}`
                : `${themeWarningSurface} ${themeWarningBorder}`
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg ${
                saveMessage.type === "success"
                  ? themeSuccessSurface
                  : themeWarningSurface
              } flex items-center justify-center shrink-0`}
            >
              {saveMessage.type === "success" ? (
                <Check
                  size={18}
                  className="text-[var(--color-success)]"
                />
              ) : (
                <AlertTriangle
                  size={18}
                  className="text-[var(--color-warning)]"
                />
              )}
            </div>

            <p
              className={`text-sm font-semibold ${
                saveMessage.type === "success"
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-warning)]"
              }`}
            >
              {saveMessage.text}
            </p>
          </div>
        )}


        <div
          className={`theme-card theme-border rounded-xl border ${themeCardShadow} overflow-hidden`}
        >

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
                    className={`flex items-center gap-2 px-4 sm:px-5 py-3.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                      isActive
                        ? `${themePrimaryText} border-[var(--color-primary)] ${themePrimarySoft}`
                        : `theme-text-secondary border-transparent ${themeNeutralHover}`
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>


          <div className="p-4 sm:p-6">
            {activeTab === "pengaturan" && (
              <div className="space-y-6">

                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="w-full sm:max-w-sm">
                    <label className={themeLabel}>
                      Sekolah
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
                          <option
                            key={school.id}
                            value={school.id}
                          >
                            {school.nama}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {selectedSchool && (
                    <p className="text-xs theme-text-muted sm:pb-2">
                      ID sekolah:{" "}
                      <span className="font-mono">{selectedSchool.id}</span>
                    </p>
                  )}
                </div>

                {loadingSchools && (
                  <p className="text-sm theme-text-secondary">
                    Memuat daftar sekolah...
                  </p>
                )}

                {!loadingSchools && schoolError && (
                  <div
                    className={`rounded-lg border ${themeWarningBorder} ${themeWarningSurface} p-3`}
                  >
                    <p className="text-sm text-[var(--color-warning)]">
                      {schoolError}
                    </p>

                    <p className="mt-1 text-xs theme-text-secondary">
                      Super Admin hanya dapat memilih sekolah yang memiliki
                      data langganan pada endpoint /api/langganan/sekolah.
                    </p>
                  </div>
                )}

                {!loadingSchools && schools.length === 0 && !schoolError && (
                  <div
                    className={`rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-4 text-center`}
                  >
                    <p className="text-sm theme-text-secondary">
                      Belum ada sekolah yang dapat dikonfigurasi.
                    </p>
                  </div>
                )}

                {selectedSchoolId && (
                  <>
                    {loadingSettings ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className="h-20 rounded-lg animate-pulse"
                            style={{
                              background:
                                "color-mix(in srgb, var(--color-text) 6%, transparent)",
                            }}
                          />
                        ))}
                      </div>
                    ) : settingsError ? (
                      <div
                        className={`rounded-lg border ${themeWarningBorder} ${themeWarningSurface} p-3`}
                      >
                        <p className="text-sm text-[var(--color-warning)]">
                          {settingsError}
                        </p>
                      </div>
                    ) : settings.length === 0 ? (
                      <div
                        className={`rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-6 text-center`}
                      >
                        <Settings
                          size={28}
                          className="mx-auto text-[var(--color-text-muted)]"
                        />

                        <p className="mt-2 text-sm font-medium theme-text-secondary">
                          Belum ada pengaturan tersimpan
                        </p>

                        <p className="mt-1 text-xs theme-text-muted">
                          Tambahkan pengaturan pertama menggunakan formulir di
                          bawah.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {Object.entries(groupedSettings).map(
                          ([group, items]) => (
                            <section key={group}>
                              <div className="flex items-center gap-2 mb-3">
                                {group === "keamanan" ? (
                                  <Shield
                                    size={16}
                                    className={themePrimaryText}
                                  />
                                ) : group === "notifikasi" ? (
                                  <Bell
                                    size={16}
                                    className={themePrimaryText}
                                  />
                                ) : (
                                  <Settings
                                    size={16}
                                    className={themePrimaryText}
                                  />
                                )}

                                <h3 className="text-sm font-semibold theme-text capitalize">
                                  {group}
                                </h3>

                                <span className="text-xs theme-text-muted">
                                  ({items.length} kunci)
                                </span>
                              </div>

                              <div className="space-y-3">
                                {items.map((item) => (
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
                                          {item.keterangan || "Tanpa keterangan"}
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
                            </section>
                          )
                        )}
                      </div>
                    )}


                    <form
                      onSubmit={handleCreate}
                      className={`rounded-xl border ${themeNeutralBorder} ${themeNeutralSurface} p-4 space-y-4`}
                    >
                      <div className="flex items-center gap-2">
                        <Plus
                          size={16}
                          className={themePrimaryText}
                        />

                        <h3 className="text-sm font-semibold theme-text">
                          Tambah / Timpa Pengaturan
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={themeLabel}>
                            Kunci
                          </label>

                          <input
                            type="text"
                            value={newSetting.kunci}
                            onChange={(e) =>
                              setNewSetting((prev) => ({
                                ...prev,
                                kunci: e.target.value,
                              }))
                            }
                            placeholder="contoh: nama_aplikasi"
                            required
                            className={`w-full px-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} transition`}
                          />
                        </div>

                        <div>
                          <label className={themeLabel}>
                            Kelompok
                          </label>

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
                          <label className={themeLabel}>
                            Nilai
                          </label>

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
                          <label className={themeLabel}>
                            Keterangan
                          </label>

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
                          disabled={creating || !newSetting.kunci.trim()}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${themePrimarySoft} ${themePrimaryText} border ${themePrimarySoftBorder} transition hover:opacity-80 disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                          {creating ? (
                            <RefreshCw
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Plus size={15} />
                          )}

                          {creating ? "Menyimpan..." : "Simpan Pengaturan"}
                        </button>
                      </div>
                    </form>
                  </>
                )}

                <div
                  className={`flex items-start gap-2 rounded-lg border ${themeInfoBorder} ${themeInfoSurface} p-3`}
                >
                  <Info
                    size={14}
                    className="mt-0.5 shrink-0 text-[var(--color-info)]"
                  />

                  <p className="text-xs theme-text-secondary">
                    Nilai pengaturan disimpan sebagai teks oleh backend.
                    Endpoint GET tidak mengembalikan <code>tipeData</code>,
                    sehingga editor ini tidak menebak tipe data.
                  </p>
                </div>
              </div>
            )}


            {activeTab === "aktivitas" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="relative flex-1 max-w-xs">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                    />

                    <input
                      type="text"
                      placeholder="Cari aktivitas..."
                      value={filterLog}
                      onChange={(e) => setFilterLog(e.target.value)}
                      className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border theme-border ${themeInput} ${themeFocus} placeholder:text-[var(--color-text-placeholder)]`}
                    />
                  </div>

                  <span className="text-sm theme-text-secondary">
                    {logsLoading
                      ? "Memuat..."
                      : `${filteredLogs.length} aktivitas ditemukan`}
                  </span>
                </div>

                {logsError && (
                  <div
                    className={`rounded-lg border ${themeWarningBorder} ${themeWarningSurface} p-3`}
                  >
                    <p className="text-sm text-[var(--color-warning)]">
                      {logsError}
                    </p>
                  </div>
                )}

                <div
                  className={`overflow-x-auto rounded-lg border ${themeNeutralBorder}`}
                >
                  <table className="w-full min-w-[750px] text-sm">
                    <thead>
                      <tr
                        className={`${themeNeutralSurface} border-b ${themeDivider}`}
                      >
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
                          IP
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {logsLoading ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center theme-text-muted"
                          >
                            Memuat audit log...
                          </td>
                        </tr>
                      ) : filteredLogs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-8 text-center theme-text-muted"
                          >
                            Tidak ada aktivitas ditemukan
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr
                            key={log.id}
                            className={`border-b last:border-b-0 ${themeDivider} ${themeNeutralHover} transition-colors`}
                          >
                            <td className="px-4 py-2.5 font-medium theme-text">
                              {log?.pengguna?.namaLengkap || "-"}
                            </td>

                            <td className="px-4 py-2.5 theme-text-secondary">
                              {log.aksi || "-"}
                            </td>

                            <td className="px-4 py-2.5 theme-text-secondary hidden sm:table-cell">
                              {log.modul || "-"}
                            </td>

                            <td className="px-4 py-2.5 theme-text-secondary hidden sm:table-cell">
                              {formatWaktu(log.waktu)}
                            </td>

                            <td className="px-4 py-2.5 theme-text-muted font-mono text-xs hidden md:table-cell">
                              {log.ipAddress || "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div
                  className={`flex items-start gap-2 rounded-lg border ${themeInfoBorder} ${themeInfoSurface} p-3`}
                >
                  <Info
                    size={14}
                    className="mt-0.5 shrink-0 text-[var(--color-info)]"
                  />

                  <p className="text-xs theme-text-secondary">
                    Audit log diambil dari endpoint /api/audit-log (maksimal 50
                    entri terbaru). Filter sekolah belum diterapkan karena
                    halaman ini berkonteks pengaturan per sekolah.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>


        <div
          className={`text-center text-xs theme-text-muted py-3 border-t ${themeDivider}`}
        >
          © 2026 SmartSchool • Pengaturan per sekolah
        </div>
      </div>
    </div>
  );
}
