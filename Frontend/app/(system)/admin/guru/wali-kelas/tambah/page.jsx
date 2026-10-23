"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  ArrowLeft,
  UserCheck,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Hash,
  Phone,
  Mail,
  Users,
  School,
  Info,
} from "lucide-react";
import {
  assignWaliKelas,
  getWaliKelasList,
} from "@/services/kelas.service";
import {
  getGuruWaliKelasDetail,
  getGuruWaliKelasList,
} from "@/services/user.service";


function getInitials(nama) {
  if (!nama) return "WK";

  return nama
    .replace(/,.*/, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function getGuruLabel(guru) {
  const nip = guru.nip ? ` - ${guru.nip}` : "";
  const nonaktif =
    guru.status === "nonaktif" ? " (nonaktif)" : "";

  return `${guru.nama}${nip}${nonaktif}`;
}

export default function TambahWaliKelasPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const [kelasOptions, setKelasOptions] = useState([]);
  const [guruOptions, setGuruOptions] = useState([]);
  const [kelasId, setKelasId] = useState("");
  const [guruId, setGuruId] = useState("");
  const [guruDetail, setGuruDetail] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      setLoading(true);
      setError("");

      try {
        const [kelasList, guruList] = await Promise.all([
          getWaliKelasList(),
          getGuruWaliKelasList(),
        ]);

        if (!active) return;

        setKelasOptions(
          kelasList.filter((item) => !item.waliKelasId)
        );
        setGuruOptions(guruList);
      } catch (err) {
        if (!active) return;

        console.error(
          "[TambahWaliKelas] Gagal memuat pilihan:",
          err
        );
        setError(
          err?.message ||
            "Gagal memuat daftar kelas dan guru."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!guruId) {
      return undefined;
    }

    getGuruWaliKelasDetail(guruId)
      .then((detail) => {
        if (active) setGuruDetail(detail);
      })
      .catch((err) => {
        console.warn(
          "[TambahWaliKelas] Gagal memuat detail guru:",
          err
        );
        if (active) setGuruDetail(null);
      });

    return () => {
      active = false;
    };
  }, [guruId]);

  const selectedKelas = useMemo(
    () =>
      kelasOptions.find(
        (item) => item.id === kelasId
      ) || null,
    [kelasOptions, kelasId]
  );

  const selectedGuru = useMemo(
    () =>
      guruOptions.find((item) => item.id === guruId) ||
      null,
    [guruOptions, guruId]
  );

  const kontakGuru = guruDetail || selectedGuru;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!kelasId) {
      setError("Pilih kelas yang akan diberi wali kelas.");
      return;
    }

    if (!guruId) {
      setError("Pilih guru yang akan menjadi wali kelas.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await assignWaliKelas(kelasId, guruId);

      setSuccess(true);

      setTimeout(() => {
        router.push("/admin/guru/wali-kelas");
      }, 900);
    } catch (err) {
      console.error(
        "[TambahWaliKelas] Gagal menyimpan:",
        err
      );
      setError(
        err?.message ||
          "Gagal menambahkan wali kelas."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar
        active="guruWaliKelas"
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push("/admin/guru/wali-kelas")
                }
                className="
                  p-2.5 rounded-xl
                  theme-card theme-border theme-text-muted
                  theme-header-hover
                  transition-colors shrink-0
                "
                title="Kembali ke daftar wali kelas"
              >
                <ArrowLeft size={20} />
              </button>

              <div
                className="
                  p-2.5 rounded-xl
                  bg-[image:var(--color-brand-logo-bg)]
                  text-white
                  shadow-lg
                  shrink-0
                "
              >
                <UserCheck size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Tambah Wali Kelas
                </h1>

                <p className="text-sm theme-text-muted">
                  Tugaskan seorang guru sebagai wali kelas untuk kelas
                  yang belum memiliki wali.
                </p>
              </div>
            </div>

            {success && (
              <div className="flex items-center gap-3 p-4 rounded-xl theme-success">
                <CheckCircle2
                  size={20}
                  className="shrink-0"
                />

                <p className="text-sm font-medium">
                  Wali kelas berhasil ditambahkan. Mengalihkan...
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl theme-danger">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    Gagal menambahkan wali kelas
                  </p>

                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <form
                onSubmit={handleSubmit}
                className="
                  lg:col-span-2
                  theme-card
                  rounded-xl
                  border
                  shadow-sm
                  overflow-hidden
                "
              >
                <div
                  className="
                    px-6 py-4
                    border-b
                    theme-border-soft
                    theme-card-soft
                  "
                >
                  <h2 className="text-sm font-semibold theme-text-secondary">
                    Kelas & Wali Kelas
                  </h2>

                  <p className="text-xs theme-text-muted mt-0.5">
                    Pilih kelas tanpa wali dan guru yang akan
                    ditugaskan.
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  {loading ? (
                    <div className="flex items-center gap-2 text-sm theme-text-muted py-4">
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Memuat daftar kelas dan guru...
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label
                            htmlFor="kelas"
                            className="
                              flex items-center gap-1.5
                              text-sm font-medium
                              theme-text-secondary
                              mb-1.5
                            "
                          >
                            <School
                              size={14}
                              className="theme-text-muted"
                            />

                            Kelas

                            <span className="text-[var(--color-danger)]">
                              *
                            </span>
                          </label>

                          <select
                            id="kelas"
                            value={kelasId}
                            onChange={(e) => {
                              setKelasId(e.target.value);
                              setError("");
                            }}
                            disabled={saving}
                            className="
                              w-full px-3.5 py-2.5 text-sm rounded-lg
                              theme-input
                              focus:outline-none
                              focus:ring-2
                              focus:ring-[var(--color-primary)]
                              focus:ring-opacity-25
                              focus:border-[var(--color-primary)]
                              disabled:opacity-60
                            "
                          >
                            <option value="">
                              Pilih kelas
                            </option>

                            {kelasOptions.map((item) => (
                              <option
                                key={item.id}
                                value={item.id}
                              >
                                {item.kelas} -{" "}
                                {item.tahunAjaran}
                              </option>
                            ))}
                          </select>

                          {kelasOptions.length === 0 && (
                            <p className="text-xs theme-text-muted mt-1.5">
                              Semua kelas sudah memiliki wali kelas.
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="guru"
                            className="
                              flex items-center gap-1.5
                              text-sm font-medium
                              theme-text-secondary
                              mb-1.5
                            "
                          >
                            <User
                              size={14}
                              className="theme-text-muted"
                            />

                            Wali Kelas

                            <span className="text-[var(--color-danger)]">
                              *
                            </span>
                          </label>

                          <select
                            id="guru"
                            value={guruId}
                            onChange={(e) => {
                              setGuruId(e.target.value);
                              setGuruDetail(null);
                              setError("");
                            }}
                            disabled={saving}
                            className="
                              w-full px-3.5 py-2.5 text-sm rounded-lg
                              theme-input
                              focus:outline-none
                              focus:ring-2
                              focus:ring-[var(--color-primary)]
                              focus:ring-opacity-25
                              focus:border-[var(--color-primary)]
                              disabled:opacity-60
                            "
                          >
                            <option value="">
                              Pilih guru
                            </option>

                            {guruOptions.map((guru) => (
                              <option
                                key={guru.id}
                                value={guru.id}
                              >
                                {getGuruLabel(guru)}
                              </option>
                            ))}
                          </select>

                          {guruOptions.length === 0 && (
                            <p className="text-xs theme-text-muted mt-1.5">
                              Belum ada guru yang terdaftar.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border theme-border-soft theme-card-soft p-4">
                        <p className="text-xs font-semibold theme-text-muted uppercase tracking-wide mb-3">
                          Data Kelas
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-[11px] theme-text-muted">
                              Kelas
                            </p>

                            <p className="font-semibold theme-text mt-0.5">
                              {selectedKelas?.kelas || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] theme-text-muted">
                              Jenjang
                            </p>

                            <p className="theme-text-secondary mt-0.5">
                              {selectedKelas
                                ? `Kelas ${selectedKelas.jenjang}`
                                : "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] theme-text-muted">
                              Tahun Ajaran
                            </p>

                            <p className="theme-text-secondary mt-0.5">
                              {selectedKelas?.tahunAjaran || "-"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] theme-text-muted">
                              Jumlah Siswa
                            </p>

                            <p className="theme-text-secondary mt-0.5">
                              {selectedKelas
                                ? `${selectedKelas.jumlahSiswa} siswa`
                                : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div
                  className="
                    px-6 py-4
                    border-t border-b
                    theme-border-soft
                    theme-card-soft
                  "
                >
                  <h2 className="text-sm font-semibold theme-text-secondary">
                    Kontak Guru
                  </h2>

                  <p className="text-xs theme-text-muted mt-0.5">
                    Data kontak berasal dari akun guru yang dipilih.
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-medium theme-text-muted uppercase tracking-wide">
                        <Hash size={12} />
                        NIP
                      </p>

                      <p className="font-mono text-sm theme-text mt-1">
                        {kontakGuru?.nip || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-medium theme-text-muted uppercase tracking-wide">
                        <Mail size={12} />
                        Email
                      </p>

                      <p className="text-sm theme-text mt-1 break-all">
                        {kontakGuru?.email || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="flex items-center gap-1.5 text-[11px] font-medium theme-text-muted uppercase tracking-wide">
                        <Phone size={12} />
                        No. Telepon
                      </p>

                      <p className="text-sm theme-text mt-1">
                        {kontakGuru?.telp || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="
                    flex items-center gap-3
                    px-6 py-4
                    border-t
                    theme-border-soft
                    theme-card-soft
                  "
                >
                  <button
                    type="submit"
                    disabled={
                      saving ||
                      loading ||
                      kelasOptions.length === 0
                    }
                    className="
                      flex items-center gap-2
                      px-5 py-2.5
                      theme-primary
                      rounded-xl
                      transition-all
                      shadow-sm
                      font-medium
                      text-sm
                      disabled:opacity-60
                      disabled:cursor-not-allowed
                    "
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Simpan Wali Kelas
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/admin/guru/wali-kelas")
                    }
                    disabled={saving}
                    className="
                      px-5 py-2.5
                      rounded-xl
                      border
                      theme-border
                      theme-text-secondary
                      theme-header-hover
                      transition-all
                      font-medium
                      text-sm
                      disabled:opacity-60
                    "
                  >
                    Batal
                  </button>
                </div>
              </form>

              <div className="space-y-6">
                <div
                  className="
                    theme-card
                    rounded-xl
                    border
                    shadow-sm
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      px-5 py-4
                      border-b
                      theme-border-soft
                      theme-card-soft
                    "
                  >
                    <h2 className="text-sm font-semibold theme-text-secondary">
                      Pratinjau
                    </h2>

                    <p className="text-xs theme-text-muted mt-0.5">
                      Tampilan data ini di daftar wali kelas.
                    </p>
                  </div>

                  <div
                    className="
                      bg-[image:var(--color-brand-logo-bg)]
                      px-5 py-5
                      flex items-center gap-3
                    "
                  >
                    <div
                      className="
                        w-12 h-12 rounded-full
                        flex items-center justify-center
                        font-bold text-sm shrink-0
                        bg-[color:color-mix(in_srgb,var(--color-card)_20%,transparent)]
                        text-[var(--color-card)]
                      "
                    >
                      {getInitials(selectedGuru?.nama)}
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          text-xs
                          text-[color:color-mix(in_srgb,var(--color-card)_80%,transparent)]
                        "
                      >
                        Wali Kelas{" "}
                        {selectedKelas?.kelas || "-"}
                      </p>

                      <p className="font-bold text-[var(--color-card)] text-sm leading-tight truncate">
                        {selectedGuru?.nama ||
                          "Nama wali kelas"}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">
                        NIP
                      </span>

                      <span className="font-mono text-xs theme-text-secondary">
                        {kontakGuru?.nip || "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">
                        Jenjang
                      </span>

                      <span className="theme-text-secondary font-medium">
                        {selectedKelas
                          ? `Kelas ${selectedKelas.jenjang}`
                          : "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">
                        Jumlah Siswa
                      </span>

                      <span className="theme-text-secondary font-medium inline-flex items-center gap-1.5">
                        <Users size={12} />
                        {selectedKelas
                          ? `${selectedKelas.jumlahSiswa} siswa`
                          : "0 siswa"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="theme-text-muted text-xs">
                        Tahun Ajaran
                      </span>

                      <span className="theme-text-secondary font-medium">
                        {selectedKelas?.tahunAjaran || "-"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="theme-info rounded-xl border p-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <Info
                      size={16}
                      className="shrink-0"
                    />

                    <h2 className="text-sm font-semibold">
                      Informasi
                    </h2>
                  </div>

                  <ul
                    className="
                      space-y-2
                      text-xs
                      theme-text-secondary
                      list-disc
                      list-inside
                    "
                  >
                    <li>
                      Hanya kelas yang belum memiliki wali yang
                      ditampilkan di sini.
                    </li>

                    <li>
                      Satu kelas hanya dapat memiliki satu wali
                      kelas.
                    </li>

                    <li>
                      Wali kelas dapat diganti atau dilepas dari
                      halaman detail kelas.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
