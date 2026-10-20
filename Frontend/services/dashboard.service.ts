
import { apiFetch } from "../lib/api";

export interface DashboardKehadiran {
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
}

export interface DashboardCabang {
  totalSiswa: number;
  totalGuru: number;
  totalKelas: number;
  persentaseHadir: string;
  rekapKehadiran: DashboardKehadiran;
}

export interface DashboardYayasan {
  totalSekolah: number;
  totalSiswa: number;
  totalGuru: number;
  totalKelas: number;
}

export interface DashboardData {
  cabang: DashboardCabang;
  yayasan: DashboardYayasan | null;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}

export async function getDashboardSekolah(): Promise<DashboardResponse> {
  return apiFetch("/api/dashboard", {
    method: "GET",
    cache: "no-store",
  });
}
