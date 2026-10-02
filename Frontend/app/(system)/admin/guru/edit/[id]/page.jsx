"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";
import {
  Edit,
  Save,
  ArrowLeft,
  User,
  Hash,
  BookOpen,
  Mail,
  Phone,
  CheckCircle,
  ChevronDown,
  X,
} from "lucide-react";

const STORAGE_KEY = "guru_data";

const loadGuru = () => {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);

  return stored ? JSON.parse(stored) : [];
};

const saveGuru = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export default function AdminGuruEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = parseInt(params.id);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    nip: "",
    mapel: "",
    email: "",
    phone: "",
    status: "Aktif",
  });

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const data = loadGuru();
    const item = data.find((g) => g.id === id);

    if (!item) {
      setNotFound(true);
      return;
    }

    setForm({
      nama: item.nama,
      nip: item.nip,
      mapel: item.mapel,
      email: item.email || "",
      phone: item.phone || "",
      status: item.status || "Aktif",
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!form.nama.trim() || !form.nip.trim() || !form.mapel.trim()) {
      alert("Nama, NIP, dan Mata Pelajaran wajib diisi!");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const currentData = loadGuru();

      const updated = currentData.map((item) =>
        item.id === id
          ? {
              ...item,
              ...form,
            }
          : item
      );

      saveGuru(updated);
      setLoading(false);

      alert("Guru berhasil diperbarui!");
      router.push("/admin/guru");
    }, 500);
  };

  /*
   * ============================================================
   * DATA TIDAK DITEMUKAN
   * ============================================================
   */

  if (notFound) {
    return (
      <div className="flex h-screen w-full theme-page overflow-hidden">
        <Sidebar
          active="guru"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
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

          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="p-4 rounded-full theme-danger mx-auto w-20 h-20 flex items-center justify-center">
                <X
                  size={40}
                  className="text-[var(--color-danger)]"
                />
              </div>

              <h2 className="text-xl font-semibold theme-text mt-4">
                Data Tidak Ditemukan
              </h2>

              <p className="text-sm theme-text-muted mt-1">
                Guru yang Anda cari tidak tersedia.
              </p>

              <button
                onClick={() => router.push("/admin/guru")}
                className="
                  mt-4
                  px-4
                  py-2
                  theme-primary
                  rounded-lg
                  transition-colors
                "
              >
                Kembali ke Daftar Guru
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * HALAMAN UTAMA
   * ============================================================
   */

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="guru"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
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
          <div className="w-full max-w-3xl mx-auto p-4 md:p-6 lg:p-8">
            <div
              className="
                theme-card
                rounded-2xl
                border
                theme-border
                shadow-sm
                p-6
                space-y-6
              "
            >
              {/* ==================================================
                  HEADER
              ================================================== */}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => router.push("/admin/guru")}
                    className="
                      p-2
                      rounded-lg
                      theme-text-muted
                      theme-sidebar-hover
                      hover:text-[var(--color-text)]
                      transition-colors
                    "
                    title="Kembali"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <div
                    className="
                      p-2
                      rounded-xl
                      theme-warning
                      shadow-md
                    "
                  >
                    <Edit
                      size={20}
                      className="text-[var(--color-warning)]"
                    />
                  </div>

                  <div>
                    <h1 className="text-xl font-semibold theme-text">
                      Edit Guru
                    </h1>

                    <p className="text-sm theme-text-muted">
                      Perbarui data guru
                    </p>
                  </div>
                </div>

                <div
                  className="
                    text-xs
                    theme-text-muted
                    theme-card-soft
                    px-3
                    py-1
                    rounded-full
                  "
                >
                  ID: {id}
                </div>
              </div>

              {/* ==================================================
                  FORM
              ================================================== */}

              <div className="space-y-4">
                {/* NAMA */}
                <div>
                  <label className="block text-xs font-medium theme-text-muted mb-1.5">
                    Nama Lengkap{" "}
                    <span className="text-[var(--color-danger)]">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <User
                      size={17}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        theme-text-placeholder
                      "
                    />

                    <input
                      type="text"
                      name="nama"
                      value={form.nama}
                      onChange={handleChange}
                      placeholder="Contoh: Dr. Ahmad Fauzi, M.Pd."
                      className="
                        w-full
                        pl-10
                        pr-3
                        py-2.5
                        text-sm
                        theme-input
                        border
                        rounded-xl
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[var(--color-warning)]/20
                        focus:border-[var(--color-warning)]
                        transition
                      "
                    />
                  </div>
                </div>

                {/* NIP */}
                <div>
                  <label className="block text-xs font-medium theme-text-muted mb-1.5">
                    NIP{" "}
                    <span className="text-[var(--color-danger)]">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <Hash
                      size={17}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        theme-text-placeholder
                      "
                    />

                    <input
                      type="text"
                      name="nip"
                      value={form.nip}
                      onChange={handleChange}
                      placeholder="NIP guru"
                      className="
                        w-full
                        pl-10
                        pr-3
                        py-2.5
                        text-sm
                        theme-input
                        border
                        rounded-xl
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[var(--color-warning)]/20
                        focus:border-[var(--color-warning)]
                        transition
                      "
                    />
                  </div>
                </div>

                {/* MATA PELAJARAN */}
                <div>
                  <label className="block text-xs font-medium theme-text-muted mb-1.5">
                    Mata Pelajaran{" "}
                    <span className="text-[var(--color-danger)]">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <BookOpen
                      size={17}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        theme-text-placeholder
                      "
                    />

                    <input
                      type="text"
                      name="mapel"
                      value={form.mapel}
                      onChange={handleChange}
                      placeholder="Contoh: Matematika"
                      className="
                        w-full
                        pl-10
                        pr-3
                        py-2.5
                        text-sm
                        theme-input
                        border
                        rounded-xl
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[var(--color-warning)]/20
                        focus:border-[var(--color-warning)]
                        transition
                      "
                    />
                  </div>
                </div>

                {/* EMAIL + TELEPON */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* EMAIL */}
                  <div>
                    <label className="block text-xs font-medium theme-text-muted mb-1.5">
                      Email
                    </label>

                    <div className="relative">
                      <Mail
                        size={17}
                        className="
                          absolute
                          left-3
                          top-1/2
                          -translate-y-1/2
                          theme-text-placeholder
                        "
                      />

                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="email@guru.com"
                        className="
                          w-full
                          pl-10
                          pr-3
                          py-2.5
                          text-sm
                          theme-input
                          border
                          rounded-xl
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[var(--color-warning)]/20
                          focus:border-[var(--color-warning)]
                          transition
                        "
                      />
                    </div>
                  </div>

                  {/* TELEPON */}
                  <div>
                    <label className="block text-xs font-medium theme-text-muted mb-1.5">
                      Telepon
                    </label>

                    <div className="relative">
                      <Phone
                        size={17}
                        className="
                          absolute
                          left-3
                          top-1/2
                          -translate-y-1/2
                          theme-text-placeholder
                        "
                      />

                      <input
                        type="text"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="081234567890"
                        className="
                          w-full
                          pl-10
                          pr-3
                          py-2.5
                          text-sm
                          theme-input
                          border
                          rounded-xl
                          focus:outline-none
                          focus:ring-2
                          focus:ring-[var(--color-warning)]/20
                          focus:border-[var(--color-warning)]
                          transition
                        "
                      />
                    </div>
                  </div>
                </div>

                {/* STATUS */}
                <div>
                  <label className="block text-xs font-medium theme-text-muted mb-1.5">
                    Status
                  </label>

                  <div className="relative">
                    <CheckCircle
                      size={17}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        theme-text-placeholder
                      "
                    />

                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="
                        w-full
                        pl-10
                        pr-10
                        py-2.5
                        text-sm
                        theme-input
                        border
                        rounded-xl
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[var(--color-warning)]/20
                        focus:border-[var(--color-warning)]
                        transition
                        cursor-pointer
                        appearance-none
                      "
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>

                    <ChevronDown
                      size={17}
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        theme-text-placeholder
                        pointer-events-none
                      "
                    />
                  </div>
                </div>

                {/* ==================================================
                    BUTTON
                ================================================== */}

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    pt-4
                    border-t
                    theme-border
                  "
                >
                  {/* BATAL */}
                  <button
                    onClick={() => router.push("/admin/guru")}
                    className="
                      flex-1
                      py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      theme-card
                      theme-border
                      border
                      theme-text-secondary
                      theme-sidebar-hover
                      transition-colors
                    "
                  >
                    Batal
                  </button>

                  {/* PERBARUI */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="
                      flex-1
                      py-2.5
                      rounded-xl
                      text-sm
                      font-medium
                      theme-warning
                      hover:shadow-lg
                      transition-all
                      shadow-sm
                      flex
                      items-center
                      justify-center
                      gap-2
                      disabled:opacity-60
                    "
                  >
                    {loading ? (
                      <span
                        className="
                          animate-spin
                          rounded-full
                          h-4
                          w-4
                          border-2
                          border-[var(--color-warning)]
                          border-t-transparent
                        "
                      />
                    ) : (
                      <>
                        <Save size={17} />
                        Perbarui
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}