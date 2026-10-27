"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  CreditCard,
  User,
  GraduationCap,
  Users,
  MapPin,
  Phone,
  CalendarDays,
  IdCard,
  UserRound,
  School,
  Hash,
  CheckCircle2,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getUserById } from "@/services/user.service";


const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";


function getInitials(nama) {
  return nama
    .replace(/,.*/, "")
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}


function StatusBadge({ status }) {
  const isActive = status === "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isActive
          ? `${themeSuccessSurface} theme-success ${themeSuccessBorder}`
          : `${themeNeutralSurface} theme-text-muted ${themeNeutralBorder}`
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive
            ? "bg-[var(--color-success)]"
            : "bg-[color-mix(in_srgb,var(--color-text)_40%,transparent)]"
        }`}
      />

      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}

function JenisKelaminBadge({ jenisKelamin }) {
  const isPria = jenisKelamin === "L";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
        isPria
          ? `${themePrimarySoft} ${themePrimaryText} ${themePrimarySoftBorder}`
          : `${themeNeutralSurface} theme-text-secondary ${themeNeutralBorder}`
      }`}
    >
      {isPria ? "Laki-laki" : "Perempuan"}
    </span>
  );
}


function InfoItem({ label, value, icon }) {
  return (
    <div className="flex gap-3">
      <div
        className={`w-9 h-9 rounded-lg ${themeNeutralSurface} ${themeNeutralBorder} border flex items-center justify-center theme-text-muted flex-shrink-0`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs theme-text-muted mb-0.5">
          {label}
        </p>

        <p className="text-sm font-semibold theme-text break-words">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}


function SectionHeader({ icon, title, subtitle }) {
  return (
    <div
      className={`px-5 py-4 border-b ${themeDivider} flex items-center gap-3`}
    >
      <div
        className={`w-9 h-9 rounded-lg ${themePrimarySoft} ${themePrimarySoftBorder} border ${themePrimaryText} flex items-center justify-center`}
      >
        {icon}
      </div>

      <div>
        <h2 className="text-sm font-bold theme-text">
          {title}
        </h2>

        {subtitle && (
          <p className="text-xs theme-text-secondary mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}


export default function DetailSiswaPage() {
  const router = useRouter();
  const params = useParams();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [siswa, setSiswa] = useState(null);
  const [loading, setLoading] = useState(true);

  const id = params?.id;

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(async () => {
      if (!id) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        if (isMounted) setLoading(true);
        const res = await getUserById(id);
        const data = res?.data ?? res;

        if (data && isMounted) {
          const kNama =
            data.kelasSiswa?.[0]?.kelas?.nama ??
            data.kelas?.nama ??
            data.kelasNama ??
            "-";

          setSiswa({
            id: data.id,
            nama: data.namaLengkap || data.nama || "Tanpa Nama",
            nisn: data.nisn || "-",
            nik: data.nik || "-",
            kelas: kNama,
            jenjang: "Sekolah Menengah Kejuruan",
            waliKelas: "-",
            tahunMasuk: data.dibuatPada ? String(new Date(data.dibuatPada).getFullYear()) : "2025",
            jenisKelamin: data.jenisKelamin === "L" || data.jenisKelamin === "Laki-laki" ? "L" : "P",
            tempatLahir: data.tempatLahir || "-",
            tanggalLahir: data.tanggalLahir
              ? new Date(data.tanggalLahir).toLocaleDateString("id-ID")
              : "-",
            agama: data.agama || "-",
            noTelepon: data.noTelepon || "-",
            alamat: data.alamat || data.alamatDomisili || "-",
            status: data.status || "aktif",
            namaOrtu: data.namaAyah || data.namaIbu || data.namaWaliPesertaDidik || "-",
            hubunganOrtu: data.namaAyah ? "Ayah Kandung" : data.namaIbu ? "Ibu Kandung" : "Wali",
            teleponOrtu: data.noHpAyah || data.noHpIbu || "-",
            alamatOrtu: data.alamat || "-",
            avatar: data.avatar || null,
            sekolahNama: data.sekolah?.nama || "SMARTSCHOOL",
          });
        }
      } catch (err) {
        console.error("Gagal mengambil data detail siswa dari API:", err);
        if (isMounted) setSiswa(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [id]);


  if (!siswa) {
    return (
      <div className="flex h-screen w-full theme-page overflow-hidden">
        <Sidebar
          active="siswaKartuIdentitas"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div
                className={`w-16 h-16 mx-auto rounded-full ${themeNeutralSurface} ${themeNeutralBorder} border flex items-center justify-center theme-text-muted mb-4`}
              >
                <User size={28} />
              </div>

              <h1 className="text-lg font-bold theme-text">
                Data siswa tidak ditemukan
              </h1>

              <p className="text-sm theme-text-secondary mt-1 mb-5">
                Siswa dengan ID tersebut tidak tersedia.
              </p>

              <button
                onClick={() =>
                  router.push(
                    "/admin/siswa/kartu-identitas"
                  )
                }
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] text-sm font-semibold ${themePrimaryShadow} hover:brightness-105 transition`}
              >
                <ArrowLeft size={16} />
                Kembali ke Daftar Siswa
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="siswaKartuIdentitas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">


            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/siswa/kartu-identitas"
                    )
                  }
                  className={`w-10 h-10 rounded-xl theme-card border ${themeNeutralBorder} flex items-center justify-center theme-text-secondary ${themePrimaryHover} hover:text-[var(--color-primary)] transition`}
                  title="Kembali"
                >
                  <ArrowLeft size={18} />
                </button>

                <div>
                  <h1 className="text-2xl font-bold theme-text">
                    Detail Siswa
                  </h1>

                  <p className="text-sm theme-text-secondary mt-0.5">
                    Informasi lengkap identitas dan data siswa.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/siswa/kartu-identitas/card?id=${siswa.id}`
                    )
                  }
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border ${themeNeutralBorder} theme-card theme-text-secondary text-sm font-semibold ${themeNeutralHover} hover:text-[var(--color-primary)] transition`}
                >
                  <CreditCard size={16} />
                  ID Card
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/siswa/edit/${siswa.id}`
                    )
                  }
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] text-sm font-semibold ${themePrimaryShadow} hover:brightness-105 transition`}
                >
                  <Edit size={16} />
                  Edit Siswa
                </button>
              </div>
            </div>


            <div
              className={`theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} overflow-hidden`}
            >
              <div className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                  <div
                    className={`w-24 h-24 rounded-2xl ${themePrimaryGradient} text-[var(--color-card)] flex items-center justify-center text-3xl font-bold ${themePrimaryShadow} flex-shrink-0`}
                  >
                    {getInitials(siswa.nama)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-bold theme-text">
                        {siswa.nama}
                      </h2>

                      <StatusBadge status={siswa.status} />
                    </div>

                    <p className="text-sm theme-text-secondary mt-1">
                      NISN {siswa.nisn}
                    </p>

                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${themePrimarySoft} ${themePrimarySoftBorder} border ${themePrimaryText} text-xs font-bold`}
                      >
                        <School size={13} />
                        Kelas {siswa.kelas}
                      </span>

                      <JenisKelaminBadge
                        jenisKelamin={siswa.jenisKelamin}
                      />

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${themeNeutralSurface} ${themeNeutralBorder} border theme-text-secondary text-xs font-semibold`}
                      >
                        <CalendarDays size={13} />
                        Masuk {siswa.tahunMasuk}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <section
              className={`theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} overflow-hidden`}
            >
              <SectionHeader
                icon={<User size={18} />}
                title="Data Identitas Siswa"
                subtitle="Informasi dasar dan identitas pribadi siswa"
              />

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoItem
                  label="Nama Lengkap"
                  value={siswa.nama}
                  icon={<User size={16} />}
                />

                <InfoItem
                  label="NISN"
                  value={siswa.nisn}
                  icon={<Hash size={16} />}
                />

                <InfoItem
                  label="NIK"
                  value={siswa.nik}
                  icon={<IdCard size={16} />}
                />

                <InfoItem
                  label="Jenis Kelamin"
                  value={
                    siswa.jenisKelamin === "L"
                      ? "Laki-laki"
                      : "Perempuan"
                  }
                  icon={<UserRound size={16} />}
                />

                <InfoItem
                  label="Tempat Lahir"
                  value={siswa.tempatLahir}
                  icon={<MapPin size={16} />}
                />

                <InfoItem
                  label="Tanggal Lahir"
                  value={siswa.tanggalLahir}
                  icon={<CalendarDays size={16} />}
                />

                <InfoItem
                  label="Agama"
                  value={siswa.agama}
                  icon={<UserRound size={16} />}
                />

                <InfoItem
                  label="No. Telepon"
                  value={siswa.noTelepon}
                  icon={<Phone size={16} />}
                />

                <InfoItem
                  label="Status"
                  value={
                    siswa.status === "aktif"
                      ? "Aktif"
                      : "Nonaktif"
                  }
                  icon={<CheckCircle2 size={16} />}
                />

                <div className="sm:col-span-2 lg:col-span-3">
                  <div className="flex gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg ${themeNeutralSurface} ${themeNeutralBorder} border flex items-center justify-center theme-text-muted flex-shrink-0`}
                    >
                      <MapPin size={16} />
                    </div>

                    <div>
                      <p className="text-xs theme-text-muted mb-0.5">
                        Alamat
                      </p>

                      <p className="text-sm font-semibold theme-text">
                        {siswa.alamat}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>


            <section
              className={`theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} overflow-hidden`}
            >
              <SectionHeader
                icon={<GraduationCap size={18} />}
                title="Data Akademik"
                subtitle="Informasi akademik dan penempatan siswa"
              />

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoItem
                  label="Kelas"
                  value={siswa.kelas}
                  icon={<School size={16} />}
                />

                <InfoItem
                  label="Jenjang"
                  value={siswa.jenjang}
                  icon={<GraduationCap size={16} />}
                />

                <InfoItem
                  label="Wali Kelas"
                  value={siswa.waliKelas}
                  icon={<UserRound size={16} />}
                />

                <InfoItem
                  label="Tahun Masuk"
                  value={siswa.tahunMasuk}
                  icon={<CalendarDays size={16} />}
                />

                <InfoItem
                  label="Status Siswa"
                  value={
                    siswa.status === "aktif"
                      ? "Aktif"
                      : "Nonaktif"
                  }
                  icon={<CheckCircle2 size={16} />}
                />
              </div>
            </section>


            <section
              className={`theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} overflow-hidden`}
            >
              <SectionHeader
                icon={<Users size={18} />}
                title="Data Orang Tua / Wali"
                subtitle="Informasi orang tua atau wali siswa"
              />

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoItem
                  label="Nama Orang Tua / Wali"
                  value={siswa.namaOrtu}
                  icon={<UserRound size={16} />}
                />

                <InfoItem
                  label="Hubungan"
                  value={siswa.hubunganOrtu}
                  icon={<Users size={16} />}
                />

                <InfoItem
                  label="No. Telepon"
                  value={siswa.teleponOrtu}
                  icon={<Phone size={16} />}
                />

                <InfoItem
                  label="Alamat"
                  value={siswa.alamatOrtu}
                  icon={<MapPin size={16} />}
                />
              </div>
            </section>


            <div className="flex items-center justify-between gap-3 pb-4">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/admin/siswa/kartu-identitas"
                  )
                }
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border ${themeNeutralBorder} theme-card theme-text-secondary text-sm font-semibold ${themeNeutralHover} transition`}
              >
                <ArrowLeft size={16} />
                Kembali
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/siswa/kartu-identitas/card?id=${siswa.id}`
                    )
                  }
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border ${themeNeutralBorder} theme-card theme-text-secondary text-sm font-semibold ${themeNeutralHover} hover:text-[var(--color-primary)] transition`}
                >
                  <CreditCard size={16} />
                  Lihat ID Card
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/admin/siswa/edit/${siswa.id}`
                    )
                  }
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg ${themePrimaryGradient} text-[var(--color-card)] text-sm font-semibold ${themePrimaryShadow} hover:brightness-105 transition`}
                >
                  <Edit size={16} />
                  Edit Siswa
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}