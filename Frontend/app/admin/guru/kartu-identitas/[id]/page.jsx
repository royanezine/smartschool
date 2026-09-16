"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "../../../../components/Header";
import Sidebar from "../../../../components/Sidebar";
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
  Camera,
  User,
  Cake,
  Venus,
  Mars,
  Heart,
  BookOpen,
  Fingerprint,
} from "lucide-react";

/**
 * app/admin/guru/kartu-identitas/[id]/page.jsx
 *
 * Halaman Detail Pegawai — menggantikan modal "Detail" yang sebelumnya
 * dipakai di halaman list Kartu Identitas. Tombol Detail di list mengarah
 * ke sini, id dikirim lewat path (dynamic segment), dibaca pakai useParams().
 *
 * UPDATE FOTO PROFIL:
 * Sekarang ada foto profil di kartu utama, bukan cuma avatar inisial.
 * Kalau pegawai belum punya foto, tampil placeholder abu-abu bergaya
 * silhouette generik (mirip foto profil default kebanyakan aplikasi).
 * Admin bisa klik ikon kamera di pojok foto untuk upload foto baru — foto
 * disimpan sebagai data URL di localStorage per-id (key
 * "ki_foto_{id}") supaya tetap muncul kalau halaman dibuka ulang. Kalau
 * nanti nyambung ke API, ganti mekanisme localStorage ini dengan upload
 * file ke endpoint/storage sungguhan dan simpan URL-nya di data pegawai.
 *
 * UPDATE DETAIL LEBIH LENGKAP:
 * Ditambahkan field: tempat/tanggal lahir, jenis kelamin, agama, status
 * pernikahan, pendidikan terakhir, dan NIK (selain NIP yang sudah ada).
 * Field tambahan ini juga masih dummy di MOCK_PEGAWAI, menyesuaikan
 * dengan pola data yang sudah ada.
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
    tglMasuk: "15 Jan 2010",
    golongan: "III/c",
    tempatLahir: "Tasikmalaya",
    tglLahir: "15 Jan 1985",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    statusNikah: "Menikah",
    pendidikanTerakhir: "S1 Pendidikan Matematika — Universitas Siliwangi",
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
    tglMasuk: "10 Mar 2005",
    golongan: "III/a",
    tempatLahir: "Ciamis",
    tglLahir: "10 Mar 1978",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    statusNikah: "Menikah",
    pendidikanTerakhir: "S1 Ekonomi — Universitas Galuh",
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
    tglMasuk: "20 Feb 2015",
    golongan: "III/b",
    tempatLahir: "Tasikmalaya",
    tglLahir: "20 Feb 1990",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    statusNikah: "Belum Menikah",
    pendidikanTerakhir: "S1 Biologi — Universitas Siliwangi",
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
    tglMasuk: "05 Des 2012",
    golongan: "III/a",
    tempatLahir: "Garut",
    tglLahir: "05 Des 1987",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    statusNikah: "Menikah",
    pendidikanTerakhir: "S1 Pendidikan Bahasa Indonesia — Universitas Galuh",
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
    tglMasuk: "18 Mei 2018",
    golongan: "III/a",
    tempatLahir: "Bandung",
    tglLahir: "18 Mei 1991",
    jenisKelamin: "Perempuan",
    agama: "Islam",
    statusNikah: "Belum Menikah",
    pendidikanTerakhir: "S1 Seni Rupa — Institut Seni Budaya Indonesia",
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
    tglMasuk: "25 Sep 2008",
    golongan: "II/d",
    tempatLahir: "Tasikmalaya",
    tglLahir: "25 Sep 1983",
    jenisKelamin: "Laki-laki",
    agama: "Islam",
    statusNikah: "Menikah",
    pendidikanTerakhir: "S1 Pendidikan Jasmani — Universitas Galuh",
  },
];

const PHOTO_KEY_PREFIX = "ki_foto_";

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
          ? "bg-[#eaf1ff] text-[#155DFC] border border-[#c7dbff]"
          : "bg-amber-50 text-amber-600 border border-amber-200"
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
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
          : "bg-slate-100 text-slate-500 border border-slate-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}

// Placeholder foto profil generik (silhouette abu-abu) untuk pegawai yang
// belum punya foto — gayanya disamakan dengan placeholder foto profil pada
// umumnya: latar abu-abu muda, siluet kepala & bahu putih di tengah.
function FotoPlaceholder() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#c9ced6" />
      <circle cx="100" cy="80" r="38" fill="#f3f4f6" />
      <path d="M30 200c0-51.7 31.3-93.6 70-93.6s70 41.9 70 93.6H30z" fill="#f3f4f6" />
    </svg>
  );
}

function FotoProfil({ pegawaiId, editable = false }) {
  const [foto, setFoto] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`${PHOTO_KEY_PREFIX}${pegawaiId}`);
      if (saved) setFoto(saved);
    } catch (err) {
      console.error("Gagal memuat foto pegawai:", err);
    } finally {
      setLoaded(true);
    }
  }, [pegawaiId]);

  const handlePilihFoto = () => {
    fileInputRef.current?.click();
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setFoto(dataUrl);
      try {
        window.localStorage.setItem(`${PHOTO_KEY_PREFIX}${pegawaiId}`, dataUrl);
      } catch (err) {
        console.error("Gagal menyimpan foto pegawai:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0">
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-lg shadow-slate-900/10 border-2 border-white ring-1 ring-slate-200">
        {loaded && foto ? (
          <img src={foto} alt="Foto profil" className="w-full h-full object-cover" />
        ) : (
          <FotoPlaceholder />
        )}
      </div>
      {editable && (
        <>
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
        </>
      )}
    </div>
  );
}

export default function DetailPegawaiPage() {
  const router = useRouter();
  const params = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const pegawai = useMemo(() => {
    const id = Number(params?.id);
    return MOCK_PEGAWAI.find((p) => p.id === id);
  }, [params]);

  const handleBack = () => {
    router.push("/admin/guru/kartu-identitas");
  };

  const handleEdit = () => {
    router.push(`/admin/guru/kartu-identitas/edit?id=${pegawai.id}`);
  };

  const handleIdCard = () => {
    router.push(`/admin/guru/kartu-identitas?card=${pegawai.id}`);
  };

  if (!pegawai) {
    return (
      <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
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
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-10 text-center">
                <p className="text-sm text-slate-500 mb-4">Data pegawai tidak ditemukan.</p>
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#155DFC] hover:bg-[#0d47c9] text-white rounded-xl text-sm font-medium transition-all"
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
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
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
            {/* BACK & AKSI */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#155DFC] transition-colors w-fit"
              >
                <ArrowLeft size={16} />
                Kembali ke Kartu Identitas
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors text-sm font-medium"
                >
                  <Pencil size={15} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleIdCard}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-white bg-gradient-to-r from-[#155DFC] to-[#0d47c9] hover:brightness-110 transition-all text-sm font-medium"
                >
                  <CreditCard size={15} />
                  Lihat ID Card
                </button>
              </div>
            </div>

            {/* PROFIL PEGAWAI */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <FotoProfil pegawaiId={pegawai.id} editable />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-900">{pegawai.nama}</h1>
                    <TipeBadge tipe={pegawai.tipe} />
                    <StatusBadge status={pegawai.status} />
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {pegawai.jabatan} • <span className="font-mono">{pegawai.nip}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
                <div className="flex items-start gap-2.5">
                  <Mail size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">Email</p>
                    <p className="text-sm text-slate-700 truncate">{pegawai.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Phone size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">Telepon</p>
                    <p className="text-sm text-slate-700">{pegawai.telp}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">Alamat</p>
                    <p className="text-sm text-slate-700">{pegawai.alamat}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <CalendarDays size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">Tanggal Bergabung</p>
                    <p className="text-sm text-slate-700">{pegawai.tglMasuk}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* DATA DIRI */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
                <User size={16} className="text-[#155DFC]" />
                <h2 className="text-sm font-semibold text-slate-800">Data Diri</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 divide-slate-100">
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4 sm:border-r sm:border-slate-100">
                  <Fingerprint size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">NIK</p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5 font-mono">{pegawai.nik}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4 lg:border-r lg:border-slate-100">
                  <Cake size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">Tempat, Tanggal Lahir</p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">
                      {pegawai.tempatLahir}, {pegawai.tglLahir}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4 sm:border-r sm:border-slate-100 lg:border-r-0">
                  {pegawai.jenisKelamin === "Perempuan" ? (
                    <Venus size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  ) : (
                    <Mars size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">Jenis Kelamin</p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">{pegawai.jenisKelamin}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4 lg:border-r lg:border-slate-100 border-t sm:border-t border-slate-100">
                  <BookOpen size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">Agama</p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">{pegawai.agama}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4 sm:border-r sm:border-slate-100 border-t border-slate-100">
                  <Heart size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">Status Pernikahan</p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">{pegawai.statusNikah}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4 border-t border-slate-100">
                  <GraduationCap size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">Pendidikan Terakhir</p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">{pegawai.pendidikanTerakhir}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* INFO KEPEGAWAIAN */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
                <BadgeCheck size={16} className="text-[#155DFC]" />
                <h2 className="text-sm font-semibold text-slate-800">Informasi Kepegawaian</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4">
                  <Building2 size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">Unit / Bidang</p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">{pegawai.unit}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4">
                  <BadgeCheck size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">Golongan</p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">{pegawai.golongan}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 px-5 sm:px-6 py-4">
                  <GraduationCap size={15} className="text-slate-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-400">Level</p>
                    <p className="text-sm font-medium text-slate-800 mt-0.5">{pegawai.level}</p>
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