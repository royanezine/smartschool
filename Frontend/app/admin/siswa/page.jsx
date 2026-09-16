"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";

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

import { apiFetch } from "../../../lib/api";

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

  /*
   * Bentuk data yang mungkin:
   *
   * anggotaKelas: [
   *   {
   *     kelas: {
   *       id,
   *       nama
   *     }
   *   }
   * ]
   */

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

  /*
   * Beberapa response mungkin langsung punya:
   *
   * kelas: {
   *   nama: "VII A"
   * }
   */

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

  const [isCollapsed, setIsCollapsed] = useState(false);

  // =======================================================
  // DATA
  // =======================================================

  const [siswa, setSiswa] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  // =======================================================
  // SEARCH
  // =======================================================

  const [search, setSearch] = useState("");

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

      /*
       * Sesuai BE:
       *
       * GET /api/users
       * GET /api/users?role=siswa
       *
       * Ditambah limit besar supaya data siswa
       * yang dikembalikan tidak hanya sedikit.
       */

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
            (item) => item && item.id
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
    if (
      filterStatus === "semua"
    ) {
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
    if (
      filterKelas === "semua"
    ) {
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

    const escapeCSV = (
      value
    ) => {
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

  const getInitials = (
    nama
  ) => {
    if (!nama) {
      return "??";
    }

    const parts =
      String(nama)
        .trim()
        .split(/\s+/);

    if (
      parts.length >= 2
    ) {
      return (
        parts[0][0] +
        parts[1][0]
      ).toUpperCase();
    }

    return String(nama)
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (
    nama
  ) => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-cyan-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-teal-500",
    ];

    return colors[
      String(nama || "")
        .length %
        colors.length
    ];
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">

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

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-200">
                    <Users size={21} />
                  </div>

                  <div className="min-w-0">

                    <h1 className="truncate text-xl font-semibold text-slate-800 sm:text-2xl">
                      Data Siswa
                    </h1>

                    <p className="text-xs text-slate-600 sm:text-sm">
                      Data induk peserta didik
                    </p>

                  </div>

                </div>

                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">

                  {/* EXPORT */}

                  <div className="group relative">

                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Download
                        size={17}
                      />

                      Export

                      <ChevronDown
                        size={14}
                      />
                    </button>

                    <div className="invisible absolute right-0 top-full z-30 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-xl opacity-0 transition-all group-hover:visible group-hover:opacity-100">

                      <button
                        type="button"
                        onClick={
                          exportPDF
                        }
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Printer
                          size={16}
                        />
                        PDF
                      </button>

                      <button
                        type="button"
                        onClick={
                          exportExcel
                        }
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <FileSpreadsheet
                          size={16}
                        />
                        Excel
                      </button>

                      <button
                        type="button"
                        onClick={
                          exportCSV
                        }
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      >
                        <FileSpreadsheet
                          size={16}
                        />
                        CSV
                      </button>

                    </div>

                  </div>

                  {/* REFRESH */}

                  <button
                    type="button"
                    onClick={
                      handleRefresh
                    }
                    disabled={
                      refreshing
                    }
                    className="flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                    className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 sm:flex-none"
                  >
                    <Plus
                      size={18}
                    />
                    Tambah Siswa
                  </button>

                </div>

              </div>

              {/* ERROR */}

              {error && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">

                  <AlertTriangle
                    size={19}
                    className="mt-0.5 shrink-0 text-rose-600"
                  />

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-semibold text-rose-700">
                      Gagal memuat data siswa
                    </p>

                    <p className="mt-1 break-words text-sm text-rose-600">
                      {error}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setError("")
                    }
                    className="text-xl leading-none text-rose-500 hover:text-rose-700"
                  >
                    ×
                  </button>

                </div>
              )}

              {/* STATISTICS */}

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

                <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm transition hover:shadow-md">

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <Users size={16} />
                    </div>

                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      Total Siswa
                    </p>

                  </div>

                  <p className="mt-1 text-2xl font-bold text-slate-800">
                    {totalSiswa}
                  </p>

                </div>

                <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm transition hover:shadow-md">

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <CheckCircle
                        size={16}
                      />
                    </div>

                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      Aktif
                    </p>

                  </div>

                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    {totalAktif}
                  </p>

                </div>

                <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm transition hover:shadow-md">

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-700">
                      <XCircle
                        size={16}
                      />
                    </div>

                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      Nonaktif
                    </p>

                  </div>

                  <p className="mt-1 text-2xl font-bold text-rose-700">
                    {totalNonaktif}
                  </p>

                </div>

                <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm transition hover:shadow-md">

                  <div className="flex items-center gap-2">

                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                      <Users size={16} />
                    </div>

                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      Kelas
                    </p>

                  </div>

                  <p className="mt-1 text-2xl font-bold text-indigo-700">
                    {totalKelas}
                  </p>

                </div>

              </div>

              {/* SEARCH FILTER */}

              <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">

                <div className="flex flex-col gap-3">

                  {/* SEARCH */}

                  <div className="relative w-full">

                    <Search
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target
                            .value
                        )
                      }
                      placeholder="Cari nama, NIS, NISN, kelas, email, telepon..."
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
                    />

                  </div>

                  <div className="flex flex-wrap items-center gap-2">

                    {/* STATUS */}

                    <select
                      value={
                        filterStatus
                      }
                      onChange={(event) =>
                        setFilterStatus(
                          event.target
                            .value
                        )
                      }
                      className="min-w-[130px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
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

                      <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5">

                        <div className="flex items-center gap-1">

                          <input
                            type="text"
                            value={
                              kelasSearch
                            }
                            onChange={(event) => {
                              setKelasSearch(
                                event
                                  .target
                                  .value
                              );

                              setIsKelasOpen(
                                true
                              );
                            }}
                            onFocus={() =>
                              setIsKelasOpen(
                                true
                              )
                            }
                            placeholder={
                              filterKelas ===
                              "semua"
                                ? "Semua Kelas"
                                : filterKelas
                            }
                            className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500"
                            autoComplete="off"
                          />

                          <ChevronDown
                            size={16}
                            className={`shrink-0 text-slate-500 transition-transform ${
                              isKelasOpen
                                ? "rotate-180"
                                : ""
                            }`}
                          />

                        </div>

                      </div>

                      {isKelasOpen && (
                        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-300 bg-white shadow-xl">

                          <button
                            type="button"
                            onClick={() => {
                              setFilterKelas(
                                "semua"
                              );

                              setKelasSearch(
                                ""
                              );

                              setIsKelasOpen(
                                false
                              );
                            }}
                            className={`block w-full px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                              filterKelas ===
                              "semua"
                                ? "bg-blue-100 font-semibold text-blue-700"
                                : "text-slate-700"
                            }`}
                          >
                            Semua Kelas
                          </button>

                          {filteredKelasOptions.length ===
                          0 ? (
                            <div className="px-3 py-3 text-sm text-slate-500">
                              Belum ada kelas
                            </div>
                          ) : (
                            filteredKelasOptions.map(
                              (kelas) => (
                                <button
                                  type="button"
                                  key={
                                    kelas
                                  }
                                  onClick={() => {
                                    setFilterKelas(
                                      kelas
                                    );

                                    setKelasSearch(
                                      ""
                                    );

                                    setIsKelasOpen(
                                      false
                                    );
                                  }}
                                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                                    filterKelas ===
                                    kelas
                                      ? "bg-blue-100 font-semibold text-blue-700"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {
                                    kelas
                                  }
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
                          event.target
                            .value
                        )
                      }
                      className="min-w-[140px] rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30"
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
                      onClick={
                        resetFilter
                      }
                      className="rounded-lg px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                      Reset
                    </button>

                    <span className="ml-auto hidden text-sm text-slate-600 sm:inline">
                      {
                        filteredByKelas.length
                      }{" "}
                      siswa ditemukan
                    </span>

                  </div>

                </div>

              </div>

              {/* TABLE */}

              <div className="w-full overflow-hidden rounded-xl border border-slate-300 bg-white shadow-sm">

                <div className="w-full overflow-x-auto">

                  <table className="w-full min-w-[900px]">

                    <thead>

                      <tr className="bg-blue-600">

                        <th className="w-[5%] px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white">
                          No
                        </th>

                        <th className="w-[25%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                          Profil
                        </th>

                        <th className="w-[11%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                          NIS
                        </th>

                        <th className="w-[13%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                          NISN
                        </th>

                        <th className="w-[13%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                          Kelas
                        </th>

                        <th className="hidden w-[18%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white md:table-cell">
                          Email
                        </th>

                        <th className="w-[10%] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">
                          Status
                        </th>

                        <th className="w-[13%] px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white">
                          Aksi
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-200">

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
                                className="animate-spin text-blue-600"
                              />

                              <p className="mt-3 text-sm font-medium text-slate-700">
                                Mengambil data siswa...
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Menghubungkan ke database SmartSchool
                              </p>

                            </div>

                          </td>

                        </tr>
                      )}

                      {/* DATA */}

                      {!loading &&
                        currentItems.map(
                          (
                            item,
                            index
                          ) => {
                            const rowNumber =
                              startIndex +
                              index +
                              1;

                            return (
                              <tr
                                key={
                                  item.id
                                }
                                className="group transition-colors hover:bg-blue-50/50"
                              >

                                {/* NO */}

                                <td className="px-3 py-4 text-center text-sm font-medium text-slate-700">
                                  {
                                    rowNumber
                                  }
                                </td>

                                {/* PROFIL */}

                                <td className="px-3 py-4">

                                  <div className="flex min-w-0 items-center gap-3">

                                    <div
                                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getAvatarColor(
                                        item.nama
                                      )} text-sm font-bold text-white shadow-sm`}
                                    >
                                      {getInitials(
                                        item.nama
                                      )}
                                    </div>

                                    <div className="min-w-0">

                                      <p className="truncate text-sm font-semibold text-slate-800">
                                        {
                                          item.nama
                                        }
                                      </p>

                                      <p className="truncate text-xs text-slate-500">
                                        {
                                          formatGender(
                                            item.gender
                                          )
                                        }
                                      </p>

                                    </div>

                                  </div>

                                </td>

                                {/* NIS */}

                                <td className="px-3 py-4 text-sm text-slate-700">
                                  {
                                    item.nis
                                  }
                                </td>

                                {/* NISN */}

                                <td className="px-3 py-4 text-sm text-slate-700">
                                  {
                                    item.nisn
                                  }
                                </td>

                                {/* KELAS */}

                                <td className="px-3 py-4">

                                  {item.kelas !==
                                  "-" ? (
                                    <span className="inline-flex whitespace-nowrap rounded-lg bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                                      {
                                        item.kelas
                                      }
                                    </span>
                                  ) : (
                                    <span className="text-sm text-slate-400">
                                      Belum masuk kelas
                                    </span>
                                  )}

                                </td>

                                {/* EMAIL */}

                                <td className="hidden px-3 py-4 md:table-cell">

                                  <span className="block max-w-[220px] truncate text-sm text-slate-600">
                                    {
                                      item.email
                                    }
                                  </span>

                                </td>

                                {/* STATUS */}

                                <td className="px-3 py-4">

                                  <span
                                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${
                                      item.status ===
                                      "Aktif"
                                        ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                                        : "border-rose-300 bg-rose-100 text-rose-700"
                                    }`}
                                  >

                                    <span className="h-1.5 w-1.5 rounded-full bg-current" />

                                    {
                                      item.status
                                    }

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
                                      className="rounded-lg p-2 text-slate-500 transition hover:bg-blue-100 hover:text-blue-700"
                                      title="Lihat detail"
                                    >
                                      <Eye
                                        size={17}
                                      />
                                    </button>

                                    {/* EDIT */}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(
                                          `/admin/siswa/edit/${item.id}`
                                        )
                                      }
                                      className="rounded-lg p-2 text-slate-500 transition hover:bg-amber-100 hover:text-amber-700"
                                      title="Edit siswa"
                                    >
                                      <Edit
                                        size={17}
                                      />
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
                                      className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-100 hover:text-rose-700"
                                      title="Hapus siswa"
                                    >
                                      <Trash2
                                        size={17}
                                      />
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

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                        <Users
                          size={28}
                          className="text-slate-400"
                        />
                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-700">
                        Tidak ada data siswa
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
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
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                          >
                            <Plus
                              size={17}
                            />
                            Tambah Siswa
                          </button>
                        )}

                    </div>
                  )}

                {/* PAGINATION */}

                {!loading &&
                  totalItems > 0 && (
                    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-300 bg-slate-50 px-4 py-3 sm:flex-row">

                      <div className="flex items-center gap-3 text-sm text-slate-600">

                        <span>
                          Menampilkan{" "}
                          {startIndex +
                            1}{" "}
                          -{" "}
                          {endIndex}{" "}
                          dari{" "}
                          {
                            totalItems
                          }{" "}
                          data
                        </span>

                        <div className="flex items-center gap-1">

                          <span>
                            Tampil
                          </span>

                          <select
                            value={
                              itemsPerPage
                            }
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

                              setCurrentPage(
                                1
                              );
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700"
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

                      {totalPages >
                        1 && (
                        <div className="flex items-center gap-1">

                          <button
                            type="button"
                            disabled={
                              currentPage ===
                              1
                            }
                            onClick={() =>
                              goToPage(
                                1
                              )
                            }
                            className="rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-200 disabled:opacity-30"
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
                            className="rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-200 disabled:opacity-30"
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
                            (
                              _,
                              index
                            ) => {
                              let pageNumber;

                              if (
                                totalPages <=
                                5
                              ) {
                                pageNumber =
                                  index +
                                  1;
                              } else if (
                                currentPage <=
                                3
                              ) {
                                pageNumber =
                                  index +
                                  1;
                              } else if (
                                currentPage >=
                                totalPages -
                                  2
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
                                  key={
                                    pageNumber
                                  }
                                  onClick={() =>
                                    goToPage(
                                      pageNumber
                                    )
                                  }
                                  className={`h-8 w-8 rounded-lg text-sm font-medium ${
                                    currentPage ===
                                    pageNumber
                                      ? "bg-blue-600 text-white"
                                      : "text-slate-700 hover:bg-slate-200"
                                  }`}
                                >
                                  {
                                    pageNumber
                                  }
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
                                currentPage +
                                  1
                              )
                            }
                            className="rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-200 disabled:opacity-30"
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
                            className="rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                          >
                            »
                          </button>

                        </div>
                      )}

                    </div>
                  )}

              </div>

              {/* FOOTER */}

              <footer className="border-t border-slate-300 py-4 text-center text-sm text-slate-500">
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
          onClick={
            closeDeleteModal
          }
        >

          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="p-6 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                <AlertTriangle
                  size={30}
                  className="text-rose-600"
                />
              </div>

              <h3 className="text-xl font-bold text-slate-800">
                Hapus Data Siswa?
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">

                Apakah kamu yakin ingin
                menghapus data siswa

                <br />

                <span className="font-semibold text-slate-800">
                  "{deleteModal.nama}"
                </span>
                ?

              </p>

              <p className="mt-3 text-xs text-rose-500">
                Data akan dihapus melalui
                backend SmartSchool.
              </p>

            </div>

            <div className="flex gap-3 border-t border-slate-200 bg-slate-50 p-4">

              <button
                type="button"
                onClick={
                  closeDeleteModal
                }
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  confirmDelete
                }
                disabled={deleting}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
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
                      <Trash2
                        size={16}
                      />
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