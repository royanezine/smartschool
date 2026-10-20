 "use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, Search, ArrowUp, ArrowDown, Filter, Download, RefreshCw,
  Clock, Users, CheckCircle, XCircle, GraduationCap, Shield, DollarSign,
  BookOpen, Database, UserCog, Settings, Lock, BarChart3, Building2,
  FileText, Globe, AlertCircle, RotateCcw
} from "lucide-react";
import { getAuditLogs } from "@/services/auditLog.service";

const PAGE_SIZE = 10;

const theme = {
  card: "theme-card border theme-border rounded-2xl shadow-[0_4px_18px_color-mix(in_srgb,var(--color-text)_5%,transparent)]",
  input: "h-10 w-full rounded-xl border theme-border bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] px-3 text-sm theme-text outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_14%,transparent)]",
  muted: "theme-text-muted",
  primary: "text-[var(--color-primary)]",
};

function normalizeStatus(status) {
  const value = String(status ?? "").trim().toLowerCase();
  if (["success", "berhasil", "sukses", "berhasil_login"].includes(value)) return "success";
  if (["failed", "failure", "gagal", "error"].includes(value)) return "failed";
  return value || "unknown";
}

function statusLabel(status) {
  if (status === "success") return "Berhasil";
  if (status === "failed") return "Gagal";
  if (status === "unknown") return "Tidak diketahui";
  return status;
}

function formatDateTime(value, compact = false) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: compact ? "short" : "medium",
    timeStyle: "short",
  }).format(date);
}

function getModuleIcon(module) {
  const value = String(module || "").toLowerCase();
  if (value.includes("siswa")) return Users;
  if (value.includes("guru")) return GraduationCap;
  if (value.includes("presensi") || value.includes("absen")) return Clock;
  if (value.includes("keuangan") || value.includes("pembayaran")) return DollarSign;
  if (value.includes("akademik") || value.includes("nilai")) return BookOpen;
  if (value.includes("akses") || value.includes("role") || value.includes("permission")) return Shield;
  if (value.includes("pengguna") || value.includes("user")) return UserCog;
  if (value.includes("pengaturan")) return Settings;
  if (value.includes("keamanan")) return Lock;
  if (value.includes("laporan")) return BarChart3;
  if (value.includes("sekolah")) return Building2;
  if (value.includes("database")) return Database;
  if (value.includes("dokumen") || value.includes("administrasi")) return FileText;
  return Activity;
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className={`${theme.card} p-4`}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-primary)_9%,transparent)] text-[var(--color-primary)]">
          <Icon size={17} />
        </div>
        <div className="min-w-0">
          <p className={`text-[10px] font-semibold uppercase tracking-wider ${theme.muted}`}>{label}</p>
          <p className="text-lg font-semibold theme-text">{Number(value || 0).toLocaleString("id-ID")}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = normalizeStatus(status);
  const isSuccess = normalized === "success";
  const isFailed = normalized === "failed";
  const classes = isSuccess
    ? "border-[color-mix(in_srgb,var(--color-success)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_9%,transparent)] text-[var(--color-success)]"
    : isFailed
      ? "border-red-500/20 bg-red-500/5 text-red-600"
      : "border theme-border bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)] theme-text-secondary";
  const Icon = isSuccess ? CheckCircle : isFailed ? XCircle : AlertCircle;
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${classes}`}><Icon size={12} />{statusLabel(normalized)}</span>;
}

export default function LogAktivitasPage() {
  const [logs, setLogs] = useState([]);
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTime, setSelectedTime] = useState("week");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortField, setSortField] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  // BE search supports aksi and modul. Fetch a larger first page, then apply UI-only filters locally.
  const loadAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await getAuditLogs({ page: 1, limit: 100 });
      if (!response || response.success !== true || !Array.isArray(response.data)) {
        throw new Error(response?.message || "Format respons audit log dari server tidak sesuai.");
      }

      const mapped = response.data.map((item, index) => ({
        id: String(item?.id ?? `audit-${index}`),
        user: item?.pengguna?.namaLengkap || item?.penggunaId || "-",
        role: item?.pengguna?.peran?.nama || "-",
        module: item?.modul || "-",
        action: item?.aksi || "-",
        rawStatus: item?.status ?? null,
        status: normalizeStatus(item?.status),
        timestamp: item?.waktu || null,
        ip: item?.ipAddress || item?.ip || "-",
      }));

      setLogs(mapped);
      setMeta(response.meta || null);
      setCurrentPage(1);
    } catch (error) {
      console.error("Gagal mengambil audit log:", error);
      setLogs([]);
      setMeta(null);
      setErrorMessage(error instanceof Error ? error.message : "Terjadi kesalahan saat mengambil audit log.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadAuditLogs(); }, [loadAuditLogs]);

  const roleOptions = useMemo(() => [...new Set(logs.map(x => x.role).filter(x => x && x !== "-"))].sort(), [logs]);
  const moduleOptions = useMemo(() => [...new Set(logs.map(x => x.module).filter(x => x && x !== "-"))].sort(), [logs]);

  const filteredLogs = useMemo(() => {
    const now = new Date();
    const search = searchQuery.trim().toLowerCase();

    return logs.filter(log => {
      const searchMatch = !search || [log.user, log.role, log.module, log.action, log.ip]
        .some(value => String(value || "").toLowerCase().includes(search));
      if (!searchMatch) return false;
      if (selectedRole !== "all" && log.role !== selectedRole) return false;
      if (selectedModule !== "all" && log.module !== selectedModule) return false;
      if (selectedStatus !== "all" && log.status !== selectedStatus) return false;

      if (selectedTime !== "all") {
        const date = log.timestamp ? new Date(log.timestamp) : null;
        if (!date || Number.isNaN(date.getTime())) return false;
        if (selectedTime === "today" && date.toDateString() !== now.toDateString()) return false;
        if (selectedTime === "week") {
          const from = new Date(now); from.setDate(now.getDate() - 7);
          if (date < from) return false;
        }
        if (selectedTime === "month") {
          const from = new Date(now); from.setDate(now.getDate() - 30);
          if (date < from) return false;
        }
        if (selectedTime === "custom") {
          if (startDate) {
            const from = new Date(`${startDate}T00:00:00`);
            if (date < from) return false;
          }
          if (endDate) {
            const to = new Date(`${endDate}T23:59:59.999`);
            if (date > to) return false;
          }
        }
      }
      return true;
    });
  }, [logs, searchQuery, selectedRole, selectedModule, selectedStatus, selectedTime, startDate, endDate]);

  const sortedLogs = useMemo(() => [...filteredLogs].sort((a, b) => {
    let left = a[sortField], right = b[sortField];
    if (sortField === "timestamp") {
      left = left ? new Date(left).getTime() : 0;
      right = right ? new Date(right).getTime() : 0;
    } else {
      left = String(left ?? "").toLowerCase();
      right = String(right ?? "").toLowerCase();
    }
    if (left < right) return sortOrder === "asc" ? -1 : 1;
    if (left > right) return sortOrder === "asc" ? 1 : -1;
    return 0;
  }), [filteredLogs, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / PAGE_SIZE));
  const pageLogs = sortedLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const stats = useMemo(() => ({
    total: logs.length,
    success: logs.filter(x => x.status === "success").length,
    failed: logs.filter(x => x.status === "failed").length,
    users: new Set(logs.map(x => x.user).filter(x => x && x !== "-")).size,
    modules: new Set(logs.map(x => x.module).filter(x => x && x !== "-")).size,
  }), [logs]);

  const changeSort = field => {
    if (field === sortField) setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortOrder(field === "timestamp" ? "desc" : "asc"); }
  };
  const sortIcon = field => sortField !== field ? null : sortOrder === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />;

  const resetFilters = () => {
    setSearchQuery(""); setSelectedRole("all"); setSelectedModule("all");
    setSelectedStatus("all"); setSelectedTime("week"); setStartDate(""); setEndDate(""); setCurrentPage(1);
  };

  const exportCsv = () => {
    if (!sortedLogs.length) return;
    const rows = [
      ["Pengguna", "Role", "Modul", "Aktivitas", "Status", "Waktu", "IP Address"],
      ...sortedLogs.map(log => [log.user, log.role, log.module, log.action, statusLabel(log.status), formatDateTime(log.timestamp), log.ip]),
    ];
    const csv = rows.map(row => row.map(value => {
      // Prevent spreadsheet formula injection for untrusted server text.
      let text = String(value ?? "");
      if (/^[=+\-@]/.test(text)) text = `'${text}`;
      return `"${text.replace(/"/g, '""')}"`;
    }).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link); link.click(); link.remove();
    URL.revokeObjectURL(url);
  };

  const resetButton = <button type="button" onClick={resetFilters} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"><RotateCcw size={14} />Reset filter</button>;

  return (
    <main className="theme-page theme-text min-h-full">
      <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <section className={`${theme.card} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6`}>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white"><Activity size={23} /></div>
            <div>
              <div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-semibold sm:text-2xl">Log Aktivitas</h1><span className="rounded-full border border-[color-mix(in_srgb,var(--color-primary)_22%,transparent)] px-2.5 py-1 text-[10px] font-semibold text-[var(--color-primary)]">Monitoring</span></div>
              <p className={`mt-1 flex items-center gap-2 text-sm ${theme.muted}`}><Clock size={14} />Pantau aktivitas pengguna yang dicatat oleh sistem SmartSchool.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={loadAuditLogs} disabled={isLoading} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border theme-border px-4 text-sm disabled:opacity-50 sm:flex-none"><RefreshCw size={15} className={isLoading ? "animate-spin" : ""}/>{isLoading ? "Memuat..." : "Refresh"}</button>
            <button type="button" onClick={exportCsv} disabled={!sortedLogs.length} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border theme-border px-4 text-sm disabled:opacity-40 sm:flex-none"><Download size={15}/>Export CSV</button>
          </div>
        </section>

        {errorMessage && <section role="alert" className="rounded-xl border border-red-500/25 bg-red-500/5 p-4">
          <div className="flex items-start gap-3"><AlertCircle className="mt-0.5 shrink-0 text-red-600" size={18}/><div className="min-w-0 flex-1"><p className="font-semibold text-red-600">Gagal memuat audit log</p><p className="mt-1 break-words text-sm theme-text-secondary">{errorMessage}</p><p className="mt-2 text-xs theme-text-muted">Periksa token login, role yang diizinkan BE, URL endpoint, dan log server.</p></div><button onClick={loadAuditLogs} type="button" className="rounded-lg border theme-border px-3 py-1.5 text-sm">Coba lagi</button></div>
        </section>}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Total aktivitas dimuat" value={stats.total} icon={Activity}/>
          <StatCard label="Berhasil" value={stats.success} icon={CheckCircle}/>
          <StatCard label="Gagal" value={stats.failed} icon={XCircle}/>
          <StatCard label="Pengguna tercatat" value={stats.users} icon={Users}/>
          <StatCard label="Modul tercatat" value={stats.modules} icon={Database}/>
        </div>

        <section className={`${theme.card} p-4 sm:p-5`}>
          <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-sm font-semibold"><Filter size={16}/>Filter & pencarian</h2><p className={`mt-1 text-xs ${theme.muted}`}>Pencarian lokal pada data yang berhasil dimuat dari BE.</p></div>{resetButton}</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="relative"><Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.muted}`}/><input aria-label="Cari aktivitas" placeholder="Cari aktivitas..." value={searchQuery} onChange={e => {setSearchQuery(e.target.value);setCurrentPage(1);}} className={`${theme.input} pl-9`}/></div>
            <select aria-label="Filter role" value={selectedRole} onChange={e => {setSelectedRole(e.target.value);setCurrentPage(1);}} className={theme.input}><option value="all">Semua role</option>{roleOptions.map(x => <option key={x} value={x}>{x}</option>)}</select>
            <select aria-label="Filter modul" value={selectedModule} onChange={e => {setSelectedModule(e.target.value);setCurrentPage(1);}} className={theme.input}><option value="all">Semua modul</option>{moduleOptions.map(x => <option key={x} value={x}>{x}</option>)}</select>
            <select aria-label="Filter status" value={selectedStatus} onChange={e => {setSelectedStatus(e.target.value);setCurrentPage(1);}} className={theme.input}><option value="all">Semua status</option><option value="success">Berhasil</option><option value="failed">Gagal</option><option value="unknown">Tidak diketahui</option></select>
            <select aria-label="Filter waktu" value={selectedTime} onChange={e => {setSelectedTime(e.target.value);setCurrentPage(1);}} className={theme.input}><option value="all">Semua waktu</option><option value="today">Hari ini</option><option value="week">7 hari terakhir</option><option value="month">30 hari terakhir</option><option value="custom">Rentang tanggal</option></select>
            {selectedTime === "custom" && <div className="flex gap-2"><input aria-label="Tanggal mulai" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={`${theme.input} min-w-0 px-2`}/><input aria-label="Tanggal akhir" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={`${theme.input} min-w-0 px-2`}/></div>}
          </div>
          <p className={`mt-3 text-xs ${theme.muted}`}>Menampilkan {filteredLogs.length} dari {logs.length} data yang dimuat.</p>
        </section>

        <section className={`${theme.card} overflow-hidden`}>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1000px] border-collapse text-left">
              <thead className="bg-[color-mix(in_srgb,var(--color-text)_4%,transparent)]"><tr className="border-b theme-border text-[10px] uppercase tracking-wider theme-text-muted">
                {[["user","Pengguna"],["role","Role"],["module","Modul"],["action","Aktivitas"],["status","Status"],["timestamp","Waktu"]].map(([field,label]) => <th key={field} className="px-4 py-3"><button type="button" onClick={() => changeSort(field)} className="inline-flex items-center gap-1 font-semibold">{label}{sortIcon(field)}</button></th>)}<th className="px-4 py-3">IP Address</th>
              </tr></thead>
              <tbody className="divide-y theme-border">
                {isLoading ? <tr><td colSpan={7} className="px-6 py-14 text-center"><RefreshCw className="mx-auto animate-spin" size={24}/><p className={`mt-3 text-sm ${theme.muted}`}>Mengambil audit log...</p></td></tr>
                : pageLogs.length === 0 ? <tr><td colSpan={7} className="px-6 py-14 text-center"><Activity className={`mx-auto ${theme.muted}`} size={26}/><p className="mt-3 text-sm font-semibold">{errorMessage ? "Data tidak dapat dimuat" : "Tidak ada aktivitas"}</p><p className={`mt-1 text-xs ${theme.muted}`}>{errorMessage ? "Perbaiki error di atas lalu coba lagi." : "Tidak ada data yang sesuai dengan filter saat ini."}</p></td></tr>
                : pageLogs.map(log => {const Icon = getModuleIcon(log.module);return <tr key={log.id} className="hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)]">
                  <td className="px-4 py-3.5"><p className="text-sm font-medium">{log.user}</p><p className={`mt-1 text-[11px] ${theme.muted}`}>ID: {log.id}</p></td>
                  <td className="px-4 py-3.5 text-sm">{log.role}</td><td className="px-4 py-3.5"><span className="inline-flex items-center gap-2 text-sm"><Icon size={14} className={theme.muted}/>{log.module}</span></td>
                  <td className="px-4 py-3.5 text-sm">{log.action}</td><td className="px-4 py-3.5"><StatusBadge status={log.status}/></td><td className={`px-4 py-3.5 text-sm ${theme.muted}`}>{formatDateTime(log.timestamp)}</td><td className={`px-4 py-3.5 font-mono text-xs ${theme.muted}`}><span className="inline-flex items-center gap-1.5"><Globe size={13}/>{log.ip}</span></td>
                </tr>;})}
              </tbody>
            </table>
          </div>

          <div className="divide-y theme-border lg:hidden">
            {isLoading ? <div className="p-8 text-center"><RefreshCw className="mx-auto animate-spin" size={22}/><p className={`mt-2 text-sm ${theme.muted}`}>Mengambil audit log...</p></div>
            : pageLogs.length === 0 ? <div className="p-8 text-center"><Activity className={`mx-auto ${theme.muted}`} size={24}/><p className="mt-2 text-sm font-semibold">{errorMessage ? "Data tidak dapat dimuat" : "Tidak ada aktivitas"}</p></div>
            : pageLogs.map(log => {const Icon = getModuleIcon(log.module);return <article key={log.id} className="p-4">
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{log.user}</p><p className={`mt-1 text-xs ${theme.muted}`}>{log.role}</p><p className="mt-2 text-sm">{log.action}</p></div><StatusBadge status={log.status}/></div>
              <div className={`mt-3 flex flex-wrap gap-x-3 gap-y-2 text-xs ${theme.muted}`}><span className="inline-flex items-center gap-1"><Icon size={12}/>{log.module}</span><span>{formatDateTime(log.timestamp, true)}</span><span className="font-mono">{log.ip}</span></div>
            </article>;})}
          </div>

          <div className="flex flex-col gap-3 border-t theme-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className={`text-xs ${theme.muted}`}>Menampilkan {sortedLogs.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(currentPage * PAGE_SIZE, sortedLogs.length)} dari {sortedLogs.length} data terfilter</p>
            <div className="flex items-center justify-center gap-1">
              <button type="button" aria-label="Halaman sebelumnya" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => Math.max(1,p-1))} className="rounded-lg border theme-border px-3 py-2 disabled:opacity-40">‹</button>
              {Array.from({length: Math.min(totalPages, 5)}, (_,i) => {
                const page = totalPages <= 5 ? i+1 : Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
                return <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`h-9 min-w-9 rounded-lg px-2 text-sm ${currentPage === page ? "bg-[var(--color-primary)] text-white" : "theme-text-secondary hover:bg-[color-mix(in_srgb,var(--color-text)_5%,transparent)]"}`}>{page}</button>;
              })}
              <button type="button" aria-label="Halaman berikutnya" disabled={currentPage >= totalPages || !sortedLogs.length} onClick={() => setCurrentPage(p => Math.min(totalPages,p+1))} className="rounded-lg border theme-border px-3 py-2 disabled:opacity-40">›</button>
            </div>
          </div>
        </section>

        {meta && <p className={`text-right text-xs ${theme.muted}`}>Respons BE: halaman {meta.page}, limit {meta.limit}, total tercatat {meta.totalData ?? meta.total}.</p>}
        <footer className={`border-t theme-border pt-4 text-center text-xs ${theme.muted}`}>© 2026 SmartSchool • Log Aktivitas</footer>
      </div>
    </main>
  );
}
