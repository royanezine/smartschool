"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  Package,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ClipboardList,
  Info,
  User,
  Building2,
  PackageCheck,
} from "lucide-react";

import {
  getAset,
  ajukanPeminjaman,
} from "@/services/sarpras.service";

/* =========================================================
   THEME HELPERS
========================================================= */

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

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

const themeDividerBg =
  "bg-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";

const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";

const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";

const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";

const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

/* =========================================================
   PAGE
========================================================= */

function AjukanPeminjamanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const asetId = searchParams.get("asetId");

  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* DATA ASET */
  const [itemDipilih, setItemDipilih] = useState(null);
  const [loadingAset, setLoadingAset] = useState(true);
  const [errorAset, setErrorAset] = useState("");

  /* FORM */
  const [tanggalKembaliRencana, setTanggalKembaliRencana] = useState("");
  const [keperluan, setKeperluan] = useState("");
  const [catatanPeminjaman, setCatatanPeminjaman] = useState("");
  const [jumlah, setJumlah] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [berhasilKirim, setBerhasilKirim] = useState(false);
  const [dataPeminjaman, setDataPeminjaman] = useState(null);

  const notifications = [
    {
      id: 1,
      title: "Informasi Peminjaman",
      desc: "Cek status pengajuan peminjaman Anda",
      read: false,
    },
  ];

  /* LOAD ASET */
  useEffect(() => {
    let mounted = true;

    async function loadAset() {
      try {
        setLoadingAset(true);
        setErrorAset("");

        if (!asetId) {
          setErrorAset("Aset tidak ditentukan.");
          setItemDipilih(null);
          return;
        }

        const response = await getAset();

        if (!mounted) return;

        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
          ? response
          : [];

        const found = data.find(
          (item) => String(item?.id) === String(asetId)
        );

        if (!found) {
          setErrorAset("Aset tidak ditemukan atau sudah tidak tersedia.");
          setItemDipilih(null);
          return;
        }

        setItemDipilih(found);

        setTanggalKembaliRencana("");
        setKeperluan("");
        setCatatanPeminjaman("");
        setJumlah(1);
        setSubmitError("");
        setBerhasilKirim(false);
        setDataPeminjaman(null);
      } catch (err) {
        if (!mounted) return;

        console.error("Gagal mengambil data aset:", err);
        setErrorAset(err?.message || "Gagal mengambil data aset.");
        setItemDipilih(null);
      } finally {
        if (mounted) setLoadingAset(false);
      }
    }

    loadAset();

    return () => {
      mounted = false;
    };
  }, [asetId]);

  const getSisaStok = (item) => Number(item?.jumlahStok ?? 0);

  /* KEMBALI */
  const handleBack = () => {
    if (submitting) return;
    router.push("/guru/sarpras/pinjam");
  };

  /* SUBMIT */
  const kirimPengajuan = async (e) => {
    e.preventDefault();

    if (!itemDipilih?.id) {
      setSubmitError("Aset yang dipilih tidak valid.");
      return;
    }

    if (!keperluan.trim()) {
      setSubmitError("Keperluan wajib diisi.");
      return;
    }

    if (keperluan.trim().length < 3) {
      setSubmitError("Keperluan minimal 3 karakter.");
      return;
    }

    if (!tanggalKembaliRencana) {
      setSubmitError("Tanggal kembali rencana wajib diisi.");
      return;
    }

    if (!jumlah || Number(jumlah) <= 0) {
      setSubmitError("Jumlah harus lebih dari 0.");
      return;
    }

    const stok = getSisaStok(itemDipilih);

    if (Number(jumlah) > stok) {
      setSubmitError(
        `Jumlah melebihi stok tersedia. Sisa stok: ${stok}.`
      );
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");

      const response = await ajukanPeminjaman({
        asetId: itemDipilih.id,
        jumlah: Number(jumlah),
        keperluan: keperluan.trim(),
        tanggalKembaliRencana,
        catatanPeminjaman: catatanPeminjaman.trim() || null,
      });

      console.log("Pengajuan peminjaman berhasil:", response);

      const result = response?.data ?? response;

      setDataPeminjaman(result);
      setBerhasilKirim(true);
    } catch (err) {
      console.error("Gagal mengajukan peminjaman:", err);

      setSubmitError(
        err?.message || "Gagal mengirim pengajuan peminjaman."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((v) => !v)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          toggleSidebar={() => setSidebarOpen((v) => !v)}
          notifications={notifications}
          user={{
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="theme-page relative flex-1 overflow-y-auto">
          {/* BACKGROUND DECORATION */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div
              className="absolute -right-20 -top-32 h-[320px] w-[320px] rounded-full blur-3xl"
              style={{
                background:
                  "color-mix(in srgb, var(--color-primary) 8%, transparent)",
              }}
            />

            <div
              className="absolute -left-40 top-1/3 h-[280px] w-[280px] rounded-full blur-3xl"
              style={{
                background:
                  "color-mix(in srgb, var(--color-info) 6%, transparent)",
              }}
            />
          </div>

          <div className="relative mx-auto w-full max-w-[1100px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

            {/* =================================================
                BACK BUTTON + PAGE HEADER
            ================================================= */}

            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="theme-text-secondary inline-flex items-center gap-2 text-xs font-semibold transition-colors hover:text-[var(--color-primary)] disabled:opacity-50"
            >
              <span
                className={`theme-card flex h-8 w-8 items-center justify-center rounded-lg border ${themeNeutralBorder} ${themeSmallShadow}`}
              >
                <ArrowLeft size={14} />
              </span>

              Kembali ke Daftar Aset
            </button>

            <div className="flex min-w-0 items-start gap-4">
              <div
                className={`${themePrimaryGradient} ${themePrimaryShadow} flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[var(--color-card)]`}
              >
                <ClipboardList size={22} />
              </div>

              <div className="min-w-0">
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: "var(--color-primary)",
                    }}
                  />

                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--color-primary)]">
                    Formulir Peminjaman
                  </p>
                </div>

                <h1 className="theme-text text-2xl font-bold tracking-tight md:text-[28px]">
                  Ajukan Peminjaman Aset
                </h1>

                <p className="theme-text-secondary mt-1 max-w-2xl text-sm">
                  Lengkapi data peminjaman di bawah ini. Pengajuan akan
                  diproses oleh admin sarana prasarana.
                </p>
              </div>
            </div>

            {/* =================================================
                CONTENT
            ================================================= */}

            {loadingAset ? (
              <div
                className={`theme-card flex flex-col items-center justify-center rounded-2xl border ${themeNeutralBorder} py-16 ${themeCardShadow}`}
              >
                <Loader2
                  size={28}
                  className="animate-spin text-[var(--color-primary)]"
                />

                <p className="theme-text-secondary mt-3 text-sm">
                  Memuat data aset...
                </p>
              </div>
            ) : errorAset ? (
              <div
                className={`flex items-start gap-3 rounded-2xl border p-4 ${themeDangerSurface} ${themeDangerBorder}`}
              >
                <div
                  className={`theme-card flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border ${themeDangerBorder} theme-danger`}
                >
                  <AlertCircle size={16} />
                </div>

                <div>
                  <p className="theme-danger text-sm font-bold">
                    Gagal memuat aset
                  </p>

                  <p className="theme-text-secondary mt-1 text-xs">
                    {errorAset}
                  </p>
                </div>
              </div>
            ) : berhasilKirim ? (
              /* =================================================
                 SUCCESS STATE
              ================================================= */

              <div
                className={`theme-card overflow-hidden rounded-2xl border ${themeSuccessBorder} ${themeCardShadow}`}
              >
                <div
                  className={`${themePrimaryGradient} relative overflow-hidden p-8 text-[var(--color-card)]`}
                >
                  <div
                    className="absolute -right-10 -top-10 h-40 w-40 rounded-full"
                    style={{
                      background:
                        "color-mix(in srgb, var(--color-card) 10%, transparent)",
                    }}
                  />

                  <div
                    className="absolute -bottom-20 right-12 h-32 w-32 rounded-full"
                    style={{
                      background:
                        "color-mix(in srgb, var(--color-card) 10%, transparent)",
                    }}
                  />

                  <div className="relative flex flex-col items-center gap-3 text-center">
                    <div
                      className="rounded-2xl border p-3 backdrop-blur-sm"
                      style={{
                        background:
                          "color-mix(in srgb, var(--color-card) 15%, transparent)",
                        borderColor:
                          "color-mix(in srgb, var(--color-card) 20%, transparent)",
                      }}
                    >
                      <CheckCircle2 size={32} />
                    </div>

                    <div>
                      <p className="text-lg font-bold">
                        Pengajuan Berhasil Dikirim
                      </p>

                      <p
                        className="mt-1 text-xs"
                        style={{
                          color:
                            "color-mix(in srgb, var(--color-card) 82%, transparent)",
                        }}
                      >
                        Pengajuan kamu sudah tercatat dan menunggu persetujuan
                        admin.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {dataPeminjaman?.nomorPeminjaman && (
                      <div
                        className={`rounded-xl border p-4 ${themeNeutralSurface} ${themeNeutralBorder}`}
                      >
                        <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                          Nomor Peminjaman
                        </p>

                        <p className="theme-text mt-1 text-sm font-mono font-bold">
                          {dataPeminjaman.nomorPeminjaman}
                        </p>
                      </div>
                    )}

                    {dataPeminjaman?.status && (
                      <div
                        className={`rounded-xl border p-4 ${themeNeutralSurface} ${themeNeutralBorder}`}
                      >
                        <p className="theme-text-muted text-[10px] font-bold uppercase tracking-wider">
                          Status
                        </p>

                        <p className="theme-text mt-1 text-sm font-bold capitalize">
                          {dataPeminjaman.status}
                        </p>
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex items-start gap-3 rounded-xl border p-4 ${themeInfoSurface} ${themeInfoBorder}`}
                  >
                    <Info
                      size={16}
                      className="mt-0.5 flex-shrink-0 text-[var(--color-info)]"
                    />

                    <p className="text-xs leading-relaxed text-[var(--color-info)]">
                      Kamu dapat memantau status peminjaman di halaman riwayat
                      peminjaman. Pastikan aset dikembalikan sesuai tanggal yang
                      ditentukan.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleBack}
                      className={`theme-card theme-text-secondary h-11 flex-1 rounded-xl border ${themeNeutralBorder} text-sm font-semibold transition-colors ${themeNeutralHover}`}
                    >
                      Kembali ke Daftar
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push("/guru/sarpras/riwayat")
                      }
                      className={`${themePrimaryGradient} h-11 flex-1 rounded-xl text-sm font-semibold text-[var(--color-card)] ${themePrimaryShadow} transition-all hover:-translate-y-0.5`}
                    >
                      Lihat Riwayat Peminjaman
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* =================================================
                 FORM + INFO ASET
              ================================================= */

              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">

                {/* =================================================
                    FORM CARD
                ================================================= */}

                <form
                  onSubmit={kirimPengajuan}
                  className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <div
                    className={`flex items-center gap-3 border-b px-5 py-4 sm:px-6 ${themeDivider}`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border ${themePrimarySoft} ${themePrimarySoftBorder} ${themePrimaryText}`}
                    >
                      <ClipboardList size={16} />
                    </div>

                    <div>
                      <p className="theme-text text-sm font-bold">
                        Data Peminjaman
                      </p>

                      <p className="theme-text-muted text-[11px]">
                        Semua field dengan tanda * wajib diisi
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5 p-5 sm:p-6">

                    {/* JUMLAH */}

                    <div>
                      <label className="theme-text-secondary mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
                        <Package
                          size={12}
                          className="theme-text-muted"
                        />

                        Jumlah{" "}
                        <span className="theme-danger">*</span>
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          max={getSisaStok(itemDipilih)}
                          required
                          value={jumlah}
                          onChange={(e) => {
                            const value = Number(e.target.value);

                            if (!value || value < 1) {
                              setJumlah(1);
                              return;
                            }

                            setJumlah(
                              Math.min(
                                value,
                                getSisaStok(itemDipilih)
                              )
                            );
                          }}
                          className={`theme-input h-11 w-full rounded-xl border px-3.5 pr-14 text-sm outline-none transition-all ${themeFocus}`}
                        />

                        <span className="theme-text-muted absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold">
                          unit
                        </span>
                      </div>

                      <p className="theme-text-muted mt-1 text-[11px]">
                        Maksimal {getSisaStok(itemDipilih)} unit tersedia.
                      </p>
                    </div>

                    {/* KEPERLUAN */}

                    <div>
                      <label className="theme-text-secondary mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
                        <ClipboardList
                          size={12}
                          className="theme-text-muted"
                        />

                        Keperluan{" "}
                        <span className="theme-danger">*</span>
                      </label>

                      <textarea
                        required
                        minLength={3}
                        rows={4}
                        value={keperluan}
                        onChange={(e) =>
                          setKeperluan(e.target.value)
                        }
                        placeholder="Contoh: Untuk kegiatan pembelajaran di kelas X IPA 1"
                        className={`theme-input w-full resize-none rounded-xl border px-3.5 py-3 text-sm outline-none transition-all ${themeFocus} placeholder:text-[var(--color-text-placeholder)]`}
                      />

                      <p className="theme-text-muted mt-1 text-[11px]">
                        Minimal 3 karakter. Jelaskan keperluan dengan singkat
                        dan jelas.
                      </p>
                    </div>

                    {/* TANGGAL */}

                    <div>
                      <label className="theme-text-secondary mb-1.5 flex items-center gap-1.5 text-xs font-semibold">
                        <CalendarDays
                          size={12}
                          className="theme-text-muted"
                        />

                        Tanggal Kembali Rencana{" "}
                        <span className="theme-danger">*</span>
                      </label>

                      <input
                        type="date"
                        required
                        value={tanggalKembaliRencana}
                        onChange={(e) =>
                          setTanggalKembaliRencana(e.target.value)
                        }
                        className={`theme-input h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition-all ${themeFocus}`}
                      />

                      <p className="theme-text-muted mt-1 text-[11px]">
                        Tanggal perkiraan aset akan dikembalikan.
                      </p>
                    </div>

                    {/* CATATAN */}

                    <div>
                      <label className="theme-text-secondary mb-1.5 block text-xs font-semibold">
                        Catatan Peminjaman{" "}
                        <span className="theme-text-muted font-normal">
                          (Opsional)
                        </span>
                      </label>

                      <textarea
                        rows={3}
                        value={catatanPeminjaman}
                        onChange={(e) =>
                          setCatatanPeminjaman(e.target.value)
                        }
                        placeholder="Tambahkan catatan jika diperlukan"
                        className={`theme-input w-full resize-none rounded-xl border px-3.5 py-3 text-sm outline-none transition-all ${themeFocus} placeholder:text-[var(--color-text-placeholder)]`}
                      />
                    </div>

                    {/* ERROR */}

                    {submitError && (
                      <div
                        className={`flex items-start gap-2 rounded-xl border p-3 ${themeDangerSurface} ${themeDangerBorder}`}
                      >
                        <AlertCircle
                          size={16}
                          className="theme-danger mt-0.5 flex-shrink-0"
                        />

                        <p className="theme-danger text-xs font-medium">
                          {submitError}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* FOOTER BUTTONS */}

                  <div
                    className={`flex flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end sm:px-6 ${themeDivider} ${themeNeutralSurface}`}
                  >
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={submitting}
                      className={`theme-card theme-text-secondary h-11 rounded-xl border px-5 text-sm font-semibold transition-colors ${themeNeutralBorder} ${themeNeutralHover} disabled:opacity-50`}
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className={`${themePrimaryGradient} ${themePrimaryShadow} inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-[var(--color-card)] transition-all hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60`}
                    >
                      {submitting ? (
                        <>
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                          Mengirim...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={15} />
                          Kirim Pengajuan
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* =================================================
                    SIDEBAR INFO ASET
                ================================================= */}

                <aside className="space-y-4 lg:sticky lg:top-6">

                  {/* INFO ASET */}

                  <div
                    className={`theme-card overflow-hidden rounded-2xl border ${themeNeutralBorder} ${themeCardShadow}`}
                  >
                    <div
                      className={`${themePrimaryGradient} relative overflow-hidden p-5 text-[var(--color-card)]`}
                    >
                      <div
                        className="absolute -right-8 -top-8 h-24 w-24 rounded-full"
                        style={{
                          background:
                            "color-mix(in srgb, var(--color-card) 10%, transparent)",
                        }}
                      />

                      <div
                        className="absolute -bottom-12 right-6 h-20 w-20 rounded-full"
                        style={{
                          background:
                            "color-mix(in srgb, var(--color-card) 10%, transparent)",
                        }}
                      />

                      <div className="relative flex items-start gap-3">
                        <div
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                          style={{
                            background:
                              "color-mix(in srgb, var(--color-card) 15%, transparent)",
                            borderColor:
                              "color-mix(in srgb, var(--color-card) 20%, transparent)",
                          }}
                        >
                          <Package size={18} />
                        </div>

                        <div className="min-w-0">
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              color:
                                "color-mix(in srgb, var(--color-card) 82%, transparent)",
                            }}
                          >
                            Aset yang Dipinjam
                          </p>

                          <p className="mt-1 truncate text-sm font-bold">
                            {itemDipilih?.nama || "-"}
                          </p>

                          {itemDipilih?.kode && (
                            <p
                              className="mt-0.5 text-[11px] font-mono"
                              style={{
                                color:
                                  "color-mix(in srgb, var(--color-card) 82%, transparent)",
                              }}
                            >
                              {itemDipilih.kode}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 p-5">
                      <InfoRow
                        icon={<PackageCheck size={13} />}
                        label="Kategori"
                        value={
                          itemDipilih?.kategoriAset?.nama || "-"
                        }
                      />

                      <InfoRow
                        icon={<Info size={13} />}
                        label="Kondisi"
                        value={itemDipilih?.kondisi || "-"}
                        capitalize
                      />

                      <InfoRow
                        icon={<PackageCheck size={13} />}
                        label="Stok Tersedia"
                        value={`${getSisaStok(itemDipilih)} unit`}
                        valueClass="text-[var(--color-success)]"
                      />

                      {itemDipilih?.lokasi && (
                        <InfoRow
                          icon={<Building2 size={13} />}
                          label="Lokasi"
                          value={itemDipilih.lokasi}
                        />
                      )}

                      {itemDipilih?.gudang?.nama && (
                        <InfoRow
                          icon={<Building2 size={13} />}
                          label="Gudang"
                          value={itemDipilih.gudang.nama}
                        />
                      )}
                    </div>
                  </div>

                  {/* INFO PEMINJAM */}

                  <div
                    className={`theme-card rounded-2xl border p-5 ${themeNeutralBorder} ${themeCardShadow}`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{
                          background: "var(--color-primary)",
                        }}
                      />

                      <p className="theme-text-secondary text-[11px] font-bold uppercase tracking-wider">
                        Peminjam
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border ${themeNeutralSurface} ${themeNeutralBorder} theme-text-secondary`}
                      >
                        <User size={16} />
                      </div>

                      <div className="min-w-0">
                        <p className="theme-text truncate text-sm font-bold">
                          Bu Sari
                        </p>

                        <p className="theme-text-secondary truncate text-[11px]">
                          guru@smartschool.com
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* INFO NOTE */}

                  <div
                    className={`rounded-2xl border p-4 ${themeInfoSurface} ${themeInfoBorder}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`theme-card flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${themeInfoBorder} text-[var(--color-info)]`}
                      >
                        <Info size={14} />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-[var(--color-info)]">
                          Perhatian
                        </p>

                        <p className="mt-1 text-[11px] leading-relaxed text-[var(--color-info)]">
                          Pastikan aset dikembalikan tepat waktu. Keterlambatan
                          pengembalian dapat mempengaruhi peminjaman berikutnya.
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  icon,
  label,
  value,
  capitalize,
  valueClass = "",
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="theme-text-secondary flex flex-shrink-0 items-center gap-1.5 text-xs">
        {icon}
        {label}
      </span>

      <span
        className={`theme-text truncate text-right text-xs font-bold ${
          capitalize ? "capitalize" : ""
        } ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   WRAPPER — Suspense
========================================================= */

export default function AjukanPeminjamanPage() {
  return (
    <Suspense
      fallback={
        <div className="theme-page flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2
              size={24}
              className="animate-spin text-[var(--color-primary)]"
            />

            <p className="theme-text-secondary text-sm">
              Memuat...
            </p>
          </div>
        </div>
      }
    >
      <AjukanPeminjamanContent />
    </Suspense>
  );
}