"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  Plus,
  Trash2,
  Pencil,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  GripVertical,
  ArrowLeft,
  Info,
} from "lucide-react";

export default function MenuHeaderPage() {
  const router = useRouter();

  // =========================
  // SIDEBAR
  // =========================
  const [active, setActive] = useState("menu");
  const [collapsed, setCollapsed] = useState(false);

  // =========================
  // MENU DATA
  // =========================
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      label: "Beranda",
      url: "/",
      order: 1,
    },
    {
      id: 2,
      label: "Profil",
      url: "/profil",
      order: 2,
    },
    {
      id: 3,
      label: "Galeri",
      url: "/galeri",
      order: 3,
    },
    {
      id: 4,
      label: "Kontak",
      url: "/kontak",
      order: 4,
    },
  ]);

  // =========================
  // DELETE
  // =========================
  const handleDelete = (id) => {
    if (
      !confirm(
        "Yakin ingin menghapus menu header ini? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      return;
    }

    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  // =========================
  // MOVE MENU
  // =========================
  const handleMove = (id, direction) => {
    setMenuItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);

      if (index === -1) return prev;

      if (direction === "up" && index === 0) {
        return prev;
      }

      if (direction === "down" && index === prev.length - 1) {
        return prev;
      }

      const newItems = [...prev];

      const swapIndex =
        direction === "up" ? index - 1 : index + 1;

      [newItems[index], newItems[swapIndex]] = [
        newItems[swapIndex],
        newItems[index],
      ];

      return newItems.map((item, itemIndex) => ({
        ...item,
        order: itemIndex + 1,
      }));
    });
  };

  // =========================
  // EMPTY STATE
  // =========================
  if (menuItems.length === 0) {
    return (
      <div className="theme-page flex min-h-screen w-full overflow-x-hidden">
        {/* SIDEBAR */}
        <div className="shrink-0">
          <Sidebar
            active={active}
            setActive={setActive}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </div>

        {/* MAIN */}
        <main
          className="
            theme-page
            flex-1
            min-w-0
            w-full
            overflow-x-hidden
            overflow-y-auto
            transition-all
            duration-300
          "
        >
          <Header
            title="Menu Header"
            user={{ name: "Admin" }}
          />

          <div
            className="
              w-full
              px-3
              py-5
              sm:px-4
              sm:py-6
              md:px-6
              lg:px-8
              xl:px-10
              lg:py-8
            "
          >
            <div
              className="
                w-full
                max-w-6xl
                mx-auto
                space-y-5
                sm:space-y-6
              "
            >
              {/* BREADCRUMB */}
              <div
                className="
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <nav
                  className="
                    min-w-0
                    max-w-full
                    overflow-x-auto
                  "
                >
                  <ol
                    className="
                      flex
                      items-center
                      gap-2
                      whitespace-nowrap
                      text-xs
                      sm:text-sm
                      font-medium
                      theme-text-muted
                    "
                  >
                    <li>
                      <a
                        href="/cmsAdmin"
                        className="
                          hover:text-[var(--color-primary)]
                          transition-colors
                        "
                      >
                        Dashboard
                      </a>
                    </li>

                    <li className="theme-text-placeholder">/</li>

                    <li>
                      <a
                        href="/cmsAdmin/website/menu"
                        className="
                          hover:text-[var(--color-primary)]
                          transition-colors
                        "
                      >
                        Menu
                      </a>
                    </li>

                    <li className="theme-text-placeholder">/</li>

                    <li className="text-[var(--color-primary)] font-semibold">
                      Header
                    </li>
                  </ol>
                </nav>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="
                    inline-flex
                    w-fit
                    shrink-0
                    items-center
                    gap-2
                    text-xs
                    sm:text-sm
                    theme-text-secondary
                    hover:text-[var(--color-primary)]
                    transition-colors
                  "
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali
                </button>
              </div>

              {/* EMPTY CARD */}
              <div
                className="
                  theme-card
                  rounded-xl
                  sm:rounded-2xl
                  border
                  theme-border
                  shadow-sm
                  px-5
                  py-12
                  sm:px-8
                  sm:py-16
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    sm:h-16
                    sm:w-16
                    items-center
                    justify-center
                    rounded-full
                    theme-card-soft
                    mb-4
                  "
                >
                  <LinkIcon className="h-7 w-7 sm:h-8 sm:w-8 theme-text-muted" />
                </div>

                <h3 className="text-base sm:text-lg font-semibold theme-text">
                  Belum ada menu header
                </h3>

                <p className="mt-2 text-xs sm:text-sm theme-text-muted max-w-sm mx-auto leading-relaxed">
                  Tambahkan menu navigasi utama untuk website Anda.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =========================
  // MAIN PAGE
  // =========================
  return (
    <div className="theme-page flex min-h-screen w-full overflow-x-hidden">
      {/* ================= SIDEBAR ================= */}
      <div className="shrink-0">
        <Sidebar
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <main
        className="
          theme-page
          flex-1
          min-w-0
          w-full
          overflow-x-hidden
          overflow-y-auto
          transition-all
          duration-300
        "
      >
        {/* HEADER */}
        <Header
          title="Menu Header"
          user={{ name: "Admin" }}
        />

        {/* ================= PAGE CONTENT ================= */}
        <div
          className="
            w-full
            px-3
            py-5
            sm:px-4
            sm:py-6
            md:px-6
            lg:px-8
            xl:px-10
            lg:py-8
          "
        >
          <div
            className="
              w-full
              max-w-6xl
              mx-auto
              space-y-5
              sm:space-y-6
            "
          >
            {/* ================= BREADCRUMB ================= */}
            <div
              className="
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              {/* Breadcrumb */}
              <nav
                className="
                  min-w-0
                  max-w-full
                  overflow-x-auto
                "
              >
                <ol
                  className="
                    flex
                    items-center
                    gap-2
                    whitespace-nowrap
                    text-xs
                    sm:text-sm
                    font-medium
                    theme-text-muted
                  "
                >
                  <li>
                    <a
                      href="/cmsAdmin"
                      className="
                        hover:text-[var(--color-primary)]
                        transition-colors
                      "
                    >
                      Dashboard
                    </a>
                  </li>

                  <li className="theme-text-placeholder">/</li>

                  <li>
                    <a
                      href="/cmsAdmin/website/menu"
                      className="
                        hover:text-[var(--color-primary)]
                        transition-colors
                      "
                    >
                      Menu
                    </a>
                  </li>

                  <li className="theme-text-placeholder">/</li>

                  <li className="text-[var(--color-primary)] font-semibold">
                    Header
                  </li>
                </ol>
              </nav>

              {/* Back */}
              <button
                type="button"
                onClick={() => router.back()}
                className="
                  inline-flex
                  w-fit
                  shrink-0
                  items-center
                  gap-2
                  text-xs
                  sm:text-sm
                  theme-text-secondary
                  hover:text-[var(--color-primary)]
                  transition-colors
                "
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </button>
            </div>

            {/* ================= PAGE HEADER ================= */}
            <div
              className="
                theme-card
                w-full
                p-4
                sm:p-5
                md:p-6
                rounded-xl
                sm:rounded-2xl
                border
                theme-border
                shadow-sm
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-5
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                "
              >
                {/* Title */}
                <div
                  className="
                    flex
                    items-start
                    gap-3
                    sm:gap-4
                    min-w-0
                  "
                >
                  <div
                    className="
                      shrink-0
                      p-2.5
                      sm:p-3
                      theme-info
                      rounded-xl
                      sm:rounded-2xl
                      border
                      theme-border
                    "
                  >
                    <LinkIcon className="w-5 h-5 text-[var(--color-info)]" />
                  </div>

                  <div className="min-w-0">
                    <h1
                      className="
                        text-lg
                        sm:text-xl
                        md:text-2xl
                        font-bold
                        tracking-tight
                        theme-text
                      "
                    >
                      Atur Menu Header
                    </h1>

                    <p
                      className="
                        text-xs
                        sm:text-sm
                        theme-text-muted
                        mt-1
                        leading-relaxed
                        max-w-2xl
                      "
                    >
                      Navigasi utama yang muncul di bagian atas
                      website.
                    </p>
                  </div>
                </div>

                {/* Add Button */}
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Fitur tambah menu dibuka! (Mockup)"
                    )
                  }
                  className="
                    theme-primary
                    inline-flex
                    w-full
                    sm:w-fit
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    px-5
                    sm:px-6
                    py-2.5
                    rounded-lg
                    sm:rounded-full
                    text-xs
                    sm:text-sm
                    font-semibold
                    shadow-lg
                    shadow-blue-600/20
                    hover:shadow-xl
                    transition-all
                    duration-200
                    active:scale-95
                  "
                >
                  <Plus className="w-4 h-4" />
                  Tambah Menu Baru
                </button>
              </div>
            </div>

            {/* ================= MENU LIST ================= */}
            <div
              className="
                theme-card
                w-full
                rounded-xl
                sm:rounded-2xl
                border
                theme-border
                shadow-sm
                overflow-hidden
              "
            >
              {/* List Header */}
              <div
                className="
                  border-b
                  theme-border-soft
                  px-4
                  sm:px-5
                  md:px-6
                  py-3.5
                  sm:py-4
                  theme-card-soft
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <h3
                  className="
                    text-[10px]
                    sm:text-xs
                    font-semibold
                    theme-text-muted
                    uppercase
                    tracking-wider
                    flex
                    items-center
                    gap-2
                  "
                >
                  <GripVertical className="w-4 h-4 theme-text-muted shrink-0" />

                  <span>Urutan Navigasi</span>
                </h3>

                <span
                  className="
                    shrink-0
                    text-[10px]
                    sm:text-xs
                    theme-card-soft
                    theme-text-secondary
                    px-2
                    sm:px-2.5
                    py-1
                    rounded-full
                    font-medium
                  "
                >
                  {menuItems.length} Menu
                </span>
              </div>

              {/* Items */}
              <div className="divide-y divide-[var(--color-border-soft)]">
                {menuItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="
                      group
                      relative
                      flex
                      items-start
                      gap-2
                      sm:gap-3
                      px-3
                      sm:px-4
                      md:px-6
                      py-4
                      theme-table-hover
                      transition-all
                      duration-200
                      min-w-0
                    "
                  >
                    {/* Number */}
                    <span
                      className="
                        flex
                        shrink-0
                        w-6
                        h-6
                        rounded-full
                        theme-card-soft
                        theme-text-muted
                        text-[10px]
                        font-bold
                        items-center
                        justify-center
                        shadow-sm
                      "
                    >
                      {index + 1}
                    </span>

                    {/* Drag Icon */}
                    <GripVertical
                      className="
                        shrink-0
                        w-4
                        h-4
                        mt-1
                        theme-text-placeholder
                        group-hover:text-[var(--color-text-muted)]
                        transition-colors
                        cursor-grab
                      "
                    />

                    {/* ================= DETAIL ================= */}
                    <div
                      className="
                        flex-1
                        min-w-0
                        flex
                        flex-col
                        gap-1
                      "
                    >
                      {/* Label */}
                      <p
                        className="
                          text-sm
                          font-bold
                          theme-text
                          truncate
                          group-hover:text-[var(--color-primary)]
                          transition-colors
                        "
                      >
                        {item.label}
                      </p>

                      {/* URL */}
                      <div
                        className="
                          flex
                          items-center
                          gap-1.5
                          min-w-0
                        "
                      >
                        <LinkIcon
                          className="
                            w-3
                            h-3
                            theme-text-muted
                            shrink-0
                          "
                        />

                        <span
                          className="
                            min-w-0
                            max-w-full
                            sm:max-w-xs
                            truncate
                            text-[11px]
                            sm:text-xs
                            theme-text-placeholder
                            font-mono
                            theme-card-soft
                            px-1.5
                            py-0.5
                            rounded
                          "
                        >
                          {item.url}
                        </span>
                      </div>
                    </div>

                    {/* ================= ACTION ================= */}
                    <div
                      className="
                        flex
                        items-center
                        gap-0.5
                        sm:gap-1
                        shrink-0
                        ml-1
                      "
                    >
                      {/* Up Down */}
                      <div
                        className="
                          flex
                          items-center
                          rounded-lg
                          border
                          theme-border
                          theme-card
                          shadow-sm
                          overflow-hidden
                          mr-1
                          sm:mr-2
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handleMove(item.id, "up")
                          }
                          disabled={index === 0}
                          className="
                            p-1.5
                            sm:p-2
                            theme-text-muted
                            hover:text-[var(--color-primary)]
                            hover:bg-[var(--color-sidebar-active)]
                            transition-colors
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                            disabled:hover:bg-transparent
                            disabled:hover:text-[var(--color-text-muted)]
                          "
                          title="Naikkan posisi"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleMove(item.id, "down")
                          }
                          disabled={
                            index === menuItems.length - 1
                          }
                          className="
                            p-1.5
                            sm:p-2
                            theme-text-muted
                            hover:text-[var(--color-primary)]
                            hover:bg-[var(--color-sidebar-active)]
                            transition-colors
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                            disabled:hover:bg-transparent
                            disabled:hover:text-[var(--color-text-muted)]
                          "
                          title="Turunkan posisi"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Edit */}
                      <button
                        type="button"
                        className="
                          p-1.5
                          sm:p-2
                          rounded-lg
                          theme-text-muted
                          hover:text-[var(--color-primary)]
                          theme-sidebar-hover
                          transition-colors
                        "
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(item.id)
                        }
                        className="
                          p-1.5
                          sm:p-2
                          rounded-lg
                          theme-text-muted
                          hover:text-[var(--color-danger)]
                          hover:bg-[var(--color-danger-background)]
                          transition-colors
                        "
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ================= FOOTER ================= */}
              <div
                className="
                  px-4
                  sm:px-6
                  py-3
                  border-t
                  theme-border-soft
                  theme-card-soft
                  flex
                  items-center
                  justify-end
                "
              >
                <span
                  className="
                    text-[9px]
                    sm:text-[10px]
                    font-medium
                    theme-text-placeholder
                    theme-card-soft
                    px-2.5
                    sm:px-3
                    py-1
                    rounded-full
                    ring-1
                    ring-[var(--color-border)]
                    whitespace-nowrap
                  "
                >
                  ⚡ Data simulasi (Dummy)
                </span>
              </div>
            </div>

            {/* ================= TIPS ================= */}
            <div
              className="
                theme-info
                border
                theme-border
                rounded-xl
                sm:rounded-2xl
                p-4
                sm:p-5
                flex
                items-start
                gap-3
                sm:gap-4
                shadow-sm
              "
            >
              {/* Icon */}
              <div
                className="
                  p-2
                  sm:p-2.5
                  theme-card-soft
                  rounded-lg
                  text-[var(--color-info)]
                  shrink-0
                  ring-1
                  ring-[var(--color-border)]
                  shadow-sm
                "
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              {/* Text */}
              <div className="min-w-0">
                <h4
                  className="
                    text-xs
                    sm:text-sm
                    font-bold
                    text-[var(--color-info)]
                  "
                >
                  Urutkan Menu dengan Mudah
                </h4>

                <p
                  className="
                    text-xs
                    sm:text-sm
                    theme-text-secondary
                    mt-1
                    leading-relaxed
                  "
                >
                  Gunakan tombol panah atas/bawah untuk
                  mengatur urutan posisi menu. Perubahan
                  urutan akan langsung tercermin di website
                  publik.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}