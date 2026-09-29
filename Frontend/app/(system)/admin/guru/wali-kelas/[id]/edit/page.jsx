"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../../../../components/Header";
import Sidebar from "../../../../../components/Sidebar";
import {
  ArrowLeft,
  UserCheck,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
  Hash,
  Phone,
  Mail,
  Users,
  School,
  Info,
} from "lucide-react";

/**
 * app/admin/guru/wali-kelas/[id]/edit/page.jsx
 *
 * Halaman Edit Wali Kelas — form yang sama strukturnya dengan halaman
 * Tambah, tapi terisi otomatis dari data wali kelas berdasarkan [id] di URL.
 *
 * CATATAN DATA:
 * MOCK_WALIKELAS di sini masih salinan dummy yang sama dengan halaman
 * daftar & detail, supaya halaman ini bisa langsung dibuka lewat URL.
 * Begitu backend API tersedia:
 * - ganti pengambilan data awal dengan fetch (mis. getWaliKelasById(id))
 * - ganti handleSubmit supaya memanggil updateWaliKelas(id, payload)
 */

const MOCK_WALIKELAS = [
  {
    id: 1,
    kelas: "7A",
    jenjang: "VII",
    waliKelas: "Siti Rahayu, S.Pd",
    nip: "198501152010012001",
    telp: "0812-3456-7890",
    email: "sarah.amelia@smartschool.sch.id",
    jumlahSiswa: 32,
    tahunAjaran: "2025/2026",
    status: "aktif",
    siswa: ["Alya Ramadhani", "Bunga Citra Lestari", "Cahyo Nugroho", "Dimas Prasetyo"],
  },
  {
    id: 2,
    kelas: "7B",
    jenjang: "VII",
    waliKelas: "Andi Prasetyo, S.Pd",
    nip: "198712052012011002",
    telp: "0857-1122-3344",
    email: "andi.prasetyo@smartschool.sch.id",
    jumlahSiswa: 30,
    tahunAjaran: "2025/2026",
    status: "aktif",
    siswa: ["Eka Wulandari", "Fajar Setiawan", "Gilang Ramadhan", "Hana Permatasari"],
  },
  {
    id: 3,
    kelas: "8A",
    jenjang: "VIII",
    waliKelas: "Dewi Anggraini, S.Si",
    nip: "199002202015022004",
    telp: "0821-9988-7766",
    email: "dewi.anggraini@smartschool.sch.id",
    jumlahSiswa: 31,
    tahunAjaran: "2025/2026",
    status: "aktif",
    siswa: ["Indra Kusuma", "Julia Anggraeni", "Krisna Aditya", "Larasati Dewi"],
  },
  {
    id: 4,
    kelas: "8B",
    jenjang: "VIII",
    waliKelas: "Nina Kartika, S.Sn",
    nip: "199105182018022005",
    telp: "0878-5566-7788",
    email: "nina.kartika@smartschool.sch.id",
    jumlahSiswa: 29,
    tahunAjaran: "2025/2026",
    status: "aktif",
    siswa: ["Muhammad Fadli", "Naila Zahra", "Oka Wijaya", "Putri Ayuningtyas"],
  },
  {
    id: 5,
    kelas: "9A",
    jenjang: "IX",
    waliKelas: "Budi Santoso, S.Pd",
    nip: "197803102005011003",
    telp: "0813-2233-4455",
    email: "budi.santoso@smartschool.sch.id",
    jumlahSiswa: 28,
    tahunAjaran: "2025/2026",
    status: "aktif",
    siswa: ["Reza Firmansyah", "Salsabila Putri", "Taufik Hidayat", "Umi Kalsum"],
  },
  {
    id: 6,
    kelas: "9B",
    jenjang: "IX",
    waliKelas: "Rudi Hartono, S.Pd",
    nip: "198309252008011006",
    telp: "0896-4433-2211",
    email: "rudi.hartono@smartschool.sch.id",
    jumlahSiswa: 27,
    tahunAjaran: "2024/2025",
    status: "nonaktif",
    siswa: ["Vino Bastian", "Wulan Sari", "Yoga Pratama", "Zahra Aulia"],
  },
];

const JENJANG_LIST = ["VII", "VIII", "IX"];

function getInitials(nama) {
  return nama
    .replace(/,.*/, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function EditWaliKelasPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const original = useMemo(() => MOCK_WALIKELAS.find((w) => String(w.id) === id) || null, [id]);

  const [form, setForm] = useState({
    kelas: "",
    jenjang: "VII",
    waliKelas: "",
    nip: "",
    telp: "",
    email: "",
    jumlahSiswa: "",
    tahunAjaran: "",
    status: "aktif",
  });

  // Isi form begitu data ditemukan (mis. hasil "fetch" berdasarkan id).
  useEffect(() => {
    if (original) {
      setForm({
        kelas: original.kelas,
        jenjang: original.jenjang,
        waliKelas: original.waliKelas,
        nip: original.nip,
        telp: original.telp === "-" ? "" : original.telp,
        email: original.email === "-" ? "" : original.email,
        jumlahSiswa: String(original.jumlahSiswa ?? ""),
        tahunAjaran: original.tahunAjaran,
        status: original.status,
      });
    }
  }, [original]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.kelas.trim() || !form.waliKelas.trim() || !form.nip.trim()) {
      setError("Kelas, nama wali kelas, dan NIP wajib diisi.");
      return;
    }

    const payload = {
      id,
      kelas: form.kelas.trim(),
      jenjang: form.jenjang,
      waliKelas: form.waliKelas.trim(),
      nip: form.nip.trim(),
      telp: form.telp.trim() || "-",
      email: form.email.trim() || "-",
      jumlahSiswa: Number(form.jumlahSiswa) || 0,
      tahunAjaran: form.tahunAjaran.trim() || "2025/2026",
      status: form.status,
    };

    try {
      setSaving(true);
      setError("");

      // TODO: ganti dengan panggilan API sesungguhnya, contoh:
      // const response = await updateWaliKelas(id, payload);
      console.log("Update wali kelas:", payload);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuccess(true);

      setTimeout(() => {
        router.push(`/admin/guru/wali-kelas/${id}`);
      }, 900);
    } catch (err) {
      console.error("Error update wali kelas:", err);
      setError(err?.message || "Gagal menyimpan perubahan wali kelas.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar
        active="guruWaliKelas"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
        role="admin"
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          toggleSidebar={toggleSidebar}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* HEADER */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push(`/admin/guru/wali-kelas/${id}`)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
                title="Kembali ke detail wali kelas"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#155DFC] to-[#0d47c9] text-white shadow-lg shadow-slate-900/10 shrink-0">
                <UserCheck size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">Ubah Wali Kelas</h1>
                <p className="text-sm text-slate-500">
                  Perbarui data penugasan wali kelas{original ? ` untuk kelas ${original.kelas}` : ""}.
                </p>
              </div>
            </div>

            {/* NOT FOUND */}
            {!original && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50">
                <AlertCircle size={20} className="text-rose-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-rose-800">Data wali kelas tidak ditemukan</p>
                  <p className="text-sm text-rose-700 mt-1">
                    Wali kelas dengan id "{id}" tidak ada atau sudah dihapus.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/admin/guru/wali-kelas")}
                  className="text-sm font-medium text-rose-700 hover:text-rose-900"
                >
                  Kembali ke daftar
                </button>
              </div>
            )}

            {original && (
              <>
                {/* SUCCESS */}
                {success && (
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50">
                    <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
                    <p className="text-sm font-medium text-emerald-800">
                      Perubahan berhasil disimpan. Mengalihkan...
                    </p>
                  </div>
                )}

                {/* ERROR */}
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl border border-rose-200 bg-rose-50">
                    <AlertCircle size={20} className="text-rose-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-rose-800">Gagal menyimpan perubahan</p>
                      <p className="text-sm text-rose-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* KONTEN: FORM + PANEL PRATINJAU */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  {/* FORM */}
                  <form
                    onSubmit={handleSubmit}
                    className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
                      <h2 className="text-sm font-semibold text-slate-700">Kelas & Wali Kelas</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Perbarui data kelas dan guru yang ditugaskan.</p>
                    </div>

                    <div className="p-6 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* KELAS */}
                        <div>
                          <label
                            htmlFor="kelas"
                            className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"
                          >
                            <School size={14} className="text-slate-400" />
                            Kelas
                            <span className="text-rose-500">*</span>
                          </label>
                          <input
                            id="kelas"
                            type="text"
                            value={form.kelas}
                            onChange={handleChange("kelas")}
                            placeholder="Contoh: 7C"
                            disabled={saving}
                            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                          />
                        </div>

                        {/* JENJANG */}
                        <div>
                          <label
                            htmlFor="jenjang"
                            className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"
                          >
                            <School size={14} className="text-slate-400" />
                            Jenjang
                          </label>
                          <select
                            id="jenjang"
                            value={form.jenjang}
                            onChange={handleChange("jenjang")}
                            disabled={saving}
                            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 bg-white text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                          >
                            {JENJANG_LIST.map((j) => (
                              <option key={j} value={j}>
                                Kelas {j}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* NAMA WALI KELAS */}
                      <div>
                        <label
                          htmlFor="waliKelas"
                          className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"
                        >
                          <User size={14} className="text-slate-400" />
                          Nama Wali Kelas
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="waliKelas"
                          type="text"
                          value={form.waliKelas}
                          onChange={handleChange("waliKelas")}
                          placeholder="Contoh: Rina Marlina, S.Pd"
                          disabled={saving}
                          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </div>

                      {/* NIP */}
                      <div>
                        <label
                          htmlFor="nip"
                          className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"
                        >
                          <Hash size={14} className="text-slate-400" />
                          NIP
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="nip"
                          type="text"
                          value={form.nip}
                          onChange={handleChange("nip")}
                          placeholder="Contoh: 199001012015011001"
                          disabled={saving}
                          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 text-slate-800 font-mono disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </div>

                      {/* STATUS */}
                      <div>
                        <label
                          htmlFor="status"
                          className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"
                        >
                          <UserCheck size={14} className="text-slate-400" />
                          Status
                        </label>
                        <select
                          id="status"
                          value={form.status}
                          onChange={handleChange("status")}
                          disabled={saving}
                          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 bg-white text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                        >
                          <option value="aktif">Aktif</option>
                          <option value="nonaktif">Nonaktif</option>
                        </select>
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-b border-slate-100 bg-slate-50/60">
                      <h2 className="text-sm font-semibold text-slate-700">Kontak & Data Tambahan</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Perbarui informasi kontak dan jumlah siswa.</p>
                    </div>

                    <div className="p-6 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* TELEPON */}
                        <div>
                          <label
                            htmlFor="telp"
                            className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"
                          >
                            <Phone size={14} className="text-slate-400" />
                            No. Telepon
                          </label>
                          <input
                            id="telp"
                            type="text"
                            value={form.telp}
                            onChange={handleChange("telp")}
                            placeholder="0812-xxxx-xxxx"
                            disabled={saving}
                            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                          />
                        </div>

                        {/* JUMLAH SISWA */}
                        <div>
                          <label
                            htmlFor="jumlahSiswa"
                            className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"
                          >
                            <Users size={14} className="text-slate-400" />
                            Jumlah Siswa
                          </label>
                          <input
                            id="jumlahSiswa"
                            type="number"
                            min="0"
                            value={form.jumlahSiswa}
                            onChange={handleChange("jumlahSiswa")}
                            placeholder="0"
                            disabled={saving}
                            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                          />
                        </div>
                      </div>

                      {/* EMAIL */}
                      <div>
                        <label
                          htmlFor="email"
                          className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"
                        >
                          <Mail size={14} className="text-slate-400" />
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange("email")}
                          placeholder="nama@smartschool.sch.id"
                          disabled={saving}
                          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </div>

                      {/* TAHUN AJARAN */}
                      <div>
                        <label
                          htmlFor="tahunAjaran"
                          className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"
                        >
                          <School size={14} className="text-slate-400" />
                          Tahun Ajaran
                        </label>
                        <input
                          id="tahunAjaran"
                          type="text"
                          value={form.tahunAjaran}
                          onChange={handleChange("tahunAjaran")}
                          placeholder="2025/2026"
                          disabled={saving}
                          className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#155DFC]/25 focus:border-[#155DFC]/50 text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#155DFC] hover:bg-[#0d47c9] text-white rounded-xl transition-all shadow-sm font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader2 size={17} className="animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save size={17} />
                            Simpan Perubahan
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => router.push(`/admin/guru/wali-kelas/${id}`)}
                        disabled={saving}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all font-medium text-sm disabled:opacity-60"
                      >
                        Batal
                      </button>
                    </div>
                  </form>

                  {/* PANEL KANAN: PREVIEW + TIPS */}
                  <div className="space-y-6">
                    {/* PREVIEW CARD */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                        <h2 className="text-sm font-semibold text-slate-700">Pratinjau</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Tampilan data ini setelah disimpan.</p>
                      </div>

                      <div className="bg-gradient-to-r from-[#155DFC] to-[#0d47c9] px-5 py-5 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {form.waliKelas.trim() ? getInitials(form.waliKelas) : "WK"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white/80 text-xs">Wali Kelas {form.kelas.trim() || "-"}</p>
                          <p className="font-bold text-white text-sm leading-tight truncate">
                            {form.waliKelas.trim() || "Nama wali kelas"}
                          </p>
                        </div>
                      </div>

                      <div className="p-5 space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-xs">NIP</span>
                          <span className="font-mono text-xs text-slate-700">{form.nip.trim() || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-xs">Jenjang</span>
                          <span className="text-slate-700 font-medium">Kelas {form.jenjang}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-xs">Jumlah Siswa</span>
                          <span className="text-slate-700 font-medium">{form.jumlahSiswa || 0} siswa</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-xs">Status</span>
                          <span
                            className={`text-xs font-semibold ${
                              form.status === "aktif" ? "text-emerald-600" : "text-slate-500"
                            }`}
                          >
                            {form.status === "aktif" ? "Aktif" : "Nonaktif"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* TIPS / INFO */}
                    <div className="bg-[#eaf1ff] rounded-xl border border-[#155DFC]/15 p-5">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Info size={16} className="text-[#155DFC]" />
                        <h2 className="text-sm font-semibold text-[#0d47c9]">Tips</h2>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
                        <li>Ubah status jadi "Nonaktif" kalau wali kelas ini sedang cuti/berhenti.</li>
                        <li>Pastikan email & telepon selalu yang terbaru untuk kebutuhan komunikasi orang tua.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}