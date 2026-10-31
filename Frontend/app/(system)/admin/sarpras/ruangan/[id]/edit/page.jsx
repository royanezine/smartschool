"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Layers3,
  DoorOpen,
  School,
  Save,
  Info,
  ChevronRight,
  CheckCircle2,
  Users,
  Hash,
  Sparkles,
  Pencil,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  getGedung,
  getLantaiByGedung,
} from "@/services/infrastruktur.service";

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";
const themePrimaryShadow =
  "shadow-[0_4px_14px_color-mix(in_srgb,var(--color-primary)_20%,transparent)]";
const themeCardShadow =
  "shadow-[0_2px_10px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

export default function GlobalEditRuanganPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  // Context lists from Backend
  const [gedungList, setGedungList] = useState([]);
  const [lantaiList, setLantaiList] = useState([]);
  const [loadingContext, setLoadingContext] = useState(true);

  // Form fields prefilled
  const [gedungId, setGedungId] = useState("");
  const [lantaiId, setLantaiId] = useState("");
  const [nama, setNama] = useState(`Ruangan ${id || ""}`.trim());
  const [kode, setKode] = useState("R-101");
  const [kelasId, setKelasId] = useState("");
  const [kapasitas, setKapasitas] = useState("36");
  const [status, setStatus] = useState("aktif");
  const [errors, setErrors] = useState({});
  const [infoMessage, setInfoMessage] = useState("");

  // Load real Gedung from Backend
  const loadGedung = useCallback(async () => {
    try {
      setLoadingContext(true);
      const res = await getGedung();
      if (res?.success && Array.isArray(res.data)) {
        setGedungList(res.data);
        if (res.data.length > 0) {
          setGedungId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingContext(false);
    }
  }, []);

  // Load Lantai when Gedung changes
  const loadLantai = useCallback(async (selectedGedungId) => {
    if (!selectedGedungId) {
      setLantaiList([]);
      setLantaiId("");
      return;
    }
    try {
      const res = await getLantaiByGedung(selectedGedungId);
      if (res?.success && Array.isArray(res.data)) {
        setLantaiList(res.data);
        if (res.data.length > 0) {
          setLantaiId(res.data[0].id);
        }
      } else {
        setLantaiList([]);
      }
    } catch (err) {
      console.error(err);
      setLantaiList([]);
    }
  }, []);

  useEffect(() => {
    loadGedung();
  }, [loadGedung]);

  useEffect(() => {
    if (gedungId) {
      loadLantai(gedungId);
    }
  }, [gedungId, loadLantai]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!nama.trim()) {
      newErrors.nama = "Nama ruangan wajib diisi.";
    }

    if (kapasitas && Number(kapasitas) < 1) {
      newErrors.kapasitas = "Kapasitas minimal 1 orang.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setInfoMessage("");
      return;
    }

    setErrors({});
    setInfoMessage(
      "Validasi update berhasil! Catatan: Perubahan belum tersimpan ke database karena endpoint backend `PUT /api/infrastruktur/ruangan/:id` belum diimplementasikan di Backend (Backend Gap)."
    );
  };

  const selectedGedungObj = gedungList.find((g) => String(g.id) === String(gedungId));
  const selectedLantaiObj = lantaiList.find((l) => String(l.id) === String(lantaiId));
  const selectedKelasObj = selectedLantaiObj?.kelas?.find(
    (k) => String(k.id) === String(kelasId)
  );

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={false}
        setCollapsed={() => {}}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => {}}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 min-w-0">
            {/* Breadcrumb Navigation */}
            <nav className="flex flex-wrap items-center gap-2 text-xs font-medium theme-text-muted">
              <button
                type="button"
                onClick={() => router.push("/admin/sarpras/ruangan")}
                className="hover:text-[var(--color-primary)] transition"
              >
                Pengelolaan Ruangan
              </button>
              <ChevronRight size={14} />
              <button
                type="button"
                onClick={() => router.push(`/admin/sarpras/ruangan/${id}`)}
                className="hover:text-[var(--color-primary)] transition truncate max-w-[150px]"
              >
                {nama}
              </button>
              <ChevronRight size={14} />
              <span className="theme-text font-semibold">Edit Ruangan</span>
            </nav>

            {/* Header Section */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => router.push(`/admin/sarpras/ruangan/${id}`)}
                  className="mb-2 inline-flex items-center gap-2 text-sm font-medium theme-text-muted hover:text-[var(--color-primary)] transition"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Detail Ruangan
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-[var(--color-primary)]">
                    <Pencil size={20} />
                  </div>
                  <div>
                    <h1 className="theme-text text-2xl font-bold tracking-tight sm:text-3xl">
                      Edit Data Ruangan
                    </h1>
                    <p className="theme-text-muted text-xs sm:text-sm mt-0.5">
                      Perbarui spesifikasi fisik, penempatan lokasi, atau status operasional ruangan.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informative Status Notification */}
            {infoMessage && (
              <div className="flex items-start gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--color-info)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-info)_6%,transparent)] p-4 sm:p-5 text-sm theme-info">
                <CheckCircle2 size={20} className="shrink-0 mt-0.5 text-[var(--color-info)]" />
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Simulasi Update Berhasil</p>
                  <p className="text-xs leading-relaxed opacity-95">{infoMessage}</p>
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/sarpras/ruangan/${id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-card)] border theme-border hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] transition"
                    >
                      Buka Detail Ruangan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Form Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Input Column (8 Cols) */}
              <div className="lg:col-span-8">
                <form
                  onSubmit={handleSubmit}
                  className={`theme-card theme-border rounded-2xl border p-5 sm:p-7 space-y-5 ${themeCardShadow}`}
                >
                  <div className="border-b theme-border pb-4">
                    <h2 className="theme-text text-base font-semibold flex items-center gap-2">
                      <DoorOpen size={18} className="text-[var(--color-primary)]" />
                      Ubah Informasi Ruangan
                    </h2>
                    <p className="theme-text-muted text-xs mt-0.5">
                      Sesuaikan parameter ruangan yang ingin diperbarui.
                    </p>
                  </div>

                  {/* Gedung & Lantai Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Gedung */}
                    <div className="space-y-1.5">
                      <label className="theme-text text-xs font-semibold">
                        Gedung <span className="theme-danger">*</span>
                      </label>
                      <div className="relative">
                        <Building2
                          size={15}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />
                        <select
                          value={gedungId}
                          onChange={(e) => setGedungId(e.target.value)}
                          className={`theme-input w-full rounded-xl pl-9 pr-8 py-2.5 text-sm ${themeFocus}`}
                        >
                          {gedungList.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.nama} {g.kode ? `(${g.kode})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Lantai */}
                    <div className="space-y-1.5">
                      <label className="theme-text text-xs font-semibold">
                        Lantai <span className="theme-danger">*</span>
                      </label>
                      <div className="relative">
                        <Layers3
                          size={15}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />
                        <select
                          value={lantaiId}
                          onChange={(e) => setLantaiId(e.target.value)}
                          className={`theme-input w-full rounded-xl pl-9 pr-8 py-2.5 text-sm ${themeFocus}`}
                        >
                          {lantaiList.map((l) => (
                            <option key={l.id} value={l.id}>
                              {l.nama}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Nama Ruangan */}
                  <div className="space-y-1.5">
                    <label className="theme-text text-xs font-semibold">
                      Nama Ruangan <span className="theme-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Contoh: Ruang Teori 101, Lab Komputer"
                      className={`theme-input w-full rounded-xl px-4 py-2.5 text-sm ${themeFocus} ${
                        errors.nama ? "border-[var(--color-danger)]" : ""
                      }`}
                    />
                    {errors.nama && (
                      <p className="text-xs theme-danger mt-1">{errors.nama}</p>
                    )}
                  </div>

                  {/* Kode Ruangan */}
                  <div className="space-y-1.5">
                    <label className="theme-text text-xs font-semibold">
                      Kode Ruangan
                    </label>
                    <div className="relative">
                      <Hash
                        size={15}
                        className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                      />
                      <input
                        type="text"
                        value={kode}
                        onChange={(e) => setKode(e.target.value)}
                        placeholder="Contoh: R-101"
                        className={`theme-input w-full rounded-xl pl-9 pr-4 py-2.5 text-sm font-mono ${themeFocus}`}
                      />
                    </div>
                  </div>

                  {/* Relasi Kelas & Kapasitas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Kelas Terhubung */}
                    <div className="space-y-1.5">
                      <label className="theme-text text-xs font-semibold flex items-center justify-between">
                        <span>Hubungkan ke Kelas</span>
                        <span className="text-[11px] theme-text-muted font-normal">
                          (Opsional)
                        </span>
                      </label>
                      <div className="relative">
                        <School
                          size={15}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />
                        <select
                          value={kelasId}
                          onChange={(e) => setKelasId(e.target.value)}
                          className={`theme-input w-full rounded-xl pl-9 pr-8 py-2.5 text-sm ${themeFocus}`}
                        >
                          <option value="">-- Tidak Terhubung ke Kelas --</option>
                          {selectedLantaiObj?.kelas && selectedLantaiObj.kelas.length > 0 ? (
                            selectedLantaiObj.kelas.map((k) => (
                              <option key={k.id} value={k.id}>
                                {k.nama} (Tingkat {k.tingkat})
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              (Tidak ada kelas di lantai ini)
                            </option>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Kapasitas Ruangan */}
                    <div className="space-y-1.5">
                      <label className="theme-text text-xs font-semibold">
                        Kapasitas Ruangan
                      </label>
                      <div className="relative">
                        <Users
                          size={15}
                          className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                        />
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={kapasitas}
                          onChange={(e) => setKapasitas(e.target.value)}
                          placeholder="36"
                          className={`theme-input w-full rounded-xl pl-9 pr-4 py-2.5 text-sm ${themeFocus}`}
                        />
                      </div>
                      {errors.kapasitas && (
                        <p className="text-xs theme-danger mt-1">
                          {errors.kapasitas}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Ruangan */}
                  <div className="space-y-1.5">
                    <label className="theme-text text-xs font-semibold">
                      Status Ruangan
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={`theme-input w-full rounded-xl px-4 py-2.5 text-sm ${themeFocus}`}
                    >
                      <option value="aktif">Aktif — Siap digunakan untuk kegiatan</option>
                      <option value="perbaikan">Dalam Perbaikan / Renovasi</option>
                      <option value="nonaktif">Nonaktif / Ditutup Sementara</option>
                    </select>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t theme-border flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/sarpras/ruangan/${id}`)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-semibold theme-text-secondary hover:text-[var(--color-primary)] border theme-border hover:bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] transition"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-[var(--color-card)] ${themePrimaryGradient} ${themePrimaryShadow} hover:brightness-95 transition-all`}
                    >
                      <Save size={16} />
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>

              {/* Live Preview Column (4 Cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className={`theme-card theme-border rounded-2xl border p-5 ${themeCardShadow}`}>
                  <div className="flex items-center gap-2 pb-3 border-b theme-border">
                    <Sparkles size={16} className="text-[var(--color-primary)]" />
                    <h3 className="theme-text text-sm font-bold">
                      Pratinjau Hasil Edit
                    </h3>
                  </div>

                  <div className="mt-4 space-y-3.5">
                    <div className="p-4 rounded-xl bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] border theme-border space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="theme-text text-base font-bold">
                            {nama || "Nama Ruangan"}
                          </p>
                          <p className="theme-text-muted text-xs font-mono">
                            Kode: {kode || "Belum ditentukan"}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            status === "aktif"
                              ? "bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)] theme-success"
                              : status === "perbaikan"
                              ? "bg-[color-mix(in_srgb,var(--color-warning)_15%,transparent)] text-[var(--color-warning)]"
                              : "bg-[color-mix(in_srgb,var(--color-text)_10%,transparent)] theme-text-muted"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="pt-2 border-t theme-border text-xs space-y-1.5 theme-text-secondary">
                        <div className="flex items-center justify-between">
                          <span className="theme-text-muted">Gedung:</span>
                          <span className="font-medium">{selectedGedungObj?.nama || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="theme-text-muted">Lantai:</span>
                          <span className="font-medium">{selectedLantaiObj?.nama || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="theme-text-muted">Kapasitas:</span>
                          <span className="font-medium">{kapasitas || 0} Orang</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="theme-text-muted">Kelas:</span>
                          <span className="font-medium text-[var(--color-primary)]">
                            {selectedKelasObj ? selectedKelasObj.nama : "Ruang Umum"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
