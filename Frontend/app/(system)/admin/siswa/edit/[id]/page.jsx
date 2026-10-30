"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  User,
  UserRound,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getUserById, updateUser } from "@/services/user.service";

const DEFAULT_FORM = {
  nama: "",
  nis: "",
  nisn: "",
  status: "aktif",
  gender: "L",
  tglLahir: "",
  joinDate: "",
  tempatLahir: "",
  kecamatan: "",
  kota: "",
  kelurahan: "",
  email: "",
  phone: "",
  alamat: "",
  nikOrtu: "",
  namaAyah: "",
  pekerjaanAyah: "",
  namaIbu: "",
  pekerjaanIbu: "",
  alamatKtpOrtu: "",
  alamatDomisiliOrtu: "",
  domisiliSama: true,
};

const themeBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeSoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themeSoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themeText = "text-[var(--color-primary)]";

const themeShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

function formatDateForInput(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeGender(value) {
  const gender = String(value || "").toLowerCase();

  if (["p", "perempuan", "female", "wanita"].includes(gender)) {
    return "P";
  }

  return "L";
}

function normalizeStatus(value) {
  const status = String(value || "").toLowerCase();

  if (["nonaktif", "inactive", "tidak aktif"].includes(status)) {
    return "nonaktif";
  }

  return "aktif";
}

function getErrorMessage(error) {
  return (
    error?.message ||
    error?.response?.data?.message ||
    "Terjadi kesalahan saat memproses data."
  );
}

export default function EditSiswaPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id ? String(params.id) : "";

  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = useCallback(async () => {
    if (!id) {
      setError("ID siswa tidak ditemukan.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await getUserById(id);

      const result = response?.data?.data ?? response?.data ?? response;
      const user = result?.data ?? result;

      if (
        !user ||
        typeof user !== "object" ||
        !user.id
      ) {
        throw new Error(
          response?.message ||
            "Data siswa tidak ditemukan atau format respons tidak sesuai."
        );
      }

      setForm({
        nama: user.namaLengkap || "",
        nis: user.nipd || "",
        nisn: user.nisn || "",
        status: normalizeStatus(user.status),
        gender: normalizeGender(user.jenisKelamin),
        tglLahir: formatDateForInput(user.tanggalLahir),
        joinDate: formatDateForInput(user.dibuatPada),
        tempatLahir: user.tempatLahir || "",
        kecamatan: user.kecamatan || "",
        kota: user.kotaKabupaten || "",
        kelurahan: user.kelurahan || "",
        email: user.email || "",
        phone: user.noTelepon || "",
        alamat: user.alamat || "",
        nikOrtu: user.nik || "",
        namaAyah: user.namaAyah || "",
        pekerjaanAyah: user.pekerjaanAyah || "",
        namaIbu: user.namaIbu || "",
        pekerjaanIbu: user.pekerjaanIbu || "",
        alamatKtpOrtu: user.alamatKtp || "",
        alamatDomisiliOrtu: user.alamatDomisili || "",
        domisiliSama:
          !user.alamatDomisili ||
          user.alamatDomisili === user.alamatKtp,
      });
    } catch (err) {
      console.error("Error load siswa:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!id) {
        setError("ID siswa tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getUserById(id);

        if (cancelled) return;

        const result = response?.data?.data ?? response?.data ?? response;
        const user = result?.data ?? result;

        if (!user || typeof user !== "object" || !user.id) {
          throw new Error(
            response?.message || "Data siswa tidak ditemukan."
          );
        }

        setForm({
          nama: user.namaLengkap || "",
          nis: user.nipd || "",
          nisn: user.nisn || "",
          status: normalizeStatus(user.status),
          gender: normalizeGender(user.jenisKelamin),
          tglLahir: formatDateForInput(user.tanggalLahir),
          joinDate: formatDateForInput(user.dibuatPada),
          tempatLahir: user.tempatLahir || "",
          kecamatan: user.kecamatan || "",
          kota: user.kotaKabupaten || "",
          kelurahan: user.kelurahan || "",
          email: user.email || "",
          phone: user.noTelepon || "",
          alamat: user.alamat || "",
          nikOrtu: user.nik || "",
          namaAyah: user.namaAyah || "",
          pekerjaanAyah: user.pekerjaanAyah || "",
          namaIbu: user.namaIbu || "",
          pekerjaanIbu: user.pekerjaanIbu || "",
          alamatKtpOrtu: user.alamatKtp || "",
          alamatDomisiliOrtu: user.alamatDomisili || "",
          domisiliSama:
            !user.alamatDomisili ||
            user.alamatDomisili === user.alamatKtp,
        });
      } catch (err) {
        if (!cancelled) {
          console.error("Error load siswa:", err);
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "alamatKtpOrtu" && prev.domisiliSama) {
        next.alamatDomisiliOrtu = value;
      }

      return next;
    });

    setError("");
    setSuccessMessage("");
  }

  function handleDomisiliChange(event) {
    const checked = event.target.checked;

    setForm((prev) => ({
      ...prev,
      domisiliSama: checked,
      alamatDomisiliOrtu: checked
        ? prev.alamatKtpOrtu
        : prev.alamatDomisiliOrtu,
    }));

    setError("");
  }

  function validateForm() {
    if (!form.nama.trim()) return "Nama siswa wajib diisi.";
    if (!form.nis.trim()) return "NIS wajib diisi.";
    if (!form.nisn.trim()) return "NISN wajib diisi.";
    if (!form.email.trim()) return "Email wajib diisi.";

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!id) {
      setError("ID siswa tidak ditemukan.");
      return;
    }

    const payload = {
      namaLengkap: form.nama.trim(),
      nipd: form.nis.trim(),
      nisn: form.nisn.trim(),
      email: form.email.trim(),
      jenisKelamin: form.gender,
      tempatLahir: form.tempatLahir.trim() || null,
      tanggalLahir: form.tglLahir || null,
      alamat: form.alamat.trim() || null,
      noTelepon: form.phone.trim() || null,
      status: form.status,
      nik: form.nikOrtu.trim() || null,
      namaAyah: form.namaAyah.trim() || null,
      pekerjaanAyah: form.pekerjaanAyah.trim() || null,
      namaIbu: form.namaIbu.trim() || null,
      pekerjaanIbu: form.pekerjaanIbu.trim() || null,
      alamatKtp: form.alamatKtpOrtu.trim() || null,
      alamatDomisili: form.domisiliSama
        ? form.alamatKtpOrtu.trim() || null
        : form.alamatDomisiliOrtu.trim() || null,
      kecamatan: form.kecamatan.trim() || null,
      kelurahan: form.kelurahan.trim() || null,
      kota: form.kota.trim() || null,
    };

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      console.log("Update siswa:", { id, payload });

      const response = await updateUser(id, payload);

      const result = response?.data ?? response;

      if (result?.success === false) {
        throw new Error(result.message || "Gagal memperbarui data siswa.");
      }

      setSuccessMessage(
        result?.message || "Data siswa berhasil diperbarui."
      );

      window.setTimeout(() => {
        router.push("/admin/siswa");
        router.refresh();
      }, 1000);
    } catch (err) {
      console.error("Error update siswa:", err);
      setError(getErrorMessage(err));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <Loader2 className={`h-8 w-8 animate-spin ${themeText}`} />
          <p className="theme-text-secondary text-sm">
            Mengambil data siswa...
          </p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 min-w-0">
          <button
            type="button"
            onClick={() => router.push("/admin/siswa")}
            className="theme-text-muted mb-4 inline-flex items-center gap-2 text-sm font-medium hover:text-[var(--color-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Data Siswa
          </button>

          <div className="mb-6">
            <h1 className="theme-text text-2xl font-bold">
              Edit Data Siswa
            </h1>
            <p className="theme-text-muted mt-1 text-sm">
              Perbarui informasi siswa melalui sistem.
            </p>
          </div>

          {error && (
            <AlertBox type="error" message={error} />
          )}

          {successMessage && (
            <AlertBox type="success" message={successMessage} />
          )}

          <form onSubmit={handleSubmit}>
            <FormSection
              icon={<User className="h-5 w-5" />}
              title="Data Utama Siswa"
              description="Informasi dasar siswa."
            >
              <div className="grid gap-5 p-6 md:grid-cols-2">
                <Field label="Nama Lengkap" required className="md:col-span-2">
                  <Input
                    name="nama"
                    value={form.nama}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap siswa"
                    required
                  />
                </Field>

                <Field label="NIS" required>
                  <Input
                    name="nis"
                    value={form.nis}
                    onChange={handleChange}
                    placeholder="Masukkan NIS"
                    required
                  />
                </Field>

                <Field label="NISN" required>
                  <Input
                    name="nisn"
                    value={form.nisn}
                    onChange={handleChange}
                    placeholder="Masukkan NISN"
                    required
                  />
                </Field>

                <Field label="Kelas">
                  <Input
                    value="Informasi kelas belum tersedia dari endpoint ini"
                    disabled
                    readOnly
                  />
                  <Hint>
                    Controller getUserById belum mengembalikan relasi kelas.
                  </Hint>
                </Field>

                <Field label="Status">
                  <Select name="status" value={form.status} onChange={handleChange}>
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </Select>
                </Field>

                <Field label="Jenis Kelamin">
                  <Select name="gender" value={form.gender} onChange={handleChange}>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </Select>
                </Field>

                <Field label="Tempat Lahir">
                  <Input
                    name="tempatLahir"
                    value={form.tempatLahir}
                    onChange={handleChange}
                    placeholder="Masukkan tempat lahir"
                  />
                </Field>

                <Field label="Tanggal Lahir">
                  <Input
                    type="date"
                    name="tglLahir"
                    value={form.tglLahir}
                    onChange={handleChange}
                  />
                </Field>

                <Field label="Tanggal Bergabung">
                  <Input type="date" value={form.joinDate} disabled readOnly />
                  <Hint>Diambil dari tanggal data dibuat di backend.</Hint>
                </Field>
              </div>
            </FormSection>

            <FormSection
              icon={<MapPin className="h-5 w-5" />}
              title="Alamat Siswa"
              description="Informasi alamat tempat tinggal siswa."
            >
              <div className="grid gap-5 p-6 md:grid-cols-2">
                <Field label="Alamat Lengkap" className="md:col-span-2">
                  <Textarea
                    name="alamat"
                    value={form.alamat}
                    onChange={handleChange}
                    placeholder="Masukkan alamat lengkap siswa"
                  />
                </Field>

                <Field label="Kota / Kabupaten">
                  <Input
                    name="kota"
                    value={form.kota}
                    onChange={handleChange}
                    placeholder="Masukkan kota/kabupaten"
                  />
                </Field>

                <Field label="Kecamatan">
                  <Input
                    name="kecamatan"
                    value={form.kecamatan}
                    onChange={handleChange}
                    placeholder="Masukkan kecamatan"
                  />
                </Field>

                <Field label="Kelurahan">
                  <Input
                    name="kelurahan"
                    value={form.kelurahan}
                    onChange={handleChange}
                    placeholder="Masukkan kelurahan"
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              icon={<UserRound className="h-5 w-5" />}
              title="Informasi Kontak"
              description="Email dan nomor telepon siswa."
            >
              <div className="grid gap-5 p-6 md:grid-cols-2">
                <Field label="Email" required>
                  <Input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="contoh@email.com"
                    required
                  />
                </Field>

                <Field label="Nomor Telepon">
                  <Input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="08xxxxxxxxxx"
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              icon={<Users className="h-5 w-5" />}
              title="Data Orang Tua / Wali"
              description="Informasi ayah, ibu, dan alamat orang tua."
            >
              <div className="grid gap-5 p-6 md:grid-cols-2">
                <Field label="NIK Orang Tua / Wali">
                  <Input
                    name="nikOrtu"
                    value={form.nikOrtu}
                    onChange={handleChange}
                    placeholder="Masukkan NIK"
                  />
                </Field>

                <div />

                <Field label="Nama Ayah">
                  <Input
                    name="namaAyah"
                    value={form.namaAyah}
                    onChange={handleChange}
                    placeholder="Masukkan nama ayah"
                  />
                </Field>

                <Field label="Pekerjaan Ayah">
                  <Input
                    name="pekerjaanAyah"
                    value={form.pekerjaanAyah}
                    onChange={handleChange}
                    placeholder="Masukkan pekerjaan ayah"
                  />
                </Field>

                <Field label="Nama Ibu">
                  <Input
                    name="namaIbu"
                    value={form.namaIbu}
                    onChange={handleChange}
                    placeholder="Masukkan nama ibu"
                  />
                </Field>

                <Field label="Pekerjaan Ibu">
                  <Input
                    name="pekerjaanIbu"
                    value={form.pekerjaanIbu}
                    onChange={handleChange}
                    placeholder="Masukkan pekerjaan ibu"
                  />
                </Field>

                <Field label="Alamat KTP Orang Tua / Wali" className="md:col-span-2">
                  <Textarea
                    name="alamatKtpOrtu"
                    value={form.alamatKtpOrtu}
                    onChange={handleChange}
                    placeholder="Masukkan alamat sesuai KTP"
                  />
                </Field>

                <div className="md:col-span-2">
                  <label className="theme-text-secondary flex cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={form.domisiliSama}
                      onChange={handleDomisiliChange}
                      className="h-4 w-4 accent-[var(--color-primary)]"
                    />
                    Alamat domisili sama dengan alamat KTP
                  </label>
                </div>

                {!form.domisiliSama && (
                  <Field
                    label="Alamat Domisili Orang Tua / Wali"
                    className="md:col-span-2"
                  >
                    <Textarea
                      name="alamatDomisiliOrtu"
                      value={form.alamatDomisiliOrtu}
                      onChange={handleChange}
                      placeholder="Masukkan alamat domisili"
                    />
                  </Field>
                )}
              </div>
            </FormSection>

            <div className={`flex flex-col-reverse gap-3 border-t ${themeDivider} pt-6 sm:flex-row sm:justify-end`}>
              <button
                type="button"
                onClick={() => router.push("/admin/siswa")}
                disabled={saving}
                className={`theme-card theme-text-secondary ${themeBorder} rounded-xl border px-5 py-3 text-sm font-semibold transition hover:opacity-80 disabled:opacity-60`}
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={saving}
                className="theme-primary inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-[var(--color-card)] shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_16%,transparent)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Perbarui Data
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </PageLayout>
  );
}

function PageLayout({ children }) {
  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar role="admin" active="siswa" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />
        {children}
      </div>
    </div>
  );
}

function FormSection({ icon, title, description, children }) {
  return (
    <section className={`theme-card ${themeBorder} ${themeShadow} mb-6 overflow-hidden rounded-2xl border`}>
      <div className={`border-b ${themeDivider} px-6 py-5`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${themeSoftBorder} ${themeSoft} ${themeText}`}>
            {icon}
          </div>
          <div>
            <h2 className="theme-text text-base font-semibold">{title}</h2>
            <p className="theme-text-muted mt-0.5 text-sm">{description}</p>
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, required = false, className = "", children }) {
  return (
    <div className={className}>
      <label className="theme-text-secondary mb-2 block text-sm font-medium">
        {label}
        {required && <span className="theme-danger ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${themeBorder} ${themeFocus} disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
    />
  );
}

function Select({ className = "", ...props }) {
  return (
    <select
      {...props}
      className={`theme-input w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${themeBorder} ${themeFocus} ${className}`}
    />
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      rows={3}
      className={`theme-input w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none transition ${themeBorder} ${themeFocus} ${className}`}
    />
  );
}

function Hint({ children }) {
  return (
    <p className="theme-text-muted mt-1.5 text-xs leading-5">
      {children}
    </p>
  );
}

function AlertBox({ type, message }) {
  const success = type === "success";
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <div
      role="alert"
      className={`mb-5 flex items-start gap-3 rounded-xl border px-4 py-3 ${
        success
          ? "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] theme-success"
          : "border-[color-mix(in_srgb,var(--color-danger)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] theme-danger"
      }`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">
          {success ? "Berhasil" : "Gagal"}
        </p>
        <p className="mt-0.5 text-sm">{message}</p>
      </div>
    </div>
  );
}