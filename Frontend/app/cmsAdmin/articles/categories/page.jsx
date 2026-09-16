"use client";

import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import { apiFetch } from "../../../../lib/api";

import {
  Tags,
  Plus,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Check,
  Loader2,
  FolderOpen,
  FileText,
  AlertCircle,
} from "lucide-react";

/* =========================================================
   HELPER
========================================================= */

function extractList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.data)) {
    return data.data.data;
  }

  if (Array.isArray(data?.result)) {
    return data.result;
  }

  return [];
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "").toLowerCase();

  const isActive =
    normalizedStatus === "aktif" ||
    normalizedStatus === "active";

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-md
        px-2.5
        py-1.5
        text-[11px]
        font-semibold
        ${
          isActive
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-500"
        }
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${
            isActive
              ? "bg-emerald-500"
              : "bg-slate-400"
          }
        `}
      />

      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  description,
  icon,
  iconClassName,
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-[0_1px_3px_rgba(15,23,42,0.04)]
        transition
        hover:shadow-sm
      "
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-[#0F172A]">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-lg
            ${iconClassName}
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ArticleCategoriesPage() {
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [form, setForm] = useState({
    nama: "",
    status: "aktif",
  });

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);

      const response = await apiFetch(
        "/api/v1/cms/kategori-artikel"
      );

      const data = extractList(response);

      setCategories(data);
    } catch (error) {
      console.error(
        "Gagal mengambil kategori artikel:",
        error
      );

      alert(
        error?.message ||
          "Gagal mengambil kategori artikel."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     MODAL
  ======================================================= */

  function openAddModal() {
    setEditingCategory(null);

    setForm({
      nama: "",
      status: "aktif",
    });

    setShowModal(true);
  }

  function openEditModal(category) {
    setEditingCategory(category);

    setForm({
      nama: category?.nama || "",
      status: category?.status || "aktif",
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingCategory(null);

    setForm({
      nama: "",
      status: "aktif",
    });
  }

  /* =======================================================
     FORM
  ======================================================= */

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /* =======================================================
     CREATE / UPDATE
  ======================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    const nama = form.nama.trim();

    if (!nama) {
      alert("Nama kategori wajib diisi.");
      return;
    }

    if (nama.length < 3) {
      alert(
        "Nama kategori minimal 3 karakter."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        nama,
        status: form.status,
      };

      /* UPDATE */

      if (editingCategory) {
        await apiFetch(
          `/api/v1/cms/kategori-artikel/${editingCategory.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );

        alert(
          "Kategori berhasil diperbarui."
        );
      }

      /* CREATE */

      else {
        await apiFetch(
          "/api/v1/cms/kategori-artikel",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        alert(
          "Kategori berhasil ditambahkan."
        );
      }

      closeModal();

      await loadCategories();
    } catch (error) {
      console.error(
        "Gagal menyimpan kategori:",
        error
      );

      alert(
        error?.message ||
          "Gagal menyimpan kategori."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleting(true);

      await apiFetch(
        `/api/v1/cms/kategori-artikel/${deleteTarget.id}`,
        {
          method: "DELETE",
        }
      );

      alert(
        "Kategori berhasil dihapus."
      );

      setDeleteTarget(null);

      await loadCategories();
    } catch (error) {
      console.error(
        "Gagal menghapus kategori:",
        error
      );

      alert(
        error?.message ||
          "Gagal menghapus kategori."
      );
    } finally {
      setDeleting(false);
    }
  }

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredCategories = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    if (!keyword) {
      return categories;
    }

    return categories.filter(
      (category) =>
        String(category?.nama || "")
          .toLowerCase()
          .includes(keyword)
    );
  }, [categories, search]);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const totalCategories =
    categories.length;

  const activeCategories =
    categories.filter((category) => {
      const status = String(
        category?.status || ""
      ).toLowerCase();

      return (
        status === "aktif" ||
        status === "active"
      );
    }).length;

  const inactiveCategories =
    totalCategories -
    activeCategories;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#F8FAFC]">
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar />

      {/* ===================================================
          MAIN
      =================================================== */}

      <div
        className="
          absolute
          inset-y-0
          left-[60px]
          right-0
          flex
          min-w-0
          flex-col
          overflow-hidden
          bg-[#F8FAFC]
          lg:left-[260px]
        "
      >
        <Header />

        <main className="min-h-0 flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <div
              className="
                mx-auto
                w-full
                max-w-[1440px]
                px-4
                py-5
                sm:px-6
                sm:py-6
                lg:px-8
                lg:py-7
              "
            >
              {/* =================================================
                  PAGE HEADER
              ================================================= */}

              <div className="mb-7">
                <div
                  className="
                    flex
                    flex-col
                    gap-5
                    xl:flex-row
                    xl:items-end
                    xl:justify-between
                  "
                >
                  <div className="min-w-0">
                    {/* BREADCRUMB */}

                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em]">
                      <span className="text-blue-600">
                        CMS
                      </span>

                      <span className="text-slate-300">
                        /
                      </span>

                      <span className="text-slate-400">
                        Artikel
                      </span>

                      <span className="text-slate-300">
                        /
                      </span>

                      <span className="text-slate-400">
                        Kategori
                      </span>
                    </div>

                    <h1
                      className="
                        text-[26px]
                        font-bold
                        tracking-tight
                        text-[#0F172A]
                        sm:text-[30px]
                      "
                    >
                      Kategori Artikel
                    </h1>

                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                      Kelola kategori untuk
                      mengorganisir konten artikel
                      sekolah.
                    </p>
                  </div>

                  {/* ACTION */}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={loadCategories}
                      disabled={loading}
                      className="
                        inline-flex
                        h-10
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        px-4
                        text-sm
                        font-semibold
                        text-slate-600
                        shadow-sm
                        transition
                        hover:bg-slate-50
                        hover:text-slate-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <RefreshCw
                        size={15}
                        className={
                          loading
                            ? "animate-spin"
                            : ""
                        }
                      />

                      Refresh
                    </button>

                    <button
                      type="button"
                      onClick={openAddModal}
                      className="
                        inline-flex
                        h-10
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        bg-[#2563EB]
                        px-4
                        text-sm
                        font-semibold
                        text-white
                        shadow-sm
                        transition
                        hover:bg-[#1D4ED8]
                        hover:shadow
                      "
                    >
                      <Plus size={16} />

                      Tambah Kategori
                    </button>
                  </div>
                </div>
              </div>

              {/* =================================================
                  STATISTICS
              ================================================= */}

              <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard
                  label="Total Kategori"
                  value={totalCategories}
                  description="Semua kategori artikel"
                  icon={
                    <Tags size={18} />
                  }
                  iconClassName="bg-blue-50 text-blue-600"
                />

                <StatCard
                  label="Kategori Aktif"
                  value={activeCategories}
                  description="Dapat digunakan"
                  icon={
                    <Check size={18} />
                  }
                  iconClassName="bg-emerald-50 text-emerald-600"
                />

                <StatCard
                  label="Nonaktif"
                  value={inactiveCategories}
                  description="Tidak digunakan"
                  icon={
                    <FolderOpen size={18} />
                  }
                  iconClassName="bg-slate-100 text-slate-500"
                />
              </div>

              {/* =================================================
                  CONTENT CARD
              ================================================= */}

              <div
                className="
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  shadow-[0_1px_3px_rgba(15,23,42,0.04)]
                "
              >
                {/* CONTENT HEADER */}

                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    border-b
                    border-slate-100
                    px-5
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:px-6
                  "
                >
                  <div>
                    <p className="text-sm font-bold text-[#0F172A]">
                      Daftar Kategori
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      Kelola kategori artikel
                      yang tersedia.
                    </p>
                  </div>

                  {/* SEARCH */}

                  <div className="relative w-full sm:w-[300px]">
                    <Search
                      size={16}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-slate-400
                      "
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value
                        )
                      }
                      placeholder="Cari kategori..."
                      className="
                        h-10
                        w-full
                        rounded-lg
                        border
                        border-slate-200
                        bg-white
                        pl-9
                        pr-9
                        text-sm
                        text-slate-700
                        outline-none
                        transition
                        placeholder:text-slate-400
                        hover:border-slate-300
                        focus:border-blue-500
                        focus:ring-4
                        focus:ring-blue-50
                      "
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearch("")
                        }
                        className="
                          absolute
                          right-2.5
                          top-1/2
                          flex
                          h-6
                          w-6
                          -translate-y-1/2
                          items-center
                          justify-center
                          rounded-md
                          text-slate-400
                          transition
                          hover:bg-slate-100
                          hover:text-slate-600
                        "
                        title="Hapus pencarian"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* =================================================
                    DESKTOP TABLE
                ================================================= */}

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">
                        <th
                          className="
                            w-16
                            px-5
                            py-3.5
                            text-left
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                          "
                        >
                          No
                        </th>

                        <th
                          className="
                            px-5
                            py-3.5
                            text-left
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                          "
                        >
                          Kategori
                        </th>

                        <th
                          className="
                            px-5
                            py-3.5
                            text-left
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                          "
                        >
                          Slug
                        </th>

                        <th
                          className="
                            px-5
                            py-3.5
                            text-left
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                          "
                        >
                          Status
                        </th>

                        <th
                          className="
                            px-5
                            py-3.5
                            text-right
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.12em]
                            text-slate-400
                          "
                        >
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {/* LOADING */}

                      {loading && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-5 py-16 text-center"
                          >
                            <Loader2
                              size={26}
                              className="
                                mx-auto
                                animate-spin
                                text-blue-600
                              "
                            />

                            <p className="mt-3 text-sm font-semibold text-slate-500">
                              Memuat kategori...
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Mengambil data dari
                              server
                            </p>
                          </td>
                        </tr>
                      )}

                      {/* EMPTY */}

                      {!loading &&
                        filteredCategories.length ===
                          0 && (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-5 py-16 text-center"
                            >
                              <div
                                className="
                                  mx-auto
                                  flex
                                  h-12
                                  w-12
                                  items-center
                                  justify-center
                                  rounded-xl
                                  bg-slate-100
                                  text-slate-400
                                "
                              >
                                {search ? (
                                  <Search
                                    size={21}
                                  />
                                ) : (
                                  <FolderOpen
                                    size={21}
                                  />
                                )}
                              </div>

                              <h3 className="mt-4 text-sm font-bold text-slate-600">
                                {search
                                  ? "Kategori tidak ditemukan"
                                  : "Belum ada kategori"}
                              </h3>

                              <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">
                                {search
                                  ? "Tidak ada kategori yang sesuai dengan pencarian."
                                  : "Buat kategori artikel pertama untuk mulai mengelola konten CMS."}
                              </p>

                              {!search && (
                                <button
                                  type="button"
                                  onClick={
                                    openAddModal
                                  }
                                  className="
                                    mt-5
                                    inline-flex
                                    h-10
                                    items-center
                                    gap-2
                                    rounded-lg
                                    bg-[#2563EB]
                                    px-4
                                    text-sm
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-[#1D4ED8]
                                  "
                                >
                                  <Plus
                                    size={15}
                                  />

                                  Tambah Kategori
                                </button>
                              )}
                            </td>
                          </tr>
                        )}

                      {/* DATA */}

                      {!loading &&
                        filteredCategories.map(
                          (
                            category,
                            index
                          ) => (
                            <tr
                              key={
                                category.id
                              }
                              className="
                                group
                                transition
                                hover:bg-slate-50/70
                              "
                            >
                              {/* NO */}

                              <td className="px-5 py-4 text-sm font-medium text-slate-400">
                                {index + 1}
                              </td>

                              {/* CATEGORY */}

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="
                                      flex
                                      h-9
                                      w-9
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-lg
                                      bg-blue-50
                                      text-blue-600
                                    "
                                  >
                                    <Tags
                                      size={16}
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-[#0F172A]">
                                      {
                                        category.nama
                                      }
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                      Kategori
                                      artikel
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* SLUG */}

                              <td className="px-5 py-4">
                                <span
                                  className="
                                    rounded-md
                                    bg-slate-50
                                    px-2
                                    py-1
                                    font-mono
                                    text-[11px]
                                    text-slate-500
                                  "
                                >
                                  {category.slug ||
                                    "-"}
                                </span>
                              </td>

                              {/* STATUS */}

                              <td className="px-5 py-4">
                                <StatusBadge
                                  status={
                                    category.status
                                  }
                                />
                              </td>

                              {/* ACTION */}

                              <td className="px-5 py-4">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditModal(
                                        category
                                      )
                                    }
                                    className="
                                      flex
                                      h-8
                                      w-8
                                      items-center
                                      justify-center
                                      rounded-lg
                                      border
                                      border-slate-200
                                      bg-white
                                      text-slate-500
                                      transition
                                      hover:border-blue-200
                                      hover:bg-blue-50
                                      hover:text-blue-600
                                    "
                                    title="Edit kategori"
                                  >
                                    <Pencil
                                      size={14}
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeleteTarget(
                                        category
                                      )
                                    }
                                    className="
                                      flex
                                      h-8
                                      w-8
                                      items-center
                                      justify-center
                                      rounded-lg
                                      border
                                      border-slate-200
                                      bg-white
                                      text-slate-400
                                      transition
                                      hover:border-red-200
                                      hover:bg-red-50
                                      hover:text-red-500
                                    "
                                    title="Hapus kategori"
                                  >
                                    <Trash2
                                      size={14}
                                    />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                    </tbody>
                  </table>
                </div>

                {/* =================================================
                    MOBILE
                ================================================= */}

                <div className="divide-y divide-slate-100 md:hidden">
                  {/* LOADING */}

                  {loading && (
                    <div className="px-5 py-16 text-center">
                      <Loader2
                        size={26}
                        className="
                          mx-auto
                          animate-spin
                          text-blue-600
                        "
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-500">
                        Memuat kategori...
                      </p>
                    </div>
                  )}

                  {/* EMPTY */}

                  {!loading &&
                    filteredCategories.length ===
                      0 && (
                      <div className="px-5 py-16 text-center">
                        <div
                          className="
                            mx-auto
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            bg-slate-100
                            text-slate-400
                          "
                        >
                          {search ? (
                            <Search
                              size={21}
                            />
                          ) : (
                            <FolderOpen
                              size={21}
                            />
                          )}
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-slate-600">
                          {search
                            ? "Kategori tidak ditemukan"
                            : "Belum ada kategori"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          {search
                            ? "Coba gunakan kata pencarian lain."
                            : "Belum ada kategori artikel."}
                        </p>

                        {!search && (
                          <button
                            type="button"
                            onClick={
                              openAddModal
                            }
                            className="
                              mt-5
                              inline-flex
                              h-10
                              items-center
                              gap-2
                              rounded-lg
                              bg-[#2563EB]
                              px-4
                              text-sm
                              font-semibold
                              text-white
                            "
                          >
                            <Plus
                              size={15}
                            />

                            Tambah Kategori
                          </button>
                        )}
                      </div>
                    )}

                  {/* DATA */}

                  {!loading &&
                    filteredCategories.map(
                      (
                        category,
                        index
                      ) => (
                        <div
                          key={
                            category.id
                          }
                          className="p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className="
                                  flex
                                  h-9
                                  w-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-lg
                                  bg-blue-50
                                  text-blue-600
                                "
                              >
                                <Tags
                                  size={16}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-[#0F172A]">
                                  {
                                    category.nama
                                  }
                                </p>

                                <p className="mt-0.5 text-[11px] text-slate-400">
                                  #{index + 1}
                                </p>
                              </div>
                            </div>

                            <StatusBadge
                              status={
                                category.status
                              }
                            />
                          </div>

                          <div
                            className="
                              mt-4
                              rounded-lg
                              bg-slate-50
                              px-3
                              py-2.5
                            "
                          >
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              Slug
                            </p>

                            <p className="mt-1 break-all font-mono text-[11px] text-slate-500">
                              {category.slug ||
                                "-"}
                            </p>
                          </div>

                          <div className="mt-4 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openEditModal(
                                  category
                                )
                              }
                              className="
                                inline-flex
                                h-9
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-3
                                text-xs
                                font-semibold
                                text-slate-600
                                transition
                                hover:border-blue-200
                                hover:bg-blue-50
                                hover:text-blue-600
                              "
                            >
                              <Pencil
                                size={13}
                              />

                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget(
                                  category
                                )
                              }
                              className="
                                inline-flex
                                h-9
                                items-center
                                gap-2
                                rounded-lg
                                border
                                border-slate-200
                                bg-white
                                px-3
                                text-xs
                                font-semibold
                                text-slate-600
                                transition
                                hover:border-red-200
                                hover:bg-red-50
                                hover:text-red-500
                              "
                            >
                              <Trash2
                                size={13}
                              />

                              Hapus
                            </button>
                          </div>
                        </div>
                      )
                    )}
                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                {!loading &&
                  categories.length > 0 && (
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        border-t
                        border-slate-100
                        px-5
                        py-3.5
                        text-[11px]
                        text-slate-400
                        sm:px-6
                      "
                    >
                      <FileText
                        size={13}
                      />

                      Menampilkan

                      <span className="font-semibold text-slate-500">
                        {
                          filteredCategories.length
                        }
                      </span>

                      dari

                      <span className="font-semibold text-slate-500">
                        {categories.length}
                      </span>

                      kategori
                    </div>
                  )}
              </div>

              {/* =================================================
                  PAGE FOOTER
              ================================================= */}

              <div className="mt-6 border-t border-slate-200 pt-4">
                <p className="text-[11px] text-slate-400">
                  CMS Admin • Pengelolaan Kategori
                  Artikel Sekolah
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =====================================================
          ADD / EDIT MODAL
      ===================================================== */}

      {showModal && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-slate-950/45
            p-4
            backdrop-blur-[2px]
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            className="
              w-full
              max-w-lg
              overflow-hidden
              rounded-xl
              border
              border-slate-200
              bg-white
              shadow-[0_20px_60px_rgba(15,23,42,0.18)]
            "
          >
            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                px-5
                py-4
                sm:px-6
              "
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600">
                  CMS
                </p>

                <h2 className="mt-1 text-base font-bold text-[#0F172A]">
                  {editingCategory
                    ? "Edit Kategori"
                    : "Tambah Kategori"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  {editingCategory
                    ? "Perbarui informasi kategori artikel."
                    : "Buat kategori baru untuk artikel CMS."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-600
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <X size={17} />
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>
              <div className="space-y-5 p-5 sm:p-6">
                {/* NAME */}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Nama Kategori
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    type="text"
                    name="nama"
                    value={form.nama}
                    onChange={handleChange}
                    placeholder="Contoh: Berita Sekolah"
                    autoFocus
                    disabled={saving}
                    className="
                      h-11
                      w-full
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      px-4
                      text-sm
                      font-medium
                      text-slate-700
                      outline-none
                      transition
                      placeholder:text-slate-400
                      hover:border-slate-300
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-50
                      disabled:bg-slate-50
                    "
                  />

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[11px] text-slate-400">
                      Gunakan nama yang singkat
                      dan mudah dipahami.
                    </p>

                    <span className="text-[10px] text-slate-400">
                      {form.nama.length}
                    </span>
                  </div>
                </div>

                {/* STATUS */}

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    disabled={saving}
                    className="
                      h-11
                      w-full
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      px-3
                      text-sm
                      font-medium
                      text-slate-700
                      outline-none
                      transition
                      hover:border-slate-300
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-50
                      disabled:bg-slate-50
                    "
                  >
                    <option value="aktif">
                      Aktif
                    </option>

                    <option value="nonaktif">
                      Nonaktif
                    </option>
                  </select>

                  <p className="mt-2 text-[11px] leading-5 text-slate-400">
                    Kategori aktif dapat dipilih
                    ketika membuat artikel.
                  </p>
                </div>

                {/* INFO */}

                <div
                  className="
                    flex
                    gap-3
                    rounded-lg
                    border
                    border-blue-100
                    bg-blue-50/60
                    p-4
                  "
                >
                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0 text-blue-600"
                  />

                  <div>
                    <p className="text-xs font-bold text-blue-700">
                      Informasi
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-blue-600/80">
                      Slug kategori akan dibuat
                      otomatis oleh sistem
                      berdasarkan nama kategori.
                    </p>
                  </div>
                </div>
              </div>

              {/* MODAL FOOTER */}

              <div
                className="
                  flex
                  flex-col-reverse
                  gap-2
                  border-t
                  border-slate-100
                  bg-slate-50/70
                  px-5
                  py-4
                  sm:flex-row
                  sm:justify-end
                  sm:px-6
                "
              >
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="
                    h-10
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    px-5
                    text-sm
                    font-semibold
                    text-slate-600
                    transition
                    hover:bg-slate-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    !form.nama.trim()
                  }
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-[#2563EB]
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#1D4ED8]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />

                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check size={15} />

                      {editingCategory
                        ? "Simpan Perubahan"
                        : "Simpan Kategori"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      {deleteTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
          <div
            className="
              w-full
              max-w-md
              overflow-hidden
              rounded-xl
              border
              border-slate-200
              bg-white
              shadow-[0_20px_60px_rgba(15,23,42,0.18)]
            "
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-lg
                    bg-red-50
                    text-red-500
                  "
                >
                  <Trash2 size={18} />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget(null)
                  }
                  disabled={deleting}
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-400
                    transition
                    hover:bg-slate-100
                    hover:text-slate-600
                    disabled:opacity-50
                  "
                >
                  <X size={17} />
                </button>
              </div>

              <h2 className="mt-5 text-lg font-bold tracking-tight text-[#0F172A]">
                Hapus Kategori?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Kamu yakin ingin menghapus
                kategori{" "}
                <span className="font-semibold text-slate-700">
                  "{deleteTarget.nama}"
                </span>
                ?
              </p>

              <div
                className="
                  mt-4
                  rounded-lg
                  border
                  border-amber-100
                  bg-amber-50
                  px-4
                  py-3
                "
              >
                <p className="text-[11px] leading-5 text-amber-700">
                  Pastikan kategori ini tidak
                  sedang dibutuhkan oleh artikel
                  yang sudah ada.
                </p>
              </div>
            </div>

            <div
              className="
                flex
                flex-col-reverse
                gap-2
                border-t
                border-slate-100
                bg-slate-50/70
                px-6
                py-4
                sm:flex-row
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                disabled={deleting}
                className="
                  h-10
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  px-5
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:bg-slate-50
                  disabled:opacity-50
                "
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-red-600
                  px-5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {deleting ? (
                  <>
                    <Loader2
                      size={15}
                      className="animate-spin"
                    />

                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />

                    Hapus Kategori
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}