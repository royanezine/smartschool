"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

import {
  User,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  BriefcaseBusiness,
  GraduationCap,
  BookOpen,
  School,
  IdCard,
  ShieldCheck,
  KeyRound,
  Edit3,
  Camera,
  CheckCircle2,
  Clock3,
  Award,
  Users,
  Hash,
  Building2,
  ChevronRight,
  Lock,
  UserRoundCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ProfilGuruPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("jwt");

      if (!token) {
        router.push("/login");
        return;
      }

      const cleanToken = token.replace(/^Bearer\s+/i, "");

      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      const result = await response.json().catch(() => null);

      console.log("PROFILE RESPONSE:", result);

      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("access_token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("jwt");

        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Gagal mengambil profil (${response.status})`
        );
      }

      /*
       * Response backend bisa berbentuk:
       *
       * {
       *   success: true,
       *   data: {...}
       * }
       *
       * atau:
       *
       * {
       *   data: {
       *      data: {...}
       *   }
       * }
       */

      const rawData =
        result?.data?.data ||
        result?.data ||
        result?.user ||
        result;

      if (!rawData || typeof rawData !== "object") {
        throw new Error("Data profil dari backend tidak ditemukan.");
      }

      setProfile(normalizeProfile(rawData));
    } catch (err) {
      console.error("LOAD PROFILE ERROR:", err);

      setError(
        err?.message ||
          "Terjadi kesalahan saat mengambil data profil."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    router.push("/guru/profil/edit");
  };

  const handleChangePassword = () => {
    router.push("/guru/profil/keamanan");
  };

  const handleQuickAction = (type) => {
    if (type === "jadwal") {
      router.push("/guru/jadwal");
    }

    if (type === "materi") {
      router.push("/guru/materi");
    }

    if (type === "kelas") {
      router.push("/guru/kelas");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2
            size={32}
            className="animate-spin text-blue-600"
          />

          <p className="text-sm font-medium text-slate-500">
            Memuat profil guru...
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-screen w-full min-w-0 overflow-hidden bg-slate-100">
        <Sidebar
          active="profil"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="guru"
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Guru",
              email: "",
              avatar: "GU",
            }}
          />

          <main className="flex flex-1 items-center justify-center overflow-y-auto p-6">
            <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertCircle size={24} />
              </div>

              <h2 className="mt-4 text-base font-bold text-slate-800">
                Gagal Memuat Profil
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {error || "Data profil tidak ditemukan."}
              </p>

              <button
                type="button"
                onClick={loadProfile}
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Coba Lagi
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full min-w-0 overflow-hidden bg-slate-100">
      {/* SIDEBAR */}
      <Sidebar
        active="profil"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="guru"
      />

      {/* MAIN */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: profile.nama,
            email: profile.email,
            avatar: profile.initials,
          }}
        />

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full min-w-0 p-3 sm:p-4 md:p-6 lg:p-7 xl:p-8">
            <div className="mx-auto w-full max-w-[1500px] space-y-6">

              {/* PAGE HEADER */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        Guru
                      </span>

                      <span className="text-xs text-slate-400">
                        / Profil
                      </span>
                    </div>

                    <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                      Profil Guru
                    </h1>

                    <p className="mt-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                      Kelola dan lihat informasi profil, data kepegawaian,
                      serta informasi akun Anda.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleEditProfile}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                  >
                    <Edit3 size={17} />
                    Edit Profil
                  </button>
                </div>
              </section>

              {/* PROFILE HERO */}
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-32 overflow-hidden bg-slate-800 sm:h-40">
                  <div className="absolute -right-10 -top-20 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />
                  <div className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-indigo-500/20 blur-3xl" />

                  <div className="absolute inset-0 opacity-10">
                    <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:24px_24px]" />
                  </div>
                </div>

                <div className="relative px-5 pb-6 sm:px-7">
                  <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">

                      {/* AVATAR */}
                      <div className="relative w-fit">
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-slate-700 text-2xl font-bold text-white shadow-lg sm:h-28 sm:w-28 sm:text-3xl">
                          {profile.initials}
                        </div>

                        <button
                          type="button"
                          aria-label="Ubah foto profil"
                          onClick={handleEditProfile}
                          className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-white bg-blue-600 text-white shadow-sm transition hover:bg-blue-700"
                        >
                          <Camera size={14} />
                        </button>
                      </div>

                      {/* NAME */}
                      <div className="min-w-0 pb-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold text-slate-800 sm:text-2xl">
                            {profile.nama}
                          </h2>

                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                            <CheckCircle2 size={12} />
                            {profile.statusAkun}
                          </span>
                        </div>

                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {profile.gelar}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span className="inline-flex items-center gap-1.5">
                            <BriefcaseBusiness size={13} />
                            {profile.jabatan}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <School size={13} />
                            {profile.sekolah}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CODE */}
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                        <Hash size={17} />
                      </div>

                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          Kode Guru
                        </p>

                        <p className="mt-0.5 text-sm font-bold text-slate-700">
                          {profile.kodeGuru}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* TABS */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex min-w-max">
                  <TabButton
                    active={activeTab === "profil"}
                    onClick={() => setActiveTab("profil")}
                    icon={User}
                    label="Informasi Profil"
                  />

                  <TabButton
                    active={activeTab === "kepegawaian"}
                    onClick={() => setActiveTab("kepegawaian")}
                    icon={BriefcaseBusiness}
                    label="Kepegawaian"
                  />

                  <TabButton
                    active={activeTab === "akun"}
                    onClick={() => setActiveTab("akun")}
                    icon={ShieldCheck}
                    label="Akun & Keamanan"
                  />
                </div>
              </div>

              {/* ===================================================== */}
              {/* PROFIL */}
              {/* ===================================================== */}

              {activeTab === "profil" && (
                <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">

                  <div className="min-w-0 space-y-6">

                    <ProfileSection
                      icon={User}
                      title="Informasi Pribadi"
                      description="Informasi dasar mengenai identitas guru."
                      iconClass="bg-blue-50 text-blue-600"
                    >
                      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                        <DetailItem
                          icon={User}
                          label="Nama Lengkap"
                          value={profile.namaLengkap}
                        />

                        <DetailItem
                          icon={UserRoundCheck}
                          label="Jenis Kelamin"
                          value={profile.jenisKelamin}
                        />

                        <DetailItem
                          icon={MapPin}
                          label="Tempat Lahir"
                          value={profile.tempatLahir}
                        />

                        <DetailItem
                          icon={CalendarDays}
                          label="Tanggal Lahir"
                          value={profile.tanggalLahir}
                        />

                        <DetailItem
                          icon={ShieldCheck}
                          label="Agama"
                          value={profile.agama}
                        />

                        <DetailItem
                          icon={GraduationCap}
                          label="Pendidikan Terakhir"
                          value={profile.pendidikan}
                        />
                      </div>
                    </ProfileSection>

                    <ProfileSection
                      icon={Phone}
                      title="Informasi Kontak"
                      description="Informasi kontak yang dapat digunakan untuk komunikasi."
                      iconClass="bg-indigo-50 text-indigo-600"
                    >
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <DetailItem
                          icon={Mail}
                          label="Email"
                          value={profile.email}
                        />

                        <DetailItem
                          icon={Phone}
                          label="Nomor Telepon"
                          value={profile.telepon}
                        />

                        <div className="sm:col-span-2">
                          <DetailItem
                            icon={MapPin}
                            label="Alamat"
                            value={profile.alamat}
                          />
                        </div>
                      </div>
                    </ProfileSection>

                    <ProfileSection
                      icon={BookOpen}
                      title="Bidang Mengajar"
                      description="Informasi bidang studi dan aktivitas pembelajaran."
                      iconClass="bg-violet-50 text-violet-600"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InfoBox
                          icon={BookOpen}
                          label="Bidang Studi"
                          value={profile.bidangStudi}
                        />

                        <InfoBox
                          icon={Users}
                          label="Status"
                          value={profile.statusKepegawaian}
                        />

                        <InfoBox
                          icon={School}
                          label="Sekolah"
                          value={profile.sekolah}
                        />

                        <InfoBox
                          icon={GraduationCap}
                          label="Pendidikan"
                          value={profile.pendidikan}
                        />
                      </div>
                    </ProfileSection>
                  </div>

                  {/* RIGHT */}
                  <aside className="min-w-0 space-y-6">

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-100 bg-slate-50/80 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-slate-800">
                              Status Guru
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                              Ringkasan status akun dan kepegawaian
                            </p>
                          </div>

                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                            <CheckCircle2
                              size={18}
                              className="text-emerald-600"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 p-3">
                        <StatusRow
                          label="Status Akun"
                          value={profile.statusAkun}
                          active={profile.statusAkun === "Aktif"}
                        />

                        <StatusRow
                          label="Status Kepegawaian"
                          value={profile.statusKepegawaian}
                          active
                        />

                        <StatusRow
                          label="Verifikasi"
                          value={profile.verifikasi}
                          active
                        />

                        <StatusRow
                          label="Akses Sistem"
                          value="Guru"
                          active
                        />
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="p-5">
                        <div className="mb-4">
                          <h3 className="text-sm font-bold text-slate-800">
                            Ringkasan Aktivitas
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            Data aktivitas guru.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <MiniStat
                            icon={BookOpen}
                            value={profile.totalMapel}
                            label="Mata Pelajaran"
                          />

                          <MiniStat
                            icon={Users}
                            value={profile.totalKelas}
                            label="Kelas"
                          />

                          <MiniStat
                            icon={Clock3}
                            value={profile.jamPerMinggu}
                            label="Jam / Minggu"
                          />

                          <MiniStat
                            icon={Award}
                            value={profile.kehadiran}
                            label="Kehadiran"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="p-5">
                        <h3 className="text-sm font-bold text-slate-800">
                          Akses Cepat
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          Menu yang berkaitan dengan profil Anda.
                        </p>

                        <div className="mt-4 space-y-2">
                          <QuickAction
                            icon={CalendarDays}
                            title="Jadwal Mengajar"
                            description="Lihat jadwal mengajar"
                            onClick={() =>
                              handleQuickAction("jadwal")
                            }
                          />

                          <QuickAction
                            icon={BookOpen}
                            title="Materi Pembelajaran"
                            description="Kelola materi"
                            onClick={() =>
                              handleQuickAction("materi")
                            }
                          />

                          <QuickAction
                            icon={Users}
                            title="Kelas Saya"
                            description="Lihat kelas yang diajar"
                            onClick={() =>
                              handleQuickAction("kelas")
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              )}

              {/* ===================================================== */}
              {/* KEPEGAWAIAN */}
              {/* ===================================================== */}

              {activeTab === "kepegawaian" && (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <ProfileSection
                    icon={BriefcaseBusiness}
                    title="Data Kepegawaian"
                    description="Informasi status dan identitas kepegawaian."
                    iconClass="bg-blue-50 text-blue-600"
                  >
                    <div className="space-y-5">
                      <DetailItem
                        icon={IdCard}
                        label="NIP"
                        value={profile.nip}
                      />

                      <DetailItem
                        icon={IdCard}
                        label="NUPTK"
                        value={profile.nuptk}
                      />

                      <DetailItem
                        icon={BriefcaseBusiness}
                        label="Status Kepegawaian"
                        value={profile.statusKepegawaian}
                      />

                      <DetailItem
                        icon={UserRoundCheck}
                        label="Jabatan"
                        value={profile.jabatan}
                      />

                      <DetailItem
                        icon={Building2}
                        label="Unit Kerja"
                        value={profile.sekolah}
                      />
                    </div>
                  </ProfileSection>

                  <ProfileSection
                    icon={GraduationCap}
                    title="Pendidikan & Kompetensi"
                    description="Informasi pendidikan terakhir dan bidang kompetensi."
                    iconClass="bg-violet-50 text-violet-600"
                  >
                    <div className="space-y-4">
                      <InfoBox
                        icon={GraduationCap}
                        label="Pendidikan Terakhir"
                        value={profile.pendidikan}
                      />

                      <InfoBox
                        icon={BookOpen}
                        label="Bidang Kompetensi"
                        value={profile.bidangStudi}
                      />

                      <InfoBox
                        icon={Award}
                        label="Sertifikasi"
                        value={profile.sertifikasi}
                      />

                      <InfoBox
                        icon={CalendarDays}
                        label="Tahun Bergabung"
                        value={profile.tahunBergabung}
                      />
                    </div>
                  </ProfileSection>
                </div>
              )}

              {/* ===================================================== */}
              {/* AKUN */}
              {/* ===================================================== */}

              {activeTab === "akun" && (
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                  <ProfileSection
                    icon={ShieldCheck}
                    title="Akun & Keamanan"
                    description="Kelola informasi akun dan keamanan akses."
                    iconClass="bg-slate-100 text-slate-700"
                  >
                    <div className="space-y-5">
                      <DetailItem
                        icon={User}
                        label="Username"
                        value={profile.username}
                      />

                      <DetailItem
                        icon={Mail}
                        label="Email Akun"
                        value={profile.email}
                      />

                      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm">
                            <Lock size={18} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-700">
                              Kata Sandi
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Gunakan menu keamanan untuk memperbarui
                              kata sandi.
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleChangePassword}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                        >
                          <KeyRound size={14} />
                          Ubah Kata Sandi
                        </button>
                      </div>
                    </div>
                  </ProfileSection>

                  <div className="space-y-6">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                        <ShieldCheck size={19} />
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-slate-800">
                        Akun Terlindungi
                      </h3>

                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                        Akun Anda aktif dan telah terverifikasi.
                        Pastikan informasi login tetap aman dan tidak
                        dibagikan kepada orang lain.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <InfoIcon />
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-slate-800">
                        Informasi
                      </h3>

                      <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                        Jika terdapat kesalahan pada data kepegawaian,
                        hubungi administrator sekolah untuk melakukan
                        pembaruan data.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <footer className="border-t border-slate-200 pt-5 text-center">
                <p className="text-[11px] text-slate-400">
                  © 2026 SmartSchool • Profil Guru
                </p>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============================================================
   NORMALIZE PROFILE
============================================================ */

function normalizeProfile(data) {
  const nama =
    data?.namaLengkap ||
    data?.nama ||
    data?.name ||
    data?.username ||
    "Guru";

  const namaLengkap = data?.namaLengkap || nama;

  const initials = getInitials(nama);

  return {
    nama,
    namaLengkap,

    gelar:
      data?.gelar ||
      data?.gelarAkademik ||
      "",

    nip:
      data?.nip ||
      data?.NIP ||
      "",

    nuptk:
      data?.nuptk ||
      data?.NUPTK ||
      "",

    jenisKelamin:
      data?.jenisKelamin ||
      data?.jenis_kelamin ||
      "",

    tempatLahir:
      data?.tempatLahir ||
      data?.tempat_lahir ||
      "",

    tanggalLahir:
      formatDate(
        data?.tanggalLahir ||
          data?.tanggal_lahir ||
          data?.tglLahir
      ),

    agama:
      data?.agama ||
      "",

    statusKepegawaian:
      data?.statusKepegawaian ||
      data?.status_kepegawaian ||
      data?.status ||
      "",

    jabatan:
      data?.jabatan ||
      data?.namaJabatan ||
      "",

    pendidikan:
      data?.pendidikanTerakhir ||
      data?.pendidikan ||
      "",

    bidangStudi:
      data?.bidangStudi ||
      data?.bidangKompetensi ||
      data?.mataPelajaran ||
      "",

    email:
      data?.email ||
      "",

    telepon:
      data?.telepon ||
      data?.noTelepon ||
      data?.nomorTelepon ||
      data?.noHp ||
      data?.nomorHp ||
      "",

    alamat:
      data?.alamat ||
      "",

    sekolah:
      data?.sekolah?.nama ||
      data?.sekolahNama ||
      data?.namaSekolah ||
      "",

    kodeGuru:
      data?.kodeGuru ||
      data?.kode ||
      data?.id ||
      "",

    username:
      data?.username ||
      data?.email ||
      "",

    statusAkun:
      formatStatus(data?.status),

    verifikasi:
      data?.terverifikasi === false
        ? "Belum Terverifikasi"
        : "Terverifikasi",

    sertifikasi:
      data?.sertifikasi ||
      "Belum ada data",

    tahunBergabung:
      data?.tahunBergabung ||
      data?.tahun_bergabung ||
      "Belum ada data",

    totalMapel:
      data?.totalMapel ??
      data?.jumlahMapel ??
      "0",

    totalKelas:
      data?.totalKelas ??
      data?.jumlahKelas ??
      "0",

    jamPerMinggu:
      data?.jamPerMinggu ??
      data?.jumlahJamMengajar ??
      "0",

    kehadiran:
      data?.kehadiran ??
      data?.persentaseKehadiran ??
      "-",

    initials,
  };
}

/* ============================================================
   FORMAT DATE
============================================================ */

function formatDate(value) {
  if (!value) return "";

  if (
    typeof value === "string" &&
    value.match(
      /^\d{1,2}\s+(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)/
    )
  ) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ============================================================
   FORMAT STATUS
============================================================ */

function formatStatus(value) {
  if (!value) return "Aktif";

  const status = String(value).toLowerCase();

  if (
    status === "aktif" ||
    status === "active"
  ) {
    return "Aktif";
  }

  if (
    status === "nonaktif" ||
    status === "inactive"
  ) {
    return "Nonaktif";
  }

  return value;
}

/* ============================================================
   INITIALS
============================================================ */

function getInitials(name) {
  if (!name) return "GU";

  const words = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }

  return (
    words[0][0] +
    words[words.length - 1][0]
  ).toUpperCase();
}

/* ============================================================
   TAB BUTTON
============================================================ */

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex items-center gap-2 px-5 py-3.5 text-xs font-semibold transition sm:px-6 ${
        active
          ? "text-blue-600"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      <Icon size={16} />

      <span>{label}</span>

      {active && (
        <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-blue-600 sm:left-5 sm:right-5" />
      )}
    </button>
  );
}

/* ============================================================
   PROFILE SECTION
============================================================ */

function ProfileSection({
  icon: Icon,
  title,
  description,
  iconClass,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconClass}`}
          >
            <Icon size={19} />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-800 sm:text-base">
              {title}
            </h2>

            <p className="mt-1 text-xs leading-relaxed text-slate-400 sm:text-sm">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

/* ============================================================
   DETAIL ITEM
============================================================ */

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
          <Icon size={15} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold leading-relaxed text-slate-700">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   INFO BOX
============================================================ */

function InfoBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-700">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   STATUS ROW
============================================================ */

function StatusRow({
  label,
  value,
  active = false,
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition hover:bg-slate-50">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <div className="flex items-center gap-1.5">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            active
              ? "bg-emerald-500"
              : "bg-slate-300"
          }`}
        />

        <span
          className={`text-xs font-semibold ${
            active
              ? "text-emerald-600"
              : "text-slate-500"
          }`}
        >
          {value || "-"}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   MINI STAT
============================================================ */

function MiniStat({
  icon: Icon,
  value,
  label,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
          <Icon size={15} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800">
            {value}
          </p>

          <p className="truncate text-[10px] text-slate-400">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   QUICK ACTION
============================================================ */

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl border border-transparent p-3 text-left transition hover:border-slate-200 hover:bg-slate-50"
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        <Icon size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-700">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-slate-400">
          {description}
        </p>
      </div>

      <ChevronRight
        size={15}
        className="flex-shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500"
      />
    </button>
  );
}

/* ============================================================
   INFO ICON
============================================================ */

function InfoIcon() {
  return (
    <span className="text-sm font-bold">
      i
    </span>
  );
}