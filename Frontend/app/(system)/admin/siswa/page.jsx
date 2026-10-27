"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";
import { getKelas, getKelasById } from "@/services/kelas.service";
import { getUsers, deleteUser } from "@/services/user.service";

import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle,
  XCircle,
  Download,
  Printer,
  FileSpreadsheet,
  ChevronDown,
  AlertTriangle,
  Loader2,
  IdCard,
} from "lucide-react";



const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";
const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";
const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";
const themePrimaryText = "text-[var(--color-primary)]";
const themePrimaryHover =
  "hover:bg-[color-mix(in_srgb,var(--color-primary)_8%,transparent)]";
const themePrimaryShadow =
  "shadow-[0_8px_20px_color-mix(in_srgb,var(--color-primary)_18%,transparent)]";
const themeCardShadow =
  "shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeSmallShadow =
  "shadow-[0_2px_8px_color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeNeutralSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]";
const themeNeutralHover =
  "hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)]";
const themeNeutralBorder =
  "border-[color-mix(in_srgb,var(--color-text)_10%,transparent)]";
const themeDivider =
  "border-[color-mix(in_srgb,var(--color-text)_8%,transparent)]";
const themeInfoSurface =
  "bg-[color-mix(in_srgb,var(--color-info)_8%,transparent)]";
const themeInfoBorder =
  "border-[color-mix(in_srgb,var(--color-info)_22%,transparent)]";
const themeSuccessSurface =
  "bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)]";
const themeSuccessBorder =
  "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)]";
const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";
const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";
const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";


function getResponseData(response) {
  if (!response) return [];

  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  if (Array.isArray(response.users)) return response.users;
  if (Array.isArray(response.data?.users)) return response.data.users;
  if (Array.isArray(response.rows)) return response.rows;
  if (Array.isArray(response.data?.rows)) return response.data.rows;

  return [];
}

function getClassResponseData(response) {
  if (Array.isArray(response)) return response;

  const candidates = [
    response?.data?.data,
    response?.data,
    response?.items,
    response?.rows,
  ];

  return candidates.find(Array.isArray) ?? [];
}

function getStudentClass(item) {
  if (!item) return "-";

  const getNamaKelas = (kelas) => {
    if (typeof kelas === "string") return kelas;

    return (
      kelas?.nama ??
      kelas?.namaKelas ??
      kelas?.kelasNama ??
      kelas?.kelas?.nama ??
      null
    );
  };

  const directClass = getNamaKelas(item.kelas);

  if (directClass) return directClass;

  const memberships =
    item.anggotaKelas ??
    item.kelasSiswa ??
    item.kelasAnggota ??
    item.anggota_kelas ??
    item.anggota ??
    [];

  if (Array.isArray(memberships)) {
    const activeMembership = memberships.find(
      (membership) =>
        !membership?.dihapusPada &&
        !membership?.dihapus_pada
    );

    const membership = activeMembership ?? memberships[0];

    if (membership) {
      const namaKelas =
        getNamaKelas(membership.kelas) ??
        getNamaKelas(membership.kelasDetail) ??
        membership.kelasNama ??
        membership.namaKelas;

      if (namaKelas) return namaKelas;
    }
  }

  return "-";
}

function normalizeSiswa(item) {
  if (!item) return null;

  const statusRaw = String(item.status ?? "aktif").toLowerCase();

  return {
    id: item.id ?? null,
    nama: item.namaLengkap ?? item.nama ?? item.namaPengguna ?? "-",
    namaPengguna: item.namaPengguna ?? "-",
    email: item.email ?? "-",
    nis: item.nis ?? item.nipd ?? "-",
    nisn: item.nisn ?? "-",
    nik: item.nik ?? "-",
    kelas: getStudentClass(item),
    phone: item.noTelepon ?? item.phone ?? "-",
    alamat: item.alamat ?? "-",
    alamatKtp: item.alamatKtp ?? "-",
    alamatDomisili: item.alamatDomisili ?? "-",
    kecamatan: item.kecamatan ?? "-",
    kelurahan: item.kelurahan ?? "-",
    kota: item.kota ?? "-",
    namaAyah: item.namaAyah ?? "-",
    pekerjaanAyah: item.pekerjaanAyah ?? "-",
    namaIbu: item.namaIbu ?? "-",
    pekerjaanIbu: item.pekerjaanIbu ?? "-",
    tglLahir: item.tanggalLahir ?? item.tglLahir ?? null,
    tempatLahir: item.tempatLahir ?? "-",
    gender: item.jenisKelamin ?? item.gender ?? "-",
    status: statusRaw === "aktif" ? "Aktif" : "Nonaktif",
    joinDate: item.dibuatPada ?? item.createdAt ?? null,
    sekolah: item.sekolah ?? null,
    peran: item.peran ?? null,
    raw: item,
  };
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatGender(value) {
  if (!value) return "-";

  const gender = String(value).toUpperCase();

  if (gender === "L") return "Laki-laki";
  if (gender === "P") return "Perempuan";

  return value;
}

function escapeHtml(value) {
  return String(value ?? "-").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}


export default function AdminSiswaPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [siswa, setSiswa] = useState([]);
  const [daftarKelas, setDaftarKelas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingKelas, setLoadingKelas] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [errorKelas, setErrorKelas] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");
  const [filterKelas, setFilterKelas] = useState("semua");
  const [sortBy, setSortBy] = useState("nama_asc");

  const [kelasSearch, setKelasSearch] = useState("");
  const [isKelasOpen, setIsKelasOpen] = useState(false);
  const kelasRef = useRef(null);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    id: null,
    nama: "",
  });
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);


const loadSiswa = useCallback(async (isRefresh = false) => {
  try {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    const response = await getUsers({ role: "siswa", page: 1, limit: 1000 });

    const result =
      response && typeof response.json === "function"
        ? await response.json()
        : response;

    if (response?.ok === false || result?.success === false) {
      throw new Error(
        result?.message || "Gagal mengambil data siswa."
      );
    }

    const rawData = getResponseData(result).filter(
      (item) => item && item.id
    );

    const kelasResponse = await getKelas({
      page: 1,
      limit: 1000,
      sortBy: "tingkat",
      sortOrder: "asc",
    });

    const kelasResult =
      kelasResponse && typeof kelasResponse.json === "function"
        ? await kelasResponse.json()
        : kelasResponse;

    if (
      kelasResponse?.ok === false ||
      kelasResult?.success === false
    ) {
      throw new Error(
        kelasResult?.message || "Gagal mengambil daftar kelas."
      );
    }

    const daftarKelasAPI = getClassResponseData(kelasResult);

    setDaftarKelas(daftarKelasAPI);

    const detailKelas = await Promise.all(
      daftarKelasAPI
        .filter((kelas) => kelas?.id)
        .map(async (kelas) => {
          try {
            const detailResponse = await getKelasById(kelas.id);

            const detail =
              detailResponse && typeof detailResponse.json === "function"
                ? await detailResponse.json()
                : detailResponse;

            if (
              detailResponse?.ok === false ||
              detail?.success === false
            ) {
              return null;
            }

            return (
              detail?.data?.data ??
              detail?.data ??
              detail
            );
          } catch (error) {
            console.error(
              `Gagal mengambil detail kelas ${kelas.id}:`,
              error
            );
            return null;
          }
        })
    );

    const kelasPerSiswa = new Map();

    for (const kelas of detailKelas) {
      if (!kelas?.id) continue;

      const anggota = Array.isArray(kelas.anggota)
        ? kelas.anggota
        : Array.isArray(kelas.anggotaKelas)
          ? kelas.anggotaKelas
          : [];

      for (const member of anggota) {
        const siswaId =
          member?.siswa?.id ??
          member?.pengguna?.id ??
          member?.siswaId ??
          member?.penggunaId ??
          member?.userId;

        if (!siswaId) continue;

        const namaKelas =
          kelas.nama ??
          kelas.namaKelas ??
          kelas.kelasNama;

        if (namaKelas && !kelasPerSiswa.has(String(siswaId))) {
          kelasPerSiswa.set(String(siswaId), namaKelas);
        }
      }
    }

    const normalized = rawData.map((item) => {
      const siswaNormal = normalizeSiswa(item);

      const kelasDariRelasi = getStudentClass(item);
      const kelasDariDetail = kelasPerSiswa.get(String(item.id));

      return {
        ...siswaNormal,
        kelas:
          kelasDariRelasi !== "-"
            ? kelasDariRelasi
            : kelasDariDetail ?? "-",
      };
    });

    setSiswa(normalized);
    setCurrentPage(1);
  } catch (err) {
    console.error("Gagal mengambil data siswa:", err);
    setError(
      err?.message || "Gagal mengambil data siswa dari backend."
    );
    setSiswa([]);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);


  const loadDaftarKelas = useCallback(async () => {
    try {
      setLoadingKelas(true);
      setErrorKelas("");

      const response = await getKelas({ page: 1, limit: 1000 });

      const result =
        response && typeof response.json === "function"
          ? await response.json()
          : response;

      if (response?.ok === false || result?.success === false) {
        throw new Error(
          result?.message || "Gagal mengambil daftar kelas."
        );
      }

      const rows = getClassResponseData(result);

      setDaftarKelas(
        rows.filter((item) => item && (item.id || item.nama))
      );
    } catch (err) {
      console.error("Gagal mengambil daftar kelas:", err);
      setErrorKelas(
        err?.message || "Gagal mengambil daftar kelas dari backend."
      );
      setDaftarKelas([]);
    } finally {
      setLoadingKelas(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSiswa();
      loadDaftarKelas();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadSiswa, loadDaftarKelas]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        kelasRef.current &&
        !kelasRef.current.contains(event.target)
      ) {
        setIsKelasOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  const uniqueKelas = useMemo(() => {
    const classNames = daftarKelas
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.nama ?? item?.namaKelas ?? item?.kelasNama
      )
      .filter(Boolean);

    const studentClassNames = siswa
      .map((item) => item.kelas)
      .filter((name) => name && name !== "-");

    return [...new Set([...classNames, ...studentClassNames])].sort(
      (a, b) => String(a).localeCompare(String(b), "id")
    );
  }, [daftarKelas, siswa]);

  const filteredKelasOptions = useMemo(() => {
    const keyword = kelasSearch.trim().toLowerCase();

    if (!keyword) return uniqueKelas;

    return uniqueKelas.filter((kelas) =>
      String(kelas).toLowerCase().includes(keyword)
    );
  }, [uniqueKelas, kelasSearch]);


  const filteredBySearch = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return siswa;

    return siswa.filter((item) =>
      [
        item.nama,
        item.nis,
        item.nisn,
        item.email,
        item.kelas,
        item.phone,
        item.nik,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(keyword)
      )
    );
  }, [siswa, search]);


  const filteredByStatus = useMemo(() => {
    if (filterStatus === "semua") return filteredBySearch;

    return filteredBySearch.filter(
      (item) => item.status === filterStatus
    );
  }, [filteredBySearch, filterStatus]);


  const filteredByKelas = useMemo(() => {
    if (filterKelas === "semua") return filteredByStatus;

    return filteredByStatus.filter(
      (item) => item.kelas === filterKelas
    );
  }, [filteredByStatus, filterKelas]);


  const sorted = useMemo(() => {
    return [...filteredByKelas].sort((a, b) => {
      switch (sortBy) {
        case "nama_asc":
          return String(a.nama).localeCompare(String(b.nama), "id");
        case "nama_desc":
          return String(b.nama).localeCompare(String(a.nama), "id");
        case "nis_asc":
          return String(a.nis).localeCompare(String(b.nis), "id");
        case "nis_desc":
          return String(b.nis).localeCompare(String(a.nis), "id");
        case "kelas":
          return String(a.kelas).localeCompare(String(b.kelas), "id");
        case "status":
          return String(a.status).localeCompare(String(b.status), "id");
        default:
          return 0;
      }
    });
  }, [filteredByKelas, sortBy]);


  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex =
    totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = sorted.slice(startIndex, endIndex);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 0);
    return () => clearTimeout(timer);
  }, [search, filterStatus, filterKelas, sortBy, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      const timer = setTimeout(() => {
        setCurrentPage(totalPages);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentPage, totalPages]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };


  const openDeleteModal = (id, nama) => {
    setDeleteModal({ open: true, id, nama });
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setDeleteModal({ open: false, id: null, nama: "" });
  };

  const confirmDelete = async () => {
    const id = deleteModal.id;
    if (!id) return;

    try {
      setDeleting(true);
      setError("");

      const response = await deleteUser(id);

      if (response?.ok === false) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result?.message || "Gagal menghapus siswa.");
      }

      setSiswa((previous) =>
        previous.filter((item) => item.id !== id)
      );

      setDeleteModal({ open: false, id: null, nama: "" });
    } catch (err) {
      console.error("Gagal menghapus siswa:", err);
      setError(err?.message || "Gagal menghapus data siswa.");
    } finally {
      setDeleting(false);
    }
  };


  const handleRefresh = () => {
    loadSiswa(true);
    loadDaftarKelas();
  };

  const resetFilter = () => {
    setSearch("");
    setFilterStatus("semua");
    setFilterKelas("semua");
    setKelasSearch("");
    setSortBy("nama_asc");
  };


  const exportHeaders = [
    "No",
    "Nama",
    "NIS",
    "NISN",
    "NIK",
    "Kelas",
    "Email",
    "Telepon",
    "Jenis Kelamin",
    "Tempat Lahir",
    "Tanggal Lahir",
    "Alamat",
    "Alamat KTP",
    "Alamat Domisili",
    "Kecamatan",
    "Kelurahan",
    "Kota",
    "Nama Ayah",
    "Pekerjaan Ayah",
    "Nama Ibu",
    "Pekerjaan Ibu",
    "Status",
    "Bergabung",
  ];

  const getExportRows = () =>
    sorted.map((item, index) => [
      index + 1,
      item.nama,
      item.nis,
      item.nisn,
      item.nik,
      item.kelas,
      item.email,
      item.phone,
      formatGender(item.gender),
      item.tempatLahir,
      formatDate(item.tglLahir),
      item.alamat,
      item.alamatKtp,
      item.alamatDomisili,
      item.kecamatan,
      item.kelurahan,
      item.kota,
      item.namaAyah,
      item.pekerjaanAyah,
      item.namaIbu,
      item.pekerjaanIbu,
      item.status,
      formatDate(item.joinDate),
    ]);

  const exportCSV = () => {
    const escapeCSV = (value) =>
      `"${String(value ?? "-").replace(/"/g, '""')}"`;

    const csv = [
      exportHeaders.map(escapeCSV).join(","),
      ...getExportRows().map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `data_siswa_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    const tableRows = getExportRows()
      .map(
        (row) =>
          `<tr>${row
            .map((cell) => `<td>${escapeHtml(cell)}</td>`)
            .join("")}</tr>`
      )
      .join("");

    const tableHtml = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            table { border-collapse: collapse; width: 100%; }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 7px 9px;
              font-size: 11px;
              font-family: Arial, sans-serif;
            }
            th { background: #2563eb; color: white; }
          </style>
        </head>
        <body>
          <table>
            <tr>${exportHeaders
              .map((header) => `<th>${escapeHtml(header)}</th>`)
              .join("")}</tr>
            ${tableRows}
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([tableHtml], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `data_siswa_${new Date()
      .toISOString()
      .slice(0, 10)}.xls`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const printWindow = window.open("", "_blank", "width=1200,height=800");

    if (!printWindow) {
      alert("Mohon izinkan popup browser untuk mencetak PDF.");
      return;
    }

    const headers = [
      "No",
      "Nama",
      "NIS",
      "NISN",
      "Kelas",
      "Email",
      "Telepon",
      "Status",
    ];

    const tableRows = sorted
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${escapeHtml(item.nama)}</td>
            <td>${escapeHtml(item.nis)}</td>
            <td>${escapeHtml(item.nisn)}</td>
            <td>${escapeHtml(item.kelas)}</td>
            <td>${escapeHtml(item.email)}</td>
            <td>${escapeHtml(item.phone)}</td>
            <td>${escapeHtml(item.status)}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <html>
        <head>
          <title>Data Siswa SmartSchool</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
            h1 { margin: 0; font-size: 20px; }
            p { color: #64748b; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th { background: #2563eb; color: white; padding: 8px; text-align: left; }
            td { border: 1px solid #cbd5e1; padding: 7px 8px; }
            tr:nth-child(even) { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>Data Siswa SmartSchool</h1>
          <p>Total ${sorted.length} siswa • ${new Date().toLocaleDateString("id-ID")}</p>
          <table>
            <tr>${headers
              .map((header) => `<th>${escapeHtml(header)}</th>`)
              .join("")}</tr>
            ${tableRows}
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };


  const totalSiswa = siswa.length;
  const totalAktif = siswa.filter((item) => item.status === "Aktif").length;
  const totalNonaktif = totalSiswa - totalAktif;
  const totalKelas = uniqueKelas.length;

  const getInitials = (nama) => {
    if (!nama) return "??";

    const parts = String(nama).trim().split(/\s+/);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return String(nama).substring(0, 2).toUpperCase();
  };

  const getAvatarClass = (nama) => {
    const variants = [
      "bg-[var(--color-primary)]",
      "bg-[var(--color-info)]",
      "bg-[var(--color-success)]",
      "bg-[var(--color-warning)]",
      "bg-[color-mix(in_srgb,var(--color-primary)_72%,var(--color-info))]",
    ];

    return variants[String(nama || "").length % variants.length];
  };


  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="siswa"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setIsCollapsed((previous) => !previous)}
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email: "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="w-full px-3 py-4 sm:px-4 md:px-6 lg:px-8 xl:px-10">
            <div className="w-full space-y-5">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${themePrimaryGradient} ${themePrimaryShadow} text-[var(--color-card)]`}
                  >
                    <Users size={21} />
                  </div>

                  <div className="min-w-0">
                    <h1 className="theme-text truncate text-xl font-semibold sm:text-2xl">
                      Data Siswa
                    </h1>
                    <p className="theme-text-secondary text-xs sm:text-sm">
                      Data induk peserta didik
                    </p>
                  </div>
                </div>

                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                  <div className="group relative">
                    <button
                      type="button"
                      className={`theme-input flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition ${themePrimaryText} ${themePrimarySoftBorder} hover:bg-[color-mix(in_srgb,var(--color-primary)_7%,transparent)]`}
                    >
                      <Download size={17} />
                      Export
                      <ChevronDown size={14} />
                    </button>

                    <div
                      className={`theme-card invisible absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border ${themeNeutralBorder} p-1 opacity-0 ${themeCardShadow} transition-all group-hover:visible group-hover:opacity-100`}
                    >
                      <button
                        type="button"
                        onClick={exportPDF}
                        className={`theme-text-secondary flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${themePrimaryHover} hover:text-[var(--color-primary)]`}
                      >
                        <Printer size={16} /> PDF
                      </button>
                      <button
                        type="button"
                        onClick={exportExcel}
                        className={`theme-text-secondary flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${themePrimaryHover} hover:text-[var(--color-primary)]`}
                      >
                        <FileSpreadsheet size={16} /> Excel
                      </button>
                      <button
                        type="button"
                        onClick={exportCSV}
                        className={`theme-text-secondary flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${themePrimaryHover} hover:text-[var(--color-primary)]`}
                      >
                        <FileSpreadsheet size={16} /> CSV
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing || loadingKelas}
                    className={`theme-input flex h-10 items-center gap-2 rounded-xl border ${themeNeutralBorder} px-3 text-sm font-medium theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-60`}
                    title="Refresh data"
                  >
                    <RefreshCw
                      size={16}
                      className={refreshing || loadingKelas ? "animate-spin" : ""}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/admin/siswa/tambah")}
                    className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-4 text-sm font-medium text-[var(--color-card)] ${themePrimaryShadow} transition hover:brightness-95 sm:flex-none`}
                  >
                    <Plus size={18} />
                    Tambah Siswa
                  </button>
                </div>
              </div>

              {(error || errorKelas) && (
                <div
                  className={`flex items-start gap-3 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} px-4 py-3`}
                >
                  <AlertTriangle
                    size={19}
                    className="theme-text mt-0.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="theme-text text-sm font-semibold">
                      {error ? "Gagal memuat data siswa" : "Gagal memuat daftar kelas"}
                    </p>
                    <p className="theme-text-secondary mt-1 break-words text-sm">
                      {error || errorKelas}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setErrorKelas("");
                    }}
                    className="theme-text-muted text-xl leading-none transition hover:text-[var(--color-primary)]"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}>
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}>
                      <Users size={16} />
                    </div>
                    <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wider">
                      Total Siswa
                    </p>
                  </div>
                  <p className="theme-text mt-1 text-2xl font-bold">{totalSiswa}</p>
                </div>

                <div className={`theme-card rounded-xl border ${themeSuccessBorder} p-4 ${themeCardShadow}`}>
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${themeSuccessSurface} text-[var(--color-success)]`}>
                      <CheckCircle size={16} />
                    </div>
                    <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wider">
                      Aktif
                    </p>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-[var(--color-success)]">
                    {totalAktif}
                  </p>
                </div>

                <div className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}>
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${themeDangerSurface} theme-text-secondary`}>
                      <XCircle size={16} />
                    </div>
                    <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wider">
                      Nonaktif
                    </p>
                  </div>
                  <p className="theme-text mt-1 text-2xl font-bold">{totalNonaktif}</p>
                </div>

                <div className={`theme-card rounded-xl border ${themeInfoBorder} p-4 ${themeCardShadow}`}>
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${themeInfoSurface} text-[var(--color-info)]`}>
                      <Users size={16} />
                    </div>
                    <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wider">
                      Kelas
                    </p>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-[var(--color-info)]">
                    {loadingKelas ? "…" : totalKelas}
                  </p>
                </div>
              </div>

              <div className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}>
                <div className="flex flex-col gap-3">
                  <div className="relative w-full">
                    <Search
                      size={17}
                      className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                    />
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Cari nama, NIS, NISN, kelas, email, telepon..."
                      className={`theme-input theme-text w-full rounded-xl border ${themeNeutralBorder} py-2.5 pl-10 pr-4 text-sm outline-none transition ${themeFocus}`}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={filterStatus}
                      onChange={(event) => setFilterStatus(event.target.value)}
                      className={`theme-input theme-text min-w-[130px] rounded-lg border ${themeNeutralBorder} px-3 py-1.5 text-sm outline-none ${themeFocus}`}
                    >
                      <option value="semua">Semua Status</option>
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>

                    <div ref={kelasRef} className="relative min-w-[180px]">
                      <div className={`theme-input rounded-lg border ${themeNeutralBorder} px-3 py-1.5`}>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={kelasSearch}
                            onChange={(event) => {
                              setKelasSearch(event.target.value);
                              setIsKelasOpen(true);
                            }}
                            onFocus={() => setIsKelasOpen(true)}
                            placeholder={
                              loadingKelas
                                ? "Memuat kelas..."
                                : filterKelas === "semua"
                                  ? "Semua Kelas"
                                  : filterKelas
                            }
                            className="theme-text min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-text-placeholder)]"
                            autoComplete="off"
                          />
                          <ChevronDown
                            size={16}
                            className={`theme-text-muted shrink-0 transition-transform ${isKelasOpen ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>

                      {isKelasOpen && (
                        <div className={`theme-card absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border ${themeNeutralBorder} ${themeCardShadow}`}>
                          <button
                            type="button"
                            onClick={() => {
                              setFilterKelas("semua");
                              setKelasSearch("");
                              setIsKelasOpen(false);
                            }}
                            className={`theme-text flex w-full px-3 py-2 text-left text-sm transition ${themePrimaryHover} ${filterKelas === "semua" ? `${themePrimarySoft} font-semibold ${themePrimaryText}` : ""}`}
                          >
                            Semua Kelas
                          </button>

                          {loadingKelas ? (
                            <div className="theme-text-muted flex items-center gap-2 px-3 py-3 text-sm">
                              <Loader2 size={15} className="animate-spin" />
                              Memuat daftar kelas...
                            </div>
                          ) : filteredKelasOptions.length === 0 ? (
                            <div className="theme-text-muted px-3 py-3 text-sm">
                              {errorKelas || "Belum ada kelas"}
                            </div>
                          ) : (
                            filteredKelasOptions.map((kelas) => (
                              <button
                                type="button"
                                key={kelas}
                                onClick={() => {
                                  setFilterKelas(kelas);
                                  setKelasSearch("");
                                  setIsKelasOpen(false);
                                }}
                                className={`theme-text flex w-full px-3 py-2 text-left text-sm transition ${themePrimaryHover} ${filterKelas === kelas ? `${themePrimarySoft} font-semibold ${themePrimaryText}` : ""}`}
                              >
                                {kelas}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    <select
                      value={sortBy}
                      onChange={(event) => setSortBy(event.target.value)}
                      className={`theme-input theme-text min-w-[140px] rounded-lg border ${themeNeutralBorder} px-3 py-1.5 text-sm outline-none ${themeFocus}`}
                    >
                      <option value="nama_asc">Nama A-Z</option>
                      <option value="nama_desc">Nama Z-A</option>
                      <option value="nis_asc">NIS A-Z</option>
                      <option value="nis_desc">NIS Z-A</option>
                      <option value="kelas">Kelas</option>
                      <option value="status">Status</option>
                    </select>

                    <button
                      type="button"
                      onClick={resetFilter}
                      className={`theme-text-secondary rounded-lg px-3 py-1.5 text-sm transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                    >
                      Reset
                    </button>

                    <span className="theme-text-secondary ml-auto hidden text-sm sm:inline">
                      {filteredByKelas.length} siswa ditemukan
                    </span>
                  </div>
                </div>
              </div>

              <div className={`theme-card w-full overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}>
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className={themePrimaryGradient}>
                        <th className="w-[5%] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-card)]">
                          No
                        </th>
                        <th className="w-[25%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-card)]">
                          Profil
                        </th>
                        <th className="w-[11%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-card)]">
                          NIS
                        </th>
                        <th className="w-[13%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-card)]">
                          NISN
                        </th>
                        <th className="w-[13%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-card)]">
                          Kelas
                        </th>
                        <th className="hidden w-[18%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-card)] md:table-cell">
                          Email
                        </th>
                        <th className="w-[10%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-card)]">
                          Status
                        </th>
                        <th className="w-[13%] px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-card)]">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className={`divide-y ${themeDivider}`}>
                      {loading && (
                        <tr>
                          <td colSpan={8} className="px-4 py-16 text-center">
                            <div className="flex flex-col items-center">
                              <Loader2 size={30} className="animate-spin text-[var(--color-primary)]" />
                              <p className="theme-text mt-3 text-sm font-medium">
                                Mengambil data siswa...
                              </p>
                              <p className="theme-text-muted mt-1 text-xs">
                                Menghubungkan ke database SmartSchool
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}

                      {!loading &&
                        currentItems.map((item, index) => (
                          <tr
                            key={item.id}
                            className="group transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]"
                          >
                            <td className="theme-text-secondary px-3 py-4 text-center text-sm font-medium">
                              {startIndex + index + 1}
                            </td>

                            <td className="px-3 py-4">
                              <div className="flex min-w-0 items-center gap-3">
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getAvatarClass(item.nama)} text-sm font-bold text-[var(--color-card)] ${themeSmallShadow}`}
                                >
                                  {getInitials(item.nama)}
                                </div>
                                <div className="min-w-0">
                                  <p className="theme-text truncate text-sm font-semibold">
                                    {item.nama}
                                  </p>
                                  <p className="theme-text-muted truncate text-xs">
                                    {formatGender(item.gender)}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="theme-text-secondary px-3 py-4 text-sm">
                              {item.nis}
                            </td>

                            <td className="theme-text-secondary px-3 py-4 text-sm">
                              {item.nisn}
                            </td>

                            <td className="px-3 py-4">
                              {item.kelas !== "-" ? (
                                <span className={`inline-flex whitespace-nowrap rounded-lg ${themeInfoSurface} px-2.5 py-1 text-xs font-medium text-[var(--color-info)]`}>
                                  {item.kelas}
                                </span>
                              ) : (
                                <span className="theme-text-muted text-sm">
                                  Belum masuk kelas
                                </span>
                              )}
                            </td>

                            <td className="hidden px-3 py-4 md:table-cell">
                              <span className="theme-text-secondary block max-w-[220px] truncate text-sm">
                                {item.email}
                              </span>
                            </td>

                            <td className="px-3 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${
                                  item.status === "Aktif"
                                    ? `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`
                                    : `${themeDangerSurface} ${themeDangerBorder} theme-text-secondary`
                                }`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {item.status}
                              </span>
                            </td>

                            <td className="px-3 py-4">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => router.push(`/admin/siswa/${item.id}`)}
                                  className={`theme-text-muted rounded-lg p-2 transition ${themePrimaryHover} hover:text-[var(--color-primary)]`}
                                  title="Lihat detail"
                                >
                                  <Eye size={17} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => router.push(`/admin/siswa/kartu-identitas/card?id=${item.id}`)}
                                  className={`theme-text-muted rounded-lg p-2 transition hover:bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] hover:text-[var(--color-primary)]`}
                                  title="Cetak Kartu Siswa"
                                >
                                  <IdCard size={17} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => router.push(`/admin/siswa/edit/${item.id}`)}
                                  className="theme-text-muted rounded-lg p-2 transition hover:bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] hover:text-[var(--color-warning)]"
                                  title="Edit siswa"
                                >
                                  <Edit size={17} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openDeleteModal(item.id, item.nama)}
                                  className="theme-text-muted rounded-lg p-2 transition hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] hover:text-[var(--color-text)]"
                                  title="Hapus siswa"
                                >
                                  <Trash2 size={17} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {!loading && currentItems.length === 0 && (
                  <div className="p-12 text-center">
                    <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${themeNeutralSurface}`}>
                      <Users size={28} className="theme-text-muted" />
                    </div>
                    <p className="theme-text mt-4 text-sm font-semibold">
                      Tidak ada data siswa
                    </p>
                    <p className="theme-text-muted mt-1 text-xs">
                      {search ||
                      filterStatus !== "semua" ||
                      filterKelas !== "semua"
                        ? "Tidak ada siswa yang sesuai dengan filter."
                        : "Belum ada data siswa dari database."}
                    </p>

                    {!search &&
                      filterStatus === "semua" &&
                      filterKelas === "semua" && (
                        <button
                          type="button"
                          onClick={() => router.push("/admin/siswa/tambah")}
                          className={`mt-4 inline-flex items-center gap-2 rounded-xl ${themePrimaryGradient} px-4 py-2.5 text-sm font-medium text-[var(--color-card)] ${themePrimaryShadow}`}
                        >
                          <Plus size={17} />
                          Tambah Siswa
                        </button>
                      )}
                  </div>
                )}

                {!loading && totalItems > 0 && (
                  <div className={`flex flex-col items-center justify-between gap-3 border-t ${themeDivider} ${themeNeutralSurface} px-4 py-3 sm:flex-row`}>
                    <div className="flex flex-wrap items-center gap-3 theme-text-secondary text-sm">
                      <span>
                        Menampilkan {startIndex + 1} - {endIndex} dari {totalItems} data
                      </span>

                      <div className="flex items-center gap-1">
                        <span>Tampil</span>
                        <select
                          value={itemsPerPage}
                          onChange={(event) => {
                            setItemsPerPage(Number(event.target.value));
                            setCurrentPage(1);
                          }}
                          className={`theme-input theme-text rounded-lg border ${themeNeutralBorder} px-2 py-1 text-sm outline-none ${themeFocus}`}
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={40}>40</option>
                          <option value={80}>80</option>
                        </select>
                      </div>
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() => goToPage(1)}
                          className={`theme-text-secondary rounded-lg px-2 py-1.5 text-sm ${themeNeutralHover} disabled:opacity-30`}
                        >
                          «
                        </button>
                        <button
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() => goToPage(currentPage - 1)}
                          className={`theme-text-secondary rounded-lg px-2 py-1.5 text-sm ${themeNeutralHover} disabled:opacity-30`}
                        >
                          ‹
                        </button>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, index) => {
                            let pageNumber;

                            if (totalPages <= 5) {
                              pageNumber = index + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = index + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + index;
                            } else {
                              pageNumber = currentPage - 2 + index;
                            }

                            return (
                              <button
                                type="button"
                                key={pageNumber}
                                onClick={() => goToPage(pageNumber)}
                                className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                                  currentPage === pageNumber
                                    ? `${themePrimaryGradient} text-[var(--color-card)] ${themePrimaryShadow}`
                                    : `theme-text-secondary ${themeNeutralHover}`
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                        )}

                        <button
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() => goToPage(currentPage + 1)}
                          className={`theme-text-secondary rounded-lg px-2 py-1.5 text-sm ${themeNeutralHover} disabled:opacity-30`}
                        >
                          ›
                        </button>
                        <button
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() => goToPage(totalPages)}
                          className={`theme-text-secondary rounded-lg px-2 py-1.5 text-sm ${themeNeutralHover} disabled:opacity-30`}
                        >
                          »
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <footer className={`border-t ${themeDivider} py-4 text-center theme-text-muted text-sm`}>
                © 2026 SmartSchool • Data Siswa
              </footer>
            </div>
          </div>
        </main>
      </div>

      {deleteModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={closeDeleteModal}
        >
          <div
            className={`theme-card w-full max-w-md overflow-hidden rounded-2xl ${themeCardShadow}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-6 text-center">
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${themeDangerSurface}`}>
                <AlertTriangle size={30} className="theme-text" />
              </div>

              <h3 className="theme-text text-xl font-bold">
                Hapus Data Siswa?
              </h3>

              <p className="theme-text-secondary mt-2 text-sm leading-relaxed">
                Apakah kamu yakin ingin menghapus data siswa
                <br />
                <span className="theme-text font-semibold">
                  &quot;{deleteModal.nama}&quot;
                </span>
                ?
              </p>

              <p className="theme-text-muted mt-3 text-xs">
                Data akan dihapus melalui backend SmartSchool.
              </p>
            </div>

            <div className={`flex gap-3 border-t ${themeDivider} ${themeNeutralSurface} p-4`}>
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className={`theme-input theme-text-secondary flex-1 rounded-xl border ${themeNeutralBorder} px-4 py-2.5 text-sm font-medium transition ${themeNeutralHover} disabled:opacity-50`}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-[var(--color-text)] px-4 py-2.5 text-sm font-medium text-[var(--color-card)] transition hover:opacity-90 disabled:opacity-60"
              >
                <span className="flex items-center justify-center gap-2">
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Hapus
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}