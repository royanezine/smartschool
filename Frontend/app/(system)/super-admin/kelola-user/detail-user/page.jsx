"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  ShieldCheck,
  Building2,
  Landmark,
  CalendarDays,
  CircleCheck,
  CircleX,
  Loader2,
  AlertCircle,
  Pencil,
  KeyRound,
  IdCard,
  BriefcaseBusiness,
  Users,
} from "lucide-react";

import { getUserById } from "@/services/user.service";
import ResetPasswordModal from "@/app/components/user/ResetPasswordModal";

function getUserName(user) {
  return user?.namaLengkap || user?.namaPengguna || user?.nama || "-";
}

function getUsername(user) {
  return user?.namaPengguna || user?.username || "-";
}

function getRoleName(user) {
  return (
    user?.peran?.namaTampilan ||
    user?.peran?.nama ||
    user?.role?.namaTampilan ||
    user?.role?.nama ||
    user?.role ||
    "-"
  );
}

function getSchoolName(user) {
  return user?.sekolah?.nama || "-";
}

function getFoundationName(user) {
  return user?.yayasan?.nama || "-";
}

function isActiveStatus(status) {
  const value = String(status ?? "").toLowerCase();
  return ["aktif", "active", "true", "1"].includes(value);
}

function formatStatus(status) {
  if (isActiveStatus(status)) {
    return "Aktif";
  }

  const value = String(status ?? "").toLowerCase();

  if (["nonaktif", "inactive", "false", "0"].includes(value)) {
    return "Nonaktif";
  }

  return status || "-";
}

function formatGender(value) {
  if (!value) return "-";

  const gender = String(value).toLowerCase();

  if (["l", "lk", "laki-laki", "laki laki", "male", "pria"].includes(gender)) {
    return "Laki-laki";
  }

  if (["p", "pr", "perempuan", "female", "wanita"].includes(gender)) {
    return "Perempuan";
  }

  return value;
}

function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-4 border-b border-slate-100 py-4 last:border-b-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function DetailUserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get("id");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (!userId) {
        setError("ID pengguna tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getUserById(userId);

        const userData =
          response?.data?.user ||
          response?.data?.data ||
          response?.data ||
          response?.user ||
          null;

        if (!userData || typeof userData !== "object") {
          throw new Error("Data pengguna tidak ditemukan.");
        }

        if (!cancelled) {
          setUser(userData);
        }
      } catch (err) {
        console.error("Gagal mengambil detail pengguna:", err);

        if (!cancelled) {
          setError(err?.message || "Gagal mengambil detail pengguna.");
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const active = isActiveStatus(user?.status);

  // Sidebar & Header sudah dirender oleh layout.js, jadi di sini hanya konten.
  return (
    <div className="w-full min-w-0 px-4 py-2 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.push("/super-admin/kelola-user")}
            className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Kelola User
          </button>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Detail Pengguna
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Informasi lengkap pengguna dan akun yang terdaftar.
          </p>
        </div>

        {user && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 shadow-sm transition hover:bg-amber-100"
            >
              <KeyRound className="h-4 w-4" />
              Reset Password
            </button>
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/super-admin/kelola-user/edit-user?id=${encodeURIComponent(user.id)}`
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" />
              Edit Pengguna
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

          <div>
            <p className="font-semibold">Terjadi kesalahan</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm">Memuat detail pengguna...</p>
          </div>
        </div>
      ) : user ? (
        <div className="w-full">
          <div className="min-w-0 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Informasi Akun
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Informasi dasar akun pengguna.
                </p>
              </div>

              <div>
                <InfoItem
                  icon={User}
                  label="Nama Lengkap"
                  value={user.namaLengkap || user.nama}
                />

                <InfoItem
                  icon={User}
                  label="Username"
                  value={user.namaPengguna || user.username}
                />

                <InfoItem icon={Mail} label="Email" value={user.email} />

                <InfoItem
                  icon={ShieldCheck}
                  label="Role / Peran"
                  value={getRoleName(user)}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Data Identitas
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Informasi identitas pengguna.
                </p>
              </div>

              <div>
                <InfoItem icon={IdCard} label="NIP" value={user.nip} />
                <InfoItem icon={IdCard} label="NIPD" value={user.nipd} />
                <InfoItem icon={IdCard} label="NISN" value={user.nisn} />

                <InfoItem
                  icon={Users}
                  label="Jenis Kelamin"
                  value={formatGender(user.jenisKelamin)}
                />

                <InfoItem
                  icon={BriefcaseBusiness}
                  label="Jabatan"
                  value={user.jabatan}
                />

                <InfoItem
                  icon={BriefcaseBusiness}
                  label="Golongan"
                  value={user.golongan}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Informasi Sekolah
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Informasi tenant yang terhubung dengan pengguna.
                </p>
              </div>

              <div>
                <InfoItem
                  icon={Building2}
                  label="Sekolah"
                  value={getSchoolName(user)}
                />

                <InfoItem
                  icon={Landmark}
                  label="Yayasan"
                  value={getFoundationName(user)}
                />

                <InfoItem
                  icon={Building2}
                  label="ID Sekolah"
                  value={user.sekolahId}
                />

                <InfoItem
                  icon={Landmark}
                  label="ID Yayasan"
                  value={user.yayasanId}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-3 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Informasi Sistem
                </h2>
              </div>

              <div>
                <InfoItem
                  icon={CalendarDays}
                  label="Dibuat Pada"
                  value={formatDate(user.dibuatPada || user.createdAt)}
                />

                <InfoItem
                  icon={CalendarDays}
                  label="Diperbarui Pada"
                  value={formatDate(user.diperbaruiPada || user.updatedAt)}
                />

                <InfoItem
                  icon={ShieldCheck}
                  label="Peran ID"
                  value={user.peranId || user.roleId}
                />
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <div>
                  <h3 className="font-semibold text-amber-900">
                    Password Pengguna
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Password tidak ditampilkan pada halaman detail demi keamanan. Anda dapat mereset kata sandi pengguna ini secara langsung untuk membuat kata sandi sementara baru.
                  </p>

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowResetModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      Reset Kata Sandi Pengguna Ini
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        !error && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Data pengguna tidak ditemukan.
          </div>
        )
      )}

      {user && (
        <ResetPasswordModal
          isOpen={showResetModal}
          user={user}
          onClose={() => setShowResetModal(false)}
        />
      )}
    </div>
  );
}

export default function DetailUserPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] w-full items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm">Memuat halaman detail pengguna...</p>
          </div>
        </div>
      }
    >
      <DetailUserContent />
    </Suspense>
  );
}