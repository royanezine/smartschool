"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import Header from "../../../components/Header";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  Edit,
  Trash2,
  School,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

// ======================================================
// DUMMY DATA
// ======================================================
const dummyStaf = [
  {
    id: 1,
    nama: "Dr. Ahmad Fauzi, M.Pd.",
    email: "ahmad.fauzi@smartschool.com",
    telepon: "(021) 555-1234",
    alamat: "Jl. Merdeka No. 45, Jakarta Pusat",
    role: "Kepala Sekolah",
    unit: "SMA Negeri 1 Jakarta",
    status: "aktif",
    bergabung: "2020-07-15",
    gender: "Laki-laki",
    tempatLahir: "Jakarta",
    tanggalLahir: "1975-03-12",
    nip: "197503121995031001",
    pendidikan: "S3 Pendidikan",
    spesialisasi: "Manajemen Pendidikan",
    catatan: "Pengalaman 20 tahun di bidang pendidikan",
  },
  {
    id: 2,
    nama: "Dra. Siti Rahayu, M.Si.",
    email: "siti.rahayu@smartschool.com",
    telepon: "(021) 555-5678",
    alamat: "Jl. Sudirman No. 12, Bandung",
    role: "Wakil Kepala Sekolah",
    unit: "SMP Negeri 2 Bandung",
    status: "aktif",
    bergabung: "2019-08-20",
    gender: "Perempuan",
    tempatLahir: "Bandung",
    tanggalLahir: "1980-07-22",
    nip: "198007221999032002",
    pendidikan: "S2 Manajemen Pendidikan",
    spesialisasi: "Kurikulum",
    catatan: "Sertifikasi kepala sekolah",
  },
  {
    id: 3,
    nama: "Budi Santoso, S.Pd.",
    email: "budi.santoso@smartschool.com",
    telepon: "(031) 555-9012",
    alamat: "Jl. Raya Darmo No. 8, Surabaya",
    role: "Guru",
    unit: "SMA Negeri 3 Surabaya",
    status: "nonaktif",
    bergabung: "2021-01-10",
    gender: "Laki-laki",
    tempatLahir: "Surabaya",
    tanggalLahir: "1985-11-05",
    nip: "198511052010011001",
    pendidikan: "S1 Pendidikan Matematika",
    spesialisasi: "Matematika",
    catatan: "Mengundurkan diri karena pindah",
  },
];

export default function DetailStafPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [staf, setStaf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const notifications = [
    {
      id: 1,
      title: "Pembaruan Sistem v2.0",
      desc: "Dikirim 2 jam lalu",
      read: false,
    },
    {
      id: 2,
      title: "Pengingat: Backup Data",
      desc: "Dikirim 1 hari lalu",
      read: false,
    },
  ];

  // ======================================================
  // LOAD DATA
  // ======================================================
  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);

        const found = dummyStaf.find(
          (item) => item.id === Number(id)
        );

        if (found) {
          setStaf(found);
        } else {
          setError("Data staf tidak ditemukan.");
        }
      } catch (err) {
        setError("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  // ======================================================
  // ACTION
  // ======================================================
  const goBack = () => {
    router.push("/admin/staf");
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus staf ${staf.nama}?`
    );

    if (confirmed) {
      console.log("Hapus staf:", staf.id);
      router.push("/admin/staf");
    }
  };

  // ======================================================
  // STATUS
  // ======================================================
  const getStatusStyle = (status) => {
    if (status === "aktif") {
      return {
        label: "Aktif",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
        icon: CheckCircle,
      };
    }

    return {
      label: "Nonaktif",
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
      dot: "bg-slate-400",
      icon: XCircle,
    };
  };

  // ======================================================
  // LOADING
  // ======================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar
          active="staf"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <Header
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            notifications={notifications}
            user={{
              name: "Admin",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <Loader2
                size={30}
                className="animate-spin text-blue-600 mx-auto mb-3"
              />

              <p className="text-sm text-slate-500">
                Memuat data staf...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================
  if (error || !staf) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar
          active="staf"
          setActive={() => {}}
          collapsed={!sidebarOpen}
          setCollapsed={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 min-w-0 flex flex-col">
          <Header
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            notifications={notifications}
            user={{
              name: "Admin",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-rose-50 flex items-center justify-center">
                <AlertCircle
                  size={24}
                  className="text-rose-500"
                />
              </div>

              <h2 className="text-base font-semibold text-slate-800">
                Data tidak ditemukan
              </h2>

              <p className="text-sm text-slate-500 mt-1 mb-5">
                {error || "Data staf yang Anda cari tidak tersedia."}
              </p>

              <button
                onClick={goBack}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
              >
                <ArrowLeft size={16} />
                Kembali ke Daftar Staf
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(staf.status);
  const StatusIcon = statusStyle.icon;

  // ======================================================
  // MAIN PAGE
  // ======================================================
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR */}
      <Sidebar
        active="staf"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* CONTENT */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          notifications={notifications}
          user={{
            name: "Admin",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 min-w-0">
          <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8">

            {/* ==================================================
                PAGE HEADER
            ================================================== */}
            <div className="mb-6">
              <button
                onClick={goBack}
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition mb-4"
              >
                <ArrowLeft size={17} />
                Kembali ke Daftar Staf
              </button>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                      <User
                        size={20}
                        className="text-white"
                      />
                    </div>

                    <div>
                      <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
                        Detail Staf
                      </h1>

                      <p className="text-sm text-slate-500 mt-0.5">
                        Informasi lengkap staf yang terdaftar di SmartSchool.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================
                PROFILE CARD
            ================================================== */}
            <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

              {/* PROFILE HEADER */}
              <div className="px-5 sm:px-6 lg:px-7 py-6 border-b border-slate-200">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                  <div className="flex items-center gap-4 min-w-0">
                    {/* AVATAR */}
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <User
                        size={28}
                        className="text-blue-600"
                        strokeWidth={1.8}
                      />
                    </div>

                    {/* NAME */}
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl font-semibold text-slate-800 break-words">
                        {staf.nama}
                      </h2>

                      <div className="flex flex-wrap items-center gap-2 mt-2">

                        {/* ROLE */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600">
                          <Briefcase size={13} />
                          {staf.role}
                        </span>

                        {/* STATUS */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                          />

                          {statusStyle.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/admin/staf/edit/${staf.id}`
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm font-medium hover:bg-amber-100 transition"
                    >
                      <Edit size={16} />
                      Edit
                    </button>

                    <button
                      onClick={handleDelete}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm font-medium hover:bg-rose-100 transition"
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>

              {/* ==================================================
                  INFORMATION BODY
              ================================================== */}
              <div className="p-5 sm:p-6 lg:p-7">

                {/* SECTION TITLE */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Informasi Kontak & Unit
                  </h3>

                  <p className="text-xs text-slate-400 mt-1">
                    Informasi dasar mengenai staf.
                  </p>
                </div>

                {/* CONTACT GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

                  <InfoCard
                    icon={Mail}
                    label="Email"
                    value={staf.email}
                  />

                  <InfoCard
                    icon={Phone}
                    label="Telepon"
                    value={staf.telepon}
                  />

                  <InfoCard
                    icon={MapPin}
                    label="Alamat"
                    value={staf.alamat}
                  />

                  <InfoCard
                    icon={School}
                    label="Unit"
                    value={staf.unit}
                  />
                </div>

                {/* ==================================================
                    DATA PERSONAL
                ================================================== */}
                <div className="mt-7 pt-6 border-t border-slate-200">

                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Data Personal
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Informasi identitas dan kepegawaian.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                    <DetailItem
                      icon={Calendar}
                      label="Tanggal Bergabung"
                      value={formatDate(staf.bergabung)}
                    />

                    <DetailItem
                      icon={User}
                      label="Jenis Kelamin"
                      value={staf.gender}
                    />

                    <DetailItem
                      icon={Building}
                      label="NIP"
                      value={staf.nip}
                      mono
                    />

                    <DetailItem
                      icon={MapPin}
                      label="Tempat Lahir"
                      value={staf.tempatLahir}
                    />
                  </div>
                </div>

                {/* ==================================================
                    PENDIDIKAN
                ================================================== */}
                <div className="mt-7 pt-6 border-t border-slate-200">

                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-slate-800">
                      Pendidikan & Keahlian
                    </h3>

                    <p className="text-xs text-slate-400 mt-1">
                      Riwayat pendidikan dan bidang spesialisasi.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                    <div className="p-4 rounded-lg border border-blue-100 bg-blue-50/50">
                      <p className="text-xs font-medium text-blue-600 mb-1">
                        Pendidikan Terakhir
                      </p>

                      <p className="text-sm font-semibold text-slate-700">
                        {staf.pendidikan}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
                      <p className="text-xs font-medium text-slate-500 mb-1">
                        Spesialisasi
                      </p>

                      <p className="text-sm font-semibold text-slate-700">
                        {staf.spesialisasi}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    CATATAN
                ================================================== */}
                {staf.catatan && (
                  <div className="mt-7 pt-6 border-t border-slate-200">
                    <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50">
                      <div className="flex items-start gap-3">

                        <AlertCircle
                          size={17}
                          className="text-amber-600 mt-0.5 shrink-0"
                        />

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-amber-700">
                            Catatan
                          </p>

                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                            {staf.catatan}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ==================================================
                    FOOTER STATUS
                ================================================== */}
                <div className="mt-7 pt-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                  <div className="flex items-center gap-2">
                    <StatusIcon
                      size={17}
                      className={statusStyle.text}
                    />

                    <span className="text-sm text-slate-600">
                      Status staf:
                    </span>

                    <span
                      className={`text-sm font-semibold ${statusStyle.text}`}
                    >
                      {statusStyle.label}
                    </span>
                  </div>

                  <button
                    onClick={goBack}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    <ArrowLeft size={16} />
                    Kembali
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

// ======================================================
// COMPONENT: INFO CARD
// ======================================================
function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 p-4 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition">
      <div className="flex items-start gap-3">

        <div className="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0">
          <Icon
            size={16}
            className="text-slate-500"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-400 mb-1">
            {label}
          </p>

          <p className="text-sm font-medium text-slate-700 break-words leading-relaxed">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// ======================================================
// COMPONENT: DETAIL ITEM
// ======================================================
function DetailItem({
  icon: Icon,
  label,
  value,
  mono = false,
}) {
  return (
    <div className="flex items-start gap-3 min-w-0">

      <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
        <Icon
          size={15}
          className="text-slate-500"
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-400 mb-1">
          {label}
        </p>

        <p
          className={`text-sm font-medium text-slate-700 break-words ${
            mono ? "font-mono text-xs sm:text-sm" : ""
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ======================================================
// FORMAT DATE
// ======================================================
function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}