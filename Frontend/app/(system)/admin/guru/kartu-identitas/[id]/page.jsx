"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getUserById } from "@/services/user.service";
import {
  ArrowLeft,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  GraduationCap,
  Briefcase,
  Building2,
  BadgeCheck,
  Pencil,
  User,
  Cake,
  Venus,
  Mars,
  Heart,
  BookOpen,
  Fingerprint,
} from "lucide-react";



function getInitials(nama) {
  return nama
    .replace(/,.*/, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function TipeBadge({ tipe }) {
  const isGuru = tipe === "Guru";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
        isGuru
          ? "theme-info"
          : "theme-warning"
      }`}
    >
      {isGuru ? <GraduationCap size={11} /> : <Briefcase size={11} />}
      {tipe}
    </span>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "aktif";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
        isActive
          ? "theme-success"
          : "theme-card-soft theme-text-muted theme-border"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[var(--color-success)]" : "bg-[var(--color-text-muted)]"}`} />
      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}

function FotoPlaceholder() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="var(--color-border-soft)" />
      <circle cx="100" cy="80" r="38" fill="var(--color-card)" />
      <path d="M30 200c0-51.7 31.3-93.6 70-93.6s70 41.9 70 93.6H30z" fill="var(--color-card)" />
    </svg>
  );
}

function getAvatarUrl(avatar) {
  if (!avatar || typeof avatar !== "string") return null;
  if (/^(https?:|data:)/i.test(avatar)) return avatar;

  const baseUrl = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
  ).replace(/\/+$/, "");

  return `${baseUrl}/${avatar.replace(/^\/+/, "")}`;
}

function FotoProfil({ nama, avatar }) {
  const avatarUrl = getAvatarUrl(avatar);

  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-[0_10px_30px_color-mix(in_srgb,var(--color-text)_14%,transparent)] border-2 border-[var(--color-card)] ring-1 ring-[var(--color-border)]">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={`Foto profil ${nama}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <FotoPlaceholder />
        )}
      </div>
    </div>
  );

}

export default function DetailPegawaiPage() {
  const router = useRouter();
  const params = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pegawai, setPegawai] = useState(null);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    let isMounted = true;

    const timer = setTimeout(async () => {
      const id = params?.id;
      if (!id) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        if (isMounted) setLoading(true);
        const res = await getUserById(id);
        const data = res?.data ?? res;

        if (data && isMounted) {
          const mapelNama =
            data.mataPelajaran?.nama ??
            data.guruMapel?.[0]?.mataPelajaran?.nama ??
            data.mapel ??
            "-";

          setPegawai({
            id: data.id,
            nama: data.namaLengkap || data.nama || "Tanpa Nama",
            nip: data.nip || "-",
            nuptk: data.nuptk || "-",
            nik: data.nik || "-",
            tipe:
              String(data.peran?.nama).toLowerCase() === "guru"
                ? "Guru"
                : data.peran?.namaTampilan || "-",
            jabatan: data.jabatan || "-",
            status: data.status || "aktif",
            email: data.email || "-",
            telp: data.noTelepon || "-",
            alamat: data.alamat || data.alamatDomisili || "-",
            jenisKelamin:
              data.jenisKelamin === "L" ||
              data.jenisKelamin === "Laki-laki"
                ? "Laki-laki"
                : data.jenisKelamin === "P" ||
                    data.jenisKelamin === "Perempuan"
                  ? "Perempuan"
                  : "-",
            tempatLahir: data.tempatLahir || "-",
            tglLahir: data.tanggalLahir
              ? new Date(data.tanggalLahir).toLocaleDateString("id-ID")
              : "-",
            agama: data.agama || "-",
            statusNikah: "-",
            pendidikanTerakhir: "-",
            unit: data.jabatan || "-",
            golongan: data.golongan || "-",
            level: data.peran?.namaTampilan || "-",
            tglMasuk: data.dibuatPada
              ? new Date(data.dibuatPada).toLocaleDateString("id-ID")
              : "-",
            avatar: data.avatar || null,
          });
        }
      } catch (err) {
        console.error("Gagal mengambil data pegawai dari API:", err);
        if (isMounted) setPegawai(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [params?.id]);

  const handleBack = () => {
    router.push("/admin/guru/kartu-identitas");
  };

  const handleEdit = () => {
    if (pegawai?.id) {
      router.push(`/admin/guru/kartu-identitas/edit?id=${pegawai.id}`);
    }
  };

  const handleIdCard = () => {
    if (pegawai?.id) {
      router.push(`/admin/guru/kartu-identitas/card?id=${pegawai.id}`);
    }
  };

  if (!pegawai) {
    return (
      <div className="flex h-screen w-full theme-page overflow-hidden">
        <Sidebar
          active="guruKartuIdentitas"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header
            toggleSidebar={toggleSidebar}
            notifications={[]}
            user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AD" }}
          />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] p-10 text-center">
                <p className="text-sm theme-text-muted mb-4">Data pegawai tidak ditemukan.</p>
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-4 py-2 theme-primary rounded-xl text-sm font-medium transition-all"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Kartu Identitas
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="guruKartuIdentitas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AD" }}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-medium theme-text-secondary hover:text-[var(--color-primary)] transition-colors w-fit"
              >
                <ArrowLeft size={16} />
                Kembali ke Kartu Identitas
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl theme-warning theme-sidebar-hover transition-colors text-sm font-medium"
                >
                  <Pencil size={15} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleIdCard}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl theme-primary transition-all text-sm font-medium"
                >
                  <CreditCard size={15} />
                  Lihat ID Card
                </button>
              </div>
            </div>

            <div className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <FotoProfil nama={pegawai.nama} avatar={pegawai.avatar} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold theme-text">{pegawai.nama}</h1>
                    <TipeBadge tipe={pegawai.tipe} />
                    <StatusBadge status={pegawai.status} />
                  </div>
                  <p className="text-sm theme-text-muted mt-0.5">
                    {pegawai.jabatan} • <span className="font-mono">{pegawai.nip}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t theme-border-soft">
                <div className="flex items-start gap-2.5">
                  <Mail size={15} className="theme-text-muted mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] theme-text-muted">Email</p>
                    <p className="text-sm theme-text-secondary truncate">{pegawai.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone size={15} className="theme-text-muted mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] theme-text-muted">Telepon</p>
                    <p className="text-sm theme-text-secondary">{pegawai.telp}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="theme-text-muted mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] theme-text-muted">Alamat</p>
                    <p className="text-sm theme-text-secondary">{pegawai.alamat}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CalendarDays size={15} className="theme-text-muted mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] theme-text-muted">Tanggal Bergabung</p>
                    <p className="text-sm theme-text-secondary">{pegawai.tglMasuk}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b theme-border-soft flex items-center gap-2.5">
                <User size={16} className="text-[var(--color-primary)]" />
                <h2 className="text-sm font-semibold theme-text">Data Diri</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 divide-[var(--color-border-soft)]">
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4 sm:border-r sm:theme-border-soft">
                  <Fingerprint size={15} className="theme-text-muted mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] theme-text-muted">NIK</p>
                    <p className="text-sm font-medium theme-text mt-0.5 font-mono">{pegawai.nik}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4 lg:border-r lg:theme-border-soft">
                  <Cake size={15} className="theme-text-muted mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] theme-text-muted">Tempat, Tanggal Lahir</p>
                    <p className="text-sm font-medium theme-text mt-0.5">
                      {pegawai.tempatLahir}, {pegawai.tglLahir}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4 sm:border-r sm:theme-border-soft lg:border-r-0">
                  {pegawai.jenisKelamin === "Perempuan" ? (
                    <Venus size={15} className="theme-text-muted mt-0.5 shrink-0" />
                  ) : (
                    <Mars size={15} className="theme-text-muted mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] theme-text-muted">Jenis Kelamin</p>
                    <p className="text-sm font-medium theme-text mt-0.5">{pegawai.jenisKelamin}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4 lg:border-r lg:theme-border-soft border-t sm:border-t theme-border-soft">
                  <BookOpen size={15} className="theme-text-muted mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] theme-text-muted">Agama</p>
                    <p className="text-sm font-medium theme-text mt-0.5">{pegawai.agama}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4 sm:border-r sm:theme-border-soft border-t theme-border-soft">
                  <Heart size={15} className="theme-text-muted mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] theme-text-muted">Status Pernikahan</p>
                    <p className="text-sm font-medium theme-text mt-0.5">{pegawai.statusNikah}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4 border-t theme-border-soft">
                  <GraduationCap size={15} className="theme-text-muted mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] theme-text-muted">Pendidikan Terakhir</p>
                    <p className="text-sm font-medium theme-text mt-0.5">{pegawai.pendidikanTerakhir}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="theme-card theme-border rounded-xl border shadow-[0_1px_3px_color-mix(in_srgb,var(--color-text)_8%,transparent)] overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b theme-border-soft flex items-center gap-2.5">
                <BadgeCheck size={16} className="text-[var(--color-primary)]" />
                <h2 className="text-sm font-semibold theme-text">Informasi Kepegawaian</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-border-soft)]">
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4">
                  <Building2 size={15} className="theme-text-muted mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] theme-text-muted">Unit / Bidang</p>
                    <p className="text-sm font-medium theme-text mt-0.5">{pegawai.unit}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4">
                  <BadgeCheck size={15} className="theme-text-muted mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] theme-text-muted">Golongan</p>
                    <p className="text-sm font-medium theme-text mt-0.5">{pegawai.golongan}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4">
                  <GraduationCap size={15} className="theme-text-muted mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] theme-text-muted">Level</p>
                    <p className="text-sm font-medium theme-text mt-0.5">{pegawai.level}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}