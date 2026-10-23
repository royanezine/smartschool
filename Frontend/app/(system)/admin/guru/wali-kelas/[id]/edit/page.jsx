"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Unlink,
  AlertTriangle,
} from "lucide-react";
import {
  assignWaliKelas,
  getWaliKelasDetail,
  releaseWaliKelas,
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

export default function EditWaliKelasPage() {
  const router = useRouter();
  const params = useParams();

  const rawId = params?.id;
  const id = Array.isArray(rawId)
    ? String(rawId[0] ?? "")
    : String(rawId ?? "");

  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const [data, setData] = useState(null);
  const [guruOptions, setGuruOptions] = useState([]);
  const [guruId, setGuruId] = useState("");
  const [guruDetail, setGuruDetail] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [confirmRelease, setConfirmRelease] = useState(false);
  const [releasing, setReleasing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!id) {
      throw new Error(
        "ID kelas tidak ditemukan pada URL."
      );
    }

    const [detail, guruList] = await Promise.all([
      getWaliKelasDetail(id),
      getGuruWaliKelasList(),
    ]);

    return { detail, guruList };
  }, [id]);

  useEffect(() => {
    let active = true;

    fetchData()
      .then(({ detail, guruList }) => {
        if (!active) return;

        setData(detail);
        setGuruOptions(guruList);
        setGuruId(detail.waliKelasId || "");
        setError("");
      })
      .catch((err) => {
        if (!active) return;

        console.error(
          "[EditWaliKelas] Gagal memuat data:",
          err
        );
        setData(null);
        setError(
          err?.message ||
            "Data wali kelas tidak dapat dimuat."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchData]);

  const pilihanGuru = useMemo(() => {
    if (!data?.waliKelasId) return guruOptions;

    const sudahAda = guruOptions.some(
      (guru) => guru.id === data.waliKelasId
    );

    if (sudahAda) return guruOptions;

    return [
      {
        id: data.waliKelasId,
        nama: data.waliKelas,
        nip: data.nip,
        email: data.email,
        telp: data.telp,
        jabatan: "",
        status: "",
      },
      ...guruOptions,
    ];
  }, [data, guruOptions]);

  const selectedGuru = useMemo(
    () =>
      pilihanGuru.find((guru) => guru.id === guruId) ||
      null,
    [pilihanGuru, guruId]
  );

  const kontakGuru = guruDetail || selectedGuru;

  useEffect(() => {
    let active = true;

    if (!guruId || !data) {
      return undefined;
    }

    getGuruWaliKelasDetail(guruId)
      .then((detail) => {
        if (active) setGuruDetail(detail);
      })
      .catch((err) => {
        console.warn(
          "[EditWaliKelas] Gagal memuat detail guru:",
          err
        );
        if (active) setGuruDetail(null);
      });

    return () => {
      active = false;
    };
  }, [guruId, data]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data) return;

    if (!guruId) {
      setError("Pilih guru yang akan menjadi wali kelas.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess(false);

      await assignWaliKelas(data.id, guruId);

      setSuccess(true);

      setTimeout(() => {
        router.push(`/admin/guru/wali-kelas/${data.id}`);
      }, 900);
    } catch (err) {
      console.error(
        "[EditWaliKelas] Gagal menyimpan:",
        err
      );
      setError(
        err?.message ||
          "Gagal menyimpan perubahan wali kelas."
      );
    } finally {
      setSaving(false);
    }
  };

  async function handleRelease() {
    if (!data) return;

    setReleasing(true);
    setError("");
    setSuccess(false);

    try {
      await releaseWaliKelas(data.id);
      setConfirmRelease(false);

      router.push(`/admin/guru/wali-kelas/${data.id}`);
    } catch (err) {
      console.error(
        "[EditWaliKelas] Gagal melepas wali kelas:",
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
                  router.push(`/admin/guru/wali-kelas/${id}`)
                }
                className="
                  p-2.5 rounded-xl
                  border theme-border
                  theme-card
                  theme-text-muted
                  hover:bg-[var(--color-input-hover)]
                  hover:text-[var(--color-primary)]
                  transition-colors
                  shrink-0
                "
                title="Kembali ke detail wali kelas"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="p-2.5 rounded-xl theme-primary shrink-0">
                <UserCheck size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold theme-text">
                  {data?.waliKelasId
                    ? "Ganti Wali Kelas"
                    : "Tugaskan Wali Kelas"}
                </h1>

                <p className="text-sm theme-text-muted">
                  Perbarui penugasan wali kelas
                  {data ? ` untuk kelas ${data.kelas}` : ""}.
                </p>
              </div>
            </div>

            {loading && (
              <div className="theme-card rounded-xl border theme-border p-10">
                <div className="flex items-center justify-center gap-2 text-sm theme-text-muted">
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Memuat data wali kelas...
                </div>
              </div>
            )}

            {!loading && !data && error && (
              <div className="flex items-start gap-3 p-4 rounded-xl border theme-border theme-danger">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    Data wali kelas tidak ditemukan
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

            {!loading && data && (
              <>
                {success && (
                  <div className="flex items-center gap-3 p-4 rounded-xl border theme-border theme-success">
                    <CheckCircle2
                      size={20}
                      className="shrink-0"
                    />

                    <p className="text-sm font-medium">
                      Perubahan berhasil disimpan. Mengalihkan...
                    </p>
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl border theme-border theme-danger">
                    <AlertCircle
                      size={20}
                      className="mt-0.5 shrink-0"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        Gagal menyimpan perubahan
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
                      border theme-border
                      shadow-sm
                      overflow-hidden
                    "
                  >
                    <div className="px-6 py-4 border-b theme-border-soft theme-card-soft">
                      <h2 className="text-sm font-semibold theme-text-secondary">
                        Kelas & Wali Kelas
                      </h2>

                      <p className="text-xs theme-text-muted mt-0.5">
                        Pilih guru pengganti untuk kelas ini.
                      </p>
                    </div>

                    <div className="p-6 space-y-5">
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
                              className="theme-text-placeholder"
                            />

                            Kelas
                          </label>

                          <input
                            id="kelas"
                            type="text"
                            value={`${data.kelas} - ${data.tahunAjaran}`}
                            disabled
                            className="
                              w-full
                              px-3.5 py-2.5
                              text-sm
                              rounded-lg
                              border
                              theme-input
                              disabled:opacity-60
                            "
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="jenjang"
                            className="
                              flex items-center gap-1.5
                              text-sm font-medium
                              theme-text-secondary
                              mb-1.5
                            "
                          >
                            <School
                              size={14}
                              className="theme-text-placeholder"
                            />

                            Jenjang
                          </label>

                          <input
                            id="jenjang"
                            type="text"
                            value={`Kelas ${data.jenjang}`}
                            disabled
                            className="
                              w-full
                              px-3.5 py-2.5
                              text-sm
                              rounded-lg
                              border
                              theme-input
                              disabled:opacity-60
                            "
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="waliKelas"
                          className="
                            flex items-center gap-1.5
                            text-sm font-medium
                            theme-text-secondary
                            mb-1.5
                          "
                        >
                          <User
                            size={14}
                            className="theme-text-placeholder"
                          />

                          Wali Kelas

                          <span className="text-[var(--color-danger)]">
                            *
                          </span>
                        </label>

                        <select
                          id="waliKelas"
                          value={guruId}
                          onChange={(e) => {
                            setGuruId(e.target.value);
                            setGuruDetail(null);
                            setError("");
                          }}
                          disabled={saving}
                          className="
                            w-full
                            px-3.5 py-2.5
                            text-sm
                            rounded-lg
                            border
                            theme-input
                            focus:outline-none
                            focus:ring-2
                            focus:ring-[var(--color-primary)]/10
                            focus:border-[var(--color-primary)]
                            disabled:opacity-60
                          "
                        >
                          <option value="">Pilih guru</option>

                          {pilihanGuru.map((guru) => (
                            <option
                              key={guru.id}
                              value={guru.id}
                            >
                              {getGuruLabel(guru)}
                            </option>
                          ))}
                        </select>
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
                              {data.kelas}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] theme-text-muted">
                              Jenjang
                            </p>

                            <p className="theme-text-secondary mt-0.5">
                              Kelas {data.jenjang}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] theme-text-muted">
                              Tahun Ajaran
                            </p>

                            <p className="theme-text-secondary mt-0.5">
                              {data.tahunAjaran}
                            </p>
                          </div>

                          <div>
                            <p className="text-[11px] theme-text-muted">
                              Jumlah Siswa
                            </p>

                            <p className="theme-text-secondary mt-0.5">
                              {data.jumlahSiswa} siswa
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-b theme-border-soft theme-card-soft">
                      <h2 className="text-sm font-semibold theme-text-secondary">
                        Kontak Wali Kelas
                      </h2>

                      <p className="text-xs theme-text-muted mt-0.5">
                        Data kontak berasal dari akun guru yang dipilih.
                      </p>
                    </div>

                    <div className="p-6">
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

                    <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-t theme-border-soft theme-card-soft">
                      <button
                        type="submit"
                        disabled={saving}
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
                            Simpan Perubahan
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/admin/guru/wali-kelas/${data.id}`
                          )
                        }
                        disabled={saving}
                        className="
                          px-5 py-2.5
                          rounded-xl
                          border theme-border
                          theme-card
                          theme-text-secondary
                          hover:bg-[var(--color-input-hover)]
                          transition-all
                          font-medium
                          text-sm
                          disabled:opacity-60
                        "
                      >
                        Batal
                      </button>

                      {data.waliKelasId && (
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmRelease(true)
                          }
                          disabled={saving}
                          className="
                            ml-auto
                            inline-flex items-center gap-2
                            px-4 py-2.5
                            rounded-xl
                            text-sm
                            font-semibold
                            theme-danger
                            border theme-border
                            hover:opacity-80
                            transition-colors
                            disabled:opacity-60
                          "
                        >
                          <Unlink size={16} />
                          Lepas
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="space-y-6">
                    <div className="theme-card rounded-xl border theme-border shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b theme-border-soft theme-card-soft">
                        <h2 className="text-sm font-semibold theme-text-secondary">
                          Pratinjau
                        </h2>

                        <p className="text-xs theme-text-muted mt-0.5">
                          Tampilan data ini setelah disimpan.
                        </p>
                      </div>

                      <div className="px-5 py-5 flex items-center gap-3 bg-[image:var(--color-brand-logo-bg)]">
                        <div
                          className="
                            w-12 h-12
                            rounded-full
                            flex items-center justify-center
                            font-bold
                            text-sm
                            shrink-0
                            bg-[color:color-mix(in_srgb,var(--color-card)_20%,transparent)]
                            text-[var(--color-card)]
                          "
                        >
                          {getInitials(selectedGuru?.nama)}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs text-[color-mix(in_srgb,var(--color-card)_80%,transparent)]">
                            Wali Kelas {data.kelas}
                          </p>

                          <p className="font-bold text-sm leading-tight truncate text-[var(--color-card)]">
                            {selectedGuru?.nama ||
                              "Belum ditugaskan"}
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
                            Kelas {data.jenjang}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="theme-text-muted text-xs">
                            Jumlah Siswa
                          </span>

                          <span className="theme-text-secondary font-medium inline-flex items-center gap-1.5">
                            <Users size={12} />
                            {data.jumlahSiswa} siswa
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="theme-text-muted text-xs">
                            Tahun Ajaran
                          </span>

                          <span className="theme-text-secondary font-medium">
                            {data.tahunAjaran}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="theme-text-muted text-xs">
                            Status
                          </span>

                          <span
                            className={
                              guruId
                                ? "text-[var(--color-success)] text-xs font-semibold"
                                : "theme-text-muted text-xs font-semibold"
                            }
                          >
                            {guruId
                              ? "Ditugaskan"
                              : "Belum Ditugaskan"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="theme-info rounded-xl border theme-border p-5">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Info size={16} />

                        <h2 className="text-sm font-semibold">
                          Informasi
                        </h2>
                      </div>

                      <ul className="space-y-2 text-xs theme-text-secondary list-disc list-inside">
                        <li>
                          Memilih guru lain akan mengganti wali kelas
                          pada kelas ini.
                        </li>

                        <li>
                          Gunakan tombol Lepas untuk menghapus
                          penugasan tanpa menghapus kelas atau akun
                          guru.
                        </li>

                        <li>
                          Perubahan langsung tersimpan ke data kelas
                          di server.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
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
