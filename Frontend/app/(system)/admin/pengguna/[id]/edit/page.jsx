
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { getRoles } from "@/services/role.service";
import { getAuthPayload, normalizeRole } from "@/lib/auth";
import {
  getUserById,
  updateUser,
} from "@/services/user.service";

const ROLE_LEVEL = {
  super_admin: 100,
  admin_yayasan: 80,
  admin_sekolah: 60,
  guru: 40,
  siswa: 20,
};

function canAssignRole(actorRole, targetRole) {
  const actor = normalizeRole(actorRole);
  const target = normalizeRole(targetRole);

  if (actor === "super_admin") return true;
  if (!target || target === "super_admin") return false;

  return (
    (ROLE_LEVEL[actor] ?? 0) > (ROLE_LEVEL[target] ?? 0)
  );
}

function getUserData(result) {
  return result?.data?.data ?? result?.data ?? result;
}

function extractRoles(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.items)) return result.items;
  return [];
}

function getRoleLabel(role) {
  return (
    role?.namaTampilan ??
    role?.nama ??
    role?.name ??
    "Peran"
  );
}

function normalizeRoleName(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  disabled = false,
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
      />
    </label>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
  required = false,
  placeholder = "Pilih opsi",
  disabled = false,
  hint = "",
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {hint && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
    </label>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
      <div className="mb-5 border-b border-slate-100 pb-4 dark:border-slate-800">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

const SHIFT_OPTIONS = [
  { value: "pagi", label: "Pagi" },
  { value: "siang", label: "Siang" },
];

export default function EditPenggunaPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [form, setForm] = useState({
    namaLengkap: "",
    namaPengguna: "",
    email: "",
    noTelepon: "",
    jabatan: "",
    golongan: "",
    status: "aktif",
    peranId: "",
    shiftKerja: "",
  });

  const [roleOptions, setRoleOptions] = useState([]);
  const [roleHint, setRoleHint] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const loadData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError("ID pengguna tidak ditemukan.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const userResult = await getUserById(id);
      const user = getUserData(userResult);

      if (!user?.id) {
        throw new Error("Data pengguna tidak ditemukan.");
      }

      const currentRoleId = String(
        user.peran?.id ?? user.peranId ?? user.roleId ?? ""
      );

      setForm({
        namaLengkap: user.namaLengkap ?? "",
        namaPengguna: user.namaPengguna ?? "",
        email: user.email ?? "",
        noTelepon: user.noTelepon ?? "",
        jabatan: user.jabatan ?? "",
        golongan: user.golongan ?? "",
        status: user.status ?? "aktif",
        peranId: currentRoleId,
        shiftKerja: String(user.shiftKerja ?? "").toLowerCase(),
      });

      let roles = [];

      try {
        const roleResult = await getRoles();
        roles = extractRoles(roleResult);
      } catch (roleError) {
        console.warn(
          "Daftar peran tidak dapat dimuat:",
          roleError.message
        );
      }

      const authPayload = getAuthPayload();
      const actorRole = normalizeRole(
        authPayload?.role ?? authPayload?.peran
      );
      const actorSekolahId =
        authPayload?.sekolahId ?? null;

      const mappedRoles = roles
        .filter((role) => role?.id)
        .filter((role) => {
          if (actorRole === "super_admin") return true;

          if (
            role.sekolahId &&
            actorSekolahId &&
            String(role.sekolahId) !== String(actorSekolahId)
          ) {
            return false;
          }

          return canAssignRole(actorRole, role.nama);
        })
        .map((role) => ({
          value: String(role.id),
          label: getRoleLabel(role),
          disabled: false,
        }));

      if (
        currentRoleId &&
        !mappedRoles.some(
          (role) => role.value === currentRoleId
        )
      ) {
        mappedRoles.unshift({
          value: currentRoleId,
          label: getRoleLabel(user.peran),
          disabled: true,
        });
      }

      setRoleOptions(mappedRoles);

      if (actorRole === "super_admin") {
        setRoleHint(
          "Sebagai super admin, seluruh role dapat dipilih."
        );
      } else if (
        currentRoleId &&
        mappedRoles.some(
          (role) =>
            role.value === currentRoleId && role.disabled
        )
      ) {
        setRoleHint(
          "Peran saat ini di luar kewenangan akun Anda sehingga tidak dapat diubah."
        );
      } else {
        setRoleHint(
          "Pilihan dibatasi pada role yang boleh dikelola oleh akun Anda."
        );
      }
    } catch (err) {
      setError(err.message || "Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadData]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.peranId) {
      setNotice("");
      setError("Peran pengguna wajib dipilih.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        namaLengkap: form.namaLengkap.trim(),
        namaPengguna: form.namaPengguna.trim(),
        email: form.email.trim(),
        noTelepon: form.noTelepon.trim() || null,
        jabatan: form.jabatan.trim() || null,
        golongan: form.golongan.trim() || null,
        status: form.status,
        peranId: form.peranId,
      };

      if (form.shiftKerja) {
        payload.shiftKerja = form.shiftKerja;
      }

      await updateUser(id, payload);

      setNotice("Data pengguna berhasil diperbarui.");
      router.push(`/admin/pengguna/${id}`);
      router.refresh();
    } catch (err) {
      setError(err?.message || "Gagal menyimpan perubahan pengguna.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
        <Sidebar
          role="admin"
          activeMenu="pengguna"
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((value) => !value)}
        />

        <div className="min-w-0 flex-1">
          <Header
            title="Edit Pengguna"
            onMenuClick={() => setSidebarOpen((value) => !value)}
          />

          <main className="p-6">
            <div className="mx-auto max-w-5xl animate-pulse space-y-4">
              <div className="h-8 w-56 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-64 rounded-xl bg-white dark:bg-slate-800" />
              <div className="h-52 rounded-xl bg-white dark:bg-slate-800" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar
        role="admin"
        activeMenu="pengguna"
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((value) => !value)}
      />

      <div className="min-w-0 flex-1">
        <Header
          title="Edit Pengguna"
          onMenuClick={() => setSidebarOpen((value) => !value)}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="mb-3 text-sm font-medium text-blue-700 hover:text-blue-800 dark:text-blue-400"
              >
                ← Kembali
              </button>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Edit Pengguna
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Perbarui informasi akun dan data kepegawaian pengguna.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              >
                {error}
              </div>
            )}

            {notice && (
              <div
                role="status"
                className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                {notice}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Section
                title="Informasi Pengguna"
                description="Informasi dasar akun pengguna."
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormInput
                    label="Nama Lengkap"
                    value={form.namaLengkap}
                    onChange={(value) => updateField("namaLengkap", value)}
                    required
                    placeholder="Masukkan nama lengkap"
                  />

                  <FormInput
                    label="Nama Pengguna"
                    value={form.namaPengguna}
                    onChange={(value) => updateField("namaPengguna", value)}
                    required
                    placeholder="Masukkan nama pengguna"
                  />

                  <FormInput
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(value) => updateField("email", value)}
                    required
                    placeholder="nama@sekolah.sch.id"
                  />

                  <FormInput
                    label="Nomor Telepon"
                    value={form.noTelepon}
                    onChange={(value) => updateField("noTelepon", value)}
                    placeholder="Masukkan nomor telepon"
                  />

                  <FormSelect
                    label="Peran Pengguna"
                    value={form.peranId}
                    onChange={(value) => updateField("peranId", value)}
                    options={roleOptions}
                    placeholder="Pilih peran"
                    required
                    hint={roleHint}
                  />

                  <FormSelect
                    label="Status"
                    value={form.status}
                    onChange={(value) => updateField("status", value)}
                    options={[
                      { value: "aktif", label: "Aktif" },
                      { value: "nonaktif", label: "Nonaktif" },
                    ]}
                    required
                  />
                </div>
              </Section>

              <Section
                title="Informasi Kepegawaian"
                description="Data shift dan informasi jabatan pengguna."
              >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <FormSelect
                    label="Jadwal Kerja (shiftKerja)"
                    value={form.shiftKerja}
                    onChange={(value) => updateField("shiftKerja", value)}
                    options={SHIFT_OPTIONS}
                    placeholder="Pilih jadwal kerja"
                    hint="Jadwal kerja guru (pagi/siang) yang didukung API Pengguna."
                  />

                  <FormInput
                    label="Jabatan"
                    value={form.jabatan}
                    onChange={(value) => updateField("jabatan", value)}
                    placeholder="Masukkan jabatan"
                  />

                  <FormInput
                    label="Golongan"
                    value={form.golongan}
                    onChange={(value) => updateField("golongan", value)}
                    placeholder="Masukkan golongan"
                  />
                </div>

                <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50/70 p-4 text-xs text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300">
                  <p className="font-semibold">Catatan Master Shift & Kategori Jabatan</p>
                  <p className="mt-1 leading-5">
                    Penugasan relasi Master Shift Kerja dan Kategori Jabatan dikelola secara terpisah melalui menu Presensi &gt; Penugasan Shift menggunakan endpoint server <code>POST /api/shift-kerja/assign-user</code>.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/presensi/penugasan-shift/${id}`)}
                    className="mt-2 font-semibold text-blue-700 underline hover:text-blue-800 dark:text-blue-300"
                  >
                    Buka Penugasan Shift Pegawai &rarr;
                  </button>
                </div>
              </Section>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  disabled={saving}
                  className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
