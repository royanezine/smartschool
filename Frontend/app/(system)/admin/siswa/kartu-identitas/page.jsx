"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getUsers } from "@/services/user.service";
import { getKelas } from "@/services/kelas.service";
import {
  Search,
  Filter,
  IdCard,
  Eye,
  CreditCard,
  Users,
  GraduationCap,
  CheckCircle2,
  School,
  Plus,
} from "lucide-react";


const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

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

const themePrimarySurface =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimaryBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_9%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_24%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";




const STATUS_OPTIONS = [
  "Semua Status",
  "Aktif",
  "Nonaktif",
];


function getInitials(nama) {
  return nama
    .replace(/,.*/, "")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}


function JenisKelaminBadge({ jenisKelamin }) {
  const isPria = jenisKelamin === "L";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
        isPria
          ? `${themePrimarySurface} text-[var(--color-primary)] border ${themePrimaryBorder}`
          : `${themeInfoSurface} text-[var(--color-info)] border ${themeInfoBorder}`
      }`}
    >
      {isPria ? "Laki-laki" : "Perempuan"}
    </span>
  );
}


function StatusBadge({ status }) {
  const isActive = status === "aktif";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
        isActive
          ? `${themeSuccessSurface} text-[var(--color-success)] border ${themeSuccessBorder}`
          : `${themeNeutralSurface} theme-text-muted border ${themeNeutralBorder}`
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive
            ? "bg-[var(--color-success)]"
            : "bg-[var(--color-text-muted)]"
        }`}
      />

      {isActive ? "Aktif" : "Nonaktif"}
    </span>
  );
}


function Avatar({ nama, size = "md" }) {
  const dims =
    size === "sm"
      ? "w-9 h-9 text-xs"
      : "w-16 h-16 text-lg";

  return (
    <div
      className={`${dims} rounded-full ${themePrimaryGradient} text-[var(--color-card)] flex items-center justify-center font-bold flex-shrink-0 ${themeSmallShadow}`}
    >
      {getInitials(nama)}
    </div>
  );
}


export default function KartuIdentitasSiswaPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  const [search, setSearch] = useState("");
  const [kelasFilter, setKelasFilter] = useState("Semua Kelas");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [siswaList, setSiswaList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);

  const kelasOptions = useMemo(() => [
    "Semua Kelas",
    ...Array.from(new Set(kelasList.map((k) => k.nama).filter(Boolean))).sort(),
  ], [kelasList]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);

        let allUsers = [];
        let pageUser = 1;
        let totalPagesUser = 1;

        do {
          const userRes = await getUsers({ page: pageUser, limit: 100, role: "siswa" });
          const raw = userRes?.data ?? userRes ?? [];
          const users = Array.isArray(raw) ? raw : [];
          allUsers = allUsers.concat(users);

          totalPagesUser = userRes?.pagination?.totalPages || 1;
          pageUser++;
        } while (pageUser <= totalPagesUser);

        let allKelas = [];
        let pageKelas = 1;
        let totalPagesKelas = 1;

        do {
          const kelasRes = await getKelas({ page: pageKelas, limit: 100 });
          const rawK = kelasRes?.data ?? kelasRes ?? [];
          const kelasData = Array.isArray(rawK) ? rawK : [];
          allKelas = allKelas.concat(kelasData);

          totalPagesKelas = kelasRes?.pagination?.totalPages || 1;
          pageKelas++;
        } while (pageKelas <= totalPagesKelas);

        if (isMounted) {
          setKelasList(allKelas);

          const formatted = allUsers.map((u) => {
            const kNama =
              u.kelasSiswa?.[0]?.kelas?.nama ??
              u.kelas?.nama ??
              u.kelasNama ??
              "-";

            return {
              id: u.id,
              nama: u.namaLengkap || u.nama || "Tanpa Nama",
              nisn: u.nisn || "-",
              nik: u.nik || "-",
              kelas: kNama,
              jenisKelamin: u.jenisKelamin || "-",
              tempatLahir: u.tempatLahir || "-",
              tanggalLahir: u.tanggalLahir
                ? new Date(u.tanggalLahir).toLocaleDateString("id-ID")
                : "-",
              agama: u.agama || "-",
              noTelepon: u.noTelepon || "-",
              alamat: u.alamat || u.alamatDomisili || "-",
              status: u.status || "aktif",
              avatar: u.avatar || null,
              sekolahNama: u.sekolah?.nama || "SMARTSCHOOL",
            };
          });

          setSiswaList(formatted);
        }
      } catch (err) {
        console.error("Gagal memuat data siswa/kelas:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);


  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };


  const filteredSiswa = useMemo(() => {
    return siswaList.filter((s) => {
      const searchValue = search.toLowerCase();

      const matchSearch =
        s.nama
          .toLowerCase()
          .includes(searchValue) ||
        s.nisn.includes(searchValue);

      const matchKelas =
        kelasFilter === "Semua Kelas" ||
        s.kelas === kelasFilter;

      const matchStatus =
        statusFilter === "Semua Status" ||
        (statusFilter === "Aktif"
          ? s.status === "aktif"
          : s.status === "nonaktif");

      return (
        matchSearch &&
        matchKelas &&
        matchStatus
      );
    });
  }, [
    siswaList,
    search,
    kelasFilter,
    statusFilter,
  ]);


  const totalSiswa = siswaList.length;

  const totalAktif = siswaList.filter(
    (s) => s.status === "aktif"
  ).length;

  const totalKelas = new Set(
    siswaList.map((s) => s.kelas)
  ).size;


  const handleDetail = (s) => {
    router.push(
      `/admin/siswa/kartu-identitas/${s.id}`
    );
  };


  const handleIdCard = (s) => {
    router.push(
      `/admin/siswa/kartu-identitas/card?id=${s.id}`
    );
  };


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


            <div className="flex items-center justify-between gap-3 flex-wrap">

              <div className="flex items-center gap-3">

                <div
                  className={`p-2.5 rounded-xl ${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`}
                >
                  <IdCard size={20} />
                </div>

                <div>

                  <h1 className="text-2xl font-bold theme-text">
                    Kartu Identitas Siswa
                  </h1>

                  <p className="text-sm theme-text-secondary">
                    Data identitas siswa dan lihat detail profil.
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  router.push(
                    "/admin/siswa/kartu-identitas/tambah"
                  )
                }
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl ${themePrimaryGradient} text-[var(--color-card)] text-sm font-semibold ${themePrimaryShadow} hover:brightness-110 transition-all`}
              >
                <Plus size={16} />
                Tambah Siswa
              </button>

            </div>


            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">


              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
              >

                <div className="flex items-center gap-2">

                  <Users
                    size={14}
                    className="text-[var(--color-primary)]"
                  />

                  <p className="text-[11px] font-medium theme-text-muted tracking-wide">
                    Total Siswa
                  </p>

                </div>

                <p className="text-2xl font-bold theme-text mt-1.5">
                  {totalSiswa}
                </p>

              </div>


              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
              >

                <div className="flex items-center gap-2">

                  <School
                    size={14}
                    className="text-[var(--color-primary)]"
                  />

                  <p className="text-[11px] font-medium theme-text-muted tracking-wide">
                    Jumlah Kelas
                  </p>

                </div>

                <p className="text-2xl font-bold theme-text mt-1.5">
                  {totalKelas}
                </p>

              </div>


              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
              >

                <div className="flex items-center gap-2">

                  <CheckCircle2
                    size={14}
                    className="text-[var(--color-success)]"
                  />

                  <p className="text-[11px] font-medium theme-text-muted tracking-wide">
                    Status Aktif
                  </p>

                </div>

                <p className="text-2xl font-bold theme-text mt-1.5">
                  {totalAktif}
                </p>

              </div>


              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
              >

                <div className="flex items-center gap-2">

                  <GraduationCap
                    size={14}
                    className="text-[var(--color-primary)]"
                  />

                  <p className="text-[11px] font-medium theme-text-muted tracking-wide">
                    Rata-rata / Kelas
                  </p>

                </div>

                <p className="text-2xl font-bold theme-text mt-1.5">
                  {totalKelas
                    ? Math.round(
                        totalSiswa / totalKelas
                      )
                    : 0}
                </p>

              </div>

            </div>


            <div
              className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow} flex flex-col sm:flex-row gap-3`}
            >


              <div className="relative flex-1">

                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Cari nama atau NISN..."
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg theme-input theme-text placeholder:text-[var(--color-text-placeholder)] focus:outline-none ${themeFocus} transition-colors`}
                />

              </div>


              <div className="flex items-center gap-2">

                <Filter
                  size={15}
                  className="text-[var(--color-primary)] hidden sm:block"
                />

                <select
                  value={kelasFilter}
                  onChange={(e) =>
                    setKelasFilter(e.target.value)
                  }
                  className={`text-sm rounded-lg theme-input theme-text px-3 py-2 font-medium focus:outline-none ${themeFocus} transition-colors`}
                >
                  {kelasOptions.map((k) => (
                    <option
                      key={k}
                      value={k}
                    >
                      {k}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className={`text-sm rounded-lg theme-input theme-text px-3 py-2 font-medium focus:outline-none ${themeFocus} transition-colors`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option
                      key={s}
                      value={s}
                    >
                      {s}
                    </option>
                  ))}
                </select>

              </div>

            </div>


            <div
              className={`theme-card rounded-xl border ${themeNeutralBorder} ${themeCardShadow} overflow-hidden`}
            >

              <div className="overflow-x-auto">

                <table className="w-full text-sm border-collapse">


                  <thead>

                    <tr
                      className={`${themePrimaryGradient} text-[var(--color-card)]`}
                    >


                      <th className="text-center font-semibold px-4 py-3 w-[60px]">
                        No
                      </th>


                      <th className="text-left font-semibold px-4 py-3 min-w-[240px]">
                        Profil
                      </th>


                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        NISN
                      </th>


                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Kelas
                      </th>


                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Jenis Kelamin
                      </th>


                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                        Status
                      </th>


                      <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                        Aksi
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredSiswa.map((s, idx) => (

                      <tr
                        key={s.id}
                        className={`border-b ${themeDivider} last:border-0 transition-colors ${
                          idx % 2 === 0
                            ? themeNeutralSurface
                            : "bg-transparent"
                        } hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]`}
                      >


                        <td className="px-4 py-3 text-center">

                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${themePrimarySurface} text-[var(--color-primary)] border ${themePrimaryBorder} text-xs font-bold`}
                          >
                            {idx + 1}
                          </span>

                        </td>


                        <td className="px-4 py-3">

                          <button
                            type="button"
                            onClick={() =>
                              handleDetail(s)
                            }
                            title="Lihat detail siswa"
                            className="flex items-center gap-3 text-left group"
                          >

                            <Avatar
                              nama={s.nama}
                              size="sm"
                            />

                            <div>

                              <p className="font-semibold theme-text group-hover:text-[var(--color-primary)] transition-colors">
                                {s.nama}
                              </p>

                              <p className="text-[11px] theme-text-muted mt-0.5">
                                Siswa • {s.jenjang}
                              </p>

                            </div>

                          </button>

                        </td>


                        <td className="px-4 py-3">

                          <span className="font-mono text-xs font-medium theme-text-secondary">
                            {s.nisn}
                          </span>

                        </td>


                        <td className="px-4 py-3">

                          <span
                            className={`inline-flex items-center justify-center min-w-[48px] px-2.5 py-1 rounded-lg text-xs font-bold text-[var(--color-primary)] ${themePrimarySurface} border ${themePrimaryBorder}`}
                          >
                            {s.kelas}
                          </span>

                        </td>


                        <td className="px-4 py-3">

                          <JenisKelaminBadge
                            jenisKelamin={
                              s.jenisKelamin
                            }
                          />

                        </td>


                        <td className="px-4 py-3 text-center">

                          <StatusBadge
                            status={s.status}
                          />

                        </td>


                        <td className="px-4 py-3">

                          <div className="flex items-center justify-center gap-1.5">


                            <button
                              onClick={() =>
                                handleDetail(s)
                              }
                              title="Lihat detail siswa"
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[var(--color-primary)] ${themePrimarySurface} border ${themePrimaryBorder} hover:bg-[color-mix(in_srgb,var(--color-primary)_15%,transparent)] text-xs font-medium transition-colors`}
                            >

                              <Eye size={13} />

                              Detail

                            </button>


                            <button
                              onClick={() =>
                                handleIdCard(s)
                              }
                              title="Lihat ID Card"
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md ${themePrimaryGradient} text-[var(--color-card)] hover:brightness-110 text-xs font-medium transition-all ${themeSmallShadow}`}
                            >

                              <CreditCard
                                size={13}
                              />

                              ID Card

                            </button>

                          </div>

                        </td>

                      </tr>

                    ))}


                    {filteredSiswa.length === 0 && (

                      <tr>

                        <td
                          colSpan={8}
                          className="px-4 py-12 text-center"
                        >

                          <div className="flex flex-col items-center">

                            <div
                              className={`w-12 h-12 rounded-full ${themePrimarySurface} flex items-center justify-center mb-3`}
                            >

                              <Search
                                size={20}
                                className="text-[var(--color-primary)]"
                              />

                            </div>

                            <p className="text-sm font-semibold theme-text">
                              Data siswa tidak ditemukan
                            </p>

                            <p className="text-xs theme-text-muted mt-1">
                              Coba ubah kata kunci atau filter.
                            </p>

                          </div>

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>


              <div
                className={`px-4 py-3 border-t ${themeDivider} ${themeNeutralSurface} flex items-center justify-between`}
              >

                <p className="text-xs theme-text-secondary">

                  Menampilkan{" "}

                  <span className="font-semibold theme-text">
                    {filteredSiswa.length}
                  </span>{" "}

                  dari{" "}

                  <span className="font-semibold theme-text">
                    {totalSiswa}
                  </span>{" "}

                  siswa

                </p>

                <div className="flex items-center gap-2">

                  <span className="text-[11px] theme-text-muted">
                    Kartu Identitas Siswa
                  </span>

                  <IdCard
                    size={15}
                    className="text-[var(--color-primary)]"
                  />

                </div>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}