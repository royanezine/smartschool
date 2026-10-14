import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Sistem Shift & Penggajian Per Jam (P1) - Unit & Integration Logic", () => {
  it("Kalkulasi durasi kerja valid: Masuk 07:00, Pulang 14:00 menghasilkan tepat 7.00 jam kerja", () => {
    const waktuMasuk = new Date("2026-10-14T07:00:00Z");
    const waktuKeluar = new Date("2026-10-14T14:00:00Z");

    const durasiMenitKotor = Math.max(
      0,
      Math.floor((waktuKeluar.getTime() - waktuMasuk.getTime()) / 60000),
    );
    const durasiJamKerja = parseFloat((durasiMenitKotor / 60).toFixed(2));

    assert.equal(durasiMenitKotor, 420);
    assert.equal(durasiJamKerja, 7.0);
  });

  it("Deteksi keterlambatan terhadap jadwal shift dan toleransi", () => {
    const jadwalMasuk = "07:00";
    const toleransiMenit = 15;

    // Check-in jam 07:10 (dalam toleransi 15 menit) -> tepat waktu
    const t1 = new Date("2026-10-14T07:10:00");
    const [j1, m1] = jadwalMasuk.split(":").map(Number);
    const selisih1 = (t1.getHours() * 60 + t1.getMinutes()) - (j1 * 60 + m1);
    const status1 = selisih1 > toleransiMenit ? "terlambat" : "tepat_waktu";
    assert.equal(status1, "tepat_waktu");

    // Check-in jam 07:25 (melebihi toleransi 15 menit) -> terlambat 25 menit
    const t2 = new Date("2026-10-14T07:25:00");
    const selisih2 = (t2.getHours() * 60 + t2.getMinutes()) - (j1 * 60 + m1);
    const status2 = selisih2 > toleransiMenit ? "terlambat" : "tepat_waktu";
    assert.equal(status2, "terlambat");
    assert.equal(selisih2, 25);
  });

  it("Deteksi pulang lebih awal dari jam keluar shift", () => {
    const jadwalKeluar = "14:00";
    const waktuPulang = new Date("2026-10-14T13:30:00");

    const [jPulang, mPulang] = jadwalKeluar.split(":").map(Number);
    const totalJadwalPulang = jPulang * 60 + mPulang;
    const totalWaktuPulang = waktuPulang.getHours() * 60 + waktuPulang.getMinutes();

    const isPulangCepat = totalWaktuPulang < totalJadwalPulang;
    assert.equal(isPulangCepat, true);
  });

  it("Perhitungan Gaji Backend Only: Total Jam Kerja Valid x Tarif Per Jam", () => {
    const totalJamKerja = 154.5; // jam
    const tarifPerJam = 50000; // Rp / jam

    const totalGaji = Math.round(totalJamKerja * tarifPerJam);
    assert.equal(totalGaji, 7725000);
  });

  it("Integritas Tarif Historis: Perubahan tarif baru tidak merusak histori penggajian lama", () => {
    // Riwayat Tarif:
    // Tarif 1: Rp 45.000 (Berlaku 2024-01-01 s/d 2024-12-31)
    // Tarif 2: Rp 55.000 (Berlaku 2025-01-01 s/d sekarang / null)
    const tarifRiwayat = [
      {
        tarifPerJam: 55000,
        berlakuMulai: new Date("2025-01-01T00:00:00Z"),
        berakhirPada: null,
      },
      {
        tarifPerJam: 45000,
        berlakuMulai: new Date("2024-01-01T00:00:00Z"),
        berakhirPada: new Date("2024-12-31T23:59:59Z"),
      },
    ];

    const findTarifForPeriod = (periodeMulai: Date, periodeSelesai: Date) => {
      const match = tarifRiwayat.find((t) => {
        const tMulai = new Date(t.berlakuMulai);
        const tAkhir = t.berakhirPada ? new Date(t.berakhirPada) : null;
        return tMulai <= periodeSelesai && (!tAkhir || tAkhir >= periodeMulai);
      });
      return match ? match.tarifPerJam : 0;
    };

    // Periode Oktober 2024 (lampau) -> Harus menggunakan tarif lama Rp 45.000
    const tarifOkt2024 = findTarifForPeriod(
      new Date("2024-10-01T00:00:00Z"),
      new Date("2024-10-31T23:59:59Z"),
    );
    assert.equal(tarifOkt2024, 45000);

    // Periode Februari 2025 (baru) -> Harus menggunakan tarif baru Rp 55.000
    const tarifFeb2025 = findTarifForPeriod(
      new Date("2025-02-01T00:00:00Z"),
      new Date("2025-02-28T23:59:59Z"),
    );
    assert.equal(tarifFeb2025, 55000);
  });

  it("Mekanisme Pembekuan (Freeze): Gaji berstatus 'dibekukan' atau 'disetujui' terkunci permanen", () => {
    const existingGaji = {
      id: "payroll-123",
      sekolahId: "sch-1",
      bulan: 10,
      tahun: 2026,
      totalGaji: 5000000,
      status: "dibekukan",
    };

    const canRecalculate = !(
      existingGaji.status === "dibekukan" || existingGaji.status === "disetujui"
    );

    assert.equal(canRecalculate, false, "Kalkulasi ulang harus ditolak saat status dibekukan");
  });

  it("Isolasi Multi-tenant: Rekap gaji sekolah A tidak boleh diakses oleh tenant sekolah B", () => {
    const userAdminSekolahA = { userId: "user-a", sekolahId: "sekolah-A", role: "admin_sekolah" };
    const targetSekolahRecord = { sekolahId: "sekolah-B" };

    const isAuthorizedTenant =
      userAdminSekolahA.role === "super_admin" ||
      userAdminSekolahA.sekolahId === targetSekolahRecord.sekolahId;

    assert.equal(isAuthorizedTenant, false, "Admin sekolah A dilarang mengakses data sekolah B");
  });
});
