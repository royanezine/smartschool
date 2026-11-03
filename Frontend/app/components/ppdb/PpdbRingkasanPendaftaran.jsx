"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Hash,
  Loader2,
  RotateCcw,
  UserRound,
} from "lucide-react";

import PpdbHeader from "@/app/components/ppdb/PpdbHeader";
import PpdbFooter from "@/app/components/ppdb/PpdbFooter";
import PpdbStepper from "@/app/components/ppdb/PpdbStepper";
import { getDetailSaya } from "@/services/ppdb.service";

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
                    <div className="mt-6 w-full max-w-md rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left">
                      <p className="text-xs font-medium text-emerald-700">
                        Nomor Pendaftaran
                      </p>

                      <p className="mt-1 break-all text-lg font-bold text-emerald-900">
                        {pendaftar.nomorPendaftaran}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                        Simpan nomor ini. Nomor dibaca
                        langsung dari server sekolah.
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
            </>
          )}
        </div>
      </main>

      <PpdbFooter />
    </div>
  );
}
