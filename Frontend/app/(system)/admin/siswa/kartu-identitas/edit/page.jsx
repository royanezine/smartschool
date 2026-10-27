"use client";

import { Suspense, useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getSemuaSiswa, updateSiswa } from "@/services/siswa.service";
import { getKelas } from "@/services/kelas.service";

import {
  ArrowLeft,
  Save,
  Camera,
  User,
  Fingerprint,
  Cake,
  Heart,
  BookOpen,
  School,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  CalendarDays,
  Users,
  X,
  Venus,
  Mars,
  UserRound,
  IdCard,
} from "lucide-react";


const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";

const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";

const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";

const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";

const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";


const OPSI_STATUS = ["Aktif", "Nonaktif"];

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

const OPSI_STATUS_KELUARGA = [
  "Anak Kandung",
  "Anak Tiri",
  "Anak Angkat",
];

function FotoPlaceholder() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="200"
        height="200"
        fill="var(--color-border-soft)"
      />

      <circle
        cx="100"
        cy="80"
        r="38"
        fill="var(--color-card)"
      />

      <path
        d="M30 200c0-51.7 31.3-93.6 70-93.6s70 41.9 70 93.6H30z"
        fill="var(--color-card)"
      />
    </svg>
  );
}


function FotoEditor({
  siswaId,
  foto,
  onChange,
}) {
  const fileInputRef = useRef(null);

  const handlePilihFoto = () => {
    fileInputRef.current?.click();
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File yang dipilih harus berupa gambar.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      onChange(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleHapusFoto = () => {
    onChange(null);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-5">

      <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
        <div
          className={`
            w-full h-full rounded-2xl overflow-hidden
            border-2 border-[var(--color-card)]
            ring-1 ${themeNeutralBorder}
            ${themeSmallShadow}
          `}
        >
          {foto ? (
            <img
              src={foto}
              alt="Foto siswa"
              className="w-full h-full object-cover"
            />
          ) : (
            <FotoPlaceholder />
          )}
        </div>


        <button
          type="button"
          onClick={handlePilihFoto}
          title="Ubah foto"
          className={`
            absolute -bottom-1.5 -right-1.5
            w-8 h-8 rounded-full
            ${themePrimaryGradient}
            text-[var(--color-card)]
            flex items-center justify-center
            ${themePrimaryShadow}
            hover:brightness-110
            transition-all
          `}
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
        <p className="text-sm font-medium theme-text">
          Foto Profil Siswa
        </p>

        <p className="text-xs theme-text-muted max-w-md">
          Format JPG atau PNG. Disarankan menggunakan foto
          dengan rasio 1:1 agar tampilan kartu identitas lebih
          rapi.
        </p>

        {foto && (
          <button
            type="button"
            onClick={handleHapusFoto}
            className="
              inline-flex items-center gap-1.5
              text-xs font-medium
              theme-danger
              hover:opacity-80
              transition-colors
            "
          >
            <X size={12} />
            Hapus foto
          </button>
        )}
      </div>
    </div>
  );
}


function FieldWrapper({
  icon: Icon,
  label,
  required = false,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="flex items-center gap-1.5 text-xs font-medium theme-text-muted mb-1.5">
        {Icon && (
          <Icon
            size={13}
            className="theme-text-muted"
          />
        )}

        {label}

        {required && (
          <span className="theme-danger">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}


const inputClass = `
  w-full px-3.5 py-2.5 rounded-xl
  border ${themeNeutralBorder}
  text-sm theme-text
  placeholder:text-[var(--color-text-placeholder)]
  ${themeNeutralSurface}
  focus:outline-none
  ${themeFocus}
  transition-colors
`;


function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <div
      className={`
        theme-card rounded-xl
        border ${themeNeutralBorder}
        ${themeCardShadow}
        overflow-hidden
      `}
    >

      <div
        className={`
          px-5 sm:px-6 py-4
          border-b ${themeDivider}
          flex items-start gap-2.5
        `}
      >
        <div
          className={`
            w-8 h-8 rounded-lg
            ${themePrimarySoft}
            ${themePrimarySoftBorder}
            text-[var(--color-primary)]
            flex items-center justify-center
            shrink-0
          `}
        >
          <Icon size={16} />
        </div>

        <div>
          <h2 className="text-sm font-semibold theme-text">
            {title}
          </h2>

          {description && (
            <p className="text-xs theme-text-muted mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>


      <div className="p-5 sm:p-6">
        {children}
      </div>
    </div>
  );
}


function EditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [foto, setFoto] = useState(null);
  const [siswaAsli, setSiswaAsli] = useState(null);
  const [loadingSiswa, setLoadingSiswa] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadSiswa() {
      const id = searchParams.get("id");
      if (!id) {
        setLoadingSiswa(false);
        return;
      }

      try {
        setLoadingSiswa(true);
        const [res, resKelas] = await Promise.allSettled([
          getSemuaSiswa({ search: String(id), limit: 50 }),
          getKelas({ limit: 100 }),
        ]);
        if (!active) return;
        if (resKelas.status === "fulfilled") {
          const val = resKelas.value;
          const kList = Array.isArray(val?.data) ? val.data : Array.isArray(val) ? val : [];
          setOpsiKelas(kList.map((k) => k.nama).filter(Boolean));
        }
        const siswaVal = res.status === "fulfilled" ? res.value : null;
        const list = Array.isArray(siswaVal?.data) ? siswaVal.data : [];
        if (!active) return;
        
        const found = list.find(
          (item) =>
            String(item.id) === String(id) ||
            String(item.nis) === String(id) ||
            String(item.nisn) === String(id)
        );

        if (found) {
          const mapped = {
            id: found.id,
            nama: found.namaLengkap || "",
            nis: found.nis || "",
            nisn: found.nisn || "",
            nik: "-",
            kelas: found.kelas?.nama || "Umum",
            status: found.status || "Aktif",
            tempatLahir: "-",
            tglLahir: "-",
            jenisKelamin: found.jenisKelamin || "Laki-laki",
            agama: "Islam",
            statusKeluarga: "Anak Kandung",
            sekolahAsal: "-",
            tahunMasuk: "-",
            tanggalMasuk: "-",
            namaAyah: "-",
            pekerjaanAyah: "-",
            namaIbu: "-",
            pekerjaanIbu: "-",
            telpOrangTua: "-",
            telp: found.noTelepon || "",
            email: found.email || "",
            alamat: "-",
          };
          setSiswaAsli(mapped);
          setForm(mapped);
        }
      } catch (err) {
        console.error("Gagal memuat siswa:", err);
      } finally {
        if (active) setLoadingSiswa(false);
      }
    }

    const timer = setTimeout(() => {
      loadSiswa();
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [searchParams]);

  const updateField = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  const handleBack = () => {
    if (siswaAsli?.id) {
      router.push(`/admin/siswa/${siswaAsli.id}`);
      return;
    }
    router.push("/admin/siswa/kartu-identitas");
  };

  const handleBatal = () => {
    handleBack();
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!form) return;

    if (!form.nama?.trim() || !form.nis?.trim() || !form.nisn?.trim()) {
      alert("Nama, NIS, dan NISN wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      await updateSiswa(String(form.id), {
        namaLengkap: form.nama.trim(),
        email: form.email?.trim() || undefined,
        nis: form.nis.trim(),
        nisn: form.nisn.trim(),
        status: form.status || "Aktif",
        jenisKelamin: form.jenisKelamin,
        noTelepon: form.telp?.trim() || undefined,
      });

      router.push("/admin/siswa/kartu-identitas");
    } catch (err) {
      console.error("Gagal menyimpan data siswa:", err);
      alert(err?.message || "Gagal menyimpan perubahan data siswa.");
    } finally {
      setSaving(false);
    }
  };

  if (!siswaAsli) {
    return (
      <div className="flex h-screen w-full theme-page overflow-hidden">
        <Sidebar
          active="siswa"
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
            <div className="p-4 sm:p-6 lg:p-8">
              <div
                className={`
                  theme-card rounded-xl
                  border ${themeNeutralBorder}
                  ${themeCardShadow}
                  p-10 text-center
                `}
              >
                <div
                  className={`
                    mx-auto mb-4
                    w-12 h-12 rounded-xl
                    ${themeNeutralSurface}
                    flex items-center justify-center
                    theme-text-muted
                  `}
                >
                  <User size={22} />
                </div>

                <p className="text-sm theme-text-secondary mb-4">
                  Data siswa tidak ditemukan.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/siswa"
                    )
                  }
                  className={`
                    inline-flex items-center gap-2
                    px-4 py-2
                    ${themePrimaryGradient}
                    text-[var(--color-card)]
                    rounded-xl
                    text-sm font-medium
                    ${themePrimaryShadow}
                    hover:brightness-110
                    transition-all
                  `}
                >
                  <ArrowLeft size={16} />
                  Kembali ke Data Siswa
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }


  if (!form) {
    return null;
  }


  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">

      <Sidebar
        active="siswa"
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
          <form
            onSubmit={handleSimpan}
            className="p-4 sm:p-6 lg:p-8 space-y-6 pb-28"
          >

            <button
              type="button"
              onClick={handleBack}
              className="
                flex items-center gap-2
                text-sm font-medium
                theme-text-secondary
                hover:text-[var(--color-primary)]
                transition-colors
                w-fit
              "
            >
              <ArrowLeft size={16} />

              Kembali ke Detail Siswa
            </button>


            <div>
              <div className="flex items-center gap-3">
                <div
                  className={`
                    w-10 h-10 rounded-xl
                    ${themePrimaryGradient}
                    text-[var(--color-card)]
                    flex items-center justify-center
                    ${themePrimaryShadow}
                  `}
                >
                  <User size={19} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold theme-text">
                    Edit Data Siswa
                  </h1>

                  <p className="text-sm theme-text-secondary">
                    {siswaAsli.nama}{" "}
                    •{" "}
                    <span className="font-mono">
                      {siswaAsli.nis}
                    </span>
                  </p>
                </div>
              </div>
            </div>


            <SectionCard
              icon={Camera}
              title="Foto Profil"
              description="Kelola foto profil siswa."
            >
              <FotoEditor
                siswaId={form.id}
                foto={foto}
                onChange={setFoto}
              />
            </SectionCard>


            <SectionCard
              icon={IdCard}
              title="Informasi Utama"
              description="Informasi identitas utama siswa."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                <FieldWrapper
                  icon={User}
                  label="Nama Lengkap"
                  required
                  className="sm:col-span-2"
                >
                  <input
                    type="text"
                    value={form.nama || ""}
                    onChange={updateField("nama")}
                    className={inputClass}
                    placeholder="Contoh: Ahmad Fauzan"
                    required
                  />
                </FieldWrapper>


                <FieldWrapper
                  icon={Fingerprint}
                  label="NIS"
                  required
                >
                  <input
                    type="text"
                    value={form.nis || ""}
                    onChange={updateField("nis")}
                    className={`${inputClass} font-mono`}
                    placeholder="Nomor Induk Siswa"
                    required
                  />
                </FieldWrapper>


                <FieldWrapper
                  icon={Fingerprint}
                  label="NISN"
                  required
                >
                  <input
                    type="text"
                    value={form.nisn || ""}
                    onChange={updateField("nisn")}
                    className={`${inputClass} font-mono`}
                    placeholder="10 digit NISN"
                    required
                  />
                </FieldWrapper>


                <FieldWrapper
                  icon={Fingerprint}
                  label="NIK"
                >
                  <input
                    type="text"
                    value={form.nik || ""}
                    onChange={updateField("nik")}
                    className={`${inputClass} font-mono`}
                    placeholder="16 digit NIK"
                  />
                </FieldWrapper>


                <FieldWrapper
                  icon={UserRound}
                  label="Status Siswa"
                >
                  <select
                    value={
                      form.status || "Aktif"
                    }
                    onChange={updateField("status")}
                    className={inputClass}
                  >
                    {OPSI_STATUS.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      )
                    )}
                  </select>
                </FieldWrapper>
              </div>
            </SectionCard>


            <SectionCard
              icon={User}
              title="Data Diri"
              description="Informasi pribadi dan identitas siswa."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                <FieldWrapper
                  icon={MapPin}
                  label="Tempat Lahir"
                >
                  <input
                    type="text"
                    value={
                      form.tempatLahir || ""
                    }
                    onChange={updateField(
                      "tempatLahir"
                    )}
                    className={inputClass}
                    placeholder="Contoh: Depok"
                  />
                </FieldWrapper>


                <FieldWrapper
                  icon={Cake}
                  label="Tanggal Lahir"
                >
                  <input
                    type="date"
                    value={
                      form.tglLahir || ""
                    }
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
                      form.jenisKelamin ||
                      "Laki-laki"
                    }
                    onChange={updateField(
                      "jenisKelamin"
                    )}
                    className={inputClass}
                  >
                    {OPSI_JENIS_KELAMIN.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
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
                    value={
                      form.agama || "Islam"
                    }
                    onChange={updateField(
                      "agama"
                    )}
                    className={inputClass}
                  >
                    {OPSI_AGAMA.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      )
                    )}
                  </select>
                </FieldWrapper>


                <FieldWrapper
                  icon={Heart}
                  label="Status Dalam Keluarga"
                >
                  <select
                    value={
                      form.statusKeluarga ||
                      "Anak Kandung"
                    }
                    onChange={updateField(
                      "statusKeluarga"
                    )}
                    className={inputClass}
                  >
                    {OPSI_STATUS_KELUARGA.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      )
                    )}
                  </select>
                </FieldWrapper>
              </div>
            </SectionCard>


            <SectionCard
              icon={School}
              title="Informasi Akademik"
              description="Informasi kelas dan riwayat pendidikan siswa."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                <FieldWrapper
                  icon={GraduationCap}
                  label="Kelas"
                  required
                >
                  <select
                    value={
                      form.kelas || ""
                    }
                    onChange={updateField(
                      "kelas"
                    )}
                    className={inputClass}
                    required
                  >
                    <option value="">
                      Pilih kelas
                    </option>

                    {opsiKelas.map(
                      (option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {option}
                        </option>
                      )
                    )}
                  </select>
                </FieldWrapper>


                <FieldWrapper
                  icon={CalendarDays}
                  label="Tahun Masuk"
                >
                  <input
                    type="text"
                    value={
                      form.tahunMasuk || ""
                    }
                    onChange={updateField(
                      "tahunMasuk"
                    )}
                    className={inputClass}
                    placeholder="Contoh: 2024"
                  />
                </FieldWrapper>


                <FieldWrapper
                  icon={School}
                  label="Sekolah Asal"
                  className="sm:col-span-2"
                >
                  <input
                    type="text"
                    value={
                      form.sekolahAsal || ""
                    }
                    onChange={updateField(
                      "sekolahAsal"
                    )}
                    className={inputClass}
                    placeholder="Contoh: SMP Negeri 1 Depok"
                  />
                </FieldWrapper>


                <FieldWrapper
                  icon={CalendarDays}
                  label="Tanggal Masuk Sekolah"
                  className="sm:col-span-2"
                >
                  <input
                    type="date"
                    value={
                      form.tanggalMasuk || ""
                    }
                    onChange={updateField(
                      "tanggalMasuk"
                    )}
                    className={inputClass}
                  />
                </FieldWrapper>
              </div>
            </SectionCard>


            <SectionCard
              icon={Users}
              title="Orang Tua / Wali"
              description="Informasi orang tua atau wali siswa."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                <FieldWrapper
                  icon={User}
                  label="Nama Ayah"
                >
                  <input
                    type="text"
                    value={
                      form.namaAyah || ""
                    }
                    onChange={updateField(
                      "namaAyah"
                    )}
                    className={inputClass}
                    placeholder="Nama lengkap ayah"
                  />
                </FieldWrapper>


                <FieldWrapper
                  icon={BriefcaseIcon}
                  label="Pekerjaan Ayah"
                >
                  <input
                    type="text"
                    value={
                      form.pekerjaanAyah || ""
                    }
                    onChange={updateField(
                      "pekerjaanAyah"
                    )}
                    className={inputClass}
                    placeholder="Contoh: Karyawan Swasta"
                  />
                </FieldWrapper>


                <FieldWrapper
                  icon={User}
                  label="Nama Ibu"
                >
                  <input
                    type="text"
                    value={
                      form.namaIbu || ""
                    }
                    onChange={updateField(
                      "namaIbu"
                    )}
                    className={inputClass}
                    placeholder="Nama lengkap ibu"
                  />
                </FieldWrapper>


                <FieldWrapper
                  icon={BriefcaseIcon}
                  label="Pekerjaan Ibu"
                >
                  <input
                    type="text"
                    value={
                      form.pekerjaanIbu || ""
                    }
                    onChange={updateField(
                      "pekerjaanIbu"
                    )}
                    className={inputClass}
                    placeholder="Contoh: Guru"
                  />
                </FieldWrapper>


                <FieldWrapper
                  icon={Phone}
                  label="Nomor Telepon Orang Tua / Wali"
                  className="sm:col-span-2"
                >
                  <input
                    type="tel"
                    value={
                      form.telpOrangTua || ""
                    }
                    onChange={updateField(
                      "telpOrangTua"
                    )}
                    className={inputClass}
                    placeholder="Contoh: 0812-3456-7890"
                  />
                </FieldWrapper>
              </div>
            </SectionCard>


            <SectionCard
              icon={Phone}
              title="Kontak & Alamat"
              description="Informasi kontak siswa."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                <FieldWrapper
                  icon={Phone}
                  label="Nomor Telepon Siswa"
                >
                  <input
                    type="tel"
                    value={
                      form.telp || ""
                    }
                    onChange={updateField(
                      "telp"
                    )}
                    className={inputClass}
                    placeholder="Contoh: 0812-3456-7890"
                  />
                </FieldWrapper>


                <FieldWrapper
                  icon={Mail}
                  label="Email Siswa"
                >
                  <input
                    type="email"
                    value={
                      form.email || ""
                    }
                    onChange={updateField(
                      "email"
                    )}
                    className={inputClass}
                    placeholder="nama@student.sch.id"
                  />
                </FieldWrapper>


                <FieldWrapper
                  icon={MapPin}
                  label="Alamat Lengkap"
                  className="sm:col-span-2"
                >
                  <textarea
                    value={
                      form.alamat || ""
                    }
                    onChange={updateField(
                      "alamat"
                    )}
                    rows={4}
                    className={`${inputClass} resize-none`}
                    placeholder="Masukkan alamat lengkap siswa"
                  />
                </FieldWrapper>
              </div>
            </SectionCard>
          </form>
        </main>


        <div
          className={`
            border-t ${themeDivider}
            bg-[color-mix(in_srgb,var(--color-card)_92%,transparent)]
            backdrop-blur
            px-4 sm:px-6 lg:px-8
            py-3.5
            flex items-center justify-end gap-2.5
          `}
        >
          <button
            type="button"
            onClick={handleBatal}
            disabled={saving}
            className={`
              inline-flex items-center gap-2
              px-4 py-2.5 rounded-xl
              border ${themeNeutralBorder}
              theme-text-secondary
              text-sm font-medium
              ${themeNeutralHover}
              hover:text-[var(--color-primary)]
              disabled:opacity-50
              transition-colors
            `}
          >
            <X size={15} />
            Batal
          </button>

          <button
            type="button"
            onClick={handleSimpan}
            disabled={saving}
            className={`
              inline-flex items-center gap-2
              px-5 py-2.5 rounded-xl
              ${themePrimaryGradient}
              text-[var(--color-card)]
              text-sm font-semibold
              ${themePrimaryShadow}
              hover:brightness-110
              disabled:opacity-60
              disabled:cursor-not-allowed
              transition-all
            `}
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


function BriefcaseIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect
        width="20"
        height="14"
        x="2"
        y="7"
        rx="2"
      />

      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />

      <path d="M2 12h20" />
    </svg>
  );
}


function EditSiswaPageContent() {
  return (
    <Suspense fallback={null}>
      <EditContent />
    </Suspense>
  );
}

export default function Edit() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen theme-page" />
      }
    >
      <EditContent />
    </Suspense>
  );
const [opsiKelas, setOpsiKelas] = useState([]);
  }