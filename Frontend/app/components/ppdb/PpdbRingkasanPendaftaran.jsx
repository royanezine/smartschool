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
  UserRound,
} from "lucide-react";

import PpdbHeader from "@/app/components/ppdb/PpdbHeader";
import PpdbFooter from "@/app/components/ppdb/PpdbFooter";
import PpdbStepper from "@/app/components/ppdb/PpdbStepper";

const SESI_SUBMISSION = "ppdb_last_submission";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DOKUMEN_WAJIB = [
  { id: "KK", label: "Kartu Keluarga" },
  { id: "AKTE", label: "Akta Kelahiran" },
  { id: "IJAZAH", label: "Ijazah / Surat Keterangan Lulus" },
];

function isUuid(value) {
  return UUID_REGEX.test(String(value || "").trim());
}

function bacaRingkasan() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(SESI_SUBMISSION);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (!isUuid(parsed.pendaftaranId)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
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

function cariBerkas(ringkasan, namaBerkas) {
  if (!Array.isArray(ringkasan?.berkas)) {
    return null;
  }

  return (
    ringkasan.berkas.find(
      (item) => String(item?.namaBerkas || "") === namaBerkas
    ) || null
  );
}

function RingkasanTidakTersedia({ basePath, idDariUrl, router }) {
  const idValid = isUuid(idDariUrl);

  return (
    <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <AlertCircle size={21} />
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Ringkasan pendaftaran tidak tersedia
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Browser ini tidak menyimpan konfirmasi pendaftaran
            yang dapat ditampilkan. Hal ini biasa terjadi jika
            halaman dibuka di tab/perangkat lain, browser
            dibersihkan, atau sesi sudah berakhir.
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Backend belum menyediakan endpoint untuk membaca
            kembali data pendaftaran, sehingga halaman ini
            tidak menampilkan data yang tidak dapat
            diverifikasi. Hubungi panitia PPDB sekolah untuk
            memastikan status pendaftaran Anda.
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        {idValid && (
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
          <ArrowLeft size={15} />
          Kembali ke PPDB
        </button>
      </div>
    </div>
  );
}

export default function PpdbRingkasanPendaftaran({ basePath = "" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const idDariUrl = (searchParams.get("id") || "").trim();

  const [status, setStatus] = useState("memeriksa");
  const [ringkasan, setRingkasan] = useState(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      const data = bacaRingkasan();

      if (!data) {
        setRingkasan(null);
        setStatus("kosong");
        return;
      }

      if (idDariUrl && String(data.pendaftaranId) !== idDariUrl) {
        setRingkasan(null);
        setStatus("kosong");
        return;
      }

      setRingkasan(data);
      setStatus("tersedia");
    });
  }, [idDariUrl]);

  const dokumen = useMemo(
    () =>
      DOKUMEN_WAJIB.map((item) => {
        const berkas = cariBerkas(ringkasan, item.id);

        return {
          ...item,
          diterima: Boolean(berkas),
          waktu: formatWaktu(berkas?.diterimaPada),
        };
      }),
    [ringkasan]
  );

  const jumlahDiterima = dokumen.filter(
    (item) => item.diterima
  ).length;

  const semuaDokumenDiterima =
    jumlahDiterima === DOKUMEN_WAJIB.length;

  if (status === "memeriksa") {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={17} className="animate-spin" />
            Memeriksa konfirmasi pendaftaran...
          </div>
        </main>
      </div>
    );
  }

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
          description="Halaman ini merangkum konfirmasi yang dikembalikan server saat pendaftaran dan unggah dokumen dilakukan."
        />

        <div className="mt-6">
          {status === "kosong" ? (
            <RingkasanTidakTersedia
              basePath={basePath}
              idDariUrl={idDariUrl}
              router={router}
            />
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
                    Server mengonfirmasi penerimaan data
                    pendaftaran.
                    {semuaDokumenDiterima
                      ? " Ketiga dokumen wajib juga telah dikonfirmasi diterima server."
                      : ` Baru ${jumlahDiterima} dari ${DOKUMEN_WAJIB.length} dokumen wajib yang dikonfirmasi diterima server.`}
                  </p>

                  {ringkasan.nomorPendaftaran ? (
                    <div className="mt-6 w-full max-w-md rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left">
                      <p className="text-xs font-medium text-emerald-700">
                        Nomor Pendaftaran
                      </p>

                      <p className="mt-1 break-all text-lg font-bold text-emerald-900">
                        {ringkasan.nomorPendaftaran}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-emerald-700">
                        Simpan nomor ini. Nomor hanya
                        ditampilkan karena dikembalikan
                        oleh server saat pendaftaran.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-6 w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
                      <p className="text-xs font-medium text-amber-800">
                        Nomor pendaftaran belum tersedia
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-700">
                        Server tidak mengembalikan nomor
                        pendaftaran pada proses ini. Simpan
                        ID pendaftaran di bawah dan hubungi
                        panitia PPDB sekolah untuk
                        memperoleh nomor resmi.
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
                        {ringkasan.namaLengkap || "-"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Hash size={14} />

                        <p className="text-xs">ID Pendaftaran</p>
                      </div>

                      <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                        {ringkasan.pendaftaranId}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 w-full max-w-md rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Clock3 size={14} />

                      <p className="text-xs">
                        Waktu konfirmasi diterima browser
                      </p>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatWaktu(ringkasan.diterimaPada) ||
                        "Tidak tercatat"}
                    </p>
                  </div>

                  <div className="mt-6 w-full max-w-md text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Dokumen
                    </p>

                    <div className="mt-3 space-y-2">
                      {dokumen.map((item) => (
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
                      ))}
                    </div>
                  </div>

                  {!semuaDokumenDiterima && (
                    <div className="mt-6 w-full max-w-md rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
                      <p className="text-xs leading-5 text-amber-800">
                        Lengkapi unggahan dokumen yang belum
                        dikonfirmasi server. Dokumen yang sudah
                        berhasil tidak perlu diunggah ulang.
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
                              String(ringkasan.pendaftaranId)
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
                      Ringkasan ini berasal dari konfirmasi
                      server yang disimpan sementara di
                      browser. Halaman ini bukan pengganti
                      pengumuman resmi sekolah. Panitia PPDB
                      akan melakukan verifikasi data dan
                      dokumen sebelum menetapkan hasil
                      seleksi.
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
