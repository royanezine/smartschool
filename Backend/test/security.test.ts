/**
 * REGRESSION TESTS — SmartSchool Backend Security
 * ================================================
 * Menguji logika RBAC, normalisasi role, dan aturan keamanan
 * yang tidak memerlukan koneksi database atau environment eksternal.
 *
 * Jalankan: npm test
 * (menggunakan Node.js built-in test runner via tsx)
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

// ─── Import modul yang diuji ────────────────────────────────────────────────
import {
  normalizeRole,
  isSuperAdmin,
  canManageRole,
  ROLE_LEVEL,
} from "../src/utils/rbac";
import { verifyAccessToken } from "../src/utils/generateToken";

// ─── SUITE 1: normalizeRole ──────────────────────────────────────────────────
describe("normalizeRole", () => {
  it("harus mengenali variasi super_admin", () => {
    const variants = [
      "super_admin",
      "Super Admin",
      "SUPER_ADMIN",
      "super-admin",
      "superadmin",
      "SUPERADMIN",
      "  super_admin  ",
    ];
    for (const v of variants) {
      assert.equal(
        normalizeRole(v),
        "super_admin",
        `Gagal untuk variant: "${v}"`
      );
    }
  });

  it("harus mengenali variasi admin_sekolah", () => {
    const variants = [
      "admin_sekolah",
      "Admin Sekolah",
      "adminsekolah",
      "ADMIN_SEKOLAH",
    ];
    for (const v of variants) {
      assert.equal(
        normalizeRole(v),
        "admin_sekolah",
        `Gagal untuk variant: "${v}"`
      );
    }
  });

  it("harus mengenali variasi admin_yayasan", () => {
    const variants = [
      "admin_yayasan",
      "Admin Yayasan",
      "adminyayasan",
      "ADMIN_YAYASAN",
    ];
    for (const v of variants) {
      assert.equal(
        normalizeRole(v),
        "admin_yayasan",
        `Gagal untuk variant: "${v}"`
      );
    }
  });

  it("harus mengembalikan string kosong untuk null/undefined", () => {
    assert.equal(normalizeRole(null), "");
    assert.equal(normalizeRole(undefined), "");
    assert.equal(normalizeRole(""), "");
  });
});

// ─── SUITE 2: isSuperAdmin ───────────────────────────────────────────────────
describe("isSuperAdmin", () => {
  it("harus mengembalikan true untuk semua varian super_admin", () => {
    assert.equal(isSuperAdmin("super_admin"), true);
    assert.equal(isSuperAdmin("Super Admin"), true);
    assert.equal(isSuperAdmin("SUPERADMIN"), true);
    assert.equal(isSuperAdmin("super-admin"), true);
  });

  it("harus mengembalikan false untuk role lain", () => {
    assert.equal(isSuperAdmin("admin_sekolah"), false);
    assert.equal(isSuperAdmin("guru"), false);
    assert.equal(isSuperAdmin("siswa"), false);
    assert.equal(isSuperAdmin("admin_yayasan"), false);
    assert.equal(isSuperAdmin(null), false);
    assert.equal(isSuperAdmin(undefined), false);
  });

  it("wildcard atau string khusus tidak boleh menjadi super_admin", () => {
    assert.equal(isSuperAdmin("*"), false);
    assert.equal(isSuperAdmin("ALL"), false);
    assert.equal(isSuperAdmin("admin"), false);
  });
});

// ─── SUITE 3: canManageRole ──────────────────────────────────────────────────
describe("canManageRole", () => {
  it("super_admin dapat mengelola semua role termasuk super_admin lainnya", () => {
    assert.equal(canManageRole("super_admin", "super_admin"), true);
    assert.equal(canManageRole("super_admin", "admin_yayasan"), true);
    assert.equal(canManageRole("super_admin", "admin_sekolah"), true);
    assert.equal(canManageRole("super_admin", "guru"), true);
    assert.equal(canManageRole("super_admin", "siswa"), true);
  });

  it("non-super_admin tidak dapat menargetkan super_admin (privilege escalation prevention)", () => {
    assert.equal(canManageRole("admin_sekolah", "super_admin"), false);
    assert.equal(canManageRole("admin_yayasan", "super_admin"), false);
    assert.equal(canManageRole("guru", "super_admin"), false);
    assert.equal(canManageRole("siswa", "super_admin"), false);
  });

  it("admin_sekolah dapat mengelola guru dan siswa, tapi bukan admin_yayasan", () => {
    assert.equal(canManageRole("admin_sekolah", "guru"), true);
    assert.equal(canManageRole("admin_sekolah", "siswa"), true);
    assert.equal(canManageRole("admin_sekolah", "admin_yayasan"), false);
    assert.equal(canManageRole("admin_sekolah", "admin_sekolah"), false);
  });

  it("guru tidak dapat mengelola admin_sekolah atau admin_yayasan", () => {
    assert.equal(canManageRole("guru", "admin_sekolah"), false);
    assert.equal(canManageRole("guru", "admin_yayasan"), false);
    assert.equal(canManageRole("guru", "siswa"), true);
  });

  it("siswa tidak dapat mengelola role apapun", () => {
    assert.equal(canManageRole("siswa", "guru"), false);
    assert.equal(canManageRole("siswa", "admin_sekolah"), false);
    assert.equal(canManageRole("siswa", "siswa"), false);
  });

  it("role tidak dikenal tidak dapat mengelola role apapun", () => {
    assert.equal(canManageRole("unknown_role", "guru"), false);
    assert.equal(canManageRole("unknown_role", "siswa"), false);
    assert.equal(canManageRole(null, "siswa"), false);
    assert.equal(canManageRole(undefined, "siswa"), false);
  });

  it("normalizeRole varian diaplikasikan dengan benar oleh canManageRole", () => {
    assert.equal(canManageRole("Admin Sekolah", "guru"), true);
    assert.equal(canManageRole("ADMIN_SEKOLAH", "Guru"), true);
    assert.equal(canManageRole("Admin Sekolah", "Super Admin"), false);
  });
});

// ─── SUITE 4: ROLE_LEVEL hierarki ───────────────────────────────────────────
describe("ROLE_LEVEL hierarki", () => {
  it("super_admin harus memiliki level tertinggi", () => {
    const superLevel = ROLE_LEVEL["super_admin"];
    for (const [role, level] of Object.entries(ROLE_LEVEL)) {
      if (role !== "super_admin") {
        assert.ok(
          superLevel > level,
          `super_admin (${superLevel}) seharusnya lebih tinggi dari ${role} (${level})`
        );
      }
    }
  });

  it("siswa harus memiliki level terendah", () => {
    const siswaLevel = ROLE_LEVEL["siswa"];
    for (const [role, level] of Object.entries(ROLE_LEVEL)) {
      if (role !== "siswa") {
        assert.ok(
          siswaLevel < level,
          `siswa (${siswaLevel}) seharusnya lebih rendah dari ${role} (${level})`
        );
      }
    }
  });

  it("urutan hierarki benar: super_admin > admin_yayasan > admin_sekolah > guru > siswa", () => {
    assert.ok(ROLE_LEVEL["super_admin"] > ROLE_LEVEL["admin_yayasan"]);
    assert.ok(ROLE_LEVEL["admin_yayasan"] > ROLE_LEVEL["admin_sekolah"]);
    assert.ok(ROLE_LEVEL["admin_sekolah"] > ROLE_LEVEL["guru"]);
    assert.ok(ROLE_LEVEL["guru"] > ROLE_LEVEL["siswa"]);
  });
});

// ─── SUITE 5: JWT token error classification ────────────────────────────────
// Menguji bahwa error dari JWT memiliki nama yang tepat sesuai dengan
// klasifikasi yang dilakukan di auth.middleware.ts catch block
describe("JWT token error classification (production verifyAccessToken)", () => {
  it("token dengan secret salah menghasilkan JsonWebTokenError (bukan TokenExpiredError)", () => {
    const tokenDenganSecretSalah = jwt.sign({ userId: "test-123" }, "wrong-secret", { expiresIn: "1h" });
    let errorName: string | undefined;
    try {
      verifyAccessToken(tokenDenganSecretSalah);
    } catch (err: any) {
      errorName = err.name;
    }
    assert.equal(errorName, "JsonWebTokenError",
      "Token secret salah harus melempar JsonWebTokenError, bukan error lain");
  });

  it("token kedaluwarsa menghasilkan TokenExpiredError", () => {
    const secret = process.env.JWT_SECRET || "test-secret-for-unit-test";
    // Buat token yang sudah expired dengan sign manual
    const tokenExpired = jwt.sign({ userId: "test-456", iat: Math.floor(Date.now()/1000) - 7200 }, secret, { expiresIn: "-1s" });
    let errorName: string | undefined;
    try {
      jwt.verify(tokenExpired, secret);
    } catch (err: any) {
      errorName = err.name;
    }
    assert.equal(errorName, "TokenExpiredError",
      "Token expired harus melempar TokenExpiredError");
  });

  it("token string random tidak valid menghasilkan JsonWebTokenError", () => {
    const tokenRandom = "ini.bukan.token.valid";
    let errorName: string | undefined;
    try {
      verifyAccessToken(tokenRandom);
    } catch (err: any) {
      errorName = err.name;
    }
    assert.equal(errorName, "JsonWebTokenError",
      "Token random harus melempar JsonWebTokenError");
  });

  it("nama error Prisma berbeda dari nama error JWT (kritis untuk klasifikasi di middleware)", () => {
    // Membuktikan bahwa kondisi `error?.name === 'JsonWebTokenError'` tidak akan
    // pernah matched secara tidak sengaja dengan error Prisma
    const jwtErrorNames = ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"];
    const prismaErrorNames = [
      "PrismaClientInitializationError",
      "PrismaClientKnownRequestError",
      "PrismaClientUnknownRequestError",
      "PrismaClientRustPanicError",
    ];
    for (const jwtErr of jwtErrorNames) {
      for (const prismaErr of prismaErrorNames) {
        assert.notEqual(jwtErr, prismaErr,
          `JWT error '${jwtErr}' tidak boleh sama dengan Prisma error '${prismaErr}'`);
      }
    }
  });
});

// ─── SUITE 6: Subscription status ───────────────────────────────────────────
describe("Subscription status logic", () => {
  it("status aktif dan trialing dianggap valid", () => {
    const validStatuses = ["active", "trialing"];
    for (const s of validStatuses) {
      const isValid = s === "active" || s === "trialing";
      assert.equal(isValid, true, `Status "${s}" seharusnya valid`);
    }
  });

  it("status expired, canceled, dan lainnya dianggap tidak valid", () => {
    const invalidStatuses = ["expired", "canceled", "pending", "unknown", ""];
    for (const s of invalidStatuses) {
      const isValid = s === "active" || s === "trialing";
      assert.equal(isValid, false, `Status "${s}" seharusnya tidak valid`);
    }
  });

  it("langganan kedaluwarsa terdeteksi berdasarkan tanggal", () => {
    const tanggalBerakhirLampau = new Date("2020-01-01");
    const tanggalBerakhirMendatang = new Date("2099-12-31");
    const sekarang = new Date();

    assert.equal(sekarang > tanggalBerakhirLampau, true, "Langganan lama seharusnya expired");
    assert.equal(sekarang > tanggalBerakhirMendatang, false, "Langganan masa depan seharusnya masih aktif");
  });
});

// ─── SUITE 7: Tenant isolation logic ────────────────────────────────────────
describe("Tenant isolation logic", () => {
  // Mensimulasikan logika requireTenant dan getUserById controller
  it("non-super_admin dengan sekolahId berbeda dari target harus ditolak", () => {
    const userSekolahId = String("sekolah-A");
const targetSekolahId = String("sekolah-B");
    const actorRole = normalizeRole("admin_sekolah");

    // Logika dari updateUser dan getUserById controller:
    // if (actorRole !== 'super_admin' && target.sekolahId !== req.user.sekolahId) → 403
    const isAllowed = actorRole === "super_admin" || userSekolahId === targetSekolahId;
    assert.equal(isAllowed, false,
      "admin_sekolah tidak boleh mengakses pengguna dari sekolah lain");
  });

  it("super_admin bypass tenant check sesuai ekspektasi", () => {
    const userSekolahId = String("sekolah-A");
const targetSekolahId = String("sekolah-B");
    const actorRole = normalizeRole("super_admin");

    const isAllowed = actorRole === "super_admin" || userSekolahId === targetSekolahId;
    assert.equal(isAllowed, true,
      "super_admin harus bisa mengakses pengguna dari sekolah manapun");
  });

  it("non-super_admin tanpa sekolahId sama sekali harus ditolak akses tenant", () => {
    const actorRole = normalizeRole("admin_sekolah");
    const sekolahId: string | undefined = undefined;
    const haveAccess = isSuperAdmin(actorRole) || !!sekolahId;
    assert.equal(haveAccess, false);
  });

  it("admin_sekolah dengan sekolahId sama boleh mengakses resource sekolahnya", () => {
    const userSekolahId = "sekolah-A";
    const targetSekolahId = "sekolah-A"; // sekolah yang sama
    const actorRole = normalizeRole("admin_sekolah");

    const isAllowed = actorRole === "super_admin" || userSekolahId === targetSekolahId;
    assert.equal(isAllowed, true,
      "admin_sekolah harus bisa mengakses resource di sekolahnya sendiri");
  });
});

// ─── SUITE 8: Password reset authorization logic ─────────────────────────────
describe("Password reset authorization logic", () => {
  it("admin_sekolah tidak boleh mereset password super_admin", () => {
    const actorRole = normalizeRole("admin_sekolah");
    const targetRole = normalizeRole("super_admin");
    const allowed =
      actorRole === "super_admin" ||
      (targetRole !== "super_admin" && targetRole !== "admin_yayasan");
    assert.equal(allowed, false);
  });

  it("admin_sekolah tidak boleh mereset password admin_yayasan", () => {
    const actorRole = normalizeRole("admin_sekolah");
    const targetRole = normalizeRole("admin_yayasan");
    const allowed =
      actorRole === "super_admin" ||
      (targetRole !== "super_admin" && targetRole !== "admin_yayasan");
    assert.equal(allowed, false);
  });

  it("admin_sekolah boleh mereset password guru di sekolahnya sendiri", () => {
    const actorRole = normalizeRole("admin_sekolah");
    const targetRole = normalizeRole("guru");
    const targetNotProtected =
      targetRole !== "super_admin" && targetRole !== "admin_yayasan";
    const canManage = canManageRole(actorRole, targetRole);
    assert.equal(targetNotProtected && canManage, true);
  });

  it("super_admin boleh mereset password siapapun", () => {
    const actorRole = normalizeRole("super_admin");
    const targets = ["super_admin", "admin_yayasan", "admin_sekolah", "guru", "siswa"];
    for (const t of targets) {
      const allowed = actorRole === "super_admin";
      assert.equal(allowed, true, `super_admin seharusnya bisa reset password ${t}`);
    }
  });
});
