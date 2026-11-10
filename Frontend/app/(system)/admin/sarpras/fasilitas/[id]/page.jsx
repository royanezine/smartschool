"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";

import {
  getFasilitasById,
  deleteFasilitas,
} from "@/services/sarpras.service";

import {
  ArrowLeft,
  Building2,
  MapPin,
  Tag,
  Users,
  Activity,
  FileText,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  CalendarDays,
  Clock,
  UserCog,
  Image as ImageIcon,
} from "lucide-react";

function extractData(response) {
  if (response?.data?.data) return response.data.data;
  if (response?.data) return response.data;
  return response;
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getKondisiStyle(value) {
  const kondisi = String(value || "").toLowerCase();

  if (kondisi === "baik") {
    return "theme-success bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] border-[color-mix(in_srgb,var(--color-success)_25%,transparent)]";
  }

  if (kondisi === "rusak ringan") {
    return "theme-warning bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)]";
  }

  if (kondisi === "rusak berat") {
    return "theme-danger bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)]";
  }

  return "theme-text-secondary bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] border-[var(--color-border)]";
}

function InfoRow({ icon: Icon, label, value, full = false }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_2%,transparent)] p-3.5 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <div className="rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] p-2.5">
        <Icon size={18} className="theme-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="theme-text-muted text-xs">{label}</p>
        <p className="theme-text mt-1 break-words text-sm font-semibold">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

export default function DetailFasilitasPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [fasilitas, setFasilitas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const fetchDetail = useCallback(
    async (refresh = false) => {
      if (!id) return;

      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await getFasilitasById(id);

        if (response?.success === false) {
          throw new Error(
            response.message || "Gagal mengambil detail fasilitas."
          );
        }

        const data = extractData(response);

        if (!data || !data.id) {
          throw new Error("Data fasilitas tidak ditemukan.");
        }

        setFasilitas(data);
      } catch (err) {
        console.error("Detail fasilitas:", err);

        setError(
          err?.message ||
            "Terjadi kesalahan saat mengambil detail fasilitas."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Apakah kamu yakin ingin menghapus fasilitas "${fasilitas?.nama}"?`
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      const response = await deleteFasilitas(id);

      if (response?.success === false) {
        throw new Error(
          response.message || "Gagal menghapus fasilitas."
        );
      }

      router.replace("/admin/sarpras/fasilitas");
      router.refresh();
    } catch (err) {
      console.error("Hapus fasilitas:", err);

      setError(
        err?.message ||
          "Terjadi kesalahan saat menghapus fasilitas."
      );

      setDeleting(false);
    }
  };

  const notifications = [];

  return (
    <div className="theme-page flex h-screen overflow-hidden">
      <Sidebar
        role="adminSarpras"
        active="fasilitas"
        setActive={() => {}}
        collapsed={!sidebarOpen}
        setCollapsed={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header
            toggleSidebar={() => setSidebarOpen((prev) => !prev)}
            notifications={notifications}
            user={{
              name: "Admin Sarpras",
              email: "adminsarpras@smartschool.com",
              avatar: "SP",
            }}
          />
        </div>

        <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/admin/sarpras/fasilitas")
                    }
                    className="theme-card theme-border theme-text rounded-xl border p-2.5 transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"
                  >
                    <ArrowLeft size={19} />
                  </button>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                      Sarana &amp; Prasarana
                    </p>

                    <h1 className="theme-text mt-1 text-2xl font-bold">
                      Detail Fasilitas
                    </h1>

                    <p className="theme-text-secondary mt-1 text-sm">
                      Informasi lengkap fasilitas sekolah.
                    </p>
                  </div>
                </div>

                {!loading && fasilitas && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fetchDetail(true)}
                      disabled={refreshing}
                      className="theme-card theme-border theme-text inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] disabled:opacity-50"
                    >
                      <RefreshCw
                        size={15}
                        className={refreshing ? "animate-spin" : ""}
                      />
                      Refresh
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/admin/sarpras/fasilitas/${id}/edit`
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="theme-danger inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] px-4 py-2.5 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-danger)_14%,transparent)] disabled:opacity-50"
                    >
                      {deleting ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Hapus
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_8%,transparent)] p-4">
                  <AlertCircle
                    size={19}
                    className="theme-danger mt-0.5 shrink-0"
                  />
                  <div className="flex-1">
                    <p className="theme-danger text-sm font-medium">
                      {error}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchDetail()}
                    className="theme-danger text-sm font-semibold"
                  >
                    Coba Lagi
                  </button>
                </div>
              )}

              {loading ? (
                <div className="theme-card theme-border flex min-h-[350px] flex-col items-center justify-center rounded-2xl border">
                  <Loader2
                    size={35}
                    className="theme-primary animate-spin"
                  />
                  <p className="theme-text-secondary mt-3 text-sm">
                    Mengambil detail fasilitas...
                  </p>
                </div>
              ) : fasilitas ? (
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                  <div className="theme-card theme-border overflow-hidden rounded-2xl border xl:col-span-1">
                    <div className="relative flex min-h-[230px] items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]">
                      {fasilitas.foto ? (
                        <img
                          src={fasilitas.foto}
                          alt={fasilitas.nama}
                          className="h-full max-h-[380px] w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 p-6">
                          <div className="rounded-2xl bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] p-6">
                            <Building2
                              size={58}
                              className="theme-primary"
                            />
                          </div>
                          <p className="theme-text-muted text-xs">
                            Foto fasilitas belum tersedia
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                        {fasilitas.kategori || "Fasilitas"}
                      </p>

                      <h2 className="theme-text mt-2 break-words text-xl font-bold">
                        {fasilitas.nama}
                      </h2>

                      <p className="theme-text-secondary mt-2 flex items-start gap-2 text-sm">
                        <MapPin size={16} className="mt-0.5 shrink-0" />
                        <span className="break-words">
                          {fasilitas.lokasi || "Lokasi belum diisi"}
                        </span>
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span
                          className={`w-fit rounded-full border px-3 py-1.5 text-xs font-semibold ${getKondisiStyle(
                            fasilitas.kondisi
                          )}`}
                        >
                          {fasilitas.kondisi || "Belum ditentukan"}
                        </span>

                        <span className="theme-text-secondary rounded-full border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-3 py-1.5 text-xs font-medium">
                          {fasilitas.kapasitas !== null &&
                          fasilitas.kapasitas !== undefined &&
                          fasilitas.kapasitas !== ""
                            ? `${Number(
                                fasilitas.kapasitas
                              ).toLocaleString("id-ID")} orang`
                            : "Kapasitas -"}
                        </span>
                      </div>

                      <div className="mt-5 border-t border-[var(--color-border)] pt-4">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="theme-text-muted" />
                          <p className="theme-text-muted text-xs">
                            Dibuat pada{" "}
                            <span className="theme-text font-medium">
                              {formatDate(fasilitas.dibuatPada)}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5 xl:col-span-2">
                    <div className="theme-card theme-border rounded-2xl border p-5 sm:p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <FileText
                          size={18}
                          className="theme-primary"
                        />
                        <h3 className="theme-text text-base font-semibold">
                          Deskripsi Fasilitas
                        </h3>
                      </div>

                      <p className="theme-text-secondary whitespace-pre-wrap text-sm leading-relaxed">
                        {fasilitas.deskripsi ||
                          "Belum ada deskripsi untuk fasilitas ini."}
                      </p>
                    </div>

                    <div className="theme-card theme-border rounded-2xl border p-5 sm:p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <Building2
                          size={18}
                          className="theme-primary"
                        />
                        <h3 className="theme-text text-base font-semibold">
                          Informasi Fasilitas
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <InfoRow
                          icon={Building2}
                          label="Nama Fasilitas"
                          value={fasilitas.nama}
                        />

                        <InfoRow
                          icon={MapPin}
                          label="Lokasi"
                          value={fasilitas.lokasi}
                        />

                        <InfoRow
                          icon={Tag}
                          label="Kategori"
                          value={fasilitas.kategori}
                        />

                        <InfoRow
                          icon={Activity}
                          label="Kondisi"
                          value={fasilitas.kondisi}
                        />

                        <InfoRow
                          icon={Users}
                          label="Kapasitas"
                          value={
                            fasilitas.kapasitas !== null &&
                            fasilitas.kapasitas !== undefined &&
                            fasilitas.kapasitas !== ""
                              ? `${Number(
                                  fasilitas.kapasitas
                                ).toLocaleString("id-ID")} orang`
                              : "-"
                          }
                        />

                        <InfoRow
                          icon={CalendarDays}
                          label="Dibuat Pada"
                          value={formatDate(fasilitas.dibuatPada)}
                        />

                        <InfoRow
                          icon={RefreshCw}
                          label="Diperbarui Pada"
                          value={formatDate(fasilitas.diperbaruiPada)}
                        />

                        <InfoRow
                          icon={UserCog}
                          label="Dibuat Oleh"
                          value={fasilitas.dibuatOleh || "-"}
                        />

                        <InfoRow
                          icon={UserCog}
                          label="Diperbarui Oleh"
                          value={fasilitas.diperbaruiOleh || "-"}
                        />

                        <InfoRow
                          icon={ImageIcon}
                          label="URL Foto"
                          value={fasilitas.foto || "-"}
                          full
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}