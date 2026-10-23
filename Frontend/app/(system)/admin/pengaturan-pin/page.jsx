"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getToken, getStoredUser } from "@/lib/auth";
import {
  Search,
  ShieldCheck,
  Users,
  RefreshCw,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
  RotateCcw,
  X,
  GraduationCap,
} from "lucide-react";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { apiFetch } from "@/lib/api";
import { getKelasSayaDariAnggota } from "@/services/kelas.service";

const ENDPOINT_SISWA = "/api/siswa";

const ENDPOINT_RESET_PIN = (userId) =>
  `/api/auth/pin/admin-reset/${encodeURIComponent(userId)}`;


function unwrapResponse(response) {
  let result = response;

  for (let i = 0; i < 4; i += 1) {
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      return result;
    }

    if (Array.isArray(result.siswa)) return result;
    if (Array.isArray(result.items)) return result;
    if (Array.isArray(result.results)) return result;

    if (Array.isArray(result.data)) return result;

    if (
      result.data &&
      typeof result.data === "object" &&
      !Array.isArray(result.data)
    ) {
      result = result.data;
      continue;
    }

    break;
  }

  return result;
}

function ambilDaftarSiswa(response) {
  const result = unwrapResponse(response);

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.siswa)) return result.siswa;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.results)) return result.results;
  if (Array.isArray(result?.data)) return result.data;

  return [];
}

function formatNamaSiswa(siswa) {
  return (
    siswa?.namaLengkap ||
    siswa?.nama ||
    siswa?.name ||
    siswa?.namaPengguna ||
    "Nama tidak tersedia"
  );
}

function formatIdentifier(siswa) {
  return (
    siswa?.nis ||
    siswa?.nomorInduk ||
    siswa?.nisn ||
    siswa?.namaPengguna ||
    siswa?.username ||
    siswa?.email ||
    "-"
  );
}

function formatKelas(siswa) {
  return (
    siswa?.kelas?.nama ||
    siswa?.kelas?.namaKelas ||
    siswa?.kelas?.nama_kelas ||
    siswa?.namaKelas ||
    siswa?.kelasNama ||
    siswa?.kelas?.tingkatNama ||
    ""
  );
}

function statusPinSiswa(siswa) {
  const status =
    siswa?.pinConfigured ??
    siswa?.sudahAturPin ??
    siswa?.hasPin ??
    siswa?.memilikiPin;

  if (status === true || status === 1) return "Sudah diatur";
  if (status === false || status === 0) return "Belum diatur";

  return "Belum diketahui";
}

function pesanResponse(response, pesanDefault) {
  const result = unwrapResponse(response);

  return (
    result?.message ||
    response?.message ||
    pesanDefault
  );
}

function merupakanSiswa(siswa) {
  const role = String(
    siswa?.peran?.nama ||
      siswa?.role ||
      siswa?.namaPeran ||
      siswa?.peranNama ||
      ""
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return !role || role === "siswa";
}


export default function PengaturanPinPage() {
  const [siswa, setSiswa] = useState([]);
  const [pencarian, setPencarian] = useState("");

  const [loading, setLoading] = useState(true);
  const [memuatUlang, setMemuatUlang] = useState(false);
  const [sedangReset, setSedangReset] = useState("");

  const [siswaDipilih, setSiswaDipilih] = useState(null);
  const [error, setError] = useState("");
  const [sukses, setSukses] = useState("");

  const [roleDiizinkan, setRoleDiizinkan] = useState(false);
  const [siapPeriksaRole, setSiapPeriksaRole] = useState(false);


  const muatSiswa = useCallback(async (refresh = false) => {
    setError("");
    setSukses("");

    if (refresh) {
      setMemuatUlang(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await apiFetch(ENDPOINT_SISWA, {
        method: "GET",
      });

      const daftarSiswa = ambilDaftarSiswa(response);

      if (!Array.isArray(daftarSiswa)) {
        throw new Error("Format daftar siswa dari Backend tidak valid.");
      }

      const daftarKhususSiswa = daftarSiswa.filter(merupakanSiswa);

      const daftarDenganKelas = await Promise.all(
        daftarKhususSiswa.map(async (item) => {
          const siswaId = item?.id || item?.userId;

          const kelasTersedia = formatKelas(item);

          if (kelasTersedia || !siswaId) {
            return {
              ...item,
              kelasTampilan: kelasTersedia || "Belum terdaftar",
            };
          }

          try {
            const detailKelas = await getKelasSayaDariAnggota(
              siswaId
            );

            const namaKelas =
              detailKelas?.nama ||
              detailKelas?.namaKelas ||
              detailKelas?.kelas?.nama ||
              detailKelas?.kelas?.namaKelas ||
              "";

            return {
              ...item,
              kelasTampilan: namaKelas || "Belum terdaftar",
            };
          } catch (err) {
            console.warn(
              `Gagal mengambil kelas siswa ${siswaId}:`,
              err
            );

            return {
              ...item,
              kelasTampilan: "Belum tersedia",
            };
          }
        })
      );

      setSiswa(daftarDenganKelas);

      if (daftarDenganKelas.length === 0) {
        setError(
          "Respons Backend belum berisi data siswa. Periksa GET /api/siswa pada tab Network."
        );
      }
    } catch (err) {
      setSiswa([]);
      setError(
        err?.message ||
          "Gagal mengambil data siswa. Periksa koneksi Backend dan endpoint GET /api/siswa."
      );
    } finally {
      setLoading(false);
      setMemuatUlang(false);
    }
  }, []);


  useEffect(() => {
    try {
      const user = getStoredUser() || {};

      const token = getToken();

      const role = String(
        user?.role ||
          user?.peran?.nama ||
          user?.namaPeran ||
          ""
      )
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");

      setRoleDiizinkan(
        Boolean(token) &&
          [
            "admin_sekolah",
            "super_admin",
            "superadmin",
          ].includes(role)
      );
    } catch {
      setRoleDiizinkan(false);
    } finally {
      setSiapPeriksaRole(true);
    }
  }, []);

  useEffect(() => {
    if (siapPeriksaRole && roleDiizinkan) {
      muatSiswa();
    } else if (siapPeriksaRole) {
      setLoading(false);
    }
  }, [siapPeriksaRole, roleDiizinkan, muatSiswa]);


  const siswaTerfilter = useMemo(() => {
    const keyword = pencarian.trim().toLowerCase();

    if (!keyword) return siswa;

    return siswa.filter((item) => {
      const nama = formatNamaSiswa(item).toLowerCase();
      const identifier = formatIdentifier(item).toLowerCase();
      const email = String(item?.email || "").toLowerCase();
      const kelas = String(
        item?.kelasTampilan || formatKelas(item) || ""
      ).toLowerCase();

      return (
        nama.includes(keyword) ||
        identifier.includes(keyword) ||
        email.includes(keyword) ||
        kelas.includes(keyword)
      );
    });
  }, [siswa, pencarian]);


  const totalSudahAtur = siswa.filter(
    (item) => statusPinSiswa(item) === "Sudah diatur"
  ).length;

  const totalBelumAtur = siswa.filter(
    (item) => statusPinSiswa(item) === "Belum diatur"
  ).length;

  const totalBelumDiketahui = siswa.filter(
    (item) => statusPinSiswa(item) === "Belum diketahui"
  ).length;


  async function handleResetPin() {
    if (!siswaDipilih?.id && !siswaDipilih?.userId) {
      setError("ID akun siswa tidak ditemukan.");
      return;
    }

    const target = siswaDipilih;
    const userId = target.id || target.userId;

    setError("");
    setSukses("");
    setSedangReset(userId);

    try {
      const response = await apiFetch(
        ENDPOINT_RESET_PIN(userId),
        {
          method: "POST",
        }
      );

      setSukses(
        pesanResponse(
          response,
          "PIN siswa berhasil direset. Siswa perlu membuat PIN baru saat login berikutnya."
        )
      );

      setSiswaDipilih(null);

      setSiswa((daftar) =>
        daftar.map((item) =>
          String(item.id || item.userId) === String(userId)
            ? {
                ...item,
                pinConfigured: false,
                sudahAturPin: false,
                hasPin: false,
                memilikiPin: false,
              }
            : item
        )
      );

      await muatSiswa(true);
    } catch (err) {
      setError(
        err?.message ||
          "Reset PIN gagal. Pastikan token masih valid dan akun memiliki akses admin."
      );
    } finally {
      setSedangReset("");
    }
  }


  if (!siapPeriksaRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoaderCircle className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!roleDiizinkan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-amber-500" />

          <h1 className="text-xl font-semibold text-slate-900">
            Akses tidak tersedia
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Halaman ini hanya ditujukan untuk Admin Sekolah
            dan Super Admin. Silakan login menggunakan akun
            dengan hak akses yang sesuai.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-800">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-slate-200 bg-white">
          <Header />
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700">
                  <ShieldCheck className="h-4 w-4" />
                  Pengaturan keamanan
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Pengaturan PIN Siswa
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Kelola status PIN akun siswa dan bantu proses
                  pemulihan akses apabila siswa lupa PIN.
                </p>
              </div>

              <button
                type="button"
                onClick={() => muatSiswa(true)}
                disabled={loading || memuatUlang}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    memuatUlang ? "animate-spin" : ""
                  }`}
                />
                Muat ulang
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    Total siswa
                  </p>
                  <Users className="h-5 w-5 text-blue-600" />
                </div>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {siswa.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Akun siswa yang berhasil dimuat
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    PIN sudah diatur
                  </p>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {totalSudahAtur}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Siswa dengan PIN yang sudah dibuat
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    PIN belum diatur
                  </p>
                  <KeyRound className="h-5 w-5 text-amber-600" />
                </div>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {totalBelumAtur}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Siswa yang memerlukan setup PIN
                </p>
              </div>
            </div>

            {totalBelumDiketahui > 0 && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div>
                  <p className="font-medium">
                    Status PIN belum tersedia dari Backend
                  </p>
                  <p className="mt-1 text-xs leading-5">
                    {totalBelumDiketahui} siswa belum memiliki
                    informasi status PIN yang dapat dibaca.
                    Pastikan GET /api/siswa mengirim field
                    pinConfigured berdasarkan pinHash.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                <div className="flex-1">{error}</div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Tutup pesan error"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {sukses && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                <div className="flex-1">{sukses}</div>

                <button
                  type="button"
                  onClick={() => setSukses("")}
                  aria-label="Tutup pesan sukses"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Daftar akun siswa
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Lihat kelas, status PIN, dan reset PIN jika diperlukan.
                  </p>
                </div>

                <div className="relative w-full sm:max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={pencarian}
                    onChange={(event) =>
                      setPencarian(event.target.value)
                    }
                    placeholder="Cari nama, NIS, email, atau kelas..."
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">
                        Siswa
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        NIS / Username
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Kelas
                      </th>

                      <th className="px-5 py-4 font-semibold">
                        Status PIN
                      </th>

                      <th className="px-5 py-4 text-right font-semibold">
                        Tindakan
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-14 text-center">
                          <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-blue-600" />

                          <p className="mt-3 text-sm text-slate-500">
                            Memuat data siswa...
                          </p>
                        </td>
                      </tr>
                    ) : siswaTerfilter.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-14 text-center text-slate-500"
                        >
                          <Users className="mx-auto h-8 w-8 text-slate-300" />

                          <p className="mt-3 font-medium text-slate-700">
                            Data siswa tidak ditemukan
                          </p>

                          <p className="mt-1 text-xs">
                            Periksa respons Backend atau ubah kata pencarian.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      siswaTerfilter.map((item, index) => {
                        const status = statusPinSiswa(item);
                        const kelas =
                          item.kelasTampilan ||
                          formatKelas(item) ||
                          "Belum tersedia";

                        const idSiswa = item.id || item.userId;

                        return (
                          <tr
                            key={idSiswa || index}
                            className="transition hover:bg-slate-50/70"
                          >
                            <td className="px-5 py-4">
                              <div className="font-medium text-slate-900">
                                {formatNamaSiswa(item)}
                              </div>

                              <div className="mt-1 text-xs text-slate-500">
                                {item.email || "-"}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-slate-600">
                              {formatIdentifier(item)}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 text-slate-700">
                                <GraduationCap className="h-4 w-4 shrink-0 text-slate-400" />
                                <span>{kelas}</span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                  status === "Sudah diatur"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : status === "Belum diatur"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {status}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSiswaDipilih(item)}
                                disabled={
                                  !idSiswa ||
                                  sedangReset === idSiswa
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                                Reset PIN
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-200 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  Menampilkan {siswaTerfilter.length} dari {siswa.length} siswa
                </span>

                <span>Data mengikuti respons Backend</span>
              </div>
            </section>

            <div className="mb-6 mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />

              <div>
                <p className="text-sm font-medium text-blue-900">
                  Informasi keamanan
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-800">
                  Reset PIN akan menghapus PIN lama siswa. Saat login
                  berikutnya, siswa perlu membuat PIN baru. Halaman ini
                  tidak menampilkan PIN maupun hash PIN.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {siswaDipilih && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !sedangReset
            ) {
              setSiswaDipilih(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-pin-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <KeyRound className="h-5 w-5" />
            </div>

            <h2
              id="reset-pin-title"
              className="text-lg font-semibold text-slate-900"
            >
              Reset PIN siswa?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              PIN untuk akun{" "}
              <span className="font-semibold text-slate-800">
                {formatNamaSiswa(siswaDipilih)}
              </span>{" "}
              akan dihapus. Siswa harus membuat PIN baru ketika
              login berikutnya. Tindakan ini tidak bisa dibatalkan.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={Boolean(sedangReset)}
                onClick={() => setSiswaDipilih(null)}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={Boolean(sedangReset)}
                onClick={handleResetPin}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sedangReset ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    Ya, reset PIN
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}