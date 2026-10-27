"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getAllPendaftarPpdb,
  getStatistikPpdb,
  isPpdbEndpointMissing,
} from "@/services/ppdb.service";
import { getJalurPpdb } from "@/services/jalurPpdb.service";
import { hitungStatistikPendaftar } from "@/lib/spmb";

/**
 * Memuat seluruh data pendaftar PPDB dari endpoint resmi
 * GET /api/ppdb/pendaftar beserta daftar jalur.
 *
 * Dipakai halaman Dashboard, Seleksi, Laporan, dan Kuota agar
 * rekap dihitung dari sumber yang sama dan tidak ada angka contoh.
 */
export function useSpmbRekap() {
  const [pendaftar, setPendaftar] = useState([]);
  const [jalur, setJalur] = useState([]);
  const [statistik, setStatistik] = useState(null);
  const [jumlahHalaman, setJumlahHalaman] = useState(0);
  const [terpotong, setTerpotong] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [endpointUnavailable, setEndpointUnavailable] =
    useState(false);
  const [dimuatPada, setDimuatPada] = useState(null);

  const aktifRef = useRef(true);

  useEffect(() => {
    aktifRef.current = true;

    return () => {
      aktifRef.current = false;
    };
  }, []);

  const muat = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    setEndpointUnavailable(false);

    try {
      const [hasilPendaftar, hasilJalur, hasilStatistik] =
        await Promise.allSettled([
          getAllPendaftarPpdb(),
          getJalurPpdb(),
          getStatistikPpdb(),
        ]);

      if (!aktifRef.current) {
        return;
      }

      const daftarJalur =
        hasilJalur.status === "fulfilled" &&
        Array.isArray(hasilJalur.value?.data)
          ? hasilJalur.value.data
          : [];

      setJalur(daftarJalur);

      if (hasilPendaftar.status !== "fulfilled") {
        throw hasilPendaftar.reason;
      }

      const result = hasilPendaftar.value;
      const daftar = Array.isArray(result?.data)
        ? result.data
        : [];

      const statsDariEndpoint =
        hasilStatistik.status === "fulfilled" &&
        hasilStatistik.value?.data
          ? hasilStatistik.value.data
          : null;

      setPendaftar(daftar);
      setStatistik(
        hitungStatistikPendaftar(
          daftar,
          statsDariEndpoint || result?.statistik
        )
      );
      setJumlahHalaman(
        Number(result?.jumlahHalaman || 0)
      );
      setTerpotong(Boolean(result?.terpotong));
      setDimuatPada(new Date().toISOString());
    } catch (err) {
      if (!aktifRef.current) {
        return;
      }

      setPendaftar([]);
      setStatistik(null);
      setJumlahHalaman(0);
      setTerpotong(false);
      setDimuatPada(null);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal memuat data pendaftar SPMB."
      );
      setEndpointUnavailable(
        isPpdbEndpointMissing(err)
      );
    } finally {
      if (aktifRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      muat(false);
    });
  }, [muat]);

  return {
    pendaftar,
    jalur,
    statistik,
    jumlahHalaman,
    terpotong,
    loading,
    refreshing,
    error,
    endpointUnavailable,
    dimuatPada,
    muatUlang: muat,
  };
}
