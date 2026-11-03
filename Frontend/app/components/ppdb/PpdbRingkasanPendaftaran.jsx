"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Copy,
  FileCheck2,
  FileText,
  Hash,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";

import PpdbHeader from "@/app/components/ppdb/PpdbHeader";
import PpdbFooter from "@/app/components/ppdb/PpdbFooter";
import PpdbStepper from "@/app/components/ppdb/PpdbStepper";
import { getDetailSaya, getRankingSaya } from "@/services/ppdb.service";

// Token autentikasi pendaftar (bukan data bisnis).
const SESI_TOKEN_PENDAFTARAN = "ppdb_token_pendaftaran";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LABEL_BERKAS = {
  KK: "Kartu Keluarga",
  AKTE: "Akta Kelahiran",
  IJAZAH: "Ijazah / Surat Keterangan Lulus",
  SERTIFIKAT: "Sertifikat Penghargaan",
  SKTM: "Surat Keterangan Tidak Mampu",
  KIP: "Kartu Indonesia Pintar",
  SURAT_TUGAS: "Surat Tugas / Mutasi Kerja",
};

function isUuid(value) {
  return UUID_REGEX.test(String(value || "").trim());
}

function bacaTokenPendaftar(searchParams) {
  const dariUrl = String(
    searchParams.get("token") || searchParams.get("tokenPendaftaran") || ""
  ).trim();

  if (dariUrl) {
    return dariUrl;
  }

  if (typeof window === "undefined") {
    return "";
  }

  try {
    return String(
      sessionStorage.getItem(SESI_TOKEN_PENDAFTARAN) || ""
    ).trim();
  } catch {
    return "";
  }
}

function formatWaktu(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusPendaftarLabel(status) {
  const nilai = String(status || "").toLowerCase();

  const peta = {
    menunggu: "Menunggu Verifikasi",
    diverifikasi: "Terverifikasi",
    lulus: "Lulus Seleksi",
    ditolak: "Tidak Lulus Seleksi",
  };

  if (peta[nilai]) {
    return peta[nilai];
  }

  if (!status) {
    return "-";
  }

  return String(status).replace(/^./, (c) => c.toUpperCase());
}

export default function PpdbRingkasanPendaftaran({ basePath = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const idDariUrl = (searchParams.get("id") || "").trim();
  const tokenDariUrl = (
    searchParams.get("token") ||
    searchParams.get("tokenPendaftaran") ||
    ""
  ).trim();

  const [status, setStatus] = useState("memeriksa");
  const [pesan, setPesan] = useState("");
  const [ringkasan, setRingkasan] = useState(null);

  const [nomorDisalin, setNomorDisalin] = useState(false);
  const [dataRanking, setDataRanking] = useState(null);
  const [memuatRanking, setMemuatRanking] = useState(false);
  const [galatRanking, setGalatRanking] = useState("");
  const [tampilkanRanking, setTampilkanRanking] = useState(true);

  const handleSalinNomor = async (teks) => {
    if (!teks) return;
    let berhasil = false;

    if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(teks);
        berhasil = true;
      } catch {
        berhasil = false;
      }
    }

    if (!berhasil && typeof document !== "undefined") {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = teks;
        textArea.style.position = "fixed";
        textArea.style.top = "0";
        textArea.style.left = "-9999px";
        textArea.style.opacity = "0";
        textArea.setAttribute("readonly", "");
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        berhasil = document.execCommand("copy");
        document.body.removeChild(textArea);
      } catch {
        berhasil = false;
      }
    }

    if (berhasil) {
      setNomorDisalin(true);
      setTimeout(() => setNomorDisalin(false), 2500);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function muatRingkasan() {
      // Token autentikasi pendaftar: URL lebih dulu, lalu sessionStorage.
      const token = tokenDariUrl || bacaTokenPendaftar(searchParams);

      if (tokenDariUrl) {
        try {
          sessionStorage.setItem(SESI_TOKEN_PENDAFTARAN, tokenDariUrl);
        } catch {}
      }

      if (!token) {
        if (!cancelled) {
          setRingkasan(null);
          setPesan(
            "Sesi pendaftaran tidak ditemukan di peramban ini. Hal ini biasa terjadi jika halaman dibuka di tab atau perangkat lain. Buka kembali halaman ini dari alur pendaftaran agar data Anda dapat dimuat dari server."
          );
          setStatus("sesiHilang");
        }
        return;
      }

      if (!cancelled) {
        setStatus("memeriksa");
        setPesan("");
      }

      try {
        // Sumber data bisnis: Backend GET /api/ppdb/saya
        const response = await getDetailSaya(token);

        if (cancelled) {
          return;
        }

        if (!response?.success || !response?.data) {
          const kode = Number(response?.status) || 0;
          const pesanServer = String(response?.message || "").trim();

          if (kode === 401) {
            setRingkasan(null);
            setPesan(
              pesanServer ||
                "Sesi atau token pendaftaran Anda tidak valid atau sudah berakhir. Silakan mulai pendaftaran kembali."
            );
            setStatus("sesiHilang");
            return;
          }

          if (kode === 404) {
            setRingkasan(null);
            setPesan(
              pesanServer ||
                "Data pendaftaran tidak ditemukan di server sekolah. Hubungi panitia PPDB untuk memastikan status pendaftaran Anda."
            );
            setStatus("tidakDitemukan");
            return;
          }

          setRingkasan(null);
          setPesan(
            pesanServer ||
              "Gagal memuat ringkasan pendaftaran dari server. Silakan coba lagi."
          );
          setStatus("gagal");
          return;
        }

        const data = response.data;

        // Pastikan data dari server milik pendaftar pada tautan ini.
        if (idDariUrl && String(data?.pendaftar?.id || "") !== idDariUrl) {
          setRingkasan(null);
          setPesan(
            "Data yang dimuat dari server tidak cocok dengan ID pada tautan ini. Gunakan tautan yang diberikan pada saat pendaftaran."
          );
          setStatus("tidakCocok");
          return;
        }

        setRingkasan(data);
        setStatus("tersedia");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setRingkasan(null);
        setPesan(
          String(error?.message || "").trim() ||
            "Gagal terhubung ke server. Periksa koneksi internet lalu coba lagi."
        );
        setStatus("gagal");
      }
    }

    muatRingkasan();

    return () => {
      cancelled = true;
    };
  }, [searchParams, idDariUrl, tokenDariUrl]);

  // Muat leaderboard peringkat pendaftar dari Backend jika sesi tersedia
  useEffect(() => {
    if (status !== "tersedia" || !ringkasan) return;
    let cancelled = false;

    async function muatLeaderboard() {
      const token = tokenDariUrl || bacaTokenPendaftar(searchParams);
      if (!token) return;

      setMemuatRanking(true);
      setGalatRanking("");

      try {
        const res = await getRankingSaya(token, 200);
        if (cancelled) return;

        if (res?.success && res?.data) {
          setDataRanking(res.data);
        } else {
          const pesanServer = String(res?.message || "");
          if (res?.status === 403 || /belum dipublikasikan/i.test(pesanServer)) {
            setGalatRanking("Peringkat belum dipublikasikan oleh sekolah.");
          } else {
            setGalatRanking(pesanServer || "Gagal memuat papan peringkat.");
          }
        }
      } catch (err) {
        if (!cancelled) {
          setGalatRanking(err?.message || "Tidak dapat memuat peringkat.");
        }
      } finally {
        if (!cancelled) {
          setMemuatRanking(false);
        }
      }
    }

    muatLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [status, ringkasan, tokenDariUrl, searchParams]);

  const pendaftar = ringkasan?.pendaftar || null;
  const berkas = ringkasan?.berkas || null;

  // Daftar berkas wajib mengikuti kontrak Backend; label di-map lokal.
  const berkasWajib = useMemo(
    () => (Array.isArray(berkas?.wajib) ? berkas.wajib : []),
    [berkas]
  );

  const terunggah = useMemo(
    () => (Array.isArray(berkas?.terunggah) ? berkas.terunggah : []),
    [berkas]
  );

  const berkasKurang = useMemo(
    () => (Array.isArray(berkas?.kurang) ? berkas.kurang : []),
    [berkas]
  );

  const dokumen = useMemo(() => {
    const terunggahMap = new Map(
      terunggah.map((item) => [String(item?.namaBerkas || ""), item])
    );

    // Tampilkan berkas wajib dari server; jika server tidak mengirim daftar
    // wajib, tampilkan seluruh berkas yang sudah terunggah.
    if (berkasWajib.length === 0) {
      return terunggah.map((item) => ({
        id: item?.id || item?.namaBerkas,
        label: LABEL_BERKAS[item?.namaBerkas] || item?.namaBerkas,
        diterima: true,
        waktu: formatWaktu(item?.dibuatPada),
      }));
    }

    return berkasWajib.map((nama) => {
      const item = terunggahMap.get(String(nama));

      return {
        id: nama,
        label: LABEL_BERKAS[nama] || nama,
        diterima: Boolean(item),
        waktu: formatWaktu(item?.dibuatPada),
      };
    });
  }, [berkasWajib, terunggah]);

  const jumlahDiterima = dokumen.filter((item) => item.diterima).length;
  const semuaDokumenDiterima =
    dokumen.length > 0 && jumlahDiterima === dokumen.length;

  const muatUlang = () => {
    setStatus("memeriksa");
    setPesan("");
    setRingkasan(null);
  };

  if (status === "memeriksa") {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={17} className="animate-spin" />
            Memuat ringkasan pendaftaran dari server...
          </div>
        </main>
      </div>
    );
  }

  const tampilkanPeringatan =
    status === "sesiHilang" ||
    status === "tidakDitemukan" ||
    status === "tidakCocok" ||
    status === "gagal";

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.push(`${basePath}/PPDB`)}
          className="mb-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft size={15} />
          Kembali ke PPDB
        </button>

        <PpdbHeader
          eyebrow="PPDB Online"
          title="Ringkasan Pendaftaran"
          description="Halaman ini merangkum data pendaftaran Anda yang dibaca langsung dari server sekolah."
        />

        <div className="mt-6">
          {tampilkanPeringatan ? (
            <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <AlertCircle size={21} />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-slate-800">
                    {status === "sesiHilang"
                      ? "Sesi pendaftaran tidak ditemukan"
                      : status === "tidakDitemukan"
                        ? "Data pendaftaran tidak ditemukan"
                        : status === "tidakCocok"
                          ? "Data tidak sesuai dengan tautan"
                          : "Gagal memuat ringkasan pendaftaran"}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {pesan}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                {status === "gagal" && (
                  <button
                    type="button"
                    onClick={muatUlang}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    <RotateCcw size={15} />
                    Coba Lagi
                  </button>
                )}

                {isUuid(idDariUrl) && status !== "tidakCocok" && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `${basePath}/PPDB/daftar/uploadBerkas?id=${encodeURIComponent(
                          idDariUrl
                        )}`
                      )
                    }
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                  >
                    Buka Unggah Dokumen
                    <ArrowRight size={15} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => router.push(`${basePath}/PPDB/daftar`)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Isi Formulir Pendaftaran
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`${basePath}/PPDB`)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Kembali ke PPDB
                </button>
              </div>
            </div>
          ) : (
            <>
              <PpdbStepper currentStep={3} />

              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-full ${
                      semuaDokumenDiterima
                        ? "bg-emerald-50"
                        : "bg-amber-50"
                    }`}
                  >
                    {semuaDokumenDiterima ? (
                      <CheckCircle2
                        size={34}
                        className="text-emerald-500"
                      />
                    ) : (
                      <FileCheck2
                        size={32}
                        className="text-amber-500"
                      />
                    )}
                  </div>

                  <h2 className="mt-5 text-xl font-semibold text-slate-800">
                    {semuaDokumenDiterima
                      ? "Pendaftaran dan Dokumen Terkirim"
                      : "Pendaftaran Terkirim"}
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                    Server mengonfirmasi data pendaftaran Anda.
                    {semuaDokumenDiterima
                      ? ` Seluruh ${dokumen.length} berkas wajib juga telah dikonfirmasi diterima server.`
                      : ` Baru ${jumlahDiterima} dari ${dokumen.length} berkas wajib yang dikonfirmasi diterima server.`}
                  </p>

                  {pendaftar?.nomorPendaftaran ? (
                    <div className="mt-6 w-full max-w-md rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-emerald-800">
                          Nomor Pendaftaran Resmi
                        </p>
                        <button
                          type="button"
                          onClick={() => handleSalinNomor(pendaftar.nomorPendaftaran)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-medium text-emerald-800 shadow-xs transition hover:bg-emerald-100/70 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          title="Salin nomor pendaftaran ke clipboard"
                          aria-label="Salin nomor pendaftaran"
                        >
                          {nomorDisalin ? (
                            <>
                              <Check size={13} className="text-emerald-600" />
                              <span className="font-semibold text-emerald-700">Disalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} className="text-emerald-700" />
                              <span>Salin</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="mt-2 break-all font-mono text-xl font-bold tracking-wide text-emerald-950">
                        {pendaftar.nomorPendaftaran}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                        Simpan nomor resmi ini. Nomor diterbitkan langsung oleh server sekolah untuk login dan mengecek hasil seleksi.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
                      <p className="text-xs font-medium text-amber-800">
                        Nomor pendaftaran belum tersedia
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-700">
                        Server belum menerbitkan nomor
                        pendaftaran. Simpan ID pendaftaran
                        di bawah dan hubungi panitia PPDB
                        sekolah untuk memperoleh nomor
                        resmi.
                      </p>
                    </div>
                  )}

                  <div className="mt-4 grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                      <div className="flex items-center gap-2 text-slate-500">
                        <UserRound size={14} />

                        <p className="text-xs">Nama</p>
                      </div>

                      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                        {pendaftar?.namaLengkap || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Hash size={14} />

                        <p className="text-xs">ID Pendaftaran</p>
                      </div>

                      <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                        {pendaftar?.id || idDariUrl || "-"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                      <p className="text-xs text-slate-500">
                        Jalur Pendaftaran
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {ringkasan?.jalur?.nama || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                      <p className="text-xs text-slate-500">
                        Sekolah Tujuan
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {ringkasan?.sekolah?.nama || "-"}
                      </p>
                    </div>
                  </div>

                  {(ringkasan?.jurusan?.nama || pendaftar?.jurusan?.nama) && (
                    <div className="mt-4 w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                      <p className="text-xs text-slate-500">
                        Pilihan Jurusan (SMK)
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {ringkasan?.jurusan?.nama || pendaftar?.jurusan?.nama}
                        {(ringkasan?.jurusan?.kode || pendaftar?.jurusan?.kode)
                          ? ` (${ringkasan?.jurusan?.kode || pendaftar?.jurusan?.kode})`
                          : ""}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                      <p className="text-xs text-slate-500">
                        Status Pendaftaran
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {statusPendaftarLabel(pendaftar?.status)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock3 size={14} />

                        <p className="text-xs">
                          Waktu pendaftaran dicatat server
                        </p>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatWaktu(pendaftar?.dibuatPada) ||
                          "Tidak tercatat"}
                      </p>
                    </div>
                  </div>

                  {ringkasan?.ranking ? (
                    <div className="mt-4 w-full max-w-md rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-left">
                      <p className="text-xs font-medium text-indigo-700">
                        Peringkat Sementara
                      </p>

                      <p className="mt-1 text-sm font-bold text-indigo-900">
                        {ringkasan.ranking.peringkat} dari{" "}
                        {ringkasan.ranking.totalPendaftar} pendaftar
                      </p>

                      <p className="mt-1 text-xs leading-5 text-indigo-700">
                        {ringkasan.ranking.masukKuota
                          ? "Anda masuk dalam kuota jalur ini."
                          : "Peringkat Anda di luar kuota jalur ini."}
                      </p>
                    </div>
                  ) : null}

                  {ringkasan?.hasilSeleksi?.statusKelulusan ? (
                    <div className="mt-4 w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                      <p className="text-xs text-slate-500">
                        Hasil Seleksi
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {ringkasan.hasilSeleksi.statusKelulusan}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-6 w-full max-w-md text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Dokumen
                    </p>

                    <div className="mt-3 space-y-2">
                      {dokumen.length === 0 ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                          <p className="text-sm text-slate-500">
                            Server belum mencantumkan daftar berkas wajib untuk
                            jalur pendaftaran ini.
                          </p>
                        </div>
                      ) : (
                        dokumen.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-start gap-3 rounded-xl border p-3.5 ${
                              item.diterima
                                ? "border-emerald-200 bg-emerald-50/60"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            {item.diterima ? (
                              <CheckCircle2
                                size={17}
                                className="mt-0.5 shrink-0 text-emerald-600"
                              />
                            ) : (
                              <FileText
                                size={17}
                                className="mt-0.5 shrink-0 text-slate-400"
                              />
                            )}

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-800">
                                {item.label}
                              </p>

                              <p
                                className={`mt-0.5 text-xs ${
                                  item.diterima
                                    ? "text-emerald-700"
                                    : "text-slate-500"
                                }`}
                              >
                                {item.diterima
                                  ? `Dikonfirmasi diterima server${
                                      item.waktu
                                        ? ` pada ${item.waktu}`
                                        : ""
                                    }`
                                  : "Belum ada konfirmasi upload dari server"}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {!semuaDokumenDiterima && (
                    <div className="mt-6 w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
                      <p className="text-xs leading-5 text-amber-800">
                        Lengkapi unggahan dokumen yang belum
                        dikonfirmasi server.
                        {berkasKurang.length > 0
                          ? ` Berkas yang masih kurang: ${berkasKurang
                              .map((nama) => LABEL_BERKAS[nama] || nama)
                              .join(", ")}.`
                          : ""}{" "}
                        Dokumen yang sudah berhasil tidak
                        perlu diunggah ulang.
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    {!semuaDokumenDiterima && (
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `${basePath}/PPDB/daftar/uploadBerkas?id=${encodeURIComponent(
                              String(pendaftar?.id || idDariUrl)
                            )}`
                          )
                        }
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                      >
                        Lanjutkan Unggah Dokumen
                        <ArrowRight size={15} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => router.push(`${basePath}/PPDB`)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Kembali ke Halaman PPDB
                    </button>
                  </div>

                  <div className="mt-6 w-full max-w-md rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-left">
                    <p className="text-xs leading-5 text-blue-700">
                      Ringkasan ini dibaca langsung dari
                      server sekolah setiap kali halaman
                      dibuka. Halaman ini bukan pengganti
                      pengumuman resmi sekolah. Panitia
                      PPDB akan melakukan verifikasi data
                      dan dokumen sebelum menetapkan
                      hasil seleksi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Leaderboard Papan Peringkat Sementara Calon Siswa */}
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Trophy size={22} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 sm:text-lg">
                        Papan Peringkat Jalur PPDB
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {dataRanking?.jalur?.nama
                          ? `Jalur: ${dataRanking.jalur.nama} • Kuota: ${dataRanking.jalur.kuota} Siswa • Total: ${dataRanking.totalPendaftar} Pendaftar`
                          : "Peringkat sementara pendaftar berdasarkan kriteria seleksi resmi sekolah"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTampilkanRanking((prev) => !prev)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      {tampilkanRanking ? (
                        <>
                          <ChevronUp size={14} />
                          <span>Sembunyikan Tabel</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          <span>Lihat Tabel Peringkat</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {memuatRanking ? (
                  <div className="flex items-center justify-center py-10 text-xs text-slate-500 gap-2">
                    <Loader2 size={16} className="animate-spin text-blue-600" />
                    <span>Memuat data peringkat jalur dari server...</span>
                  </div>
                ) : galatRanking ? (
                  <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle size={17} className="mt-0.5 shrink-0 text-amber-600" />
                      <div>
                        <p className="text-xs font-semibold text-amber-900">
                          Informasi Peringkat
                        </p>
                        <p className="mt-0.5 text-xs text-amber-700 leading-relaxed">
                          {galatRanking}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : !dataRanking || !Array.isArray(dataRanking.daftar) || dataRanking.daftar.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Belum ada data peringkat pendaftar pada jalur ini.
                  </div>
                ) : tampilkanRanking ? (
                  <div className="mt-5 space-y-4">
                    {/* Ringkasan Posisi Akun Calon Siswa */}
                    {dataRanking.saya && (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white text-sm">
                            #{dataRanking.saya.peringkat}
                          </span>
                          <div>
                            <p className="font-semibold text-blue-950">
                              Posisi Anda: Peringkat #{dataRanking.saya.peringkat} dari {dataRanking.totalPendaftar} Pendaftar
                            </p>
                            <p className="text-blue-700 text-[11px] mt-0.5">
                              Nomor Pendaftaran: <span className="font-mono font-medium">{dataRanking.saya.nomorPendaftaran}</span>
                            </p>
                          </div>
                        </div>

                        <div>
                          {dataRanking.saya.masukKuota ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 font-semibold text-emerald-800">
                              <CheckCircle2 size={13} className="text-emerald-600" />
                              Masuk Kuota ({dataRanking.jalur?.kuota || "-"})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3 py-1 font-semibold text-amber-800">
                              <AlertCircle size={13} className="text-amber-600" />
                              Di Luar Kuota
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tabel Leaderboard Pendaftar */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                          <tr>
                            <th className="px-3.5 py-3 text-center w-14">Rank</th>
                            <th className="px-3.5 py-3">No. Pendaftaran</th>
                            <th className="px-3.5 py-3">Nama Calon Siswa</th>
                            {dataRanking.daftar.some((d) => d.nilaiRapor !== null && d.nilaiRapor !== undefined) && (
                              <th className="px-3.5 py-3 text-center">Nilai Rapor</th>
                            )}
                            {dataRanking.daftar.some((d) => d.jarakKm !== null && d.jarakKm !== undefined) && (
                              <th className="px-3.5 py-3 text-center">Jarak Rumah</th>
                            )}
                            <th className="px-3.5 py-3 text-center">Status Kuota</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {dataRanking.daftar.map((item) => {
                            const isSaya = item.saya;
                            const isJuara1 = item.peringkat === 1;
                            const isJuara2 = item.peringkat === 2;
                            const isJuara3 = item.peringkat === 3;

                            return (
                              <tr
                                key={item.nomorPendaftaran || item.peringkat}
                                className={`transition-colors ${
                                  isSaya
                                    ? "bg-blue-50/70 font-medium text-blue-950"
                                    : "hover:bg-slate-50/80 text-slate-700"
                                }`}
                              >
                                <td className="px-3.5 py-3 text-center">
                                  {isJuara1 ? (
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800 text-[11px] shadow-xs">
                                      1
                                    </span>
                                  ) : isJuara2 ? (
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-700 text-[11px] shadow-xs">
                                      2
                                    </span>
                                  ) : isJuara3 ? (
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-800/15 font-bold text-amber-900 text-[11px] shadow-xs">
                                      3
                                    </span>
                                  ) : (
                                    <span className="text-slate-500 font-semibold">{item.peringkat}</span>
                                  )}
                                </td>
                                <td className="px-3.5 py-3 font-mono text-[11px]">
                                  {item.nomorPendaftaran}
                                </td>
                                <td className="px-3.5 py-3">
                                  <div className="flex items-center gap-1.5">
                                    <span>{item.nama}</span>
                                    {isSaya && (
                                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                        Anda
                                      </span>
                                    )}
                                  </div>
                                </td>
                                {dataRanking.daftar.some((d) => d.nilaiRapor !== null && d.nilaiRapor !== undefined) && (
                                  <td className="px-3.5 py-3 text-center font-medium">
                                    {item.nilaiRapor !== null && item.nilaiRapor !== undefined
                                      ? Number(item.nilaiRapor).toFixed(2)
                                      : "-"}
                                  </td>
                                )}
                                {dataRanking.daftar.some((d) => d.jarakKm !== null && d.jarakKm !== undefined) && (
                                  <td className="px-3.5 py-3 text-center text-slate-600">
                                    {item.jarakKm !== null && item.jarakKm !== undefined
                                      ? `${Number(item.jarakKm).toFixed(2)} km`
                                      : "-"}
                                  </td>
                                )}
                                <td className="px-3.5 py-3 text-center">
                                  {item.masukKuota ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                      <CheckCircle2 size={11} className="text-emerald-500" />
                                      Masuk Kuota
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                                      Di Luar Kuota
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Kebijakan Privasi Peringkat */}
                    <div className="flex items-start gap-2 pt-2 text-[11px] text-slate-500">
                      <ShieldCheck size={14} className="mt-0.5 shrink-0 text-slate-400" />
                      <p>
                        Nama calon siswa lain disamarkan otomatis oleh sistem demi menjaga kerahasiaan data pribadi. Peringkat dihitung otomatis berdasarkan kriteria seleksi yang berlaku pada jalur ini.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </main>

      <PpdbFooter />
    </div>
  );
}
