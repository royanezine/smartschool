"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

/* =========================================================
   HELPER
========================================================= */

const normalizeGender = (value) => {
  if (!value) return "";

  const v = String(value).toLowerCase().trim();

  if (v === "l" || v === "laki-laki" || v === "laki laki") {
    return "L";
  }

  if (v === "p" || v === "perempuan") {
    return "P";
  }

  return value;
};

const formatDateForInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
};

const roleLabel = (role) => {
  if (!role) return "";

  if (role.namaTampilan) {
    return role.namaTampilan;
  }

  const labels = {
    super_admin: "Super Admin",
    admin: "Admin",
    admin_sekolah: "Admin Sekolah",
    guru: "Guru",
    siswa: "Siswa",
    yayasan: "Yayasan",
    cms: "CMS Admin",
  };

  return labels[role.nama] || role.nama || "";
};

/* =========================================================
   FORM INPUT
========================================================= */

function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  disabled = false,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
          disabled
            ? "cursor-not-allowed bg-slate-100 text-slate-500"
            : ""
        }`}
      />
    </div>
  );
}

/* =========================================================
   FORM SELECT
========================================================= */

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 ${
          disabled
            ? "cursor-not-allowed bg-slate-100 text-slate-500"
            : ""
        }`}
      >
        <option value="">Pilih {label}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function EditPenggunaPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [roleOptions, setRoleOptions] = useState([]);

  const [form, setForm] = useState({
    namaLengkap: "",
    namaPengguna: "",
    email: "",
    kataSandi: "",

    noTelepon: "",
    jabatan: "",
    nip: "",
    nipd: "",
    nuptk: "",
    nisn: "",
    nik: "",

    jenisKelamin: "",
    golongan: "",

    tempatLahir: "",
    tanggalLahir: "",

    alamat: "",
    alamatDomisili: "",

    peranId: "",
    status: "aktif",
  });

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     FETCH USER
  ========================================================= */

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/users/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const result = await response.json();

        if (response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          router.push("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            result?.message || "Gagal mengambil data pengguna"
          );
        }

        const user = result?.data;

        if (!user) {
          throw new Error("Data pengguna tidak ditemukan");
        }

        setForm({
          namaLengkap: user.namaLengkap || "",
          namaPengguna: user.namaPengguna || "",
          email: user.email || "",
          kataSandi: "",

          noTelepon: user.noTelepon || "",
          jabatan: user.jabatan || "",
          nip: user.nip || "",
          nipd: user.nipd || "",
          nuptk: user.nuptk || "",
          nisn: user.nisn || "",
          nik: user.nik || "",

          jenisKelamin: normalizeGender(user.jenisKelamin),
          golongan: user.golongan || "",

          tempatLahir: user.tempatLahir || "",
          tanggalLahir: formatDateForInput(
            user.tanggalLahir
          ),

          alamat: user.alamat || "",
          alamatDomisili: user.alamatDomisili || "",

          peranId: user.peran?.id || "",
          status: user.status || "aktif",
        });

        /* =====================================================
           ROLE SAAT INI SELALU DIMASUKKAN
        ===================================================== */

        const currentRole = user.peran;

        const initialRoles = [];

        if (currentRole?.id) {
          initialRoles.push({
            value: currentRole.id,
            label: roleLabel(currentRole),
          });
        }

        setRoleOptions(initialRoles);

        /* =====================================================
           AMBIL ROLE DARI USER LAIN
           Karena BE saat ini belum punya GET /api/roles
        ===================================================== */

        try {
          const usersResponse = await fetch(
            `${API_URL}/api/users?limit=100`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );

          if (usersResponse.ok) {
            const usersResult =
              await usersResponse.json();

            const users = Array.isArray(usersResult?.data)
              ? usersResult.data
              : Array.isArray(usersResult?.data?.data)
              ? usersResult.data.data
              : [];

            const rolesMap = new Map();

            if (currentRole?.id) {
              rolesMap.set(currentRole.id, {
                value: currentRole.id,
                label: roleLabel(currentRole),
              });
            }

            users.forEach((item) => {
              if (item?.peran?.id) {
                rolesMap.set(item.peran.id, {
                  value: item.peran.id,
                  label: roleLabel(item.peran),
                });
              }
            });

            setRoleOptions(
              Array.from(rolesMap.values())
            );
          }
        } catch (roleError) {
          console.log(
            "Role tambahan tidak berhasil diambil:",
            roleError
          );
        }
      } catch (err) {
        console.error("Fetch user error:", err);

        setError(
          err?.message ||
            "Terjadi kesalahan saat mengambil data pengguna"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, router]);

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!id) {
      setError("ID pengguna tidak ditemukan.");
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      if (!token) {
        router.push("/login");
        return;
      }

      /* =====================================================
         PAYLOAD SESUAI BACKEND
         
         Backend menggunakan:
         - namaLengkap
         - namaPengguna
         - email
         - kataSandi
         - peranId
         
         BUKAN:
         - password
         - peran
      ===================================================== */

      const payload = {
        namaLengkap: form.namaLengkap.trim(),
        namaPengguna: form.namaPengguna.trim(),
        email: form.email.trim(),

        noTelepon: form.noTelepon.trim(),
        jabatan: form.jabatan.trim(),
        nip: form.nip.trim(),
        nipd: form.nipd.trim(),
        nuptk: form.nuptk.trim(),
        nisn: form.nisn.trim(),
        nik: form.nik.trim(),

        jenisKelamin: form.jenisKelamin,
        golongan: form.golongan.trim(),

        tempatLahir: form.tempatLahir.trim(),
        tanggalLahir: form.tanggalLahir || null,

        alamat: form.alamat.trim(),
        alamatDomisili:
          form.alamatDomisili.trim(),

        peranId: form.peranId,
        status: form.status,
      };

      /* =====================================================
         PASSWORD HANYA DIKIRIM KALAU DIISI
      ===================================================== */

      if (form.kataSandi.trim()) {
        payload.kataSandi =
          form.kataSandi.trim();
      }

      /* =====================================================
         VALIDASI
      ===================================================== */

      if (!payload.namaLengkap) {
        setError("Nama lengkap wajib diisi.");
        return;
      }

      if (!payload.namaPengguna) {
        setError("Nama pengguna wajib diisi.");
        return;
      }

      if (!payload.email) {
        setError("Email wajib diisi.");
        return;
      }

      if (!payload.peranId) {
        setError("Peran pengguna wajib dipilih.");
        return;
      }

      /* =====================================================
         PUT UPDATE USER
      ===================================================== */

      const response = await fetch(
        `${API_URL}/api/users/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            "Gagal memperbarui data pengguna"
        );
      }

      setSuccess(
        result?.message ||
          "Data pengguna berhasil diperbarui."
      );

      /* =====================================================
         KEMBALI KE DETAIL
      ===================================================== */

      setTimeout(() => {
        router.push(`/admin/pengguna/${id}`);
        router.refresh();
      }, 800);
    } catch (err) {
      console.error("Update user error:", err);

      setError(
        err?.message ||
          "Terjadi kesalahan saat memperbarui pengguna."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar
          activeMenu="pengguna"
          role="admin"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header title="Edit Pengguna" />

          <main className="flex flex-1 items-center justify-center p-6">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

              <p className="text-sm font-medium text-slate-500">
                Memuat data pengguna...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        activeMenu="pengguna"
        role="admin"
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header title="Edit Pengguna" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
                      />

                      <circle
                        cx="9"
                        cy="7"
                        r="4"
                      />

                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 8v6m3-3h-6"
                      />
                    </svg>
                  </div>

                  <div>
                    <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                      Edit Pengguna
                    </h1>

                    <p className="text-sm text-slate-500">
                      Perbarui informasi pengguna
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/admin/pengguna/${id}`
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 12H5"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l-7-7 7-7"
                  />
                </svg>

                Kembali
              </button>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="mt-0.5 text-red-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 16h.01"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Gagal
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="mt-0.5 text-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                    />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-semibold text-green-700">
                    Berhasil
                  </p>

                  <p className="mt-1 text-sm text-green-600">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}

            <form onSubmit={handleSubmit}>
              {/* =================================================
                  DATA AKUN
              ================================================= */}

              <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          width="18"
                          height="11"
                          x="3"
                          y="5"
                          rx="2"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 15h.01M11 15h2"
                        />
                      </svg>
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-800">
                        Informasi Akun
                      </h2>

                      <p className="text-sm text-slate-500">
                        Informasi login dan akses pengguna
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                  <FormInput
                    label="Nama Lengkap"
                    name="namaLengkap"
                    value={form.namaLengkap}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap"
                    required
                  />

                  <FormInput
                    label="Nama Pengguna"
                    name="namaPengguna"
                    value={form.namaPengguna}
                    onChange={handleChange}
                    placeholder="Masukkan nama pengguna"
                    required
                  />

                  <FormInput
                    label="Email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="Masukkan email"
                    required
                  />

                  <FormInput
                    label="Password Baru"
                    name="kataSandi"
                    value={form.kataSandi}
                    onChange={handleChange}
                    type="password"
                    placeholder="Kosongkan jika tidak ingin mengubah password"
                  />

                  <FormSelect
                    label="Peran"
                    name="peranId"
                    value={form.peranId}
                    onChange={handleChange}
                    options={roleOptions}
                    required
                  />

                  <FormSelect
                    label="Status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    options={[
                      {
                        value: "aktif",
                        label: "Aktif",
                      },
                      {
                        value: "nonaktif",
                        label: "Nonaktif",
                      },
                    ]}
                    required
                  />
                </div>
              </div>

              {/* =================================================
                  DATA IDENTITAS
              ================================================= */}

              <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
                        />

                        <circle
                          cx="8.5"
                          cy="7"
                          r="4"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 8v6M23 11h-6"
                        />
                      </svg>
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-800">
                        Data Identitas
                      </h2>

                      <p className="text-sm text-slate-500">
                        Informasi identitas pengguna
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
                  <FormInput
                    label="NIP"
                    name="nip"
                    value={form.nip}
                    onChange={handleChange}
                    placeholder="Masukkan NIP"
                  />

                  <FormInput
                    label="NIPD"
                    name="nipd"
                    value={form.nipd}
                    onChange={handleChange}
                    placeholder="Masukkan NIPD"
                  />

                  <FormInput
                    label="NUPTK"
                    name="nuptk"
                    value={form.nuptk}
                    onChange={handleChange}
                    placeholder="Masukkan NUPTK"
                  />

                  <FormInput
                    label="NISN"
                    name="nisn"
                    value={form.nisn}
                    onChange={handleChange}
                    placeholder="Masukkan NISN"
                  />

                  <FormInput
                    label="NIK"
                    name="nik"
                    value={form.nik}
                    onChange={handleChange}
                    placeholder="Masukkan NIK"
                  />

                  <FormInput
                    label="Jabatan"
                    name="jabatan"
                    value={form.jabatan}
                    onChange={handleChange}
                    placeholder="Contoh: Guru"
                  />

                  <FormInput
                    label="Golongan"
                    name="golongan"
                    value={form.golongan}
                    onChange={handleChange}
                    placeholder="Contoh: III/a"
                  />

                  <FormSelect
                    label="Jenis Kelamin"
                    name="jenisKelamin"
                    value={form.jenisKelamin}
                    onChange={handleChange}
                    options={[
                      {
                        value: "L",
                        label: "Laki-laki",
                      },
                      {
                        value: "P",
                        label: "Perempuan",
                      },
                    ]}
                  />

                  <FormInput
                    label="No. Telepon"
                    name="noTelepon"
                    value={form.noTelepon}
                    onChange={handleChange}
                    placeholder="Contoh: 08123456789"
                  />
                </div>
              </div>

              {/* =================================================
                  DATA KELAHIRAN
              ================================================= */}

              <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          width="18"
                          height="18"
                          x="3"
                          y="3"
                          rx="2"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16 2v4M8 2v4M3 10h18"
                        />
                      </svg>
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-800">
                        Data Kelahiran
                      </h2>

                      <p className="text-sm text-slate-500">
                        Informasi tempat dan tanggal lahir
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                  <FormInput
                    label="Tempat Lahir"
                    name="tempatLahir"
                    value={form.tempatLahir}
                    onChange={handleChange}
                    placeholder="Masukkan tempat lahir"
                  />

                  <FormInput
                    label="Tanggal Lahir"
                    name="tanggalLahir"
                    value={form.tanggalLahir}
                    onChange={handleChange}
                    type="date"
                  />
                </div>
              </div>

              {/* =================================================
                  ALAMAT
              ================================================= */}

              <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1116 0z"
                        />

                        <circle
                          cx="12"
                          cy="10"
                          r="2.5"
                        />
                      </svg>
                    </div>

                    <div>
                      <h2 className="font-bold text-slate-800">
                        Alamat
                      </h2>

                      <p className="text-sm text-slate-500">
                        Informasi alamat tempat tinggal pengguna
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 p-5 sm:p-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Alamat KTP
                    </label>

                    <textarea
                      name="alamat"
                      value={form.alamat}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Masukkan alamat sesuai KTP"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700">
                      Alamat Domisili
                    </label>

                    <textarea
                      name="alamatDomisili"
                      value={form.alamatDomisili}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Masukkan alamat domisili"
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* =================================================
                  BUTTON
              ================================================= */}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/pengguna/${id}`
                    )
                  }
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>

                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 12h14"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 5l7 7-7 7"
                        />
                      </svg>

                      Simpan Perubahan
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