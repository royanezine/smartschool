"use client";

import { useEffect, useMemo, useState } from "react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";
import { apiFetch } from "../../../../../../lib/api";

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
  const normalizedStatus = String(
    status || ""
  ).toLowerCase();

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
            ? "theme-success"
            : "theme-card theme-text-muted theme-border border"
        }
      `}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          backgroundColor: isActive
            ? "var(--color-success)"
            : "var(--color-text-muted)",
        }}
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
        theme-card
        theme-border
        rounded-xl
        border
        p-5
        shadow-[0_1px_3px_rgba(15,23,42,0.04)]
        transition
        hover:shadow-sm
      "
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="theme-text-muted text-[10px] font-bold uppercase tracking-[0.14em]">
            {label}
          </p>

          <p className="theme-text mt-2 text-2xl font-bold tracking-tight">
            {value}
          </p>

          <p className="theme-text-muted mt-1 text-xs">
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
        "/api/cms/kategori-artikel"
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
          `/api/cms/kategori-artikel/${editingCategory.id}`,
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
          "/api/cms/kategori-artikel",
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
        `/api/cms/kategori-artikel/${deleteTarget.id}`,
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
    <div className="theme-page fixed inset-0 overflow-hidden">
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <Sidebar />

      {/* ===================================================
          MAIN
      =================================================== */}

      <div
        className="
          theme-page
          absolute
          inset-y-0
          left-[60px]
          right-0
          flex
          min-w-0
          flex-col
          overflow-hidden
          lg:left-[260px]
        "
      >
        <Header />

        <main className="theme-page min-h-0 flex-1 overflow-hidden">
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
                      <span
                        style={{
                          color:
                            "var(--color-primary)",
                        }}
                      >
                        CMS
                      </span>

                      <span className="theme-text-placeholder">
                        /
                      </span>

                      <span className="theme-text-muted">
                        Artikel
                      </span>

                      <span className="theme-text-placeholder">
                        /
                      </span>

                      <span className="theme-text-muted">
                        Kategori
                      </span>
                    </div>

                    <h1
                      className="
                        theme-text
                        text-[26px]
                        font-bold
                        tracking-tight
                        sm:text-[30px]
                      "
                    >
                      Kategori Artikel
                    </h1>

                    <p className="theme-text-muted mt-1.5 max-w-2xl text-sm leading-6">
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
                        theme-card
                        theme-border
                        theme-text-secondary
                        inline-flex
                        h-10
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        border
                        px-4
                        text-sm
                        font-semibold
                        shadow-sm
                        transition
                        hover:opacity-80
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
                        theme-primary
                        inline-flex
                        h-10
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        px-4
                        text-sm
                        font-semibold
                        shadow-sm
                        transition
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
                  icon={<Tags size={18} />}
                  iconClassName="theme-info"
                />

                <StatCard
                  label="Kategori Aktif"
                  value={activeCategories}
                  description="Dapat digunakan"
                  icon={<Check size={18} />}
                  iconClassName="theme-success"
                />

                <StatCard
                  label="Nonaktif"
                  value={inactiveCategories}
                  description="Tidak digunakan"
                  icon={<FolderOpen size={18} />}
                  iconClassName="theme-card theme-text-muted"
                />
              </div>

              {/* =================================================
                  CONTENT CARD
              ================================================= */}

              <div
                className="
                  theme-card
                  theme-border
                  overflow-hidden
                  rounded-xl
                  border
                  shadow-[0_1px_3px_rgba(15,23,42,0.04)]
                "
              >
                {/* CONTENT HEADER */}

                <div
                  className="
                    theme-border-soft
                    flex
                    flex-col
                    gap-4
                    border-b
                    px-5
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:px-6
                  "
                >
                  <div>
                    <p className="theme-text text-sm font-bold">
                      Daftar Kategori
                    </p>

                    <p className="theme-text-muted mt-0.5 text-xs">
                      Kelola kategori artikel
                      yang tersedia.
                    </p>
                  </div>

                  {/* SEARCH */}

                  <div className="relative w-full sm:w-[300px]">
                    <Search
                      size={16}
                      className="
                        theme-text-muted
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
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
                        theme-input
                        h-10
                        w-full
                        rounded-lg
                        border
                        pl-9
                        pr-9
                        text-sm
                        outline-none
                        transition
                        focus:border-[var(--color-primary)]
                      "
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() =>
                          setSearch("")
                        }
                        className="
                          theme-text-muted
                          theme-header-hover
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
                          transition
                          hover:opacity-80
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
                      <tr className="theme-table-header theme-border-soft border-b">
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
                          "
                        >
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--color-border-soft)]">
                      {/* LOADING */}

                      {loading && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-5 py-16 text-center"
                          >
                            <Loader2
                              size={26}
                              className="mx-auto animate-spin"
                              style={{
                                color:
                                  "var(--color-primary)",
                              }}
                            />

                            <p className="theme-text-secondary mt-3 text-sm font-semibold">
                              Memuat kategori...
                            </p>

                            <p className="theme-text-muted mt-1 text-xs">
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
                                  theme-card-soft
                                  theme-text-muted
                                  mx-auto
                                  flex
                                  h-12
                                  w-12
                                  items-center
                                  justify-center
                                  rounded-xl
                                  border
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

                              <h3 className="theme-text-secondary mt-4 text-sm font-bold">
                                {search
                                  ? "Kategori tidak ditemukan"
                                  : "Belum ada kategori"}
                              </h3>

                              <p className="theme-text-muted mx-auto mt-1 max-w-md text-sm">
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
                                    theme-primary
                                    mt-5
                                    inline-flex
                                    h-10
                                    items-center
                                    gap-2
                                    rounded-lg
                                    px-4
                                    text-sm
                                    font-semibold
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
                                theme-table-hover
                                group
                                transition
                              "
                            >
                              {/* NO */}

                              <td className="theme-text-muted px-5 py-4 text-sm font-medium">
                                {index + 1}
                              </td>

                              {/* CATEGORY */}

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="
                                      theme-info
                                      flex
                                      h-9
                                      w-9
                                      shrink-0
                                      items-center
                                      justify-center
                                      rounded-lg
                                      border
                                    "
                                  >
                                    <Tags
                                      size={16}
                                    />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="theme-text truncate text-sm font-semibold">
                                      {
                                        category.nama
                                      }
                                    </p>

                                    <p className="theme-text-muted mt-0.5 text-[11px]">
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
                                    theme-card-soft
                                    theme-text-muted
                                    inline-block
                                    rounded-md
                                    border
                                    px-2
                                    py-1
                                    font-mono
                                    text-[11px]
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
                                      theme-card
                                      theme-border
                                      theme-text-muted
                                      flex
                                      h-8
                                      w-8
                                      items-center
                                      justify-center
                                      rounded-lg
                                      border
                                      transition
                                      hover:opacity-80
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
                                      theme-card
                                      theme-border
                                      theme-text-muted
                                      flex
                                      h-8
                                      w-8
                                      items-center
                                      justify-center
                                      rounded-lg
                                      border
                                      transition
                                      hover:opacity-80
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

                <div className="divide-y divide-[var(--color-border-soft)] md:hidden">
                  {/* LOADING */}

                  {loading && (
                    <div className="px-5 py-16 text-center">
                      <Loader2
                        size={26}
                        className="mx-auto animate-spin"
                        style={{
                          color:
                            "var(--color-primary)",
                        }}
                      />

                      <p className="theme-text-secondary mt-3 text-sm font-semibold">
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
                            theme-card-soft
                            theme-text-muted
                            mx-auto
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-xl
                            border
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

                        <h3 className="theme-text-secondary mt-4 text-sm font-bold">
                          {search
                            ? "Kategori tidak ditemukan"
                            : "Belum ada kategori"}
                        </h3>

                        <p className="theme-text-muted mt-1 text-sm">
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
                              theme-primary
                              mt-5
                              inline-flex
                              h-10
                              items-center
                              gap-2
                              rounded-lg
                              px-4
                              text-sm
                              font-semibold
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
                                  theme-info
                                  flex
                                  h-9
                                  w-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-lg
                                  border
                                "
                              >
                                <Tags
                                  size={16}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="theme-text truncate text-sm font-bold">
                                  {
                                    category.nama
                                  }
                                </p>

                                <p className="theme-text-muted mt-0.5 text-[11px]">
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
                              theme-card-soft
                              theme-border
                              mt-4
                              rounded-lg
                              border
                              px-3
                              py-2.5
                            "
                          >
                            <p className="theme-text-muted text-[9px] font-bold uppercase tracking-[0.12em]">
                              Slug
                            </p>

                            <p className="theme-text-secondary mt-1 break-all font-mono text-[11px]">
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
                                theme-card
                                theme-border
                                theme-text-secondary
                                inline-flex
                                h-9
                                items-center
                                gap-2
                                rounded-lg
                                border
                                px-3
                                text-xs
                                font-semibold
                                transition
                                hover:opacity-80
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
                                theme-card
                                theme-border
                                theme-text-secondary
                                inline-flex
                                h-9
                                items-center
                                gap-2
                                rounded-lg
                                border
                                px-3
                                text-xs
                                font-semibold
                                transition
                                hover:opacity-80
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
                        theme-border-soft
                        theme-text-muted
                        flex
                        items-center
                        gap-2
                        border-t
                        px-5
                        py-3.5
                        text-[11px]
                        sm:px-6
                      "
                    >
                      <FileText size={13} />

                      Menampilkan

                      <span className="theme-text-secondary font-semibold">
                        {
                          filteredCategories.length
                        }
                      </span>

                      dari

                      <span className="theme-text-secondary font-semibold">
                        {categories.length}
                      </span>

                      kategori
                    </div>
                  )}
              </div>

              {/* =================================================
                  PAGE FOOTER
              ================================================= */}

              <div className="theme-border mt-6 border-t pt-4">
                <p className="theme-text-muted text-[11px]">
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
              theme-card
              theme-border
              w-full
              max-w-lg
              overflow-hidden
              rounded-xl
              border
              shadow-[0_20px_60px_rgba(15,23,42,0.18)]
            "
          >
            {/* MODAL HEADER */}

            <div
              className="
                theme-border-soft
                flex
                items-center
                justify-between
                border-b
                px-5
                py-4
                sm:px-6
              "
            >
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={{
                    color:
                      "var(--color-primary)",
                  }}
                >
                  CMS
                </p>

                <h2 className="theme-text mt-1 text-base font-bold">
                  {editingCategory
                    ? "Edit Kategori"
                    : "Tambah Kategori"}
                </h2>

                <p className="theme-text-muted mt-0.5 text-xs">
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
                  theme-text-muted
                  theme-header-hover
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  transition
                  hover:opacity-80
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
                  <label className="theme-text-secondary mb-2 block text-xs font-bold uppercase tracking-wide">
                    Nama Kategori
                    <span
                      className="ml-1"
                      style={{
                        color:
                          "var(--color-danger)",
                      }}
                    >
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
                      theme-input
                      h-11
                      w-full
                      rounded-lg
                      border
                      px-4
                      text-sm
                      font-medium
                      outline-none
                      transition
                      focus:border-[var(--color-primary)]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  />

                  <div className="mt-2 flex items-center justify-between">
                    <p className="theme-text-muted text-[11px]">
                      Gunakan nama yang singkat
                      dan mudah dipahami.
                    </p>

                    <span className="theme-text-muted text-[10px]">
                      {form.nama.length}
                    </span>
                  </div>
                </div>

                {/* STATUS */}

                <div>
                  <label className="theme-text-secondary mb-2 block text-xs font-bold uppercase tracking-wide">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    disabled={saving}
                    className="
                      theme-input
                      h-11
                      w-full
                      rounded-lg
                      border
                      px-3
                      text-sm
                      font-medium
                      outline-none
                      transition
                      focus:border-[var(--color-primary)]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    <option value="aktif">
                      Aktif
                    </option>

                    <option value="nonaktif">
                      Nonaktif
                    </option>
                  </select>

                  <p className="theme-text-muted mt-2 text-[11px] leading-5">
                    Kategori aktif dapat dipilih
                    ketika membuat artikel.
                  </p>
                </div>

                {/* INFO */}

                <div className="theme-info flex gap-3 rounded-lg border p-4">
                  <AlertCircle
                    size={16}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="text-xs font-bold">
                      Informasi
                    </p>

                    <p className="mt-1 text-[11px] leading-5 opacity-80">
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
                  theme-card-soft
                  theme-border-soft
                  flex
                  flex-col-reverse
                  gap-2
                  border-t
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
                    theme-card
                    theme-border
                    theme-text-secondary
                    h-10
                    rounded-lg
                    border
                    px-5
                    text-sm
                    font-semibold
                    transition
                    hover:opacity-80
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
                    theme-primary
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    px-5
                    text-sm
                    font-semibold
                    shadow-sm
                    transition
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
              theme-card
              theme-border
              w-full
              max-w-md
              overflow-hidden
              rounded-xl
              border
              shadow-[0_20px_60px_rgba(15,23,42,0.18)]
            "
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="theme-danger flex h-10 w-10 items-center justify-center rounded-lg">
                  <Trash2 size={18} />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setDeleteTarget(null)
                  }
                  disabled={deleting}
                  className="
                    theme-text-muted
                    theme-header-hover
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    transition
                    hover:opacity-80
                    disabled:opacity-50
                  "
                >
                  <X size={17} />
                </button>
              </div>

              <h2 className="theme-text mt-5 text-lg font-bold tracking-tight">
                Hapus Kategori?
              </h2>

              <p className="theme-text-secondary mt-2 text-sm leading-6">
                Kamu yakin ingin menghapus
                kategori{" "}
                <span className="theme-text font-semibold">
                  "{deleteTarget.nama}"
                </span>
                ?
              </p>

              <div className="theme-warning mt-4 rounded-lg border px-4 py-3">
                <p className="text-[11px] leading-5">
                  Pastikan kategori ini tidak
                  sedang dibutuhkan oleh artikel
                  yang sudah ada.
                </p>
              </div>
            </div>

            <div
              className="
                theme-card-soft
                theme-border-soft
                flex
                flex-col-reverse
                gap-2
                border-t
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
                  theme-card
                  theme-border
                  theme-text-secondary
                  h-10
                  rounded-lg
                  border
                  px-5
                  text-sm
                  font-semibold
                  transition
                  hover:opacity-80
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
                  theme-danger
                  inline-flex
                  h-10
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  px-5
                  text-sm
                  font-semibold
                  transition
                  hover:opacity-80
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