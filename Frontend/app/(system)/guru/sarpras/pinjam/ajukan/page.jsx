"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  Package,
  ArrowLeft,
  X,
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
} from "../../../../../services/sarpras.service";

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

  /* LOAD ASET — cari item sesuai asetId */
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

        /* Reset form kalau aset ganti */
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
      setSubmitError(`Jumlah melebihi stok tersedia. Sisa stok: ${stok}.`);
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
      setSubmitError(err?.message || "Gagal mengirim pengajuan peminjaman.");
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((v) => !v)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          toggleSidebar={() => setSidebarOpen((v) => !v)}
          notifications={notifications}
          user={{
            name: "Bu Sari",
            email: "guru@smartschool.com",
            avatar: "AS",
          }}
        />

        <main className="flex-1 overflow-y-auto relative">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 right-0 h-[320px] w-[320px] rounded-full bg-blue-100/40 blur-3xl" />
            <div className="absolute top-1/3 -left-40 h-[280px] w-[280px] rounded-full bg-indigo-100/30 blur-3xl" />
          </div>

          <div className="relative w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">

            {/* =================================================
                BACK BUTTON + PAGE HEADER
            ================================================= */}

            <button
              type="button"
              onClick={handleBack}
              disabled={submitting}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm">
                <ArrowLeft size={14} />
              </span>
              Kembali ke Daftar Aset
            </button>

            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20">
                <ClipboardList size={22} />
              </div>
              <div className="min-w-0">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-600">
                    Formulir Peminjaman
                  </p>
                </div>
                <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-slate-900">
                  Ajukan Peminjaman Aset
                </h1>
                <p className="mt-1 text-sm text-slate-500 max-w-2xl">
                  Lengkapi data peminjaman di bawah ini. Pengajuan akan
                  diproses oleh admin sarana prasarana.
                </p>
              </div>
            </div>

            {/* =================================================
                CONTENT
            ================================================= */}

            {loadingAset ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm py-16 flex flex-col items-center justify-center">
                <Loader2 size={28} className="animate-spin text-blue-600" />
                <p className="text-sm text-slate-500 mt-3">Memuat data aset...</p>
              </div>
            ) : errorAset ? (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-red-500 border border-red-100 flex-shrink-0">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-700">Gagal memuat aset</p>
                  <p className="text-xs text-red-600 mt-1">{errorAset}</p>
                </div>
              </div>
            ) : berhasilKirim ? (
              /* =================================================
                 SUCCESS STATE
              ================================================= */
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white">
                  <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10" />
                  <div className="absolute right-12 -bottom-20 w-32 h-32 rounded-full bg-white/10" />

                  <div className="relative flex flex-col items-center text-center gap-3">
                    <div className="p-3 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <p className="text-lg font-bold">Pengajuan Berhasil Dikirim</p>
                      <p className="text-xs text-emerald-50 mt-1">
                        Pengajuan kamu sudah tercatat dan menunggu persetujuan admin.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {dataPeminjaman?.nomorPeminjaman && (
                      <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Nomor Peminjaman
                        </p>
                        <p className="text-sm font-mono font-bold text-slate-800 mt-1">
                          {dataPeminjaman.nomorPeminjaman}
                        </p>
                      </div>
                    )}
                    {dataPeminjaman?.status && (
                      <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Status
                        </p>
                        <p className="text-sm font-bold text-slate-800 mt-1 capitalize">
                          {dataPeminjaman.status}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 p-4">
                    <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Kamu dapat memantau status peminjaman di halaman riwayat
                      peminjaman. Pastikan aset dikembalikan sesuai tanggal yang
                      ditentukan.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 h-11 text-sm font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Kembali ke Daftar
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/guru/sarpras/riwayat")}
                      className="flex-1 h-11 text-sm font-semibold rounded-xl bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25 hover:-translate-y-0.5 hover:shadow-lg transition-all"
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
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start">

                {/* =================================================
                    FORM CARD
                ================================================= */}
                <form
                  onSubmit={kirimPengajuan}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
                >
                  <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <ClipboardList size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Data Peminjaman
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Semua field dengan tanda * wajib diisi
                      </p>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-5">

                    {/* JUMLAH */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Package size={12} className="text-slate-400" />
                        Jumlah <span className="text-red-500">*</span>
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
                            setJumlah(Math.min(value, getSisaStok(itemDipilih)));
                          }}
                          className="w-full px-3.5 h-11 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                          unit
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Maksimal {getSisaStok(itemDipilih)} unit tersedia.
                      </p>
                    </div>

                    {/* KEPERLUAN */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <ClipboardList size={12} className="text-slate-400" />
                        Keperluan <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        minLength={3}
                        rows={4}
                        value={keperluan}
                        onChange={(e) => setKeperluan(e.target.value)}
                        placeholder="Contoh: Untuk kegiatan pembelajaran di kelas X IPA 1"
                        className="w-full px-3.5 py-3 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none placeholder:text-slate-400"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Minimal 3 karakter. Jelaskan keperluan dengan singkat dan jelas.
                      </p>
                    </div>

                    {/* TANGGAL */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <CalendarDays size={12} className="text-slate-400" />
                        Tanggal Kembali Rencana <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={tanggalKembaliRencana}
                        onChange={(e) => setTanggalKembaliRencana(e.target.value)}
                        className="w-full px-3.5 h-11 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Tanggal perkiraan aset akan dikembalikan.
                      </p>
                    </div>

                    {/* CATATAN */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                        Catatan Peminjaman{" "}
                        <span className="text-slate-400 font-normal">(Opsional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={catatanPeminjaman}
                        onChange={(e) => setCatatanPeminjaman(e.target.value)}
                        placeholder="Tambahkan catatan jika diperlukan"
                        className="w-full px-3.5 py-3 text-sm rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none placeholder:text-slate-400"
                      />
                    </div>

                    {/* ERROR */}
                    {submitError && (
                      <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                        <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600 font-medium">{submitError}</p>
                      </div>
                    )}
                  </div>

                  {/* FOOTER BUTTONS */}
                  <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-gradient-to-b from-white to-slate-50/60 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={submitting}
                      className="h-11 px-5 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="h-11 px-5 text-sm font-semibold rounded-xl bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-md shadow-blue-600/25 hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-60 disabled:translate-y-0 inline-flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
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
                <aside className="lg:sticky lg:top-6 space-y-4">

                  {/* INFO ASET */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 p-5 text-white">
                      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/10" />
                      <div className="absolute right-6 -bottom-12 w-20 h-20 rounded-full bg-white/10" />

                      <div className="relative flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 border border-white/20">
                          <Package size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-100">
                            Aset yang Dipinjam
                          </p>
                          <p className="text-sm font-bold mt-1 truncate">
                            {itemDipilih?.nama || "-"}
                          </p>
                          {itemDipilih?.kode && (
                            <p className="text-[11px] text-blue-100 mt-0.5 font-mono">
                              {itemDipilih.kode}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <InfoRow
                        icon={<PackageCheck size={13} />}
                        label="Kategori"
                        value={itemDipilih?.kategoriAset?.nama || "-"}
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
                        valueClass="text-emerald-600"
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
                  <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1 h-1 rounded-full bg-blue-600" />
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Peminjam
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600">
                        <User size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">
                          Bu Sari
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          guru@smartschool.com
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* INFO NOTE */}
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 border border-blue-100">
                        <Info size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-800">
                          Perhatian
                        </p>
                        <p className="text-[11px] text-blue-700/80 leading-relaxed mt-1">
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

function InfoRow({ icon, label, value, capitalize, valueClass = "" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500 flex items-center gap-1.5 flex-shrink-0">
        {icon}
        {label}
      </span>
      <span
        className={`text-xs font-bold text-slate-800 truncate text-right ${
          capitalize ? "capitalize" : ""
        } ${valueClass}`}
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   WRAPPER — Suspense untuk useSearchParams
========================================================= */

export default function AjukanPeminjamanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <p className="text-sm text-slate-500">Memuat...</p>
          </div>
        </div>
      }
    >
      <AjukanPeminjamanContent />
    </Suspense>
  );
}