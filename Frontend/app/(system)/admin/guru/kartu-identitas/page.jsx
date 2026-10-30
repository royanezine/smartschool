"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getUsers } from "@/services/user.service";
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
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        rounded-full
        text-[11px]
        font-semibold
        ${
          isGuru
            ? "theme-info border"
            : "theme-warning border"
        }
      `}
    >
      {isGuru ? (
        <GraduationCap size={11} />
      ) : (
        <Briefcase size={11} />
      )}
      {tipe}
    </span>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "aktif";

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1
        rounded-full
        text-[11px]
        font-semibold
        ${
          isActive
            ? "theme-success border"
            : "theme-card-soft theme-text-muted theme-border border"
        }
      `}
    >
      <span
        className={`
          w-1.5 h-1.5 rounded-full
          ${
            isActive
              ? "bg-[var(--color-success)]"
              : "bg-[var(--color-text-muted)]"
          }
        `}
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
      className={`
        ${dims}
        rounded-full
        theme-primary
        flex items-center justify-center
        font-bold
        flex-shrink-0
      `}
    >
      {getInitials(nama)}
    </div>
  );
}

function KartuIdentitasPageContent() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua Status");
  const [pegawaiList, setPegawaiList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        let allUsers = [];
        let page = 1;
        let totalPages = 1;

        do {
          const res = await getUsers({ page, limit: 100, role: "guru" });
          const raw = res?.data ?? res ?? [];
          const users = Array.isArray(raw) ? raw : [];
          allUsers = allUsers.concat(users);

          totalPages = res?.pagination?.totalPages || 1;
          page++;
        } while (page <= totalPages);

        if (isMounted) {
          const formatted = allUsers.map((u) => {
            const mapelNama =
              u.mataPelajaran?.nama ??
              u.guruMapel?.[0]?.mataPelajaran?.nama ??
              u.mapel ??
              "-";

            return {
              id: u.id,
              nama: u.namaLengkap || u.nama || "Tanpa Nama",
              nip: u.nip || "-",
              nuptk: u.nuptk || "-",
              tipe: "Guru",
              jabatan: u.jabatan || "Tenaga Pendidik",
              status: u.status || "aktif",
              email: u.email || "-",
              telp: u.noTelepon || "-",
              alamat: u.alamat || u.alamatDomisili || "-",
              avatar: u.avatar || null,
              sekolahNama: u.sekolah?.nama || "SMARTSCHOOL",
            };
          });

          setPegawaiList(formatted);
        }
      } catch (err) {
        console.error("Gagal mengambil data guru dari API:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const filteredPegawai = useMemo(() => {
    return pegawaiList.filter((p) => {
      const matchSearch =
        p.nama
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        p.nip.includes(search);

      const matchStatus =
        statusFilter === "Semua Status" ||
        (statusFilter === "Aktif"
          ? p.status === "aktif"
          : p.status === "nonaktif");

      return matchSearch && matchStatus;
    });
  }, [pegawaiList, search, statusFilter]);

  const totalGuru = pegawaiList.length;

  const totalAktif = pegawaiList.filter(
    (p) => p.status === "aktif"
  ).length;

  const handleDetail = (p) => {
    router.push(`/admin/guru/kartu-identitas/${p.id}`);
  };

  const handleIdCard = (p) => {
    router.push(`/admin/guru/kartu-identitas/card?id=${p.id}`);
  };

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
                <div className="p-2.5 rounded-xl theme-primary shadow-lg">
                  <IdCard size={20} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold theme-text">
                    Kartu Identitas
                  </h1>

                  <p className="text-sm theme-text-muted">
                    Data identitas guru dan cetak pratinjau kartu.
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  router.push(
                    "/admin/guru/kartu-identitas/tambah"
                  )
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  theme-primary
                  text-sm
                  font-semibold
                  shadow-lg
                  hover:opacity-90
                  transition-opacity
                "
              >
                <Plus size={16} />
                Tambah Pegawai
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="theme-card rounded-xl border theme-border p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <GraduationCap
                    size={14}
                    className="text-[var(--color-primary)]"
                  />

                  <p className="text-[11px] font-medium theme-text-muted tracking-wide">
                    Total Guru
                  </p>
                </div>

                <p className="text-2xl font-bold theme-text mt-1.5">
                  {totalGuru}
                </p>
              </div>

              <div className="theme-card rounded-xl border theme-border p-4 shadow-sm">
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
            </div>

            <div
              className="
                theme-card
                rounded-xl
                border theme-border
                p-4
                shadow-sm
                flex
                flex-col
                sm:flex-row
                gap-3
              "
            >
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    theme-text-placeholder
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau NIP..."
                  className="
                    theme-input
                    w-full
                    pl-9
                    pr-3
                    py-2
                    text-sm
                    rounded-lg
                    border
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[var(--color-primary)]/20
                    focus:border-[var(--color-primary)]
                    transition-colors
                  "
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter
                  size={16}
                  className="
                    theme-text-placeholder
                    hidden
                    sm:block
                  "
                />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="
                    theme-input
                    text-sm
                    rounded-lg
                    border
                    px-3
                    py-2
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[var(--color-primary)]/20
                    focus:border-[var(--color-primary)]
                    font-medium
                  "
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="
                theme-card
                rounded-xl
                border theme-border
                shadow-sm
                overflow-hidden
              "
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm border-collapse">
                  <thead>
                    <tr className="theme-table-header">
                      <th className="text-left font-semibold px-4 py-3 min-w-[220px]">
                        Nama
                      </th>

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        NIP
                      </th>

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Tipe
                      </th>

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Jabatan
                      </th>

                      <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                        Level
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
                    {filteredPegawai.map((p, idx) => (
                      <tr
                        key={p.id}
                        className="
                          border-b theme-border-soft
                          last:border-0
                          transition-colors
                          theme-table-hover
                        "
                      >
                        <td className="px-4 py-2.5">
                          <button
                            type="button"
                            onClick={() => handleDetail(p)}
                            title="Lihat detail pegawai"
                            className="
                              flex
                              items-center
                              gap-3
                              text-left
                              group
                            "
                          >
                            <Avatar
                              nama={p.nama}
                              size="sm"
                            />

                            <span
                              className="
                                font-semibold
                                theme-text
                                group-hover:text-[var(--color-primary)]
                                group-hover:underline
                                underline-offset-2
                                transition-colors
                              "
                            >
                              {p.nama}
                            </span>
                          </button>
                        </td>

                        <td className="px-4 py-2.5">
                          <span className="font-mono text-xs theme-text-secondary">
                            {p.nip}
                          </span>
                        </td>

                        <td className="px-4 py-2.5">
                          <TipeBadge tipe={p.tipe} />
                        </td>

                        <td className="px-4 py-2.5 theme-text-secondary">
                          {p.jabatan}
                        </td>

                        <td className="px-4 py-2.5 theme-text-secondary">
                          {p.level}
                        </td>

                        <td className="px-4 py-2.5 text-center">
                          <StatusBadge status={p.status} />
                        </td>

                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleDetail(p)}
                              title="Detail"
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                px-2.5
                                py-1.5
                                rounded-md
                                theme-info
                                text-xs
                                font-medium
                                transition-colors
                                hover:opacity-90
                              "
                            >
                              <Eye size={13} />
                              Detail
                            </button>

                            <button
                              onClick={() => handleIdCard(p)}
                              title="ID Card"
                              className="
                                inline-flex
                                items-center
                                gap-1.5
                                px-2.5
                                py-1.5
                                rounded-md
                                theme-primary
                                text-xs
                                font-medium
                                transition-all
                                hover:opacity-90
                              "
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
                        <td
                          colSpan={7}
                          className="
                            px-4
                            py-10
                            text-center
                            text-sm
                            theme-text-muted
                          "
                        >
                          Tidak ada pegawai yang cocok
                          dengan filter ini.
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

export default function KartuIdentitasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen theme-page" />
      }
    >
      <KartuIdentitasPageContent />
    </Suspense>
  );
}