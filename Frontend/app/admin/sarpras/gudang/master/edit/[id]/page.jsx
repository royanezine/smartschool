"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Boxes,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Loader2,
  Building2,
  Activity,
  Database,
} from "lucide-react";

import Header from "../../../../../../components/Header";
import Sidebar from "../../../../../../components/Sidebar";

import {
  getGudang,
  updateGudang,
} from "../../../../../../../services/sarpras.service";

function getResponseData(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.result)) return response.result;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.result?.data)) return response.result.data;

  return [];
}

export default function EditGudangPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    nama: "",
    lokasi: "",
    status: "aktif",
  });

  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    if (!id) return;

    loadGudang();
  }, [id]);

  const loadGudang = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getGudang();

      const list = getResponseData(response);

      const gudang = list.find(
        (item) => String(item?.id) === String(id)
      );

      if (!gudang) {
        setError("Data gudang tidak ditemukan.");
        return;
      }

      setForm({
        nama: gudang?.nama || "",
        lokasi: gudang?.lokasi || "",
        status: gudang?.status || "aktif",
      });
    } catch (err) {
      console.error("Gagal mengambil data gudang:", err);

      setError(
        err?.message || "Gagal mengambil data gudang."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     HANDLE CHANGE
  ========================================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.nama.trim()) {
      setError("Nama gudang wajib diisi.");
      return;
    }

    if (form.nama.trim().length < 3) {
      setError("Nama gudang minimal 3 karakter.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        nama: form.nama.trim(),
        lokasi: form.lokasi.trim() || null,
        status: form.status || "aktif",
      };

      await updateGudang(id, payload);

      setSuccess("Data gudang berhasil diperbarui.");

      setTimeout(() => {
        router.push("/admin/sarpras/gudang/master");
        router.refresh();
      }, 900);
    } catch (err) {
      console.error("Gagal memperbarui gudang:", err);

      setError(
        err?.message ||
          "Gagal memperbarui data gudang."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     CANCEL
  ========================================================= */

  const handleCancel = () => {
    router.push("/admin/sarpras/gudang/master");
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">
        {/* SIDEBAR */}
        <div className="shrink-0">
          <Sidebar
            active="sarpras"
            setActive={() => {}}
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </div>

        {/* CONTENT */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0">
            <Header
              toggleSidebar={() =>
                setCollapsed((prev) => !prev)
              }
              notifications={[]}
              user={{
                name: "Admin Sekolah",
                email: "admin@smartschool.com",
                avatar: "AD",
              }}
            />
          </div>

          <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Loader2
                    size={27}
                    strokeWidth={2}
                    className="animate-spin"
                  />
                </div>

                <h2 className="mt-5 text-base font-bold text-slate-900">
                  Memuat Data Gudang
                </h2>

                <p className="mt-1.5 text-sm text-slate-500">
                  Mengambil informasi gudang...
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <div className="shrink-0">
        <Sidebar
          active="sarpras"
          setActive={() => {}}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}

        <div className="shrink-0">
          <Header
            toggleSidebar={() =>
              setCollapsed((prev) => !prev)
            }
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        {/* ===================================================
            PAGE
        =================================================== */}

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full p-4 sm:p-5 lg:p-7 xl:p-8">
            <div className="mx-auto w-full max-w-[1250px]">

              {/* =================================================
                  BREADCRUMB / BACK
              ================================================= */}

              <button
                type="button"
                onClick={handleCancel}
                className="group mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-500 transition-all hover:bg-white hover:text-blue-600"
              >
                <ArrowLeft
                  size={17}
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />

                Kembali ke Daftar Gudang
              </button>

              {/* =================================================
                  PAGE HEADER
              ================================================= */}

              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.18)] sm:h-14 sm:w-14">
                    <Boxes
                      size={25}
                      strokeWidth={1.9}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                        Sarana & Prasarana
                      </p>

                      <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600">
                        EDIT DATA
                      </span>
                    </div>

                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
                      Edit Gudang
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                      Perbarui informasi gudang yang tersimpan
                      di sistem.
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  ALERT ERROR
              ================================================= */}

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
                    <AlertCircle size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-rose-900">
                      Terjadi Kesalahan
                    </p>

                    <p className="mt-1 text-sm leading-5 text-rose-700">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    className="rounded-lg p-1.5 text-rose-400 transition hover:bg-rose-100 hover:text-rose-700"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              {/* =================================================
                  SUCCESS
              ================================================= */}

              {success && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-emerald-900">
                      Berhasil
                    </p>

                    <p className="mt-1 text-sm text-emerald-700">
                      {success}
                    </p>
                  </div>
                </div>
              )}

              {/* =================================================
                  MAIN GRID
              ================================================= */}

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">

                {/* =================================================
                    LEFT - FORM
                ================================================= */}

                <form
                  onSubmit={handleSubmit}
                  className="min-w-0"
                >
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)]">

                    {/* FORM HEADER */}

                    <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Database
                              size={19}
                              strokeWidth={1.9}
                            />
                          </div>

                          <div>
                            <h2 className="text-sm font-bold text-slate-900">
                              Informasi Gudang
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Perbarui data dasar gudang.
                            </p>
                          </div>
                        </div>

                        <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold text-slate-500 sm:inline-flex">
                          ID #{id}
                        </span>
                      </div>
                    </div>

                    {/* FORM BODY */}

                    <div className="space-y-6 p-5 sm:p-7">

                      {/* =================================================
                          NAMA
                      ================================================= */}

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label
                            htmlFor="nama"
                            className="text-sm font-semibold text-slate-700"
                          >
                            Nama Gudang
                            <span className="ml-1 text-rose-500">
                              *
                            </span>
                          </label>

                          <span className="text-[11px] text-slate-400">
                            {form.nama.length}/100
                          </span>
                        </div>

                        <div className="relative">
                          <Boxes
                            size={18}
                            strokeWidth={1.8}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            id="nama"
                            name="nama"
                            type="text"
                            value={form.nama}
                            onChange={handleChange}
                            disabled={saving}
                            maxLength={100}
                            placeholder="Contoh: Gudang Sarpras Utama"
                            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 caret-blue-600 outline-none transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </div>

                        <p className="mt-1.5 text-xs text-slate-400">
                          Gunakan nama yang mudah dikenali.
                        </p>
                      </div>

                      {/* =================================================
                          LOKASI
                      ================================================= */}

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label
                            htmlFor="lokasi"
                            className="text-sm font-semibold text-slate-700"
                          >
                            Lokasi Gudang
                          </label>

                          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                            Opsional
                          </span>
                        </div>

                        <div className="relative">
                          <MapPin
                            size={18}
                            strokeWidth={1.8}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <input
                            id="lokasi"
                            name="lokasi"
                            type="text"
                            value={form.lokasi}
                            onChange={handleChange}
                            disabled={saving}
                            maxLength={255}
                            placeholder="Contoh: Gedung A Lantai 1"
                            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-medium text-slate-900 caret-blue-600 outline-none transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </div>

                        <p className="mt-1.5 text-xs text-slate-400">
                          Masukkan lokasi fisik gudang di
                          lingkungan sekolah.
                        </p>
                      </div>

                      {/* =================================================
                          STATUS
                      ================================================= */}

                      <div>
                        <label
                          htmlFor="status"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Status
                          <span className="ml-1 text-rose-500">
                            *
                          </span>
                        </label>

                        <div className="relative">
                          <Activity
                            size={18}
                            strokeWidth={1.8}
                            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                          />

                          <select
                            id="status"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            disabled={saving}
                            className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm font-medium text-slate-900 outline-none transition-all hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            style={{
                              colorScheme: "light",
                            }}
                          >
                            <option
                              value="aktif"
                              style={{ color: "#0f172a" }}
                            >
                              Aktif
                            </option>

                            <option
                              value="nonaktif"
                              style={{ color: "#0f172a" }}
                            >
                              Nonaktif
                            </option>
                          </select>

                          <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="m6 9 6 6 6-6" />
                            </svg>
                          </div>
                        </div>

                        <p className="mt-1.5 text-xs text-slate-400">
                          Gudang nonaktif tidak digunakan
                          untuk transaksi baru.
                        </p>
                      </div>

                      {/* =================================================
                          INFO
                      ================================================= */}

                      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                            <AlertCircle size={18} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-blue-900">
                              Informasi Pengelolaan
                            </p>

                            <p className="mt-1 text-xs leading-5 text-blue-700">
                              Perubahan data gudang akan
                              diterapkan pada data aset
                              yang terhubung dengan gudang
                              ini.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* =================================================
                        FORM FOOTER
                    ================================================= */}

                    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X size={17} />
                        Batal
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(37,99,235,0.20)] transition-all hover:bg-blue-700 hover:shadow-[0_9px_22px_rgba(37,99,235,0.28)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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
                    </div>
                  </div>
                </form>

                {/* =================================================
                    RIGHT - PREVIEW / SUMMARY CARD
                ================================================= */}

                <aside className="min-w-0">
                  <div className="sticky top-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)]">

                    {/* CARD HEADER */}

                    <div className="border-b border-slate-100 px-5 py-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                            <Building2
                              size={19}
                              strokeWidth={1.9}
                            />
                          </div>

                          <div>
                            <h2 className="text-sm font-bold text-slate-900">
                              Preview
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                              Ringkasan data gudang
                            </p>
                          </div>
                        </div>

                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            form.status === "aktif"
                              ? "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.10)]"
                              : "bg-slate-400 shadow-[0_0_0_4px_rgba(100,116,139,0.10)]"
                          }`}
                        />
                      </div>
                    </div>

                    {/* PREVIEW BODY */}

                    <div className="p-5">

                      {/* VISUAL */}

                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-5 text-white">
                        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10" />

                        <div className="pointer-events-none absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-white/5" />

                        <div className="relative">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
                            <Boxes
                              size={24}
                              strokeWidth={1.8}
                            />
                          </div>

                          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-100">
                            Gudang
                          </p>

                          <h3 className="mt-1 break-words text-lg font-bold leading-6">
                            {form.nama.trim() ||
                              "Nama Gudang"}
                          </h3>

                          <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-100">
                            <MapPin size={13} />

                            <span className="truncate">
                              {form.lokasi.trim() ||
                                "Lokasi belum diisi"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* DETAIL */}

                      <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/60">

                        {/* STATUS */}

                        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Activity
                              size={16}
                              className="text-slate-400"
                            />

                            <span className="text-xs font-medium text-slate-500">
                              Status
                            </span>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              form.status === "aktif"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                form.status === "aktif"
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }`}
                            />

                            {form.status === "aktif"
                              ? "Aktif"
                              : "Nonaktif"}
                          </span>
                        </div>

                        {/* LOKASI */}

                        <div className="flex items-start justify-between gap-4 px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <MapPin
                              size={16}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="text-xs font-medium text-slate-500">
                              Lokasi
                            </span>
                          </div>

                          <span className="max-w-[170px] break-words text-right text-xs font-semibold text-slate-700">
                            {form.lokasi.trim() ||
                              "Belum diisi"}
                          </span>
                        </div>

                        {/* ID */}

                        <div className="flex items-center justify-between gap-4 px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Database
                              size={16}
                              className="text-slate-400"
                            />

                            <span className="text-xs font-medium text-slate-500">
                              ID Gudang
                            </span>
                          </div>

                          <span className="max-w-[150px] truncate rounded-lg bg-white px-2 py-1 font-mono text-[10px] font-semibold text-slate-600 shadow-sm ring-1 ring-slate-100">
                            {id}
                          </span>
                        </div>
                      </div>

                      {/* TIP */}

                      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />

                          <p className="text-[11px] leading-5 text-slate-500">
                            Pastikan nama dan lokasi gudang
                            sudah sesuai sebelum menyimpan
                            perubahan.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CARD FOOTER */}

                    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3.5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <CheckCircle2
                          size={14}
                          className="text-emerald-500"
                        />

                        <span>
                          Preview diperbarui otomatis
                        </span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="mt-6 border-t border-slate-200/80 pt-5 text-center">
                <p className="text-xs text-slate-400">
                  © 2026 SmartSchool • Modul Sarana &
                  Prasarana
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}