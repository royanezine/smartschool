"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Edit,
  GraduationCap,
  User,
  CheckCircle,
  Hash,
  BriefcaseBusiness,
  ClipboardCheck,
  Clock,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { getUsers } from "@/services/user.service";
import { getAbsensiKelas } from "@/services/absensi.service";
import { getKelasSayaDariAnggota } from "@/services/kelas.service";
import { getTahunAjaran } from "@/services/tahunAjaran.service";


const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";
const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";
const themePrimaryText = "text-[var(--color-primary)]";
const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_16%,transparent)]";
const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";
const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";
const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";
const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";
const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";


function getText(...values) {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      typeof value !== "object" &&
      String(value).trim() !== ""
    ) {
      return String(value);
    }
  }

  return "-";
}

function unwrapList(response) {
  const candidates = [
    response?.data?.data,
    response?.data?.absensi,
    response?.data?.items,
    response?.data,
    response?.absensi,
    response?.items,
    response,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function unwrapObject(response) {
  const candidates = [
    response?.data?.data,
    response?.data?.kelas,
    response?.data,
    response?.kelas,
    response,
  ];

  for (const candidate of candidates) {
    if (
      candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate)
    ) {
      return candidate;
    }
  }

  return null;
}

function normalizeStatus(value) {
  const status = String(value || "").trim().toLowerCase();

  if (
    ["hadir", "present", "tepat waktu", "terlambat", "telat"].includes(
      status
    )
  ) {
    return status === "terlambat" || status === "telat"
      ? "telat"
      : "hadir";
  }

  if (["izin", "permission"].includes(status)) return "izin";
  if (["sakit", "sick"].includes(status)) return "sakit";

  if (
    ["alpha", "alpa", "absent", "tidak hadir", "tanpa keterangan"].includes(
      status
    )
  ) {
    return "alpha";
  }

  return status || "lainnya";
}

function getAbsensiDate(item) {
  return (
    item?.tanggal ||
    item?.tanggalAbsensi ||
    item?.tanggal_absensi ||
    item?.createdAt ||
    item?.created_at ||
    item?.dibuatPada ||
    null
  );
}

function formatDate(value) {
  if (!value || value === "-") return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatAcademicLevel(value) {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const level = String(value).trim();

  const labels = {
    "10": "10",
    "11": "11",
    "12": "12",
    "7": "7",
    "8": "8",
    "9": "9",
    X: "X",
    XI: "XI",
    XII: "XII",
    VII: "VII",
    VIII: "VIII",
    IX: "IX",
  };

  return labels[level] || level;
}


export default function DetailSiswaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [siswa, setSiswa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [kelasSiswa, setKelasSiswa] = useState(null);
  const [daftarTahunAjaran, setDaftarTahunAjaran] = useState([]);
  const [loadingAkademik, setLoadingAkademik] = useState(true);
  const [errorAkademik, setErrorAkademik] = useState("");

  const [absensi, setAbsensi] = useState([]);
  const [loadingAbsensi, setLoadingAbsensi] = useState(true);
  const [errorAbsensi, setErrorAbsensi] = useState("");


  useEffect(() => {
    let mounted = true;

    async function fetchSiswa() {
      if (!id) {
        setLoading(false);
        setError("ID siswa tidak ditemukan pada URL.");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getUsers({
          page: 1,
          limit: 1000,
          role: "siswa",
        });

        if (!mounted) return;

        const users = unwrapList(response);
        const found = users.find(
          (item) => String(item?.id) === String(id)
        );

        if (!found) {
          setSiswa(null);
          setError(
            "Data siswa tidak ditemukan. Pastikan ID siswa tersedia pada data backend."
          );
          return;
        }

        setSiswa(found);
      } catch (err) {
        if (!mounted) return;

        console.error("Gagal mengambil detail siswa:", err);
        setError(err?.message || "Gagal mengambil data siswa.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchSiswa();

    return () => {
      mounted = false;
    };
  }, [id]);


  useEffect(() => {
    let mounted = true;

    async function fetchAkademik() {
      if (!id) {
        setLoadingAkademik(false);
        return;
      }

      try {
        setLoadingAkademik(true);
        setErrorAkademik("");

        const [kelasResult, tahunAjaranResult] = await Promise.allSettled([
          getKelasSayaDariAnggota(id),
          getTahunAjaran(),
        ]);

        if (!mounted) return;

        if (kelasResult.status === "fulfilled") {
          const kelas = unwrapObject(kelasResult.value);
          setKelasSiswa(kelas);

          if (!kelas) {
            console.warn(
              "Kelas siswa tidak ditemukan melalui anggota kelas."
            );
          } else {
            console.log("DATA KELAS SISWA:", kelas);
          }
        } else {
          console.error(
            "Gagal mengambil kelas siswa:",
            kelasResult.reason
          );
          setKelasSiswa(null);
        }

        if (tahunAjaranResult.status === "fulfilled") {
          const tahunAjaran = Array.isArray(tahunAjaranResult.value)
            ? tahunAjaranResult.value
            : unwrapList(tahunAjaranResult.value);

          setDaftarTahunAjaran(tahunAjaran);
          console.log("DATA TAHUN AJARAN:", tahunAjaran);
        } else {
          console.error(
            "Gagal mengambil tahun ajaran:",
            tahunAjaranResult.reason
          );
          setDaftarTahunAjaran([]);
        }

        if (
          kelasResult.status === "rejected" &&
          tahunAjaranResult.status === "rejected"
        ) {
          setErrorAkademik("Data kelas dan tahun ajaran gagal dimuat.");
        }
      } catch (err) {
        if (!mounted) return;

        console.error("Gagal mengambil data akademik:", err);
        setKelasSiswa(null);
        setDaftarTahunAjaran([]);
        setErrorAkademik(
          err?.message || "Gagal mengambil data akademik."
        );
      } finally {
        if (mounted) setLoadingAkademik(false);
      }
    }

    fetchAkademik();

    return () => {
      mounted = false;
    };
  }, [id]);


  useEffect(() => {
    let mounted = true;

    async function fetchAbsensi() {
      if (!id) {
        setLoadingAbsensi(false);
        return;
      }

      if (loadingAkademik) return;

      if (!kelasSiswa?.id) {
        setAbsensi([]);
        setErrorAbsensi(
          "Kelas siswa tidak ditemukan, sehingga riwayat absensi tidak dapat dimuat."
        );
        setLoadingAbsensi(false);
        return;
      }

      try {
        setLoadingAbsensi(true);
        setErrorAbsensi("");

        const response = await getAbsensiKelas(kelasSiswa.id);

        if (!mounted) return;

        const semuaAbsensi = unwrapList(response);

        setAbsensi(
          semuaAbsensi.filter(
            (item) =>
              String(
                item?.penggunaId ??
                  item?.pengguna?.id ??
                  item?.siswaId ??
                  ""
              ) === String(id)
          )
        );
      } catch (err) {
        if (!mounted) return;

        console.error("Gagal mengambil absensi siswa:", err);
        setAbsensi([]);
        setErrorAbsensi(
          err?.message ||
            "Riwayat absensi kelas belum dapat dimuat."
        );
      } finally {
        if (mounted) setLoadingAbsensi(false);
      }
    }

    fetchAbsensi();

    return () => {
      mounted = false;
    };
  }, [id, kelasSiswa, loadingAkademik]);


  if (loading) {
    return (
      <PageShell
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      >
        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="text-center">
            <div
              className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${themePrimarySoft} ${themePrimaryText}`}
            >
              <User size={22} />
            </div>

            <p className="theme-text-secondary mt-4 text-sm font-medium">
              Memuat data siswa...
            </p>

            <div
              className={`mx-auto mt-3 h-1.5 w-32 overflow-hidden rounded-full ${themeNeutralSurface}`}
            >
              <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--color-primary)]" />
            </div>
          </div>
        </main>
      </PageShell>
    );
  }


  if (error || !siswa) {
    return (
      <PageShell
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      >
        <main className="flex flex-1 items-center justify-center px-6 py-12">
          <div
            className={`theme-card w-full max-w-md rounded-xl border ${themeNeutralBorder} p-8 text-center ${themeCardShadow}`}
          >
            <div
              className={`theme-danger mx-auto flex h-12 w-12 items-center justify-center rounded-full ${themeDangerSurface}`}
            >
              <AlertCircle size={22} />
            </div>

            <h1 className="theme-text mt-4 text-lg font-semibold">
              Data Siswa Tidak Ditemukan
            </h1>

            <p className="theme-text-muted mt-2 text-sm leading-6">
              {error || "Data siswa tidak tersedia."}
            </p>

            <button
              type="button"
              onClick={() => router.push("/admin/siswa")}
              className={`theme-primary ${themePrimaryShadow} mt-5 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--color-card)] transition hover:opacity-90`}
            >
              <ArrowLeft size={16} />
              Kembali ke Daftar Siswa
            </button>
          </div>
        </main>
      </PageShell>
    );
  }


  const nama = getText(
    siswa.nama,
    siswa.namaLengkap,
    siswa.name
  );

  const initial = nama.charAt(0).toUpperCase() || "S";

  const status = getText(
    siswa.status,
    siswa.statusPengguna,
    siswa.status_pengguna
  );

  const nis = getText(
    siswa.nis,
    siswa.NIS,
    siswa.nomorInduk,
    siswa.nomor_induk
  );

  const nisn = getText(siswa.nisn, siswa.NISN);


  const kelasData = kelasSiswa;

  const kelas = getText(
    kelasData?.nama,
    kelasData?.namaKelas,
    kelasData?.nama_kelas,
    siswa.namaKelas,
    siswa.nama_kelas,
    typeof siswa.kelas === "string" ? siswa.kelas : null,
    siswa.kelas?.nama,
    siswa.kelasSiswa?.kelas?.nama
  );

  const tingkatRaw =
    kelasData?.tingkat ??
    kelasData?.tingkatKelas ??
    kelasData?.tingkat_kelas ??
    siswa.tingkatKelas ??
    siswa.tingkat_kelas ??
    siswa.tingkat;

  const tingkatKelas = formatAcademicLevel(tingkatRaw);

  const tahunAjaranId =
    kelasData?.tahunAjaranId ??
    kelasData?.tahun_ajaran_id ??
    kelasData?.tahunAjaran?.id ??
    kelasData?.tahun_ajaran?.id ??
    null;

  const tahunAjaranRelasi =
    kelasData?.tahunAjaran ??
    kelasData?.tahun_ajaran ??
    siswa.tahunAjaran ??
    siswa.tahun_ajaran ??
    null;

  const tahunAjaranDariRelasi =
    typeof tahunAjaranRelasi === "string"
      ? tahunAjaranRelasi
      : tahunAjaranRelasi?.nama ??
        tahunAjaranRelasi?.tahunAjaran ??
        null;

  const tahunAjaranDariDaftar = daftarTahunAjaran.find(
    (item) => String(item.id) === String(tahunAjaranId)
  );

  const tahunAjaran = getText(
    tahunAjaranDariRelasi,
    tahunAjaranDariDaftar?.nama,
    siswa.namaTahunAjaran,
    siswa.nama_tahun_ajaran
  );

  const gender = getText(
    siswa.gender,
    siswa.jenisKelamin,
    siswa.jenis_kelamin
  );

  const tanggalLahir =
    siswa.tglLahir ||
    siswa.tanggalLahir ||
    siswa.tanggal_lahir ||
    null;

  const email = getText(siswa.email);

  const phone = getText(
    siswa.phone,
    siswa.noTelepon,
    siswa.nomorTelepon,
    siswa.telepon,
    siswa.no_telepon
  );

  const alamat = getText(
    siswa.alamat,
    siswa.alamatLengkap,
    siswa.alamat_lengkap
  );

  const kelurahan = getText(siswa.kelurahan, siswa.desa);
  const kecamatan = getText(siswa.kecamatan);

  const kota = getText(siswa.kota, siswa.kabupaten);
  const provinsi = getText(siswa.provinsi);

  const namaOrtu = getText(
    siswa.namaOrtu,
    siswa.namaOrangTua,
    siswa.namaWali,
    siswa.nama_orang_tua
  );

  const nikOrtu = getText(
    siswa.nikOrtu,
    siswa.nikOrangTua,
    siswa.nikWali,
    siswa.nik_orang_tua
  );

  const pekerjaanOrtu = getText(
    siswa.pekerjaanOrtu,
    siswa.pekerjaanOrangTua,
    siswa.pekerjaanWali,
    siswa.pekerjaan_orang_tua
  );

  const alamatKtpOrtu = getText(
    siswa.alamatKtpOrtu,
    siswa.alamatKtpOrangTua,
    siswa.alamat_ktp_orang_tua
  );

  const alamatDomisiliOrtu = getText(
    siswa.alamatDomisiliOrtu,
    siswa.alamatDomisiliOrangTua,
    siswa.alamat_domisili_orang_tua
  );

  const domisiliSama = Boolean(
    siswa.domisiliSama ||
      siswa.alamatDomisiliSama ||
      siswa.alamat_domisili_sama
  );

  const joinDate =
    siswa.tanggalMasuk ||
    siswa.tanggal_masuk ||
    siswa.joinDate ||
    siswa.createdAt ||
    siswa.created_at ||
    siswa.dibuatPada ||
    null;

  const isActive = String(status).toLowerCase() === "aktif";


  const attendanceCounts = absensi.reduce(
    (counts, item) => {
      const normalized = normalizeStatus(
        item.status || item.statusAbsensi || item.status_absensi
      );

      if (normalized === "hadir") counts.hadir += 1;
      else if (normalized === "telat") counts.telat += 1;
      else if (normalized === "izin") counts.izin += 1;
      else if (normalized === "sakit") counts.sakit += 1;
      else if (normalized === "alpha") counts.alpha += 1;

      return counts;
    },
    {
      hadir: 0,
      telat: 0,
      izin: 0,
      sakit: 0,
      alpha: 0,
    }
  );

  const totalAbsensi = absensi.length;

  const totalHadir =
    attendanceCounts.hadir + attendanceCounts.telat;

  const persentaseKehadiran =
    totalAbsensi > 0
      ? `${Math.round((totalHadir / totalAbsensi) * 100)}%`
      : "-";

  const riwayatAbsensi = [...absensi].sort((a, b) => {
    const dateA = new Date(getAbsensiDate(a) || 0).getTime();
    const dateB = new Date(getAbsensiDate(b) || 0).getTime();

    return dateB - dateA;
  });


  return (
    <PageShell
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    >
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="w-full px-4 py-5 sm:px-6 md:px-7 lg:px-8 xl:px-10">
          <div className="mx-auto w-full max-w-[1500px]">


            <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => router.push("/admin/siswa")}
                className="theme-text-muted group inline-flex w-fit items-center gap-2 text-sm font-medium transition hover:text-[var(--color-primary)]"
              >
                <ArrowLeft
                  size={17}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
                Kembali ke Daftar Siswa
              </button>

              <button
                type="button"
                onClick={() => router.push(`/admin/siswa/edit/${siswa.id}`)}
                className={`theme-card ${themePrimarySoftBorder} ${themePrimaryText} ${themeSmallShadow} inline-flex w-fit items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]`}
              >
                <Edit size={16} />
                Edit Profil
              </button>
            </div>


            <section
              className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
            >
              <div className="h-1 w-full bg-[var(--color-primary)]" />

              <div className="p-5 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-5">
                    <div
                      className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} text-2xl font-bold sm:h-24 sm:w-24 sm:text-3xl`}
                    >
                      {initial}
                    </div>

                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} rounded-md border px-2.5 py-1 text-xs font-semibold`}
                        >
                          DATA SISWA
                        </span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${
                            isActive
                              ? `${themeSuccessBorder} ${themeSuccessSurface} theme-success`
                              : `${themeDangerBorder} ${themeDangerSurface} theme-danger`
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {status}
                        </span>
                      </div>

                      <h1 className="theme-text break-words text-2xl font-bold tracking-tight sm:text-3xl">
                        {nama}
                      </h1>

                      <div className="theme-text-muted mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <Hash size={14} className={themePrimaryText} />
                          NIS {nis}
                        </span>

                        <span>NISN {nisn}</span>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText} font-semibold`}
                        >
                          <GraduationCap size={14} />
                          Kelas {loadingAkademik ? "Memuat..." : kelas}
                        </span>

                        {tingkatKelas !== "-" && (
                          <span>Tingkat {tingkatKelas}</span>
                        )}

                        {tahunAjaran !== "-" && (
                          <span>Tahun Ajaran {tahunAjaran}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`shrink-0 border-t ${themeDivider} pt-4 md:border-l md:border-t-0 md:pl-6 md:pt-0 lg:pl-8`}
                  >
                    <p className="theme-text-muted text-xs font-medium uppercase tracking-wide">
                      Bergabung pada
                    </p>

                    <div className="theme-text-secondary mt-2 flex items-center gap-2 text-sm font-semibold">
                      <Calendar size={16} className={themePrimaryText} />
                      {formatDate(joinDate)}
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-7 grid grid-cols-1 gap-x-8 gap-y-5 border-t ${themeDivider} pt-6 sm:grid-cols-2 lg:grid-cols-4`}
                >
                  <InfoItem
                    icon={<User size={17} />}
                    label="Jenis Kelamin"
                    value={
                      gender === "L"
                        ? "Laki-laki"
                        : gender === "P"
                        ? "Perempuan"
                        : gender
                    }
                  />

                  <InfoItem
                    icon={<Calendar size={17} />}
                    label="Tanggal Lahir"
                    value={formatDate(tanggalLahir)}
                  />

                  <InfoItem
                    icon={<Mail size={17} />}
                    label="Email"
                    value={email}
                    breakText
                  />

                  <InfoItem
                    icon={<Phone size={17} />}
                    label="Nomor Telepon"
                    value={phone}
                  />
                </div>
              </div>
            </section>


            <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
              <div className="min-w-0 space-y-5 xl:col-span-2">


                <section
                  className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <SectionHeader
                    icon={<MapPin size={18} />}
                    title="Alamat"
                    description="Informasi alamat tempat tinggal siswa"
                  />

                  <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-5 sm:grid-cols-2 lg:p-6">
                    <DetailItem
                      label="Alamat Jalan"
                      value={alamat}
                      breakText
                      className="sm:col-span-2"
                    />

                    <DetailItem label="Kelurahan / Desa" value={kelurahan} />
                    <DetailItem label="Kecamatan" value={kecamatan} />
                    <DetailItem label="Kota / Kabupaten" value={kota} />
                    <DetailItem label="Provinsi" value={provinsi} />
                  </div>
                </section>


                <section
                  className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <SectionHeader
                    icon={<Users size={18} />}
                    title="Orang Tua / Wali"
                    description="Informasi orang tua atau wali siswa"
                  />

                  <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-5 sm:grid-cols-2 lg:p-6">
                    <DetailItem label="Nama Orang Tua" value={namaOrtu} />
                    <DetailItem label="NIK Orang Tua" value={nikOrtu} breakText />
                    <DetailItem
                      label="Pekerjaan"
                      value={pekerjaanOrtu}
                      icon={<BriefcaseBusiness size={14} />}
                    />

                    <div className="hidden sm:block" />

                    <DetailItem
                      label="Alamat KTP"
                      value={alamatKtpOrtu}
                      breakText
                      className="sm:col-span-2"
                    />

                    <div className="min-w-0 sm:col-span-2">
                      <DetailItem
                        label="Alamat Domisili"
                        value={alamatDomisiliOrtu}
                        breakText
                      />

                      {domisiliSama && (
                        <div
                          className={`theme-success ${themeSuccessBorder} ${themeSuccessSurface} mt-3 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium`}
                        >
                          <CheckCircle size={14} />
                          Alamat domisili sama dengan alamat KTP
                        </div>
                      )}
                    </div>
                  </div>
                </section>


                <section
                  className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <SectionHeader
                    icon={<ClipboardCheck size={18} />}
                    title="Riwayat Absensi"
                    description="Rekap kehadiran siswa berdasarkan data backend"
                  />

                  <div className="p-5 lg:p-6">
                    {loadingAbsensi ? (
                      <div className="flex items-center justify-center gap-3 py-8">
                        <RefreshCw
                          size={18}
                          className={`${themePrimaryText} animate-spin`}
                        />
                        <span className="theme-text-muted text-sm">
                          Memuat riwayat absensi...
                        </span>
                      </div>
                    ) : errorAbsensi ? (
                      <div
                        className={`rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertCircle
                            size={19}
                            className="theme-text-muted mt-0.5 shrink-0"
                          />

                          <div>
                            <p className="theme-text text-sm font-semibold">
                              Absensi belum dapat dimuat
                            </p>

                            <p className="theme-text-muted mt-1 break-words text-sm leading-6">
                              {errorAbsensi}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                          <AttendanceStat label="Hadir" value={attendanceCounts.hadir} />
                          <AttendanceStat label="Terlambat" value={attendanceCounts.telat} />
                          <AttendanceStat label="Izin" value={attendanceCounts.izin} />
                          <AttendanceStat label="Sakit" value={attendanceCounts.sakit} />
                          <AttendanceStat label="Alpha" value={attendanceCounts.alpha} />
                        </div>

                        <div
                          className={`mt-4 flex flex-col gap-3 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-4 sm:flex-row sm:items-center sm:justify-between`}
                        >
                          <div>
                            <p className="theme-text-muted text-xs font-medium">
                              Persentase Kehadiran
                            </p>
                            <p className="theme-text mt-1 text-xl font-bold">
                              {persentaseKehadiran}
                            </p>
                          </div>

                          <div>
                            <p className="theme-text-muted text-xs font-medium">
                              Total Catatan Absensi
                            </p>
                            <p className="theme-text mt-1 text-xl font-bold">
                              {totalAbsensi}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6">
                          <h3 className="theme-text mb-3 text-sm font-semibold">
                            Catatan Terbaru
                          </h3>

                          {riwayatAbsensi.length === 0 ? (
                            <div
                              className={`rounded-lg border ${themeNeutralBorder} p-6 text-center`}
                            >
                              <Clock size={22} className="theme-text-muted mx-auto" />
                              <p className="theme-text-secondary mt-2 text-sm font-medium">
                                Belum ada data absensi
                              </p>
                            </div>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[540px] text-left text-sm">
                                <thead>
                                  <tr className={`border-b ${themeDivider}`}>
                                    <th className="theme-text-muted px-3 py-3 font-medium">
                                      Tanggal
                                    </th>
                                    <th className="theme-text-muted px-3 py-3 font-medium">
                                      Status
                                    </th>
                                    <th className="theme-text-muted px-3 py-3 font-medium">
                                      Metode
                                    </th>
                                    <th className="theme-text-muted px-3 py-3 font-medium">
                                      Keterangan
                                    </th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {riwayatAbsensi.slice(0, 20).map((item, index) => {
                                    const statusAbsensi = normalizeStatus(
                                      item.status ||
                                        item.statusAbsensi ||
                                        item.status_absensi
                                    );

                                    return (
                                      <tr
                                        key={item.id || `${getAbsensiDate(item)}-${index}`}
                                        className={`border-b ${themeDivider} last:border-0`}
                                      >
                                        <td className="theme-text-secondary whitespace-nowrap px-3 py-3">
                                          {formatDate(getAbsensiDate(item))}
                                        </td>

                                        <td className="px-3 py-3">
                                          <AttendanceBadge status={statusAbsensi} />
                                        </td>

                                        <td className="theme-text-secondary px-3 py-3">
                                          {getText(
                                            item.metode,
                                            item.metodeAbsensi,
                                            item.metode_absensi
                                          )}
                                        </td>

                                        <td className="theme-text-secondary max-w-[240px] break-words px-3 py-3">
                                          {getText(item.keterangan, item.catatan)}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </section>
              </div>


              <div className="min-w-0 space-y-5">
                <section
                  className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <SectionHeader
                    icon={<GraduationCap size={18} />}
                    title="Informasi Akademik"
                    description="Informasi kelas dan performa siswa"
                  />

                  <div className="space-y-3 p-5 lg:p-6">
                    <AcademicStat
                      label="Kelas"
                      value={loadingAkademik ? "Memuat..." : kelas}
                      valueClass={themePrimaryText}
                    />

                    <AcademicStat
                      label="Tingkat Kelas"
                      value={loadingAkademik ? "Memuat..." : tingkatKelas}
                    />

                    <AcademicStat
                      label="Tahun Ajaran"
                      value={loadingAkademik ? "Memuat..." : tahunAjaran}
                    />

                    <AcademicStat
                      label="Rata-rata Nilai"
                      value={getText(
                        siswa.rataRataNilai,
                        siswa.rataRata,
                        siswa.rata_rata_nilai
                      )}
                    />

                    <AcademicStat
                      label="Mata Pelajaran Unggulan"
                      value={getText(
                        siswa.mataPelajaranUnggulan,
                        siswa.mata_pelajaran_unggulan
                      )}
                    />

                    <AcademicStat
                      label="Tingkat Kehadiran"
                      value={persentaseKehadiran !== "-"
                        ? persentaseKehadiran
                        : getText(siswa.tingkatKehadiran)}
                      valueClass="theme-success"
                    />

                    {errorAkademik && (
                      <p className="theme-text-muted text-xs leading-5">
                        {errorAkademik}
                      </p>
                    )}
                  </div>
                </section>


                <section
                  className={`theme-card overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
                >
                  <SectionHeader
                    icon={<User size={18} />}
                    title="Ringkasan"
                    description="Informasi utama siswa"
                  />

                  <div className={`divide-y ${themeDivider}`}>
                    <SummaryRow
                      label="Status"
                      value={status}
                      valueClass={isActive ? "theme-success" : "theme-danger"}
                    />
                    <SummaryRow label="Kelas" value={kelas} />
                    <SummaryRow label="Tingkat Kelas" value={tingkatKelas} />
                    <SummaryRow label="Tahun Ajaran" value={tahunAjaran} />
                    <SummaryRow label="NIS" value={nis} />
                    <SummaryRow label="NISN" value={nisn} />
                    <SummaryRow label="Bergabung" value={formatDate(joinDate)} />
                  </div>
                </section>
              </div>
            </div>

            <div className="h-5" />
          </div>
        </div>
      </main>
    </PageShell>
  );
}


function PageShell({ children, isCollapsed, setIsCollapsed }) {
  return (
    <div className="theme-page flex min-h-screen w-full min-w-0">
      <div className="shrink-0">
        <Sidebar
          active="siswa"
          setActive={() => {}}
          collapsed={isCollapsed}
          setCollapsed={setIsCollapsed}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setIsCollapsed((prev) => !prev)}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {children}
      </div>
    </div>
  );
}


function SectionHeader({ icon, title, description }) {
  return (
    <div
      className={`flex items-start gap-3 border-b ${themeDivider} px-5 py-4 lg:px-6`}
    >
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${themePrimarySoftBorder} ${themePrimarySoft}`}
      >
        <span className={themePrimaryText}>{icon}</span>
      </div>

      <div className="min-w-0">
        <h2 className="theme-text text-sm font-semibold">{title}</h2>

        {description && (
          <p className="theme-text-muted mt-0.5 text-xs">{description}</p>
        )}
      </div>
    </div>
  );
}


function InfoItem({ icon, label, value, breakText = false }) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <div className={`mt-0.5 shrink-0 ${themePrimaryText}`}>{icon}</div>

      <div className="min-w-0 flex-1">
        <p className="theme-text-muted text-xs font-medium">{label}</p>

        <p
          className={`theme-text-secondary mt-1 text-sm font-medium ${
            breakText ? "break-words [overflow-wrap:anywhere]" : "break-words"
          }`}
          title={String(value)}
        >
          {value ?? "-"}
        </p>
      </div>
    </div>
  );
}


function DetailItem({
  label,
  value,
  breakText = false,
  className = "",
  icon,
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="flex items-center gap-1.5">
        <p className="theme-text-muted text-xs font-medium">{label}</p>

        {icon && <span className={themePrimaryText}>{icon}</span>}
      </div>

      <p
        className={`theme-text-secondary mt-1.5 text-sm font-medium ${
          breakText
            ? "break-words leading-6 [overflow-wrap:anywhere]"
            : "break-words"
        }`}
        title={String(value)}
      >
        {value ?? "-"}
      </p>
    </div>
  );
}


function AcademicStat({ label, value, valueClass = "theme-text" }) {
  return (
    <div
      className={`flex min-w-0 items-center justify-between gap-4 rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-4`}
    >
      <div className="min-w-0">
        <p className="theme-text-muted text-xs font-medium">{label}</p>
      </div>

      <p
        className={`max-w-[60%] break-words text-right text-lg font-bold tracking-tight ${valueClass}`}
      >
        {value ?? "-"}
      </p>
    </div>
  );
}


function SummaryRow({ label, value, valueClass = "theme-text-secondary" }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 lg:px-6">
      <span className="theme-text-muted text-xs font-medium">{label}</span>

      <span
        className={`max-w-[60%] break-words text-right text-sm font-semibold ${valueClass}`}
        title={String(value)}
      >
        {value ?? "-"}
      </span>
    </div>
  );
}


function AttendanceStat({ label, value }) {
  return (
    <div
      className={`rounded-lg border ${themeNeutralBorder} ${themeNeutralSurface} p-3`}
    >
      <p className="theme-text-muted text-xs font-medium">{label}</p>
      <p className="theme-text mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}


function AttendanceBadge({ status }) {
  const config = {
    hadir: {
      label: "Hadir",
      className: `${themeSuccessBorder} ${themeSuccessSurface} theme-success`,
    },
    telat: {
      label: "Terlambat",
      className: `${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`,
    },
    izin: {
      label: "Izin",
      className: `${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`,
    },
    sakit: {
      label: "Sakit",
      className: `${themePrimarySoftBorder} ${themePrimarySoft} ${themePrimaryText}`,
    },
    alpha: {
      label: "Alpha",
      className: `${themeDangerBorder} ${themeDangerSurface} theme-danger`,
    },
  };

  const selected = config[status] || {
    label: status || "Lainnya",
    className: `${themeNeutralBorder} ${themeNeutralSurface} theme-text-secondary`,
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold ${selected.className}`}
    >
      {selected.label}
    </span>
  );
}
