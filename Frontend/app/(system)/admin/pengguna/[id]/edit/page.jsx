"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import { getRoles } from "@/services/role.service";
import { getKategoriJabatan } from "@/services/kategoriJabatan.service";
import { getShiftKerja } from "@/services/shiftKerja.service";

import { getAuthPayload, normalizeRole } from "@/lib/auth";

import {
  getUserById,
  updateUser,
} from "@/services/user.service";

import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  Eye,
  Lightbulb,
  ShieldCheck,
  Clock,
  Briefcase,
} from "lucide-react";

const ROLE_LEVEL = {
  super_admin: 100,
  admin_yayasan: 80,
  admin_sekolah: 60,
  guru: 40,
  siswa: 20,
};

function canAssignRole(actorRole, targetRole) {
  const actor = normalizeRole(actorRole);
  const target = normalizeRole(targetRole);

  if (actor === "super_admin") return true;
  if (!target || target === "super_admin") return false;

  return (ROLE_LEVEL[actor] ?? 0) > (ROLE_LEVEL[target] ?? 0);
}

function isGuruRole(role) {
  return normalizeRole(role) === "guru";
}

function getUserData(result) {
  return result?.data?.data ?? result?.data ?? result;
}

function extractList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.data?.items)) return result.data.items;

  return [];
}

function getRoleLabel(role) {
  return (
    role?.namaTampilan ??
    role?.nama ??
    role?.name ??
    "Peran"
  );
}

function getShiftId(shift) {
  return String(
    shift?.id ??
    shift?.shiftKerjaId ??
    shift?.shift_kerja_id ??
    ""
  );
}

function getShiftName(shift) {
  if (typeof shift === "string") return shift;

  return (
    shift?.namaShift ??
    shift?.nama ??
    shift?.nama_shift ??
    shift?.jenisShift ??
    shift?.jenis_shift ??
    shift?.kode ??
    ""
  );
}

function getShiftTime(shift) {
  const mulai =
    shift?.jamMulai ??
    shift?.jam_mulai ??
    shift?.waktuMulai ??
    "";

  const selesai =
    shift?.jamSelesai ??
    shift?.jam_selesai ??
    shift?.waktuSelesai ??
    "";

  if (!mulai && !selesai) return "";

  return `${mulai || "-"} - ${selesai || "-"}`;
}

function normalizeShiftValue(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();

  if (normalized.includes("pagi")) return "pagi";
  if (normalized.includes("siang")) return "siang";

  return normalized;
}

function getCurrentShiftId(user) {
  return String(
    user?.shiftKerjaId ??
    user?.shift_kerja_id ??
    user?.shiftKerja?.id ??
    user?.shift?.id ??
    user?.shiftKerjaData?.id ??
    ""
  );
}

function getCurrentShiftName(user) {
  const shiftRelation =
    user?.shiftKerja &&
    typeof user.shiftKerja === "object"
      ? user.shiftKerja
      : user?.shift ??
        user?.shiftKerjaData ??
        null;

  if (shiftRelation) {
    return getShiftName(shiftRelation);
  }

  return (
    user?.shiftKerja ??
    user?.shift_kerja ??
    ""
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder = "",
  disabled = false,
}) {
  return (
    <label className="block space-y-2">
      <span className="theme-text-secondary text-sm font-semibold">
        {label}
        {required && (
          <span className="ml-1 text-[var(--color-danger)]">*</span>
        )}
      </span>

      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        className="theme-input w-full rounded-xl border px-4 py-2.5 text-sm font-medium outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options = [],
  required = false,
  placeholder = "Pilih opsi",
  disabled = false,
  hint = "",
}) {
  return (
    <label className="block space-y-2">
      <span className="theme-text-secondary text-sm font-semibold">
        {label}
        {required && (
          <span className="ml-1 text-[var(--color-danger)]">*</span>
        )}
      </span>

      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        disabled={disabled}
        className="theme-input w-full rounded-xl border px-4 py-2.5 text-sm font-medium outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {hint && (
        <p className="theme-text-muted text-xs leading-relaxed">
          {hint}
        </p>
      )}
    </label>
  );
}

export default function EditPenggunaPage() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [form, setForm] = useState({
    namaLengkap: "",
    namaPengguna: "",
    email: "",
    noTelepon: "",
    kategoriJabatanId: "",
    golongan: "",
    status: "aktif",
    peranId: "",
    shiftKerja: "",
    shiftKerjaId: "",
  });

  const [roleOptions, setRoleOptions] = useState([]);
  const [kategoriJabatanOptions, setKategoriJabatanOptions] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);

  const [roleHint, setRoleHint] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadingKategoriJabatan, setLoadingKategoriJabatan] = useState(false);
  const [loadingShift, setLoadingShift] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const loadData = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setError("ID pengguna tidak ditemukan.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const authPayload = getAuthPayload();

      const actorRole = normalizeRole(
        authPayload?.role ?? authPayload?.peran
      );

      const actorSekolahId =
        authPayload?.sekolahId ??
        authPayload?.sekolah?.id ??
        null;

      const userResult = await getUserById(id);
      const user = getUserData(userResult);

      if (!user?.id) {
        throw new Error("Data pengguna tidak ditemukan.");
      }

      const currentRoleId = String(
        user.peran?.id ??
        user.peranId ??
        user.roleId ??
        ""
      );

      const currentKategoriJabatanId = String(
        user.kategoriJabatan?.id ??
        user.kategoriJabatanId ??
        user.kategori_jabatan_id ??
        ""
      );

      const currentShiftId = getCurrentShiftId(user);
      const currentShiftName = getCurrentShiftName(user);

      const currentShiftValue =
        normalizeShiftValue(currentShiftName);

      setForm({
        namaLengkap: user.namaLengkap ?? "",
        namaPengguna: user.namaPengguna ?? "",
        email: user.email ?? "",
        noTelepon: user.noTelepon ?? "",
        kategoriJabatanId: currentKategoriJabatanId,
        golongan: user.golongan ?? "",
        status: user.status ?? "aktif",
        peranId: currentRoleId,
        shiftKerja: currentShiftValue,
        shiftKerjaId: currentShiftId,
      });

      let roles = [];

      try {
        const roleResult = await getRoles();
        roles = extractList(roleResult);
      } catch (roleError) {
        console.warn("Daftar peran tidak dapat dimuat:", roleError);
      }

      const mappedRoles = roles
        .filter((role) => role?.id)
        .filter((role) => {
          if (actorRole === "super_admin") {
            return true;
          }

          if (
            role.sekolahId &&
            actorSekolahId &&
            String(role.sekolahId) !== String(actorSekolahId)
          ) {
            return false;
          }

          return canAssignRole(
            actorRole,
            role.nama ?? role.name
          );
        })
        .map((role) => ({
          value: String(role.id),
          label: getRoleLabel(role),
          roleName: role.nama ?? role.name ?? "",
          disabled: false,
        }));

      if (
        currentRoleId &&
        !mappedRoles.some(
          (role) => role.value === currentRoleId
        )
      ) {
        mappedRoles.unshift({
          value: currentRoleId,
          label: getRoleLabel(user.peran),
          roleName: user.peran?.nama ?? "",
          disabled: true,
        });
      }

      setRoleOptions(mappedRoles);

      const currentRoleDisabled = mappedRoles.some(
        (role) =>
          role.value === currentRoleId &&
          role.disabled
      );

      if (actorRole === "super_admin") {
        setRoleHint("Sebagai super admin, seluruh role dapat dipilih.");
      } else if (currentRoleDisabled) {
        setRoleHint("Peran saat ini di luar kewenangan akun Anda sehingga tidak dapat diubah.");
      } else {
        setRoleHint("Pilihan dibatasi pada role yang boleh dikelola oleh akun Anda.");
      }

      setLoadingKategoriJabatan(true);

      try {
        const kategoriResult = await getKategoriJabatan({
          page: 1,
          limit: 100,
          status: "aktif",
        });

        const kategoriData = extractList(kategoriResult);

        const mappedKategori = kategoriData
          .filter((item) => {
            const isActive =
              String(item.status ?? "").toLowerCase() === "aktif";

            const isCurrent =
              String(item.id) === currentKategoriJabatanId;

            return isActive || isCurrent;
          })
          .map((item) => ({
            value: String(item.id),
            label: item.nama ?? item.namaKategori ?? "Kategori Jabatan",
            disabled:
              String(item.status ?? "").toLowerCase() !== "aktif",
          }));

        if (
          currentKategoriJabatanId &&
          !mappedKategori.some(
            (item) =>
              item.value === currentKategoriJabatanId
          ) &&
          user.kategoriJabatan?.nama
        ) {
          mappedKategori.unshift({
            value: currentKategoriJabatanId,
            label: `${user.kategoriJabatan.nama} (kategori saat ini)`,
            disabled: true,
          });
        }

        setKategoriJabatanOptions(mappedKategori);
      } catch (kategoriError) {
        console.error(
          "GAGAL MEMUAT KATEGORI JABATAN:",
          kategoriError
        );

        setKategoriJabatanOptions([]);

        setError(
          kategoriError?.message ||
            "Gagal memuat kategori jabatan."
        );
      } finally {
        setLoadingKategoriJabatan(false);
      }

      setLoadingShift(true);

      try {
        const shiftResult = await getShiftKerja({
          page: 1,
          limit: 100,
          status: "aktif",
          ...(actorSekolahId
            ? { sekolahId: actorSekolahId }
            : {}),
        });

        const shiftData = extractList(shiftResult);

        const mappedShifts = shiftData
          .filter((item) => {
            const isActive =
              String(item.status ?? "").toLowerCase() === "aktif";

            const isCurrent =
              getShiftId(item) === currentShiftId;

            return isActive || isCurrent;
          })
          .map((item) => {
            const shiftId = getShiftId(item);
            const shiftName = getShiftName(item);
            const shiftTime = getShiftTime(item);

            return {
              value: shiftId,
              label: shiftTime
                ? `${shiftName} (${shiftTime})`
                : shiftName,
              shiftValue: normalizeShiftValue(shiftName),
              disabled:
                String(item.status ?? "").toLowerCase() !== "aktif",
            };
          })
          .filter((item) => item.value);

        if (
          currentShiftId &&
          !mappedShifts.some(
            (item) => item.value === currentShiftId
          )
        ) {
          mappedShifts.unshift({
            value: currentShiftId,
            label: `${currentShiftName || "Shift saat ini"} (tidak tersedia di master)`,
            shiftValue: currentShiftValue,
            disabled: true,
          });
        }

        setShiftOptions(mappedShifts);
      } catch (shiftError) {
        console.error(
          "GAGAL MEMUAT SHIFT KERJA:",
          shiftError
        );

        setShiftOptions([]);

        setError(
          shiftError?.message ||
            "Gagal memuat daftar shift kerja."
        );
      } finally {
        setLoadingShift(false);
      }
    } catch (err) {
      console.error("GAGAL MEMUAT EDIT PENGGUNA:", err);

      setError(
        err?.message ||
          "Gagal memuat data pengguna."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadData]);

  const selectedRole = roleOptions.find(
    (role) => role.value === form.peranId
  );

  const selectedRoleName =
    selectedRole?.roleName ??
    selectedRole?.label ??
    "";

  const selectedIsGuru = isGuruRole(selectedRoleName);

  const handleShiftChange = (shiftId) => {
    const selectedShift = shiftOptions.find(
      (item) => item.value === shiftId
    );

    setForm((previous) => ({
      ...previous,
      shiftKerjaId: shiftId,
      shiftKerja: selectedShift?.shiftValue ?? "",
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.peranId) {
      setNotice("");
      setError("Peran pengguna wajib dipilih.");
      return;
    }

    if (loadingKategoriJabatan || loadingShift) {
      setError(
        "Tunggu sampai data kategori jabatan dan shift selesai dimuat."
      );
      return;
    }

    if (selectedIsGuru && !form.shiftKerjaId) {
      setError("Shift kerja wajib dipilih untuk pengguna Guru.");
      return;
    }

    if (
      selectedIsGuru &&
      !["pagi", "siang"].includes(
        normalizeShiftValue(form.shiftKerja)
      )
    ) {
      setError("Shift kerja Guru harus memiliki jenis Pagi atau Siang.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        namaLengkap: form.namaLengkap.trim(),
        namaPengguna: form.namaPengguna.trim(),
        email: form.email.trim(),
        noTelepon: form.noTelepon.trim() || null,
        kategoriJabatanId: form.kategoriJabatanId || null,
        golongan: form.golongan.trim() || null,
        status: form.status,
        peranId: form.peranId,
        shiftKerjaId: selectedIsGuru ? form.shiftKerjaId : null,
        shiftKerja: selectedIsGuru
          ? normalizeShiftValue(form.shiftKerja)
          : null,
      };

      console.log("PAYLOAD UPDATE USER:", payload);

      await updateUser(id, payload);

      setNotice("Data pengguna berhasil diperbarui.");

      router.push(`/admin/pengguna/${id}`);
      router.refresh();
    } catch (err) {
      console.error("GAGAL UPDATE PENGGUNA:", err);

      setError(
        err?.message ||
          "Gagal menyimpan perubahan pengguna."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="theme-page flex h-screen w-full overflow-hidden">
        <Sidebar
          role="admin"
          activeMenu="pengguna"
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen((value) => !value)}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="shrink-0 border-b theme-border">
            <Header
              title="Edit Pengguna"
              onMenuClick={() => setSidebarOpen((value) => !value)}
            />
          </div>

          <main className="theme-page flex min-h-0 min-w-0 flex-1 items-center justify-center overflow-y-auto">
            <div className="text-center">
              <Loader2 size={28} className="mx-auto animate-spin text-[var(--color-primary)]" />
              <p className="theme-text-muted mt-3 text-sm font-semibold">Memuat data pengguna...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        role="admin"
        activeMenu="pengguna"
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((value) => !value)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            title="Edit Pengguna"
            onMenuClick={() => setSidebarOpen((value) => !value)}
          />
        </div>

        <div className="flex min-h-0 flex-1">
          <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
            <div className="w-full p-4 sm:p-6 lg:p-8 2xl:px-12">
              <button
                type="button"
                onClick={() => router.back()}
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium theme-text-secondary transition hover:text-[var(--color-primary)]"
              >
                <ArrowLeft size={16} />
                Kembali
              </button>

              <div className="mb-6 flex min-w-0 items-center gap-3">
                <div className="theme-warning flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h1 className="theme-text text-2xl font-bold">Edit Pengguna</h1>
                  <p className="theme-text-muted mt-1 text-sm">
                    Perbarui informasi akun dan data kepegawaian pengguna.
                  </p>
                </div>
              </div>

              {error && (
                <div className="theme-danger mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <div className="flex-1">{error}</div>
                </div>
              )}

              {notice && (
                <div className="theme-success mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <div className="flex-1">{notice}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <div className="min-w-0 space-y-6">
                    <div className="theme-card theme-border rounded-2xl border p-5 shadow-sm sm:p-6">
                      <div className="mb-4 flex items-center gap-2 border-b theme-border pb-3">
                        <Info size={18} className="text-[var(--color-primary)]" />
                        <div>
                          <h2 className="text-sm font-semibold theme-text">
                            Informasi Pengguna
                          </h2>
                          <p className="text-xs theme-text-muted">
                            Informasi dasar akun pengguna.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <FormInput
                          label="Nama Lengkap"
                          value={form.namaLengkap}
                          onChange={(value) => updateField("namaLengkap", value)}
                          required
                          placeholder="Masukkan nama lengkap"
                        />

                        <FormInput
                          label="Nama Pengguna"
                          value={form.namaPengguna}
                          onChange={(value) => updateField("namaPengguna", value)}
                          required
                          placeholder="Masukkan nama pengguna"
                        />

                        <FormInput
                          label="Email"
                          type="email"
                          value={form.email}
                          onChange={(value) => updateField("email", value)}
                          required
                          placeholder="nama@sekolah.sch.id"
                        />

                        <FormInput
                          label="Nomor Telepon"
                          value={form.noTelepon}
                          onChange={(value) => updateField("noTelepon", value)}
                          placeholder="Masukkan nomor telepon"
                        />

                        <FormSelect
                          label="Peran Pengguna"
                          value={form.peranId}
                          onChange={(value) => updateField("peranId", value)}
                          options={roleOptions}
                          placeholder="Pilih peran"
                          required
                          hint={roleHint}
                        />

                        <FormSelect
                          label="Status"
                          value={form.status}
                          onChange={(value) => updateField("status", value)}
                          options={[
                            { value: "aktif", label: "Aktif" },
                            { value: "nonaktif", label: "Nonaktif" },
                          ]}
                          required
                        />
                      </div>
                    </div>

                    <div className="theme-card theme-border rounded-2xl border p-5 shadow-sm sm:p-6">
                      <div className="mb-4 flex items-center gap-2 border-b theme-border pb-3">
                        <Briefcase size={18} className="text-[var(--color-primary)]" />
                        <div>
                          <h2 className="text-sm font-semibold theme-text">
                            Informasi Kepegawaian
                          </h2>
                          <p className="text-xs theme-text-muted">
                            Atur kategori jabatan, shift kerja, dan golongan pengguna.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <FormSelect
                          label="Kategori Jabatan"
                          value={form.kategoriJabatanId}
                          onChange={(value) => updateField("kategoriJabatanId", value)}
                          options={kategoriJabatanOptions}
                          placeholder={
                            loadingKategoriJabatan
                              ? "Memuat kategori jabatan..."
                              : "Pilih kategori jabatan"
                          }
                          disabled={loadingKategoriJabatan}
                          hint="Pilihan berasal dari Master Kategori Jabatan."
                        />

                        <FormSelect
                          label="Shift Kerja"
                          value={form.shiftKerjaId}
                          onChange={handleShiftChange}
                          options={shiftOptions}
                          placeholder={
                            loadingShift
                              ? "Memuat shift kerja..."
                              : "Pilih shift kerja"
                          }
                          disabled={loadingShift}
                          required={selectedIsGuru}
                          hint={
                            selectedIsGuru
                              ? "Shift kerja wajib dipilih untuk Guru."
                              : "Pilih shift jika pengguna memiliki jadwal kerja."
                          }
                        />

                        <FormInput
                          label="Golongan"
                          value={form.golongan}
                          onChange={(value) => updateField("golongan", value)}
                          placeholder="Masukkan golongan"
                        />
                      </div>

                      {!loadingKategoriJabatan && kategoriJabatanOptions.length === 0 && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                          Belum ada kategori jabatan yang tersedia. Silakan periksa Master Kategori Jabatan.
                        </div>
                      )}

                      {!loadingShift && shiftOptions.length === 0 && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                          Belum ada shift kerja yang tersedia. Silakan atur shift terlebih dahulu melalui Master Shift Kerja.
                        </div>
                      )}
                    </div>
                  </div>

                  <aside className="flex min-w-0 flex-col gap-6">
                    <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                      <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                        <div className="theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                          <Eye className="h-4 w-4" />
                        </div>
                        <h2 className="theme-text text-sm font-bold">Preview Data</h2>
                      </div>
                      <div className="p-5">
                        <div className="space-y-4 text-xs">
                          <div>
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">Nama Lengkap</p>
                            <p className="theme-text mt-1 text-sm font-semibold break-words">
                              {form.namaLengkap || "Belum ada nama"}
                            </p>
                          </div>
                          <div className="theme-border-soft h-px" />
                          <div>
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">Peran</p>
                            <p className="theme-text mt-1 text-sm font-semibold">
                              {selectedRole ? selectedRole.label : "Belum dipilih"}
                            </p>
                          </div>
                          <div className="theme-border-soft h-px" />
                          <div>
                            <p className="theme-text-muted text-[10px] font-semibold uppercase tracking-wider">Status</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`h-2 w-2 rounded-full ${form.status === "aktif" ? "bg-[var(--color-success)]" : "bg-[var(--color-text-muted)]"}`} />
                              <span className="theme-text text-sm font-semibold capitalize">{form.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                      <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                        <div className="theme-info flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                          <Clock className="h-4 w-4" />
                        </div>
                        <h2 className="theme-text text-sm font-bold">Data Kepegawaian</h2>
                      </div>
                      <div className="p-5">
                        <p className="text-[11px] leading-5 theme-text-secondary">
                          Kategori jabatan diambil dari Master Kategori Jabatan. Shift kerja diambil dari Master Shift Kerja, termasuk nama shift dan jam kerja yang sudah diatur.
                        </p>
                        <div className="mt-3 flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => router.push("/admin/kategori-jabatan")}
                            className="theme-info inline-flex w-full items-center justify-center rounded-lg border px-3 py-2 text-[11px] font-semibold transition hover:opacity-80"
                          >
                            Buka Master Kategori Jabatan
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push("/admin/shift-kerja")}
                            className="theme-info inline-flex w-full items-center justify-center rounded-lg border px-3 py-2 text-[11px] font-semibold transition hover:opacity-80"
                          >
                            Buka Master Shift Kerja
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="theme-card theme-border overflow-hidden rounded-2xl border shadow-sm">
                      <div className="theme-card-soft theme-border flex items-center gap-3 border-b px-5 py-3">
                        <div className="theme-warning flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                          <Lightbulb className="h-4 w-4" />
                        </div>
                        <h2 className="theme-text text-sm font-bold">Panduan</h2>
                      </div>
                      <div className="p-5">
                        <ul className="space-y-3 text-xs leading-5">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                            <span className="theme-text-secondary">
                              Perubahan peran akan memengaruhi hak akses pengguna.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                            <span className="theme-text-secondary">
                              Jika role diubah menjadi Guru, shift kerja wajib diisi.
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--color-success)]" />
                            <span className="theme-text-secondary">
                              Data yang tidak aktif tetap ditampilkan agar tidak hilang.
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={saving || loadingKategoriJabatan || loadingShift}
                        className="theme-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Simpan Perubahan
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={saving}
                        className="theme-input inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition hover:opacity-80"
                      >
                        Batal
                      </button>
                    </div>
                  </aside>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}