"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  QrCode,
  Camera,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";

import {
  createAbsensi,
  absenDenganLokasi,
  absenDenganBarcode,
  absenDenganFace,
} from "../../../../services/absensi.service";

export default function TambahAbsensiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const kelasIdDariUrl = searchParams.get("kelasId") || "";

  const [kelasId, setKelasId] = useState(kelasIdDariUrl);
  const [status, setStatus] = useState("hadir");
  const [metode, setMetode] = useState("lokasi");
  const [keterangan, setKeterangan] = useState("");

  const [barcodeData, setBarcodeData] = useState("");
  const [snapshot, setSnapshot] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!kelasId.trim()) {
      setError("ID kelas wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      let result;

      if (metode === "lokasi") {
        result = await absenDenganLokasi({
          kelasId: kelasId.trim(),
          status,
          keterangan,
        });
      } else if (metode === "barcode") {
        if (!barcodeData.trim()) {
          throw new Error("Data barcode/QR wajib diisi.");
        }

        result = await absenDenganBarcode({
          kelasId: kelasId.trim(),
          barcodeData: barcodeData.trim(),
          status,
          keterangan,
        });
      } else if (metode === "face") {
        if (!snapshot) {
          throw new Error("Foto wajah wajib disertakan.");
        }

        result = await absenDenganFace({
          kelasId: kelasId.trim(),
          snapshot,
          status,
          keterangan,
        });
      } else {
        result = await createAbsensi({
          kelasId: kelasId.trim(),
          status,
          metode: "manual",
          keterangan,
        });
      }

      setSuccess("Absensi berhasil dicatat.");

      setTimeout(() => {
        router.push(
          `/guru/absensi?kelasId=${encodeURIComponent(
            kelasId.trim()
          )}`
        );
      }, 1000);
    } catch (err) {
      setError(
        err?.message || "Gagal menyimpan absensi."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSnapshotChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setSnapshot(null);
      return;
    }

    setSnapshot(file);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Tambah Absensi
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Catat absensi menggunakan metode yang
                  tersedia pada sistem.
                </p>
              </div>
            </div>

            {/* Info BE */}
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex gap-3">
                <AlertCircle
                  className="mt-0.5 shrink-0 text-blue-600"
                  size={20}
                />

                <div>
                  <p className="font-semibold text-blue-900">
                    Informasi
                  </p>

                  <p className="mt-1 text-sm leading-6 text-blue-800">
                    Absensi akan dicatat untuk akun yang
                    sedang login. Data dikirim langsung ke
                    backend sesuai metode absensi yang
                    dipilih.
                  </p>
                </div>
              </div>
            </div>

            {/* Alert Error */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <p className="text-sm font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Alert Success */}
            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <p className="text-sm font-medium">
                  {success}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-6 py-5">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Data Absensi
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Lengkapi data berikut sebelum menyimpan
                    absensi.
                  </p>
                </div>

                <div className="space-y-6 p-6">
                  {/* Kelas */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      ID Kelas
                    </label>

                    <input
                      type="text"
                      value={kelasId}
                      onChange={(e) =>
                        setKelasId(e.target.value)
                      }
                      placeholder="Masukkan UUID kelas"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-2 text-xs text-gray-500">
                      BE membutuhkan{" "}
                      <code>kelasId</code> dalam format UUID.
                    </p>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Status Absensi
                    </label>

                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="hadir">
                        Hadir
                      </option>

                      <option value="izin">
                        Izin
                      </option>

                      <option value="sakit">
                        Sakit
                      </option>

                      <option value="alpha">
                        Alpha
                      </option>
                    </select>
                  </div>

                  {/* Metode */}
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-gray-700">
                      Metode Absensi
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {/* Lokasi */}
                      <button
                        type="button"
                        onClick={() =>
                          setMetode("lokasi")
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          metode === "lokasi"
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <MapPin size={20} />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              Lokasi
                            </p>

                            <p className="text-xs text-gray-500">
                              Menggunakan GPS
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Barcode */}
                      <button
                        type="button"
                        onClick={() =>
                          setMetode("barcode")
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          metode === "barcode"
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                            <QrCode size={20} />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              Barcode / QR
                            </p>

                            <p className="text-xs text-gray-500">
                              Menggunakan kode siswa
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Face */}
                      <button
                        type="button"
                        onClick={() =>
                          setMetode("face")
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          metode === "face"
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                            <Camera size={20} />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              Face Recognition
                            </p>

                            <p className="text-xs text-gray-500">
                              Menggunakan foto wajah
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* Manual */}
                      <button
                        type="button"
                        onClick={() =>
                          setMetode("manual")
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          metode === "manual"
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            <CheckCircle2 size={20} />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-900">
                              Manual
                            </p>

                            <p className="text-xs text-gray-500">
                              Pencatatan manual
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Barcode */}
                  {metode === "barcode" && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Data Barcode / QR
                      </label>

                      <input
                        type="text"
                        value={barcodeData}
                        onChange={(e) =>
                          setBarcodeData(
                            e.target.value
                          )
                        }
                        placeholder="Masukkan hasil scan barcode / QR"
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      />

                      <p className="mt-2 text-xs text-gray-500">
                        BE akan mencocokkan nilai ini dengan
                        NISN akun yang sedang login.
                      </p>
                    </div>
                  )}

                  {/* Face */}
                  {metode === "face" && (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Foto Wajah
                      </label>

                      <div className="rounded-xl border-2 border-dashed border-gray-300 p-5">
                        <input
                          type="file"
                          accept="image/*"
                          capture="user"
                          onChange={
                            handleSnapshotChange
                          }
                          className="block w-full text-sm text-gray-600"
                        />

                        {snapshot && (
                          <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                            Foto dipilih:{" "}
                            <span className="font-semibold">
                              {snapshot.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        File akan dikirim sebagai field{" "}
                        <code>snapshot</code> ke BE.
                      </p>
                    </div>
                  )}

                  {/* Keterangan */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Keterangan
                      <span className="ml-1 font-normal text-gray-400">
                        (opsional)
                      </span>
                    </label>

                    <textarea
                      value={keterangan}
                      onChange={(e) =>
                        setKeterangan(e.target.value)
                      }
                      rows={4}
                      placeholder="Tambahkan keterangan jika diperlukan..."
                      className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Simpan Absensi
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}