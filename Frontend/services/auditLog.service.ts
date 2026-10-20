import { apiFetch } from "../lib/api";

export interface AuditLogUser {
  namaLengkap?: string;
  peran?: {
    nama?: string;
  };
}

export interface AuditLog {
  id: string;
  sekolahId?: string;
  penggunaId?: string;
  aksi?: string;
  modul?: string;
  waktu?: string;
  status?: string;
  ipAddress?: string;
  ip?: string;
  pengguna?: AuditLogUser;
}

export interface AuditLogResponse {
  success: boolean;
  message: string;
  data: AuditLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalData: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getAuditLogs(
  params: GetAuditLogsParams = {}
): Promise<AuditLogResponse> {
  const {
    page = 1,
    limit = 10,
    search = "",
  } = params;

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (search.trim()) {
    query.set("search", search.trim());
  }

  return apiFetch(
    `/api/audit-log?${query.toString()}`,
    { method: "GET" }
  ) as Promise<AuditLogResponse>;
}

const auditLogService = { getAuditLogs };

export default auditLogService;