"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  GraduationCap,
  FlaskConical,
  Landmark,
  Languages,
  Code2,
  Palette,
  Calculator,
  Wrench,
  UtensilsCrossed,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Users,
  Layers3,
  CircleCheck,
  CircleSlash,
  ChevronDown,
  Eye,
  RefreshCw,
} from "lucide-react";

/* =========================================================
   ICON
========================================================= */

const ICONS = {
  FlaskConical,
  Landmark,
  Languages,
  Code2,
  Palette,
  Calculator,
  Wrench,
  UtensilsCrossed,
};

/* =========================================================
   DATA
========================================================= */

const initialData = [
  {
    id: 1,
    kode: "IPA",
    nama: "Ilmu Pengetahuan Alam",
    jenjang: "SMA",
    kepala: "Dra. Siti Marlina, M.Pd.",
    kelas: 6,
    siswa: 214,
    status: "Aktif",
    icon: "FlaskConical",
  },
  {
    id: 2,
    kode: "IPS",
    nama: "Ilmu Pengetahuan Sosial",
    jenjang: "SMA",
    kepala: "Drs. Bambang Hartono",
    kelas: 5,
    siswa: 178,
    status: "Aktif",
    icon: "Landmark",
  },
  {
    id: 3,
    kode: "BHS",
    nama: "Bahasa dan Budaya",
    jenjang: "SMA",
    kepala: "Rina Kusuma, S.Pd.",
    kelas: 2,
    siswa: 61,
    status: "Aktif",
    icon: "Languages",
  },
  {
    id: 4,
    kode: "RPL",
    nama: "Rekayasa Perangkat Lunak",
    jenjang: "SMK",
    kepala: "Ahmad Fauzi, S.Kom.",
    kelas: 4,
    siswa: 142,
    status: "Aktif",
    icon: "Code2",
  },
  {
    id: 5,
    kode: "TKJ",
    nama: "Teknik Komputer & Jaringan",
    jenjang: "SMK",
    kepala: "Yusuf Prasetyo, S.T.",
    kelas: 3,
    siswa: 109,
    status: "Aktif",
    icon: "Code2",
  },
  {
    id: 6,
    kode: "MM",
    nama: "Multimedia",
    jenjang: "SMK",
    kepala: "Dewi Anggraini, S.Sn.",
    kelas: 3,
    siswa: 96,
    status: "Aktif",
    icon: "Palette",
  },
  {
    id: 7,
    kode: "AK",
    nama: "Akuntansi & Keuangan",
    jenjang: "SMK",
    kepala: "Hendra Wijaya, S.E.",
    kelas: 3,
    siswa: 88,
    status: "Nonaktif",
    icon: "Calculator",
  },
  {
    id: 8,
    kode: "TKR",
    nama: "Teknik Kendaraan Ringan",
    jenjang: "SMK",
    kepala: "Slamet Riyadi, S.T.",
    kelas: 2,
    siswa: 64,
    status: "Aktif",
    icon: "Wrench",
  },
  {
    id: 9,
    kode: "TB",
    nama: "Tata Boga",
    jenjang: "SMK",
    kepala: "Ratna Sari, S.Pd.",
    kelas: 2,
    siswa: 57,
    status: "Nonaktif",
    icon: "UtensilsCrossed",
  },
];

const emptyForm = {
  kode: "",
  nama: "",
  jenjang: "SMK",
  kepala: "",
  kelas: "",
  siswa: "",
  status: "Aktif",
  icon: "Code2",
};

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({ icon: Icon, label, value, type = "blue" }) {
  const styles = {
    blue: {
      box: "theme-info",
      icon: "text-[var(--color-primary)]",
      value: "theme-text",
    },

    green: {
      box: "theme-success",
      icon: "text-[var(--color-success)]",
      value: "text-[var(--color-success)]",
    },

    red: {
      box: "theme-danger",
      icon: "text-[var(--color-danger)]",
      value: "text-[var(--color-danger)]",
    },

    purple: {
      box: "theme-card-soft",
      icon: "text-[var(--color-info)]",
      value: "theme-text",
    },
  };

  const style = styles[type];

  return (
    <div className="min-w-0 rounded-xl border theme-border theme-card px-4 py-4 shadow-sm sm:px-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.box} ${style.icon}`}
        >
          <Icon size={19} strokeWidth={2} />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide theme-text-muted">
            {label}
          </p>

          <p
            className={`mt-1 text-2xl font-bold tracking-tight ${style.value}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({ status }) {
  const active = status === "Aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        active
          ? "theme-success"
          : "theme-card-soft theme-text-muted theme-border"
      }`}
    >
      {active ? (
        <CircleCheck size={13} strokeWidth={2} />
      ) : (
        <CircleSlash size={13} strokeWidth={2} />
      )}

      {status}
    </span>
  );
}

/* =========================================================
   JENJANG BADGE
========================================================= */

function JenjangBadge({ jenjang }) {
  return (
    <span
      className="
        inline-flex rounded-md
        theme-info
        px-3 py-1
        text-xs font-medium
      "
    >
      {jenjang}
    </span>
  );
}

/* =========================================================
   FORM
========================================================= */

function JurusanForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial);

  const update = (key) => (e) => {
    setForm((current) => ({
      ...current,
      [key]: e.target.value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();

    if (!form.kode.trim() || !form.nama.trim()) return;

    onSave({
      ...form,
      kode: form.kode.toUpperCase(),
      kelas: Number(form.kelas) || 0,
      siswa: Number(form.siswa) || 0,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {/* KODE + JENJANG */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold theme-text-secondary">
            Kode Jurusan
          </label>

          <input
            required
            value={form.kode}
            onChange={update("kode")}
            placeholder="Contoh: RPL"
            className="
              theme-input
              h-11 w-full rounded-lg
              px-3.5 text-sm
              outline-none transition
              focus:outline-none
            "
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold theme-text-secondary">
            Jenjang
          </label>

          <div className="relative">
            <select
              value={form.jenjang}
              onChange={update("jenjang")}
              className="
                theme-input
                h-11 w-full appearance-none rounded-lg
                px-3.5 pr-10 text-sm
                outline-none
                focus:outline-none
              "
            >
              <option value="SMA">SMA</option>
              <option value="SMK">SMK</option>
            </select>

            <ChevronDown
              size={16}
              className="
                pointer-events-none absolute right-3 top-1/2
                -translate-y-1/2 theme-text-placeholder
              "
            />
          </div>
        </div>
      </div>

      {/* NAMA */}
      <div>
        <label className="mb-2 block text-xs font-semibold theme-text-secondary">
          Nama Jurusan
        </label>

        <input
          required
          value={form.nama}
          onChange={update("nama")}
          placeholder="Contoh: Rekayasa Perangkat Lunak"
          className="
            theme-input
            h-11 w-full rounded-lg
            px-3.5 text-sm
            outline-none transition
            focus:outline-none
          "
        />
      </div>

      {/* KEPALA */}
      <div>
        <label className="mb-2 block text-xs font-semibold theme-text-secondary">
          Kepala Jurusan
        </label>

        <input
          value={form.kepala}
          onChange={update("kepala")}
          placeholder="Nama lengkap beserta gelar"
          className="
            theme-input
            h-11 w-full rounded-lg
            px-3.5 text-sm
            outline-none transition
            focus:outline-none
          "
        />
      </div>

      {/* KELAS / SISWA / STATUS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-semibold theme-text-secondary">
            Jumlah Kelas
          </label>

          <input
            type="number"
            min="0"
            value={form.kelas}
            onChange={update("kelas")}
            className="
              theme-input
              h-11 w-full rounded-lg
              px-3.5 text-sm
              outline-none
              focus:outline-none
            "
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold theme-text-secondary">
            Jumlah Siswa
          </label>

          <input
            type="number"
            min="0"
            value={form.siswa}
            onChange={update("siswa")}
            className="
              theme-input
              h-11 w-full rounded-lg
              px-3.5 text-sm
              outline-none
              focus:outline-none
            "
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold theme-text-secondary">
            Status
          </label>

          <div className="relative">
            <select
              value={form.status}
              onChange={update("status")}
              className="
                theme-input
                h-11 w-full appearance-none rounded-lg
                px-3.5 pr-10 text-sm
                outline-none
                focus:outline-none
              "
            >
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>

            <ChevronDown
              size={16}
              className="
                pointer-events-none absolute right-3 top-1/2
                -translate-y-1/2 theme-text-placeholder
              "
            />
          </div>
        </div>
      </div>

      {/* ICON */}
      <div>
        <label className="mb-2 block text-xs font-semibold theme-text-secondary">
          Ikon Jurusan
        </label>

        <div className="flex flex-wrap gap-2">
          {Object.entries(ICONS).map(([name, Icon]) => {
            const selected = form.icon === name;

            return (
              <button
                key={name}
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    icon: name,
                  }))
                }
                className={`flex h-10 w-10 items-center justify-center rounded-lg border transition ${
                  selected
                    ? "theme-primary theme-border shadow-sm"
                    : "theme-card theme-border theme-text-muted theme-header-hover"
                }`}
              >
                <Icon size={17} />
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col-reverse gap-2 border-t theme-border pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="
            theme-card
            theme-border
            theme-text-secondary
            theme-header-hover
            h-10 rounded-lg
            border px-5
            text-sm font-medium
            transition
          "
        >
          Batal
        </button>

        <button
          type="submit"
          className="
            theme-primary
            h-10 rounded-lg
            px-5
            text-sm font-semibold
            shadow-sm transition
          "
        >
          Simpan Jurusan
        </button>
      </div>
    </form>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function ListJurusanPage() {
  const [data, setData] = useState(initialData);

  const [search, setSearch] = useState("");
  const [jenjangFilter, setJenjangFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const [modalMode, setModalMode] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  /* =========================================================
     FILTER
  ========================================================= */

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return data.filter((j) => {
      const matchSearch =
        !q ||
        j.nama.toLowerCase().includes(q) ||
        j.kode.toLowerCase().includes(q) ||
        j.kepala.toLowerCase().includes(q);

      const matchJenjang =
        jenjangFilter === "Semua" || j.jenjang === jenjangFilter;

      const matchStatus =
        statusFilter === "Semua" || j.status === statusFilter;

      return matchSearch && matchJenjang && matchStatus;
    });
  }, [data, search, jenjangFilter, statusFilter]);

  /* =========================================================
     STATISTIC
  ========================================================= */

  const totalSiswa = data.reduce(
    (total, item) => total + item.siswa,
    0
  );

  const totalAktif = data.filter(
    (item) => item.status === "Aktif"
  ).length;

  const totalNonaktif = data.filter(
    (item) => item.status === "Nonaktif"
  ).length;

  const totalKelas = data.reduce(
    (total, item) => total + item.kelas,
    0
  );

  /* =========================================================
     MODAL
  ========================================================= */

  const openAdd = () => {
    setActiveItem(emptyForm);
    setModalMode("add");
  };

  const openEdit = (item) => {
    setActiveItem(item);
    setModalMode("edit");
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveItem(null);
  };

  /* =========================================================
     SAVE
  ========================================================= */

  const saveItem = (form) => {
    if (modalMode === "add") {
      setData((current) => [
        ...current,
        {
          ...form,
          id: Date.now(),
        },
      ]);
    } else {
      setData((current) =>
        current.map((item) =>
          item.id === form.id ? { ...form } : item
        )
      );
    }

    closeModal();
  };

  /* =========================================================
     DELETE
  ========================================================= */

  const removeItem = (id) => {
    setData((current) =>
      current.filter((item) => item.id !== id)
    );

    setConfirmDeleteId(null);
  };

  /* =========================================================
     RESET FILTER
  ========================================================= */

  const resetFilter = () => {
    setSearch("");
    setJenjangFilter("Semua");
    setStatusFilter("Semua");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex min-h-screen theme-page">
      {/* SIDEBAR */}
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* HEADER */}
        <Header />

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1280px]">
            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="theme-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm">
                  <GraduationCap
                    size={23}
                    strokeWidth={2}
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="text-[24px] font-bold tracking-tight theme-text sm:text-[27px]">
                    Data Jurusan
                  </h1>

                  <p className="text-sm theme-text-muted">
                    Kelola program keahlian dan data jurusan sekolah
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={resetFilter}
                  className="
                    theme-card
                    theme-border
                    theme-text-secondary
                    theme-header-hover
                    flex h-10 items-center gap-2
                    rounded-lg border
                    px-3.5
                    text-sm font-medium
                    transition
                  "
                >
                  <RefreshCw size={16} />

                  <span className="hidden sm:inline">
                    Reset
                  </span>
                </button>

                <button
                  type="button"
                  onClick={openAdd}
                  className="
                    theme-primary
                    flex h-10 items-center gap-2
                    rounded-lg
                    px-4
                    text-sm font-semibold
                    shadow-sm transition
                  "
                >
                  <Plus size={17} />
                  Tambah Jurusan
                </button>
              </div>
            </div>

            {/* =================================================
                STAT CARDS
            ================================================= */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon={Layers3}
                label="Total Jurusan"
                value={data.length}
                type="blue"
              />

              <StatCard
                icon={CircleCheck}
                label="Aktif"
                value={totalAktif}
                type="green"
              />

              <StatCard
                icon={CircleSlash}
                label="Nonaktif"
                value={totalNonaktif}
                type="red"
              />

              <StatCard
                icon={Users}
                label="Total Siswa"
                value={totalSiswa.toLocaleString("id-ID")}
                type="purple"
              />
            </div>

            {/* =================================================
                FILTER CARD
            ================================================= */}

            <div
              className="
                theme-card
                theme-border
                mt-5 rounded-xl border
                p-4 shadow-sm sm:p-5
              "
            >
              {/* SEARCH */}

              <div className="relative">
                <Search
                  size={18}
                  className="
                    pointer-events-none absolute left-3.5
                    top-1/2 -translate-y-1/2
                    text-[var(--color-primary)]
                  "
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Cari nama, kode, atau kepala jurusan..."
                  className="
                    theme-input
                    h-11 w-full rounded-lg
                    pl-10 pr-4
                    text-sm
                    outline-none transition
                    focus:outline-none
                  "
                />
              </div>

              {/* FILTER */}
              <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center">
                <div className="relative w-full lg:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value)
                    }
                    className="
                      theme-input
                      h-10 w-full appearance-none
                      rounded-lg
                      px-3.5 pr-9
                      text-sm
                      outline-none
                      focus:outline-none
                    "
                  >
                    <option value="Semua">
                      Semua Status
                    </option>

                    <option value="Aktif">
                      Aktif
                    </option>

                    <option value="Nonaktif">
                      Nonaktif
                    </option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="
                      pointer-events-none absolute right-3
                      top-1/2 -translate-y-1/2
                      theme-text-placeholder
                    "
                  />
                </div>

                <div className="relative w-full lg:w-48">
                  <select
                    value={jenjangFilter}
                    onChange={(e) =>
                      setJenjangFilter(e.target.value)
                    }
                    className="
                      theme-input
                      h-10 w-full appearance-none
                      rounded-lg
                      px-3.5 pr-9
                      text-sm
                      outline-none
                      focus:outline-none
                    "
                  >
                    <option value="Semua">
                      Semua Jenjang
                    </option>

                    <option value="SMA">
                      SMA
                    </option>

                    <option value="SMK">
                      SMK
                    </option>
                  </select>

                  <ChevronDown
                    size={15}
                    className="
                      pointer-events-none absolute right-3
                      top-1/2 -translate-y-1/2
                      theme-text-placeholder
                    "
                  />
                </div>

                <button
                  type="button"
                  onClick={resetFilter}
                  className="
                    theme-sidebar-text-active
                    theme-sidebar-hover
                    h-10 rounded-lg
                    px-3
                    text-sm font-medium
                    transition
                  "
                >
                  Reset Filter
                </button>

                <div className="lg:ml-auto">
                  <span className="text-sm font-medium theme-text-muted">
                    {filtered.length} jurusan ditemukan
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div
              className="
                theme-card
                theme-border
                mt-5 overflow-hidden
                rounded-xl border shadow-sm
              "
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] border-collapse text-left">
                  <thead>
                    <tr className="theme-primary text-xs font-semibold uppercase tracking-wide">
                      <th className="w-16 px-5 py-3.5 text-center">
                        No
                      </th>

                      <th className="px-5 py-3.5">
                        Jurusan
                      </th>

                      <th className="px-5 py-3.5">
                        Jenjang
                      </th>

                      <th className="px-5 py-3.5">
                        Kepala Jurusan
                      </th>

                      <th className="px-5 py-3.5 text-center">
                        Kelas
                      </th>

                      <th className="px-5 py-3.5 text-center">
                        Siswa
                      </th>

                      <th className="px-5 py-3.5">
                        Status
                      </th>

                      <th className="px-5 py-3.5 text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((j, index) => {
                      const Icon =
                        ICONS[j.icon] || GraduationCap;

                      return (
                        <tr
                          key={j.id}
                          className="
                            theme-table-hover
                            border-b
                            theme-border-soft
                            transition
                            last:border-0
                          "
                        >
                          {/* NO */}
                          <td className="px-5 py-4 text-center text-sm font-medium theme-text-muted">
                            {index + 1}
                          </td>

                          {/* JURUSAN */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="theme-info flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                                <Icon
                                  size={18}
                                  strokeWidth={2}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold theme-text">
                                  {j.nama}
                                </p>

                                <p className="mt-0.5 text-xs theme-text-muted">
                                  Kode {j.kode}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* JENJANG */}
                          <td className="px-5 py-4">
                            <JenjangBadge
                              jenjang={j.jenjang}
                            />
                          </td>

                          {/* KEPALA */}
                          <td className="px-5 py-4">
                            <p className="max-w-[220px] truncate text-sm theme-text-secondary">
                              {j.kepala || "-"}
                            </p>
                          </td>

                          {/* KELAS */}
                          <td className="px-5 py-4 text-center text-sm font-medium theme-text-secondary">
                            {j.kelas}
                          </td>

                          {/* SISWA */}
                          <td className="px-5 py-4 text-center text-sm font-medium theme-text-secondary">
                            {j.siswa.toLocaleString("id-ID")}
                          </td>

                          {/* STATUS */}
                          <td className="px-5 py-4">
                            <StatusBadge
                              status={j.status}
                            />
                          </td>

                          {/* AKSI */}
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                title="Lihat detail"
                                className="
                                  theme-header-hover
                                  theme-text-muted
                                  flex h-8 w-8
                                  items-center justify-center
                                  rounded-md
                                  transition
                                "
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openEdit(j)
                                }
                                title="Edit jurusan"
                                className="
                                  theme-header-hover
                                  theme-text-muted
                                  flex h-8 w-8
                                  items-center justify-center
                                  rounded-md
                                  transition
                                "
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmDeleteId(j.id)
                                }
                                title="Hapus jurusan"
                                className="
                                  theme-danger
                                  flex h-8 w-8
                                  items-center justify-center
                                  rounded-md
                                  transition
                                "
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* EMPTY */}
                    {filtered.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-5 py-16 text-center"
                        >
                          <div
                            className="
                              theme-card-soft
                              theme-text-muted
                              mx-auto flex h-12 w-12
                              items-center justify-center
                              rounded-full
                            "
                          >
                            <Search size={21} />
                          </div>

                          <p className="mt-3 text-sm font-semibold theme-text-secondary">
                            Jurusan tidak ditemukan
                          </p>

                          <p className="mt-1 text-xs theme-text-muted">
                            Coba ubah kata kunci atau filter
                            pencarian.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLE FOOTER */}
              <div className="border-t theme-border-soft theme-card-soft px-5 py-3">
                <p className="text-xs theme-text-muted">
                  Menampilkan{" "}
                  <span className="font-medium theme-text-secondary">
                    {filtered.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium theme-text-secondary">
                    {data.length}
                  </span>{" "}
                  jurusan
                </p>
              </div>
            </div>

            {/* =================================================
                ADD / EDIT MODAL
            ================================================= */}

            {modalMode && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
                <div
                  className="
                    theme-card
                    theme-border
                    max-h-[92vh] w-full max-w-2xl
                    overflow-y-auto
                    rounded-2xl border
                    shadow-2xl
                  "
                >
                  {/* MODAL HEADER */}
                  <div
                    className="
                      theme-card
                      sticky top-0 z-10
                      flex items-center justify-between
                      border-b theme-border
                      px-5 py-4
                      sm:px-6
                    "
                  >
                    <div>
                      <h2 className="text-lg font-bold theme-text">
                        {modalMode === "add"
                          ? "Tambah Jurusan"
                          : "Edit Jurusan"}
                      </h2>

                      <p className="mt-0.5 text-xs theme-text-muted">
                        Lengkapi informasi jurusan sekolah
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={closeModal}
                      className="
                        theme-header-hover
                        theme-text-muted
                        flex h-9 w-9
                        items-center justify-center
                        rounded-lg
                        transition
                      "
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* MODAL BODY */}
                  <div className="p-5 sm:p-6">
                    <JurusanForm
                      initial={activeItem}
                      onCancel={closeModal}
                      onSave={saveItem}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                DELETE MODAL
            ================================================= */}

            {confirmDeleteId !== null && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
                <div
                  className="
                    theme-card
                    theme-border
                    w-full max-w-md
                    rounded-2xl border
                    p-6
                    shadow-2xl
                  "
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="
                        theme-danger
                        flex h-11 w-11 shrink-0
                        items-center justify-center
                        rounded-full
                      "
                    >
                      <Trash2 size={20} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold theme-text">
                        Hapus jurusan?
                      </h2>

                      <p className="mt-1.5 text-sm leading-6 theme-text-muted">
                        Data jurusan ini akan dihapus dari
                        sistem. Pastikan tidak ada data kelas
                        atau siswa yang masih menggunakan
                        jurusan tersebut.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDeleteId(null)
                      }
                      className="
                        theme-card
                        theme-border
                        theme-text-secondary
                        theme-header-hover
                        h-10 rounded-lg
                        border
                        px-5
                        text-sm font-medium
                        transition
                      "
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(confirmDeleteId)
                      }
                      className="
                        theme-danger
                        h-10 rounded-lg
                        px-5
                        text-sm font-semibold
                        transition
                      "
                    >
                      Ya, Hapus
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}