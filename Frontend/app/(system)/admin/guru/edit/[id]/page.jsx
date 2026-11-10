"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  Edit,
  Save,
  ArrowLeft,
  User,
  Hash,
  Mail,
  Phone,
  CheckCircle,
  ChevronDown,
  X,
  Loader2,
  Clock3,
  MapPin,
  Calendar,
  Briefcase,
  BadgeCheck,
  Info,
  AlertCircle,
  GraduationCap,
  Fingerprint,
  Building2,
  RefreshCw,
  Eye,
  ShieldCheck,
  Lightbulb,
} from "lucide-react";

import {
  getUserById,
  updateUser,
} from "@/services/user.service";
import { getAllJabatan } from "@/services/jabatan.service";
import {
  getShiftKerja,
  assignUserShiftAndJabatan,
} from "@/services/shiftKerja.service";

const EMPTY_FORM = {
  namaLengkap: "",
  namaPengguna: "",
  email: "",
  nik: "",
  nip: "",
  nuptk: "",
  jenisKelamin: "",
  tempatLahir: "",
  tanggalLahir: "",
  alamat: "",
  noTelepon: "",
  jabatan: "",
  jabatanId: "",
  golongan: "",
  tanggalBergabung: "",
  shiftKerja: "",
  masterShiftId: "",
  status: "aktif",
};

const inputClass =
  "w-full rounded-xl border theme-border theme-input py-2.5 pl-10 pr-3 text-sm theme-text focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15 transition-all";

const selectClass =
  "w-full appearance-none rounded-xl border theme-border theme-input py-2.5 pl-10 pr-10 text-sm theme-text focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/15 transition-all";

function extractData(response) {
  return (
    response?.data?.data ??
    response?.data ??
    response
  );
}

function extractShiftList(response) {
  const data = extractData(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.shifts)) return data.shifts;

  return [];
}

function formatDateInput(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function normalizeGender(value) {
  const gender = String(value || "").trim().toLowerCase();

  if (["l", "laki-laki", "laki laki", "male"].includes(gender)) {
    return "Laki-laki";
  }

  if (["p", "perempuan", "female"].includes(gender)) {
    return "Perempuan";
  }

  return "";
}

function normalizeShift(value) {
  const shift = String(value || "").trim().toLowerCase();

  if (shift.includes("pagi")) return "pagi";
  if (shift.includes("siang")) return "siang";

  return "";
}

function Field({
  label,
  required = false,
  icon: Icon,
  children,
  description,
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-xs font-semibold theme-text-secondary">
        {label}
        {required && (
          <span className="ml-1 text-[var(--color-danger)]">*</span>
        )}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
          />
        )}

        {children}
      </div>

      {description && (
        <p className="mt-1 text-[11px] theme-text-muted">
          {description}
        </p>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border theme-card shadow-sm">
      <div className="flex items-center gap-3 border-b theme-border px-4 py-4 sm:px-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-info">
          <Icon size={18} className="text-[var(--color-info)]" />
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold theme-text">
            {title}
          </h2>

          <p className="mt-0.5 text-xs theme-text-muted">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:gap-5 sm:p-5">
        {children}
      </div>
    </section>
  );
}

export default function AdminGuruEditPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);

  const [shiftList, setShiftList] = useState([]);
  const [loadingShift, setLoadingShift] = useState(true);
  const [shiftError, setShiftError] = useState("");
  const [jabatanList, setJabatanList] = useState([]);
  const [loadingJabatan, setLoadingJabatan] = useState(true);

  const [originalMasterShiftId, setOriginalMasterShiftId] = useState("");

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const fetchShift = useCallback(async () => {
    try {
      setLoadingShift(true);
      setShiftError("");

      const response = await getShiftKerja({
        page: 1,
        limit: 100,
        status: "aktif",
      });

      const shifts = extractShiftList(response);

      setShiftList(shifts);
    } catch (err) {
      console.error("[EditGuru] Gagal load shift:", err);

      setShiftList([]);

      setShiftError(
        err?.message || "Gagal mengambil master shift kerja."
      );
    } finally {
      setLoadingShift(false);
    }
  }, []);

  const fetchGuru = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setNotFound(false);

      const response = await getUserById(String(id));

      if (response?.success === false) {
        throw new Error(
          response?.message || "Data guru tidak ditemukan."
        );
      }

      const item = extractData(response);

      if (!item || !item.id) {
        throw new Error("Data guru tidak ditemukan.");
      }

      const roleName = String(
        item.peran?.nama ??
        item.role?.name ??
        item.role ??
        ""
      ).toLowerCase();

      if (roleName && !roleName.includes("guru")) {
        throw new Error("Pengguna ini bukan berstatus guru.");
      }

      const masterId = String(
        item.shiftKerjaId ??
        item.shiftKerjaMaster?.id ??
        item.masterShift?.id ??
        ""
      );

      setOriginalMasterShiftId(masterId);

      setForm({
        namaLengkap: item.namaLengkap ?? item.nama ?? "",
        namaPengguna: item.namaPengguna ?? item.username ?? "",
        email: item.email ?? "",
        nik: item.nik ?? "",
        nip: item.nip ?? "",
        nuptk: item.nuptk ?? "",
        jenisKelamin: normalizeGender(
          item.jenisKelamin ?? item.jenis_kelamin
        ),
        tempatLahir: item.tempatLahir ?? item.tempat_lahir ?? "",
        tanggalLahir: formatDateInput(
          item.tanggalLahir ?? item.tanggal_lahir
        ),
        alamat: item.alamat ?? "",
        noTelepon:
          item.noTelepon ??
          item.nomorTelepon ??
          item.telepon ??
          "",
        jabatan: item.jabatan ?? "",
        jabatanId: String(item.jabatanId ?? item.jabatanRef?.id ?? ""),
        golongan: item.golongan ?? "",
        tanggalBergabung: formatDateInput(
          item.tanggalBergabung ??
          item.tanggalMasuk ??
          item.dibuatPada
        ),
        shiftKerja: normalizeShift(
          item.shiftKerja ?? item.shift
        ),
        masterShiftId: masterId,
        status: String(item.status ?? "aktif").toLowerCase(),
      });
    } catch (err) {
      console.error("[EditGuru] Gagal load:", err);

      const message =
        err?.message || "Gagal mengambil data guru.";

      if (
        message.toLowerCase().includes("tidak ditemukan") ||
        message.toLowerCase().includes("not found")
      ) {
        setNotFound(true);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchJabatan = useCallback(async () => {
    try {
      setLoadingJabatan(true);
      const list = await getAllJabatan();
      setJabatanList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("[EditGuru] Gagal load jabatan:", err);
      setJabatanList([]);
    } finally {
      setLoadingJabatan(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGuru();
      fetchShift();
      fetchJabatan();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchGuru, fetchShift, fetchJabatan]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccessMsg("");
  };

  const validate = () => {
    if (!form.namaLengkap.trim()) {
      return "Nama lengkap wajib diisi.";
    }

    if (!form.namaPengguna.trim()) {
      return "Username wajib diisi.";
    }

    if (!form.email.trim()) {
      return "Email wajib diisi.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Format email tidak valid.";
    }

    if (form.nik.trim() && !/^\d{16}$/.test(form.nik.trim())) {
      return "NIK harus terdiri dari 16 digit angka.";
    }

    if (!form.shiftKerja) {
      return "Shift kerja wajib dipilih.";
    }

    if (!["pagi", "siang"].includes(form.shiftKerja)) {
      return "Shift kerja hanya boleh pagi atau siang.";
    }

    if (
      form.noTelepon.trim() &&
      !/^[0-9+\-\s()]{8,20}$/.test(form.noTelepon)
    ) {
      return "Format nomor telepon tidak valid.";
    }

    if (
      form.tanggalLahir &&
      form.tanggalBergabung &&
      form.tanggalBergabung < form.tanggalLahir
    ) {
      return "Tanggal bergabung tidak boleh sebelum tanggal lahir.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      setSuccessMsg("");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMsg("");

      const payload = {
        namaLengkap: form.namaLengkap.trim(),
        namaPengguna: form.namaPengguna.trim(),
        email: form.email.trim(),
        nik: form.nik.trim() || null,
        nip: form.nip.trim() || null,
        nuptk: form.nuptk.trim() || null,
        jenisKelamin: form.jenisKelamin || null,
        tempatLahir: form.tempatLahir.trim() || null,
        tanggalLahir: form.tanggalLahir || null,
        alamat: form.alamat.trim() || null,
        noTelepon: form.noTelepon.trim() || null,
        jabatan: form.jabatan.trim() || null,
        jabatanId: form.jabatanId ? form.jabatanId : null,
        golongan: form.golongan.trim() || null,
        tanggalBergabung: form.tanggalBergabung || null,
        shiftKerja: form.shiftKerja,
        status: form.status,
      };

      const response = await updateUser(String(id), payload);

      if (response?.success === false) {
        throw new Error(
          response?.message || "Gagal memperbarui data guru."
        );
      }

      let assignmentWarning = "";

      if (form.masterShiftId !== originalMasterShiftId) {
        try {
          if (form.masterShiftId) {
            await assignUserShiftAndJabatan({
              penggunaId: String(id),
              shiftKerjaId: form.masterShiftId,
            });
          } else if (originalMasterShiftId) {
            assignmentWarning =
              " Profil tersimpan, tetapi master shift lama belum dilepas. API pelepasan shift belum tersedia pada service.";
          }
        } catch (assignErr) {
          console.error(
            "[EditGuru] Gagal assign master shift:",
            assignErr
          );

          assignmentWarning =
            " Profil tersimpan, tetapi master shift gagal diperbarui: " +
            (assignErr?.message || "Terjadi kesalahan.");
        }
      }

      setOriginalMasterShiftId(form.masterShiftId);

      setSuccessMsg(
        (response?.message || "Data guru berhasil diperbarui.") +
          assignmentWarning
      );

      if (!assignmentWarning) {
        setTimeout(() => {
          router.push("/admin/guru");
        }, 1200);
      }
    } catch (err) {
      console.error("[EditGuru] Gagal simpan:", err);

      setError(
        err?.message || "Gagal memperbarui data guru."
      );
    } finally {
      setSaving(false);
    }
  };

  const selectedShift = shiftList.find(
    (s) => String(s.id) === String(form.masterShiftId)
  );

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="guru"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b theme-border">
            <Header
              toggleSidebar={toggleSidebar}
              notifications={[]}
              user={{
                name: "Admin Sekolah",
                email: "admin@smartschool.com",
                avatar: "AD",
              }}
            />
          </div>

          <main className="theme-page flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-y-auto">
            <div className="text-center">
              <Loader2
                size={36}
                className="mx-auto animate-spin text-[var(--color-primary)]"
              />
              <p className="mt-3 text-sm theme-text-secondary">
                Memuat data guru...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="guru"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b theme-border">
            <Header
              toggleSidebar={toggleSidebar}
              notifications={[]}
              user={{
                name: "Admin Sekolah",
                email: "admin@smartschool.com",
                avatar: "AD",
              }}
            />
          </div>

          <main className="theme-page flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-y-auto px-4">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full theme-danger">
                <X size={32} />
              </div>
              <h2 className="mt-4 text-xl font-bold theme-text">
                Data Guru Tidak Ditemukan
              </h2>
              <p className="mt-2 text-sm theme-text-muted">
                Guru yang dicari tidak tersedia atau sudah dihapus.
              </p>
              <button
                onClick={() => router.push("/admin/guru")}
                className="mt-5 inline-flex items-center gap-2 rounded-xl theme-primary px-4 py-2.5 text-sm font-semibold shadow-sm"
              >
                <ArrowLeft size={16} />
                Kembali ke Daftar Guru
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="guru"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <div className="flex min-h-0 flex-1">
          <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
            <div className="w-full space-y-5 px-3 py-5 sm:px-5 md:px-6 lg:px-8 2xl:px-12">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <button
                    type="button"
                    onClick={() => router.push("/admin/guru")}
                    className="mb-3 inline-flex items-center gap-2 text-sm font-medium theme-text-muted transition hover:text-[var(--color-primary)]"
                  >
                    <ArrowLeft size={17} />
                    Kembali ke Daftar Guru
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg theme-warning">
                      <Edit
                        size={21}
                        className="text-[var(--color-warning)]"
                      />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold theme-text sm:text-2xl">
                        Edit Profil Guru
                      </h1>
                      <p className="mt-1 text-xs theme-text-muted sm:text-sm">
                        Perbarui informasi pribadi dan kepegawaian guru.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border theme-border theme-card-soft px-3 py-2 text-xs theme-text-muted">
                  ID Pengguna: {String(id).slice(0, 12)}
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl border theme-danger p-3 text-sm">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  <span className="flex-1">{error}</span>
                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="text-xs underline"
                  >
                    Tutup
                  </button>
                </div>
              )}

              {successMsg && (
                <div className="flex items-start gap-2 rounded-xl border theme-success p-3 text-sm">
                  <CheckCircle size={17} className="mt-0.5 shrink-0" />
                  <span className="flex-1">{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <div className="min-w-0 space-y-5">
                    <Section
                      icon={User}
                      title="Informasi Pribadi"
                      description="Informasi identitas dan data dasar guru."
                    >
                      <Field label="Nama Lengkap" required icon={User}>
                        <input
                          name="namaLengkap"
                          value={form.namaLengkap}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Masukkan nama lengkap"
                        />
                      </Field>

                      <Field label="Username" required icon={BadgeCheck}>
                        <input
                          name="namaPengguna"
                          value={form.namaPengguna}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Masukkan username"
                        />
                      </Field>

                      <Field label="Email" required icon={Mail}>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="nama@email.com"
                        />
                      </Field>

                      <Field
                        label="NIK"
                        icon={Fingerprint}
                        description="16 digit nomor induk kependudukan."
                      >
                        <input
                          name="nik"
                          value={form.nik}
                          onChange={handleChange}
                          maxLength={16}
                          inputMode="numeric"
                          className={inputClass}
                          placeholder="Masukkan 16 digit NIK"
                        />
                      </Field>

                      <Field label="Jenis Kelamin" icon={User}>
                        <select
                          name="jenisKelamin"
                          value={form.jenisKelamin}
                          onChange={handleChange}
                          className={selectClass}
                        >
                          <option value="">-- Pilih Jenis Kelamin --</option>
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                        />
                      </Field>

                      <Field label="Tempat Lahir" icon={MapPin}>
                        <input
                          name="tempatLahir"
                          value={form.tempatLahir}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Contoh: Jakarta"
                        />
                      </Field>

                      <Field label="Tanggal Lahir" icon={Calendar}>
                        <input
                          type="date"
                          name="tanggalLahir"
                          value={form.tanggalLahir}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Nomor Telepon" icon={Phone}>
                        <input
                          name="noTelepon"
                          value={form.noTelepon}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="08xxxxxxxxxx"
                        />
                      </Field>

                      <div className="sm:col-span-2">
                        <Field label="Alamat Lengkap" icon={MapPin}>
                          <textarea
                            name="alamat"
                            value={form.alamat}
                            onChange={handleChange}
                            rows={3}
                            className={`${inputClass} resize-y`}
                            placeholder="Masukkan alamat lengkap guru"
                          />
                        </Field>
                      </div>
                    </Section>

                    <Section
                      icon={Briefcase}
                      title="Informasi Kepegawaian"
                      description="Nomor identitas dan informasi jabatan guru."
                    >
                      <Field label="NIP" icon={Hash}>
                        <input
                          name="nip"
                          value={form.nip}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Masukkan NIP"
                        />
                      </Field>

                      <Field label="NUPTK" icon={Hash}>
                        <input
                          name="nuptk"
                          value={form.nuptk}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Masukkan NUPTK"
                        />
                      </Field>

                      <Field label="Jabatan (Hak Akses Menu)" icon={Briefcase}>
                        <select
                          name="jabatanId"
                          value={form.jabatanId}
                          onChange={handleChange}
                          disabled={loadingJabatan}
                          className={selectClass}
                        >
                          <option value="">
                            {loadingJabatan
                              ? "Memuat daftar jabatan..."
                              : "-- Tanpa Jabatan --"}
                          </option>
                          {jabatanList.map((jab) => (
                            <option key={jab.id} value={String(jab.id)}>
                              {jab.namaJabatan || jab.nama}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                        />
                      </Field>

                      <Field label="Golongan" icon={BadgeCheck}>
                        <input
                          name="golongan"
                          value={form.golongan}
                          onChange={handleChange}
                          className={inputClass}
                          placeholder="Contoh: III/a"
                        />
                      </Field>

                      <Field label="Tanggal Bergabung" icon={Calendar}>
                        <input
                          type="date"
                          name="tanggalBergabung"
                          value={form.tanggalBergabung}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Status Kepegawaian" icon={CheckCircle}>
                        <select
                          name="status"
                          value={form.status}
                          onChange={handleChange}
                          className={selectClass}
                        >
                          <option value="aktif">Aktif</option>
                          <option value="nonaktif">Nonaktif</option>
                        </select>
                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                        />
                      </Field>
                    </Section>

                    <div className="flex flex-col-reverse gap-3 border-t theme-border pt-5 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => router.push("/admin/guru")}
                        disabled={saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border theme-border theme-card px-5 py-2.5 text-sm font-semibold theme-text-secondary transition theme-sidebar-hover disabled:opacity-50"
                      >
                        <X size={16} />
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={saving || loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl theme-primary px-6 py-2.5 text-sm font-semibold shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <Loader2 size={17} className="animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save size={17} />
                            Simpan Perubahan
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <aside className="flex min-w-0 flex-col gap-6">
                    <Section
                      icon={Clock3}
                      title="Pengaturan Shift Kerja"
                      description="Atur shift guru & hubungkan ke master shift."
                    >
                      <Field
                        label="Shift Kerja"
                        required
                        icon={Clock3}
                        description="Kategori shift yang digunakan oleh guru."
                      >
                        <select
                          name="shiftKerja"
                          value={form.shiftKerja}
                          onChange={handleChange}
                          className={selectClass}
                        >
                          <option value="">-- Pilih Shift --</option>
                          <option value="pagi">Pagi</option>
                          <option value="siang">Siang</option>
                        </select>
                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                        />
                      </Field>

                      <Field
                        label="Master Shift"
                        icon={Building2}
                        description="Pilih jadwal shift dari master shift."
                      >
                        <select
                          name="masterShiftId"
                          value={form.masterShiftId}
                          onChange={handleChange}
                          disabled={loadingShift || !!shiftError}
                          className={`${selectClass} disabled:opacity-60`}
                        >
                          <option value="">
                            {loadingShift
                              ? "Memuat master shift..."
                              : shiftError
                                ? "Gagal memuat shift"
                                : "-- Tidak terhubung --"}
                          </option>
                          {shiftList.map((shift) => (
                            <option key={shift.id} value={String(shift.id)}>
                              {shift.nama}
                              {shift.kode ? ` (${shift.kode})` : ""} —{" "}
                              {shift.jamMasuk || "-"} s/d{" "}
                              {shift.jamKeluar || "-"}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={17}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 theme-text-placeholder"
                        />
                      </Field>

                      {shiftError && (
                        <div className="flex items-start gap-2 rounded-lg theme-danger p-3 text-xs sm:col-span-2">
                          <AlertCircle size={15} className="mt-0.5 shrink-0" />
                          <span className="flex-1">{shiftError}</span>
                          <button
                            type="button"
                            onClick={fetchShift}
                            className="inline-flex items-center gap-1 font-semibold underline"
                          >
                            <RefreshCw size={12} />
                            Coba lagi
                          </button>
                        </div>
                      )}

                      {selectedShift && (
                        <div className="rounded-xl border theme-border theme-card-soft p-4 sm:col-span-2">
                          <div className="mb-3 flex items-center gap-2">
                            <CheckCircle
                              size={17}
                              className="text-[var(--color-success)]"
                            />
                            <p className="text-sm font-bold theme-text">
                              Detail Master Shift Terpilih
                            </p>
                          </div>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                              <p className="text-xs theme-text-muted">Nama Shift</p>
                              <p className="mt-1 text-sm font-semibold theme-text">
                                {selectedShift.nama || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs theme-text-muted">Jam Masuk</p>
                              <p className="mt-1 text-sm font-semibold theme-text">
                                {selectedShift.jamMasuk || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs theme-text-muted">Jam Keluar</p>
                              <p className="mt-1 text-sm font-semibold theme-text">
                                {selectedShift.jamKeluar || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs theme-text-muted">Toleransi Terlambat</p>
                              <p className="mt-1 text-sm font-semibold theme-text">
                                {selectedShift.toleransiTerlambatMenit ?? 0} menit
                              </p>
                            </div>
                            <div>
                              <p className="text-xs theme-text-muted">Kode Shift</p>
                              <p className="mt-1 text-sm font-semibold theme-text">
                                {selectedShift.kode || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs theme-text-muted">Status Shift</p>
                              <p className="mt-1 text-sm font-semibold theme-text capitalize">
                                {selectedShift.status || "Aktif"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {!loadingShift && !shiftError && shiftList.length === 0 && (
                        <div className="flex items-start gap-2 rounded-lg theme-warning p-3 text-xs sm:col-span-2">
                          <Info size={16} className="mt-0.5 shrink-0" />
                          <span>
                            Belum ada master shift aktif. Buat master shift terlebih dahulu melalui menu Pengaturan Shift Kerja.
                          </span>
                        </div>
                      )}
                    </Section>

                    <div className="theme-info theme-border flex items-start gap-3 rounded-2xl border p-4">
                      <Info
                        size={17}
                        className="mt-0.5 shrink-0 text-[var(--color-info)]"
                      />
                      <div>
                        <p className="text-sm font-semibold theme-text">
                          Informasi Penyimpanan
                        </p>
                        <p className="mt-1 text-xs leading-5 theme-text-muted">
                          Perubahan profil dikirim ke backend. Perubahan master shift diproses melalui layanan penugasan shift kerja.
                        </p>
                      </div>
                    </div>

                    <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                      <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                        <div className="theme-warning flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                          <Lightbulb size={17} />
                        </div>
                        <h2 className="theme-text text-sm font-bold">Panduan</h2>
                      </div>
                      <div className="p-5">
                        <ul className="space-y-3 text-xs leading-5">
                          <li className="flex items-start gap-2">
                            <CheckCircle size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                            <span className="theme-text-secondary">
                              Pastikan email guru aktif untuk pemulihan akun.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                            <span className="theme-text-secondary">
                              NIK harus tepat 16 digit sesuai KTP.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                            <span className="theme-text-secondary">
                              Kategori shift (Pagi/Siang) dan Master Shift dapat diatur berbeda.
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </aside>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}