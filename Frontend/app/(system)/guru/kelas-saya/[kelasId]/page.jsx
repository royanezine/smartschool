"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getStoredUser } from "@/lib/auth";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Users,
  School,
  RefreshCw,
  Loader2,
  AlertCircle,
  UserRound,
} from "lucide-react";
import { getKelasMapel } from "@/services/kelasMapel.service";
import { getKelasById } from "@/services/kelas.service";
import Sidebar from "@/app/components/Sidebar";
import Header from "@/app/components/Header";


function getTeacherId(user) {
  const id = user?.userId || user?.id || user?.penggunaId || user?.guruId ||
    user?.guru?.id || user?.data?.userId || user?.data?.id || "";
  return id ? String(id) : "";
}

function getTeacherName(user) {
  const value = user?.namaLengkap || user?.namalengkap || user?.nama || user?.name ||
    user?.fullName || user?.full_name || user?.namaPengguna || user?.username ||
    user?.guru?.namaLengkap || "Guru";
  return typeof value === "string" && value.trim() ? value.trim() : "Guru";
}

function unwrapArray(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.list)) return response.list;
  return [];
}

function teacherIds(item) {
  return [
    item?.guruId, item?.guruPengajarId, item?.guru?.id,
    item?.guruPengajar?.id, item?.guru?.userId, item?.guruPengajar?.userId,
    item?.pengajarId, item?.pengajar?.id, item?.guru?.penggunaId,
    item?.guruPengajar?.penggunaId,
  ].filter((value) => value !== undefined && value !== null && value !== "").map(String);
}

function classId(item) {
  const id = item?.kelasId || item?.kelas?.id || item?.idKelas || item?.kelas?.kelasId || "";
  return id ? String(id) : "";
}

function className(item) {
  return item?.kelas?.nama || item?.kelas?.namaKelas || item?.namaKelas ||
    item?.kelasNama || item?.nama || "Kelas";
}

function subjectName(item) {
  return item?.mataPelajaran?.nama || item?.mataPelajaran?.namaMataPelajaran ||
    item?.mapel?.nama || item?.namaMataPelajaran || item?.namaMapel ||
    item?.mapelNama || item?.nama || "Mata Pelajaran";
}

function countStudents(item) {
  const candidates = [
    item?.jumlahSiswa, item?.totalSiswa, item?.jumlah_siswa, item?.total_siswa,
    item?.kelas?.jumlahSiswa, item?.kelas?.totalSiswa,
    item?.kelas?.jumlah_siswa, item?.kelas?.total_siswa,
    item?.siswa?.length, item?.anggota?.length,
    item?.kelas?.siswa?.length, item?.kelas?.anggota?.length,
    item?.kelas?.siswaKelas?.length, item?.kelas?.anggotaKelas?.length,
    item?.kelas?.daftarSiswa?.length,
  ];
  const count = candidates.find((value) => typeof value === "number" && Number.isFinite(value) && value >= 0);
  return typeof count === "number" ? count : null;
}

function getStudentList(assignments, classDetail) {
  const possibleLists = [
    classDetail?.anggota,
    classDetail?.anggotaKelas,
    classDetail?.siswaKelas,
    classDetail?.daftarSiswa,
    classDetail?.siswa,
    classDetail?.kelas?.anggota,
    classDetail?.kelas?.siswaKelas,
    classDetail?.kelas?.daftarSiswa,
  ];

  const lists = [...possibleLists];

  for (const item of assignments) {
    lists.push(
      item?.anggota,
      item?.siswaKelas,
      item?.daftarSiswa,
      item?.kelas?.anggota,
      item?.kelas?.siswaKelas,
      item?.kelas?.daftarSiswa,
    );
  }

  const result = [];

  for (const list of lists) {
    if (!Array.isArray(list)) continue;

    for (const entry of list) {
      const student =
        entry?.siswa ||
        entry?.pesertaDidik ||
        entry?.siswaKelas?.siswa ||
        entry?.user ||
        entry;

      const user = student?.user || student?.pengguna || {};

      const id =
        student?.id ||
        student?.siswaId ||
        entry?.siswaId ||
        student?.penggunaId ||
        user?.id;

      const name =
        student?.namaLengkap ||
        student?.nama_lengkap ||
        student?.nama ||
        student?.name ||
        student?.fullName ||
        student?.full_name ||
        user?.namaLengkap ||
        user?.nama ||
        user?.name;

      const nis =
        student?.nis ||
        student?.nomorInduk ||
        student?.nomorIndukSiswa ||
        student?.nisn ||
        entry?.nis ||
        user?.nis ||
        "—";

      if (!id && !name) continue;

      result.push({
        id: String(id || name),
        name: name || "Nama siswa belum tersedia",
        nis,
      });
    }
  }

  const unique = new Map();

  for (const student of result) {
    if (!unique.has(student.id)) {
      unique.set(student.id, student);
    }
  }

  return [...unique.values()];
}

export default function GuruDetailKelasPage() {
  const params = useParams();
  const router = useRouter();
  const kelasId = String(params?.kelasId || "");
  const [teacher, setTeacher] = useState({ id: "", name: "Guru", email: "" });
  const [assignments, setAssignments] = useState([]);
  const [classDetail, setClassDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const user = getStoredUser();
      setTeacher({
        id: getTeacherId(user),
        name: getTeacherName(user),
        email: user?.email || user?.emailPengguna || "",
      });
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const loadDetail = useCallback(async () => {
  setLoading(true);
  setErrorMessage("");
  setClassDetail(null);

  try {
    const user = getStoredUser();
    const idGuru = getTeacherId(user);

    if (!user) {
      throw new Error(
        "Data akun tidak ditemukan. Silakan login kembali."
      );
    }

    if (!idGuru) {
      throw new Error(
        "ID guru tidak ditemukan pada data login."
      );
    }

    if (!kelasId) {
      throw new Error("ID kelas tidak valid.");
    }

    const response = await getKelasMapel();
    const data = unwrapArray(response);

    const owned = data.filter((item) =>
      teacherIds(item).includes(idGuru)
    );

    const selected = owned.filter(
      (item) => classId(item) === kelasId
    );

    if (!selected.length) {
      throw new Error(
        "Kelas ini tidak ditemukan pada daftar penugasan akun guru kamu."
      );
    }

    setAssignments(selected);

    try {
      const detailResponse = await getKelasById(kelasId);

      const detail =
        detailResponse?.data?.data ??
        detailResponse?.data ??
        detailResponse;

      if (detail && typeof detail === "object") {
        setClassDetail(detail);
      } else {
        console.warn(
          "[DETAIL KELAS] Format detail kelas tidak sesuai:",
          detailResponse
        );
      }

      console.log(
        "[DETAIL KELAS] Respons detail kelas:",
        detailResponse
      );

      console.log(
        "[DETAIL KELAS] Daftar anggota:",
        detail?.anggota
      );
    } catch (detailError) {
      console.error(
        "[DETAIL KELAS] Gagal mengambil anggota kelas:",
        detailError
      );
    }
  } catch (error) {
    console.error(
      "[DETAIL KELAS] Gagal memuat detail:",
      error
    );

    setAssignments([]);
    setClassDetail(null);

    setErrorMessage(
      error?.message ||
        "Gagal memuat detail kelas. Silakan coba lagi."
    );
  } finally {
    setLoading(false);
  }
}, [kelasId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDetail();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDetail]);

  const subjects = useMemo(() => [...new Set(assignments.map(subjectName))], [assignments]);
const students = useMemo(
  () => getStudentList(assignments, classDetail),
  [assignments, classDetail]
);

const studentCount = useMemo(() => {
  const candidates = [
    classDetail?.jumlahSiswa,
    classDetail?.totalSiswa,
    classDetail?.jumlah_siswa,
    classDetail?.total_siswa,
    classDetail?.anggota?.length,
    classDetail?.anggotaKelas?.length,
    classDetail?.siswaKelas?.length,
    classDetail?.daftarSiswa?.length,
    classDetail?.siswa?.length,
    ...assignments.map(countStudents),
  ];

  const count = candidates.find((value) => {
    if (value === null || value === undefined || value === "") {
      return false;
    }

    return (
      Number.isFinite(Number(value)) &&
      Number(value) >= 0
    );
  });

  if (count !== undefined) {
    return Number(count);
  }

  return students.length > 0 ? students.length : null;
}, [classDetail, assignments, students]);

const first = assignments[0];

const name =
  classDetail?.nama ||
  classDetail?.namaKelas ||
  classDetail?.kelas?.nama ||
  (first ? className(first) : "Detail Kelas");

const level =
  classDetail?.tingkat ||
  classDetail?.level ||
  classDetail?.jenjang ||
  classDetail?.kelas?.tingkat ||
  first?.kelas?.tingkat ||
  first?.kelas?.level ||
  first?.tingkat ||
  first?.level ||
  "Tingkat belum diatur";

const year =
  classDetail?.tahunAjaran?.nama ||
  classDetail?.tahunAjaran?.tahunAjaran ||
  (typeof classDetail?.tahunAjaran === "string"
    ? classDetail.tahunAjaran
    : "") ||
  first?.tahunAjaran?.nama ||
  first?.kelas?.tahunAjaran?.nama ||
  "Tahun ajaran aktif";

  return (
    <div className="flex min-h-screen w-full theme-page">
      <Sidebar role="guru" />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header user={teacher} />
        <main className="theme-page min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1400px] space-y-6 p-4 sm:p-6 lg:p-8">
            <button type="button" onClick={() => router.push("/guru/kelas-saya")} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:opacity-75">
              <ArrowLeft size={17} /> Kembali ke Kelas Saya
            </button>

            <section className="theme-card rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5 shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)] sm:p-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]"><School size={23} /></div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">AREA GURU / KELAS SAYA</p>
                    <h1 className="theme-text mt-1 break-words text-2xl font-bold">{loading ? "Memuat detail kelas..." : name}</h1>
                    <p className="theme-text-secondary mt-2 text-sm">Informasi kelas dan mata pelajaran yang kamu ajar.</p>
                  </div>
                </div>
                <button type="button" onClick={loadDetail} disabled={loading} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60">
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Muat ulang
                </button>
              </div>
            </section>

            {loading ? (
              <section className="theme-card flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]">
                <Loader2 className="animate-spin text-[var(--color-primary)]" size={25} />
                <p className="theme-text mt-3 text-sm font-semibold">Memuat informasi kelas...</p>
              </section>
            ) : errorMessage ? (
              <section className="theme-card flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] px-6 text-center">
                <AlertCircle size={26} className="text-[var(--color-warning)]" />
                <h2 className="theme-text mt-3 font-bold">Detail kelas belum tersedia</h2>
                <p className="theme-text-secondary mt-2 max-w-xl text-sm leading-6">{errorMessage}</p>
                <button type="button" onClick={loadDetail} className="mt-4 rounded-lg bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white">Coba lagi</button>
              </section>
            ) : (
              <>
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <article className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                    <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]"><School size={19} /></span><div><p className="theme-text-secondary text-sm">Nama kelas</p><p className="theme-text mt-1 font-bold">{name}</p></div></div>
                  </article>
                  <article className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                    <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]"><GraduationCap size={19} /></span><div><p className="theme-text-secondary text-sm">Tingkat</p><p className="theme-text mt-1 font-bold">{level}</p></div></div>
                  </article>
                  <article className="theme-card rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-5">
                    <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-info)_10%,transparent)] text-[var(--color-info)]"><Users size={19} /></span><div><p className="theme-text-secondary text-sm">Total siswa</p><p className="theme-text mt-1 text-2xl font-bold">{studentCount === null ? "—" : studentCount}</p></div></div>
                  </article>
                </section>

                <section className="theme-card overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]">
                  <div className="border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] p-5 sm:px-6">
                    <h2 className="theme-text font-bold">Mata Pelajaran</h2>
                    <p className="theme-text-secondary mt-1 text-sm">Mapel yang terhubung dengan kelas ini.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
                    {subjects.map((subject) => <div key={subject} className="flex items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)] p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] text-[var(--color-primary)]"><BookOpen size={18} /></span><span className="theme-text text-sm font-semibold">{subject}</span></div>)}
                  </div>
                </section>

                <section className="theme-card overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]">
                  <div className="flex flex-col gap-1 border-b border-[color-mix(in_srgb,var(--color-text)_8%,transparent)] p-5 sm:px-6">
                    <h2 className="theme-text font-bold">Daftar Siswa</h2>
                    <p className="theme-text-secondary text-sm">{students.length ? `${students.length} siswa tersedia dari data kelas.` : "Daftar siswa akan tampil jika API kelas-mapel menyertakan relasi siswa."}</p>
                  </div>
                  {students.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[520px] text-left text-sm">
                        <thead className="bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"><tr><th className="theme-text-secondary px-5 py-3 font-semibold">Nama siswa</th><th className="theme-text-secondary px-5 py-3 font-semibold">NIS/NISN</th></tr></thead>
                        <tbody>{students.map((student) => <tr key={student.id} className="border-t border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]"><td className="theme-text px-5 py-3"><span className="inline-flex items-center gap-2"><UserRound size={16} className="text-[var(--color-primary)]" />{student.name}</span></td><td className="theme-text-secondary px-5 py-3">{student.nis}</td></tr>)}</tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="px-5 py-8 text-center sm:px-6">
                      <Users size={25} className="mx-auto text-[var(--color-primary)]" />
                      <p className="theme-text mt-3 text-sm font-semibold">Data siswa belum disertakan oleh API</p>
                      <p className="theme-text-secondary mx-auto mt-1 max-w-xl text-sm leading-6">Total siswa tetap bisa ditampilkan jika respons backend memiliki field jumlahSiswa/totalSiswa. Untuk menampilkan nama setiap siswa, endpoint perlu mengirim relasi siswa atau tersedia endpoint daftar siswa berdasarkan kelas.</p>
                    </div>
                  )}
                </section>
                <p className="theme-text-secondary text-xs leading-5">Tahun ajaran: {year}. Data mengikuti penugasan guru dan informasi kelas yang dikirim oleh backend.</p>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
