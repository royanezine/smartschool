"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  Megaphone,
  CheckCircle2,
  Users,
  MapPin,
  Sparkles,
  Calendar,
  Building2,
  GraduationCap,
  Search,
  ArrowRight,
  FileCheck2,
  FileText,
  AlertCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { publikService } from "@/services/publik.service";
import {
  getProfilSekolahPublik,
  getOpsiPpdbSekolah,
} from "@/services/ppdb.service";
import { urlFormulirPendaftaran } from "@/app/components/ppdb/rutePpdb";

const BERKAS_LABEL_MAP = {
  KK: {
    nama: "Kartu Keluarga (KK)",
    desc: "Pindaian atau foto dokumen Kartu Keluarga asli yang masih berlaku, NIK terlihat jelas.",
  },
  AKTE: {
    nama: "Akta Kelahiran",
    desc: "Akta kelahiran resmi dari Disdukcapil sebagai bukti sah identitas dan tanggal lahir.",
  },
  IJAZAH: {
    nama: "Ijazah / Surat Keterangan Lulus (SKL)",
    desc: "Ijazah jenjang sebelumnya atau Surat Keterangan Lulus (SKL) resmi dari pihak sekolah asal.",
  },
  SERTIFIKAT: {
    nama: "Sertifikat Prestasi (Akademik / Non-Akademik)",
    desc: "Sertifikat atau piagam kejuaraan minimal tingkat kabupaten/kota jika mendaftar jalur prestasi.",
  },
  SKTM: {
    nama: "Surat Keterangan Tidak Mampu (SKTM)",
    desc: "Surat resmi dari instansi berwenang bagi pendaftar jalur afirmasi keluarga prasejahtera.",
  },
  KIP: {
    nama: "Kartu Indonesia Pintar (KIP / PIP)",
    desc: "Kartu Indonesia Pintar atau bukti penerima bantuan Program Indonesia Pintar yang masih aktif.",
  },
  SURAT_TUGAS: {
    nama: "Surat Penugasan Orang Tua/Wali",
    desc: "Surat mutasi atau penugasan dinas resmi dari instansi atau perusahaan tempat bekerja.",
  },
};

const TAHAPAN_PENDAFTARAN = [
  {
    step: "01",
    title: "Pilih Jalur",
    desc: "Pelajari ketentuan jalur zonasi, prestasi, atau afirmasi yang sesuai kualifikasi.",
  },
  {
    step: "02",
    title: "Isi Formulir",
    desc: "Lengkapi data identitas calon siswa, wali, alamat domisili, dan kontak aktif.",
  },
  {
    step: "03",
    title: "Upload Berkas",
    desc: "Unggah dokumen asli (KK, Akte, Ijazah/SKL) dalam format digital yang terbaca jelas.",
  },
  {
    step: "04",
    title: "Verifikasi",
    desc: "Panitia PPDB sekolah memeriksa keabsahan berkas dan kesesuaian data formulir.",
  },
  {
    step: "05",
    title: "Pantau Hasil",
    desc: "Cek pengumuman seleksi dan status penerimaan secara berkala melalui portal ini.",
  },
];

export default function PPDBLandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const tenant = Array.isArray(params?.tenant)
    ? params.tenant[0]
    : params?.tenant;
  const subdomain = tenant ? String(tenant) : "";

  const ppdbIndex = pathname ? pathname.indexOf("/PPDB") : -1;
  const basePath = ppdbIndex > 0 ? pathname.slice(0, ppdbIndex) : "";

  const [loading, setLoading] = useState(Boolean(subdomain));
  const [error, setError] = useState("");
  const [sekolah, setSekolah] = useState(null);
  const [opsiData, setOpsiData] = useState(null);
  const [pengumuman, setPengumuman] = useState([]);
  const [pengumumanLoading, setPengumumanLoading] = useState(Boolean(subdomain));
  const [showStickyCta, setShowStickyCta] = useState(false);

  const formDaftarUrl = useMemo(() => {
    return urlFormulirPendaftaran(basePath);
  }, [basePath]);

  // Efek scroll untuk sticky CTA bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos =
        window.scrollY || document.documentElement.scrollTop || 0;
      // Muncul saat scroll > 400 dan sembunyikan saat mendekati bagian CTA bawah
      const docHeight = document.documentElement.scrollHeight || 0;
      const winHeight = window.innerHeight || 0;
      const nearBottom = scrollPos + winHeight > docHeight - 350;

      setShowStickyCta(scrollPos > 400 && !nearBottom);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Muat data profil sekolah & opsi PPDB resmi dari Backend secara paralel
  useEffect(() => {
    if (!subdomain) return;
    let aktif = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        let opsi = null;
        let profilSekolah = null;

        // Ambil data profil dan opsi PPDB secara bersamaan
        const [resProfil, resPub] = await Promise.allSettled([
          getProfilSekolahPublik(subdomain),
          publikService.getPpdbOptions(subdomain),
        ]);

        if (resPub.status === "fulfilled" && resPub.value) {
          opsi = resPub.value?.data || resPub.value;
        }

        if (resProfil.status === "fulfilled" && resProfil.value?.data) {
          profilSekolah = resProfil.value.data;
        }

        const sid = profilSekolah?.id || opsi?.sekolah?.id;
        if (sid) {
          try {
            const resOpsi = await getOpsiPpdbSekolah(sid);
            if (resOpsi?.success && resOpsi?.data) {
              opsi = { ...opsi, ...resOpsi.data };
            }
          } catch {
            // Gunakan opsi dari endpoint publik jika gagal
          }
        }

        if (!aktif) return;

        const combinedSekolah = opsi?.sekolah || profilSekolah || null;
        setSekolah(combinedSekolah);
        setOpsiData(opsi);
      } catch (err) {
        if (!aktif) return;
        setError(err?.message || "Gagal memuat informasi PPDB sekolah.");
      } finally {
        if (aktif) setLoading(false);
      }
    }

    loadData();

    return () => {
      aktif = false;
    };
  }, [subdomain]);

  // Muat pengumuman resmi PPDB
  useEffect(() => {
    if (!subdomain) return;
    let aktif = true;

    publikService
      .getPpdbPengumuman(subdomain, { page: 1, limit: 3 })
      .then((res) => {
        if (!aktif) return;
        setPengumuman(Array.isArray(res?.data) ? res.data : []);
      })
      .catch(() => {
        if (!aktif) return;
        setPengumuman([]);
      })
      .finally(() => {
        if (aktif) setPengumumanLoading(false);
      });

    return () => {
      aktif = false;
    };
  }, [subdomain]);

  const formatTanggal = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  };

  // Ekstraksi data dinamis dari Backend
  const namaSekolah =
    sekolah?.nama ||
    opsiData?.sekolah?.nama ||
    (tenant ? `Sekolah ${String(tenant).toUpperCase()}` : "SmartSchool");

  const jenjangSekolah =
    sekolah?.jenjang || opsiData?.sekolah?.jenjang || "";

  const daftarJalur = useMemo(() => {
    return Array.isArray(opsiData?.jalur) ? opsiData.jalur : [];
  }, [opsiData]);

  // Status Pendaftaran
  const pendaftaranDitutup = useMemo(() => {
    if (!opsiData) return false;
    if (opsiData?.pendaftaranDibuka === false) return true;
    if (
      daftarJalur.length > 0 &&
      daftarJalur.every(
        (j) =>
          j.pendaftaranBuka === false ||
          j.pendaftaranDibuka === false ||
          j.status === "nonaktif"
      )
    ) {
      return true;
    }
    return false;
  }, [opsiData, daftarJalur]);

  const pendaftaranAktif = !pendaftaranDitutup;

  const periodeText = useMemo(() => {
    const dates = [];
    daftarJalur.forEach((j) => {
      if (j.tanggalMulai) {
        const ms = new Date(j.tanggalMulai).getTime();
        if (!Number.isNaN(ms)) dates.push(ms);
      }
      if (j.tanggalSelesai) {
        const ms = new Date(j.tanggalSelesai).getTime();
        if (!Number.isNaN(ms)) dates.push(ms);
      }
    });

    if (Array.isArray(opsiData?.gelombang)) {
      opsiData.gelombang.forEach((g) => {
        if (g.tanggalMulai) {
          const ms = new Date(g.tanggalMulai).getTime();
          if (!Number.isNaN(ms)) dates.push(ms);
        }
        if (g.tanggalSelesai) {
          const ms = new Date(g.tanggalSelesai).getTime();
          if (!Number.isNaN(ms)) dates.push(ms);
        }
      });
    }

    if (dates.length === 0) return null;
    const minD = new Date(Math.min(...dates));
    const maxD = new Date(Math.max(...dates));
    return `${formatTanggal(minD)} – ${formatTanggal(maxD)}`;
  }, [daftarJalur, opsiData]);

  const totalKuota = useMemo(() => {
    return daftarJalur.reduce((sum, j) => {
      const k = Number(j.kuota);
      return !Number.isNaN(k) && k > 0 ? sum + k : sum;
    }, 0);
  }, [daftarJalur]);

  // Persyaratan Dokumen
  const daftarDokumen = useMemo(() => {
    const berkasSet = new Set();
    daftarJalur.forEach((j) => {
      if (Array.isArray(j.berkasWajib)) {
        j.berkasWajib.forEach((b) => {
          if (b && typeof b === "string") berkasSet.add(b.trim().toUpperCase());
        });
      }
    });

    if (berkasSet.size > 0) {
      return Array.from(berkasSet).map((code) => {
        const item = BERKAS_LABEL_MAP[code];
        return {
          nama: item?.nama || `Dokumen ${code}`,
          desc:
            item?.desc ||
            "Dokumen persyaratan resmi yang wajib diunggah pada formulir pendaftaran.",
        };
      });
    }

    return [
      {
        nama: "Kartu Keluarga (KK)",
        desc: "Pindaian atau foto dokumen Kartu Keluarga asli yang masih berlaku, NIK terlihat jelas.",
      },
      {
        nama: "Akta Kelahiran",
        desc: "Akta kelahiran resmi dari Disdukcapil sebagai bukti sah identitas dan tanggal lahir.",
      },
      {
        nama: "Ijazah / Surat Keterangan Lulus (SKL)",
        desc: "Ijazah jenjang sebelumnya atau Surat Keterangan Lulus (SKL) resmi dari pihak sekolah asal.",
      },
      {
        nama: "Dokumen Persyaratan Tambahan",
        desc: "Dokumen khusus atau pendukung sesuai kriteria jalur pendaftaran yang dipilih.",
      },
    ];
  }, [daftarJalur]);

  const handleDaftarClick = (jalurId = null) => {
    if (jalurId) {
      router.push(
        `${basePath}/PPDB/daftar?jalurPpdbId=${encodeURIComponent(jalurId)}`
      );
    } else {
      router.push(formDaftarUrl);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* 1. HERO EDITORIAL & RESMI PPDB (BUKAN HOMEPAGE, TANPA TOMBOL DAFTAR DI HERO) */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white">
        {/* Subtle geometric academic background accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"
        />

        <div className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16 sm:pb-12 lg:px-8">
          <div className="max-w-3xl">
            {/* Tag / Pre-header */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 py-1 text-xs font-semibold tracking-wider uppercase text-blue-700">
                <Building2 size={13} className="text-blue-600" />
                Portal Resmi PPDB
              </span>

              {jenjangSekolah && (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100/80 px-3 py-1 text-xs font-medium text-slate-700">
                  <GraduationCap size={13} className="text-slate-500" />
                  Jenjang {jenjangSekolah}
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  pendaftaranAktif
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border border-slate-200 bg-slate-100 text-slate-600"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    pendaftaranAktif
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-slate-400"
                  }`}
                />
                {pendaftaranAktif
                  ? "Pendaftaran Dibuka"
                  : "Pendaftaran Ditutup"}
              </span>
            </div>

            {/* Editorial Headline */}
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl lg:leading-[1.15]">
              Saatnya Memulai <br className="hidden sm:inline" />
              Perjalananmu di{" "}
              <span className="text-blue-600">{namaSekolah}</span>
            </h1>

            {/* Concise Official Mandate */}
            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Pusat informasi dan pendaftaran seleksi calon peserta didik baru{" "}
              {namaSekolah}. Pelajari ketentuan jalur, persyaratan dokumen, dan
              alur seleksi sebelum mengisi formulir online.
            </p>

            {/* Secondary Action: Cek Status Pendaftaran */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => router.push(`${basePath}/PPDB/cek-pendaftaran`)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-blue-600"
              >
                <Search size={14} className="text-slate-500" />
                Sudah mendaftar? Cek status pendaftaran Anda →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. UNIFIED INFORMATION BAR (SATU KESATUAN VISUAL YANG KUAT) */}
      <section className="relative -mt-6 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-lg shadow-slate-200/50">
          <div className="grid grid-cols-1 gap-6 divide-y divide-slate-100 sm:grid-cols-3 sm:gap-0 sm:divide-y-0 sm:divide-x sm:divide-slate-200/80">
            {/* 1. Status Pendaftaran */}
            <div className="flex flex-col justify-center sm:pr-6">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Status Penerimaan
              </span>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    pendaftaranAktif
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-slate-400"
                  }`}
                />
                <span className="text-xl font-semibold text-slate-900 sm:text-2xl">
                  {pendaftaranAktif ? "Dibuka" : "Ditutup"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {pendaftaranAktif
                  ? "Pendaftaran online dapat dilakukan sekarang"
                  : "Pendaftaran saat ini belum dibuka / telah ditutup"}
              </p>
            </div>

            {/* 2. Periode Pendaftaran */}
            <div className="flex flex-col justify-center pt-4 sm:pt-0 sm:px-6">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Periode Pendaftaran
              </span>
              <span className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
                {periodeText || "Sesuai Jadwal Jalur"}
              </span>
              <p className="mt-1 text-xs text-slate-500">
                Jadwal resmi pelaksanaan pendaftaran dan seleksi
              </p>
            </div>

            {/* 3. Total Kuota */}
            <div className="flex flex-col justify-center pt-4 sm:pt-0 sm:pl-6">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Daya Tampung
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-semibold text-blue-600 sm:text-2xl">
                  {totalKuota > 0 ? `${totalKuota}` : "—"}
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {totalKuota > 0 ? "Siswa" : "Kuota Diatur per Jalur"}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {daftarJalur.length > 0
                  ? `Tersedia pada ${daftarJalur.length} jalur seleksi aktif`
                  : "Daftar jalur sedang dipersiapkan"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BODY KONTEN UTAMA */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 space-y-16 sm:space-y-20">
        {/* 3. SECTION JALUR PENDAFTARAN (FEATURE CARD BESAR JIKA 1 JALUR, ATAU GRID PROPORSIONAL) */}
        <section id="jalur-pendaftaran" className="scroll-mt-12">
          {/* Header Section */}
          <div className="mb-8">
            <span className="text-xs font-medium uppercase tracking-widest text-blue-600">
              Pilihan Pendaftaran
            </span>
            <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Pilih Jalur Pendaftaran
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Pilih jalur yang paling sesuai dengan kondisi dan kualifikasi
              Anda.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-3" />
              Memuat pilihan jalur seleksi...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              <p className="font-semibold">Gagal Mengambil Data Jalur</p>
              <p className="mt-1">{error}</p>
            </div>
          ) : daftarJalur.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Belum ada jalur pendaftaran aktif yang tersedia saat ini.
            </div>
          ) : daftarJalur.length === 1 ? (
            /* POLA 1: SINGLE JALUR -> FEATURE CARD BESAR MEMANFAATKAN LEBAR PENUH */
            (() => {
              const j = daftarJalur[0];
              const isBuka =
                j.pendaftaranBuka !== false &&
                j.pendaftaranDibuka !== false &&
                (j.status === "aktif" || !j.status);

              return (
                <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-md transition-shadow hover:shadow-lg">
                  {/* Top Bar Aksentuasi */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-3.5 sm:px-8">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <MapPin size={16} />
                      </span>
                      <span className="text-xs font-medium uppercase tracking-wider text-slate-700">
                        {j.kategori ? `Jalur ${j.kategori}` : "Jalur Seleksi Utama"}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold ${
                        isBuka
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isBuka ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {isBuka ? "Tersedia" : "Ditutup"}
                    </span>
                  </div>

                  {/* Body Card Besar */}
                  <div className="p-6 sm:p-8 lg:p-10">
                    <h3 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                      {j.nama}
                    </h3>

                    {j.deskripsi && (
                      <p className="mt-2 text-base leading-relaxed text-slate-600 sm:text-lg">
                        {j.deskripsi}
                      </p>
                    )}

                    {/* Parameter Grid Besar (3 Box Lapang) */}
                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {/* Kuota */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                          Kuota Pendaftar
                        </span>
                        <div className="mt-1 text-2xl font-semibold text-slate-900">
                          {j.kuota > 0 ? `${j.kuota} Siswa` : "Sesuai Kuota"}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          Daya tampung maksimal penerimaan
                        </p>
                      </div>

                      {/* Jarak Maksimal atau Metode */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                          {j.jarakMaksimalKm ? "Jarak Maksimal" : "Metode Seleksi"}
                        </span>
                        <div className="mt-1 text-2xl font-semibold text-slate-900">
                          {j.jarakMaksimalKm
                            ? `${j.jarakMaksimalKm} KM`
                            : j.metodeRanking
                            ? j.metodeRanking.toUpperCase()
                            : "Verifikasi Berkas"}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {j.jarakMaksimalKm
                            ? "Radius jarak domisili ke sekolah"
                            : "Kriteria penentuan kelulusan"}
                        </p>
                      </div>

                      {/* Nilai Minimal atau Jadwal */}
                      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-5">
                        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                          {j.nilaiMinimal ? "Nilai Minimal" : "Status Seleksi"}
                        </span>
                        <div className="mt-1 text-2xl font-semibold text-slate-900">
                          {j.nilaiMinimal ? `Nilai ${j.nilaiMinimal}` : "Terbuka"}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {j.nilaiMinimal
                            ? "Standar nilai rapor / kelulusan"
                            : "Pendaftaran dapat diajukan online"}
                        </p>
                      </div>
                    </div>

                    {/* Baris Jadwal & Tombol Pilih Jalur */}
                    <div className="mt-8 flex flex-col justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600 sm:text-sm">
                        <Calendar size={16} className="text-slate-400" />
                        <span>
                          Periode Jalur:{" "}
                          <strong className="text-slate-900">
                            {j.tanggalMulai
                              ? `${formatTanggal(j.tanggalMulai)} – ${formatTanggal(j.tanggalSelesai)}`
                              : "Sesuai Jadwal PPDB"}
                          </strong>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDaftarClick(j.id)}
                        disabled={!isBuka}
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold shadow-sm transition-all ${
                          isBuka
                            ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                            : "cursor-not-allowed bg-slate-200 text-slate-400"
                        }`}
                      >
                        Pilih Jalur Ini
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            /* POLA 2: MULTI JALUR -> GRID PROPORSIONAL YANG LAPANG */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {daftarJalur.map((j) => {
                const isBuka =
                  j.pendaftaranBuka !== false &&
                  j.pendaftaranDibuka !== false &&
                  (j.status === "aktif" || !j.status);

                return (
                  <div
                    key={j.id}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium uppercase tracking-wider text-blue-600">
                          {j.kategori || "Jalur Seleksi"}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            isBuka
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {isBuka ? "Tersedia" : "Ditutup"}
                        </span>
                      </div>

                      <h3 className="mt-3 text-xl font-semibold text-slate-900">
                        {j.nama}
                      </h3>

                      {j.deskripsi && (
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">
                          {j.deskripsi}
                        </p>
                      )}

                      {/* Detail Parameter Grid */}
                      <div className="mt-5 space-y-2 rounded-xl bg-slate-50 p-4 text-xs border border-slate-100">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Kuota:</span>
                          <span className="font-medium text-slate-900">
                            {j.kuota > 0 ? `${j.kuota} Siswa` : "Sesuai Kuota"}
                          </span>
                        </div>

                        {j.jarakMaksimalKm && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Jarak Maksimal:</span>
                            <span className="font-medium text-slate-900">
                              {j.jarakMaksimalKm} KM
                            </span>
                          </div>
                        )}

                        {j.nilaiMinimal && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Nilai Minimal:</span>
                            <span className="font-medium text-slate-900">
                              {j.nilaiMinimal}
                            </span>
                          </div>
                        )}

                        {j.metodeRanking && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Metode:</span>
                            <span className="font-medium text-slate-900 capitalize">
                              {j.metodeRanking}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleDaftarClick(j.id)}
                        disabled={!isBuka}
                        className={`inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                          isBuka
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "cursor-not-allowed bg-slate-200 text-slate-400"
                        }`}
                      >
                        Pilih Jalur Ini
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 4. SECTION PERSYARATAN (CHECKLIST ELEGAN DENGAN NUMBERING: 01, 02, 03) */}
        <section id="persyaratan" className="scroll-mt-12">
          <div className="mb-8">
            <span className="text-xs font-medium uppercase tracking-widest text-emerald-600">
              Kelengkapan Dokumen
            </span>
            <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Dokumen yang Perlu Disiapkan
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Siapkan berkas asli berikut dalam bentuk dokumen digital (scan
              atau foto jelas) sebelum memulai pendaftaran.
            </p>
          </div>

          {/* List Checklist Elegan */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm divide-y divide-slate-100">
            {daftarDokumen.map((doc, idx) => {
              const numStr = String(idx + 1).padStart(2, "0");
              return (
                <div
                  key={idx}
                  className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 transition-colors hover:bg-slate-50/60"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 font-mono text-sm font-semibold text-blue-600">
                      {numStr}
                    </span>
                    <div>
                      <h3 className="text-base font-medium text-slate-900 sm:text-lg">
                        {doc.nama}
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                        {doc.desc}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex self-start sm:self-center shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    <CheckCircle2 size={14} />
                    Wajib Disiapkan
                  </span>
                </div>
              );
            })}
          </div>

          {/* Banner Informasi Ketentuan Format Dokumen */}
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 sm:text-sm">
            <HelpCircle size={18} className="mt-0.5 shrink-0 text-slate-500" />
            <div>
              <p className="font-medium text-slate-800">
                Ketentuan Berkas Digital:
              </p>
              <p className="mt-0.5 leading-relaxed">
                Dokumen yang diunggah harus dalam format{" "}
                <strong>JPG, PNG, atau PDF</strong> dengan ukuran file maksimal{" "}
                <strong>5 MB</strong> per dokumen. Pastikan pindaian atau foto
                dokumen terlihat terang, teks terbaca jelas, dan tidak terpotong.
              </p>
            </div>
          </div>
        </section>

        {/* 5. SECTION CARA MENDAFTAR (TIMELINE HORIZONTAL DESKTOP / VERTICAL MOBILE) */}
        <section id="cara-mendaftar" className="scroll-mt-12">
          <div className="mb-8">
            <span className="text-xs font-medium uppercase tracking-widest text-blue-600">
              Alur Pelaksanaan
            </span>
            <h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Cara Mendaftar
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Ikuti 5 langkah mudah proses pendaftaran hingga pengumuman hasil
              seleksi akhir.
            </p>
          </div>

          {/* DESKTOP TIMELINE: 5 Langkah Horizontal dengan Garis Penghubung */}
          <div className="hidden lg:block rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm">
            <div className="relative flex justify-between">
              {/* Garis Penghubung Horizontal */}
              <div
                aria-hidden="true"
                className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-0"
              />

              {TAHAPAN_PENDAFTARAN.map((t) => (
                <div
                  key={t.step}
                  className="relative z-10 flex flex-1 flex-col items-center px-2 text-center"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-blue-600 font-mono text-xs font-semibold text-white shadow-md">
                    {t.step}
                  </div>

                  <h3 className="mt-4 text-sm font-medium text-slate-900">
                    {t.title}
                  </h3>

                  <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                    {t.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* MOBILE & TABLET TIMELINE: Runtun Vertikal dengan Garis Sisi Kiri */}
          <div className="lg:hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {TAHAPAN_PENDAFTARAN.map((t) => (
                <div key={t.step} className="relative">
                  {/* Lingkaran Titik Step */}
                  <div className="absolute -left-6 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-600 font-mono text-[10px] font-semibold text-white shadow-sm">
                    {t.step}
                  </div>

                  <h3 className="text-base font-medium text-slate-900">
                    {t.title}
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {t.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. SECTION PENGUMUMAN PPDB (VISUAL WEIGHT SEIMBANG) */}
        {pengumuman.length > 0 && (
          <section id="pengumuman-ppdb" className="scroll-mt-12">
            <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-medium uppercase tracking-widest text-rose-600">
                  Informasi Resmi
                </span>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 sm:text-2xl">
                  Pengumuman PPDB
                </h2>
              </div>

              <button
                type="button"
                onClick={() => router.push(`${basePath}/PPDB/pengumuman`)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                Lihat Semua ({pengumuman.length})
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
              {pengumumanLoading ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Memuat pengumuman terbaru...
                </div>
              ) : (
                pengumuman.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => router.push(`${basePath}/PPDB/pengumuman`)}
                    className="block w-full p-5 text-left transition-colors hover:bg-slate-50"
                  >
                    <span className="text-xs font-medium text-slate-400">
                      {formatTanggal(item.dipublikasikanPada)}
                    </span>
                    <h3 className="mt-1 text-base font-medium text-slate-900">
                      {item.judul}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed">
                      {item.konten}
                    </p>
                  </button>
                ))
              )}
            </div>
          </section>
        )}

        {/* 7. CTA UTAMA: FINAL CONVERSION POINT DI BAGIAN AKHIR */}
        <section id="daftar-sekarang" className="scroll-mt-12">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-center text-white shadow-xl sm:p-14 lg:p-16">
            {/* Subtle background glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl"
            />

            <div className="relative z-10 mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-medium tracking-wider uppercase text-blue-300">
                <Sparkles size={13} />
                Langkah Terakhir
              </span>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Siap untuk mendaftar?
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                Pastikan semua persyaratan sudah dipersiapkan sebelum memulai.
                Isi formulir pendaftaran dengan teliti dan benar.
              </p>

              {/* Tombol Utama Daftar Sekarang */}
              <div className="mt-8 flex flex-col items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => handleDaftarClick()}
                  disabled={pendaftaranDitutup}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-9 py-4 text-base font-semibold shadow-lg transition-all ${
                    pendaftaranAktif
                      ? "bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/25 active:scale-95"
                      : "cursor-not-allowed bg-slate-700 text-slate-400 shadow-none"
                  }`}
                >
                  Daftar Sekarang
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`${basePath}/PPDB/cek-pendaftaran`)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-white"
                >
                  Sudah mendaftar? Cek status pendaftaran →
                </button>
              </div>

              {pendaftaranDitutup && (
                <p className="mt-4 text-xs text-amber-300">
                  * Pendaftaran saat ini belum dibuka atau telah ditutup oleh
                  pihak sekolah.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* 8. STICKY QUICK ACTION BAR (HANYA MUNCUL SETELAH USER SCROLL JAUH) */}
      {showStickyCta && (
        <aside
          aria-label="Bilah Aksi Cepat PPDB"
          className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 shadow-lg transition-all duration-300"
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-900">
                Penerimaan Peserta Didik Baru • {namaSekolah}
              </p>
              <p className="text-[11px] text-slate-500">
                {pendaftaranAktif
                  ? "Pendaftaran online sedang dibuka."
                  : "Pendaftaran saat ini ditutup."}
              </p>
            </div>

            <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
              <button
                type="button"
                onClick={() => router.push(`${basePath}/PPDB/cek-pendaftaran`)}
                className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Search size={13} />
                Cek Status
              </button>

              <button
                type="button"
                onClick={() => handleDaftarClick()}
                disabled={pendaftaranDitutup}
                className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-xs font-semibold shadow-sm transition-all ${
                  pendaftaranAktif
                    ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                    : "cursor-not-allowed bg-slate-300 text-slate-500"
                }`}
              >
                Daftar Sekarang
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
