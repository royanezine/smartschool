"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "@/app/components/Header";
import Sidebar from "@/app/components/Sidebar";

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
} from "lucide-react";

import { apiFetch } from "../../../../lib/api";

// =========================================================
// THEME HELPERS
// =========================================================

const themePrimaryGradient =
  "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_srgb,var(--color-primary)_72%,var(--color-info)))]";

const themePrimarySoft =
  "bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)]";

const themePrimarySoftBorder =
  "border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)]";

const themePrimaryText =
  "text-[var(--color-primary)]";

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

const themeWarningSurface =
  "bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)]";

const themeWarningBorder =
  "border-[color-mix(in_srgb,var(--color-warning)_24%,transparent)]";

const themeDangerSurface =
  "bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]";

const themeDangerBorder =
  "border-[color-mix(in_srgb,var(--color-text)_18%,transparent)]";

const themeFocus =
  "focus:border-[var(--color-primary)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]";

// =========================================================
// HELPER RESPONSE
// =========================================================

function getResponseData(response) {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.users)) {
    return response.users;
  }

  if (Array.isArray(response.data?.users)) {
    return response.data.users;
  }

  if (Array.isArray(response.rows)) {
    return response.rows;
  }

  if (Array.isArray(response.data?.rows)) {
    return response.data.rows;
  }

  return [];
}

// =========================================================
// NORMALIZE SISWA
// =========================================================

function normalizeSiswa(item) {
  if (!item) return null;

  let kelas = "-";

  const anggotaKelas =
    item?.anggotaKelas ||
    item?.kelasSiswa ||
    item?.kelasAnggota ||
    null;

  if (Array.isArray(anggotaKelas)) {
    if (anggotaKelas.length > 0) {
      const anggota = anggotaKelas[0];

      kelas =
        anggota?.kelas?.nama ||
        anggota?.kelasNama ||
        anggota?.nama ||
        "-";
    }
  } else if (anggotaKelas) {
    kelas =
      anggotaKelas?.kelas?.nama ||
      anggotaKelas?.kelasNama ||
      anggotaKelas?.nama ||
      "-";
  }

  if (item?.kelas) {
    if (typeof item.kelas === "string") {
      kelas = item.kelas;
    } else {
      kelas =
        item.kelas?.nama ||
        item.kelas?.kelasNama ||
        kelas;
    }
  }

  const statusRaw = String(
    item?.status || "aktif"
  ).toLowerCase();

  return {
    id: item?.id || null,

    nama:
      item?.namaLengkap ||
      item?.nama ||
      item?.namaPengguna ||
      "-",

    namaPengguna:
      item?.namaPengguna ||
      "-",

    email:
      item?.email ||
      "-",

    nis:
      item?.nis ||
      item?.nipd ||
      "-",

    nisn:
      item?.nisn ||
      "-",

    nik:
      item?.nik ||
      "-",

    kelas,

    phone:
      item?.noTelepon ||
      item?.phone ||
      "-",

    alamat:
      item?.alamat ||
      "-",

    alamatKtp:
      item?.alamatKtp ||
      "-",

    alamatDomisili:
      item?.alamatDomisili ||
      "-",

    kecamatan:
      item?.kecamatan ||
      "-",

    kelurahan:
      item?.kelurahan ||
      "-",

    kota:
      item?.kota ||
      "-",

    namaAyah:
      item?.namaAyah ||
      "-",

    pekerjaanAyah:
      item?.pekerjaanAyah ||
      "-",

    namaIbu:
      item?.namaIbu ||
      "-",

    pekerjaanIbu:
      item?.pekerjaanIbu ||
      "-",

    tglLahir:
      item?.tanggalLahir ||
      item?.tglLahir ||
      null,

    tempatLahir:
      item?.tempatLahir ||
      "-",

    gender:
      item?.jenisKelamin ||
      item?.gender ||
      "-",

    status:
      statusRaw === "aktif"
        ? "Aktif"
        : "Nonaktif",

    joinDate:
      item?.dibuatPada ||
      item?.createdAt ||
      null,

    sekolah:
      item?.sekolah || null,

    peran:
      item?.peran || null,

    raw: item,
  };
}

// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// =========================================================
// FORMAT GENDER
// =========================================================

function formatGender(value) {
  if (!value) return "-";

  const gender = String(value).toUpperCase();

  if (gender === "L") {
    return "Laki-laki";
  }

  if (gender === "P") {
    return "Perempuan";
  }

  return value;
}

// =========================================================
// PAGE
// =========================================================

export default function AdminSiswaPage() {
  const router = useRouter();

  // =======================================================
  // SIDEBAR
  // =======================================================

  const [isCollapsed, setIsCollapsed] =
    useState(false);

  // =======================================================
  // DATA
  // =======================================================

  const [siswa, setSiswa] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // =======================================================
  // SEARCH
  // =======================================================

  const [search, setSearch] =
    useState("");

  // =======================================================
  // FILTER
  // =======================================================

  const [filterStatus, setFilterStatus] =
    useState("semua");

  const [filterKelas, setFilterKelas] =
    useState("semua");

  const [sortBy, setSortBy] =
    useState("nama_asc");

  // =======================================================
  // KELAS DROPDOWN
  // =======================================================

  const [kelasSearch, setKelasSearch] =
    useState("");

  const [isKelasOpen, setIsKelasOpen] =
    useState(false);

  const kelasRef = useRef(null);

  // =======================================================
  // DELETE
  // =======================================================

  const [deleteModal, setDeleteModal] =
    useState({
      open: false,
      id: null,
      nama: "",
    });

  const [deleting, setDeleting] =
    useState(false);

  // =======================================================
  // PAGINATION
  // =======================================================

  const [currentPage, setCurrentPage] =
    useState(1);

  const [itemsPerPage, setItemsPerPage] =
    useState(10);

  // =======================================================
  // LOAD DATA
  // =======================================================

  const loadSiswa = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await apiFetch(
        "/api/users?role=siswa&page=1&limit=1000",
        {
          method: "GET",
        }
      );

      console.log(
        "GET SISWA RESPONSE:",
        response
      );

      const rawData =
        getResponseData(response);

      console.log(
        "RAW SISWA DATA:",
        rawData
      );

      const normalized =
        rawData
          .map(normalizeSiswa)
          .filter(
            (item) =>
              item && item.id
          );

      console.log(
        "NORMALIZED SISWA:",
        normalized
      );

      setSiswa(normalized);
      setCurrentPage(1);
    } catch (err) {
      console.error(
        "Gagal mengambil data siswa:",
        err
      );

      setError(
        err?.message ||
          "Gagal mengambil data siswa dari backend."
      );

      setSiswa([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {
    loadSiswa();
  }, []);

  // =======================================================
  // CLICK OUTSIDE KELAS
  // =======================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        kelasRef.current &&
        !kelasRef.current.contains(
          event.target
        )
      ) {
        setIsKelasOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =======================================================
  // UNIQUE KELAS
  // =======================================================

  const uniqueKelas = useMemo(() => {
    return [
      ...new Set(
        siswa
          .map((item) => item.kelas)
          .filter(
            (kelas) =>
              kelas &&
              kelas !== "-"
          )
      ),
    ].sort((a, b) =>
      String(a).localeCompare(
        String(b),
        "id"
      )
    );
  }, [siswa]);

  // =======================================================
  // FILTER KELAS OPTION
  // =======================================================

  const filteredKelasOptions =
    useMemo(() => {
      const keyword =
        kelasSearch
          .trim()
          .toLowerCase();

      if (!keyword) {
        return uniqueKelas;
      }

      return uniqueKelas.filter(
        (kelas) =>
          String(kelas)
            .toLowerCase()
            .includes(keyword)
      );
    }, [
      uniqueKelas,
      kelasSearch,
    ]);

  // =======================================================
  // SEARCH
  // =======================================================

  const filteredBySearch = useMemo(() => {
    const keyword =
      search
        .trim()
        .toLowerCase();

    if (!keyword) {
      return siswa;
    }

    return siswa.filter((item) => {
      return (
        String(item.nama || "")
          .toLowerCase()
          .includes(keyword) ||

        String(item.nis || "")
          .toLowerCase()
          .includes(keyword) ||

        String(item.nisn || "")
          .toLowerCase()
          .includes(keyword) ||

        String(item.email || "")
          .toLowerCase()
          .includes(keyword) ||

        String(item.kelas || "")
          .toLowerCase()
          .includes(keyword) ||

        String(item.phone || "")
          .toLowerCase()
          .includes(keyword) ||

        String(item.nik || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [
    siswa,
    search,
  ]);

  // =======================================================
  // FILTER STATUS
  // =======================================================

  const filteredByStatus = useMemo(() => {
    if (filterStatus === "semua") {
      return filteredBySearch;
    }

    return filteredBySearch.filter(
      (item) =>
        item.status ===
        filterStatus
    );
  }, [
    filteredBySearch,
    filterStatus,
  ]);

  // =======================================================
  // FILTER KELAS
  // =======================================================

  const filteredByKelas = useMemo(() => {
    if (filterKelas === "semua") {
      return filteredByStatus;
    }

    return filteredByStatus.filter(
      (item) =>
        item.kelas ===
        filterKelas
    );
  }, [
    filteredByStatus,
    filterKelas,
  ]);

  // =======================================================
  // SORT
  // =======================================================

  const sorted = useMemo(() => {
    return [
      ...filteredByKelas,
    ].sort((a, b) => {
      switch (sortBy) {
        case "nama_asc":
          return String(
            a.nama || ""
          ).localeCompare(
            String(
              b.nama || ""
            ),
            "id"
          );

        case "nama_desc":
          return String(
            b.nama || ""
          ).localeCompare(
            String(
              a.nama || ""
            ),
            "id"
          );

        case "nis_asc":
          return String(
            a.nis || ""
          ).localeCompare(
            String(
              b.nis || ""
            ),
            "id"
          );

        case "nis_desc":
          return String(
            b.nis || ""
          ).localeCompare(
            String(
              a.nis || ""
            ),
            "id"
          );

        case "kelas":
          return String(
            a.kelas || ""
          ).localeCompare(
            String(
              b.kelas || ""
            ),
            "id"
          );

        case "status":
          return String(
            a.status || ""
          ).localeCompare(
            String(
              b.status || ""
            ),
            "id"
          );

        default:
          return 0;
      }
    });
  }, [
    filteredByKelas,
    sortBy,
  ]);

  // =======================================================
  // PAGINATION
  // =======================================================

  const totalItems =
    sorted.length;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalItems /
          itemsPerPage
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const startIndex =
    totalItems === 0
      ? 0
      : (safeCurrentPage - 1) *
        itemsPerPage;

  const endIndex =
    Math.min(
      startIndex +
        itemsPerPage,
      totalItems
    );

  const currentItems =
    sorted.slice(
      startIndex,
      endIndex
    );

  // =======================================================
  // RESET PAGE
  // =======================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    filterStatus,
    filterKelas,
    sortBy,
    itemsPerPage,
  ]);

  // =======================================================
  // PAGE FIX
  // =======================================================

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  // =======================================================
  // GO PAGE
  // =======================================================

  const goToPage = (page) => {
    if (
      page >= 1 &&
      page <= totalPages
    ) {
      setCurrentPage(page);
    }
  };

  // =======================================================
  // DELETE MODAL
  // =======================================================

  const openDeleteModal = (
    id,
    nama
  ) => {
    setDeleteModal({
      open: true,
      id,
      nama,
    });
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setDeleteModal({
      open: false,
      id: null,
      nama: "",
    });
  };

  // =======================================================
  // DELETE
  // =======================================================

  const confirmDelete = async () => {
    const id =
      deleteModal.id;

    if (!id) return;

    try {
      setDeleting(true);
      setError("");

      await apiFetch(
        `/api/users/${id}`,
        {
          method: "DELETE",
        }
      );

      setSiswa((prev) =>
        prev.filter(
          (item) =>
            item.id !== id
        )
      );

      setDeleteModal({
        open: false,
        id: null,
        nama: "",
      });
    } catch (err) {
      console.error(
        "Gagal menghapus siswa:",
        err
      );

      setError(
        err?.message ||
          "Gagal menghapus data siswa."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = () => {
    loadSiswa(true);
  };

  // =======================================================
  // RESET FILTER
  // =======================================================

  const resetFilter = () => {
    setSearch("");
    setFilterStatus("semua");
    setFilterKelas("semua");
    setKelasSearch("");
    setSortBy("nama_asc");
  };

  // =======================================================
  // EXPORT CSV
  // =======================================================

  const exportCSV = () => {
    const headers = [
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

    const escapeCSV = (value) => {
      const text = String(
        value ?? "-"
      );

      return `"${text.replace(
        /"/g,
        '""'
      )}"`;
    };

    const rows = sorted.map(
      (item, index) => [
        index + 1,
        item.nama,
        item.nis,
        item.nisn,
        item.nik,
        item.kelas,
        item.email,
        item.phone,
        formatGender(
          item.gender
        ),
        item.tempatLahir,
        formatDate(
          item.tglLahir
        ),
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
        formatDate(
          item.joinDate
        ),
      ]
    );

    let csv =
      headers
        .map(escapeCSV)
        .join(",") +
      "\n";

    rows.forEach((row) => {
      csv +=
        row
          .map(escapeCSV)
          .join(",") +
        "\n";
    });

    const blob = new Blob(
      ["\ufeff" + csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `data_siswa_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  // =======================================================
  // EXPORT EXCEL
  // =======================================================

  const exportExcel = () => {
    const headers = [
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

    let tableHtml = `
      <html>
        <head>
          <meta charset="UTF-8" />

          <style>
            table {
              border-collapse: collapse;
              width: 100%;
            }

            th,
            td {
              border: 1px solid #cbd5e1;
              padding: 7px 9px;
              font-size: 11px;
              font-family: Arial, sans-serif;
            }

            th {
              background: #2563eb;
              color: white;
              font-weight: bold;
            }
          </style>
        </head>

        <body>
          <table>
            <tr>
              ${headers
                .map(
                  (header) =>
                    `<th>${header}</th>`
                )
                .join("")}
            </tr>
    `;

    sorted.forEach(
      (item, index) => {
        tableHtml += `
          <tr>
            <td>${index + 1}</td>
            <td>${item.nama}</td>
            <td>${item.nis}</td>
            <td>${item.nisn}</td>
            <td>${item.nik}</td>
            <td>${item.kelas}</td>
            <td>${item.email}</td>
            <td>${item.phone}</td>
            <td>${formatGender(
              item.gender
            )}</td>
            <td>${item.tempatLahir}</td>
            <td>${formatDate(
              item.tglLahir
            )}</td>
            <td>${item.alamat}</td>
            <td>${item.alamatKtp}</td>
            <td>${item.alamatDomisili}</td>
            <td>${item.kecamatan}</td>
            <td>${item.kelurahan}</td>
            <td>${item.kota}</td>
            <td>${item.namaAyah}</td>
            <td>${item.pekerjaanAyah}</td>
            <td>${item.namaIbu}</td>
            <td>${item.pekerjaanIbu}</td>
            <td>${item.status}</td>
            <td>${formatDate(
              item.joinDate
            )}</td>
          </tr>
        `;
      }
    );

    tableHtml += `
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(
      [tableHtml],
      {
        type:
          "application/vnd.ms-excel",
      }
    );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `data_siswa_${new Date()
        .toISOString()
        .slice(0, 10)}.xls`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };

  // =======================================================
  // EXPORT PDF / PRINT
  // =======================================================

  const exportPDF = () => {
    const printWindow =
      window.open(
        "",
        "_blank",
        "width=1200,height=800"
      );

    if (!printWindow) {
      alert(
        "Mohon izinkan popup browser untuk mencetak PDF."
      );

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

    let tableHtml = `
      <html>
        <head>
          <title>
            Data Siswa SmartSchool
          </title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 24px;
              color: #1e293b;
            }

            h1 {
              margin: 0;
              font-size: 20px;
            }

            p {
              color: #64748b;
              font-size: 12px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              font-size: 11px;
            }

            th {
              background: #2563eb;
              color: white;
              padding: 8px;
              text-align: left;
            }

            td {
              border: 1px solid #cbd5e1;
              padding: 7px 8px;
            }

            tr:nth-child(even) {
              background: #f8fafc;
            }
          </style>
        </head>

        <body>
          <h1>
            Data Siswa SmartSchool
          </h1>

          <p>
            Total ${sorted.length} siswa
            • ${new Date().toLocaleDateString(
              "id-ID"
            )}
          </p>

          <table>
            <tr>
              ${headers
                .map(
                  (header) =>
                    `<th>${header}</th>`
                )
                .join("")}
            </tr>
    `;

    sorted.forEach(
      (item, index) => {
        tableHtml += `
          <tr>
            <td>${index + 1}</td>
            <td>${item.nama}</td>
            <td>${item.nis}</td>
            <td>${item.nisn}</td>
            <td>${item.kelas}</td>
            <td>${item.email}</td>
            <td>${item.phone}</td>
            <td>${item.status}</td>
          </tr>
        `;
      }
    );

    tableHtml += `
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(
      tableHtml
    );

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  // =======================================================
  // STATISTICS
  // =======================================================

  const totalSiswa =
    siswa.length;

  const totalAktif =
    siswa.filter(
      (item) =>
        item.status ===
        "Aktif"
    ).length;

  const totalNonaktif =
    siswa.filter(
      (item) =>
        item.status !==
        "Aktif"
    ).length;

  const totalKelas =
    uniqueKelas.length;

  // =======================================================
  // AVATAR
  // =======================================================

  const getInitials = (nama) => {
    if (!nama) {
      return "??";
    }

    const parts =
      String(nama)
        .trim()
        .split(/\s+/);

    if (parts.length >= 2) {
      return (
        parts[0][0] +
        parts[1][0]
      ).toUpperCase();
    }

    return String(nama)
      .substring(0, 2)
      .toUpperCase();
  };

  /*
   * Avatar sekarang menggunakan warna primary/theme
   * berdasarkan panjang nama, bukan warna hardcoded.
   */
  const getAvatarClass = (nama) => {
    const variants = [
      "bg-[var(--color-primary)]",
      "bg-[var(--color-info)]",
      "bg-[var(--color-success)]",
      "bg-[var(--color-warning)]",
      "bg-[color-mix(in_srgb,var(--color-primary)_72%,var(--color-info))]",
    ];

    return variants[
      String(nama || "").length %
        variants.length
    ];
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">

      {/* SIDEBAR */}

      <Sidebar
        active="siswa"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={
          setIsCollapsed
        }
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* HEADER */}

        <Header
          toggleSidebar={() =>
            setIsCollapsed(
              (prev) => !prev
            )
          }
          notifications={[]}
          user={{
            name: "Admin Sekolah",
            email:
              "admin@smartschool.com",
            avatar: "AD",
          }}
        />

        {/* MAIN */}

        <main className="min-h-0 flex-1 overflow-y-auto">

          <div className="w-full px-3 py-4 sm:px-4 md:px-6 lg:px-8 xl:px-10">

            <div className="w-full space-y-5">

              {/* PAGE HEADER */}

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

                  {/* EXPORT */}

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
                        <Printer size={16} />
                        PDF
                      </button>

                      <button
                        type="button"
                        onClick={exportExcel}
                        className={`theme-text-secondary flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${themePrimaryHover} hover:text-[var(--color-primary)]`}
                      >
                        <FileSpreadsheet size={16} />
                        Excel
                      </button>

                      <button
                        type="button"
                        onClick={exportCSV}
                        className={`theme-text-secondary flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition ${themePrimaryHover} hover:text-[var(--color-primary)]`}
                      >
                        <FileSpreadsheet size={16} />
                        CSV
                      </button>

                    </div>

                  </div>

                  {/* REFRESH */}

                  <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className={`theme-input flex h-10 items-center gap-2 rounded-xl border ${themeNeutralBorder} px-3 text-sm font-medium theme-text-secondary transition ${themeNeutralHover} disabled:cursor-not-allowed disabled:opacity-60`}
                    title="Refresh data"
                  >
                    <RefreshCw
                      size={16}
                      className={
                        refreshing
                          ? "animate-spin"
                          : ""
                      }
                    />
                  </button>

                  {/* TAMBAH */}

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/admin/siswa/tambah"
                      )
                    }
                    className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-xl ${themePrimaryGradient} px-4 text-sm font-medium text-[var(--color-card)] ${themePrimaryShadow} transition hover:brightness-95 sm:flex-none`}
                  >
                    <Plus size={18} />
                    Tambah Siswa
                  </button>

                </div>

              </div>

              {/* ERROR */}

              {error && (
                <div
                  className={`flex items-start gap-3 rounded-xl border ${themeDangerBorder} ${themeDangerSurface} px-4 py-3`}
                >

                  <AlertTriangle
                    size={19}
                    className="theme-text mt-0.5 shrink-0"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="theme-text text-sm font-semibold">
                      Gagal memuat data siswa
                    </p>

                    <p className="theme-text-secondary mt-1 break-words text-sm">
                      {error}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className={`theme-text-muted text-xl leading-none transition hover:text-[var(--color-primary)]`}
                  >
                    ×
                  </button>

                </div>
              )}

              {/* STATISTICS */}

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

                {/* TOTAL */}

                <div
                  className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow} transition hover:-translate-y-0.5`}
                >

                  <div className="flex items-center gap-2">

                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${themePrimarySoft} ${themePrimaryText}`}
                    >
                      <Users size={16} />
                    </div>

                    <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wider">
                      Total Siswa
                    </p>

                  </div>

                  <p className="theme-text mt-1 text-2xl font-bold">
                    {totalSiswa}
                  </p>

                </div>

                {/* AKTIF */}

                <div
                  className={`theme-card rounded-xl border ${themeSuccessBorder} p-4 ${themeCardShadow} transition hover:-translate-y-0.5`}
                >

                  <div className="flex items-center gap-2">

                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${themeSuccessSurface} text-[var(--color-success)]`}
                    >
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

                {/* NONAKTIF */}

                <div
                  className={`theme-card rounded-xl border ${themeDangerBorder} p-4 ${themeCardShadow} transition hover:-translate-y-0.5`}
                >

                  <div className="flex items-center gap-2">

                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${themeDangerSurface} theme-text-secondary`}
                    >
                      <XCircle size={16} />
                    </div>

                    <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wider">
                      Nonaktif
                    </p>

                  </div>

                  <p className="theme-text mt-1 text-2xl font-bold">
                    {totalNonaktif}
                  </p>

                </div>

                {/* KELAS */}

                <div
                  className={`theme-card rounded-xl border ${themeInfoBorder} p-4 ${themeCardShadow} transition hover:-translate-y-0.5`}
                >

                  <div className="flex items-center gap-2">

                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${themeInfoSurface} text-[var(--color-info)]`}
                    >
                      <Users size={16} />
                    </div>

                    <p className="theme-text-muted text-[10px] font-medium uppercase tracking-wider">
                      Kelas
                    </p>

                  </div>

                  <p className="mt-1 text-2xl font-bold text-[var(--color-info)]">
                    {totalKelas}
                  </p>

                </div>

              </div>

              {/* SEARCH FILTER */}

              <div
                className={`theme-card rounded-xl border ${themeNeutralBorder} p-4 ${themeCardShadow}`}
              >

                <div className="flex flex-col gap-3">

                  {/* SEARCH */}

                  <div className="relative w-full">

                    <Search
                      size={17}
                      className="theme-text-muted absolute left-3.5 top-1/2 -translate-y-1/2"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value
                        )
                      }
                      placeholder="Cari nama, NIS, NISN, kelas, email, telepon..."
                      className={`theme-input theme-text w-full rounded-xl border ${themeNeutralBorder} py-2.5 pl-10 pr-4 text-sm outline-none transition ${themeFocus}`}
                    />

                  </div>

                  <div className="flex flex-wrap items-center gap-2">

                    {/* STATUS */}

                    <select
                      value={filterStatus}
                      onChange={(event) =>
                        setFilterStatus(
                          event.target.value
                        )
                      }
                      className={`theme-input theme-text min-w-[130px] rounded-lg border ${themeNeutralBorder} px-3 py-1.5 text-sm outline-none ${themeFocus}`}
                    >
                      <option value="semua">
                        Semua Status
                      </option>

                      <option value="Aktif">
                        Aktif
                      </option>

                      <option value="Nonaktif">
                        Nonaktif
                      </option>
                    </select>

                    {/* KELAS */}

                    <div
                      ref={kelasRef}
                      className="relative min-w-[160px]"
                    >

                      <div
                        className={`theme-input rounded-lg border ${themeNeutralBorder} px-3 py-1.5`}
                      >

                        <div className="flex items-center gap-1">

                          <input
                            type="text"
                            value={kelasSearch}
                            onChange={(event) => {
                              setKelasSearch(
                                event.target.value
                              );

                              setIsKelasOpen(true);
                            }}
                            onFocus={() =>
                              setIsKelasOpen(true)
                            }
                            placeholder={
                              filterKelas ===
                              "semua"
                                ? "Semua Kelas"
                                : filterKelas
                            }
                            className="theme-text min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-text-placeholder)]"
                            autoComplete="off"
                          />

                          <ChevronDown
                            size={16}
                            className={`theme-text-muted shrink-0 transition-transform ${
                              isKelasOpen
                                ? "rotate-180"
                                : ""
                            }`}
                          />

                        </div>

                      </div>

                      {isKelasOpen && (
                        <div
                          className={`theme-card absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border ${themeNeutralBorder} ${themeCardShadow}`}
                        >

                          <button
                            type="button"
                            onClick={() => {
                              setFilterKelas("semua");
                              setKelasSearch("");
                              setIsKelasOpen(false);
                            }}
                            className={`theme-text flex w-full px-3 py-2 text-left text-sm transition ${themePrimaryHover} ${
                              filterKelas === "semua"
                                ? `${themePrimarySoft} font-semibold ${themePrimaryText}`
                                : ""
                            }`}
                          >
                            Semua Kelas
                          </button>

                          {filteredKelasOptions.length ===
                          0 ? (
                            <div className="theme-text-muted px-3 py-3 text-sm">
                              Belum ada kelas
                            </div>
                          ) : (
                            filteredKelasOptions.map(
                              (kelas) => (
                                <button
                                  type="button"
                                  key={kelas}
                                  onClick={() => {
                                    setFilterKelas(
                                      kelas
                                    );

                                    setKelasSearch("");
                                    setIsKelasOpen(false);
                                  }}
                                  className={`theme-text flex w-full px-3 py-2 text-left text-sm transition ${themePrimaryHover} ${
                                    filterKelas ===
                                    kelas
                                      ? `${themePrimarySoft} font-semibold ${themePrimaryText}`
                                      : ""
                                  }`}
                                >
                                  {kelas}
                                </button>
                              )
                            )
                          )}

                        </div>
                      )}

                    </div>

                    {/* SORT */}

                    <select
                      value={sortBy}
                      onChange={(event) =>
                        setSortBy(
                          event.target.value
                        )
                      }
                      className={`theme-input theme-text min-w-[140px] rounded-lg border ${themeNeutralBorder} px-3 py-1.5 text-sm outline-none ${themeFocus}`}
                    >
                      <option value="nama_asc">
                        Nama A-Z
                      </option>

                      <option value="nama_desc">
                        Nama Z-A
                      </option>

                      <option value="nis_asc">
                        NIS A-Z
                      </option>

                      <option value="nis_desc">
                        NIS Z-A
                      </option>

                      <option value="kelas">
                        Kelas
                      </option>

                      <option value="status">
                        Status
                      </option>
                    </select>

                    {/* RESET */}

                    <button
                      type="button"
                      onClick={resetFilter}
                      className={`theme-text-secondary rounded-lg px-3 py-1.5 text-sm transition ${themeNeutralHover} hover:text-[var(--color-primary)]`}
                    >
                      Reset
                    </button>

                    <span className="theme-text-secondary ml-auto hidden text-sm sm:inline">
                      {filteredByKelas.length}{" "}
                      siswa ditemukan
                    </span>

                  </div>

                </div>

              </div>

              {/* TABLE */}

              <div
                className={`theme-card w-full overflow-hidden rounded-xl border ${themeNeutralBorder} ${themeCardShadow}`}
              >

                <div className="w-full overflow-x-auto">

                  <table className="w-full min-w-[900px]">

                    <thead>
                      <tr
                        className={themePrimaryGradient}
                      >

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

                    <tbody
                      className={`divide-y ${themeDivider}`}
                    >

                      {/* LOADING */}

                      {loading && (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-4 py-16 text-center"
                          >

                            <div className="flex flex-col items-center">

                              <Loader2
                                size={30}
                                className="animate-spin text-[var(--color-primary)]"
                              />

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

                      {/* DATA */}

                      {!loading &&
                        currentItems.map(
                          (item, index) => {
                            const rowNumber =
                              startIndex +
                              index +
                              1;

                            return (
                              <tr
                                key={item.id}
                                className={`group transition-colors hover:bg-[color-mix(in_srgb,var(--color-primary)_5%,transparent)]`}
                              >

                                {/* NO */}

                                <td className="theme-text-secondary px-3 py-4 text-center text-sm font-medium">
                                  {rowNumber}
                                </td>

                                {/* PROFIL */}

                                <td className="px-3 py-4">

                                  <div className="flex min-w-0 items-center gap-3">

                                    <div
                                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getAvatarClass(
                                        item.nama
                                      )} text-sm font-bold text-[var(--color-card)] ${themeSmallShadow}`}
                                    >
                                      {getInitials(
                                        item.nama
                                      )}
                                    </div>

                                    <div className="min-w-0">

                                      <p className="theme-text truncate text-sm font-semibold">
                                        {item.nama}
                                      </p>

                                      <p className="theme-text-muted truncate text-xs">
                                        {formatGender(
                                          item.gender
                                        )}
                                      </p>

                                    </div>

                                  </div>

                                </td>

                                {/* NIS */}

                                <td className="theme-text-secondary px-3 py-4 text-sm">
                                  {item.nis}
                                </td>

                                {/* NISN */}

                                <td className="theme-text-secondary px-3 py-4 text-sm">
                                  {item.nisn}
                                </td>

                                {/* KELAS */}

                                <td className="px-3 py-4">

                                  {item.kelas !==
                                  "-" ? (
                                    <span
                                      className={`inline-flex whitespace-nowrap rounded-lg ${themeInfoSurface} px-2.5 py-1 text-xs font-medium text-[var(--color-info)]`}
                                    >
                                      {item.kelas}
                                    </span>
                                  ) : (
                                    <span className="theme-text-muted text-sm">
                                      Belum masuk kelas
                                    </span>
                                  )}

                                </td>

                                {/* EMAIL */}

                                <td className="hidden px-3 py-4 md:table-cell">

                                  <span className="theme-text-secondary block max-w-[220px] truncate text-sm">
                                    {item.email}
                                  </span>

                                </td>

                                {/* STATUS */}

                                <td className="px-3 py-4">

                                  <span
                                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${
                                      item.status ===
                                      "Aktif"
                                        ? `${themeSuccessSurface} ${themeSuccessBorder} text-[var(--color-success)]`
                                        : `${themeDangerSurface} ${themeDangerBorder} theme-text-secondary`
                                    }`}
                                  >

                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />

                                    {item.status}

                                  </span>

                                </td>

                                {/* AKSI */}

                                <td className="px-3 py-4">

                                  <div className="flex justify-end gap-1.5">

                                    {/* DETAIL */}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(
                                          `/admin/siswa/${item.id}`
                                        )
                                      }
                                      className={`theme-text-muted rounded-lg p-2 transition ${themePrimaryHover} hover:text-[var(--color-primary)]`}
                                      title="Lihat detail"
                                    >
                                      <Eye size={17} />
                                    </button>

                                    {/* EDIT */}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(
                                          `/admin/siswa/edit/${item.id}`
                                        )
                                      }
                                      className="theme-text-muted rounded-lg p-2 transition hover:bg-[color-mix(in_srgb,var(--color-warning)_9%,transparent)] hover:text-[var(--color-warning)]"
                                      title="Edit siswa"
                                    >
                                      <Edit size={17} />
                                    </button>

                                    {/* DELETE */}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        openDeleteModal(
                                          item.id,
                                          item.nama
                                        )
                                      }
                                      className="theme-text-muted rounded-lg p-2 transition hover:bg-[color-mix(in_srgb,var(--color-text)_7%,transparent)] hover:text-[var(--color-text)]"
                                      title="Hapus siswa"
                                    >
                                      <Trash2 size={17} />
                                    </button>

                                  </div>

                                </td>

                              </tr>
                            );
                          }
                        )}

                    </tbody>

                  </table>

                </div>

                {/* EMPTY */}

                {!loading &&
                  currentItems.length ===
                    0 && (
                    <div className="p-12 text-center">

                      <div
                        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${themeNeutralSurface}`}
                      >
                        <Users
                          size={28}
                          className="theme-text-muted"
                        />
                      </div>

                      <p className="theme-text mt-4 text-sm font-semibold">
                        Tidak ada data siswa
                      </p>

                      <p className="theme-text-muted mt-1 text-xs">
                        {search ||
                        filterStatus !==
                          "semua" ||
                        filterKelas !==
                          "semua"
                          ? "Tidak ada siswa yang sesuai dengan filter."
                          : "Belum ada data siswa dari database."}
                      </p>

                      {!search &&
                        filterStatus ===
                          "semua" &&
                        filterKelas ===
                          "semua" && (
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                "/admin/siswa/tambah"
                              )
                            }
                            className={`mt-4 inline-flex items-center gap-2 rounded-xl ${themePrimaryGradient} px-4 py-2.5 text-sm font-medium text-[var(--color-card)] ${themePrimaryShadow}`}
                          >
                            <Plus size={17} />
                            Tambah Siswa
                          </button>
                        )}

                    </div>
                  )}

                {/* PAGINATION */}

                {!loading &&
                  totalItems > 0 && (
                    <div
                      className={`flex flex-col items-center justify-between gap-3 border-t ${themeDivider} ${themeNeutralSurface} px-4 py-3 sm:flex-row`}
                    >

                      <div className="flex items-center gap-3 theme-text-secondary text-sm">

                        <span>
                          Menampilkan{" "}
                          {startIndex + 1}{" "}
                          -{" "}
                          {endIndex}{" "}
                          dari{" "}
                          {totalItems}{" "}
                          data
                        </span>

                        <div className="flex items-center gap-1">

                          <span>
                            Tampil
                          </span>

                          <select
                            value={itemsPerPage}
                            onChange={(
                              event
                            ) => {
                              setItemsPerPage(
                                Number(
                                  event
                                    .target
                                    .value
                                )
                              );

                              setCurrentPage(1);
                            }}
                            className={`theme-input theme-text rounded-lg border ${themeNeutralBorder} px-2 py-1 text-sm outline-none ${themeFocus}`}
                          >
                            <option value={10}>
                              10
                            </option>

                            <option value={20}>
                              20
                            </option>

                            <option value={40}>
                              40
                            </option>

                            <option value={80}>
                              80
                            </option>
                          </select>

                        </div>

                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center gap-1">

                          <button
                            type="button"
                            disabled={
                              currentPage ===
                              1
                            }
                            onClick={() =>
                              goToPage(1)
                            }
                            className={`theme-text-secondary rounded-lg px-2 py-1.5 text-sm ${themeNeutralHover} disabled:opacity-30`}
                          >
                            «
                          </button>

                          <button
                            type="button"
                            disabled={
                              currentPage ===
                              1
                            }
                            onClick={() =>
                              goToPage(
                                currentPage -
                                  1
                              )
                            }
                            className={`theme-text-secondary rounded-lg px-2 py-1.5 text-sm ${themeNeutralHover} disabled:opacity-30`}
                          >
                            ‹
                          </button>

                          {Array.from(
                            {
                              length:
                                Math.min(
                                  5,
                                  totalPages
                                ),
                            },
                            (_, index) => {
                              let pageNumber;

                              if (
                                totalPages <=
                                5
                              ) {
                                pageNumber =
                                  index + 1;
                              } else if (
                                currentPage <=
                                3
                              ) {
                                pageNumber =
                                  index + 1;
                              } else if (
                                currentPage >=
                                totalPages - 2
                              ) {
                                pageNumber =
                                  totalPages -
                                  4 +
                                  index;
                              } else {
                                pageNumber =
                                  currentPage -
                                  2 +
                                  index;
                              }

                              return (
                                <button
                                  type="button"
                                  key={pageNumber}
                                  onClick={() =>
                                    goToPage(
                                      pageNumber
                                    )
                                  }
                                  className={`h-8 w-8 rounded-lg text-sm font-medium transition ${
                                    currentPage ===
                                    pageNumber
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
                            disabled={
                              currentPage ===
                              totalPages
                            }
                            onClick={() =>
                              goToPage(
                                currentPage + 1
                              )
                            }
                            className={`theme-text-secondary rounded-lg px-2 py-1.5 text-sm ${themeNeutralHover} disabled:opacity-30`}
                          >
                            ›
                          </button>

                          <button
                            type="button"
                            disabled={
                              currentPage ===
                              totalPages
                            }
                            onClick={() =>
                              goToPage(
                                totalPages
                              )
                            }
                            className={`theme-text-secondary rounded-lg px-2 py-1.5 text-sm ${themeNeutralHover} disabled:opacity-30`}
                          >
                            »
                          </button>

                        </div>
                      )}

                    </div>
                  )}

              </div>

              {/* FOOTER */}

              <footer
                className={`border-t ${themeDivider} py-4 text-center theme-text-muted text-sm`}
              >
                © 2026 SmartSchool • Data Siswa
              </footer>

            </div>

          </div>

        </main>

      </div>

      {/* DELETE MODAL */}

      {deleteModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={closeDeleteModal}
        >

          <div
            className={`theme-card w-full max-w-md overflow-hidden rounded-2xl ${themeCardShadow}`}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="p-6 text-center">

              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${themeDangerSurface}`}
              >
                <AlertTriangle
                  size={30}
                  className="theme-text"
                />
              </div>

              <h3 className="theme-text text-xl font-bold">
                Hapus Data Siswa?
              </h3>

              <p className="theme-text-secondary mt-2 text-sm leading-relaxed">

                Apakah kamu yakin ingin
                menghapus data siswa

                <br />

                <span className="theme-text font-semibold">
                  "{deleteModal.nama}"
                </span>
                ?

              </p>

              <p className="theme-text-muted mt-3 text-xs">
                Data akan dihapus melalui
                backend SmartSchool.
              </p>

            </div>

            <div
              className={`flex gap-3 border-t ${themeDivider} ${themeNeutralSurface} p-4`}
            >

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
                className={`flex-1 rounded-xl bg-[var(--color-text)] px-4 py-2.5 text-sm font-medium text-[var(--color-card)] transition hover:opacity-90 disabled:opacity-60`}
              >

                <span className="flex items-center justify-center gap-2">

                  {deleting ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
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