"use client";

import { Suspense, useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
import {
  ArrowLeft,
  Save,
  Camera,
  User,
  Fingerprint,
  Cake,
  Heart,
  BookOpen,
  Building2,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  BadgeCheck,
  CalendarDays,
  Briefcase,
  Venus,
  Mars,
  X,
} from "lucide-react";

/**
 * app/admin/guru/kartu-identitas/edit/page.jsx
 *
 * Halaman Edit Pegawai — dibuka dari tombol "Edit" di halaman Detail
 * (kartu-identitas/[id]/page.jsx), yang mengarah ke
 * /admin/guru/kartu-identitas/edit?id={id}.
 *
 * Route statis menggunakan query string (?id=...).
 *
 * Form mencakup semua field yang ada di MOCK_PEGAWAI:
 * - Foto profil
 * - Informasi utama
 * - Data diri
 * - Informasi kepegawaian
 * - Kontak & alamat
 *
 * Data masih dummy dan submit masih simulasi sampai API backend tersedia.
 */

const MOCK_PEGAWAI = [
  {
    id: 1,
    nama: "Sarah Amelia, S.Pd",
    nip: "198501152010012001",
    nik: "3272011501850002",
    tipe: "Guru",
    jabatan: "Guru Matematika",
    level: "Guru",
    status: "aktif",
    unit: "Mata Pelajaran Matematika",
    telp: "0812-3456-7890",
    email: "sarah.amelia@smartschool.sch.id",
    alamat: "Jl. Merdeka No. 12, Tasikmalaya",
    tglMasuk: "2010-01-15",
    golongan: "III/c",
    tempatLahir: "Tasikmalaya",
    tglLahir: "1985-01-15",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    statusNikah: "Menikah",
    pendidikanTerakhir:
      "S1 Pendidikan Matematika — Universitas Siliwangi",
  },
  {
    id: 2,
    nama: "Budi Santoso, S.E",
    nip: "197803102005011003",
    nik: "3272011003780003",
    tipe: "Staff",
    jabatan: "Tata Usaha",
    level: "Staff",
    status: "aktif",
    unit: "Administrasi & Keuangan",
    telp: "0813-2233-4455",
    email: "budi.santoso@smartschool.sch.id",
    alamat: "Jl. Cihideung No. 5, Tasikmalaya",
    tglMasuk: "2005-03-10",
    golongan: "III/a",
    tempatLahir: "Ciamis",
    tglLahir: "1978-03-10",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    statusNikah: "Menikah",
    pendidikanTerakhir:
      "S1 Ekonomi — Universitas Galuh",
  },
  {
    id: 3,
    nama: "Dewi Anggraini, S.Si",
    nip: "199002202015022004",
    nik: "3272016002900004",
    tipe: "Guru",
    jabatan: "Guru IPA",
    level: "Guru",
    status: "aktif",
    unit: "Mata Pelajaran IPA",
    telp: "0821-9988-7766",
    email: "dewi.anggraini@smartschool.sch.id",
    alamat: "Jl. Sutisna Senjaya No. 88, Tasikmalaya",
    tglMasuk: "2015-02-20",
    golongan: "III/b",
    tempatLahir: "Tasikmalaya",
    tglLahir: "1990-02-20",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    statusNikah: "Belum Menikah",
    pendidikanTerakhir:
      "S1 Biologi — Universitas Siliwangi",
  },
  {
    id: 4,
    nama: "Andi Prasetyo, S.Pd",
    nip: "198712052012011002",
    nik: "3272010512870005",
    tipe: "Guru",
    jabatan: "Guru Bahasa Indonesia",
    level: "Guru",
    status: "nonaktif",
    unit: "Mata Pelajaran Bahasa Indonesia",
    telp: "0857-1122-3344",
    email: "andi.prasetyo@smartschool.sch.id",
    alamat: "Jl. Yudanegara No. 21, Tasikmalaya",
    tglMasuk: "2012-12-05",
    golongan: "III/a",
    tempatLahir: "Garut",
    tglLahir: "1987-12-05",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    statusNikah: "Menikah",
    pendidikanTerakhir:
      "S1 Pendidikan Bahasa Indonesia — Universitas Galuh",
  },
  {
    id: 5,
    nama: "Nina Kartika, S.Sn",
    nip: "199105182018022005",
    nik: "3272015805910006",
    tipe: "Guru",
    jabatan: "Guru Seni Budaya",
    level: "Guru",
    status: "aktif",
    unit: "Mata Pelajaran Seni Budaya",
    telp: "0878-5566-7788",
    email: "nina.kartika@smartschool.sch.id",
    alamat: "Jl. Ir. H. Djuanda No. 40, Tasikmalaya",
    tglMasuk: "2018-05-18",
    golongan: "III/a",
    tempatLahir: "Bandung",
    tglLahir: "1991-05-18",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    statusNikah: "Belum Menikah",
    pendidikanTerakhir:
      "S1 Seni Rupa — Institut Seni Budaya Indonesia",
  },
  {
    id: 6,
    nama: "Rudi Hartono, S.Pd",
    nip: "198309252008011006",
    nik: "3272012509830007",
    tipe: "Staff",
    jabatan: "Petugas Sarana Prasarana",
    level: "Staff",
    status: "aktif",
    unit: "Sarana & Prasarana",
    telp: "0896-4433-2211",
    email: "rudi.hartono@smartschool.sch.id",
    alamat: "Jl. Cieunteung No. 9, Tasikmalaya",
    tglMasuk: "2008-09-25",
    golongan: "II/d",
    tempatLahir: "Tasikmalaya",
    tglLahir: "1983-09-25",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    statusNikah: "Menikah",
    pendidikanTerakhir:
      "S1 Pendidikan Jasmani — Universitas Galuh",
  },
];

const PHOTO_KEY_PREFIX = "ki_foto_";

const OPSI_TIPE = ["Guru", "Staff"];
const OPSI_STATUS = ["aktif", "nonaktif"];
const OPSI_JENIS_KELAMIN = [
  "Laki-laki",
  "Perempuan",
];
const OPSI_AGAMA = [
  "Islam",
  "Kristen",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
];
const OPSI_STATUS_NIKAH = [
  "Belum Menikah",
  "Menikah",
  "Cerai Hidup",
  "Cerai Mati",
];
const OPSI_GOLONGAN = [
  "II/a",
  "II/b",
  "II/c",
  "II/d",
  "III/a",
  "III/b",
  "III/c",
  "III/d",
  "IV/a",
  "IV/b",
];

/* =========================================================
   FOTO PLACEHOLDER
========================================================= */

function FotoPlaceholder() {
  return (
    <div className="theme-card-soft flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 200 200"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="200"
          height="200"
          fill="var(--color-card-soft)"
        />

        <circle
          cx="100"
          cy="80"
          r="38"
          fill="var(--color-text-placeholder)"
          opacity="0.65"
        />

        <path
          d="M30 200c0-51.7 31.3-93.6 70-93.6s70 41.9 70 93.6H30z"
          fill="var(--color-text-placeholder)"
          opacity="0.65"
        />
      </svg>
    </div>
  );
}

/* =========================================================
   FOTO EDITOR
========================================================= */

function FotoEditor({
  pegawaiId,
  foto,
  onChange,
}) {
  const fileInputRef = useRef(null);

  const handlePilihFoto = () =>
    fileInputRef.current?.click();

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () =>
      onChange(reader.result);

    reader.readAsDataURL(file);
  };

  const handleHapusFoto = () =>
    onChange(null);

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
        <div className="theme-card-soft theme-border h-full w-full overflow-hidden rounded-2xl border-2 shadow-lg">
          {foto ? (
            <img
              src={foto}
              alt="Foto profil"
              className="h-full w-full object-cover"
            />
          ) : (
            <FotoPlaceholder />
          )}
        </div>

        <button
          type="button"
          onClick={handlePilihFoto}
          title="Ubah foto"
          className="theme-primary absolute -bottom-1.5 -right-1.5 flex h-8 w-8 items-center justify-center rounded-full shadow-md transition"
        >
          <Camera size={14} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFotoChange}
          className="hidden"
        />
      </div>

      <div className="space-y-1.5">
        <p className="theme-text text-sm font-medium">
          Foto Profil
        </p>

        <p className="theme-text-muted max-w-xs text-xs">
          Format JPG/PNG, disarankan rasio 1:1. Klik ikon
          kamera untuk mengganti foto.
        </p>

        {foto && (
          <button
            type="button"
            onClick={handleHapusFoto}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-danger)] transition-colors hover:opacity-80"
          >
            <X size={12} />
            Hapus foto
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   FIELD WRAPPER
========================================================= */

function FieldWrapper({
  icon: Icon,
  label,
  required,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="theme-text-secondary mb-1.5 flex items-center gap-1.5 text-xs font-medium">
        {Icon && (
          <Icon
            size={13}
            className="theme-text-muted"
          />
        )}

        {label}

        {required && (
          <span className="text-[var(--color-danger)]">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

/* =========================================================
   INPUT CLASS
========================================================= */

const inputClass =
  "theme-input w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20";

/* =========================================================
   SECTION CARD
========================================================= */

function SectionCard({
  icon: Icon,
  title,
  children,
}) {
  return (
    <div className="theme-card theme-border overflow-hidden rounded-xl border shadow-sm">
      <div className="theme-border flex items-center gap-2.5 border-b px-5 py-4 sm:px-6">
        <Icon
          size={16}
          className="text-[var(--color-primary)]"
        />

        <h2 className="theme-text text-sm font-semibold">
          {title}
        </h2>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   EDIT CONTENT
========================================================= */

function EditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [saving, setSaving] = useState(false);

  const pegawaiAsli = useMemo(() => {
    const id = Number(
      searchParams.get("id")
    );

    return MOCK_PEGAWAI.find(
      (p) => p.id === id
    );
  }, [searchParams]);

  const [form, setForm] = useState(null);
  const [foto, setFoto] = useState(null);

  useEffect(() => {
    if (!pegawaiAsli) return;

    setForm({ ...pegawaiAsli });

    try {
      const saved =
        window.localStorage.getItem(
          `${PHOTO_KEY_PREFIX}${pegawaiAsli.id}`
        );

      if (saved) {
        setFoto(saved);
      }
    } catch (err) {
      console.error(
        "Gagal memuat foto pegawai:",
        err
      );
    }
  }, [pegawaiAsli]);

  const updateField = (field) => (e) => {
    const value = e?.target
      ? e.target.value
      : e;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleSidebar = () =>
    setIsCollapsed(!isCollapsed);

  const handleBack = () => {
    if (pegawaiAsli) {
      router.push(
        `/admin/guru/kartu-identitas/${pegawaiAsli.id}`
      );
    } else {
      router.push(
        "/admin/guru/kartu-identitas"
      );
    }
  };

  const handleBatal = () =>
    handleBack();

  const handleSimpan = (e) => {
    e.preventDefault();

    if (!form) return;

    setSaving(true);

    try {
      if (foto) {
        window.localStorage.setItem(
          `${PHOTO_KEY_PREFIX}${form.id}`,
          foto
        );
      } else {
        window.localStorage.removeItem(
          `${PHOTO_KEY_PREFIX}${form.id}`
        );
      }
    } catch (err) {
      console.error(
        "Gagal menyimpan foto pegawai:",
        err
      );
    }

    console.log(
      "Data pegawai disimpan (dummy):",
      form
    );

    setTimeout(() => {
      setSaving(false);

      router.push(
        `/admin/guru/kartu-identitas/${form.id}`
      );
    }, 500);
  };

  /* =======================================================
     DATA TIDAK DITEMUKAN
  ======================================================= */

  if (!pegawaiAsli) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          active="guruKartuIdentitas"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
          role="admin"
        />

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
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
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="theme-card theme-border rounded-xl border p-10 text-center shadow-sm">
                <p className="theme-text-secondary mb-4 text-sm">
                  Data pegawai tidak ditemukan.
                  Pastikan kamu membuka halaman ini lewat
                  tombol &quot;Edit&quot; di halaman Detail
                  Pegawai.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/guru/kartu-identitas"
                    )
                  }
                  className="theme-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition"
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

  if (!form) return null;

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="guruKartuIdentitas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
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
          <form
            onSubmit={handleSimpan}
            className="space-y-6 p-4 pb-28 sm:p-6 lg:p-8"
          >
            {/* =================================================
                BACK
            ================================================= */}

            <button
              type="button"
              onClick={handleBack}
              className="theme-text-secondary flex w-fit items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={16} />
              Kembali ke Detail Pegawai
            </button>

            {/* =================================================
                TITLE
            ================================================= */}

            <div>
              <h1 className="theme-text text-2xl font-bold">
                Edit Data Pegawai
              </h1>

              <p className="theme-text-muted text-sm">
                {pegawaiAsli.nama} •{" "}
                <span className="font-mono">
                  {pegawaiAsli.nip}
                </span>
              </p>
            </div>

            {/* =================================================
                FOTO PROFIL
            ================================================= */}

            <SectionCard
              icon={User}
              title="Foto Profil"
            >
              <FotoEditor
                pegawaiId={form.id}
                foto={foto}
                onChange={setFoto}
              />
            </SectionCard>

            {/* =================================================
                INFORMASI UTAMA
            ================================================= */}

            <SectionCard
              icon={BadgeCheck}
              title="Informasi Utama"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <FieldWrapper
                  icon={User}
                  label="Nama Lengkap"
                  required
                  className="sm:col-span-2"
                >
                  <input
                    type="text"
                    value={form.nama}
                    onChange={updateField(
                      "nama"
                    )}
                    className={inputClass}
                    placeholder="Contoh: Sarah Amelia, S.Pd"
                    required
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={Fingerprint}
                  label="NIP"
                  required
                >
                  <input
                    type="text"
                    value={form.nip}
                    onChange={updateField(
                      "nip"
                    )}
                    className={`${inputClass} font-mono`}
                    placeholder="18 digit NIP"
                    required
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={Fingerprint}
                  label="NIK"
                  required
                >
                  <input
                    type="text"
                    value={form.nik}
                    onChange={updateField(
                      "nik"
                    )}
                    className={`${inputClass} font-mono`}
                    placeholder="16 digit NIK"
                    required
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={Briefcase}
                  label="Jabatan"
                  required
                >
                  <input
                    type="text"
                    value={form.jabatan}
                    onChange={updateField(
                      "jabatan"
                    )}
                    className={inputClass}
                    placeholder="Contoh: Guru Matematika"
                    required
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={GraduationCap}
                  label="Tipe"
                >
                  <select
                    value={form.tipe}
                    onChange={updateField(
                      "tipe"
                    )}
                    className={inputClass}
                  >
                    {OPSI_TIPE.map(
                      (opt) => (
                        <option
                          key={opt}
                          value={opt}
                        >
                          {opt}
                        </option>
                      )
                    )}
                  </select>
                </FieldWrapper>

                <FieldWrapper
                  icon={GraduationCap}
                  label="Level"
                >
                  <input
                    type="text"
                    value={form.level}
                    onChange={updateField(
                      "level"
                    )}
                    className={inputClass}
                    placeholder="Contoh: Guru / Staff"
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={BadgeCheck}
                  label="Status Kepegawaian"
                >
                  <select
                    value={form.status}
                    onChange={updateField(
                      "status"
                    )}
                    className={inputClass}
                  >
                    {OPSI_STATUS.map(
                      (opt) => (
                        <option
                          key={opt}
                          value={opt}
                        >
                          {opt === "aktif"
                            ? "Aktif"
                            : "Nonaktif"}
                        </option>
                      )
                    )}
                  </select>
                </FieldWrapper>
              </div>
            </SectionCard>

            {/* =================================================
                DATA DIRI
            ================================================= */}

            <SectionCard
              icon={User}
              title="Data Diri"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <FieldWrapper
                  icon={MapPin}
                  label="Tempat Lahir"
                >
                  <input
                    type="text"
                    value={
                      form.tempatLahir
                    }
                    onChange={updateField(
                      "tempatLahir"
                    )}
                    className={inputClass}
                    placeholder="Contoh: Tasikmalaya"
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={Cake}
                  label="Tanggal Lahir"
                >
                  <input
                    type="date"
                    value={form.tglLahir}
                    onChange={updateField(
                      "tglLahir"
                    )}
                    className={inputClass}
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={
                    form.jenisKelamin ===
                    "Perempuan"
                      ? Venus
                      : Mars
                  }
                  label="Jenis Kelamin"
                >
                  <select
                    value={
                      form.jenisKelamin
                    }
                    onChange={updateField(
                      "jenisKelamin"
                    )}
                    className={inputClass}
                  >
                    {OPSI_JENIS_KELAMIN.map(
                      (opt) => (
                        <option
                          key={opt}
                          value={opt}
                        >
                          {opt}
                        </option>
                      )
                    )}
                  </select>
                </FieldWrapper>

                <FieldWrapper
                  icon={BookOpen}
                  label="Agama"
                >
                  <select
                    value={form.agama}
                    onChange={updateField(
                      "agama"
                    )}
                    className={inputClass}
                  >
                    {OPSI_AGAMA.map(
                      (opt) => (
                        <option
                          key={opt}
                          value={opt}
                        >
                          {opt}
                        </option>
                      )
                    )}
                  </select>
                </FieldWrapper>

                <FieldWrapper
                  icon={Heart}
                  label="Status Pernikahan"
                >
                  <select
                    value={
                      form.statusNikah
                    }
                    onChange={updateField(
                      "statusNikah"
                    )}
                    className={inputClass}
                  >
                    {OPSI_STATUS_NIKAH.map(
                      (opt) => (
                        <option
                          key={opt}
                          value={opt}
                        >
                          {opt}
                        </option>
                      )
                    )}
                  </select>
                </FieldWrapper>

                <FieldWrapper
                  icon={GraduationCap}
                  label="Pendidikan Terakhir"
                >
                  <input
                    type="text"
                    value={
                      form.pendidikanTerakhir
                    }
                    onChange={updateField(
                      "pendidikanTerakhir"
                    )}
                    className={inputClass}
                    placeholder="Contoh: S1 Pendidikan Matematika — Universitas Siliwangi"
                  />
                </FieldWrapper>
              </div>
            </SectionCard>

            {/* =================================================
                INFORMASI KEPEGAWAIAN
            ================================================= */}

            <SectionCard
              icon={Building2}
              title="Informasi Kepegawaian"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <FieldWrapper
                  icon={Building2}
                  label="Unit / Bidang"
                  className="sm:col-span-2"
                >
                  <input
                    type="text"
                    value={form.unit}
                    onChange={updateField(
                      "unit"
                    )}
                    className={inputClass}
                    placeholder="Contoh: Mata Pelajaran Matematika"
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={BadgeCheck}
                  label="Golongan"
                >
                  <select
                    value={form.golongan}
                    onChange={updateField(
                      "golongan"
                    )}
                    className={inputClass}
                  >
                    {OPSI_GOLONGAN.map(
                      (opt) => (
                        <option
                          key={opt}
                          value={opt}
                        >
                          {opt}
                        </option>
                      )
                    )}
                  </select>
                </FieldWrapper>

                <FieldWrapper
                  icon={CalendarDays}
                  label="Tanggal Masuk Kerja"
                >
                  <input
                    type="date"
                    value={form.tglMasuk}
                    onChange={updateField(
                      "tglMasuk"
                    )}
                    className={inputClass}
                  />
                </FieldWrapper>
              </div>
            </SectionCard>

            {/* =================================================
                KONTAK & ALAMAT
            ================================================= */}

            <SectionCard
              icon={Phone}
              title="Kontak & Alamat"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <FieldWrapper
                  icon={Phone}
                  label="Nomor Telepon"
                >
                  <input
                    type="tel"
                    value={form.telp}
                    onChange={updateField(
                      "telp"
                    )}
                    className={inputClass}
                    placeholder="Contoh: 0812-3456-7890"
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={Mail}
                  label="Email"
                >
                  <input
                    type="email"
                    value={form.email}
                    onChange={updateField(
                      "email"
                    )}
                    className={inputClass}
                    placeholder="nama@smartschool.sch.id"
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={MapPin}
                  label="Alamat"
                  className="sm:col-span-2"
                >
                  <textarea
                    value={form.alamat}
                    onChange={updateField(
                      "alamat"
                    )}
                    rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder="Alamat lengkap"
                  />
                </FieldWrapper>
              </div>
            </SectionCard>
          </form>
        </main>

        {/* =====================================================
            ACTION BAR
        ===================================================== */}

        <div className="theme-header theme-border flex items-center justify-end gap-2.5 border-t px-4 py-3.5 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={handleBatal}
            className="theme-card theme-border theme-text-secondary theme-sidebar-hover rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSimpan}
            disabled={saving}
            className="theme-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={15} />

            {saving
              ? "Menyimpan..."
              : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function Edit() {
  return (
    <Suspense
      fallback={
        <div className="theme-page min-h-screen" />
      }
    >
      <EditContent />
    </Suspense>
  );
}