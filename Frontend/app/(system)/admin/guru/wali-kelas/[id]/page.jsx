"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  ArrowLeft,
  UserCheck,
  Pencil,
  Unlink,
  Phone,
  Mail,
  ClipboardList,
  School,
  Hash,
  Users,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  getWaliKelasDetail,
  releaseWaliKelas,
} from "@/services/kelas.service";


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

function StatusBadge({ status }) {
  const isAssigned = status === "ditugaskan";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
        isAssigned
          ? "theme-success theme-border"
          : "theme-card-soft theme-text-muted theme-border"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isAssigned
            ? "bg-[var(--color-success)]"
            : "bg-[var(--color-text-muted)]"
        }`}
      />

      {isAssigned ? "Ditugaskan" : "Belum Ditugaskan"}
    </span>
  );
}

export default function DetailWaliKelasPage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params?.id;
  const id = Array.isArray(rawId)
    ? String(rawId[0] ?? "")
    : String(rawId ?? "");

  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmRelease, setConfirmRelease] = useState(false);
  const [releasing, setReleasing] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) {
      throw new Error(
        "ID kelas tidak ditemukan pada URL."
      );
    }

    return getWaliKelasDetail(id);
  }, [id]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const detail = await fetchDetail();
      setData(detail);
    } catch (err) {
      console.error(
        "[DetailWaliKelas] Gagal mengambil detail:",
        err
      );
      setData(null);
      setError(
        err?.message ||
          "Data wali kelas tidak ditemukan."
      );
    } finally {
      setLoading(false);
    }
  }, [fetchDetail]);

  useEffect(() => {
    let active = true;

    fetchDetail()
      .then((detail) => {
        if (!active) return;
        setData(detail);
        setError("");
      })
      .catch((err) => {
        if (!active) return;

        console.error(
          "[DetailWaliKelas] Gagal mengambil detail:",
          err
        );
        setData(null);
        setError(
          err?.message ||
            "Data wali kelas tidak ditemukan."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchDetail]);

  async function handleRelease() {
    if (!data) return;

    setReleasing(true);
    setError("");
    setNotice("");

    try {
      await releaseWaliKelas(data.id);
      setConfirmRelease(false);
      setNotice("Wali kelas berhasil dilepas dari kelas.");
      await loadData();
    } catch (err) {
      console.error(
        "[DetailWaliKelas] Gagal melepas wali kelas:",
        err
      );
      setError(
        err?.message || "Gagal melepas wali kelas."
      );
      setConfirmRelease(false);
    } finally {
      setReleasing(false);
    }
  }

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
                  p-2.5
                  rounded-xl
                  border theme-border
                  theme-card
                  theme-text-muted
                  hover:bg-[var(--color-input-hover)]
                  hover:text-[var(--color-primary)]
                  transition-colors
                  shrink-0
                "
                title="Kembali ke daftar wali kelas"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="p-2.5 rounded-xl theme-primary shrink-0">
                <UserCheck size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">
                  Detail Wali Kelas
                </h1>

                <p className="text-sm theme-text-muted">
                  Informasi lengkap penugasan wali kelas
                  {data ? ` untuk kelas ${data.kelas}` : ""}.
                </p>
              </div>
            </div>

            {notice && (
              <div className="flex items-start gap-3 p-4 rounded-xl border theme-border theme-success">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <p className="text-sm font-medium">
                  {notice}
                </p>
              </div>
            )}

            {loading && (
              <div className="theme-card rounded-xl border theme-border p-10">
                <div className="flex items-center justify-center gap-2 text-sm theme-text-muted">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Memuat detail wali kelas...
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="flex items-start gap-3 p-4 rounded-xl border theme-border theme-danger">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    Data wali kelas tidak dapat ditampilkan
                  </p>

                  <p className="text-sm mt-1">{error}</p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/admin/guru/wali-kelas")
                  }
                  className="
                    text-sm
                    font-medium
                    text-[var(--color-danger)]
                    hover:opacity-70
                  "
                >
                  Kembali ke daftar
                </button>
              </div>
            )}

            {!loading && !error && data && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 theme-card rounded-xl border theme-border shadow-sm overflow-hidden">
                  <div className="bg-[image:var(--color-brand-logo-bg)] px-6 py-6 flex items-center gap-4">
                    <div
                      className="
                        w-16 h-16
                        rounded-full
                        flex items-center justify-center
                        font-bold
                        text-lg
                        shrink-0
                        bg-[color:color-mix(in_srgb,var(--color-card)_20%,transparent)]
                        text-[var(--color-card)]
                      "
                    >
                      {getInitials(data.waliKelas)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[color-mix(in_srgb,var(--color-card)_80%,transparent)] text-xs">
                        Wali Kelas {data.kelas}
                      </p>

                      <p className="font-bold text-[var(--color-card)] text-xl leading-tight truncate">
                        {data.waliKelas || "Belum ditugaskan"}
                      </p>

                      <div className="mt-1.5">
                        <StatusBadge status={data.status} />
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      <div>
                        <p className="flex items-center gap-1.5 text-[11px] font-medium theme-text-muted uppercase tracking-wide">
                          <Hash size={12} />
                          NIP
                        </p>

                        <p className="font-mono text-sm theme-text mt-1">
                          {data.nip || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="flex items-center gap-1.5 text-[11px] font-medium theme-text-muted uppercase tracking-wide">
                          <School size={12} />
                          Jenjang
                        </p>

                        <p className="text-sm theme-text mt-1">
                          Kelas {data.jenjang}
                        </p>
                      </div>

                      <div>
                        <p className="flex items-center gap-1.5 text-[11px] font-medium theme-text-muted uppercase tracking-wide">
                          <School size={12} />
                          Tahun Ajaran
                        </p>

                        <p className="text-sm theme-text mt-1">
                          {data.tahunAjaran}
                          {data.semester
                            ? ` (${data.semester})`
                            : ""}
                        </p>
                      </div>
                    </div>

                    <div className="border-t theme-border-soft pt-5 space-y-2.5">
                      <p className="text-xs font-semibold theme-text-muted uppercase tracking-wide mb-2">
                        Kontak Wali Kelas
                      </p>

                      {data.waliKelasId ? (
                        <>
                          <div className="flex items-center gap-2.5 text-sm theme-text-secondary">
                            <Phone
                              size={14}
                              className="text-[var(--color-primary)] flex-shrink-0"
                            />

                            {data.telp || "-"}
                          </div>

                          <div className="flex items-center gap-2.5 text-sm theme-text-secondary">
                            <Mail
                              size={14}
                              className="text-[var(--color-primary)] flex-shrink-0"
                            />

                            {data.email || "-"}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm theme-text-muted">
                          Kelas ini belum memiliki wali kelas.
                        </p>
                      )}
                    </div>

                    <div className="border-t theme-border-soft pt-5">
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-sm font-semibold theme-text-secondary flex items-center gap-1.5">
                          <ClipboardList
                            size={14}
                            className="text-[var(--color-primary)]"
                          />

                          Siswa Binaan
                        </p>

                        <span className="text-xs font-medium theme-text-muted inline-flex items-center gap-1.5">
                          <Users size={12} />
                          {data.jumlahSiswa} siswa
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {data.siswa.map((siswa, index) => (
                          <div
                            key={
                              siswa.id ||
                              `${siswa.nama}-${index}`
                            }
                            className="
                              flex items-center gap-2.5
                              px-3 py-2
                              rounded-lg
                              theme-card-soft
                              border theme-border-soft
                              text-sm theme-text-secondary
                            "
                          >
                            <span
                              className="
                                w-5 h-5
                                rounded-full
                                theme-card
                                border theme-border
                                flex items-center justify-center
                                text-[10px]
                                font-semibold
                                theme-text-muted
                                flex-shrink-0
                              "
                            >
                              {index + 1}
                            </span>

                            <span className="flex-1 truncate">
                              {siswa.nama}
                            </span>

                            <span className="text-[11px] theme-text-muted font-mono shrink-0">
                              {siswa.nisn || siswa.nis || "-"}
                            </span>
                          </div>
                        ))}

                        {data.siswa.length === 0 && (
                          <p className="text-xs theme-text-muted text-center py-2">
                            Belum ada data siswa pada kelas ini.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-t theme-border-soft theme-card-soft">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/admin/guru/wali-kelas/${data.id}/edit`
                        )
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
                      "
                    >
                      <Pencil size={16} />
                      {data.waliKelasId
                        ? "Ganti Wali Kelas"
                        : "Tugaskan Wali Kelas"}
                    </button>

                    {data.waliKelasId && (
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmRelease(true)
                        }
                        className="
                          inline-flex items-center gap-2
                          px-5 py-2.5
                          rounded-xl
                          text-sm
                          font-semibold
                          theme-danger
                          border theme-border
                          hover:opacity-80
                          transition-colors
                        "
                      >
                        <Unlink size={16} />
                        Lepas Wali Kelas
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="theme-card rounded-xl border theme-border shadow-sm p-5">
                    <p className="text-xs font-semibold theme-text-muted uppercase tracking-wide mb-3">
                      Ringkasan
                    </p>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="theme-text-muted text-xs">
                          Kelas
                        </span>

                        <span className="font-semibold theme-text">
                          {data.kelas}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="theme-text-muted text-xs">
                          Jumlah Siswa
                        </span>

                        <span className="font-semibold theme-text">
                          {data.jumlahSiswa} siswa
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="theme-text-muted text-xs">
                          Kapasitas
                        </span>

                        <span className="font-semibold theme-text">
                          {data.kapasitas || "-"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="theme-text-muted text-xs">
                          Tahun Ajaran
                        </span>

                        <span className="font-semibold theme-text">
                          {data.tahunAjaran}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="theme-text-muted text-xs">
                          Status
                        </span>

                        <StatusBadge status={data.status} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {confirmRelease && data && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="theme-card rounded-2xl shadow-xl max-w-sm w-full p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full theme-danger flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={18} />
              </div>

              <p className="font-bold theme-text">
                Lepas Wali Kelas?
              </p>
            </div>

            <p className="text-sm theme-text-muted mb-5">
              Wali kelas{" "}
              <span className="font-semibold theme-text-secondary">
                {data.waliKelas}
              </span>{" "}
              akan dilepas dari kelas{" "}
              <span className="font-semibold theme-text-secondary">
                {data.kelas}
              </span>
              . Data kelas dan akun guru tidak dihapus.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmRelease(false)}
                disabled={releasing}
                className="
                  flex-1
                  px-4 py-2.5
                  rounded-lg
                  text-sm
                  font-semibold
                  theme-card-soft
                  theme-text-secondary
                  border theme-border
                  hover:bg-[var(--color-input-hover)]
                  transition-colors
                  disabled:opacity-60
                "
              >
                Batal
              </button>

              <button
                onClick={handleRelease}
                disabled={releasing}
                className="
                  flex-1
                  px-4 py-2.5
                  rounded-lg
                  text-sm
                  font-semibold
                  theme-danger
                  border theme-border
                  hover:opacity-80
                  transition-colors
                  disabled:opacity-60
                "
              >
                {releasing ? "Melepas..." : "Ya, Lepas"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
