"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
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
      <div className="flex min-h-screen w-full bg-slate-50 overflow-x-hidden">
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
            flex-1
            min-w-0
            w-full
            overflow-x-hidden
            overflow-y-auto
            bg-slate-50
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
                      text-slate-500
                    "
                  >
                    <li>
                      <a
                        href="/cmsAdmin"
                        className="hover:text-indigo-600"
                      >
                        Dashboard
                      </a>
                    </li>

                    <li className="text-slate-300">/</li>

                    <li>
                      <a
                        href="/cmsAdmin/website/menu"
                        className="hover:text-indigo-600"
                      >
                        Menu
                      </a>
                    </li>

                    <li className="text-slate-300">/</li>

                    <li className="text-indigo-600 font-semibold">
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
                    text-slate-600
                    hover:text-indigo-600
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
                  bg-white
                  rounded-xl
                  sm:rounded-2xl
                  border
                  border-slate-200
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
                    bg-slate-100
                    mb-4
                  "
                >
                  <LinkIcon className="h-7 w-7 sm:h-8 sm:w-8 text-slate-400" />
                </div>

                <h3 className="text-base sm:text-lg font-semibold text-slate-900">
                  Belum ada menu header
                </h3>

                <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
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
    <div className="flex min-h-screen w-full bg-slate-50 overflow-x-hidden">
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
          flex-1
          min-w-0
          w-full
          overflow-x-hidden
          overflow-y-auto
          bg-slate-50
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
                    text-slate-500
                  "
                >
                  <li>
                    <a
                      href="/cmsAdmin"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      Dashboard
                    </a>
                  </li>

                  <li className="text-slate-300">/</li>

                  <li>
                    <a
                      href="/cmsAdmin/website/menu"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      Menu
                    </a>
                  </li>

                  <li className="text-slate-300">/</li>

                  <li className="text-indigo-600 font-semibold">
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
                  text-slate-600
                  hover:text-indigo-600
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
                w-full
                bg-white
                p-4
                sm:p-5
                md:p-6
                rounded-xl
                sm:rounded-2xl
                border
                border-slate-200/60
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
                      bg-indigo-50
                      rounded-xl
                      sm:rounded-2xl
                      border
                      border-indigo-100
                    "
                  >
                    <LinkIcon className="w-5 h-5 text-indigo-600" />
                  </div>

                  <div className="min-w-0">
                    <h1
                      className="
                        text-lg
                        sm:text-xl
                        md:text-2xl
                        font-bold
                        tracking-tight
                        text-slate-900
                      "
                    >
                      Atur Menu Header
                    </h1>

                    <p
                      className="
                        text-xs
                        sm:text-sm
                        text-slate-500
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
                    bg-indigo-600
                    text-white
                    text-xs
                    sm:text-sm
                    font-semibold
                    shadow-lg
                    shadow-indigo-600/20
                    hover:bg-indigo-700
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
                w-full
                bg-white
                rounded-xl
                sm:rounded-2xl
                border
                border-slate-200/70
                shadow-sm
                overflow-hidden
              "
            >
              {/* List Header */}
              <div
                className="
                  border-b
                  border-slate-100
                  px-4
                  sm:px-5
                  md:px-6
                  py-3.5
                  sm:py-4
                  bg-slate-50/60
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
                    text-slate-500
                    uppercase
                    tracking-wider
                    flex
                    items-center
                    gap-2
                  "
                >
                  <GripVertical className="w-4 h-4 text-slate-400 shrink-0" />

                  <span>Urutan Navigasi</span>
                </h3>

                <span
                  className="
                    shrink-0
                    text-[10px]
                    sm:text-xs
                    bg-slate-100
                    text-slate-600
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
              <div className="divide-y divide-slate-100">
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
                      hover:bg-slate-50/80
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
                        bg-slate-100
                        text-slate-500
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
                        text-slate-200
                        group-hover:text-slate-400
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
                          text-slate-800
                          truncate
                          group-hover:text-indigo-600
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
                            text-slate-400
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
                            text-slate-400
                            font-mono
                            bg-slate-50
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
                          border-slate-200
                          bg-white
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
                            text-slate-400
                            hover:text-indigo-600
                            hover:bg-indigo-50
                            transition-colors
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                            disabled:hover:bg-transparent
                            disabled:hover:text-slate-400
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
                            text-slate-400
                            hover:text-indigo-600
                            hover:bg-indigo-50
                            transition-colors
                            disabled:opacity-40
                            disabled:cursor-not-allowed
                            disabled:hover:bg-transparent
                            disabled:hover:text-slate-400
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
                          text-slate-400
                          hover:text-blue-600
                          hover:bg-blue-50
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
                          text-slate-400
                          hover:text-red-600
                          hover:bg-red-50
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
                  border-slate-100
                  bg-slate-50/60
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
                    text-slate-400
                    bg-slate-100/80
                    px-2.5
                    sm:px-3
                    py-1
                    rounded-full
                    ring-1
                    ring-slate-200/50
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
                bg-indigo-50/60
                border
                border-indigo-200/60
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
                  bg-indigo-100/90
                  rounded-lg
                  text-indigo-600
                  shrink-0
                  ring-1
                  ring-indigo-200/50
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
                    text-indigo-800
                  "
                >
                  Urutkan Menu dengan Mudah
                </h4>

                <p
                  className="
                    text-xs
                    sm:text-sm
                    text-indigo-700/90
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