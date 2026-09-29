"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Filter,
  Info,
  RefreshCw,
  Search,
  User,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";

/* ================================================================
   TYPES / STATUS
================================================================ */

const STATUS_CONFIG = {
  menunggu: {
    label: "Menunggu",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  disetujui: {
    label: "Disetujui",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  ditolak: {
    label: "Ditolak",
    className: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
};

const JENIS_IZIN = [
  "Semua",
  "Sakit",
  "Keperluan Keluarga",
  "Keperluan Dinas",
  "Keperluan Pribadi",
];

/* ================================================================
   DUMMY DATA
================================================================ */

const INITIAL_DATA = [
  {
    id: 1,
    nama: "Dian Puspita, S.Pd.",
    nip: "198705122014022001",
    jabatan: "Guru Matematika",
    jenis: "Sakit",
    tanggalMulai: "2026-09-10",
    tanggalSelesai: "2026-09-10",
    jumlahHari: 1,
    alasan:
      "Tidak dapat hadir karena sedang kurang sehat dan membutuhkan waktu untuk beristirahat.",
    status: "menunggu",
    diajukan: "2026-09-09 07:42",
    alasanPenolakan: null,
    diprosesOleh: null,
    diprosesPada: null,
    guruPengganti: null,
  },
  {
    id: 2,
    nama: "Budi Santoso, S.Pd.",
    nip: "198903182015031002",
    jabatan: "Guru Bahasa Indonesia",
    jenis: "Keperluan Keluarga",
    tanggalMulai: "2026-09-11",
    tanggalSelesai: "2026-09-11",
    jumlahHari: 1,
    alasan:
      "Menghadiri keperluan keluarga yang tidak dapat ditinggalkan.",
    status: "menunggu",
    diajukan: "2026-09-09 08:15",
    alasanPenolakan: null,
    diprosesOleh: null,
    diprosesPada: null,
    guruPengganti: null,
  },
  {
    id: 3,
    nama: "Rina Maharani, S.Pd.",
    nip: "199101222016022003",
    jabatan: "Guru Bahasa Inggris",
    jenis: "Sakit",
    tanggalMulai: "2026-09-08",
    tanggalSelesai: "2026-09-09",
    jumlahHari: 2,
    alasan:
      "Mengajukan izin sakit selama dua hari berdasarkan kondisi kesehatan.",
    status: "disetujui",
    diajukan: "2026-09-08 06:55",
    alasanPenolakan: null,
    diprosesOleh: "Admin Sekolah",
    diprosesPada: "2026-09-08 07:10",
    guruPengganti: {
      id: 102,
      nama: "Andi Wijaya, S.Pd.",
      nip: "198812052014011004",
      jabatan: "Guru IPA",
      tanggalMulai: "2026-09-08",
      tanggalSelesai: "2026-09-09",
      sebagai: "Guru Pengganti",
    },
  },
  {
    id: 4,
    nama: "Andi Wijaya, S.Pd.",
    nip: "198812052014011004",
    jabatan: "Guru IPA",
    jenis: "Keperluan Dinas",
    tanggalMulai: "2026-09-07",
    tanggalSelesai: "2026-09-07",
    jumlahHari: 1,
    alasan:
      "Mengikuti kegiatan pelatihan guru yang diselenggarakan di luar sekolah.",
    status: "disetujui",
    diajukan: "2026-09-06 13:20",
    alasanPenolakan: null,
    diprosesOleh: "Admin Sekolah",
    diprosesPada: "2026-09-06 14:05",
    guruPengganti: {
      id: 103,
      nama: "Doni Pratama, S.Pd.",
      nip: "199005202017031006",
      jabatan: "Guru Penjaskes",
      tanggalMulai: "2026-09-07",
      tanggalSelesai: "2026-09-07",
      sebagai: "Guru Pengganti",
    },
  },
  {
    id: 5,
    nama: "Sari Wulandari, S.Pd.",
    nip: "199207112018022005",
    jabatan: "Guru Seni Budaya",
    jenis: "Keperluan Keluarga",
    tanggalMulai: "2026-09-05",
    tanggalSelesai: "2026-09-06",
    jumlahHari: 2,
    alasan:
      "Ada keperluan keluarga yang harus diselesaikan di luar kota.",
    status: "ditolak",
    diajukan: "2026-09-04 10:05",
    alasanPenolakan:
      "Permohonan belum dapat disetujui karena bertepatan dengan agenda sekolah.",
    diprosesOleh: "Admin Sekolah",
    diprosesPada: "2026-09-04 11:20",
    guruPengganti: null,
  },
  {
    id: 6,
    nama: "Doni Pratama, S.Pd.",
    nip: "199005202017031006",
    jabatan: "Guru Penjaskes",
    jenis: "Sakit",
    tanggalMulai: "2026-09-12",
    tanggalSelesai: "2026-09-13",
    jumlahHari: 2,
    alasan:
      "Mengajukan izin sakit dan akan kembali mengajar setelah kondisi membaik.",
    status: "menunggu",
    diajukan: "2026-09-09 09:10",
    alasanPenolakan: null,
    diprosesOleh: null,
    diprosesPada: null,
    guruPengganti: null,
  },
  {
    id: 7,
    nama: "Wulan Permata, S.Sn.",
    nip: "199102152019022007",
    jabatan: "Guru Seni Musik",
    jenis: "Keperluan Pribadi",
    tanggalMulai: "2026-09-14",
    tanggalSelesai: "2026-09-14",
    jumlahHari: 1,
    alasan:
      "Memiliki keperluan pribadi yang harus diselesaikan pada jam kerja.",
    status: "menunggu",
    diajukan: "2026-09-09 10:25",
    alasanPenolakan: null,
    diprosesOleh: null,
    diprosesPada: null,
    guruPengganti: null,
  },
  {
    id: 8,
    nama: "Anwar Hidayat, S.Pd.",
    nip: "198806082013011008",
    jabatan: "Guru IPS",
    jenis: "Keperluan Dinas",
    tanggalMulai: "2026-09-03",
    tanggalSelesai: "2026-09-03",
    jumlahHari: 1,
    alasan:
      "Mengikuti rapat koordinasi kegiatan pendidikan tingkat kecamatan.",
    status: "disetujui",
    diajukan: "2026-09-02 15:30",
    alasanPenolakan: null,
    diprosesOleh: "Admin Sekolah",
    diprosesPada: "2026-09-02 16:00",
    guruPengganti: {
      id: 104,
      nama: "Budi Santoso, S.Pd.",
      nip: "198903182015031002",
      jabatan: "Guru Bahasa Indonesia",
      tanggalMulai: "2026-09-03",
      tanggalSelesai: "2026-09-03",
      sebagai: "Guru Pengganti",
    },
  },
];

const GURU_PENGGANTI = [
  { id: 101, nama: "Budi Santoso, S.Pd.", nip: "198903182015031002", jabatan: "Guru Bahasa Indonesia" },
  { id: 102, nama: "Andi Wijaya, S.Pd.", nip: "198812052014011004", jabatan: "Guru IPA" },
  { id: 103, nama: "Doni Pratama, S.Pd.", nip: "199005202017031006", jabatan: "Guru Penjaskes" },
  { id: 104, nama: "Anwar Hidayat, S.Pd.", nip: "198806082013011008", jabatan: "Guru IPS" },
  { id: 105, nama: "Fajar Nugroho, S.Pd.", nip: "199104162020031009", jabatan: "Guru IPA" },
  { id: 106, nama: "Maya Sari, S.Pd.", nip: "199207182021022010", jabatan: "Guru Bahasa Indonesia" },
];

/* ================================================================
   PAGE
================================================================ */

export default function IzinGuruPage() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [data, setData] = useState(INITIAL_DATA);
  const [selectedId, setSelectedId] = useState(INITIAL_DATA[0].id);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [jenisFilter, setJenisFilter] = useState("Semua");
  const [processingId, setProcessingId] = useState(null);

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [rejectError, setRejectError] = useState("");

  const [showApproveForm, setShowApproveForm] = useState(false);
  const [selectedReplacementId, setSelectedReplacementId] = useState("");
  const [approveError, setApproveError] = useState("");

  const notifications = [
    { id: 1, title: "Permohonan izin guru baru", desc: "Dian Puspita mengajukan izin sakit", read: false },
    { id: 2, title: "Presensi sekolah", desc: "Rekap kehadiran hari ini tersedia", read: true },
  ];

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return data.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.nama.toLowerCase().includes(keyword) ||
        item.nip.toLowerCase().includes(keyword) ||
        item.jabatan.toLowerCase().includes(keyword) ||
        item.jenis.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === "semua" || item.status === statusFilter;
      const matchesJenis = jenisFilter === "Semua" || item.jenis === jenisFilter;
      return matchesSearch && matchesStatus && matchesJenis;
    });
  }, [data, search, statusFilter, jenisFilter]);

  const selectedData =
    data.find((item) => item.id === selectedId) || filteredData[0] || null;

  const total = data.length;
  const menunggu = data.filter((item) => item.status === "menunggu").length;
  const disetujui = data.filter((item) => item.status === "disetujui").length;
  const ditolak = data.filter((item) => item.status === "ditolak").length;

  const handleOpenApprove = () => {
    if (!selectedData) return;
    setSelectedReplacementId("");
    setApproveError("");
    setShowApproveForm(true);
    setShowRejectForm(false);
    setRejectNote("");
    setRejectError("");
  };

  const handleApprove = () => {
    if (!selectedData) return;
    if (!selectedReplacementId) {
      setApproveError("Guru pengganti wajib dipilih sebelum permohonan disetujui.");
      return;
    }
    const replacement = GURU_PENGGANTI.find(
      (guru) => guru.id === Number(selectedReplacementId)
    );
    if (!replacement) {
      setApproveError("Guru pengganti tidak ditemukan.");
      return;
    }
    setApproveError("");
    setProcessingId(selectedData.id);
    setTimeout(() => {
      const processedAt = getCurrentDateTime();
      setData((current) =>
        current.map((item) =>
          item.id === selectedData.id
            ? {
                ...item,
                status: "disetujui",
                alasanPenolakan: null,
                diprosesOleh: "Admin Sekolah",
                diprosesPada: processedAt,
                guruPengganti: {
                  ...replacement,
                  tanggalMulai: item.tanggalMulai,
                  tanggalSelesai: item.tanggalSelesai,
                  sebagai: "Guru Pengganti",
                },
              }
            : item
        )
      );
      setProcessingId(null);
      setShowApproveForm(false);
      setSelectedReplacementId("");
      setApproveError("");
    }, 500);
  };

  const handleOpenReject = () => {
    if (!selectedData) return;
    setShowRejectForm(true);
    setShowApproveForm(false);
    setSelectedReplacementId("");
    setApproveError("");
    setRejectNote("");
    setRejectError("");
  };

  const handleReject = () => {
    if (!selectedData) return;
    const reason = rejectNote.trim();
    if (!reason) {
      setRejectError("Alasan penolakan wajib diisi.");
      return;
    }
    if (reason.length < 5) {
      setRejectError("Alasan penolakan minimal 5 karakter.");
      return;
    }
    setRejectError("");
    setProcessingId(selectedData.id);
    setTimeout(() => {
      const processedAt = getCurrentDateTime();
      setData((current) =>
        current.map((item) =>
          item.id === selectedData.id
            ? {
                ...item,
                status: "ditolak",
                alasanPenolakan: reason,
                diprosesOleh: "Admin Sekolah",
                diprosesPada: processedAt,
                guruPengganti: null,
              }
            : item
        )
      );
      setProcessingId(null);
      setShowRejectForm(false);
      setRejectNote("");
      setRejectError("");
    }, 500);
  };

  const handleReset = () => {
    setData(INITIAL_DATA);
    setSearch("");
    setStatusFilter("semua");
    setJenisFilter("Semua");
    setSelectedId(INITIAL_DATA[0].id);
    setShowRejectForm(false);
    setShowApproveForm(false);
    setRejectNote("");
    setRejectError("");
    setSelectedReplacementId("");
    setApproveError("");
    setProcessingId(null);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        role="admin"
        active="permohonanIzinGuru"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          {/* ✨ PERUBAHAN 1: Container max-w naik, hapus 2xl:p-10 */}
          <div className="w-full max-w-[1700px] 2xl:max-w-[1900px] mx-auto p-4 sm:p-6 lg:p-8">

            {/* ====================================================
                PAGE HEADER
            ==================================================== */}

            <div className="flex flex-col gap-5 mb-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/presensi")}
                    className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm flex-shrink-0"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        Manajemen Kehadiran
                      </p>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                      Permohonan Izin Guru
                    </h1>

                    <p className="text-sm text-slate-500 mt-1.5">
                      Kelola permohonan izin guru dan tetapkan guru pengganti selama periode izin.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm"
                >
                  <RefreshCw size={16} />
                  Reset Data
                </button>
              </div>
            </div>

            {/* ====================================================
                STATISTICS
            ==================================================== */}

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 2xl:gap-5 mb-6 2xl:mb-7">
              <StatCard
                icon={FileText}
                label="Total Permohonan"
                value={total}
                description="Seluruh pengajuan"
                iconClass="bg-blue-50 text-blue-600"
              />
              <StatCard
                icon={Clock3}
                label="Menunggu"
                value={menunggu}
                description="Perlu ditinjau"
                iconClass="bg-amber-50 text-amber-600"
              />
              <StatCard
                icon={CheckCircle2}
                label="Disetujui"
                value={disetujui}
                description="Sudah ada pengganti"
                iconClass="bg-emerald-50 text-emerald-600"
              />
              <StatCard
                icon={XCircle}
                label="Ditolak"
                value={ditolak}
                description="Memiliki alasan penolakan"
                iconClass="bg-red-50 text-red-600"
              />
            </div>

            {/* ====================================================
                FILTER
            ==================================================== */}

            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4 mb-6">
              <div className="flex flex-col xl:flex-row gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama guru, NIP, jabatan..."
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
                  <div className="hidden sm:flex w-10 h-10 rounded-xl bg-slate-50 items-center justify-center text-slate-500 flex-shrink-0">
                    <Filter size={16} />
                  </div>
                  <FilterButton active={statusFilter === "semua"} onClick={() => setStatusFilter("semua")}>Semua</FilterButton>
                  <FilterButton active={statusFilter === "menunggu"} onClick={() => setStatusFilter("menunggu")}>Menunggu</FilterButton>
                  <FilterButton active={statusFilter === "disetujui"} onClick={() => setStatusFilter("disetujui")}>Disetujui</FilterButton>
                  <FilterButton active={statusFilter === "ditolak"} onClick={() => setStatusFilter("ditolak")}>Ditolak</FilterButton>
                </div>

                <select
                  value={jenisFilter}
                  onChange={(e) => setJenisFilter(e.target.value)}
                  className="h-11 xl:w-52 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  {JENIS_IZIN.map((jenis) => (
                    <option key={jenis} value={jenis}>
                      {jenis === "Semua" ? "Semua Jenis Izin" : jenis}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ====================================================
                CONTENT
            ==================================================== */}

            {/* ✨ PERUBAHAN 2: Grid utama, detail panel jadi 400/460px */}
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] 2xl:grid-cols-[minmax(0,1fr)_460px] gap-5 xl:gap-6 2xl:gap-7 items-start">

              {/* ==================================================
                  LIST
              ================================================== */}

              <section className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden min-w-0">
                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-800">
                      Daftar Permohonan
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {filteredData.length} permohonan ditemukan
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users size={17} />
                  </div>
                </div>

                {filteredData.length > 0 ? (
                  // ✨ PERUBAHAN 3: HAPUS grid 2 kolom di dalam list
                  <div className="divide-y divide-slate-100">
                    {filteredData.map((item) => {
                      const isSelected = selectedData?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedId(item.id);
                            setShowRejectForm(false);
                            setShowApproveForm(false);
                            setRejectNote("");
                            setRejectError("");
                            setSelectedReplacementId("");
                            setApproveError("");
                          }}
                          // ✨ PERUBAHAN 4: HAPUS border-b duplikat
                          className={`w-full text-left p-4 sm:px-6 hover:bg-slate-50 transition-colors ${
                            isSelected ? "bg-blue-50/60" : "bg-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {getInitials(item.nama)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-800 truncate">
                                  {item.nama}
                                </h3>
                                <StatusBadge status={item.status} />
                              </div>

                              <p className="text-xs text-slate-500 mt-1 truncate">
                                {item.jabatan} • NIP {item.nip}
                              </p>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                  <CalendarDays size={13} />
                                  {formatDateRange(item.tanggalMulai, item.tanggalSelesai)}
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                  <FileText size={13} />
                                  {item.jenis}
                                </span>
                                {item.guruPengganti && (
                                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                    <UserCheck size={13} />
                                    Pengganti tersedia
                                  </span>
                                )}
                                {item.status === "ditolak" && item.alasanPenolakan && (
                                  <span className="inline-flex items-center gap-1.5 text-xs text-red-600 font-medium">
                                    <Info size={13} />
                                    Ada alasan penolakan
                                  </span>
                                )}
                              </div>
                            </div>

                            <ChevronRight
                              size={17}
                              className={`flex-shrink-0 mt-3 transition-colors ${
                                isSelected ? "text-blue-600" : "text-slate-300"
                              }`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    search={search}
                    onReset={() => {
                      setSearch("");
                      setStatusFilter("semua");
                      setJenisFilter("Semua");
                    }}
                  />
                )}
              </section>

              {/* ==================================================
                  DETAIL
              ================================================== */}

              <aside className="xl:sticky xl:top-6">
                {selectedData ? (
                  <DetailCard
                    data={selectedData}
                    processingId={processingId}
                    showRejectForm={showRejectForm}
                    rejectNote={rejectNote}
                    rejectError={rejectError}
                    showApproveForm={showApproveForm}
                    selectedReplacementId={selectedReplacementId}
                    approveError={approveError}
                    onReplacementChange={setSelectedReplacementId}
                    onRejectNoteChange={(value) => {
                      setRejectNote(value);
                      if (value.trim()) setRejectError("");
                    }}
                    onApprove={handleApprove}
                    onOpenApprove={handleOpenApprove}
                    onCancelApprove={() => {
                      setShowApproveForm(false);
                      setSelectedReplacementId("");
                      setApproveError("");
                    }}
                    onOpenReject={handleOpenReject}
                    onCancelReject={() => {
                      setShowRejectForm(false);
                      setRejectNote("");
                      setRejectError("");
                    }}
                    onReject={handleReject}
                  />
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
                    <Info size={25} className="mx-auto text-slate-300" />
                    <p className="text-sm font-semibold text-slate-700 mt-3">
                      Pilih permohonan
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Pilih salah satu data untuk melihat detail.
                    </p>
                  </div>
                )}
              </aside>
            </div>

            {/* ====================================================
                MOBILE RESET
            ==================================================== */}

            <button
              type="button"
              onClick={handleReset}
              className="sm:hidden w-full mt-5 h-11 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-600 flex items-center justify-center gap-2"
            >
              <RefreshCw size={15} />
              Reset Data Dummy
            </button>

            {/* ====================================================
                FOOTER
            ==================================================== */}

            <div className="py-8 text-center">
              <p className="text-xs text-slate-400">
                SmartSchool Admin • Manajemen Kehadiran • Permohonan Izin Guru
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ================================================================
   STAT CARD
================================================================ */

function StatCard({ icon: Icon, label, value, description, iconClass }) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 2xl:p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-slate-900 mt-1.5">
            {value}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            {description}
          </p>
        </div>
        <div className={`w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   FILTER BUTTON
================================================================ */

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 px-3.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
      }`}
    >
      {children}
    </button>
  );
}

/* ================================================================
   STATUS BADGE
================================================================ */

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.menunggu;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

/* ================================================================
   DETAIL CARD
================================================================ */

function DetailCard({
  data, processingId,
  showRejectForm, rejectNote, rejectError,
  showApproveForm, selectedReplacementId, approveError,
  onReplacementChange, onRejectNoteChange,
  onApprove, onOpenApprove, onCancelApprove,
  onOpenReject, onCancelReject, onReject,
}) {
  const isProcessing = processingId === data.id;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
      <div className="relative overflow-hidden bg-[#155DFC] p-5 sm:p-6 text-white">
        <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute right-8 -bottom-16 w-28 h-28 rounded-full bg-white/10" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center font-bold">
              {getInitials(data.nama)}
            </div>
            <StatusBadge status={data.status} />
          </div>
          <h2 className="text-lg font-bold mt-4">{data.nama}</h2>
          <p className="text-xs text-blue-100 mt-1">{data.jabatan}</p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="space-y-4">
          <DetailRow icon={User} label="NIP" value={data.nip} />
          <DetailRow icon={FileText} label="Jenis Izin" value={data.jenis} />
          <DetailRow icon={CalendarDays} label="Tanggal Izin" value={formatDateRange(data.tanggalMulai, data.tanggalSelesai)} />
          <DetailRow icon={Clock3} label="Durasi" value={`${data.jumlahHari} hari`} />
          <DetailRow icon={Clock3} label="Diajukan" value={formatDateTime(data.diajukan)} />
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Alasan Permohonan
          </p>
          <div className="mt-2 rounded-xl bg-slate-50 border border-slate-100 p-4">
            <p className="text-sm text-slate-600 leading-relaxed">{data.alasan}</p>
          </div>
        </div>

        {data.status === "disetujui" && data.guruPengganti && (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Guru Pengganti
            </p>
            <div className="mt-2 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <UserCheck size={17} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-emerald-800">{data.guruPengganti.nama}</p>
                  <p className="text-xs text-emerald-700 mt-1">{data.guruPengganti.jabatan}</p>
                  <p className="text-[11px] text-emerald-600 mt-1">NIP {data.guruPengganti.nip}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-emerald-100">
                <p className="text-[11px] text-emerald-600">Bertanggung jawab selama periode izin</p>
                <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                  {formatDateRange(data.guruPengganti.tanggalMulai, data.guruPengganti.tanggalSelesai)}
                </p>
              </div>
            </div>
          </div>
        )}

        {data.status === "ditolak" && data.alasanPenolakan && (
          <div className="mt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Alasan Penolakan
            </p>
            <div className="mt-2 rounded-xl bg-red-50 border border-red-100 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                  <XCircle size={16} />
                </div>
                <p className="text-sm text-red-700 leading-relaxed">{data.alasanPenolakan}</p>
              </div>
            </div>
          </div>
        )}

        {data.status !== "menunggu" && data.diprosesOleh && data.diprosesPada && (
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-[11px] text-slate-400">Diproses oleh</p>
                <p className="text-xs font-semibold text-slate-700 mt-1">{data.diprosesOleh}</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                <p className="text-[11px] text-slate-400">Waktu diproses</p>
                <p className="text-xs font-semibold text-slate-700 mt-1">{formatDateTime(data.diprosesPada)}</p>
              </div>
            </div>
          </div>
        )}

        {data.status === "menunggu" && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            {showApproveForm ? (
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <UserCheck size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Tetapkan Guru Pengganti</p>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Guru pengganti wajib ditetapkan sebagai penanggung jawab selama periode izin.
                    </p>
                  </div>
                </div>

                <label className="block">
                  <span className="text-xs font-semibold text-slate-600">
                    Guru Pengganti <span className="text-red-500">*</span>
                  </span>
                  <select
                    value={selectedReplacementId}
                    onChange={(e) => onReplacementChange(e.target.value)}
                    className={`w-full mt-2 h-11 rounded-xl border bg-white px-3.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 ${
                      approveError ? "border-red-300" : "border-slate-200"
                    }`}
                  >
                    <option value="">Pilih guru pengganti</option>
                    {GURU_PENGGANTI.filter((guru) => guru.nip !== data.nip).map((guru) => (
                      <option key={guru.id} value={guru.id}>
                        {guru.nama} — {guru.jabatan}
                      </option>
                    ))}
                  </select>
                </label>

                {approveError && (
                  <div className="mt-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-3">
                    <p className="text-xs text-red-600 font-medium">{approveError}</p>
                  </div>
                )}

                {selectedReplacementId && (
                  <div className="mt-3 rounded-xl bg-blue-50 border border-blue-100 p-3.5">
                    {(() => {
                      const guru = GURU_PENGGANTI.find(
                        (item) => item.id === Number(selectedReplacementId)
                      );
                      if (!guru) return null;
                      return (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-white text-blue-600 border border-blue-100 flex items-center justify-center">
                            <UserCheck size={15} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-blue-800">{guru.nama}</p>
                            <p className="text-[11px] text-blue-600 mt-0.5">{guru.jabatan}</p>
                            <p className="text-[11px] text-blue-500 mt-0.5">
                              Bertanggung jawab {formatDateRange(data.tanggalMulai, data.tanggalSelesai)}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={onCancelApprove}
                    className="h-11 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing || !selectedReplacementId}
                    onClick={onApprove}
                    className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      {isProcessing ? (
                        <>
                          <LoadingSpinner />
                          Memproses
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          Konfirmasi
                        </>
                      )}
                    </span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 text-center mt-3">
                  Guru pengganti akan menjadi penanggung jawab selama periode izin.
                </p>
              </div>
            ) : !showRejectForm ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={onOpenReject}
                  className="h-11 rounded-xl border border-red-200 bg-white text-red-600 hover:bg-red-50 font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <X size={16} />
                    Tolak
                  </span>
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={onOpenApprove}
                  className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <Check size={16} />
                    Setujui
                  </span>
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Alasan Penolakan <span className="text-red-500">*</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Alasan wajib diisi agar pemohon mengetahui alasan permohonan ditolak.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onCancelReject}
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>

                <textarea
                  value={rejectNote}
                  onChange={(e) => onRejectNoteChange(e.target.value)}
                  rows={4}
                  placeholder="Tuliskan alasan penolakan..."
                  className={`w-full mt-3 rounded-xl border px-3.5 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none resize-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 ${
                    rejectError ? "border-red-300 bg-red-50/30" : "border-slate-200"
                  }`}
                />

                <div className="flex items-center justify-between mt-1.5">
                  <p className={`text-[11px] ${rejectError ? "text-red-500" : "text-slate-400"}`}>
                    {rejectError || "Minimal 5 karakter."}
                  </p>
                  <p className="text-[11px] text-slate-400">{rejectNote.length}/500</p>
                </div>

                <button
                  type="button"
                  disabled={isProcessing || !rejectNote.trim()}
                  onClick={onReject}
                  className="w-full mt-3 h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="inline-flex items-center gap-2">
                      <LoadingSpinner />
                      Memproses
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center gap-2">
                      <XCircle size={16} />
                      Konfirmasi Penolakan
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {data.status !== "menunggu" && (
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                <Info size={15} />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                {data.status === "disetujui"
                  ? "Permohonan telah disetujui. Guru pengganti telah ditetapkan sebagai penanggung jawab selama periode izin."
                  : "Permohonan telah ditolak. Alasan penolakan tersimpan pada riwayat permohonan."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================
   DETAIL ROW
================================================================ */

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-700 truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}

/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyState({ search, onReset }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
        <Search size={23} />
      </div>
      <h3 className="text-sm font-bold text-slate-800 mt-4">Data tidak ditemukan</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
        {search
          ? "Tidak ada permohonan yang sesuai dengan pencarian."
          : "Belum ada permohonan dengan filter yang dipilih."}
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
      >
        <RefreshCw size={14} />
        Reset Filter
      </button>
    </div>
  );
}

/* ================================================================
   LOADING
================================================================ */

function LoadingSpinner() {
  return (
    <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
  );
}

/* ================================================================
   HELPERS
================================================================ */

function getInitials(name) {
  return name
    .replace(/,/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function formatDateRange(start, end) {
  const startDate = formatDate(start);
  const endDate = formatDate(end);
  if (start === end) return startDate;
  return `${startDate} – ${endDate}`;
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "-";
  const [datePart, timePart] = value.split(" ");
  if (!datePart) return value;
  return `${formatDate(datePart)} ${timePart || ""}`.trim();
}

function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}