"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation"; // Tambahkan useRouter
import { getMataPelajaran } from "@/services/mataPelajaran.service";
import {
  getAgregatRapor,
  getKkm,
  setKkm,
  updateAgregatRapor,
} from "@/services/pengaturan.service";
import { getTahunAjaran } from "@/services/tahunAjaran.service";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  Settings2,
  Loader2,
  Save,
  RefreshCw,
  ChevronDown,
  BookOpen,
  Calculator,
  CircleCheck,
  CircleAlert,
  Info,
  Edit3,
  Trash2,
  X,
  ShieldCheck,
} from "lucide-react";


function getTotalWeight(subject) {
  return (
    Number(subject.tugas) +
    Number(subject.uts) +
    Number(subject.uas) +
    Number(subject.praktik)
  );
}

function getStatusStyle(status) {
  if (status === "Aktif") {
    return "theme-success";
  }

  return "theme-card-soft theme-text-secondary";
}


function StatCard({
  icon: Icon,
  label,
  value,
  type = "blue",
}) {
  const style = { box: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]", icon: "theme-primary-text", value: "theme-text" };

  return (
    <div className="theme-card theme-border rounded-xl border px-4 py-4 shadow-sm sm:px-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.box} ${style.icon}`}
        >
          <Icon size={19} strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <p className="theme-text-muted text-[11px] font-medium uppercase tracking-wide">
            {label}
          </p>

          <p
            className={`mt-1 text-2xl font-bold tracking-tight ${style.value}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}


export default function PengaturanAgregatPage() {
  const router = useRouter(); // Inisialisasi router

  const [subjects, setSubjects] = useState([]);
  const [originalSubjects, setOriginalSubjects] = useState(null);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [selectedTahunAjaranId, setSelectedTahunAjaranId] = useState("");
  const [kategori, setKategori] = useState("Semua");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [kkmDefaultInput, setKkmDefaultInput] = useState("75");
  const [kkmSaving, setKkmSaving] = useState(false);
  const [kkmNotice, setKkmNotice] = useState("");
  const [kkmError, setKkmError] = useState("");
  const masterMapelListRef = useRef([]);
  const kkmConfigRef = useRef({ kkmDefault: 75, kkmPerMapel: {} });

  const currentTahunAjaran = useMemo(
    () => tahunAjaranList.find((ta) => ta.id === selectedTahunAjaranId),
    [tahunAjaranList, selectedTahunAjaranId]
  );

  const loadAgregatForYear = useCallback(async (yearId, mapelsToUse = null) => {
    if (!yearId) return;
    try {
      setLoading(true);
      setErrorMsg("");
      setSaved(false);

      const agregatRes = await getAgregatRapor(yearId);
      const backendItems =
        agregatRes?.data?.mataPelajaran &&
        Array.isArray(agregatRes.data.mataPelajaran)
          ? agregatRes.data.mataPelajaran
          : [];

      const aggregateMap = new Map();
      backendItems.forEach((item) => {
        aggregateMap.set(item.mataPelajaranId, item);
      });

      const list = mapelsToUse || masterMapelListRef.current;
      const kkmCfg = kkmConfigRef.current || { kkmDefault: 75, kkmPerMapel: {} };
      const mapped = list.map((m, idx) => {
        const savedItem = aggregateMap.get(m.id);
        const mapelKey = String(m.nama || "").trim().toLowerCase();
        const kkmFromGlobal =
          mapelKey && kkmCfg.kkmPerMapel?.[mapelKey] !== undefined
            ? Number(kkmCfg.kkmPerMapel[mapelKey])
            : Number(kkmCfg.kkmDefault ?? 75);
        return {
          id: m.id || `mapel-${idx}`,
          mapel: m.nama || "Mata Pelajaran",
          kode: m.kode || "",
          kategori: "Umum",
          tugas: savedItem ? Number(savedItem.tugas) : 25,
          uts: savedItem ? Number(savedItem.uts) : 25,
          uas: savedItem ? Number(savedItem.uas) : 30,
          praktik: savedItem ? Number(savedItem.praktik) : 20,
          kkm: savedItem ? Number(savedItem.kkm) : kkmFromGlobal,
          status: m.status === "tidak_aktif" ? "Nonaktif" : "Aktif",
        };
      });

      setSubjects(mapped);
      setOriginalSubjects(JSON.stringify(mapped));
    } catch (err) {
      console.error("Gagal memuat agregat rapor:", err);
      setErrorMsg(
        err?.message || "Gagal memuat konfigurasi agregat rapor dari backend"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const [taRes, mapelRes, kkmRes] = await Promise.allSettled([
          getTahunAjaran(),
          getMataPelajaran(),
          getKkm(),
        ]);

        if (!active) return;

        if (kkmRes.status === "fulfilled" && kkmRes.value?.data) {
          const cfg = {
            kkmDefault: Number(kkmRes.value.data.kkmDefault ?? 75),
            kkmPerMapel: kkmRes.value.data.kkmPerMapel || {},
          };
          kkmConfigRef.current = cfg;
          setKkmDefaultInput(String(cfg.kkmDefault));
        }

        const taList =
          taRes.status === "fulfilled" && Array.isArray(taRes.value)
            ? taRes.value
            : [];
        setTahunAjaranList(taList);

        const mapels =
          mapelRes.status === "fulfilled" && Array.isArray(mapelRes.value?.data)
            ? mapelRes.value.data
            : [];
        masterMapelListRef.current = mapels;

        const activeTa =
          taList.find((t) => t.status === "aktif") || taList[0];

        if (activeTa) {
          setSelectedTahunAjaranId(activeTa.id);
          await loadAgregatForYear(activeTa.id, mapels);
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setErrorMsg(err?.message || "Gagal memuat data awal");
          setLoading(false);
        }
      }
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [loadAgregatForYear]);

  const handleSelectTahunAjaran = async (yearId) => {
    setSelectedTahunAjaranId(yearId);
    await loadAgregatForYear(yearId, masterMapelListRef.current);
  };

  const hasChanged = useMemo(() => {
    if (!originalSubjects) return false;
    return JSON.stringify(subjects) !== originalSubjects;
  }, [subjects, originalSubjects]);


  const filteredSubjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return subjects.filter((subject) => {
      const matchesSearch =
        !query ||
        subject.mapel
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        kategori === "Semua" ||
        subject.kategori === kategori;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [subjects, search, kategori]);


  const totalSubjects = subjects.length;

  const activeSubjects = subjects.filter(
    (subject) => subject.status === "Aktif"
  ).length;

  const validSubjects = subjects.filter(
    (subject) => getTotalWeight(subject) === 100
  ).length;

  const invalidSubjects =
    totalSubjects - validSubjects;


  const handleSave = async () => {
    if (!selectedTahunAjaranId) {
      setErrorMsg("Pilih tahun ajaran terlebih dahulu.");
      return;
    }
    if (subjects.length === 0) {
      setErrorMsg("Tidak ada mata pelajaran untuk dikonfigurasi.");
      return;
    }

    for (const s of subjects) {
      const total = getTotalWeight(s);
      if (Math.abs(total - 100) > 0.001) {
        setErrorMsg(
          `Bobot nilai mata pelajaran "${s.mapel}" harus berjumlah tepat 100% (saat ini ${total}%).`
        );
        return;
      }
      const kkmNum = Number(s.kkm);
      if (isNaN(kkmNum) || kkmNum < 0 || kkmNum > 100) {
        setErrorMsg(
          `KKM mata pelajaran "${s.mapel}" harus berupa angka antara 0 dan 100.`
        );
        return;
      }
    }

    try {
      setSaving(true);
      setErrorMsg("");

      const payload = {
        tahunAjaranId: selectedTahunAjaranId,
        mataPelajaran: subjects.map((s) => ({
          mataPelajaranId: s.id,
          tugas: Number(s.tugas),
          uts: Number(s.uts),
          uas: Number(s.uas),
          praktik: Number(s.praktik),
          kkm: Math.round(Number(s.kkm)),
        })),
      };

      await updateAgregatRapor(payload);
      setSaved(true);
      setOriginalSubjects(JSON.stringify(subjects));
      setTimeout(() => {
        setSaved(false);
      }, 3500);
    } catch (err) {
      console.error("Gagal menyimpan agregat rapor:", err);
      setErrorMsg(
        err?.message || "Gagal menyimpan konfigurasi agregat rapor ke backend."
      );
    } finally {
      setSaving(false);
    }
  };


  const resetFilter = () => {
    setSearch("");
    setKategori("Semua");
    if (originalSubjects) {
      setSubjects(JSON.parse(originalSubjects));
    }
    setErrorMsg("");
    setSaved(false);
  };

  const handleSaveKkmGlobal = async () => {
    const parsedDefault = Number(kkmDefaultInput);
    if (
      !Number.isInteger(parsedDefault) ||
      parsedDefault < 0 ||
      parsedDefault > 100
    ) {
      setKkmError("KKM Default harus berupa bilangan bulat antara 0 sampai 100.");
      setKkmNotice("");
      return;
    }

    const kkmPerMapel = {};
    for (const s of subjects) {
      const key = String(s.mapel || "").trim().toLowerCase();
      const val = Math.round(Number(s.kkm));
      if (key && Number.isInteger(val) && val >= 0 && val <= 100) {
        kkmPerMapel[key] = val;
      }
    }

    try {
      setKkmSaving(true);
      setKkmError("");
      setKkmNotice("");
      const res = await setKkm({
        kkmDefault: parsedDefault,
        kkmPerMapel,
      });
      const updated = res?.data || {
        kkmDefault: parsedDefault,
        kkmPerMapel,
      };
      kkmConfigRef.current = {
        kkmDefault: Number(updated.kkmDefault ?? parsedDefault),
        kkmPerMapel: updated.kkmPerMapel || kkmPerMapel,
      };
      setKkmDefaultInput(String(kkmConfigRef.current.kkmDefault));
      setKkmNotice(
        `KKM Global Sekolah (${kkmConfigRef.current.kkmDefault}) dan ${Object.keys(kkmConfigRef.current.kkmPerMapel).length} mapel berhasil disimpan ke server.`
      );
    } catch (err) {
      setKkmError(
        err?.message || "Gagal menyimpan KKM Global Sekolah ke server."
      );
    } finally {
      setKkmSaving(false);
    }
  };


  const handleEditRedirect = (subject) => {
    // Arahkan ke halaman edit terpisah dengan membawa ID mata pelajaran
    router.push(`/admin/eraport/pengaturan-agregat/edit/${subject.id}?tahunAjaranId=${selectedTahunAjaranId}`);
  };


  const deleteSubject = (id) => {
    setSubjects((current) =>
      current.filter(
        (subject) => subject.id !== id
      )
    );
  };


  return (
    <div className="flex h-screen overflow-hidden theme-page theme-text">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header />
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full px-4 py-5 sm:px-6 lg:px-8">
            
            <div className="mb-5 flex items-start gap-3 rounded-xl border theme-border theme-card-soft px-4 py-4 text-sm">
              <div className="theme-card flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm">
                <ShieldCheck size={19} className="text-[var(--color-success)]" />
              </div>
              <div className="min-w-0">
                <p className="theme-text text-sm font-semibold">Data Anda Aman</p>
                <p className="theme-text-muted mt-1 text-xs leading-5">
                  Semua pengaturan bobot nilai dan KKM yang Anda ubah disimpan secara aman di server sekolah.
                </p>
              </div>
            </div>

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm">
                  <Settings2 size={23} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <h1 className="theme-text text-[24px] font-bold tracking-tight sm:text-[27px]">
                    Pengaturan Agregat
                  </h1>
                  <p className="theme-text-muted text-sm">
                    Atur bobot penilaian dan KKM untuk e-Rapor
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={saving || loading || (!hasChanged && search === "" && kategori === "Semua")}
                  onClick={resetFilter}
                  className="theme-card theme-border theme-text-secondary theme-sidebar-hover flex h-10 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RefreshCw size={16} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  type="button"
                  disabled={saving || loading || !selectedTahunAjaranId || subjects.length === 0}
                  onClick={handleSave}
                  className="theme-primary flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                  {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <CircleAlert size={18} className="mt-0.5 shrink-0 text-red-600" />
                <div className="flex-1">
                  <p className="font-semibold">Gagal Memproses Agregat Rapor</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-red-700">{errorMsg}</p>
                </div>
                <button type="button" onClick={() => setErrorMsg("")} className="text-red-500 hover:text-red-700">
                  <X size={16} />
                </button>
              </div>
            )}

            {saved && (
              <div className="theme-success mb-5 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm">
                <CircleCheck size={18} />
                <div>
                  <p className="font-semibold">Pengaturan berhasil disimpan</p>
                  <p className="text-xs opacity-80">Konfigurasi bobot nilai telah diperbarui ke backend.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              <StatCard icon={BookOpen} label="Total Mata Pelajaran" value={totalSubjects} type="blue" />
              <StatCard icon={CircleCheck} label="Mapel Aktif" value={activeSubjects} type="green" />
              <StatCard icon={Calculator} label="Konfigurasi Valid" value={validSubjects} type="purple" />
              <StatCard icon={CircleAlert} label="Bobot Tidak Valid" value={invalidSubjects} type="orange" />
            </div>

            <div className="theme-card theme-border mt-5 rounded-xl border p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="theme-text text-sm font-bold">
                    KKM Global Sekolah
                  </h2>
                  <p className="theme-text-muted mt-0.5 text-xs">
                    Standar KKM default dan sinkronisasi KKM per mata pelajaran ke pengaturan sekolah.
                  </p>
                </div>

                <div className="flex flex-wrap items-end gap-2.5">
                  <div>
                    <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                      KKM Default (0–100)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={kkmDefaultInput}
                      disabled={loading || kkmSaving}
                      onChange={(e) => {
                        setKkmDefaultInput(e.target.value);
                        setKkmError("");
                      }}
                      className="theme-input h-10 w-32 rounded-lg px-3 text-sm font-semibold outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={loading || kkmSaving}
                    onClick={handleSaveKkmGlobal}
                    className="theme-primary flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {kkmSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {kkmSaving ? "Menyimpan..." : "Simpan KKM Global"}
                  </button>
                </div>
              </div>

              {kkmError && (
                <p className="mt-3 text-xs font-medium text-red-600 dark:text-red-400">
                  {kkmError}
                </p>
              )}
              {kkmNotice && (
                <p className="mt-3 text-xs font-medium text-[var(--color-success)]">
                  {kkmNotice}
                </p>
              )}
            </div>

            <div className="theme-card theme-border mt-5 rounded-xl border p-4 shadow-sm sm:p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">Tahun Ajaran</label>
                  <div className="relative">
                    <select
                      value={selectedTahunAjaranId}
                      onChange={(e) => handleSelectTahunAjaran(e.target.value)}
                      disabled={loading || saving || tahunAjaranList.length === 0}
                      className="theme-input h-10 w-full appearance-none rounded-lg px-3.5 pr-9 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:opacity-50"
                    >
                      {tahunAjaranList.length === 0 ? (
                        <option value="">Tidak ada tahun ajaran</option>
                      ) : (
                        tahunAjaranList.map((ta) => (
                          <option key={ta.id} value={ta.id}>
                            {ta.nama} - Semester {ta.semester} {ta.status === "aktif" ? "(Aktif)" : ""}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown size={15} className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">Semester</label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={currentTahunAjaran ? `Semester ${currentTahunAjaran.semester}` : "-"}
                      className="theme-input h-10 w-full cursor-not-allowed rounded-lg px-3.5 text-sm bg-black/[0.03] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-semibold">Kategori Mata Pelajaran</label>
                  <div className="relative">
                    <select
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value)}
                      className="theme-input h-10 w-full appearance-none rounded-lg px-3.5 pr-9 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                    >
                      <option value="Semua">Semua Kategori</option>
                      <option value="Produktif">Produktif</option>
                      <option value="Umum">Umum</option>
                    </select>
                    <ChevronDown size={15} className="theme-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="relative">
                  <BookOpen size={18} className="theme-text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari mata pelajaran..."
                    className="theme-input h-11 w-full rounded-lg pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
                  />
                </div>
              </div>
            </div>

            <div className="theme-info theme-border mt-5 rounded-xl border px-5 py-4">
              <div className="flex gap-3">
                <div className="theme-card flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm">
                  <Calculator size={19} className="theme-primary-text" />
                </div>
                <div>
                  <p className="theme-text text-sm font-semibold">Konfigurasi Agregat Nilai</p>
                  <p className="theme-text-secondary mt-1 text-xs leading-5">
                    Total bobot setiap mata pelajaran harus berjumlah tepat <strong>100%</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="theme-card theme-border mt-5 overflow-hidden rounded-xl border shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] border-collapse text-left">
                  <thead>
                    <tr className="theme-primary text-xs font-semibold uppercase tracking-wide">
                      <th className="w-16 px-4 py-3.5 text-center">No</th>
                      <th className="px-4 py-3.5">Mata Pelajaran</th>
                      <th className="px-4 py-3.5">Kategori</th>
                      <th className="px-3 py-3.5 text-center">Tugas</th>
                      <th className="px-3 py-3.5 text-center">UTS</th>
                      <th className="px-3 py-3.5 text-center">UAS</th>
                      <th className="px-3 py-3.5 text-center">Praktik</th>
                      <th className="px-3 py-3.5 text-center">Total</th>
                      <th className="px-3 py-3.5 text-center">KKM</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="px-4 py-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-sm text-[var(--color-text-muted)]">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin" size={18} />
                            <span>Memuat konfigurasi agregat rapor dari server...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredSubjects.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-sm text-[var(--color-text-muted)]">
                          Tidak ada mata pelajaran yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredSubjects.map((subject, index) => {
                        const total = getTotalWeight(subject);
                        const valid = total === 100;

                        return (
                          <tr key={subject.id} className="theme-table-hover border-b border-[var(--color-border-soft)] transition last:border-0">
                            <td className="theme-text-muted px-4 py-4 text-center text-sm font-medium">{index + 1}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                                  <BookOpen size={17} />
                                </div>
                                <div>
                                  <p className="theme-text text-sm font-semibold">{subject.mapel}</p>
                                  <p className="theme-text-muted mt-0.5 text-xs">
                                    {currentTahunAjaran ? `${currentTahunAjaran.nama} (${currentTahunAjaran.semester})` : "Tahun Ajaran"}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="theme-text-secondary text-sm">{subject.kategori}</span>
                            </td>
                            <td className="px-3 py-4 text-center">
                              <span className="theme-text-secondary text-sm font-medium">{subject.tugas}%</span>
                            </td>
                            <td className="px-3 py-4 text-center">
                              <span className="theme-text-secondary text-sm font-medium">{subject.uts}%</span>
                            </td>
                            <td className="px-3 py-4 text-center">
                              <span className="theme-text-secondary text-sm font-medium">{subject.uas}%</span>
                            </td>
                            <td className="px-3 py-4 text-center">
                              <span className="theme-text-secondary text-sm font-medium">{subject.praktik}%</span>
                            </td>
                            <td className="px-3 py-4 text-center">
                              <span className={`text-sm font-bold ${valid ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}>
                                {total}%
                              </span>
                            </td>
                            <td className="px-3 py-4 text-center">
                              <span className="theme-card-soft theme-text-secondary inline-flex min-w-[40px] items-center justify-center rounded-md px-2 py-1 text-sm font-semibold">
                                {subject.kkm}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(subject.status)}`}>
                                {valid ? <CircleCheck size={13} /> : <CircleAlert size={13} />}
                                {valid ? "Valid" : "Periksa Bobot"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-end gap-1">
                                {/* TOMBOL INI MENGARAHKAN KE HALAMAN BARU */}
                                <button
                                  type="button"
                                  title="Edit konfigurasi"
                                  onClick={() => handleEditRedirect(subject)}
                                  className="theme-text-muted theme-sidebar-hover flex h-8 w-8 items-center justify-center rounded-md transition hover:text-[var(--color-primary)]"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  type="button"
                                  title="Hapus konfigurasi"
                                  onClick={() => deleteSubject(subject.id)}
                                  className="theme-text-muted flex h-8 w-8 items-center justify-center rounded-md transition hover:bg-[var(--color-danger-background)] hover:text-[var(--color-danger)]"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="theme-border-soft flex flex-col gap-2 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="theme-text-muted text-xs">
                  Menampilkan <span className="theme-text-secondary font-medium">{filteredSubjects.length}</span> dari <span className="theme-text-secondary font-medium">{totalSubjects}</span> mata pelajaran
                </p>
                <p className="theme-text-muted text-xs">Bobot wajib berjumlah 100%</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="theme-card theme-border rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex h-9 w-9 items-center justify-center rounded-lg">
                    <Calculator size={18} />
                  </div>
                  <div>
                    <h3 className="theme-text text-sm font-bold">Rumus Nilai Akhir</h3>
                    <p className="theme-text-muted text-xs">Perhitungan otomatis e-Rapor</p>
                  </div>
                </div>
                <div className="theme-card-soft mt-4 rounded-lg px-4 py-3">
                  <p className="theme-text-secondary text-sm font-semibold">Nilai Akhir =</p>
                  <p className="theme-text-muted mt-2 text-xs leading-5">
                    (Nilai Tugas × Bobot Tugas) + (Nilai UTS × Bobot UTS) + (Nilai UAS × Bobot UAS) + (Nilai Praktik × Bobot Praktik)
                  </p>
                </div>
              </div>

              <div className="theme-card theme-border rounded-xl border p-5">
                <div className="flex items-center gap-3">
                  <div className="theme-warning flex h-9 w-9 items-center justify-center rounded-lg">
                    <Info size={18} />
                  </div>
                  <div>
                    <h3 className="theme-text text-sm font-bold">Catatan Pengaturan</h3>
                    <p className="theme-text-muted text-xs">Perhatikan konfigurasi sebelum disimpan</p>
                  </div>
                </div>
                <ul className="theme-text-muted mt-4 space-y-2 text-xs leading-5">
                  <li className="flex gap-2">
                    <span className="theme-primary mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />
                    Total bobot setiap mata pelajaran harus 100%.
                  </li>
                  <li className="flex gap-2">
                    <span className="theme-primary mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />
                    KKM menjadi batas minimal ketuntasan siswa.
                  </li>
                  <li className="flex gap-2">
                    <span className="theme-primary mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />
                    Perubahan bobot akan memengaruhi nilai akhir.
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}