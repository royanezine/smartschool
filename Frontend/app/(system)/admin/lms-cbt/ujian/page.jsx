"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  FileCheck2,
  Users,
  Clock3,
  CalendarDays,
  Eye,
  Pencil,
  Trash2,
  X,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

/* ============================================================
   THEME HELPERS
============================================================ */

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

/* ============================================================
   DATA
============================================================ */

const initialUjian = [
  {
    id: 1,
    nama: "Ujian Tengah Semester",
    mapel: "Pemrograman Web",
    kelas: "XII PPLG 1",
    guru: "Budi Santoso, S.Kom",
    jumlahSoal: 40,
    durasi: 90,
    tanggal: "10 September 2026",
    waktu: "08:00 - 09:30",
    peserta: 32,
    status: "Terjadwal",
  },
  {
    id: 2,
    nama: "Ujian Praktik Basis Data",
    mapel: "Basis Data",
    kelas: "XII PPLG 1",
    guru: "Andi Pratama, S.Kom",
    jumlahSoal: 30,
    durasi: 60,
    tanggal: "12 September 2026",
    waktu: "10:00 - 11:00",
    peserta: 30,
    status: "Aktif",
  },
  {
    id: 3,
    nama: "Penilaian Harian",
    mapel: "Jaringan Komputer",
    kelas: "XI PPLG 2",
    guru: "Dewi Lestari, S.Kom",
    jumlahSoal: 25,
    durasi: 45,
    tanggal: "14 September 2026",
    waktu: "08:30 - 09:15",
    peserta: 28,
    status: "Draft",
  },
  {
    id: 4,
    nama: "Ujian Akhir Semester",
    mapel: "Pemrograman Dasar",
    kelas: "X PPLG 1",
    guru: "Rizky Ramadhan, S.Kom",
    jumlahSoal: 50,
    durasi: 120,
    tanggal: "18 September 2026",
    waktu: "07:30 - 09:30",
    peserta: 34,
    status: "Terjadwal",
  },
  {
    id: 5,
    nama: "Quiz HTML & CSS",
    mapel: "Pemrograman Web",
    kelas: "XI PPLG 1",
    guru: "Budi Santoso, S.Kom",
    jumlahSoal: 20,
    durasi: 30,
    tanggal: "5 September 2026",
    waktu: "09:00 - 09:30",
    peserta: 31,
    status: "Selesai",
  },
];

/* ============================================================
   STATUS CONFIG
============================================================ */

const statusConfig = {
  Aktif: {
    className:
      "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)] border-[color-mix(in_srgb,var(--color-success)_20%,transparent)]",
    icon: CheckCircle2,
  },

  Terjadwal: {
    className:
      "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)]",
    icon: CalendarDays,
  },

  Draft: {
    className:
      "bg-[color-mix(in_srgb,var(--color-text)_6%,transparent)] theme-text-secondary border-[color-mix(in_srgb,var(--color-text)_12%,transparent)]",
    icon: ClipboardList,
  },

  Selesai: {
    className:
      "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)] border-[color-mix(in_srgb,var(--color-info)_20%,transparent)]",
    icon: CheckCircle2,
  },
};

/* ============================================================
   PAGE
============================================================ */

export default function UjianCbtPage() {
  const [ujian, setUjian] = useState(initialUjian);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [selectedUjian, setSelectedUjian] = useState(null);
  const [modal, setModal] = useState(null);

  /* ============================================================
     FILTER
  ============================================================ */

  const filteredUjian = useMemo(() => {
    return ujian.filter((item) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        item.nama.toLowerCase().includes(keyword) ||
        item.mapel.toLowerCase().includes(keyword) ||
        item.kelas.toLowerCase().includes(keyword) ||
        item.guru.toLowerCase().includes(keyword);

      const matchesStatus =
        filterStatus === "Semua" ||
        item.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [ujian, search, filterStatus]);

  /* ============================================================
     STATISTICS
  ============================================================ */

  const totalUjian = ujian.length;

  const aktif = ujian.filter(
    (item) => item.status === "Aktif"
  ).length;

  const terjadwal = ujian.filter(
    (item) => item.status === "Terjadwal"
  ).length;

  const selesai = ujian.filter(
    (item) => item.status === "Selesai"
  ).length;

  /* ============================================================
     MODAL HANDLERS
  ============================================================ */

  const openDetail = (item) => {
    setSelectedUjian(item);
    setModal("detail");
  };

  const openEdit = (item) => {
    setSelectedUjian(item);
    setModal("edit");
  };

  const openDelete = (item) => {
    setSelectedUjian(item);
    setModal("delete");
  };

  const deleteUjian = () => {
    setUjian((prev) =>
      prev.filter(
        (item) => item.id !== selectedUjian.id
      )
    );

    setSelectedUjian(null);
    setModal(null);
  };

  return (
    <div className="min-h-screen theme-page flex">
      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6">
          {/* ==================================================
              BREADCRUMB
          ================================================== */}

          <div className="flex items-center gap-2 text-sm theme-text-secondary mb-5">
            <span>CBT</span>

            <span className="theme-text-muted">
              /
            </span>

            <span className="theme-text font-medium">
              Ujian
            </span>
          </div>

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold theme-text">
                Ujian CBT
              </h1>

              <p className="text-sm theme-text-secondary mt-1">
                Kelola ujian berbasis komputer untuk siswa
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedUjian(null);
                setModal("add");
              }}
              className="
                inline-flex items-center justify-center gap-2
                px-4 py-2.5
                bg-[var(--color-primary)]
                hover:opacity-90
                text-white
                rounded-lg
                text-sm
                font-medium
                transition
                shadow-[0_6px_18px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]
              "
            >
              <Plus size={18} />
              Buat Ujian
            </button>
          </div>

          {/* ==================================================
              STATISTICS
          ================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Ujian"
              value={totalUjian}
              icon={FileCheck2}
              description="Semua ujian"
              variant="primary"
            />

            <StatCard
              title="Ujian Aktif"
              value={aktif}
              icon={CheckCircle2}
              description="Sedang berlangsung"
              variant="success"
            />

            <StatCard
              title="Terjadwal"
              value={terjadwal}
              icon={CalendarDays}
              description="Akan datang"
              variant="info"
            />

            <StatCard
              title="Selesai"
              value={selesai}
              icon={ClipboardList}
              description="Sudah selesai"
              variant="warning"
            />
          </div>

          {/* ==================================================
              MAIN CARD
          ================================================== */}

          <div
            className={`
              theme-card
              border
              theme-border
              rounded-xl
              overflow-hidden
              ${themeCardShadow}
            `}
          >
            {/* ==================================================
                TOOLBAR
            ================================================== */}

            <div className="p-4 border-b theme-border">
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                {/* SEARCH */}

                <div className="relative w-full lg:max-w-md">
                  <Search
                    size={18}
                    className="
                      absolute left-3 top-1/2
                      -translate-y-1/2
                      theme-text-muted
                    "
                  />

                  <input
                    type="text"
                    placeholder="Cari ujian, mata pelajaran, kelas..."
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    className="
                      theme-input
                      w-full
                      pl-10 pr-4 py-2.5
                      border
                      theme-border
                      rounded-lg
                      text-sm
                      theme-text
                      theme-text-placeholder
                      outline-none
                      focus:ring-2
                      focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]
                      focus:border-[var(--color-primary)]
                    "
                  />
                </div>

                {/* FILTER */}

                <div className="flex items-center gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value)
                    }
                    className="
                      theme-input
                      px-3 py-2.5
                      border
                      theme-border
                      rounded-lg
                      text-sm
                      theme-text-secondary
                      outline-none
                      focus:ring-2
                      focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]
                      focus:border-[var(--color-primary)]
                    "
                  >
                    <option value="Semua">
                      Semua Status
                    </option>

                    <option value="Aktif">
                      Aktif
                    </option>

                    <option value="Terjadwal">
                      Terjadwal
                    </option>

                    <option value="Draft">
                      Draft
                    </option>

                    <option value="Selesai">
                      Selesai
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* ==================================================
                DESKTOP TABLE
            ================================================== */}

            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="theme-card-soft border-b theme-border">
                    <th className="px-5 py-3 text-left text-xs font-semibold theme-text-secondary">
                      No
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold theme-text-secondary">
                      Ujian
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold theme-text-secondary">
                      Kelas
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold theme-text-secondary">
                      Jadwal
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold theme-text-secondary">
                      Soal
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold theme-text-secondary">
                      Peserta
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold theme-text-secondary">
                      Status
                    </th>

                    <th className="px-5 py-3 text-center text-xs font-semibold theme-text-secondary">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y theme-border-soft">
                  {filteredUjian.map(
                    (item, index) => (
                      <UjianRow
                        key={item.id}
                        item={item}
                        index={index}
                        onDetail={openDetail}
                        onEdit={openEdit}
                        onDelete={openDelete}
                      />
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* ==================================================
                MOBILE
            ================================================== */}

            <div className="lg:hidden divide-y theme-border-soft">
              {filteredUjian.map((item) => {
                const status =
                  statusConfig[item.status] ||
                  statusConfig.Draft;

                const StatusIcon = status.icon;

                return (
                  <div
                    key={item.id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold theme-text">
                          {item.nama}
                        </h3>

                        <p className="text-sm theme-text-secondary mt-1">
                          {item.mapel} •{" "}
                          {item.kelas}
                        </p>
                      </div>

                      <span
                        className={`
                          shrink-0
                          inline-flex items-center gap-1
                          px-2.5 py-1
                          rounded-full
                          border
                          text-xs
                          font-medium
                          ${status.className}
                        `}
                      >
                        <StatusIcon size={13} />
                        {item.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                      <InfoItem
                        icon={CalendarDays}
                        label="Tanggal"
                        value={item.tanggal}
                      />

                      <InfoItem
                        icon={Clock3}
                        label="Durasi"
                        value={`${item.durasi} menit`}
                      />

                      <InfoItem
                        icon={ClipboardList}
                        label="Jumlah Soal"
                        value={`${item.jumlahSoal} soal`}
                      />

                      <InfoItem
                        icon={Users}
                        label="Peserta"
                        value={`${item.peserta} siswa`}
                      />
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() =>
                          openDetail(item)
                        }
                        className="
                          flex-1
                          px-3 py-2
                          border
                          theme-border
                          rounded-lg
                          text-sm
                          font-medium
                          theme-text-secondary
                          hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                        "
                      >
                        Detail
                      </button>

                      <button
                        onClick={() =>
                          openEdit(item)
                        }
                        className="
                          p-2
                          border
                          theme-border
                          rounded-lg
                          theme-text-secondary
                          hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                        "
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() =>
                          openDelete(item)
                        }
                        className="
                          p-2
                          border
                          border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)]
                          rounded-lg
                          text-[var(--color-danger)]
                          hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]
                        "
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ==================================================
                EMPTY
            ================================================== */}

            {filteredUjian.length === 0 && (
              <div className="py-16 text-center">
                <FileCheck2
                  size={42}
                  className="mx-auto theme-text-muted"
                />

                <h3 className="mt-3 font-semibold theme-text">
                  Ujian tidak ditemukan
                </h3>

                <p className="text-sm theme-text-muted mt-1">
                  Coba ubah kata pencarian atau filter.
                </p>
              </div>
            )}

            {/* ==================================================
                FOOTER
            ================================================== */}

            {filteredUjian.length > 0 && (
              <div className="px-5 py-4 border-t theme-border flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <p className="text-sm theme-text-secondary">
                  Menampilkan{" "}
                  <span className="font-medium theme-text">
                    {filteredUjian.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium theme-text">
                    {ujian.length}
                  </span>{" "}
                  ujian
                </p>

                <p className="text-xs theme-text-muted">
                  Data ujian CBT
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ========================================================
          DETAIL MODAL
      ======================================================== */}

      {modal === "detail" &&
        selectedUjian && (
          <Modal
            title="Detail Ujian"
            onClose={() => {
              setModal(null);
              setSelectedUjian(null);
            }}
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs theme-text-muted">
                  Nama Ujian
                </p>

                <p className="font-semibold theme-text mt-1">
                  {selectedUjian.nama}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  label="Mata Pelajaran"
                  value={selectedUjian.mapel}
                />

                <DetailItem
                  label="Kelas"
                  value={selectedUjian.kelas}
                />

                <DetailItem
                  label="Guru"
                  value={selectedUjian.guru}
                />

                <DetailItem
                  label="Jumlah Soal"
                  value={`${selectedUjian.jumlahSoal} soal`}
                />

                <DetailItem
                  label="Durasi"
                  value={`${selectedUjian.durasi} menit`}
                />

                <DetailItem
                  label="Peserta"
                  value={`${selectedUjian.peserta} siswa`}
                />

                <DetailItem
                  label="Tanggal"
                  value={selectedUjian.tanggal}
                />

                <DetailItem
                  label="Waktu"
                  value={selectedUjian.waktu}
                />
              </div>

              <div className="pt-3 border-t theme-border-soft flex justify-end">
                <button
                  onClick={() => setModal(null)}
                  className="
                    px-4 py-2
                    bg-[var(--color-primary)]
                    hover:opacity-90
                    text-white
                    rounded-lg
                    text-sm
                    font-medium
                  "
                >
                  Tutup
                </button>
              </div>
            </div>
          </Modal>
        )}

      {/* ========================================================
          ADD MODAL
      ======================================================== */}

      {modal === "add" && (
        <Modal
          title="Buat Ujian CBT"
          onClose={() => setModal(null)}
        >
          <UjianForm
            onCancel={() => setModal(null)}
            onSave={(data) => {
              setUjian((prev) => [
                ...prev,
                {
                  ...data,
                  id: Date.now(),
                  status: "Draft",
                  peserta: 0,
                },
              ]);

              setModal(null);
            }}
          />
        </Modal>
      )}

      {/* ========================================================
          EDIT MODAL
      ======================================================== */}

      {modal === "edit" &&
        selectedUjian && (
          <Modal
            title="Edit Ujian CBT"
            onClose={() => setModal(null)}
          >
            <UjianForm
              initialData={selectedUjian}
              onCancel={() => setModal(null)}
              onSave={(data) => {
                setUjian((prev) =>
                  prev.map((item) =>
                    item.id === selectedUjian.id
                      ? {
                          ...item,
                          ...data,
                        }
                      : item
                  )
                );

                setModal(null);
                setSelectedUjian(null);
              }}
            />
          </Modal>
        )}

      {/* ========================================================
          DELETE MODAL
      ======================================================== */}

      {modal === "delete" &&
        selectedUjian && (
          <Modal
            title="Hapus Ujian"
            onClose={() => setModal(null)}
          >
            <div className="text-center">
              <div
                className="
                  w-12 h-12
                  mx-auto
                  rounded-full
                  bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)]
                  flex items-center justify-center
                "
              >
                <Trash2
                  size={22}
                  className="text-[var(--color-danger)]"
                />
              </div>

              <h3 className="font-semibold theme-text mt-4">
                Hapus ujian ini?
              </h3>

              <p className="text-sm theme-text-secondary mt-2">
                Ujian{" "}
                <span className="font-medium theme-text">
                  {selectedUjian.nama}
                </span>{" "}
                akan dihapus dari daftar.
              </p>

              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => setModal(null)}
                  className="
                    px-4 py-2
                    border
                    theme-border
                    rounded-lg
                    text-sm
                    font-medium
                    theme-text-secondary
                    hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
                  "
                >
                  Batal
                </button>

                <button
                  onClick={deleteUjian}
                  className="
                    px-4 py-2
                    bg-[var(--color-danger)]
                    hover:opacity-90
                    text-white
                    rounded-lg
                    text-sm
                    font-medium
                  "
                >
                  Hapus
                </button>
              </div>
            </div>
          </Modal>
        )}
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "primary",
}) {
  const variantConfig = {
    primary: {
      bg: "bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)]",
      text: "text-[var(--color-primary)]",
    },

    success: {
      bg: "bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)]",
      text: "text-[var(--color-success)]",
    },

    warning: {
      bg: "bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)]",
      text: "text-[var(--color-warning)]",
    },

    info: {
      bg: "bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)]",
      text: "text-[var(--color-info)]",
    },
  };

  const current =
    variantConfig[variant] ||
    variantConfig.primary;

  return (
    <div
      className="
        theme-card
        border
        theme-border
        rounded-xl
        p-5
        shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm theme-text-secondary">
            {title}
          </p>

          <p className="text-2xl font-bold theme-text mt-2">
            {value}
          </p>

          <p className="text-xs theme-text-muted mt-1">
            {description}
          </p>
        </div>

        <div
          className={`
            w-10 h-10
            rounded-lg
            ${current.bg}
            flex items-center justify-center
            ${current.text}
          `}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   UJIAN ROW
============================================================ */

function UjianRow({
  item,
  index,
  onDetail,
  onEdit,
  onDelete,
}) {
  const status =
    statusConfig[item.status] ||
    statusConfig.Draft;

  const StatusIcon = status.icon;

  return (
    <tr
      className="
        hover:bg-[color-mix(in_srgb,var(--color-text)_3%,transparent)]
        transition
      "
    >
      <td className="px-5 py-4 text-sm theme-text-secondary">
        {index + 1}
      </td>

      <td className="px-5 py-4">
        <div>
          <p className="font-semibold text-sm theme-text">
            {item.nama}
          </p>

          <p className="text-xs theme-text-secondary mt-1">
            {item.mapel}
          </p>

          <p className="text-xs theme-text-muted mt-1">
            {item.guru}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="text-sm theme-text">
          {item.kelas}
        </span>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm theme-text">
          {item.tanggal}
        </p>

        <p className="text-xs theme-text-muted mt-1 flex items-center gap-1">
          <Clock3 size={13} />
          {item.waktu}
        </p>
      </td>

      <td className="px-5 py-4 text-center">
        <div className="inline-flex items-center gap-1 text-sm theme-text">
          <ClipboardList size={15} />
          {item.jumlahSoal}
        </div>

        <p className="text-xs theme-text-muted mt-1">
          {item.durasi} menit
        </p>
      </td>

      <td className="px-5 py-4 text-center">
        <div className="inline-flex items-center gap-1 text-sm theme-text">
          <Users size={15} />
          {item.peserta}
        </div>
      </td>

      <td className="px-5 py-4 text-center">
        <span
          className={`
            inline-flex items-center gap-1
            px-2.5 py-1
            rounded-full
            border
            text-xs
            font-medium
            ${status.className}
          `}
        >
          <StatusIcon size={13} />
          {item.status}
        </span>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onDetail(item)}
            title="Detail"
            className="
              p-2
              rounded-lg
              theme-text-secondary
              hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
              hover:text-[var(--color-primary)]
              transition
            "
          >
            <Eye size={17} />
          </button>

          <button
            onClick={() => onEdit(item)}
            title="Edit"
            className="
              p-2
              rounded-lg
              theme-text-secondary
              hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
              hover:text-[var(--color-warning)]
              transition
            "
          >
            <Pencil size={17} />
          </button>

          <button
            onClick={() => onDelete(item)}
            title="Hapus"
            className="
              p-2
              rounded-lg
              text-[var(--color-danger)]
              hover:bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)]
              transition
            "
          >
            <Trash2 size={17} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs theme-text-muted flex items-center gap-1">
        <Icon size={13} />
        {label}
      </p>

      <p className="text-sm font-medium theme-text mt-1">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   DETAIL ITEM
============================================================ */

function DetailItem({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs theme-text-muted">
        {label}
      </p>

      <p className="text-sm font-medium theme-text mt-1">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   MODAL
============================================================ */

function Modal({
  title,
  children,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* BACKDROP */}

      <div
        className="
          absolute inset-0
          bg-[color-mix(in_srgb,var(--color-text)_40%,transparent)]
          backdrop-blur-sm
        "
        onClick={onClose}
      />

      {/* MODAL */}

      <div
        className="
          relative
          w-full
          max-w-lg
          theme-card
          border
          theme-border
          rounded-xl
          shadow-[0_20px_60px_color-mix(in_srgb,var(--color-text)_18%,transparent)]
          max-h-[90vh]
          overflow-y-auto
        "
      >
        <div className="flex items-center justify-between px-5 py-4 border-b theme-border">
          <h2 className="font-semibold theme-text">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="
              p-1.5
              rounded-lg
              theme-text-muted
              hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
              hover:text-[var(--color-primary)]
              transition
            "
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   UJIAN FORM
============================================================ */

function UjianForm({
  initialData,
  onCancel,
  onSave,
}) {
  const [form, setForm] = useState({
    nama: initialData?.nama || "",
    mapel: initialData?.mapel || "",
    kelas: initialData?.kelas || "",
    guru: initialData?.guru || "",
    jumlahSoal:
      initialData?.jumlahSoal || 20,
    durasi: initialData?.durasi || 60,
    tanggal: initialData?.tanggal || "",
    waktu: initialData?.waktu || "",
  });

  const update = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();

    onSave({
      ...form,
      jumlahSoal: Number(form.jumlahSoal),
      durasi: Number(form.durasi),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <FormInput
        label="Nama Ujian"
        value={form.nama}
        onChange={(value) =>
          update("nama", value)
        }
        placeholder="Contoh: Ujian Tengah Semester"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Mata Pelajaran"
          value={form.mapel}
          onChange={(value) =>
            update("mapel", value)
          }
          placeholder="Contoh: Pemrograman Web"
          required
        />

        <FormInput
          label="Kelas"
          value={form.kelas}
          onChange={(value) =>
            update("kelas", value)
          }
          placeholder="Contoh: XII PPLG 1"
          required
        />
      </div>

      <FormInput
        label="Guru"
        value={form.guru}
        onChange={(value) =>
          update("guru", value)
        }
        placeholder="Nama guru"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Jumlah Soal"
          type="number"
          value={form.jumlahSoal}
          onChange={(value) =>
            update("jumlahSoal", value)
          }
          required
        />

        <FormInput
          label="Durasi (menit)"
          type="number"
          value={form.durasi}
          onChange={(value) =>
            update("durasi", value)
          }
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Tanggal"
          value={form.tanggal}
          onChange={(value) =>
            update("tanggal", value)
          }
          placeholder="10 September 2026"
          required
        />

        <FormInput
          label="Waktu"
          value={form.waktu}
          onChange={(value) =>
            update("waktu", value)
          }
          placeholder="08:00 - 09:30"
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t theme-border-soft">
        <button
          type="button"
          onClick={onCancel}
          className="
            px-4 py-2
            border
            theme-border
            rounded-lg
            text-sm
            font-medium
            theme-text-secondary
            hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]
            transition
          "
        >
          Batal
        </button>

        <button
          type="submit"
          className="
            px-4 py-2
            bg-[var(--color-primary)]
            hover:opacity-90
            text-white
            rounded-lg
            text-sm
            font-medium
            transition
          "
        >
          {initialData
            ? "Simpan Perubahan"
            : "Buat Ujian"}
        </button>
      </div>
    </form>
  );
}

/* ============================================================
   FORM INPUT
============================================================ */

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-medium theme-text-secondary mb-1.5">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="
          theme-input
          w-full
          px-3 py-2.5
          border
          theme-border
          rounded-lg
          text-sm
          theme-text
          theme-text-placeholder
          outline-none
          focus:ring-2
          focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]
          focus:border-[var(--color-primary)]
        "
      />
    </div>
  );
}