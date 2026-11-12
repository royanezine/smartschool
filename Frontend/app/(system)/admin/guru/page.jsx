"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  AlertCircle,
  Loader2,
  Clock3,
  IdCard,
  Briefcase,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

import { getUsers, deleteUser } from "@/services/user.service";
import { getMataPelajaran } from "@/services/mataPelajaran.service";
import { getShiftKerja } from "@/services/shiftKerja.service";

export default function AdminGuruPage() {
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const [guru, setGuru] = useState([]);
  const [shiftKerjaList, setShiftKerjaList] = useState([]);
  const [totalMapel, setTotalMapel] = useState(0);

  const [loading, setLoading] = useState(true);
  const [loadingMapel, setLoadingMapel] = useState(true);
  const [loadingShift, setLoadingShift] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [shiftError, setShiftError] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [sortBy, setSortBy] = useState("namaLengkap");
  const [sortOrder, setSortOrder] = useState("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalData: 0,
    totalPages: 0,
  });

  const getResponseData = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.items)) return response.data.items;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    if (Array.isArray(response?.items)) return response.items;
    return [];
  };

  const getResponsePagination = (response, fallbackData = []) => {
    const meta =
      response?.pagination ??
      response?.meta ??
      response?.data?.pagination ??
      response?.data?.meta ??
      {};

    const total = Number(
      meta.totalData ?? meta.total ?? fallbackData.length
    );

    const limit = Number(meta.limit ?? itemsPerPage);

    return {
      page: Number(meta.page ?? currentPage),
      limit,
      totalData: total,
      totalPages: Number(
        meta.totalPages ?? Math.ceil(total / Math.max(limit, 1))
      ),
    };
  };

  const getPeranGuru = (item) => {
    if (!item) return "Belum ditentukan";

    const peran = item.peran;

    if (peran && typeof peran === "object") {
      return (
        peran.namaTampilan ||
        peran.nama ||
        "Belum ditentukan"
      );
    }

    return (
      item.peranNamaTampilan ||
      item.peranNama ||
      "Belum ditentukan"
    );
  };

  const getKategoriJabatan = (item) => {
    if (!item) return "Belum ditentukan";

    const kategori =
      item.kategoriJabatan ??
      item.kategori_jabatan ??
      item.kategoriJabatanGuru ??
      item.kategori_jabatan_guru ??
      null;

    if (kategori && typeof kategori === "object") {
      return (
        kategori.nama ??
        kategori.namaKategori ??
        kategori.nama_kategori ??
        kategori.kode ??
        "Belum ditentukan"
      );
    }

    return (
      item.kategoriJabatanNama ??
      item.kategori_jabatan_nama ??
      item.namaKategoriJabatan ??
      item.nama_kategori_jabatan ??
      "Belum ditentukan"
    );
  };

  const fetchGuru = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);

        setError("");

        const response = await getUsers({
          page: currentPage,
          limit: itemsPerPage,
          search: search.trim(),
          status: filterStatus,
          role: "guru",
          sortBy,
          sortOrder,
        });

        if (response?.success === false) {
          throw new Error(
            response?.message || "Gagal mengambil data guru."
          );
        }

        const users = getResponseData(response);

        setGuru(users);
        setPagination(getResponsePagination(response, users));
      } catch (err) {
        console.error("[AdminGuruPage] Gagal mengambil guru:", err);

        setGuru([]);

        setPagination({
          page: currentPage,
          limit: itemsPerPage,
          totalData: 0,
          totalPages: 0,
        });

        setError(err?.message || "Gagal mengambil data guru.");
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [
      currentPage,
      itemsPerPage,
      search,
      filterStatus,
      sortBy,
      sortOrder,
    ]
  );

  const fetchShiftKerja = useCallback(async () => {
    try {
      setLoadingShift(true);
      setShiftError("");

      const response = await getShiftKerja({
        page: 1,
        limit: 100,
        status: "aktif",
      });

      if (response?.success === false) {
        throw new Error(
          response?.message || "Gagal mengambil master shift kerja."
        );
      }

      setShiftKerjaList(getResponseData(response));
    } catch (err) {
      console.error(
        "[AdminGuruPage] Gagal mengambil shift kerja:",
        err
      );

      setShiftKerjaList([]);

      setShiftError(
        err?.message || "Gagal mengambil master shift kerja."
      );
    } finally {
      setLoadingShift(false);
    }
  }, []);

  const fetchMapel = useCallback(async () => {
    try {
      setLoadingMapel(true);

      const response = await getMataPelajaran();

      if (response?.success === false) {
        throw new Error(
          response?.message || "Gagal mengambil mata pelajaran."
        );
      }

      setTotalMapel(getResponseData(response).length);
    } catch (err) {
      console.error(
        "[AdminGuruPage] Gagal mengambil mata pelajaran:",
        err
      );

      setTotalMapel(0);
    } finally {
      setLoadingMapel(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGuru();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchGuru]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShiftKerja();
      fetchMapel();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchShiftKerja, fetchMapel]);

  const formatJam = (value) => {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const text = String(value).trim();
    const match = text.match(/(?:T|\s)?(\d{1,2}):(\d{2})(?::\d{2})?/);

    if (match) {
      return `${match[1].padStart(2, "0")}:${match[2]}`;
    }

    return text;
  };

  const getShiftFromUser = useCallback(
    (item) => {
      if (!item) return null;

      const relation =
        item.shiftKerjaMaster ??
        item.shiftKerjaUser?.shiftKerjaMaster ??
        item.shiftKerja?.shiftKerjaMaster ??
        item.shiftKerjaUser?.shiftKerja ??
        null;

      if (relation && typeof relation === "object") {
        return relation;
      }

      if (
        item.shiftKerja &&
        typeof item.shiftKerja === "object" &&
        (item.shiftKerja.id ||
          item.shiftKerja.nama ||
          item.shiftKerja.jamMasuk ||
          item.shiftKerja.jamKeluar)
      ) {
        return item.shiftKerja;
      }

      const shiftId =
        item.shiftKerjaId ??
        item.shiftKerjaUser?.shiftKerjaId ??
        item.shiftKerja?.id ??
        null;

      if (shiftId) {
        const found = shiftKerjaList.find(
          (shift) => String(shift.id) === String(shiftId)
        );

        if (found) return found;
      }

      if (typeof item.shiftKerja === "string" && item.shiftKerja.trim()) {
        const shiftName = item.shiftKerja.trim().toLowerCase();

        const found = shiftKerjaList.find(
          (shift) =>
            String(shift.nama || "").trim().toLowerCase() === shiftName ||
            String(shift.kode || "").trim().toLowerCase() === shiftName
        );

        if (found) return found;

        return {
          nama: item.shiftKerja,
          kode: null,
          jamMasuk: null,
          jamKeluar: null,
        };
      }

      return null;
    },
    [shiftKerjaList]
  );

  const getShiftName = (shift) => {
    if (!shift) return "Belum ditentukan";
    return shift.nama || shift.kode || "Shift tanpa nama";
  };

  const getShiftHours = (shift) => {
    if (!shift) return "Belum ditentukan";

    const masuk = formatJam(
      shift.jamMasuk ?? shift.jam_masuk ?? shift.waktuMasuk
    );

    const keluar = formatJam(
      shift.jamKeluar ?? shift.jam_keluar ?? shift.waktuKeluar
    );

    if (!masuk && !keluar) return "Jam belum tersedia";

    return `${masuk || "--:--"} - ${keluar || "--:--"}`;
  };

  const handleRefresh = async () => {
    await Promise.all([fetchGuru(), fetchShiftKerja(), fetchMapel()]);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    const options = {
      nama_asc: ["namaLengkap", "asc"],
      nama_desc: ["namaLengkap", "desc"],
      nip_asc: ["nip", "asc"],
      nip_desc: ["nip", "desc"],
      status_asc: ["status", "asc"],
      status_desc: ["status", "desc"],
    };

    const selected = options[value];

    if (!selected) return;

    setCurrentPage(1);
    setSortBy(selected[0]);
    setSortOrder(selected[1]);
  };

  const sortValue = useMemo(() => {
    if (sortBy === "namaLengkap") {
      return sortOrder === "asc" ? "nama_asc" : "nama_desc";
    }

    if (sortBy === "nip") {
      return sortOrder === "asc" ? "nip_asc" : "nip_desc";
    }

    return sortOrder === "asc" ? "status_asc" : "status_desc";
  }, [sortBy, sortOrder]);

  const handleDelete = async (id, nama) => {
    if (!id) return;

    const confirmed = window.confirm(
      `Yakin ingin menonaktifkan guru "${nama}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      const response = await deleteUser(id);

      if (response?.success === false) {
        throw new Error(
          response?.message || "Gagal menonaktifkan guru."
        );
      }

      window.alert(
        response?.message ||
          `Permintaan menonaktifkan guru "${nama}" berhasil.`
      );

      if (guru.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        await fetchGuru();
      }
    } catch (err) {
      console.error(
        "[AdminGuruPage] Gagal menonaktifkan guru:",
        err
      );

      window.alert(err?.message || "Gagal menonaktifkan guru.");
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = pagination.totalPages || 0;
  const totalData = pagination.totalData || 0;

  const startIndex =
    totalData === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;

  const endIndex =
    totalData === 0
      ? 0
      : Math.min(currentPage * itemsPerPage, totalData);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 0) return [];

    const maxButtons = 5;

    if (totalPages <= maxButtons) {
      return Array.from(
        { length: totalPages },
        (_, index) => index + 1
      );
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (currentPage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  }, [currentPage, totalPages]);

  const totalGuru = totalData;

  const totalAktif = guru.filter((item) =>
    ["aktif", "active"].includes(
      String(item.status || "").toLowerCase()
    )
  ).length;

  const totalNonaktif = guru.filter(
    (item) =>
      !["aktif", "active"].includes(
        String(item.status || "").toLowerCase()
      )
  ).length;

  const normalizeStatus = (status) => {
    const value = String(status || "").toLowerCase();

    return value === "aktif" || value === "active"
      ? "Aktif"
      : "Nonaktif";
  };

  const getInitials = (nama) => {
    if (!nama) return "GU";

    const cleanName = String(nama).replace(/,.*$/, "").trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return cleanName.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = () =>
    "bg-[image:var(--color-brand-logo-bg)]";

  const getKategoriJabatanColor = (nama) => {
    if (!nama || nama === "Belum ditentukan") {
      return "theme-card-soft theme-text-muted border theme-border";
    }
    const val = String(nama).toLowerCase();
    if (val.includes("kepala") || val.includes("kepsek")) {
      return "border border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]";
    }
    if (val.includes("wakil")) {
      return "border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text";
    }
    if (val.includes("guru") || val.includes("pendidik")) {
      return "border border-[color-mix(in_srgb,var(--color-success)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)]";
    }
    if (val.includes("staff") || val.includes("tendik") || val.includes("administrasi")) {
      return "border border-[color-mix(in_srgb,var(--color-warning)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-warning)_10%,transparent)] text-[var(--color-warning)]";
    }
    return "border border-[color-mix(in_srgb,var(--color-text)_15%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-secondary";
  };

  const getPeranColor = (nama) => {
    if (!nama || nama === "Belum ditentukan") {
      return "theme-card-soft theme-text-muted border theme-border";
    }
    const val = String(nama).toLowerCase();
    if (val.includes("admin")) {
      return "border border-[color-mix(in_srgb,var(--color-primary)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)]";
    }
    if (val.includes("guru")) {
      return "border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text";
    }
    return "border border-[color-mix(in_srgb,var(--color-text)_15%,transparent)] bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)] theme-text-secondary";
  };

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };

      return entities[char];
    });

  const getExportRows = () =>
    guru.map((item, index) => {
      const shift = getShiftFromUser(item);

      return {
        no: startIndex + index,
        nama: item.namaLengkap || "",
        username: item.namaPengguna || "",
        nip: item.nip || "",
        nuptk: item.nuptk || "",
        email: item.email || "",
        status: normalizeStatus(item.status),

        peran: getPeranGuru(item),
        kategoriJabatan: getKategoriJabatan(item),
        jabatan: item.jabatan || "",

        golongan: item.golongan || "",
        jenisKelamin: item.jenisKelamin || "",
        shift: getShiftName(shift),

        jamMasuk:
          formatJam(
            shift?.jamMasuk ??
              shift?.jam_masuk ??
              shift?.waktuMasuk
          ) || "-",

        jamKeluar:
          formatJam(
            shift?.jamKeluar ??
              shift?.jam_keluar ??
              shift?.waktuKeluar
          ) || "-",

        sekolah: item.sekolah?.nama || "",
      };
    });

  const exportCSV = () => {
    if (!guru.length) {
      window.alert("Tidak ada data guru untuk diekspor.");
      return;
    }

    const headers = [
      "No",
      "Nama",
      "Username",
      "NIP",
      "NUPTK",
      "Email",
      "Kategori Jabatan",
      "Peran",
      "Golongan",
      "Jenis Kelamin",
      "Shift",
      "Jam Masuk",
      "Jam Keluar",
      "Status",
      "Sekolah",
    ];

    const rows = getExportRows().map((item) => [
      item.no,
      item.nama,
      item.username,
      item.nip,
      item.nuptk,
      item.email,
      item.kategoriJabatan,
      item.peran,
      item.golongan,
      item.jenisKelamin,
      item.shift,
      item.jamMasuk,
      item.jamKeluar,
      item.status,
      item.sekolah,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\ufeff", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;

    link.download = `data_guru_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const exportExcel = () => {
    if (!guru.length) {
      window.alert("Tidak ada data guru untuk diekspor.");
      return;
    }

    const headers = [
      "No",
      "Nama",
      "Username",
      "NIP",
      "NUPTK",
      "Email",
      "Kategori Jabatan",
      "Peran",
      "Golongan",
      "Jenis Kelamin",
      "Shift",
      "Jam Masuk",
      "Jam Keluar",
      "Status",
      "Sekolah",
    ];

    const rows = getExportRows();

    const tableRows = rows
      .map(
        (item) => `
          <tr>
            <td>${item.no}</td>
            <td>${escapeHTML(item.nama)}</td>
            <td>${escapeHTML(item.username)}</td>
            <td>${escapeHTML(item.nip)}</td>
            <td>${escapeHTML(item.nuptk)}</td>
            <td>${escapeHTML(item.email)}</td>
            <td>${escapeHTML(item.kategoriJabatan)}</td>
            <td>${escapeHTML(item.peran)}</td>
            <td>${escapeHTML(item.golongan)}</td>
            <td>${escapeHTML(item.jenisKelamin)}</td>
            <td>${escapeHTML(item.shift)}</td>
            <td>${escapeHTML(item.jamMasuk)}</td>
            <td>${escapeHTML(item.jamKeluar)}</td>
            <td>${escapeHTML(item.status)}</td>
            <td>${escapeHTML(item.sekolah)}</td>
          </tr>
        `
      )
      .join("");

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; font-family: Arial, sans-serif; font-size: 12px; }
            th { background: #2563eb; color: white; font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>Data Guru SmartSchool</h2>
          <table>
            <thead>
              <tr>
                ${headers.map((header) => `<th>${escapeHTML(header)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;

    link.download = `data_guru_${new Date()
      .toISOString()
      .slice(0, 10)}.xls`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    if (!guru.length) {
      window.alert("Tidak ada data guru untuk dicetak.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=1400,height=900");

    if (!printWindow) {
      window.alert("Mohon izinkan popup pada browser untuk mencetak.");
      return;
    }

    const rows = getExportRows()
      .map(
        (item) => `
          <tr>
            <td>${item.no}</td>
            <td>${escapeHTML(item.nama)}</td>
            <td>${escapeHTML(item.nip || "-")}</td>
            <td>${escapeHTML(item.email || "-")}</td>
            <td>${escapeHTML(item.kategoriJabatan)}</td>
            <td>${escapeHTML(item.peran)}</td>
            <td>${escapeHTML(item.shift)}</td>
            <td>${escapeHTML(item.jamMasuk)}</td>
            <td>${escapeHTML(item.jamKeluar)}</td>
            <td>${escapeHTML(item.status)}</td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Data Guru SmartSchool</title>
          <style>
            * { box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            h1 { margin: 0 0 6px; font-size: 22px; }
            p { margin: 0 0 20px; color: #64748b; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th { background: #2563eb; color: white; padding: 8px; text-align: left; }
            td { border: 1px solid #cbd5e1; padding: 7px 8px; }
            tr:nth-child(even) { background: #f8fafc; }
            @media print { body { padding: 0; } @page { size: landscape; } }
          </style>
        </head>
        <body>
          <h1>Data Guru</h1>
          <p>
            SmartSchool • Total data pada halaman: ${guru.length} guru •
            ${escapeHTML(new Date().toLocaleDateString("id-ID"))}
          </p>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>NIP</th>
                <th>Email</th>
                <th>Kategori Jabatan</th>
                <th>Peran</th>
                <th>Shift</th>
                <th>Jam Masuk</th>
                <th>Jam Keluar</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const statCards = [
    {
      key: "total",
      label: "Total Guru",
      value: loading ? "—" : totalGuru,
      note: "Seluruh data guru",
      icon: Users,
    },
    {
      key: "aktif",
      label: "Aktif di Halaman",
      value: loading ? "—" : totalAktif,
      note: "Guru berstatus aktif",
      icon: CheckCircle,
    },
    {
      key: "nonaktif",
      label: "Nonaktif di Halaman",
      value: loading ? "—" : totalNonaktif,
      note: "Guru berstatus nonaktif",
      icon: XCircle,
    },
    {
      key: "mapel",
      label: "Mata Pelajaran",
      value: loadingMapel ? "—" : totalMapel,
      note: "Mata pelajaran tersedia",
      icon: BookOpen,
    },
  ];

  return (
    <div className="theme-page flex h-screen w-full overflow-hidden">
      <Sidebar
        active="guru"
        setActive={() => {}}
        collapsed={isCollapsed}
        setCollapsed={setIsCollapsed}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0 border-b theme-border">
          <Header
            toggleSidebar={() => setIsCollapsed((value) => !value)}
            notifications={[]}
            user={{
              name: "Admin Sekolah",
              email: "admin@smartschool.com",
              avatar: "AD",
            }}
          />
        </div>

        <div className="flex min-h-0 flex-1">
          <main className="theme-page min-h-0 min-w-0 flex-1 overflow-y-auto">
            <div className="w-full p-4 md:p-6 lg:p-8 2xl:px-12">
              <div className="w-full space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[image:var(--color-brand-logo-bg)] text-white flex items-center justify-center shadow-md">
                      <Users size={21} />
                    </div>

                    <div>
                      <h1 className="text-xl font-semibold theme-text">
                        Data Guru
                      </h1>

                      <p className="text-sm theme-text-secondary">
                        Data induk tenaga pendidik, peran, kategori jabatan, dan shift kerja
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative group">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border theme-border theme-card theme-text-secondary theme-header-hover transition-all text-sm font-medium"
                      >
                        <Download size={17} />
                        Export
                      </button>

                      <div className="absolute right-0 top-full mt-1 w-44 theme-card rounded-xl border theme-border shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-30">
                        <button
                          type="button"
                          onClick={exportPDF}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)] rounded-t-xl"
                        >
                          <Printer size={16} />
                          PDF / Print
                        </button>

                        <button
                          type="button"
                          onClick={exportExcel}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)]"
                        >
                          <FileSpreadsheet size={16} />
                          Excel
                        </button>

                        <button
                          type="button"
                          onClick={exportCSV}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-sm theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)] rounded-b-xl"
                        >
                          <FileText size={16} />
                          CSV
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRefresh}
                      disabled={loading || loadingShift}
                      className="p-2.5 rounded-xl border theme-border theme-card theme-text-secondary hover:text-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] disabled:opacity-50 transition-all"
                      title="Refresh data"
                    >
                      <RefreshCw
                        size={17}
                        className={loading || loadingShift ? "animate-spin" : ""}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push("/admin/guru/tambah")}
                      className="flex items-center gap-2 px-5 py-2.5 theme-primary rounded-xl transition-all shadow-sm hover:shadow-md font-medium"
                    >
                      <Plus size={18} />
                      Tambah Guru
                    </button>
                  </div>
                </div>

                <div className="theme-card rounded-xl border theme-border shadow-sm p-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                          <Clock3 size={18} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold theme-text">
                            Master Shift Kerja
                          </p>

                          <p className="text-xs theme-text-muted mt-0.5">
                            Jadwal shift aktif dari Backend.
                          </p>
                        </div>
                      </div>

                      <span className="text-xs theme-text-muted">
                        {loadingShift
                          ? "Memuat shift..."
                          : `${shiftKerjaList.length} shift tersedia`}
                      </span>
                    </div>

                    {shiftError && (
                      <p className="text-xs text-red-500">{shiftError}</p>
                    )}

                    {!loadingShift && !shiftError && shiftKerjaList.length === 0 && (
                      <p className="text-sm theme-text-muted">
                        Belum ada master shift yang tersedia.
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {shiftKerjaList.map((shift) => (
                        <div
                          key={shift.id}
                          className="flex items-center gap-2 px-3 py-2 theme-card-soft border theme-border rounded-lg"
                        >
                          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />

                          <span className="text-xs font-medium theme-text-secondary">
                            {getShiftName(shift)}
                          </span>

                          {shift.kode && (
                            <span className="text-xs theme-text-muted">
                              ({shift.kode})
                            </span>
                          )}

                          <span className="text-xs theme-text-muted">
                            {getShiftHours(shift)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl border theme-danger">
                    <AlertCircle size={20} className="mt-0.5 shrink-0" />

                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        Gagal mengambil data guru
                      </p>

                      <p className="text-sm mt-1">{error}</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRefresh}
                      className="text-sm font-medium hover:opacity-80"
                    >
                      Coba lagi
                    </button>
                  </div>
                )}

                {/* Kartu statistik: 4 kolom penuh, simetris, tinggi seragam */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                  {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                      <div
                        key={card.key}
                        className="theme-card flex h-full min-h-[120px] flex-col justify-between rounded-xl border theme-border p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text">
                            <Icon size={16} />
                          </div>

                          <p className="text-[10px] font-medium theme-text-muted uppercase tracking-wider">
                            {card.label}
                          </p>
                        </div>

                        <div className="mt-2">
                          <p className="text-2xl font-bold theme-text">
                            {card.value}
                          </p>

                          <p className="text-[10px] theme-text-muted mt-1">
                            {card.note}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="theme-card rounded-xl border theme-border p-4 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-muted"
                      />

                      <input
                        type="text"
                        placeholder="Cari nama, NIP, email, atau username..."
                        value={search}
                        onChange={(event) => handleSearchChange(event.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm theme-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Filter size={17} className="theme-text-muted shrink-0" />

                      <select
                        value={filterStatus}
                        onChange={(event) => handleStatusChange(event.target.value)}
                        className="py-2.5 px-3 pr-8 text-sm theme-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition appearance-none cursor-pointer"
                      >
                        <option value="semua">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <ArrowUpDown size={17} className="theme-text-muted shrink-0" />

                      <select
                        value={sortValue}
                        onChange={(event) => handleSortChange(event.target.value)}
                        className="py-2.5 px-3 pr-8 text-sm theme-input rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)] transition appearance-none cursor-pointer"
                      >
                        <option value="nama_asc">Nama A-Z</option>
                        <option value="nama_desc">Nama Z-A</option>
                        <option value="nip_asc">NIP A-Z</option>
                        <option value="nip_desc">NIP Z-A</option>
                        <option value="status_asc">Status A-Z</option>
                        <option value="status_desc">Status Z-A</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="theme-card rounded-xl border theme-border shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1500px] table-fixed">
                      <colgroup>
                        <col className="w-[4%]" />
                        <col className="w-[16%]" />
                        <col className="w-[9%]" />
                        <col className="w-[14%]" />
                        <col className="w-[12%]" />
                        <col className="w-[9%]" />
                        <col className="w-[9%]" />
                        <col className="w-[9%]" />
                        <col className="w-[8%]" />
                        <col className="w-[10%]" />
                      </colgroup>

                      <thead>
                        <tr className="theme-primary">
                          {[
                            "No",
                            "Profil",
                            "NIP",
                            "Email",
                            "Kategori Jabatan",
                            "Peran",
                            "Shift",
                            "Jam Kerja",
                            "Status",
                            "Aksi",
                          ].map((heading) => (
                            <th
                              key={heading}
                              className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white ${
                                heading === "No" || heading === "Aksi"
                                  ? "text-center"
                                  : "text-left"
                              }`}
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {loading && (
                          <tr>
                            <td colSpan={10} className="px-4 py-14 text-center">
                              <div className="flex flex-col items-center">
                                <Loader2
                                  size={28}
                                  className="animate-spin text-[var(--color-primary)]"
                                />

                                <p className="text-sm font-medium theme-text-secondary mt-3">
                                  Mengambil data guru...
                                </p>

                                <p className="text-xs theme-text-muted mt-1">
                                  Menghubungkan ke server
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}

                        {!loading &&
                          guru.map((item, index) => {
                            const rowNumber = startIndex + index;
                            const status = normalizeStatus(item.status);
                            const shift = getShiftFromUser(item);

                            const peranGuru = getPeranGuru(item);
                            const kategoriJabatan = getKategoriJabatan(item);

                            return (
                              <tr
                                key={item.id}
                                className="transition-colors theme-table-hover"
                              >
                                <td className="px-4 py-4 text-center align-middle text-sm font-medium theme-text-secondary">
                                  {rowNumber}
                                </td>

                                <td className="px-4 py-4 align-middle">
                                  <div className="flex items-center gap-3 min-w-0">
                                    {item.avatar ? (
                                      <img
                                        src={item.avatar}
                                        alt={item.namaLengkap || "Guru"}
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                      />
                                    ) : (
                                      <div
                                        className={`w-10 h-10 rounded-full ${getAvatarColor()} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}
                                      >
                                        {getInitials(item.namaLengkap)}
                                      </div>
                                    )}

                                    <div className="min-w-0">
                                      <p className="font-semibold theme-text text-sm truncate">
                                        {item.namaLengkap || "-"}
                                      </p>

                                      <p className="text-xs theme-text-muted truncate">
                                        {item.namaPengguna || "-"}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-4 align-middle">
                                  <span className="text-sm theme-text-secondary whitespace-nowrap">
                                    {item.nip || "-"}
                                  </span>
                                </td>

                                <td className="px-4 py-4 align-middle">
                                  <span className="text-sm theme-text-secondary break-all">
                                    {item.email || "-"}
                                  </span>
                                </td>

                                <td className="px-4 py-4 align-middle">
                                  <div className="flex flex-col gap-1">
                                    <span
                                      className={`inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${getKategoriJabatanColor(kategoriJabatan)}`}
                                    >
                                      <Briefcase size={12} />
                                      {kategoriJabatan}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-4 py-4 align-middle">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${getPeranColor(peranGuru)}`}
                                  >
                                    <ShieldCheck size={12} />
                                    {peranGuru}
                                  </span>
                                </td>

                                <td className="px-4 py-4 align-middle">
                                  {shift ? (
                                    <div className="flex flex-col gap-1">
                                      <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-md border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text text-xs font-semibold whitespace-nowrap">
                                        <Clock3 size={12} />
                                        {getShiftName(shift)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md border theme-border text-xs theme-text-muted whitespace-nowrap">
                                      Belum ditentukan
                                    </span>
                                  )}
                                </td>

                                <td className="px-4 py-4 align-middle">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium theme-text-secondary whitespace-nowrap">
                                      {getShiftHours(shift)}
                                    </span>

                                    <span className="text-[10px] theme-text-muted">
                                      {shift?.nama
                                        ? `Jadwal ${getShiftName(shift)}`
                                        : "Jadwal kerja"}
                                    </span>
                                  </div>
                                </td>

                                <td className="px-4 py-4 align-middle">
                                  <span
                                    className={
                                      status === "Aktif"
                                        ? "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-[color-mix(in_srgb,var(--color-success)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_10%,transparent)] text-[var(--color-success)] whitespace-nowrap"
                                        : "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-[color-mix(in_srgb,var(--color-danger)_25%,transparent)] bg-[color-mix(in_srgb,var(--color-danger)_10%,transparent)] text-[var(--color-danger)] whitespace-nowrap"
                                    }
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    {status}
                                  </span>
                                </td>

                                <td className="px-4 py-4 align-middle">
                                  <div className="flex justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => router.push(`/admin/guru/${item.id}`)}
                                      className="p-2 rounded-lg theme-text-muted hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)] transition-all"
                                      title="Lihat Profil"
                                    >
                                      <Eye size={17} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(`/admin/guru/kartu-identitas/card?id=${item.id}`)
                                      }
                                      className="p-2 rounded-lg theme-text-muted hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)] transition-all"
                                      title="Cetak Kartu Identitas"
                                    >
                                      <IdCard size={17} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => router.push(`/admin/guru/edit/${item.id}`)}
                                      className="p-2 rounded-lg theme-text-muted hover:bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] hover:text-[var(--color-primary)] transition-all"
                                      title="Edit Guru"
                                    >
                                      <Edit size={17} />
                                    </button>

                                    <button
                                      type="button"
                                      disabled={deletingId === item.id}
                                      onClick={() => handleDelete(item.id, item.namaLengkap)}
                                      className="p-2 rounded-lg theme-text-muted hover:bg-[var(--color-danger-background)] hover:text-[var(--color-danger)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                      title="Nonaktifkan Guru"
                                    >
                                      {deletingId === item.id ? (
                                        <Loader2 size={17} className="animate-spin" />
                                      ) : (
                                        <Trash2 size={17} />
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {!loading && guru.length === 0 && (
                    <div className="p-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] theme-primary-text flex items-center justify-center mx-auto mb-3">
                        <Users size={24} />
                      </div>

                      <p className="text-sm font-medium theme-text-secondary">
                        {error
                          ? "Data guru tidak dapat dimuat"
                          : "Tidak ada data guru"}
                      </p>

                      <p className="text-xs theme-text-muted mt-1">
                        {error
                          ? "Periksa koneksi API dan sesi login."
                          : search
                            ? "Coba ubah kata pencarian."
                            : "Belum terdapat data guru pada server."}
                      </p>

                      {error && (
                        <button
                          type="button"
                          onClick={handleRefresh}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg theme-primary text-sm font-medium"
                        >
                          <RefreshCw size={15} />
                          Coba Lagi
                        </button>
                      )}
                    </div>
                  )}

                  {!loading && totalData > 0 && (
                    <div className="flex flex-col lg:flex-row items-center justify-between px-4 py-3 border-t theme-border theme-card-soft gap-3">
                      <div className="flex flex-wrap items-center justify-center gap-3 text-sm theme-text-secondary">
                        <span>
                          Menampilkan{" "}
                          <strong className="font-semibold theme-text">
                            {startIndex}
                          </strong>{" "}
                          -{" "}
                          <strong className="font-semibold theme-text">
                            {endIndex}
                          </strong>{" "}
                          dari{" "}
                          <strong className="font-semibold theme-text">
                            {totalData}
                          </strong>{" "}
                          data
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span>Tampil</span>

                          <select
                            value={itemsPerPage}
                            onChange={(event) => {
                              setItemsPerPage(Number(event.target.value));
                              setCurrentPage(1);
                            }}
                            className="py-1 px-2 text-sm theme-input rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 cursor-pointer"
                          >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={40}>40</option>
                          </select>
                        </div>
                      </div>

                      {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => goToPage(1)}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg theme-text-muted hover:bg-[var(--color-table-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition"
                            aria-label="Halaman pertama"
                          >
                            <ChevronsLeft size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg theme-text-muted hover:bg-[var(--color-table-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition"
                            aria-label="Halaman sebelumnya"
                          >
                            <ChevronLeft size={16} />
                          </button>

                          {pageNumbers.map((page) => (
                            <button
                              key={page}
                              type="button"
                              onClick={() => goToPage(page)}
                              className={
                                currentPage === page
                                  ? "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium theme-primary shadow-sm"
                                  : "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium theme-text-secondary hover:bg-[var(--color-table-hover)] transition"
                              }
                            >
                              {page}
                            </button>
                          ))}

                          <button
                            type="button"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-lg theme-text-muted hover:bg-[var(--color-table-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition"
                            aria-label="Halaman berikutnya"
                          >
                            <ChevronRight size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => goToPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-lg theme-text-muted hover:bg-[var(--color-table-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition"
                            aria-label="Halaman terakhir"
                          >
                            <ChevronsRight size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <footer className="text-center text-sm theme-text-muted py-3 border-t theme-border">
                  © 2026 SmartSchool • Data Guru
                </footer>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}