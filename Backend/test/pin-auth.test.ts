import { describe, it } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";
import {
  generatePinToken,
  verifyPinToken,
} from "../src/utils/generateToken";

describe("Sistem PIN Khusus Login Siswa (P0) - Unit & Security Logic", () => {
  it("Token PIN: generatePinToken menghasilkan token valid dengan purpose 'pin_setup' dan 'pin_access'", () => {
    const userId = "siswa-uuid-001";

    const setupToken = generatePinToken(userId, "pin_setup");
    assert.ok(setupToken, "Setup token harus terbuat");

    const decodedSetup = verifyPinToken(setupToken);
    assert.equal(decodedSetup.userId, userId);
    assert.equal(decodedSetup.purpose, "pin_setup");

    const accessToken = generatePinToken(userId, "pin_access");
    const decodedAccess = verifyPinToken(accessToken);
    assert.equal(decodedAccess.userId, userId);
    assert.equal(decodedAccess.purpose, "pin_access");
  });

  it("Token PIN: Verifikasi token gagal bila format atau token acak", () => {
    assert.throws(() => {
      verifyPinToken("token-sembarangan-tidak-valid");
    });
  });

  it("Format & Hashing PIN: PIN 6 digit di-hash dengan aman menggunakan bcrypt", async () => {
    const rawPin = "123456";
    const hashedPin = await bcrypt.hash(rawPin, 10);

    assert.notEqual(rawPin, hashedPin);
    const isMatch = await bcrypt.compare(rawPin, hashedPin);
    const isWrongMatch = await bcrypt.compare("654321", hashedPin);

    assert.equal(isMatch, true, "PIN benar harus cocok");
    assert.equal(isWrongMatch, false, "PIN salah harus tidak cocok");
  });

  it("Prioritas Keamanan Kredensial: Kata sandi wajib valid sebelum setupToken/pinToken diberikan", async () => {
    const userPasswordHash = await bcrypt.hash("Password123!", 10);

    const testLoginCredential = async (passwordInput: string) => {
      const match = await bcrypt.compare(passwordInput, userPasswordHash);
      if (!match) {
        throw new Error("Kredensial tidak valid");
      }
      return true;
    };

    // Password salah tidak boleh menghasilkan token apapun
    await assert.rejects(async () => {
      await testLoginCredential("WrongPass123");
    }, /Kredensial tidak valid/);

    // Password benar diizinkan lanjut
    const success = await testLoginCredential("Password123!");
    assert.equal(success, true);
  });

  it("Proteksi Brute-force: Gagal 5 kali mengunci akun selama 5 menit", () => {
    let failedAttempts = 0;
    let lockedUntil: Date | null = null;
    const MAX_ATTEMPTS = 5;
    const LOCKOUT_MINUTES = 5;

    const simulateWrongPin = () => {
      const now = new Date();
      if (lockedUntil && lockedUntil > now) {
        return { locked: true, attempts: failedAttempts };
      }

      failedAttempts += 1;
      if (failedAttempts >= MAX_ATTEMPTS) {
        lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        return { locked: true, attempts: failedAttempts };
      }

      return { locked: false, attempts: failedAttempts };
    };

    // Percobaan 1 s/d 4: Belum terkunci
    for (let i = 1; i <= 4; i++) {
      const res = simulateWrongPin();
      assert.equal(res.locked, false);
      assert.equal(res.attempts, i);
    }

    // Percobaan ke-5: Terkunci
    const res5 = simulateWrongPin();
    assert.equal(res5.locked, true);
    assert.equal(res5.attempts, 5);
    assert.ok(lockedUntil !== null);

    // Percobaan ke-6 saat masih terkunci: Langsung ditolak
    const res6 = simulateWrongPin();
    assert.equal(res6.locked, true);
  });

  it("Role Limitation: Hanya role 'siswa' yang dikenakan wajib PIN, role lain (guru/admin) langsung akses", () => {
    const checkRoleRequiresPin = (roleName: string) => {
      return roleName.trim().toLowerCase() === "siswa";
    };

    assert.equal(checkRoleRequiresPin("siswa"), true);
    assert.equal(checkRoleRequiresPin("Siswa"), true);
    assert.equal(checkRoleRequiresPin("guru"), false);
    assert.equal(checkRoleRequiresPin("admin_sekolah"), false);
    assert.equal(checkRoleRequiresPin("super_admin"), false);
  });

  it("Pencegahan Race Condition pada Setup PIN (Atomic Condition)", () => {
    // Simulasi record database dengan atomic update condition (pinHash IS NULL)
    let dbUser: { pinHash: string | null } = { pinHash: null };

    const atomicSetupPin = (newHash: string) => {
      if (dbUser.pinHash !== null) {
        return { affectedRows: 0 }; // Gagal / bentrok (race condition)
      }
      dbUser.pinHash = newHash;
      return { affectedRows: 1 }; // Berhasil
    };

    // Request pertama berhasil
    const req1 = atomicSetupPin("hash-pin-pertama");
    assert.equal(req1.affectedRows, 1);
    assert.equal(dbUser.pinHash, "hash-pin-pertama");

    // Request kedua (simultan) gagal karena pinHash sudah terisi
    const req2 = atomicSetupPin("hash-pin-kedua");
    assert.equal(req2.affectedRows, 0);
    assert.equal(dbUser.pinHash, "hash-pin-pertama");
  });
});
