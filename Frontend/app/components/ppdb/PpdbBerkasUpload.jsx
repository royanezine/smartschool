"use client";

import {
  CheckCircle2,
  FileText,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { useState } from "react";

import { uploadBerkasPpdb } from "../../services/ppdb.services";

const jenisBerkas = [
  {
    kode: "KK",
    label: "Kartu Keluarga",
  },
  {
    kode: "AKTE",
    label: "Akta Kelahiran",
  },
  {
    kode: "IJAZAH",
    label: "Ijazah",
  },
];

export default function PpdbBerkasUpload({
  pendaftaranId,
  onSuccess,
}) {
  const [files, setFiles] =
    useState({});

  const [loading, setLoading] =
    useState({});

  const [uploaded, setUploaded] =
    useState({});

  const [error, setError] =
    useState("");

  async function handleUpload(
    jenis,
    file
  ) {
    if (!file) return;

    try {
      setError("");

      setLoading((prev) => ({
        ...prev,
        [jenis]: true,
      }));

      await uploadBerkasPpdb(
        pendaftaranId,
        file,
        jenis
      );

      setFiles((prev) => ({
        ...prev,
        [jenis]: file,
      }));

      setUploaded((prev) => ({
        ...prev,
        [jenis]: true,
      }));

      if (onSuccess) {
        onSuccess(jenis);
      }
    } catch (err) {
      console.error(
        "Upload berkas PPDB:",
        err
      );

      setError(
        err?.message ||
          `Gagal mengupload ${jenis}.`
      );
    } finally {
      setLoading((prev) => ({
        ...prev,
        [jenis]: false,
      }));
    }
  }

  function removeFile(jenis) {
    setFiles((prev) => {
      const next = {
        ...prev,
      };

      delete next[jenis];

      return next;
    });

    setUploaded((prev) => ({
      ...prev,
      [jenis]: false,
    }));
  }

  return (
    <div className="space-y-5">

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {jenisBerkas.map(
          (item) => {
            const file =
              files[item.kode];

            const isLoading =
              loading[item.kode];

            const isUploaded =
              uploaded[item.kode];

            return (
              <div
                key={item.kode}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={21} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {item.label}
                      </h3>

                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                        {item.kode}
                      </span>

                      {isUploaded && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                          <CheckCircle2 size={12} />
                          Terupload
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      Format PDF, JPG, atau PNG.
                    </p>

                    {file ? (
                      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">

                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-slate-700">
                            {file.name}
                          </p>

                          <p className="text-[11px] text-slate-400">
                            {(
                              file.size /
                              1024 /
                              1024
                            ).toFixed(
                              2
                            )}{" "}
                            MB
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFile(
                              item.kode
                            )
                          }
                          disabled={isLoading}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                        <Upload size={16} />

                        Pilih File

                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          disabled={isLoading}
                          onChange={(
                            event
                          ) =>
                            handleUpload(
                              item.kode,
                              event.target
                                .files?.[0]
                            )
                          }
                        />
                      </label>
                    )}

                    {isLoading && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
                        <Loader2
                          size={14}
                          className="animate-spin"
                        />
                        Mengupload...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}