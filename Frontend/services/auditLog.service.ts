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
  success?: boolean;
  message?: string;
  data?: AuditLog[] | {
    data?: AuditLog[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
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
    limit = 100,
    search = "",
  } = params;

  const query = new URLSearchParams();

  query.set("page", String(page));
  query.set("limit", String(limit));

  if (search.trim()) {
    query.set("search", search.trim());
  }

  const response = await apiFetch(
    `/api/audit-log?${query.toString()}`,
    {
      method: "GET",
    }
  );

  return response as AuditLogResponse;
}

const auditLogService = {
  getAuditLogs,
};

export default auditLogService; 