"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  ArrowLeft,
  UserCheck,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Hash,
  Phone,
  Mail,
  Users,
  School,
  Info,
} from "lucide-react";

/**
 * app/admin/guru/wali-kelas/tambah/page.jsx
 *
 * Halaman Tambah Wali Kelas — form satu halaman (bukan modal), konsisten
 * dengan pola halaman tambah Mapel & Jadwal Mengajar. Submit saat ini
 * hanya console.log + redirect, tinggal sambungkan ke endpoint backend
 * (misalnya createWaliKelas) begitu tersedia.
 */

const JENJANG_LIST = ["VII", "VIII", "IX"];

const EMPTY_FORM = {
  kelas: "",
  jenjang: "VII",
  waliKelas: "",
  nip: "",
  telp: "",
  email: "",
  jumlahSiswa: "",
  tahunAjaran: "2025/2026",
};

function getInitials(nama) {
  return nama
    .replace(/,.*/, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function TambahWaliKelasPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.kelas.trim() || !form.waliKelas.trim() || !form.nip.trim()) {
      setError("Kelas, nama wali kelas, dan NIP wajib diisi.");
      return;
    }

    const payload = {
      kelas: form.kelas.trim(),
      jenjang: form.jenjang,
      waliKelas: form.waliKelas.trim(),
      nip: form.nip.trim(),
      telp: form.telp.trim() || "-",
      email: form.email.trim() || "-",
      jumlahSiswa: Number(form.jumlahSiswa) || 0,
      tahunAjaran: form.tahunAjaran.trim() || "2025/2026",
      status: "aktif",
    };

    try {
      setSaving(true);
      setError("");

      // TODO: ganti dengan panggilan API sesungguhnya, contoh:
      // const response = await createWaliKelas(payload);
      console.log("Simpan wali kelas:", payload);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuccess(true);

      setTimeout(() => {
        router.push("/admin/guru/wali-kelas");
      }, 900);
    } catch (err) {
      console.error("Error create wali kelas:", err);
      setError(err?.message || "Gagal menambahkan wali kelas.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="guruWaliKelas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* HEADER */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/guru/wali-kelas")}
                className="
                  p-2.5 rounded-xl
                  theme-card theme-border theme-text-muted
                  theme-header-hover
                  transition-colors shrink-0
                "
                title="Kembali ke daftar wali kelas"
              >
                <ArrowLeft size={20} />
              </button>

              <div
                className="
                  p-2.5 rounded-xl
                  bg-[image:var(--color-brand-logo-bg)]
                  text-white
                  shadow-lg
                  shrink-0
                "
              >
                <UserCheck size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Tambah Wali Kelas
                </h1>

                <p className="text-sm theme-text-muted">
                  Tugaskan seorang guru sebagai wali kelas untuk kelas tertentu.
                </p>
              </div>
            </div>

            {/* SUCCESS */}
            {success && (
              <div className="flex items-center gap-3 p-4 rounded-xl theme-success">
                <CheckCircle2
                  size={20}
                  className="shrink-0"
                />

                <p className="text-sm font-medium">
                  Wali kelas berhasil ditambahkan. Mengalihkan...
                </p>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl theme-danger">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    Gagal menambahkan wali kelas
                  </p>

                  <p className="text-sm mt-1">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* KONTEN: FORM + PANEL PRATINJAU */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="
                  lg:col-span-2
                  theme-card
                  rounded-xl
                  border
                  shadow-sm
                  overflow-hidden
                "
              >
                <div
                  className="
                    px-6 py-4
                    border-b
                    theme-border-soft
                    theme-card-soft
                  "
                >
                  <h2 className="text-sm font-semibold theme-text-secondary">
                    Kelas & Wali Kelas
                  </h2>

                  <p className="text-xs theme-text-muted mt-0.5">
                    Isi data kelas dan guru yang akan ditugaskan.
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* KELAS */}
                    <div>
                      <label
                        htmlFor="kelas"
                        className="
                          flex items-center gap-1.5
                          text-sm font-medium
                          theme-text-secondary
                          mb-1.5
                        "
                      >
                        <School
                          size={14}
                          className="theme-text-muted"
                        />

                        Kelas

                        <span className="text-[var(--color-danger)]">
                          *
                        </span>
                      </label>

                      <input
                        id="kelas"
                        type="text"
                        value={form.kelas}
                        onChange={handleChange("kelas")}
                        placeholder="Contoh: 7C"
                        disabled={saving}
                        className="
                          w-full px-3.5 py-2.5 text-sm rounded-lg
                          theme-input
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[var(--color-primary)]
                          focus:ring-opacity-25
                          focus:border-[var(--color-primary)]
                          disabled:opacity-60
                        "
                      />
                    </div>

                    {/* JENJANG */}
                    <div>
                      <label
                        htmlFor="jenjang"
                        className="
                          flex items-center gap-1.5
                          text-sm font-medium
                          theme-text-secondary
                          mb-1.5
                        "
                      >
                        <School
                          size={14}
                          className="theme-text-muted"
                        />

                        Jenjang
                      </label>

                      <select
                        id="jenjang"
                        value={form.jenjang}
                        onChange={handleChange("jenjang")}
                        disabled={saving}
                        className="
                          w-full px-3.5 py-2.5 text-sm rounded-lg
                          theme-input
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[var(--color-primary)]
                          focus:ring-opacity-25
                          focus:border-[var(--color-primary)]
                          disabled:opacity-60
                        "
                      >
                        {JENJANG_LIST.map((j) => (
                          <option key={j} value={j}>
                            Kelas {j}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* NAMA WALI KELAS */}
                  <div>
                    <label
                      htmlFor="waliKelas"
                      className="
                        flex items-center gap-1.5
                        text-sm font-medium
                        theme-text-secondary
                        mb-1.5
                      "
                    >
                      <User
                        size={14}
                        className="theme-text-muted"
                      />

                      Nama Wali Kelas

                      <span className="text-[var(--color-danger)]">
                        *
                      </span>
                    </label>

                    <input
                      id="waliKelas"
                      type="text"
                      value={form.waliKelas}
                      onChange={handleChange("waliKelas")}
                      placeholder="Contoh: Rina Marlina, S.Pd"
                      disabled={saving}
                      className="
                        w-full px-3.5 py-2.5 text-sm rounded-lg
                        theme-input
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[var(--color-primary)]
                        focus:ring-opacity-25
                        focus:border-[var(--color-primary)]
                        disabled:opacity-60
                      "
                    />
                  </div>

                  {/* NIP */}
                  <div>
                    <label
                      htmlFor="nip"
                      className="
                        flex items-center gap-1.5
                        text-sm font-medium
                        theme-text-secondary
                        mb-1.5
                      "
                    >
                      <Hash
                        size={14}
                        className="theme-text-muted"
                      />

                      NIP

                      <span className="text-[var(--color-danger)]">
                        *
                      </span>
                    </label>

                    <input
                      id="nip"
                      type="text"
                      value={form.nip}
                      onChange={handleChange("nip")}
                      placeholder="Contoh: 199001012015011001"
                      disabled={saving}
                      className="
                        w-full px-3.5 py-2.5 text-sm rounded-lg
                        theme-input
                        font-mono
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[var(--color-primary)]
                        focus:ring-opacity-25
                        focus:border-[var(--color-primary)]
                        disabled:opacity-60
                      "
                    />
                  </div>
                </div>

                <div
                  className="
                    px-6 py-4
                    border-t border-b
                    theme-border-soft
                    theme-card-soft
                  "
                >
                  <h2 className="text-sm font-semibold theme-text-secondary">
                    Kontak & Data Tambahan
                  </h2>

                  <p className="text-xs theme-text-muted mt-0.5">
                    Opsional, tapi disarankan diisi untuk memudahkan komunikasi.
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* TELEPON */}
                    <div>
                      <label
                        htmlFor="telp"
                        className="
                          flex items-center gap-1.5
                          text-sm font-medium
                          theme-text-secondary
                          mb-1.5
                        "
                      >
                        <Phone
                          size={14}
                          className="theme-text-muted"
                        />

                        No. Telepon
                      </label>

                      <input
                        id="telp"
                        type="text"
                        value={form.telp}
                        onChange={handleChange("telp")}
                        placeholder="0812-xxxx-xxxx"
                        disabled={saving}
                        className="
                          w-full px-3.5 py-2.5 text-sm rounded-lg
                          theme-input
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[var(--color-primary)]
                          focus:ring-opacity-25
                          focus:border-[var(--color-primary)]
                          disabled:opacity-60
                        "
                      />
                    </div>

                    {/* JUMLAH SISWA */}
                    <div>
                      <label
                        htmlFor="jumlahSiswa"
                        className="
                          flex items-center gap-1.5
                          text-sm font-medium
                          theme-text-secondary
                          mb-1.5
                        "
                      >
                        <Users
                          size={14}
                          className="theme-text-muted"
                        />

                        Jumlah Siswa
                      </label>

                      <input
                        id="jumlahSiswa"
                        type="number"
                        min="0"
                        value={form.jumlahSiswa}
                        onChange={handleChange("jumlahSiswa")}
                        placeholder="0"
                        disabled={saving}
                        className="
                          w-full px-3.5 py-2.5 text-sm rounded-lg
                          theme-input
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[var(--color-primary)]
                          focus:ring-opacity-25
                          focus:border-[var(--color-primary)]
                          disabled:opacity-60
                        "
                      />
                    </div>
                  </div>

                  {/* EMAIL */}
                  <div>
                    <label
                      htmlFor="email"
                      className="
                        flex items-center gap-1.5
                        text-sm font-medium
                        theme-text-secondary
                        mb-1.5
                      "
                    >
                      <Mail
                        size={14}
                        className="theme-text-muted"
                      />

                      Email
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="nama@smartschool.sch.id"
                      disabled={saving}
                      className="
                        w-full px-3.5 py-2.5 text-sm rounded-lg
                        theme-input
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[var(--color-primary)]
                        focus:ring-opacity-25
                        focus:border-[var(--color-primary)]
                        disabled:opacity-60
                      "
                    />
                  </div>

                  {/* TAHUN AJARAN */}
                  <div>
                    <label
                      htmlFor="tahunAjaran"
                      className="
                        flex items-center gap-1.5
                        text-sm font-medium
                        theme-text-secondary
                        mb-1.5
                      "
                    >
                      <School
                        size={14}
                        className="theme-text-muted"
                      />

                      Tahun Ajaran
                    </label>

                    <input
                      id="tahunAjaran"
                      type="text"
                      value={form.tahunAjaran}
                      onChange={handleChange("tahunAjaran")}
                      placeholder="2025/2026"
                      disabled={saving}
                      className="
                        w-full px-3.5 py-2.5 text-sm rounded-lg
                        theme-input
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[var(--color-primary)]
                        focus:ring-opacity-25
                        focus:border-[var(--color-primary)]
                        disabled:opacity-60
                      "
                    />
                  </div>
                </div>

                {/* ACTIONS */}
                <div
                  className="
                    flex items-center gap-3
                    px-6 py-4
                    border-t
                    theme-border-soft
                    theme-card-soft
                  "
                >
                  <button
                    type="submit"
                    disabled={saving}
                    className="
                      flex items-center gap-2
                      px-5 py-2.5
                      theme-primary
                      rounded-xl
                      transition-all
                      shadow-sm
                      font-medium
                      text-sm
                      disabled:opacity-60
                      disabled:cursor-not-allowed
                    "
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Simpan Wali Kelas
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/admin/guru/wali-kelas")
                    }
                    disabled={saving}
                    className="
                      px-5 py-2.5
                      rounded-xl
                      border
                      theme-border
                      theme-text-secondary
                      theme-header-hover
                      transition-all
                      font-medium
                      text-sm
                      disabled:opacity-60
                    "
                  >
                    Batal
                  </button>
                </div>
              </form>

              {/* PANEL KANAN: PREVIEW + TIPS */}
              <div className="space-y-6">
                {/* PREVIEW CARD */}
                <div
                  className="
                    theme-card
                    rounded-xl
                    border
                    shadow-sm
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      px-5 py-4
                      border-b
                      theme-border-soft
                      theme-card-soft
                    "
                  >
                    <h2 className="text-sm font-semibold theme-text-secondary">
                      Pratinjau
                    </h2>

                    <p className="text-xs theme-text-muted mt-0.5">
                      Tampilan data ini di daftar wali kelas.
                    </p>
                  </div>

                  <div
                    className="
                      bg-[image:var(--color-brand-logo-bg)]
                      px-5 py-5
                      flex items-center gap-3
                    "
                  >
                    <div
                      className="
                        w-12 h-12 rounded-full
                        flex items-center justify-center
                        font-bold text-sm shrink-0
                        bg-[color:color-mix(in_srgb,var(--color-card)_20%,transparent)]
                        text-[var(--color-card)]
                      "
                    >
                      {form.waliKelas.trim()
                        ? getInitials(form.waliKelas)
                        : "WK"}
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          text-xs
                          text-[color:color-mix(in_srgb,var(--color-card)_80%,transparent)]
                        "
                      >
                        Wali Kelas {form.kelas.trim() || "-"}
                      </p>

                      <p className="font-bold text-[var(--color-card)] text-sm leading-tight truncate">
                        {form.waliKelas.trim() || "Nama wali kelas"}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">
                        NIP
                      </span>

                      <span className="font-mono text-xs theme-text-secondary">
                        {form.nip.trim() || "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">
                        Jenjang
                      </span>

                      <span className="theme-text-secondary font-medium">
                        Kelas {form.jenjang}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">
                        Jumlah Siswa
                      </span>

                      <span className="theme-text-secondary font-medium">
                        {form.jumlahSiswa || 0} siswa
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">
                        Tahun Ajaran
                      </span>

                      <span className="theme-text-secondary font-medium">
                        {form.tahunAjaran.trim() || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* TIPS / INFO */}
                <div className="theme-info rounded-xl border p-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Info
                      size={16}
                      className="shrink-0"
                    />

                    <h2 className="text-sm font-semibold">
                      Tips Pengisian
                    </h2>
                  </div>

                  <ul
                    className="
                      space-y-2
                      text-xs
                      theme-text-secondary
                      list-disc
                      list-inside
                    "
                  >
                    <li>
                      Pastikan satu kelas hanya punya satu wali kelas aktif.
                    </li>

                    <li>
                      NIP diisi lengkap tanpa spasi agar mudah dicari.
                    </li>

                    <li>
                      Wali kelas baru otomatis berstatus "Aktif".
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}