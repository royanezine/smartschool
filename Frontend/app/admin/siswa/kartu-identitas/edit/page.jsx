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

/*
|--------------------------------------------------------------------------
| CONFIG
|--------------------------------------------------------------------------
*/

const STORAGE_KEY = "smartschool_siswa";

const PHOTO_KEY_PREFIX = "siswa_foto_";

/*
|--------------------------------------------------------------------------
| DATA DUMMY SISWA
|--------------------------------------------------------------------------
|
| Data ini hanya digunakan sebagai data awal.
| Setelah diedit dan disimpan, data akan masuk ke localStorage.
|
*/

const MOCK_SISWA = [
  {
    id: 1,
    nama: "Ahmad Fauzan",
    nis: "20240001",
    nisn: "0081234567",
    nik: "3273011209080001",
    kelas: "X PPLG 1",
    status: "Aktif",

    tempatLahir: "Depok",
    tglLahir: "2008-09-12",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    statusKeluarga: "Anak Kandung",

    sekolahAsal: "SMP Negeri 1 Depok",
    tahunMasuk: "2024",
    tanggalMasuk: "2024-07-15",

    namaAyah: "Budi Fauzan",
    pekerjaanAyah: "Karyawan Swasta",
    namaIbu: "Siti Aminah",
    pekerjaanIbu: "Ibu Rumah Tangga",
    telpOrangTua: "081234567890",

    telp: "081298765432",
    email: "ahmad.fauzan@student.sch.id",
    alamat: "Jl. Merdeka No. 12, Depok",
  },

  {
    id: 2,
    nama: "Siti Aisyah",
    nis: "20240002",
    nisn: "0081234568",
    nik: "3273015209090002",
    kelas: "X PPLG 1",
    status: "Aktif",

    tempatLahir: "Jakarta",
    tglLahir: "2009-09-15",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    statusKeluarga: "Anak Kandung",

    sekolahAsal: "SMP Negeri 5 Jakarta",
    tahunMasuk: "2024",
    tanggalMasuk: "2024-07-15",

    namaAyah: "Agus Setiawan",
    pekerjaanAyah: "Wiraswasta",
    namaIbu: "Dewi Lestari",
    pekerjaanIbu: "Guru",
    telpOrangTua: "081223344556",

    telp: "082112345678",
    email: "siti.aisyah@student.sch.id",
    alamat: "Jl. Melati No. 8, Jakarta",
  },

  {
    id: 3,
    nama: "Rizky Pratama",
    nis: "20240003",
    nisn: "0081234569",
    nik: "3273011009080003",
    kelas: "X PPLG 2",
    status: "Aktif",

    tempatLahir: "Bogor",
    tglLahir: "2008-09-10",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    statusKeluarga: "Anak Kandung",

    sekolahAsal: "SMP Negeri 2 Bogor",
    tahunMasuk: "2024",
    tanggalMasuk: "2024-07-15",

    namaAyah: "Hendra Pratama",
    pekerjaanAyah: "Pegawai Negeri",
    namaIbu: "Rina Marlina",
    pekerjaanIbu: "Wiraswasta",
    telpOrangTua: "085612345678",

    telp: "085612345679",
    email: "rizky.pratama@student.sch.id",
    alamat: "Jl. Raya Bogor No. 20",
  },

  {
    id: 4,
    nama: "Nabila Putri",
    nis: "20240004",
    nisn: "0081234570",
    nik: "3273015809090004",
    kelas: "X AKL 1",
    status: "Aktif",

    tempatLahir: "Depok",
    tglLahir: "2009-09-18",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    statusKeluarga: "Anak Kandung",

    sekolahAsal: "SMP Negeri 3 Depok",
    tahunMasuk: "2024",
    tanggalMasuk: "2024-07-15",

    namaAyah: "Dedi Setiawan",
    pekerjaanAyah: "Karyawan Swasta",
    namaIbu: "Maya Sari",
    pekerjaanIbu: "Ibu Rumah Tangga",
    telpOrangTua: "082233445566",

    telp: "082233445567",
    email: "nabila.putri@student.sch.id",
    alamat: "Jl. Kenanga No. 14, Depok",
  },

  {
    id: 5,
    nama: "Fajar Ramadhan",
    nis: "20240005",
    nisn: "0081234571",
    nik: "3273012509080005",
    kelas: "X TJKT 1",
    status: "Nonaktif",

    tempatLahir: "Bekasi",
    tglLahir: "2008-09-25",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    statusKeluarga: "Anak Kandung",

    sekolahAsal: "SMP Negeri 4 Bekasi",
    tahunMasuk: "2024",
    tanggalMasuk: "2024-07-15",

    namaAyah: "Andi Ramadhan",
    pekerjaanAyah: "Wiraswasta",
    namaIbu: "Lina Kartika",
    pekerjaanIbu: "Karyawan Swasta",
    telpOrangTua: "081345678901",

    telp: "081345678902",
    email: "fajar.ramadhan@student.sch.id",
    alamat: "Jl. Mawar No. 5, Bekasi",
  },
];

/*
|--------------------------------------------------------------------------
| OPTIONS
|--------------------------------------------------------------------------
*/

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

const OPSI_KELAS = [
  "X PPLG 1",
  "X PPLG 2",
  "X AKL 1",
  "X AKL 2",
  "X TJKT 1",
  "X TJKT 2",
  "XI PPLG 1",
  "XI PPLG 2",
  "XI AKL 1",
  "XI TJKT 1",
  "XII PPLG 1",
  "XII PPLG 2",
  "XII AKL 1",
  "XII TJKT 1",
];

/*
|--------------------------------------------------------------------------
| PLACEHOLDER FOTO
|--------------------------------------------------------------------------
*/

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
        fill="#c9ced6"
      />

      <circle
        cx="100"
        cy="80"
        r="38"
        fill="#f3f4f6"
      />

      <path
        d="M30 200c0-51.7 31.3-93.6 70-93.6s70 41.9 70 93.6H30z"
        fill="#f3f4f6"
      />
    </svg>
  );
}

/*
|--------------------------------------------------------------------------
| FOTO EDITOR
|--------------------------------------------------------------------------
*/

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
      {/* FOTO */}

      <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">

        <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg shadow-slate-900/10 border-2 border-white ring-1 ring-slate-200">

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

        {/* CAMERA */}

        <button
          type="button"
          onClick={handlePilihFoto}
          title="Ubah foto"
          className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-[#155DFC] hover:bg-[#0d47c9] text-white flex items-center justify-center shadow-md transition-colors"
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

      {/* INFO FOTO */}

      <div className="space-y-1.5">

        <p className="text-sm font-medium text-slate-700">
          Foto Profil Siswa
        </p>

        <p className="text-xs text-slate-400 max-w-md">
          Format JPG atau PNG. Disarankan menggunakan foto
          dengan rasio 1:1 agar tampilan kartu identitas lebih
          rapi.
        </p>

        {foto && (
          <button
            type="button"
            onClick={handleHapusFoto}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
          >
            <X size={12} />
            Hapus foto
          </button>
        )}

      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| FIELD WRAPPER
|--------------------------------------------------------------------------
*/

function FieldWrapper({
  icon: Icon,
  label,
  required = false,
  children,
  className = "",
}) {
  return (
    <div className={className}>

      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">

        {Icon && (
          <Icon
            size={13}
            className="text-slate-400"
          />
        )}

        {label}

        {required && (
          <span className="text-red-400">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| INPUT STYLE
|--------------------------------------------------------------------------
*/

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#155DFC]/30 focus:border-[#155DFC] transition-colors";

/*
|--------------------------------------------------------------------------
| SECTION CARD
|--------------------------------------------------------------------------
*/

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">

      {/* HEADER */}

      <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-start gap-2.5">

        <div className="w-8 h-8 rounded-lg bg-[#eaf1ff] text-[#155DFC] flex items-center justify-center shrink-0">

          <Icon size={16} />

        </div>

        <div>

          <h2 className="text-sm font-semibold text-slate-800">
            {title}
          </h2>

          {description && (
            <p className="text-xs text-slate-400 mt-0.5">
              {description}
            </p>
          )}

        </div>

      </div>

      {/* CONTENT */}

      <div className="p-5 sm:p-6">

        {children}

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| EDIT CONTENT
|--------------------------------------------------------------------------
*/

function EditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState(null);

  const [foto, setFoto] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | AMBIL ID
  |--------------------------------------------------------------------------
  */

  const siswaAsli = useMemo(() => {

    const id = Number(
      searchParams.get("id")
    );

    /*
     * Cari dulu dari localStorage.
     * Kalau belum ada, gunakan MOCK.
     */

    if (typeof window !== "undefined") {

      try {

        const saved =
          window.localStorage.getItem(
            STORAGE_KEY
          );

        if (saved) {

          const data =
            JSON.parse(saved);

          const found =
            data.find(
              (item) =>
                Number(item.id) === id
            );

          if (found) {
            return found;
          }

        }

      } catch (error) {

        console.error(
          "Gagal membaca data siswa:",
          error
        );

      }
    }

    return MOCK_SISWA.find(
      (item) => item.id === id
    );

  }, [searchParams]);

  /*
  |--------------------------------------------------------------------------
  | LOAD DATA
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    if (!siswaAsli) return;

    setForm({
      ...siswaAsli,
    });

    try {

      const savedFoto =
        window.localStorage.getItem(
          `${PHOTO_KEY_PREFIX}${siswaAsli.id}`
        );

      if (savedFoto) {
        setFoto(savedFoto);
      }

    } catch (error) {

      console.error(
        "Gagal memuat foto siswa:",
        error
      );

    }

  }, [siswaAsli]);

  /*
  |--------------------------------------------------------------------------
  | UPDATE FIELD
  |--------------------------------------------------------------------------
  */

  const updateField =
    (field) => (e) => {

      const value =
        e?.target
          ? e.target.value
          : e;

      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));

    };

  /*
  |--------------------------------------------------------------------------
  | SIDEBAR
  |--------------------------------------------------------------------------
  */

  const toggleSidebar = () => {

    setIsCollapsed(
      (prev) => !prev
    );

  };

  /*
  |--------------------------------------------------------------------------
  | BACK
  |--------------------------------------------------------------------------
  */

  const handleBack = () => {

    if (siswaAsli) {

      router.push(
        `/admin/siswa/${siswaAsli.id}`
      );

      return;

    }

    router.push(
      "/admin/siswa"
    );

  };

  /*
  |--------------------------------------------------------------------------
  | BATAL
  |--------------------------------------------------------------------------
  */

  const handleBatal = () => {

    handleBack();

  };

  /*
  |--------------------------------------------------------------------------
  | SIMPAN
  |--------------------------------------------------------------------------
  */

  const handleSimpan = (e) => {

    e.preventDefault();

    if (!form) return;

    /*
     * Validasi sederhana
     */

    if (
      !form.nama?.trim() ||
      !form.nis?.trim() ||
      !form.nisn?.trim() ||
      !form.kelas
    ) {

      alert(
        "Nama, NIS, NISN, dan kelas wajib diisi."
      );

      return;

    }

    setSaving(true);

    try {

      /*
       * Ambil data lama
       */

      const raw =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      let data =
        raw
          ? JSON.parse(raw)
          : [...MOCK_SISWA];

      /*
       * Cari index siswa
       */

      const index =
        data.findIndex(
          (item) =>
            Number(item.id) ===
            Number(form.id)
        );

      /*
       * Update
       */

      if (index !== -1) {

        data[index] = {
          ...data[index],
          ...form,
        };

      } else {

        /*
         * Kalau belum ada di localStorage,
         * tambahkan data siswa.
         */

        data.push(form);

      }

      /*
       * Simpan data siswa
       */

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );

      /*
       * Simpan foto
       */

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

      console.log(
        "Data siswa berhasil disimpan:",
        form
      );

      /*
       * Redirect
       */

      setTimeout(() => {

        setSaving(false);

        router.push(
          `/admin/siswa/${form.id}`
        );

      }, 500);

    } catch (error) {

      console.error(
        "Gagal menyimpan data siswa:",
        error
      );

      setSaving(false);

      alert(
        "Gagal menyimpan perubahan data siswa."
      );

    }

  };

  /*
  |--------------------------------------------------------------------------
  | DATA TIDAK DITEMUKAN
  |--------------------------------------------------------------------------
  */

  if (!siswaAsli) {

    return (
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden">

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

              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-10 text-center">

                <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">

                  <User size={22} />

                </div>

                <p className="text-sm text-slate-500 mb-4">
                  Data siswa tidak ditemukan.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/siswa"
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#155DFC] hover:bg-[#0d47c9] text-white rounded-xl text-sm font-medium transition-all"
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

  /*
  |--------------------------------------------------------------------------
  | LOADING FORM
  |--------------------------------------------------------------------------
  */

  if (!form) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | MAIN
  |--------------------------------------------------------------------------
  */

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">

      {/* SIDEBAR */}

      <Sidebar
        active="siswa"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />

      {/* CONTENT AREA */}

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">

        {/* HEADER */}

        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* MAIN */}

        <main className="flex-1 overflow-y-auto">

          <form
            onSubmit={handleSimpan}
            className="p-4 sm:p-6 lg:p-8 space-y-6 pb-28"
          >

            {/* =====================================================
                BACK
            ===================================================== */}

            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#155DFC] transition-colors w-fit"
            >
              <ArrowLeft size={16} />

              Kembali ke Detail Siswa

            </button>

            {/* =====================================================
                TITLE
            ===================================================== */}

            <div>

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white flex items-center justify-center shadow-lg shadow-slate-900/10">

                  <User size={19} />

                </div>

                <div>

                  <h1 className="text-2xl font-bold text-slate-800">
                    Edit Data Siswa
                  </h1>

                  <p className="text-sm text-slate-500">
                    {siswaAsli.nama}{" "}
                    •{" "}
                    <span className="font-mono">
                      {siswaAsli.nis}
                    </span>
                  </p>

                </div>

              </div>

            </div>

            {/* =====================================================
                FOTO PROFIL
            ===================================================== */}

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

            {/* =====================================================
                INFORMASI UTAMA
            ===================================================== */}

            <SectionCard
              icon={IdCard}
              title="Informasi Utama"
              description="Informasi identitas utama siswa."
            >

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                {/* NAMA */}

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

                {/* NIS */}

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

                {/* NISN */}

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

                {/* NIK */}

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

                {/* STATUS */}

                <FieldWrapper
                  icon={UserRound}
                  label="Status Siswa"
                >

                  <select
                    value={
                      form.status || "Aktif"
                    }
                    onChange={updateField("status")}
                    className={`${inputClass} bg-white`}
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

            {/* =====================================================
                DATA DIRI
            ===================================================== */}

            <SectionCard
              icon={User}
              title="Data Diri"
              description="Informasi pribadi dan identitas siswa."
            >

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                {/* TEMPAT LAHIR */}

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

                {/* TANGGAL LAHIR */}

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

                {/* JENIS KELAMIN */}

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
                    className={`${inputClass} bg-white`}
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

                {/* AGAMA */}

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
                    className={`${inputClass} bg-white`}
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

                {/* STATUS KELUARGA */}

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
                    className={`${inputClass} bg-white`}
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

            {/* =====================================================
                DATA AKADEMIK
            ===================================================== */}

            <SectionCard
              icon={School}
              title="Informasi Akademik"
              description="Informasi kelas dan riwayat pendidikan siswa."
            >

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                {/* KELAS */}

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
                    className={`${inputClass} bg-white`}
                    required
                  >

                    <option value="">
                      Pilih kelas
                    </option>

                    {OPSI_KELAS.map(
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

                {/* TAHUN MASUK */}

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

                {/* SEKOLAH ASAL */}

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

                {/* TANGGAL MASUK */}

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

            {/* =====================================================
                ORANG TUA / WALI
            ===================================================== */}

            <SectionCard
              icon={Users}
              title="Orang Tua / Wali"
              description="Informasi orang tua atau wali siswa."
            >

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                {/* AYAH */}

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

                {/* PEKERJAAN AYAH */}

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

                {/* IBU */}

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

                {/* PEKERJAAN IBU */}

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

                {/* TELEPON ORTU */}

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

            {/* =====================================================
                KONTAK & ALAMAT
            ===================================================== */}

            <SectionCard
              icon={Phone}
              title="Kontak & Alamat"
              description="Informasi kontak siswa."
            >

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                {/* TELEPON */}

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

                {/* EMAIL */}

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

                {/* ALAMAT */}

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

        {/* =========================================================
            STICKY ACTION BAR
        ========================================================= */}

        <div className="border-t border-slate-200 bg-white/90 backdrop-blur px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-end gap-2.5">

          <button
            type="button"
            onClick={handleBatal}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <X size={15} />
            Batal
          </button>

          <button
            type="button"
            onClick={handleSimpan}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
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

/*
|--------------------------------------------------------------------------
| BRIEFCASE ICON
|--------------------------------------------------------------------------
|
| Saya buat alias kecil supaya bagian pekerjaan orang tua
| tetap menggunakan icon Briefcase.
|
*/

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

/*
|--------------------------------------------------------------------------
| PAGE
|--------------------------------------------------------------------------
*/

export default function EditSiswaPage() {

  return (
    <Suspense fallback={null}>
      <EditContent />
    </Suspense>
  );

}