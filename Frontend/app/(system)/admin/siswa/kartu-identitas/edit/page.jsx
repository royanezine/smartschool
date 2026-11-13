"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getSiswaById, updateSiswa } from "@/services/siswa.service";
import { getKelas } from "@/services/kelas.service";
import { getJurusan } from "@/services/jurusan.service";
import { getTahunAjaran } from "@/services/tahunAjaran.service";

import {
  ArrowLeft,
  Save,
  User,
  Fingerprint,
  Cake,
  School,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Users,
  X,
  Venus,
  Mars,
  UserRound,
  IdCard,
} from "lucide-react";


const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_80%,#000))]";

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


const OPSI_STATUS = [
  { value: "aktif", label: "Aktif" },
  { value: "nonaktif", label: "Nonaktif" },
];

const OPSI_JENIS_KELAMIN = [
  { value: "laki-laki", label: "Laki-laki" },
  { value: "perempuan", label: "Perempuan" },
];

function extractList(response) {
  const result = response?.data ?? response;
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  return [];
}

function optionalText(value) {
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

function formatDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function normalizeGenderValue(value) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === "l" || normalized === "laki-laki") return "laki-laki";
  if (normalized === "p" || normalized === "perempuan") return "perempuan";
  return "";
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
  const [opsiKelas, setOpsiKelas] = useState([]);
  const [opsiJurusan, setOpsiJurusan] = useState([]);
  const [initialKelasId, setInitialKelasId] = useState("");
  const [initialTahunAjaranId, setInitialTahunAjaranId] = useState("");
  const [activeTahunAjaranId, setActiveTahunAjaranId] = useState("");
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
        const [res, resKelas, resJurusan, resTahun] = await Promise.allSettled([
          getSiswaById(String(id)),
          getKelas({ page: 1, limit: 100 }),
          getJurusan({ page: 1, limit: 100 }),
          getTahunAjaran(),
        ]);
        if (!active) return;

        if (resKelas.status === "fulfilled") {
          setOpsiKelas(extractList(resKelas.value));
        }
        if (resJurusan.status === "fulfilled") {
          setOpsiJurusan(extractList(resJurusan.value));
        }
        if (resTahun.status === "fulfilled") {
          const years = extractList(resTahun.value);
          const activeYear =
            years.find(
              (y) => String(y?.status || "").toLowerCase() === "aktif"
            ) || years[0];
          if (activeYear?.id) {
            setActiveTahunAjaranId(String(activeYear.id));
          }
        }

        const siswaVal = res.status === "fulfilled" ? res.value : null;
        const found = siswaVal?.data?.data ?? siswaVal?.data ?? siswaVal;
        if (!active) return;

        if (found?.id) {
          const activeKelasRel = Array.isArray(found.kelasSiswa)
            ? found.kelasSiswa[0]
            : null;
          const kelasAwal =
            activeKelasRel?.kelasId ||
            activeKelasRel?.kelas?.id ||
            found.kelasId ||
            "";
          const tahunAwal =
            activeKelasRel?.tahunAjaranId ||
            activeKelasRel?.kelas?.tahunAjaranId ||
            "";

          const rawStatus = String(found.status || "aktif").trim().toLowerCase();
          const mapped = {
            id: found.id,
            namaPengguna: found.namaPengguna || "",
            nama: found.namaLengkap || "",
            nis: found.nis || "",
            nipd: found.nipd || "",
            nisn: found.nisn || "",
            nik: found.nik || "",
            kelasId: kelasAwal ? String(kelasAwal) : "",
            jurusanId: found.jurusanId ? String(found.jurusanId) : "",
            status: rawStatus === "nonaktif" ? "nonaktif" : "aktif",
            tempatLahir: found.tempatLahir || "",
            tglLahir: formatDateInput(found.tanggalLahir),
            jenisKelamin: normalizeGenderValue(found.jenisKelamin),
            namaAyah: found.namaAyah || "",
            nikAyah: found.nikAyah || "",
            pekerjaanAyah: found.pekerjaanAyah || "",
            noHpAyah: found.noHpAyah || "",
            namaIbu: found.namaIbu || "",
            nikIbu: found.nikIbu || "",
            pekerjaanIbu: found.pekerjaanIbu || "",
            noHpIbu: found.noHpIbu || "",
            namaWaliPesertaDidik: found.namaWaliPesertaDidik || "",
            telp: found.noTelepon || "",
            email: found.email || "",
            alamat: found.alamat || "",
            alamatKtp: found.alamatKtp || "",
            alamatDomisili: found.alamatDomisili || "",
            alamatSesuaiDomisili: Boolean(found.alamatSesuaiDomisili),
            provinsi: found.provinsi || "",
            kotaKabupaten: found.kotaKabupaten || "",
            kecamatan: found.kecamatan || "",
            kelurahan: found.kelurahan || "",
            kodePos: found.kodePos || "",
          };
          setInitialKelasId(kelasAwal ? String(kelasAwal) : "");
          setInitialTahunAjaranId(tahunAwal ? String(tahunAwal) : "");
          setSiswaAsli(mapped);
          setForm(mapped);
        }
      } catch (err) {
        console.error("Gagal memuat siswa:", err);
      } finally {
        if (active) setLoadingSiswa(false);
      }
    }

    loadSiswa();

    return () => {
      active = false;
    };
  }, [searchParams]);

  const updateField = (field) => (e) => {
    const value = e?.target
      ? e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value
      : e;
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

    if (!form.nama?.trim() || form.nama.trim().length < 2) {
      alert("Nama lengkap wajib diisi (minimal 2 karakter).");
      return;
    }

    if (form.nik?.trim() && !/^\d{16}$/.test(form.nik.trim())) {
      alert("NIK harus terdiri dari tepat 16 angka.");
      return;
    }

    if ((form.namaWaliPesertaDidik || "").trim().length > 20) {
      alert("Nama wali peserta didik maksimal 20 karakter.");
      return;
    }

    const payload = {
      namaLengkap: form.nama.trim(),
      ...(form.namaPengguna?.trim()
        ? { namaPengguna: form.namaPengguna.trim() }
        : {}),
      ...(form.email?.trim() ? { email: form.email.trim() } : {}),
      nis: optionalText(form.nis),
      nipd: optionalText(form.nipd),
      nisn: optionalText(form.nisn),
      nik: optionalText(form.nik),
      status: form.status === "nonaktif" ? "nonaktif" : "aktif",
      jenisKelamin: optionalText(form.jenisKelamin),
      tempatLahir: optionalText(form.tempatLahir),
      tanggalLahir: form.tglLahir || null,
      noTelepon: optionalText(form.telp),
      alamat: optionalText(form.alamat),
      alamatKtp: optionalText(form.alamatKtp),
      alamatDomisili: form.alamatSesuaiDomisili
        ? optionalText(form.alamatKtp || form.alamat || form.alamatDomisili)
        : optionalText(form.alamatDomisili),
      alamatSesuaiDomisili: Boolean(form.alamatSesuaiDomisili),
      provinsi: optionalText(form.provinsi),
      kotaKabupaten: optionalText(form.kotaKabupaten),
      kecamatan: optionalText(form.kecamatan),
      kelurahan: optionalText(form.kelurahan),
      kodePos: optionalText(form.kodePos),
      namaAyah: optionalText(form.namaAyah),
      nikAyah: optionalText(form.nikAyah),
      pekerjaanAyah: optionalText(form.pekerjaanAyah),
      noHpAyah: optionalText(form.noHpAyah),
      namaIbu: optionalText(form.namaIbu),
      nikIbu: optionalText(form.nikIbu),
      pekerjaanIbu: optionalText(form.pekerjaanIbu),
      noHpIbu: optionalText(form.noHpIbu),
      namaWaliPesertaDidik: optionalText(form.namaWaliPesertaDidik),
      jurusanId: form.jurusanId ? String(form.jurusanId) : null,
    };

    if (form.kelasId) {
      const selectedKelas = opsiKelas.find(
        (k) => String(k.id) === String(form.kelasId)
      );
      payload.kelasId = String(form.kelasId);
      const selectedTahunAjaranId =
        selectedKelas?.tahunAjaranId || selectedKelas?.tahunAjaran?.id;
      if (selectedTahunAjaranId) {
        payload.tahunAjaranId = String(selectedTahunAjaranId);
      }
    } else if (initialKelasId) {
      const detachTahunAjaranId =
        initialTahunAjaranId || activeTahunAjaranId;
      if (!detachTahunAjaranId) {
        alert("Tahun ajaran tidak ditemukan untuk melepas kelas.");
        return;
      }
      payload.kelasId = null;
      payload.tahunAjaranId = String(detachTahunAjaranId);
    }

    setSaving(true);
    try {
      await updateSiswa(String(form.id), payload);

      router.push(`/admin/siswa/kartu-identitas/${form.id}`);
    } catch (err) {
      console.error("Gagal menyimpan data siswa:", err);
      alert(err?.message || "Gagal menyimpan perubahan data siswa.");
    } finally {
      setSaving(false);
    }
  };

  if (loadingSiswa) {
    return (
      <div className="flex h-screen w-full items-center justify-center theme-page">
        <p className="text-sm theme-text-secondary">Memuat data siswa...</p>
      </div>
    );
  }

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
                    text-white
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
                    text-white
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
              icon={IdCard}
              title="Informasi Utama"
              description="Informasi identitas utama siswa."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                <FieldWrapper
                  icon={User}
                  label="Nama Lengkap"
                  required
                >
                  <input
                    type="text"
                    value={form.nama || ""}
                    onChange={updateField("nama")}
                    className={inputClass}
                    placeholder="Contoh: Ahmad Fauzan"
                    maxLength={100}
                    required
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={UserRound}
                  label="Username"
                >
                  <input
                    type="text"
                    value={form.namaPengguna || ""}
                    onChange={updateField("namaPengguna")}
                    className={inputClass}
                    placeholder="Username login siswa"
                    maxLength={50}
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={Fingerprint}
                  label="NIS"
                >
                  <input
                    type="text"
                    value={form.nis || ""}
                    onChange={updateField("nis")}
                    className={`${inputClass} font-mono`}
                    placeholder="Nomor Induk Siswa"
                    maxLength={20}
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={Fingerprint}
                  label="NIPD"
                >
                  <input
                    type="text"
                    value={form.nipd || ""}
                    onChange={updateField("nipd")}
                    className={`${inputClass} font-mono`}
                    placeholder="Nomor Induk Peserta Didik"
                    maxLength={20}
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={Fingerprint}
                  label="NISN"
                >
                  <input
                    type="text"
                    value={form.nisn || ""}
                    onChange={updateField("nisn")}
                    className={`${inputClass} font-mono`}
                    placeholder="10 digit NISN"
                    maxLength={20}
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
                    maxLength={16}
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={UserRound}
                  label="Status Siswa"
                >
                  <select
                    value={form.status || "aktif"}
                    onChange={updateField("status")}
                    className={inputClass}
                  >
                    {OPSI_STATUS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
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
                    form.jenisKelamin === "perempuan"
                      ? Venus
                      : Mars
                  }
                  label="Jenis Kelamin"
                >
                  <select
                    value={form.jenisKelamin || ""}
                    onChange={updateField("jenisKelamin")}
                    className={inputClass}
                  >
                    <option value="">Pilih jenis kelamin</option>
                    {OPSI_JENIS_KELAMIN.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FieldWrapper>
              </div>
            </SectionCard>


            <SectionCard
              icon={School}
              title="Informasi Akademik"
              description="Informasi penempatan kelas dan jurusan siswa."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                <FieldWrapper
                  icon={GraduationCap}
                  label="Kelas"
                >
                  <select
                    value={form.kelasId || ""}
                    onChange={updateField("kelasId")}
                    className={inputClass}
                  >
                    <option value="">Tidak ada / Lepas kelas</option>

                    {opsiKelas.map((option) => (
                      <option key={option.id} value={String(option.id)}>
                        {option.nama}
                      </option>
                    ))}
                  </select>
                </FieldWrapper>

                <FieldWrapper
                  icon={GraduationCap}
                  label="Jurusan"
                >
                  <select
                    value={form.jurusanId || ""}
                    onChange={updateField("jurusanId")}
                    className={inputClass}
                  >
                    <option value="">Tidak ada / Pilih jurusan</option>

                    {opsiJurusan.map((option) => (
                      <option key={option.id} value={String(option.id)}>
                        {option.nama} ({option.kode})
                      </option>
                    ))}
                  </select>
                </FieldWrapper>
              </div>
            </SectionCard>


            <SectionCard
              icon={Users}
              title="Orang Tua / Wali"
              description="Informasi orang tua atau wali siswa."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                <FieldWrapper icon={User} label="Nama Ayah">
                  <input
                    type="text"
                    value={form.namaAyah || ""}
                    onChange={updateField("namaAyah")}
                    className={inputClass}
                    placeholder="Nama lengkap ayah"
                    maxLength={100}
                  />
                </FieldWrapper>

                <FieldWrapper icon={Fingerprint} label="NIK Ayah">
                  <input
                    type="text"
                    value={form.nikAyah || ""}
                    onChange={updateField("nikAyah")}
                    className={inputClass}
                    placeholder="NIK ayah"
                    maxLength={20}
                  />
                </FieldWrapper>

                <FieldWrapper icon={BriefcaseIcon} label="Pekerjaan Ayah">
                  <input
                    type="text"
                    value={form.pekerjaanAyah || ""}
                    onChange={updateField("pekerjaanAyah")}
                    className={inputClass}
                    placeholder="Contoh: Karyawan Swasta"
                    maxLength={50}
                  />
                </FieldWrapper>

                <FieldWrapper icon={Phone} label="Nomor HP Ayah">
                  <input
                    type="tel"
                    value={form.noHpAyah || ""}
                    onChange={updateField("noHpAyah")}
                    className={inputClass}
                    placeholder="Contoh: 0812-3456-7890"
                    maxLength={20}
                  />
                </FieldWrapper>

                <FieldWrapper icon={User} label="Nama Ibu">
                  <input
                    type="text"
                    value={form.namaIbu || ""}
                    onChange={updateField("namaIbu")}
                    className={inputClass}
                    placeholder="Nama lengkap ibu"
                    maxLength={100}
                  />
                </FieldWrapper>

                <FieldWrapper icon={Fingerprint} label="NIK Ibu">
                  <input
                    type="text"
                    value={form.nikIbu || ""}
                    onChange={updateField("nikIbu")}
                    className={inputClass}
                    placeholder="NIK ibu"
                    maxLength={20}
                  />
                </FieldWrapper>

                <FieldWrapper icon={BriefcaseIcon} label="Pekerjaan Ibu">
                  <input
                    type="text"
                    value={form.pekerjaanIbu || ""}
                    onChange={updateField("pekerjaanIbu")}
                    className={inputClass}
                    placeholder="Contoh: Guru"
                    maxLength={50}
                  />
                </FieldWrapper>

                <FieldWrapper icon={Phone} label="Nomor HP Ibu">
                  <input
                    type="tel"
                    value={form.noHpIbu || ""}
                    onChange={updateField("noHpIbu")}
                    className={inputClass}
                    placeholder="Contoh: 0812-3456-7890"
                    maxLength={20}
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={UserRound}
                  label="Nama Wali Peserta Didik (maks. 20 karakter)"
                  className="sm:col-span-2"
                >
                  <input
                    type="text"
                    value={form.namaWaliPesertaDidik || ""}
                    onChange={updateField("namaWaliPesertaDidik")}
                    className={inputClass}
                    placeholder="Maksimal 20 karakter"
                    maxLength={20}
                  />
                </FieldWrapper>
              </div>
            </SectionCard>


            <SectionCard
              icon={Phone}
              title="Kontak & Alamat"
              description="Informasi kontak dan alamat siswa."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                <FieldWrapper icon={Phone} label="Nomor Telepon Siswa">
                  <input
                    type="tel"
                    value={form.telp || ""}
                    onChange={updateField("telp")}
                    className={inputClass}
                    placeholder="Contoh: 0812-3456-7890"
                    maxLength={20}
                  />
                </FieldWrapper>

                <FieldWrapper icon={Mail} label="Email Siswa">
                  <input
                    type="email"
                    value={form.email || ""}
                    onChange={updateField("email")}
                    className={inputClass}
                    placeholder="nama@student.sch.id"
                    maxLength={100}
                  />
                </FieldWrapper>

                <FieldWrapper icon={MapPin} label="Provinsi">
                  <input
                    type="text"
                    value={form.provinsi || ""}
                    onChange={updateField("provinsi")}
                    className={inputClass}
                    placeholder="Masukkan provinsi"
                    maxLength={50}
                  />
                </FieldWrapper>

                <FieldWrapper icon={MapPin} label="Kota / Kabupaten">
                  <input
                    type="text"
                    value={form.kotaKabupaten || ""}
                    onChange={updateField("kotaKabupaten")}
                    className={inputClass}
                    placeholder="Masukkan kota/kabupaten"
                    maxLength={50}
                  />
                </FieldWrapper>

                <FieldWrapper icon={MapPin} label="Kecamatan">
                  <input
                    type="text"
                    value={form.kecamatan || ""}
                    onChange={updateField("kecamatan")}
                    className={inputClass}
                    placeholder="Masukkan kecamatan"
                    maxLength={50}
                  />
                </FieldWrapper>

                <FieldWrapper icon={MapPin} label="Kelurahan / Desa">
                  <input
                    type="text"
                    value={form.kelurahan || ""}
                    onChange={updateField("kelurahan")}
                    className={inputClass}
                    placeholder="Masukkan kelurahan"
                    maxLength={50}
                  />
                </FieldWrapper>

                <FieldWrapper icon={MapPin} label="Kode Pos">
                  <input
                    type="text"
                    value={form.kodePos || ""}
                    onChange={updateField("kodePos")}
                    className={inputClass}
                    placeholder="Kode pos"
                    maxLength={10}
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={MapPin}
                  label="Alamat Lengkap"
                  className="sm:col-span-2"
                >
                  <textarea
                    value={form.alamat || ""}
                    onChange={updateField("alamat")}
                    rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder="Masukkan alamat lengkap siswa"
                  />
                </FieldWrapper>

                <FieldWrapper
                  icon={MapPin}
                  label="Alamat KTP"
                  className="sm:col-span-2"
                >
                  <textarea
                    value={form.alamatKtp || ""}
                    onChange={updateField("alamatKtp")}
                    rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder="Masukkan alamat sesuai KTP"
                  />
                </FieldWrapper>

                <div className="sm:col-span-2">
                  <label className="inline-flex items-center gap-2 text-xs font-medium theme-text-secondary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(form.alamatSesuaiDomisili)}
                      onChange={updateField("alamatSesuaiDomisili")}
                    />
                    Alamat domisili sama dengan alamat KTP
                  </label>
                </div>

                <FieldWrapper
                  icon={MapPin}
                  label="Alamat Domisili"
                  className="sm:col-span-2"
                >
                  <textarea
                    value={
                      form.alamatSesuaiDomisili
                        ? form.alamatKtp || form.alamat || form.alamatDomisili || ""
                        : form.alamatDomisili || ""
                    }
                    onChange={updateField("alamatDomisili")}
                    rows={3}
                    disabled={Boolean(form.alamatSesuaiDomisili)}
                    className={`${inputClass} resize-none`}
                    placeholder="Masukkan alamat domisili"
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
              text-white
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
}