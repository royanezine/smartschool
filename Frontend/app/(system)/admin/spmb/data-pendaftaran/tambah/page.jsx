"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  ArrowLeft,
  UserRound,
  School,
  Phone,
  GraduationCap,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UploadCloud,
  Plus,
} from "lucide-react";

import { daftarPpdb } from "@/services/ppdb.service";
import { getJalurPpdb } from "@/services/jalurPpdb.service";
import { getAuthPayload, getStoredUser } from "@/lib/auth";

// =========================================================
// THEME HELPERS
// =========================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryText = "text-[var(--color-primary)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// =========================================================
// PAGE
// =========================================================

export default function TambahPendaftarPage() {
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingJalur, setLoadingJalur] = useState(true);
  const [jalurList, setJalurList] = useState([]);
  const [sekolahId, setSekolahId] = useState("");

  const [form, setForm] = useState({
    jalurPpdbId: "",
    namaLengkap: "",
    nisn: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "L",
    alamat: "",
    telepon: "",
    email: "",
    namaAyah: "",
    namaIbu: "",
    asalSekolah: "",
    nilaiRapor: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [successData, setSuccessData] = useState(null);

  // =======================================================
  // LOAD JALUR & SEKOLAH
  // =======================================================

  const loadJalur = useCallback(async () => {
    try {
      setLoadingJalur(true);

      const user = getStoredUser();
      const payload = getAuthPayload();
      const sId = user?.sekolahId || payload?.sekolahId || "";
      if (sId) {
        setSekolahId(sId);
      }

      const res = await getJalurPpdb();
      const list = Array.isArray(res?.data) ? res.data : [];
      setJalurList(list);

      if (!sId && list.length > 0 && list[0]?.sekolahId) {
        setSekolahId(list[0].sekolahId);
      }

      if (list.length > 0) {
        setForm((prev) => ({
          ...prev,
          jalurPpdbId: prev.jalurPpdbId || list[0].id,
        }));
      }
    } catch {
      setJalurList([]);
    } finally {
      setLoadingJalur(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadJalur();
    });
  }, [loadJalur]);

  // =======================================================
  // HANDLERS
  // =======================================================

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
    setSubmitError("");
  };

  const validate = () => {
    const errs = {};

    if (!form.jalurPpdbId) {
      errs.jalurPpdbId = "Jalur PPDB wajib dipilih.";
    }

    const nama = form.namaLengkap.trim();
    if (!nama) {
      errs.namaLengkap = "Nama lengkap wajib diisi.";
    } else if (nama.length < 2) {
      errs.namaLengkap = "Nama lengkap minimal 2 karakter.";
    } else if (nama.length > 100) {
      errs.namaLengkap = "Nama lengkap maksimal 100 karakter.";
    }

    const nisn = form.nisn.trim();
    if (!nisn) {
      errs.nisn = "NISN wajib diisi.";
    } else if (!/^\d+$/.test(nisn)) {
      errs.nisn = "NISN hanya boleh berupa angka.";
    } else if (nisn.length < 10) {
      errs.nisn = "NISN minimal 10 karakter.";
    } else if (nisn.length > 20) {
      errs.nisn = "NISN maksimal 20 karakter.";
    }

    const tempat = form.tempatLahir.trim();
    if (!tempat) {
      errs.tempatLahir = "Tempat lahir wajib diisi.";
    } else if (tempat.length < 2) {
      errs.tempatLahir = "Tempat lahir minimal 2 karakter.";
    } else if (tempat.length > 50) {
      errs.tempatLahir = "Tempat lahir maksimal 50 karakter.";
    }

    if (!form.tanggalLahir) {
      errs.tanggalLahir = "Tanggal lahir wajib diisi.";
    }

    if (!form.jenisKelamin) {
      errs.jenisKelamin = "Jenis kelamin wajib dipilih.";
    }

    const alamat = form.alamat.trim();
    if (!alamat) {
      errs.alamat = "Alamat wajib diisi.";
    } else if (alamat.length < 5) {
      errs.alamat = "Alamat minimal 5 karakter.";
    }

    if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) {
      errs.email = "Format email tidak valid.";
    }

    if (form.nilaiRapor !== "" && form.nilaiRapor !== undefined) {
      const nr = Number(form.nilaiRapor);
      if (Number.isNaN(nr) || nr < 0 || nr > 100) {
        errs.nilaiRapor = "Nilai rapor harus berupa angka 0 - 100.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      setSubmitError("Lengkapi semua field wajib dengan benar sebelum menyimpan.");
      return;
    }

    const targetSekolahId =
      sekolahId ||
      jalurList.find((j) => j.id === form.jalurPpdbId)?.sekolahId;

    if (!targetSekolahId) {
      setSubmitError(
        "ID sekolah tidak ditemukan dari sesi atau jalur PPDB. Pastikan jalur PPDB aktif telah dipilih."
      );
      return;
    }

    try {
      setSaving(true);
      setSubmitError("");

      const payload = {
        sekolahId: targetSekolahId,
        jalurPpdbId: form.jalurPpdbId,
        namaLengkap: form.namaLengkap.trim(),
        nisn: form.nisn.trim(),
        tempatLahir: form.tempatLahir.trim(),
        tanggalLahir: form.tanggalLahir,
        jenisKelamin: form.jenisKelamin,
        alamat: form.alamat.trim(),
        telepon: form.telepon.trim() || undefined,
        email: form.email.trim() || undefined,
        namaAyah: form.namaAyah.trim() || undefined,
        namaIbu: form.namaIbu.trim() || undefined,
        asalSekolah: form.asalSekolah.trim() || undefined,
        nilaiRapor:
          form.nilaiRapor !== "" && form.nilaiRapor !== undefined
            ? Number(form.nilaiRapor)
            : undefined,
      };

      const response = await daftarPpdb(payload);

      if (!response?.success || !response?.data) {
        throw new Error(
          response?.message || "Server tidak mengembalikan data pendaftaran."
        );
      }

      setSuccessData(response.data);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal mendaftarkan calon siswa.";
      setSubmitError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleResetForm = () => {
    setSuccessData(null);
    setForm({
      jalurPpdbId: jalurList[0]?.id || "",
      namaLengkap: "",
      nisn: "",
      tempatLahir: "",
      tanggalLahir: "",
      jenisKelamin: "L",
      alamat: "",
      telepon: "",
      email: "",
      namaAyah: "",
      namaIbu: "",
      asalSekolah: "",
      nilaiRapor: "",
    });
    setErrors({});
    setSubmitError("");
  };

  // =======================================================
  // RENDER: SUCCESS STATE
  // =======================================================

  if (successData) {
    const uploadUrl = `/PPDB/daftar/uploadBerkas?id=${encodeURIComponent(
      successData.id
    )}${
      successData.tokenPendaftaran
        ? `&token=${encodeURIComponent(successData.tokenPendaftaran)}`
        : ""
    }`;

    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="spmb"
          setActive={() => {}}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          role="admin"
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={() => setCollapsed((v) => !v)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-2xl">
              <div
                className={`theme-card ${themeNeutralBorder} ${themeCardShadow} overflow-hidden rounded-2xl border p-6 sm:p-8`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={26} />
                  </div>
                  <div>
                    <h1 className="theme-text text-lg font-bold sm:text-xl">
                      Pendaftaran Calon Siswa Berhasil
                    </h1>
                    <p className="theme-text-secondary mt-0.5 text-xs">
                      Data pendaftaran telah terverifikasi dan disimpan oleh server backend.
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-medium text-slate-500">Nomor Pendaftaran:</span>
                    <span className="font-bold text-slate-800">
                      {successData.nomorPendaftaran || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-medium text-slate-500">Nama Lengkap:</span>
                    <span className="font-semibold text-slate-800">
                      {successData.namaLengkap}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-medium text-slate-500">NISN:</span>
                    <span className="text-slate-800">{successData.nisn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-slate-500">ID Pendaftaran:</span>
                    <span className="font-mono text-[11px] text-slate-600">
                      {successData.id}
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800">
                  <p className="font-semibold">Informasi Sinkronisasi Tabel Data Pendaftaran:</p>
                  <p className="mt-1 leading-5 text-emerald-700">
                    Data calon siswa ini telah masuk ke database backend dan langsung tersinkronisasi pada tabel Data Pendaftaran SPMB.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => router.push(uploadUrl)}
                    className={`${themePrimaryGradient} inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white transition hover:brightness-95`}
                  >
                    <UploadCloud size={15} />
                    Unggah Berkas Calon Siswa
                  </button>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="theme-card theme-neutral-border theme-text inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold transition hover:bg-slate-50"
                  >
                    <Plus size={15} />
                    Daftarkan Siswa Lain
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/admin/spmb/data-pendaftaran")}
                    className="theme-card theme-neutral-border theme-text-secondary inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold transition hover:bg-slate-50"
                  >
                    <ArrowLeft size={15} />
                    Kembali ke Data Pendaftaran
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // =======================================================
  // RENDER: FORM
  // =======================================================

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="spmb"
        setActive={() => {}}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        role="admin"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setCollapsed((value) => !value)}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl p-4 sm:p-6 lg:p-8">
            <button
              type="button"
              onClick={() => router.push("/admin/spmb/data-pendaftaran")}
              className="mb-4 inline-flex items-center gap-2 text-xs font-semibold theme-text-secondary transition hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={15} />
              Kembali ke Data Pendaftaran
            </button>

            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimarySoft} ${themePrimaryText}`}
                >
                  <UserRound size={21} />
                </div>
                <div>
                  <h1 className="theme-text text-xl font-bold sm:text-2xl">
                    Tambah Pendaftar
                  </h1>
                  <p className="theme-text-secondary mt-0.5 text-xs">
                    Input pendaftaran calon peserta didik baru melalui endpoint resmi backend.
                  </p>
                </div>
              </div>

              <span
                className={`theme-card ${themeNeutralBorder} w-fit rounded-md border px-3 py-1.5 text-[10px] font-semibold theme-text-secondary`}
              >
                POST /api/ppdb/daftar
              </span>
            </div>

            {submitError && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_9%,transparent)] px-4 py-3 text-xs">
                <AlertCircle size={17} className="mt-0.5 shrink-0 theme-danger" />
                <div>
                  <p className="font-semibold theme-danger">Pendaftaran Gagal Disimpan</p>
                  <p className="mt-0.5 theme-text-secondary">{submitError}</p>
                </div>
              </div>
            )}

            {jalurList.length === 0 && !loadingJalur && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                <AlertCircle size={17} className="mt-0.5 shrink-0 text-amber-600" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">Belum Ada Jalur PPDB</p>
                  <p className="mt-0.5 text-amber-700">
                    Sekolah belum memiliki Jalur PPDB aktif. Buat jalur PPDB terlebih dahulu pada menu Jalur Pendaftaran sebelum mendaftarkan calon siswa.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/admin/spmb/jalur-pendaftaran")}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
                  >
                    <Plus size={13} />
                    Buat Jalur PPDB Sekarang
                  </button>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className={`theme-card ${themeNeutralBorder} ${themeCardShadow} space-y-6 overflow-hidden rounded-2xl border p-5 sm:p-7`}
            >
              {/* JALUR PENERIMAAN */}
              <FormSection
                icon={GraduationCap}
                title="Jalur PPDB"
                description="Pilih jalur penerimaan calon siswa."
              >
                <div>
                  <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                    Jalur PPDB <span className="theme-danger">*</span>
                  </label>
                  <select
                    value={form.jalurPpdbId}
                    onChange={(e) => handleChange("jalurPpdbId", e.target.value)}
                    disabled={loadingJalur || saving}
                    className={`theme-neutral-border theme-neutral-surface theme-text h-10 w-full rounded-lg border px-3 text-xs outline-none transition ${themeFocus}`}
                  >
                    {jalurList.length === 0 && (
                      <option value="">
                        {loadingJalur ? "Memuat jalur..." : "Tidak ada jalur tersedia"}
                      </option>
                    )}
                    {jalurList.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.nama} {j.kuota ? `(Kuota: ${j.kuota})` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.jalurPpdbId && (
                    <p className="theme-danger mt-1 text-[11px]">{errors.jalurPpdbId}</p>
                  )}
                </div>
              </FormSection>

              {/* DATA CALON SISWA */}
              <FormSection
                icon={UserRound}
                title="Data Calon Siswa"
                description="Informasi identitas calon siswa sesuai dokumen resmi."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                      Nama Lengkap <span className="theme-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.namaLengkap}
                      onChange={(e) => handleChange("namaLengkap", e.target.value)}
                      maxLength={100}
                      disabled={saving}
                      placeholder="Nama lengkap calon siswa"
                      className={`theme-neutral-border theme-neutral-surface theme-text h-10 w-full rounded-lg border px-3 text-xs outline-none transition ${themeFocus}`}
                    />
                    {errors.namaLengkap && (
                      <p className="theme-danger mt-1 text-[11px]">{errors.namaLengkap}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                      NISN <span className="theme-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.nisn}
                      onChange={(e) =>
                        handleChange("nisn", e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={20}
                      inputMode="numeric"
                      disabled={saving}
                      placeholder="10 digit nomor NISN"
                      className={`theme-neutral-border theme-neutral-surface theme-text h-10 w-full rounded-lg border px-3 text-xs outline-none transition ${themeFocus}`}
                    />
                    {errors.nisn && (
                      <p className="theme-danger mt-1 text-[11px]">{errors.nisn}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                      Tempat Lahir <span className="theme-danger">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.tempatLahir}
                      onChange={(e) => handleChange("tempatLahir", e.target.value)}
                      maxLength={50}
                      disabled={saving}
                      placeholder="Kota tempat lahir"
                      className={`theme-neutral-border theme-neutral-surface theme-text h-10 w-full rounded-lg border px-3 text-xs outline-none transition ${themeFocus}`}
                    />
                    {errors.tempatLahir && (
                      <p className="theme-danger mt-1 text-[11px]">{errors.tempatLahir}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                      Tanggal Lahir <span className="theme-danger">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.tanggalLahir}
                      onChange={(e) => handleChange("tanggalLahir", e.target.value)}
                      disabled={saving}
                      className={`theme-neutral-border theme-neutral-surface theme-text h-10 w-full rounded-lg border px-3 text-xs outline-none transition ${themeFocus}`}
                    />
                    {errors.tanggalLahir && (
                      <p className="theme-danger mt-1 text-[11px]">{errors.tanggalLahir}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                      Jenis Kelamin <span className="theme-danger">*</span>
                    </label>
                    <select
                      value={form.jenisKelamin}
                      onChange={(e) => handleChange("jenisKelamin", e.target.value)}
                      disabled={saving}
                      className={`theme-neutral-border theme-neutral-surface theme-text h-10 w-full rounded-lg border px-3 text-xs outline-none transition ${themeFocus}`}
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                      Nomor Telepon
                    </label>
                    <input
                      type="text"
                      value={form.telepon}
                      onChange={(e) =>
                        handleChange("telepon", e.target.value.replace(/\D/g, ""))
                      }
                      maxLength={20}
                      inputMode="tel"
                      disabled={saving}
                      placeholder="08xxxxxxxxxx"
                      className={`theme-neutral-border theme-neutral-surface theme-text h-10 w-full rounded-lg border px-3 text-xs outline-none transition ${themeFocus}`}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      maxLength={100}
                      disabled={saving}
                      placeholder="email@example.com"
                      className={`theme-neutral-border theme-neutral-surface theme-text h-10 w-full rounded-lg border px-3 text-xs outline-none transition ${themeFocus}`}
                    />
                    {errors.email && (
                      <p className="theme-danger mt-1 text-[11px]">{errors.email}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                      Alamat Lengkap <span className="theme-danger">*</span>
                    </label>
                    <textarea
                      value={form.alamat}
                      onChange={(e) => handleChange("alamat", e.target.value)}
                      rows={3}
                      disabled={saving}
                      placeholder="Alamat domisili lengkap calon siswa"
                      className={`theme-neutral-border theme-neutral-surface theme-text w-full rounded-lg border px-3 py-2.5 text-xs outline-none transition ${themeFocus}`}
                    />
                    {errors.alamat && (
                      <p className="theme-danger mt-1 text-[11px]">{errors.alamat}</p>
                    )}
                  </div>
                </div>
              </FormSection>

              {/* DATA ASAL SEKOLAH */}
              <FormSection
                icon={School}
                title="Data Pendidikan Sebelumnya"
                description="Informasi asal sekolah dan nilai rapor."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                      Asal Sekolah
                    </label>
                    <input
                      type="text"
                      value={form.asalSekolah}
                      onChange={(e) => handleChange("asalSekolah", e.target.value)}
                      maxLength={100}
                      disabled={saving}
                      placeholder="Nama sekolah asal"
                      className={`theme-neutral-border theme-neutral-surface theme-text h-10 w-full rounded-lg border px-3 text-xs outline-none transition ${themeFocus}`}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                      Nilai Rapor (Opsional)
                    </label>
                    <input
                      type="number"
                      value={form.nilaiRapor}
                      onChange={(e) => handleChange("nilaiRapor", e.target.value)}
                      min={0}
                      max={100}
                      step="0.01"
                      disabled={saving}
                      placeholder="0 - 100"
                      className={`theme-neutral-border theme-neutral-surface theme-text h-10 w-full rounded-lg border px-3 text-xs outline-none transition ${themeFocus}`}
                    />
                    {errors.nilaiRapor && (
                      <p className="theme-danger mt-1 text-[11px]">{errors.nilaiRapor}</p>
                    )}
                  </div>
                </div>
              </FormSection>

              {/* DATA ORANG TUA */}
              <FormSection
                icon={Phone}
                title="Data Orang Tua / Wali"
                description="Nama ayah dan ibu kandung/wali calon siswa."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                      Nama Ayah
                    </label>
                    <input
                      type="text"
                      value={form.namaAyah}
                      onChange={(e) => handleChange("namaAyah", e.target.value)}
                      maxLength={100}
                      disabled={saving}
                      placeholder="Nama lengkap ayah"
                      className={`theme-neutral-border theme-neutral-surface theme-text h-10 w-full rounded-lg border px-3 text-xs outline-none transition ${themeFocus}`}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
                      Nama Ibu
                    </label>
                    <input
                      type="text"
                      value={form.namaIbu}
                      onChange={(e) => handleChange("namaIbu", e.target.value)}
                      maxLength={100}
                      disabled={saving}
                      placeholder="Nama lengkap ibu"
                      className={`theme-neutral-border theme-neutral-surface theme-text h-10 w-full rounded-lg border px-3 text-xs outline-none transition ${themeFocus}`}
                    />
                  </div>
                </div>
              </FormSection>

              {/* ACTIONS */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => router.push("/admin/spmb/data-pendaftaran")}
                  disabled={saving}
                  className="theme-card theme-neutral-border theme-text-secondary inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ArrowLeft size={15} />
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving || jalurList.length === 0}
                  className={`${themePrimaryGradient} inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-xs font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {saving ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Simpan Pendaftaran
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

// =========================================================
// HELPER SECTION COMPONENT
// =========================================================

function FormSection({ icon: Icon, title, description, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
        >
          <Icon size={16} />
        </div>
        <div>
          <h2 className="theme-text text-sm font-bold">{title}</h2>
          <p className="theme-text-secondary text-[11px]">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
