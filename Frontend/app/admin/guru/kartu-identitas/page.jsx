"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import {
  Search,
  Filter,
  IdCard,
  Eye,
  CreditCard,
  Users,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Plus,
} from "lucide-react";

/**
 * app/admin/guru/kartu-identitas/page.jsx
 *
 * Halaman Kartu Identitas — daftar guru & staff dengan aksi untuk melihat
 * detail profil masing-masing. Tombol "Tambah Pegawai" membuka halaman
 * tambah terpisah; pegawai baru yang disimpan di sana otomatis muncul di
 * sini setelah kembali.
 *
 * CATATAN ROUTE DETAIL & ID CARD:
 * Detail pegawai TIDAK LAGI modal — sekarang halaman sendiri di
 * app/admin/guru/kartu-identitas/[id]/page.jsx (dynamic segment). Tombol
 * "Detail" di tabel mengarah ke /admin/guru/kartu-identitas/{id}.
 *
 * Preview kartu identitas JUGA TIDAK LAGI modal — sekarang halaman sendiri
 * di app/admin/guru/kartu-identitas/card/page.jsx (route STATIS, bukan
 * dynamic segment). Karena itu id pegawai dikirim lewat QUERY STRING,
 * bukan lewat path — tombol "ID Card" di tabel mengarah ke
 * /admin/guru/kartu-identitas/card?id={id}, dan halaman card membaca id
 * itu pakai useSearchParams().
 *
 * Skema warna memakai biru brand SmartSchool (#155DFC), sama dengan warna
 * teks "School" di logo sidebar, supaya konsisten dengan identitas aplikasi.
 *
 * CATATAN DATA:
 * MOCK_PEGAWAI di bawah masih dummy dan dipakai sebagai initial state. Data
 * pegawai baru dari halaman /tambah dititipkan sebentar lewat localStorage
 * (key "ki_new_pegawai_queue") lalu digabung ke state di sini saat halaman
 * ini dibuka lagi. Kalau nanti nyambung ke API, ganti MOCK_PEGAWAI dengan
 * hasil fetch dan ganti mekanisme "titip lewat localStorage" ini dengan
 * POST ke endpoint tambah pegawai.
 */

const MOCK_PEGAWAI = [
  {
    id: 1,
    nama: "Sarah Amelia, S.Pd",
    nip: "198501152010012001",
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
  },
  {
    id: 2,
    nama: "Budi Santoso, S.E",
    nip: "197803102005011003",
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
  },
  {
    id: 3,
    nama: "Dewi Anggraini, S.Si",
    nip: "199002202015022004",
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
  },
  {
    id: 4,
    nama: "Andi Prasetyo, S.Pd",
    nip: "198712052012011002",
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
  },
  {
    id: 5,
    nama: "Nina Kartika, S.Sn",
    nip: "199105182018022005",
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
  },
  {
    id: 6,
    nama: "Rudi Hartono, S.Pd",
    nip: "198309252008011006",
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
  },
];

const QUEUE_KEY = "ki_new_pegawai_queue";

const TIPE_OPTIONS = ["Semua Tipe", "Guru", "Staff"];
const STATUS_OPTIONS = ["Semua Status", "Aktif", "Nonaktif"];

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
        isGuru ? "bg-[#eaf1ff] text-[#155DFC] border border-[#c7dbff]" : "bg-amber-50 text-amber-600 border border-amber-200"
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

function Avatar({ nama, size = "md" }) {
  const dims = size === "sm" ? "w-9 h-9 text-xs" : "w-16 h-16 text-lg";
  return (
    <div
      className={`${dims} rounded-full bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white flex items-center justify-center font-bold flex-shrink-0`}
    >
      {getInitials(nama)}
    </div>
  );
}

export default function KartuIdentitasPage() {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [tipeFilter, setTipeFilter] = useState("Semua Tipe");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [pegawaiList, setPegawaiList] = useState(MOCK_PEGAWAI);

  // Ambil pegawai baru yang "dititipkan" oleh halaman /tambah lewat localStorage,
  // gabungkan ke daftar, lalu bersihkan titipannya supaya tidak dobel kalau
  // halaman ini dibuka ulang.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(QUEUE_KEY);
      if (raw) {
        const queued = JSON.parse(raw);
        if (Array.isArray(queued) && queued.length > 0) {
          setPegawaiList((prev) => {
            let nextId = prev.length ? Math.max(...prev.map((p) => p.id)) + 1 : 1;
            const withIds = queued.map((q) => ({ ...q, id: nextId++ }));
            return [...prev, ...withIds];
          });
        }
        window.localStorage.removeItem(QUEUE_KEY);
      }
    } catch (err) {
      console.error("Gagal memuat data pegawai baru:", err);
    }
  }, []);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const filteredPegawai = useMemo(() => {
    return pegawaiList.filter((p) => {
      const matchSearch =
        p.nama.toLowerCase().includes(search.toLowerCase()) || p.nip.includes(search);
      const matchTipe = tipeFilter === "Semua Tipe" || p.tipe === tipeFilter;
      const matchStatus =
        statusFilter === "Semua Status" ||
        (statusFilter === "Aktif" ? p.status === "aktif" : p.status === "nonaktif");
      return matchSearch && matchTipe && matchStatus;
    });
  }, [pegawaiList, search, tipeFilter, statusFilter]);

  const totalGuru = pegawaiList.filter((p) => p.tipe === "Guru").length;
  const totalStaff = pegawaiList.filter((p) => p.tipe === "Staff").length;
  const totalAktif = pegawaiList.filter((p) => p.status === "aktif").length;

  // PENTING: route detail itu DYNAMIC SEGMENT ([id]/page.jsx), id dikirim
  // lewat path, bukan modal lagi.
  const handleDetail = (p) => {
    router.push(`/admin/guru/kartu-identitas/${p.id}`);
  };

  // PENTING: halaman card ini route STATIS (kartu-identitas/card/page.jsx),
  // bukan dynamic segment. Id pegawai dikirim lewat QUERY STRING (?id=...),
  // lalu dibaca di halaman card pakai useSearchParams().
  const handleIdCard = (p) => {
    router.push(`/admin/guru/kartu-identitas/card?id=${p.id}`);
  };

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
            {/* HEADER */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white shadow-lg shadow-slate-900/10">
                  <IdCard size={20} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Kartu Identitas</h1>
                  <p className="text-sm text-slate-500">Data identitas guru & staff dan lihat detail profil.</p>
                </div>
              </div>
              <button
                onClick={() => router.push("/admin/guru/kartu-identitas/tambah")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white text-sm font-semibold shadow-lg shadow-[#155DFC]/20 hover:opacity-90 transition-opacity"
              >
                <Plus size={16} />
                Tambah Pegawai
              </button>
            </div>

            {/* STATISTIK RINGKAS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-[#155DFC]" />
                  <p className="text-[11px] font-medium text-slate-500 tracking-wide">Total Pegawai</p>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1.5">{pegawaiList.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <GraduationCap size={14} className="text-[#155DFC]" />
                  <p className="text-[11px] font-medium text-slate-500 tracking-wide">Guru</p>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1.5">{totalGuru}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-amber-500" />
                  <p className="text-[11px] font-medium text-slate-500 tracking-wide">Staff</p>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1.5">{totalStaff}</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <p className="text-[11px] font-medium text-slate-500 tracking-wide">Status Aktif</p>
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-1.5">{totalAktif}</p>
              </div>
            </div>

            {/* FILTER BAR */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau NIP..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 text-slate-800"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={15} className="text-slate-400 hidden sm:block" />
                <select
                  value={tipeFilter}
                  onChange={(e) => setTipeFilter(e.target.value)}
                  className="text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 bg-white text-slate-800 font-medium"
                >
                  {TIPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 bg-white text-slate-800 font-medium"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* TABEL PEGAWAI */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#155DFC] to-[#0d47c9] text-white">
                      <th className="text-left font-semibold px-4 py-3 min-w-[220px]">Nama</th>
                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">NIP</th>
                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Tipe</th>
                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Jabatan</th>
                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">Level</th>
                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">Status</th>
                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPegawai.map((p, idx) => (
                      <tr
                        key={p.id}
                        className={`border-b border-slate-100 last:border-0 transition-colors hover:bg-[#eaf1ff] ${
                          idx % 2 === 0 ? "bg-[#f5f8ff]" : "bg-white"
                        }`}
                      >
                        <td className="px-4 py-2.5">
                          <button
                            type="button"
                            onClick={() => handleDetail(p)}
                            title="Lihat detail pegawai"
                            className="flex items-center gap-3 text-left group"
                          >
                            <Avatar nama={p.nama} size="sm" />
                            <span className="font-semibold text-slate-900 group-hover:text-[#155DFC] group-hover:underline underline-offset-2 transition-colors">
                              {p.nama}
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="font-mono text-xs text-slate-600">{p.nip}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <TipeBadge tipe={p.tipe} />
                        </td>
                        <td className="px-4 py-2.5 text-slate-700">{p.jabatan}</td>
                        <td className="px-4 py-2.5 text-slate-700">{p.level}</td>
                        <td className="px-4 py-2.5 text-center">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleDetail(p)}
                              title="Detail"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[#155DFC] bg-[#eaf1ff] hover:bg-[#d6e6ff] text-xs font-medium transition-colors"
                            >
                              <Eye size={13} />
                              Detail
                            </button>
                            <button
                              onClick={() => handleIdCard(p)}
                              title="ID Card"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-white bg-gradient-to-r from-[#155DFC] to-[#0d47c9] hover:brightness-110 text-xs font-medium transition-all"
                            >
                              <CreditCard size={13} />
                              ID Card
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredPegawai.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                          Tidak ada pegawai yang cocok dengan filter ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}