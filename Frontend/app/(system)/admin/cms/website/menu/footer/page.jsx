"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../../../components/Header";
import Sidebar from "../../../../../../components/Sidebar";
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
  Footprints,
} from "lucide-react";

export default function MenuFooterPage() {
  const router = useRouter();

  // =========================
  // SIDEBAR
  // =========================
  const [active, setActive] = useState("menu");
  const [collapsed, setCollapsed] = useState(false);

  // =========================
  // MENU FOOTER DATA
  // =========================
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      label: "Tentang Kami",
      url: "/tentang",
      order: 1,
    },
    {
      id: 2,
      label: "Hubungi Kami",
      url: "/kontak",
      order: 2,
    },
    {
      id: 3,
      label: "Kebijakan Privasi",
      url: "/privacy",
      order: 3,
    },
    {
      id: 4,
      label: "Syarat & Ketentuan",
      url: "/terms",
      order: 4,
    },
  ]);

  // =========================
  // DELETE
  // =========================
  const handleDelete = (id) => {
    if (
      !confirm(
        "Yakin ingin menghapus menu footer ini? Tindakan ini tidak dapat dibatalkan."
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

      if (
        direction === "down" &&
        index === prev.length - 1
      ) {
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
      <div className="flex min-h-screen w-full overflow-x-hidden theme-page">
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
        <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto theme-page">
          <Header
            title="Menu Footer"
            user={{ name: "Admin" }}
          />

          <div className="w-full px-3 py-5 sm:px-4 md:px-6 lg:px-8 xl:px-10">
            <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">

              {/* BREADCRUMB */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <nav className="min-w-0 max-w-full overflow-x-auto">
                  <ol className="flex w-max items-center gap-2 whitespace-nowrap text-xs font-medium theme-text-muted sm:text-sm">
                    <li>
                      <a
                        href="/cmsAdmin"
                        className="
                          transition-colors
                          theme-text-muted
                          hover:text-[var(--color-primary)]
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
                          transition-colors
                          theme-text-muted
                          hover:text-[var(--color-primary)]
                        "
                      >
                        Menu
                      </a>
                    </li>

                    <li className="theme-text-placeholder">/</li>

                    <li className="font-semibold theme-sidebar-text-active">
                      Footer
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
                    theme-text-secondary
                    transition-colors
                    hover:text-[var(--color-primary)]
                    sm:text-sm
                  "
                >
                  <ArrowLeft className="h-4 w-4" />
                  Kembali
                </button>
              </div>

              {/* EMPTY STATE */}
              <div className="rounded-xl border theme-border theme-card px-5 py-12 text-center shadow-sm sm:rounded-2xl sm:px-8 sm:py-16">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full theme-card-soft sm:h-16 sm:w-16">
                  <Footprints className="h-7 w-7 theme-text-muted sm:h-8 sm:w-8" />
                </div>

                <h3 className="text-base font-semibold theme-text sm:text-lg">
                  Belum ada menu footer
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed theme-text-muted sm:text-sm">
                  Tambahkan menu navigasi bagian bawah
                  untuk website Anda.
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
    <div className="flex min-h-screen w-full overflow-x-hidden theme-page">

      {/* =========================
          SIDEBAR
      ========================= */}
      <div className="shrink-0">
        <Sidebar
          active={active}
          setActive={setActive}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* =========================
          MAIN
      ========================= */}
      <main className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto theme-page">

        {/* HEADER */}
        <Header
          title="Menu Footer"
          user={{ name: "Admin" }}
        />

        {/* =========================
            PAGE CONTENT
        ========================= */}
        <div className="w-full px-3 py-5 sm:px-4 sm:py-6 md:px-6 lg:px-8 xl:px-10 lg:py-8">

          <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-6">

            {/* =========================
                BREADCRUMB
            ========================= */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <nav className="min-w-0 max-w-full overflow-x-auto">
                <ol className="flex w-max items-center gap-2 whitespace-nowrap text-xs font-medium theme-text-muted sm:text-sm">

                  <li>
                    <a
                      href="/cmsAdmin"
                      className="
                        transition-colors
                        theme-text-muted
                        hover:text-[var(--color-primary)]
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
                        transition-colors
                        theme-text-muted
                        hover:text-[var(--color-primary)]
                      "
                    >
                      Menu
                    </a>
                  </li>

                  <li className="theme-text-placeholder">/</li>

                  <li className="font-semibold theme-sidebar-text-active">
                    Footer
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
                  theme-text-secondary
                  transition-colors
                  hover:text-[var(--color-primary)]
                  sm:text-sm
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </button>

            </div>

            {/* =========================
                PAGE HEADER
            ========================= */}
            <section className="w-full rounded-xl border theme-border theme-card p-4 shadow-sm sm:rounded-2xl sm:p-5 md:p-6">

              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                {/* TITLE */}
                <div className="flex min-w-0 items-start gap-3 sm:gap-4">

                  <div className="shrink-0 rounded-xl border theme-border theme-info p-2.5 sm:rounded-2xl sm:p-3">
                    <Footprints className="h-5 w-5 sm:h-5 sm:w-5" />
                  </div>

                  <div className="min-w-0">
                    <h1 className="text-lg font-bold tracking-tight theme-text sm:text-xl md:text-2xl">
                      Atur Menu Footer
                    </h1>

                    <p className="mt-1 max-w-2xl text-xs leading-relaxed theme-text-muted sm:text-sm">
                      Navigasi informasi yang muncul di
                      bagian bawah website.
                    </p>
                  </div>

                </div>

                {/* ADD BUTTON */}
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      "Fitur tambah menu dibuka! (Mockup)"
                    )
                  }
                  className="
                    inline-flex
                    w-full
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    theme-primary
                    px-5
                    py-2.5
                    text-xs
                    font-semibold
                    shadow-lg
                    transition-all
                    duration-200
                    hover:shadow-xl
                    active:scale-95
                    sm:w-fit
                    sm:rounded-full
                    sm:px-6
                    sm:text-sm
                  "
                >
                  <Plus className="h-4 w-4" />
                  Tambah Menu Baru
                </button>

              </div>

            </section>

            {/* =========================
                MENU LIST
            ========================= */}
            <section className="w-full overflow-hidden rounded-xl border theme-border theme-card shadow-sm sm:rounded-2xl">

              {/* LIST HEADER */}
              <div className="flex items-center justify-between gap-3 border-b theme-border theme-card-soft px-4 py-3.5 sm:px-5 sm:py-4 md:px-6">

                <h3 className="flex min-w-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-wider theme-text-muted sm:text-xs">

                  <GripVertical className="h-4 w-4 shrink-0 theme-text-muted" />

                  <span className="truncate">
                    Urutan Navigasi
                  </span>

                </h3>

                <span className="shrink-0 rounded-full theme-card-soft px-2 py-1 text-[10px] font-medium theme-text-secondary sm:px-2.5 sm:text-xs">
                  {menuItems.length} Menu
                </span>

              </div>

              {/* =========================
                  MENU ITEMS
              ========================= */}
              <div className="divide-y divide-[var(--color-border)]">

                {menuItems.map((item, index) => (

                  <div
                    key={item.id}
                    className="
                      group
                      grid
                      min-w-0
                      grid-cols-[auto_auto_minmax(0,1fr)_auto]
                      items-center
                      gap-2
                      px-3
                      py-4
                      transition-all
                      duration-200
                      theme-header-hover
                      sm:gap-3
                      sm:px-4
                      md:px-6
                    "
                  >

                    {/* NUMBER */}
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full theme-card-soft text-[10px] font-bold theme-text-muted shadow-sm sm:h-7 sm:w-7">
                      {index + 1}
                    </span>

                    {/* DRAG */}
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab theme-text-placeholder transition-colors group-hover:theme-text-muted" />

                    {/* =========================
                        DETAIL
                    ========================= */}
                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold theme-text transition-colors group-hover:text-[var(--color-primary)]">
                        {item.label}
                      </p>

                      <div className="mt-1 flex min-w-0 items-center gap-1.5">

                        <LinkIcon className="h-3 w-3 shrink-0 theme-text-muted" />

                        <span className="block min-w-0 max-w-full truncate rounded theme-card-soft px-1.5 py-0.5 font-mono text-[10px] theme-text-muted sm:text-xs">
                          {item.url}
                        </span>

                      </div>

                    </div>

                    {/* =========================
                        ACTION
                    ========================= */}
                    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">

                      {/* MOVE */}
                      <div className="mr-0.5 flex overflow-hidden rounded-lg border theme-border theme-card shadow-sm sm:mr-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleMove(item.id, "up")
                          }
                          disabled={index === 0}
                          className="
                            p-1.5
                            theme-text-muted
                            transition-colors
                            hover:bg-[var(--color-primary)]
                            hover:text-white
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                            disabled:hover:bg-transparent
                            disabled:hover:text-[var(--color-text-muted)]
                            sm:p-2
                          "
                          title="Naikkan posisi"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleMove(item.id, "down")
                          }
                          disabled={
                            index ===
                            menuItems.length - 1
                          }
                          className="
                            p-1.5
                            theme-text-muted
                            transition-colors
                            hover:bg-[var(--color-primary)]
                            hover:text-white
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                            disabled:hover:bg-transparent
                            disabled:hover:text-[var(--color-text-muted)]
                            sm:p-2
                          "
                          title="Turunkan posisi"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>

                      </div>

                      {/* EDIT */}
                      <button
                        type="button"
                        className="
                          rounded-lg
                          p-1.5
                          theme-text-muted
                          transition-colors
                          hover:bg-[var(--color-info-background)]
                          hover:text-[var(--color-info)]
                          sm:p-2
                        "
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      {/* DELETE */}
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(item.id)
                        }
                        className="
                          rounded-lg
                          p-1.5
                          theme-text-muted
                          transition-colors
                          hover:bg-[var(--color-danger-background)]
                          hover:text-[var(--color-danger)]
                          sm:p-2
                        "
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>

                  </div>

                ))}

              </div>

              {/* =========================
                  FOOTER LIST
              ========================= */}
              <div className="flex items-center justify-end border-t theme-border theme-card-soft px-4 py-3 sm:px-6">

                <span className="whitespace-nowrap rounded-full theme-card-soft px-2.5 py-1 text-[9px] font-medium theme-text-muted ring-1 ring-[var(--color-border)] sm:px-3 sm:text-[10px]">
                  ⚡ Data simulasi (Dummy)
                </span>

              </div>

            </section>

            {/* =========================
                TIPS
            ========================= */}
            <section className="flex items-start gap-3 rounded-xl border theme-border theme-info p-4 shadow-sm sm:gap-4 sm:rounded-2xl sm:p-5">

              <div className="shrink-0 rounded-lg theme-info p-2 shadow-sm sm:p-2.5">
                <Info className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>

              <div className="min-w-0">

                <h4 className="text-xs font-bold theme-text sm:text-sm">
                  Tips Pengaturan Footer
                </h4>

                <p className="mt-1 text-xs leading-relaxed theme-text-secondary sm:text-sm">
                  Menu footer biasanya berisi halaman
                  statis seperti Kontak, Kebijakan Privasi,
                  dan Syarat & Ketentuan. Pastikan urutannya
                  sudah benar.
                </p>

              </div>

            </section>

          </div>
        </div>

      </main>
    </div>
  );
}