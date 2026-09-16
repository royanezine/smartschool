"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  CheckCircle2,
  ArrowLeft,
  FileCheck2,
  Hash,
} from "lucide-react";

import PpdbHeader from "../../../components/ppdb/PpdbHeader";
import PpdbFooter from "../../../components/ppdb/PpdbFooter";
import PpdbStepper from "../../../components/ppdb/PpdbStepper";

export default function KirimPendaftaranPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [pendaftaranId, setPendaftaranId] =
    useState("");

  const [nomorPendaftaran, setNomorPendaftaran] =
    useState("");

  useEffect(() => {
    const queryId =
      searchParams.get("id");

    const sessionId =
      sessionStorage.getItem(
        "ppdb_pendaftaran_id"
      );

    const nomor =
      sessionStorage.getItem(
        "ppdb_nomor_pendaftaran"
      );

    const uploaded =
      sessionStorage.getItem(
        "ppdb_berkas_uploaded"
      );

    const id = queryId || sessionId;

    if (!id) {
      router.replace("/PPDB/daftar");
      return;
    }

    if (uploaded !== "true") {
      router.replace(
        `/PPDB/daftar/uploadBerkas?id=${encodeURIComponent(
          id
        )}`
      );
      return;
    }

    setPendaftaranId(id);

    if (nomor) {
      setNomorPendaftaran(nomor);
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        <button
          type="button"
          onClick={() =>
            router.push("/PPDB")
          }
          className="mb-5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft size={15} />
          Kembali ke PPDB
        </button>

        <PpdbHeader
          eyebrow="PPDB Online"
          title="Pendaftaran Berhasil Dikirim"
          description="Data pendaftaran dan dokumen persyaratan telah berhasil diterima oleh sistem."
        />

        <div className="mt-6">
          <PpdbStepper currentStep={2} />

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

            <div className="flex flex-col items-center text-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2
                  size={34}
                  className="text-emerald-500"
                />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-slate-800">
                Pendaftaran Berhasil
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Pendaftaran kamu telah berhasil dikirim
                beserta dokumen persyaratan. Simpan
                nomor pendaftaran untuk pengecekan
                status PPDB.
              </p>

              <div className="mt-6 w-full max-w-md space-y-3">

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                      <Hash
                        size={18}
                        className="text-blue-600"
                      />
                    </div>

                    <div className="text-left">
                      <p className="text-xs text-slate-500">
                        ID Pendaftaran
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                        {pendaftaranId || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                      <FileCheck2
                        size={18}
                        className="text-emerald-600"
                      />
                    </div>

                    <div className="text-left">
                      <p className="text-xs text-slate-500">
                        Nomor Pendaftaran
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {nomorPendaftaran || "-"}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-left">
                <p className="text-xs leading-5 text-blue-700">
                  Selanjutnya pihak sekolah akan melakukan
                  verifikasi terhadap data dan dokumen
                  yang telah kamu kirimkan.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/PPDB")
                }
                className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Kembali ke Halaman PPDB
              </button>

            </div>
          </div>
        </div>
      </main>

      <PpdbFooter />
    </div>
  );
}