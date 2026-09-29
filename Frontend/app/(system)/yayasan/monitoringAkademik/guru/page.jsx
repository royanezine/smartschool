"use client";

import { useState } from "react";
import { Search, Download, GraduationCap, Mail, Phone } from "lucide-react";

const dummyGuru = [
  { id: 1, nama: "Siti Aminah", nip: "198501012010012001", mapel: "Matematika", sekolah: "SMA Harapan 1", status: "Aktif", email: "siti.aminah@smartschool.com", telp: "0812-3456-7890" },
  { id: 2, nama: "Budi Santoso", nip: "198703152011011002", mapel: "Bahasa Indonesia", sekolah: "SMA Harapan 1", status: "Aktif", email: "budi.santoso@smartschool.com", telp: "0813-4567-8901" },
  { id: 3, nama: "Dewi Lestari", nip: "199002202012012003", mapel: "Fisika", sekolah: "SMA Harapan 2", status: "Aktif", email: "dewi.lestari@smartschool.com", telp: "0814-5678-9012" },
  { id: 4, nama: "Ahmad Fauzi", nip: "198812252013011004", mapel: "Bahasa Inggris", sekolah: "SMA Harapan 2", status: "Cuti", email: "ahmad.fauzi@smartschool.com", telp: "0815-6789-0123" },
];

export default function LaporanGuruPage() {
  const [search, setSearch] = useState("");

  const filteredGuru = dummyGuru.filter(
    (g) =>
      g.nama.toLowerCase().includes(search.toLowerCase()) ||
      g.mapel.toLowerCase().includes(search.toLowerCase()) ||
      g.sekolah.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Laporan Guru</h1>
          <p className="text-sm text-gray-500">Data dan status guru di seluruh sekolah</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          <Download className="h-4 w-4" />
          Ekspor Data
        </button>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Total Guru</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{dummyGuru.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Guru Aktif</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">
            {dummyGuru.filter((g) => g.status === "Aktif").length}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Guru Cuti</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">
            {dummyGuru.filter((g) => g.status === "Cuti").length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, mapel, atau sekolah..."
          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-emerald-500 focus:outline-none"
        />
      </div>

      {/* Tabel */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">NIP</th>
              <th className="px-4 py-3">Mata Pelajaran</th>
              <th className="px-4 py-3">Sekolah</th>
              <th className="px-4 py-3">Kontak</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredGuru.map((g) => (
              <tr key={g.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-gray-900">{g.nama}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{g.nip}</td>
                <td className="px-4 py-3 text-gray-600">{g.mapel}</td>
                <td className="px-4 py-3 text-gray-600">{g.sekolah}</td>
                <td className="px-4 py-3 text-gray-600">
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {g.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {g.telp}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      g.status === "Aktif"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {g.status}
                  </span>
                </td>
              </tr>
            ))}
            {filteredGuru.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Tidak ada data guru yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}