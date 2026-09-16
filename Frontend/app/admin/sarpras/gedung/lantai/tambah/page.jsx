"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Layers3,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";

import {
  getGedung,
  createLantai,
} from "../../../../../../services/infrastruktur.service";

export default function TambahLantaiPage() {
  const router = useRouter();

  const [gedung, setGedung] = useState([]);
  const [loadingGedung, setLoadingGedung] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    gedungId: "",
    nama: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadGedung();
  }, []);

  async function loadGedung() {
    try {
      setLoadingGedung(true);
      setError("");

      const result = await getGedung();

      if (!result?.success) {
        throw new Error(
          result?.message || "Gagal mengambil data gedung."
        );
      }

      setGedung(result.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err?.message || "Gagal mengambil data gedung."
      );
    } finally {
      setLoadingGedung(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.gedungId) {
      setError("Silakan pilih gedung terlebih dahulu.");
      return;
    }

    if (!form.nama.trim()) {
      setError("Nama lantai wajib diisi.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const result = await createLantai({
        gedungId: form.gedungId,
        nama: form.nama.trim(),
      });

      if (!result?.success) {
        throw new Error(
          result?.message || "Gagal menambahkan lantai."
        );
      }

      setSuccess("Lantai berhasil ditambahkan.");

      setTimeout(() => {
        router.push("/admin/sarpras/gedung/lantai");
      }, 700);
    } catch (err) {
      console.error(err);

      setError(
        err?.message || "Terjadi kesalahan saat menyimpan data."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f8fafc]">
      {/* SIDEBAR */}
      <Sidebar
        active="sarpras"
        setActive={() => {}}
        collapsed={false}
        setCollapsed={() => {}}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <Header
          toggleSidebar={() => {}}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-4xl space-y-6">
              {/* HEADER SECTION */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <button
                    onClick={() =>
                      router.push("/admin/sarpras/gedung/lantai")
                    }
                    className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                  >
                    <ArrowLeft size={17} />
                    Kembali ke Data Lantai
                  </button>

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Tambah Lantai
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Tambahkan data lantai baru pada gedung sekolah.
                  </p>
                </div>
              </div>

              {/* ERROR & SUCCESS */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700">
                  <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleSubmit}>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
                  {/* FORM HEADER */}
                  <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-5 sm:px-8">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]">
                        <Layers3 size={22} />
                      </div>

                      <div>
                        <h2 className="text-base font-semibold text-slate-900">
                          Informasi Lantai
                        </h2>
                        <p className="text-sm text-slate-500">
                          Isi informasi lantai dengan lengkap.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FORM BODY */}
                  <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2">
                    {/* GEDUNG */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Gedung <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <Building2
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <select
                          name="gedungId"
                          value={form.gedungId}
                          onChange={handleChange}
                          disabled={loadingGedung || saving}
                          className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="">
                            {loadingGedung
                              ? "Memuat gedung..."
                              : "Pilih gedung"}
                          </option>

                          {gedung.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.nama}
                              {item.kode ? ` (${item.kode})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>

                      {!loadingGedung && gedung.length === 0 && (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
                          <AlertCircle size={13} />
                          Belum ada gedung. Tambahkan gedung terlebih dahulu.
                        </p>
                      )}
                    </div>

                    {/* NAMA LANTAI */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Nama Lantai <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <Layers3
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                          type="text"
                          name="nama"
                          value={form.nama}
                          onChange={handleChange}
                          disabled={saving}
                          placeholder="Contoh: Lantai 1"
                          maxLength={50}
                          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        Maksimal 50 karakter.
                      </p>
                    </div>
                  </div>

                  {/* FORM FOOTER */}
                  <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/80 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
                    <button
                      type="button"
                      onClick={() =>
                        router.push("/admin/sarpras/gedung/lantai")
                      }
                      disabled={saving}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-medium text-slate-600 shadow-[0_2px_5px_rgba(15,23,42,0.05)] transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        loadingGedung ||
                        gedung.length === 0
                      }
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(37,99,235,0.25)] transition-all hover:shadow-[0_9px_22px_rgba(37,99,235,0.35)] hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={17} className="animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save size={17} />
                          Simpan Lantai
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}