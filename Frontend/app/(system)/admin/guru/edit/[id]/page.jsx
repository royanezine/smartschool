"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import {
  Edit, Save, ArrowLeft, User, Hash, Mail, Phone,
  CheckCircle, ChevronDown, X, Loader2, Clock3,
  MapPin, Calendar, Briefcase, BadgeCheck, Info,
  AlertCircle,
} from "lucide-react";

import { getUserById, updateUser } from "@/services/user.service";
import {
  getShiftKerja,
  assignUserShiftAndJabatan,
} from "@/services/shiftKerja.service";

const EMPTY_FORM = {
  namaLengkap: "",
  namaPengguna: "",
  email: "",
  nip: "",
  nuptk: "",
  jenisKelamin: "",
  tempatLahir: "",
  tanggalLahir: "",
  alamat: "",
  noTelepon: "",
  jabatan: "",
  golongan: "",
  shiftKerja: "",
  masterShiftId: "",
  status: "aktif",
};

export default function AdminGuruEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [shiftList, setShiftList] = useState([]);
  const [loadingShift, setLoadingShift] = useState(true);
  const [shiftError, setShiftError] = useState("");

  const toggleSidebar = () => setIsCollapsed((v) => !v);

  const fetchShift = useCallback(async () => {
    try {
      setLoadingShift(true);
      setShiftError("");

      const result = await getShiftKerja({
        page: 1,
        limit: 100,
        status: "aktif",
      });

      setShiftList(result.data ?? []);
    } catch (err) {
      console.error("[EditGuru] Gagal load shift:", err);
      setShiftList([]);
      setShiftError(err?.message || "Gagal mengambil master shift kerja.");
    } finally {
      setLoadingShift(false);
    }
  }, []);

  const fetchGuru = useCallback(async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getUserById(String(id));

      if (!response?.success || !response?.data) {
        throw new Error(response?.message || "Data guru tidak ditemukan.");
      }

      const item = response.data;

      const roleName = String(item.peran?.nama || "").toLowerCase();
      if (roleName && roleName !== "guru") {
        throw new Error("Pengguna ini bukan berstatus guru.");
      }

      const masterId =
        item.shiftKerjaId ?? item.shiftKerjaMaster?.id ?? "";

      setForm({
        namaLengkap: item.namaLengkap || "",
        namaPengguna: item.namaPengguna || "",
        email: item.email || "",
        nip: item.nip || "",
        nuptk: item.nuptk || "",
        jenisKelamin: item.jenisKelamin || "",
        tempatLahir: item.tempatLahir || "",
        tanggalLahir: item.tanggalLahir
          ? String(item.tanggalLahir).slice(0, 10)
          : "",
        alamat: item.alamat || "",
        noTelepon: item.noTelepon || "",
        jabatan: item.jabatan || "",
        golongan: item.golongan || "",
        shiftKerja: (item.shiftKerja || "").toLowerCase(),
        masterShiftId: String(masterId),
        status: item.status || "aktif",
      });
    } catch (err) {
      console.error("[EditGuru] Gagal load:", err);
      const msg = err?.message || "Gagal mengambil data guru.";

      if (
        msg.toLowerCase().includes("tidak ditemukan") ||
        msg.toLowerCase().includes("not found")
      ) {
        setNotFound(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGuru();
      fetchShift();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchGuru, fetchShift]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.namaLengkap.trim()) return "Nama lengkap wajib diisi.";
    if (!form.namaPengguna.trim()) return "Username wajib diisi.";
    if (!form.email.trim()) return "Email wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Format email tidak valid.";
    if (!form.shiftKerja) return "Shift kerja wajib dipilih (pagi / siang).";
    if (!["pagi", "siang"].includes(form.shiftKerja))
      return "Shift kerja hanya boleh pagi atau siang.";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccessMsg("");

      const payload = {
        namaLengkap: form.namaLengkap.trim(),
        namaPengguna: form.namaPengguna.trim(),
        email: form.email.trim(),
        nip: form.nip.trim() || null,
        nuptk: form.nuptk.trim() || null,
        jenisKelamin: form.jenisKelamin || null,
        tempatLahir: form.tempatLahir.trim() || null,
        tanggalLahir: form.tanggalLahir || null,
        alamat: form.alamat.trim() || null,
        noTelepon: form.noTelepon.trim() || null,
        jabatan: form.jabatan.trim() || null,
        golongan: form.golongan.trim() || null,
        shiftKerja: form.shiftKerja,
        status: form.status,
      };

      const response = await updateUser(String(id), payload);

      if (response?.success === false) {
        throw new Error(response?.message || "Gagal memperbarui data guru.");
      }

      if (form.masterShiftId) {
        try {
          await assignUserShiftAndJabatan({
            penggunaId: String(id),
            shiftKerjaId: form.masterShiftId,
          });
        } catch (assignErr) {
          console.error("[EditGuru] Gagal assign master shift:", assignErr);
          setError(
            "Profil tersimpan, tetapi gagal menghubungkan master shift: " +
              (assignErr?.message || "unknown error")
          );
        }
      }

      setSuccessMsg(response?.message || "Data guru berhasil diperbarui.");
      setTimeout(() => router.push("/admin/guru"), 1000);
    } catch (err) {
      console.error("[EditGuru] Gagal simpan:", err);
      setError(err?.message || "Gagal memperbarui data guru.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full theme-page overflow-hidden">
        <Sidebar active="guru" setActive={() => {}} collapsed={isCollapsed} setCollapsed={setIsCollapsed} />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header toggleSidebar={toggleSidebar} notifications={[]} user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AD" }} />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 size={36} className="animate-spin theme-primary-text mx-auto" />
              <p className="text-sm theme-text-secondary mt-3">Memuat data guru...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex h-screen w-full theme-page overflow-hidden">
        <Sidebar active="guru" setActive={() => {}} collapsed={isCollapsed} setCollapsed={setIsCollapsed} />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header toggleSidebar={toggleSidebar} notifications={[]} user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AD" }} />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="p-4 rounded-full theme-danger mx-auto w-20 h-20 flex items-center justify-center">
                <X size={40} />
              </div>
              <h2 className="text-xl font-semibold theme-text mt-4">Data Tidak Ditemukan</h2>
              <p className="text-sm theme-text-muted mt-1">Guru yang Anda cari tidak tersedia atau sudah dihapus.</p>
              <button onClick={() => router.push("/admin/guru")} className="mt-4 px-4 py-2 theme-primary rounded-lg">
                Kembali ke Daftar Guru
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full theme-page overflow-hidden">
      <Sidebar active="guru" setActive={() => {}} collapsed={isCollapsed} setCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header toggleSidebar={toggleSidebar} notifications={[]} user={{ name: "Admin Sekolah", email: "admin@smartschool.com", avatar: "AD" }} />

        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="theme-card rounded-2xl border theme-border shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.push("/admin/guru")} className="p-2 rounded-lg theme-text-muted theme-sidebar-hover hover:text-[var(--color-text)]" title="Kembali">
                    <ArrowLeft size={20} />
                  </button>
                  <div className="p-2 rounded-xl theme-warning shadow-md">
                    <Edit size={20} />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold theme-text">Edit Guru</h1>
                    <p className="text-sm theme-text-muted">Perbarui data guru</p>
                  </div>
                </div>
                <div className="text-xs theme-text-muted theme-card-soft px-3 py-1 rounded-full">
                  ID: {String(id).slice(0, 8)}...
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg theme-danger text-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span className="flex-1">{error}</span>
                  <button onClick={() => setError("")} className="text-xs underline">Tutup</button>
                </div>
              )}
              {successMsg && (
                <div className="flex items-start gap-2 p-3 rounded-lg theme-success text-sm">
                  <CheckCircle size={16} className="mt-0.5 shrink-0" />
                  <span className="flex-1">{successMsg}</span>
                </div>
              )}

              <div className="space-y-4">
                <Field label="Nama Lengkap" required icon={<User size={17} />}>
                  <input type="text" name="namaLengkap" value={form.namaLengkap} onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 text-sm theme-input border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]" />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Username" required icon={<BadgeCheck size={17} />}>
                    <input type="text" name="namaPengguna" value={form.namaPengguna} onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 text-sm theme-input border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]" />
                  </Field>
                  <Field label="Email" required icon={<Mail size={17} />}>
                    <input type="email" name="email" value={form.email} onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 text-sm theme-input border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]" />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="NIP" icon={<Hash size={17} />}>
                    <input type="text" name="nip" value={form.nip} onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 text-sm theme-input border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]" />
                  </Field>
                  <Field label="NUPTK" icon={<Hash size={17} />}>
                    <input type="text" name="nuptk" value={form.nuptk} onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 text-sm theme-input border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]" />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Jenis Kelamin" icon={<User size={17} />}>
                    <select name="jenisKelamin" value={form.jenisKelamin} onChange={handleChange}
                      className="w-full pl-10 pr-10 py-2.5 text-sm theme-input border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] appearance-none cursor-pointer">
                      <option value="">-- Pilih --</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    <ChevronDown size={17} className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-placeholder pointer-events-none" />
                  </Field>
                  <Field label="Tanggal Lahir" icon={<Calendar size={17} />}>
                    <input type="date" name="tanggalLahir" value={form.tanggalLahir} onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 text-sm theme-input border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]" />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Tempat Lahir" icon={<MapPin size={17} />}>
                    <input type="text" name="tempatLahir" value={form.tempatLahir} onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 text-sm theme-input border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]" />
                  </Field>
                  <Field label="Telepon" icon={<Phone size={17} />}>
                    <input type="text" name="noTelepon" value={form.noTelepon} onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 text-sm theme-input border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]" />
                  </Field>
                </div>

                <Field label="Alamat" icon={<MapPin size={17} />}>
                  <textarea name="alamat" value={form.alamat} onChange={handleChange} rows={2}
                    className="w-full pl-10 pr-3 py-2.5 text-sm theme-input border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] resize-none" />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Jabatan" icon={<Briefcase size={17} />}>
                    <input type="text" name="jabatan" value={form.jabatan} onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 text-sm theme-input border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]" />
                  </Field>
                  <Field label="Golongan" icon={<BadgeCheck size={17} />}>
                    <input type="text" name="golongan" value={form.golongan} onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2.5 text-sm theme-input border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]" />
                  </Field>
                </div>

                <div className="rounded-xl border theme-border theme-card-soft p-4 space-y-4">
                  <div className="flex items-start gap-2">
                    <Clock3 size={16} className="mt-0.5 theme-text-muted" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold theme-text">Shift Kerja</p>
                      <p className="text-xs theme-text-muted mt-0.5">
                        Shift wajib diisi (pagi / siang). Master shift bersifat opsional —
                        jika dipilih, guru akan dihubungkan ke master shift.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium theme-text-muted mb-1.5">
                        Shift Wajib <span className="text-[var(--color-danger)]">*</span>
                      </label>
                      <div className="relative">
                        <Clock3 size={17} className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder" />
                        <select
                          name="shiftKerja"
                          value={form.shiftKerja}
                          onChange={handleChange}
                          className="w-full pl-10 pr-10 py-2.5 text-sm theme-input border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] appearance-none cursor-pointer"
                        >
                          <option value="">-- Pilih Shift --</option>
                          <option value="pagi">Pagi</option>
                          <option value="siang">Siang</option>
                        </select>
                        <ChevronDown size={17} className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-placeholder pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium theme-text-muted mb-1.5">
                        Master Shift <span className="text-xs theme-text-muted">(opsional)</span>
                      </label>
                      <div className="relative">
                        <Info size={17} className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder" />
                        <select
                          name="masterShiftId"
                          value={form.masterShiftId}
                          onChange={handleChange}
                          disabled={loadingShift || !!shiftError}
                          className="w-full pl-10 pr-10 py-2.5 text-sm theme-input border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] appearance-none cursor-pointer disabled:opacity-60"
                        >
                          <option value="">
                            {loadingShift
                              ? "Memuat master shift..."
                              : shiftError
                                ? "Gagal memuat shift"
                                : "-- Tidak terhubung --"}
                          </option>
                          {shiftList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.nama}
                              {s.kode ? ` (${s.kode})` : ""} — {s.jamMasuk}-{s.jamKeluar}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={17} className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-placeholder pointer-events-none" />
                      </div>
                      {shiftError && (
                        <p className="text-[11px] mt-1 theme-danger">{shiftError}</p>
                      )}
                    </div>
                  </div>

                  {form.masterShiftId && (() => {
                    const selected = shiftList.find(
                      (s) => String(s.id) === String(form.masterShiftId)
                    );
                    if (!selected) return null;
                    return (
                      <div className="flex items-center gap-2 text-xs theme-text-muted theme-card border theme-border rounded-lg px-3 py-2">
                        <Clock3 size={13} />
                        <span className="font-medium theme-text-secondary">{selected.nama}</span>
                        <span>{selected.jamMasuk} - {selected.jamKeluar}</span>
                        {selected.toleransiTerlambatMenit > 0 && (
                          <span className="ml-auto">Toleransi {selected.toleransiTerlambatMenit} mnt</span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                <Field label="Status" icon={<CheckCircle size={17} />}>
                  <select name="status" value={form.status} onChange={handleChange}
                    className="w-full pl-10 pr-10 py-2.5 text-sm theme-input border theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] appearance-none cursor-pointer">
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                  <ChevronDown size={17} className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-placeholder pointer-events-none" />
                </Field>

                <div className="flex items-center gap-3 pt-4 border-t theme-border">
                  <button onClick={() => router.push("/admin/guru")} disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium theme-card theme-border border theme-text-secondary theme-sidebar-hover disabled:opacity-50">
                    Batal
                  </button>
                  <button onClick={handleSubmit} disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium theme-primary hover:shadow-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-60">
                    {saving ? (
                      <><Loader2 size={17} className="animate-spin" /> Menyimpan...</>
                    ) : (
                      <><Save size={17} /> Perbarui</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, required, icon, children }) {
  return (
    <div>
      <label className="block text-xs font-medium theme-text-muted mb-1.5">
        {label} {required && <span className="text-[var(--color-danger)]">*</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-placeholder">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}