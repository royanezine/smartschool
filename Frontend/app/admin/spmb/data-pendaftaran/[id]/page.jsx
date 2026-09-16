"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Sidebar from "../../../../components/Sidebar";
import Header from "../../../../components/Header";

import {
  ArrowLeft,
  UserRound,
  School,
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  FileCheck2,
  CheckCircle2,
  Clock3,
  XCircle,
  Route,
  Loader2,
  AlertCircle,
  Download,
} from "lucide-react";

import { getPendaftarPpdb } from "../../../../../services/ppdb.service";

function normalizeStatus(status) {
  const value = String(status || "").toLowerCase();

  if (value === "lulus") {
    return {
      label: "Terverifikasi",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    };
  }

  if (value === "ditolak") {
    return {
      label: "Ditolak",
      className:
        "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
    };
  }

  return {
    label: "Menunggu Verifikasi",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock3,
  };
}

function formatTanggal(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTanggalJam(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(nama) {
  return String(nama || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((item) => item.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getFotoUrl(item) {
  const rawUrl =
    item?.foto ||
    item?.fotoUrl ||
    item?.urlFoto ||
    item?.fotoProfil ||
    item?.urlFotoProfil ||
    item?.pengguna?.foto ||
    item?.pengguna?.fotoUrl ||
    item?.pengguna?.urlFoto ||
    item?.pengguna?.fotoProfil ||
    null;

  if (!rawUrl) {
    return null;
  }

  const value = String(rawUrl);

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL || "";

  return `${baseUrl.replace(/\/+$/, "")}/${value.replace(/^\/+/, "")}`;
}

function DetailItem({
  icon: Icon,
  label,
  value,
  full = false,
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-slate-50 p-4 ${
        full ? "sm:col-span-2" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-400">
          <Icon size={15} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-slate-700">
            {value || "-"}
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf1ff] text-[#155DFC]">
          <Icon size={17} />
        </div>

        <div>
          <h2 className="text-sm font-bold text-slate-800">
            {title}
          </h2>
        </div>
      </div>

      <div className="p-5">{children}</div>
    </section>
  );
}

export default function DetailPendaftaranPage() {
  const router = useRouter();
  const params = useParams();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDetail() {
      if (!id) {
        setError(
          "ID pendaftaran tidak ditemukan."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await getPendaftarPpdb();

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Gagal mengambil data pendaftar."
          );
        }

        const list = Array.isArray(
          response?.data
        )
          ? response.data
          : [];

        const found = list.find(
          (item) =>
            String(item?.id) ===
            String(id)
        );

        if (!found) {
          throw new Error(
            "Data pendaftaran tidak ditemukan."
          );
        }

        setData(found);
      } catch (err) {
        console.error(
          "GET DETAIL PENDAFTAR PPDB ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil detail pendaftar."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDetail();
  }, [id]);

  const statusInfo = normalizeStatus(
    data?.status
  );

  const StatusIcon = statusInfo.icon;
  const fotoUrl = getFotoUrl(data);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "";

  const getFileUrl = (urlFile) => {
    if (!urlFile) {
      return "#";
    }

    const value = String(urlFile);

    if (
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {
      return value;
    }

    return `${apiUrl.replace(
      /\/+$/,
      ""
    )}/${value.replace(/^\/+/, "")}`;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeMenu="spmb"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() =>
            setCollapsed((value) => !value)
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="w-full p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/admin/spmb/data-pendaftaran"
                    )
                  }
                  className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#155DFC]"
                >
                  <ArrowLeft size={16} />
                  Kembali ke Data Pendaftaran
                </button>

                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>SPMB</span>
                  <span>/</span>
                  <span>Data Pendaftaran</span>
                  <span>/</span>
                  <span className="font-medium text-blue-600">
                    Detail
                  </span>
                </div>

                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                  Detail Pendaftar
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Informasi lengkap calon peserta didik dan
                  dokumen pendaftaran.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                    <Loader2
                      size={24}
                      className="animate-spin text-blue-600"
                    />
                  </div>

                  <p className="mt-4 text-sm font-medium text-slate-700">
                    Memuat detail pendaftar...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-red-500"
                  />

                  <div>
                    <h2 className="text-sm font-bold text-red-700">
                      Gagal memuat data
                    </h2>

                    <p className="mt-1 text-sm text-red-600">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          "/admin/spmb/data-pendaftaran"
                        )
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#155DFC] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0d47c9]"
                    >
                      <ArrowLeft size={14} />
                      Kembali
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-6 sm:px-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white/40 bg-white shadow-lg">
                        {fotoUrl ? (
                          <img
                            src={fotoUrl}
                            alt={
                              data?.namaLengkap ||
                              "Foto pendaftar"
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-blue-100 text-2xl font-bold text-blue-600">
                            {getInitials(
                              data?.namaLengkap
                            ) || "PS"}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 text-white">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold sm:text-2xl">
                            {data?.namaLengkap ||
                              "-"}
                          </h2>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold ${statusInfo.className}`}
                          >
                            <StatusIcon size={13} />
                            {statusInfo.label}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-blue-100">
                          {data?.nomorPendaftaran ||
                            "-"}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white">
                            <Route size={13} />
                            {data?.jalurPpdb?.nama ||
                              "-"}
                          </span>

                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white">
                            <CalendarDays
                              size={13}
                            />
                            {formatTanggal(
                              data?.dibuatPada
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <SummaryItem
                      label="NISN"
                      value={
                        data?.nisn || "-"
                      }
                    />

                    <SummaryItem
                      label="Jenis Kelamin"
                      value={
                        String(
                          data?.jenisKelamin ||
                            ""
                        ).toUpperCase() ===
                        "L"
                          ? "Laki-laki"
                          : String(
                              data?.jenisKelamin ||
                                ""
                            ).toUpperCase() ===
                            "P"
                          ? "Perempuan"
                          : "-"
                      }
                    />

                    <SummaryItem
                      label="Tanggal Pendaftaran"
                      value={formatTanggal(
                        data?.dibuatPada
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                  <div className="space-y-5 xl:col-span-2">
                    <Section
                      title="Data Calon Siswa"
                      icon={UserRound}
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <DetailItem
                          icon={UserRound}
                          label="Nama Lengkap"
                          value={
                            data?.namaLengkap
                          }
                        />

                        <DetailItem
                          icon={FileCheck2}
                          label="NISN"
                          value={data?.nisn}
                        />

                        <DetailItem
                          icon={MapPin}
                          label="Tempat Lahir"
                          value={
                            data?.tempatLahir
                          }
                        />

                        <DetailItem
                          icon={CalendarDays}
                          label="Tanggal Lahir"
                          value={formatTanggal(
                            data?.tanggalLahir
                          )}
                        />

                        <DetailItem
                          icon={UserRound}
                          label="Jenis Kelamin"
                          value={
                            String(
                              data?.jenisKelamin ||
                                ""
                            ).toUpperCase() ===
                            "L"
                              ? "Laki-laki"
                              : String(
                                  data?.jenisKelamin ||
                                    ""
                                ).toUpperCase() ===
                                "P"
                              ? "Perempuan"
                              : data?.jenisKelamin ||
                                "-"
                          }
                        />

                        <DetailItem
                          icon={School}
                          label="Asal Sekolah"
                          value={
                            data?.asalSekolah
                          }
                        />

                        <DetailItem
                          icon={Phone}
                          label="Nomor Telepon"
                          value={
                            data?.telepon
                          }
                        />

                        <DetailItem
                          icon={Mail}
                          label="Email"
                          value={
                            data?.email
                          }
                        />

                        <DetailItem
                          icon={MapPin}
                          label="Alamat"
                          value={
                            data?.alamat
                          }
                          full
                        />
                      </div>
                    </Section>

                    <Section
                      title="Data Orang Tua / Wali"
                      icon={UserRound}
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <DetailItem
                          icon={UserRound}
                          label="Nama Ayah"
                          value={
                            data?.namaAyah
                          }
                        />

                        <DetailItem
                          icon={UserRound}
                          label="Nama Ibu"
                          value={
                            data?.namaIbu
                          }
                        />

                        <DetailItem
                          icon={Phone}
                          label="Nomor Telepon"
                          value={
                            data?.telepon
                          }
                        />

                        <DetailItem
                          icon={Mail}
                          label="Email"
                          value={
                            data?.email
                          }
                        />
                      </div>
                    </Section>

                    <Section
                      title="Informasi PPDB"
                      icon={School}
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <DetailItem
                          icon={School}
                          label="ID Sekolah"
                          value={
                            data?.sekolahId
                          }
                        />

                        <DetailItem
                          icon={Route}
                          label="Jalur PPDB"
                          value={
                            data?.jalurPpdb?.nama ||
                            "-"
                          }
                        />

                        <DetailItem
                          icon={FileCheck2}
                          label="ID Jalur PPDB"
                          value={
                            data?.jalurPpdbId
                          }
                        />

                        <DetailItem
                          icon={CalendarDays}
                          label="Tanggal Pendaftaran"
                          value={formatTanggalJam(
                            data?.dibuatPada
                          )}
                        />

                        <DetailItem
                          icon={CheckCircle2}
                          label="Status"
                          value={
                            statusInfo.label
                          }
                        />

                        <DetailItem
                          icon={Route}
                          label="Nilai Rapor"
                          value={
                            data?.nilaiRapor !==
                              null &&
                            data?.nilaiRapor !==
                              undefined
                              ? data.nilaiRapor
                              : "-"
                          }
                        />

                        <DetailItem
                          icon={School}
                          label="Kelas"
                          value={
                            data?.kelasId ||
                            "Belum ditentukan"
                          }
                        />

                        <DetailItem
                          icon={CalendarDays}
                          label="Diperbarui"
                          value={formatTanggalJam(
                            data?.diperbaruiPada
                          )}
                        />
                      </div>
                    </Section>
                  </div>

                  <div className="space-y-5">
                    <Section
                      title="Foto Pendaftar"
                      icon={UserRound}
                    >
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        <div className="aspect-[3/4] w-full">
                          {fotoUrl ? (
                            <img
                              src={fotoUrl}
                              alt={
                                data?.namaLengkap ||
                                "Foto pendaftar"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-slate-100">
                              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-blue-50 text-3xl font-bold text-blue-600">
                                {getInitials(
                                  data?.namaLengkap
                                ) || "PS"}
                              </div>

                              <p className="mt-4 text-sm font-semibold text-slate-600">
                                Foto belum tersedia
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Belum ada foto pada data
                                pendaftar.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </Section>

                    <Section
                      title="Berkas Pendaftaran"
                      icon={FileCheck2}
                    >
                      <div className="space-y-3">
                        {Array.isArray(
                          data?.berkasPpdb
                        ) &&
                        data.berkasPpdb.length > 0 ? (
                          data.berkasPpdb.map(
                            (berkas) => (
                              <div
                                key={berkas.id}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <FileCheck2
                                      size={16}
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-700">
                                      {
                                        berkas.namaBerkas
                                      }
                                    </p>

                                    <p className="mt-1 text-[10px] text-slate-400">
                                      {
                                        berkas.status
                                      }
                                    </p>
                                  </div>
                                </div>

                                <a
                                  href={getFileUrl(
                                    berkas.urlFile
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                  download
                                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                                >
                                  <Download
                                    size={14}
                                  />
                                  Lihat / Unduh Berkas
                                </a>
                              </div>
                            )
                          )
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                            <FileCheck2
                              size={24}
                              className="mx-auto text-slate-300"
                            />

                            <p className="mt-3 text-sm font-semibold text-slate-500">
                              Belum ada berkas
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Pendaftar belum mengunggah
                              dokumen.
                            </p>
                          </div>
                        )}
                      </div>
                    </Section>

                    <Section
                      title="Informasi Sistem"
                      icon={Clock3}
                    >
                      <div className="space-y-3">
                        <DetailItem
                          icon={CalendarDays}
                          label="Dibuat Pada"
                          value={formatTanggalJam(
                            data?.dibuatPada
                          )}
                        />

                        <DetailItem
                          icon={CalendarDays}
                          label="Diperbarui Pada"
                          value={formatTanggalJam(
                            data?.diperbaruiPada
                          )}
                        />

                        <DetailItem
                          icon={Route}
                          label="ID Pendaftaran"
                          value={data?.id}
                        />

                        {data?.dikonversiKePenggunaId && (
                          <DetailItem
                            icon={CheckCircle2}
                            label="ID Pengguna"
                            value={
                              data.dikonversiKePenggunaId
                            }
                          />
                        )}
                      </div>
                    </Section>
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

function SummaryItem({ label, value }) {
  return (
    <div className="px-5 py-4 sm:px-6">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}
