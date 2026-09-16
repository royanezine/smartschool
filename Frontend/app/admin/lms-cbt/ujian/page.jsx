"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  FileCheck2,
  Users,
  Clock3,
  CalendarDays,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  X,
  ClipboardList,
  CheckCircle2,
  CircleAlert,
  Timer,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";

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

const statusConfig = {
  Aktif: {
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  Terjadwal: {
    className: "bg-blue-50 text-blue-700 border-blue-200",
    icon: CalendarDays,
  },
  Draft: {
    className: "bg-slate-100 text-slate-600 border-slate-200",
    icon: ClipboardList,
  },
  Selesai: {
    className: "bg-violet-50 text-violet-700 border-violet-200",
    icon: CheckCircle2,
  },
};

export default function UjianCbtPage() {
  const [ujian, setUjian] = useState(initialUjian);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [selectedUjian, setSelectedUjian] = useState(null);
  const [modal, setModal] = useState(null);

  const filteredUjian = useMemo(() => {
    return ujian.filter((item) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        item.nama.toLowerCase().includes(keyword) ||
        item.mapel.toLowerCase().includes(keyword) ||
        item.kelas.toLowerCase().includes(keyword) ||
        item.guru.toLowerCase().includes(keyword);

      const matchesStatus =
        filterStatus === "Semua" || item.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [ujian, search, filterStatus]);

  const totalUjian = ujian.length;
  const aktif = ujian.filter((item) => item.status === "Aktif").length;
  const terjadwal = ujian.filter(
    (item) => item.status === "Terjadwal"
  ).length;
  const selesai = ujian.filter((item) => item.status === "Selesai").length;

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
      prev.filter((item) => item.id !== selectedUjian.id)
    );

    setSelectedUjian(null);
    setModal(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header />

        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-5">
            <span>CBT</span>
            <span>/</span>
            <span className="text-slate-800 font-medium">Ujian</span>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Ujian CBT
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Kelola ujian berbasis komputer untuk siswa
              </p>
            </div>

            <button
              onClick={() => {
                setSelectedUjian(null);
                setModal("add");
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition"
            >
              <Plus size={18} />
              Buat Ujian
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Total Ujian"
              value={totalUjian}
              icon={FileCheck2}
              description="Semua ujian"
            />

            <StatCard
              title="Ujian Aktif"
              value={aktif}
              icon={CheckCircle2}
              description="Sedang berlangsung"
            />

            <StatCard
              title="Terjadwal"
              value={terjadwal}
              icon={CalendarDays}
              description="Akan datang"
            />

            <StatCard
              title="Selesai"
              value={selesai}
              icon={ClipboardList}
              description="Sudah selesai"
            />
          </div>

          {/* Main Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                {/* Search */}
                <div className="relative w-full lg:max-w-md">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    placeholder="Cari ujian, mata pelajaran, kelas..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
                  />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Terjadwal">Terjadwal</option>
                    <option value="Draft">Draft</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                      No
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                      Ujian
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                      Kelas
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                      Jadwal
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">
                      Soal
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">
                      Peserta
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUjian.map((item, index) => (
                    <UjianRow
                      key={item.id}
                      item={item}
                      index={index}
                      onDetail={openDetail}
                      onEdit={openEdit}
                      onDelete={openDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-slate-100">
              {filteredUjian.map((item) => {
                const status = statusConfig[item.status] || statusConfig.Draft;
                const StatusIcon = status.icon;

                return (
                  <div key={item.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-800">
                          {item.nama}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {item.mapel} • {item.kelas}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${status.className}`}
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
                        onClick={() => openDetail(item)}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Detail
                      </button>

                      <button
                        onClick={() => openEdit(item)}
                        className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        onClick={() => openDelete(item)}
                        className="p-2 border border-red-200 rounded-lg text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty */}
            {filteredUjian.length === 0 && (
              <div className="py-16 text-center">
                <FileCheck2
                  size={42}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-3 font-semibold text-slate-700">
                  Ujian tidak ditemukan
                </h3>

                <p className="text-sm text-slate-400 mt-1">
                  Coba ubah kata pencarian atau filter.
                </p>
              </div>
            )}

            {/* Footer */}
            {filteredUjian.length > 0 && (
              <div className="px-5 py-4 border-t border-slate-200 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Menampilkan{" "}
                  <span className="font-medium text-slate-700">
                    {filteredUjian.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-medium text-slate-700">
                    {ujian.length}
                  </span>{" "}
                  ujian
                </p>

                <p className="text-xs text-slate-400">
                  Data ujian CBT
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {modal === "detail" && selectedUjian && (
        <Modal
          title="Detail Ujian"
          onClose={() => {
            setModal(null);
            setSelectedUjian(null);
          }}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400">Nama Ujian</p>
              <p className="font-semibold text-slate-800 mt-1">
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

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
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

      {/* Edit Modal */}
      {modal === "edit" && selectedUjian && (
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

      {/* Delete Modal */}
      {modal === "delete" && selectedUjian && (
        <Modal
          title="Hapus Ujian"
          onClose={() => setModal(null)}
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center">
              <Trash2 size={22} className="text-red-500" />
            </div>

            <h3 className="font-semibold text-slate-800 mt-4">
              Hapus ujian ini?
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Ujian{" "}
              <span className="font-medium text-slate-700">
                {selectedUjian.nama}
              </span>{" "}
              akan dihapus dari daftar.
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>

              <button
                onClick={deleteUjian}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
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

/* =========================
   COMPONENTS
========================= */

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <p className="text-2xl font-bold text-slate-800 mt-2">
            {value}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {description}
          </p>
        </div>

        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
          <Icon size={20} className="text-slate-600" />
        </div>
      </div>
    </div>
  );
}

function UjianRow({
  item,
  index,
  onDetail,
  onEdit,
  onDelete,
}) {
  const status = statusConfig[item.status] || statusConfig.Draft;
  const StatusIcon = status.icon;

  return (
    <tr className="hover:bg-slate-50/70 transition">
      <td className="px-5 py-4 text-sm text-slate-500">
        {index + 1}
      </td>

      <td className="px-5 py-4">
        <div>
          <p className="font-semibold text-sm text-slate-800">
            {item.nama}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            {item.mapel}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            {item.guru}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="text-sm text-slate-700">
          {item.kelas}
        </span>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-slate-700">
          {item.tanggal}
        </p>

        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
          <Clock3 size={13} />
          {item.waktu}
        </p>
      </td>

      <td className="px-5 py-4 text-center">
        <div className="inline-flex items-center gap-1 text-sm text-slate-700">
          <ClipboardList size={15} />
          {item.jumlahSoal}
        </div>

        <p className="text-xs text-slate-400 mt-1">
          {item.durasi} menit
        </p>
      </td>

      <td className="px-5 py-4 text-center">
        <div className="inline-flex items-center gap-1 text-sm text-slate-700">
          <Users size={15} />
          {item.peserta}
        </div>
      </td>

      <td className="px-5 py-4 text-center">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium ${status.className}`}
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
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <Eye size={17} />
          </button>

          <button
            onClick={() => onEdit(item)}
            title="Edit"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <Pencil size={17} />
          </button>

          <button
            onClick={() => onDelete(item)}
            title="Hapus"
            className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 flex items-center gap-1">
        <Icon size={13} />
        {label}
      </p>

      <p className="text-sm font-medium text-slate-700 mt-1">
        {value}
      </p>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-700 mt-1">
        {value}
      </p>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-800">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

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
    jumlahSoal: initialData?.jumlahSoal || 20,
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
        onChange={(value) => update("nama", value)}
        placeholder="Contoh: Ujian Tengah Semester"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Mata Pelajaran"
          value={form.mapel}
          onChange={(value) => update("mapel", value)}
          placeholder="Contoh: Pemrograman Web"
          required
        />

        <FormInput
          label="Kelas"
          value={form.kelas}
          onChange={(value) => update("kelas", value)}
          placeholder="Contoh: XII PPLG 1"
          required
        />
      </div>

      <FormInput
        label="Guru"
        value={form.guru}
        onChange={(value) => update("guru", value)}
        placeholder="Nama guru"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Jumlah Soal"
          type="number"
          value={form.jumlahSoal}
          onChange={(value) => update("jumlahSoal", value)}
          required
        />

        <FormInput
          label="Durasi (menit)"
          type="number"
          value={form.durasi}
          onChange={(value) => update("durasi", value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Tanggal"
          value={form.tanggal}
          onChange={(value) => update("tanggal", value)}
          placeholder="10 September 2026"
          required
        />

        <FormInput
          label="Waktu"
          value={form.waktu}
          onChange={(value) => update("waktu", value)}
          placeholder="08:00 - 09:30"
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Batal
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium"
        >
          {initialData ? "Simpan Perubahan" : "Buat Ujian"}
        </button>
      </div>
    </form>
  );
}

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
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
      />
    </div>
  );
}