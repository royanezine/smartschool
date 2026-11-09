import "./initOpenApi";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import swaggerUi from "swagger-ui-express";
import {
  loginSchema,
  registerSchema,
  verifySchema,
  setupPinSchema,
  verifyPinSchema,
} from "../validations/auth.validation";
import {
  createPelanggaranSiswaSchema,
  updatePelanggaranSiswaSchema,
  ajukanSesiKonselingSchema,
  createSesiKonselingSchema,
  createKategoriPelanggaranSchema,
} from "../validations/bk.validation";

export const registry = new OpenAPIRegistry();

// Registrasi Security Scheme Bearer Token
registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "Masukkan JWT Access Token dengan format: Bearer <token>",
});

// Registrasi Schema Auth
const LoginModel = registry.register("LoginRequest", loginSchema);
const RegisterModel = registry.register("RegisterRequest", registerSchema);
const VerifyModel = registry.register("VerifyRequest", verifySchema);
const SetupPinModel = registry.register("SetupPinRequest", setupPinSchema);
const VerifyPinModel = registry.register("VerifyPinRequest", verifyPinSchema);

// Registrasi Schema BK
const PelanggaranModel = registry.register("CreatePelanggaranRequest", createPelanggaranSiswaSchema);
const UpdatePelanggaranModel = registry.register("UpdatePelanggaranRequest", updatePelanggaranSiswaSchema);
const AjukanKonselingModel = registry.register("AjukanKonselingRequest", ajukanSesiKonselingSchema);
const CreateKonselingModel = registry.register("CreateKonselingRequest", createSesiKonselingSchema);
const KategoriPelanggaranModel = registry.register("CreateKategoriPelanggaranRequest", createKategoriPelanggaranSchema);

// Registrasi Endpoint Auth
registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  summary: "Registrasi Pengguna Baru",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: RegisterModel } },
    },
  },
  responses: {
    200: { description: "Registrasi berhasil, OTP dikirim ke email" },
    400: { description: "Data tidak valid atau email/username sudah dipakai" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/verify-register",
  summary: "Verifikasi Kode OTP Pendaftaran",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: VerifyModel } },
    },
  },
  responses: {
    200: { description: "Verifikasi berhasil dan langsung login" },
    400: { description: "Kode OTP salah atau kedaluwarsa" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  summary: "Login Pengguna (Email / Username)",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: LoginModel } },
    },
  },
  responses: {
    200: { description: "Login berhasil, mengembalikan accessToken & refreshToken" },
    401: { description: "Kredensial tidak valid atau akun dinonaktifkan" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/refresh",
  summary: "Refresh Access Token Baru",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            refreshToken: z.string().describe("Refresh Token JWT"),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: "Token berhasil diperbarui" },
    401: { description: "Refresh token tidak valid atau kedaluwarsa" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/pin/setup",
  summary: "Setup 6 Digit PIN Siswa",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: SetupPinModel } },
    },
  },
  responses: {
    200: { description: "Setup PIN berhasil" },
    400: { description: "Format PIN salah atau token setup kedaluwarsa" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/pin/verify",
  summary: "Verifikasi 6 Digit PIN Siswa",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: VerifyPinModel } },
    },
  },
  responses: {
    200: { description: "PIN valid, mengembalikan token akses penuh" },
    401: { description: "PIN salah atau terkunci" },
  },
});

// Registrasi Endpoint BK (Bimbingan Konseling)
registry.registerPath({
  method: "get",
  path: "/api/bk/pelanggaran",
  summary: "Daftar Pelanggaran Siswa (dengan pagination & filter)",
  tags: ["Bimbingan Konseling"],
  security: [{ BearerAuth: [] }],
  parameters: [
    { name: "page", in: "query", schema: { type: "integer", default: 1 } },
    { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
    { name: "kategoriId", in: "query", schema: { type: "string" } },
    { name: "tanggalMulai", in: "query", schema: { type: "string" } },
    { name: "tanggalSelesai", in: "query", schema: { type: "string" } },
    { name: "status", in: "query", schema: { type: "string" } },
    { name: "search", in: "query", schema: { type: "string" } },
  ],
  responses: {
    200: { description: "Berhasil mengambil data pelanggaran siswa" },
    401: { description: "Unauthorized" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/bk/pelanggaran/export/excel",
  summary: "Export Data Pelanggaran Siswa ke Excel (.xlsx)",
  tags: ["Bimbingan Konseling"],
  security: [{ BearerAuth: [] }],
  parameters: [
    { name: "kategoriId", in: "query", schema: { type: "string" } },
    { name: "tanggalMulai", in: "query", schema: { type: "string" } },
    { name: "tanggalSelesai", in: "query", schema: { type: "string" } },
    { name: "status", in: "query", schema: { type: "string" } },
    { name: "search", in: "query", schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "File Excel spreadsheet",
      content: {
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
          schema: { type: "string", format: "binary" },
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/bk/pelanggaran/export/pdf",
  summary: "Export Data Pelanggaran Siswa ke PDF (.pdf)",
  tags: ["Bimbingan Konseling"],
  security: [{ BearerAuth: [] }],
  parameters: [
    { name: "kategoriId", in: "query", schema: { type: "string" } },
    { name: "tanggalMulai", in: "query", schema: { type: "string" } },
    { name: "tanggalSelesai", in: "query", schema: { type: "string" } },
    { name: "status", in: "query", schema: { type: "string" } },
    { name: "search", in: "query", schema: { type: "string" } },
  ],
  responses: {
    200: {
      description: "File dokumen PDF",
      content: {
        "application/pdf": {
          schema: { type: "string", format: "binary" },
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/bk/pelanggaran",
  summary: "Catat Pelanggaran Siswa Baru",
  tags: ["Bimbingan Konseling"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: PelanggaranModel } },
    },
  },
  responses: {
    201: { description: "Pelanggaran siswa berhasil dicatat" },
    400: { description: "Validasi gagal" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/bk/konseling/ajukan",
  summary: "Pengajuan Sesi Konseling oleh Siswa",
  tags: ["Bimbingan Konseling"],
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: AjukanKonselingModel } },
    },
  },
  responses: {
    201: { description: "Pengajuan sesi konseling berhasil dikirim" },
    400: { description: "Jadwal bertabrakan atau format tidak valid" },
  },
});

export const generateOpenApiSpec = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "SmartSchool API Documentation",
      version: "1.0.0",
      description:
        "Dokumentasi Resmi RESTful API SmartSchool SaaS Multi-Tenant. Dikonversi otomatis dari skema validasi Zod menggunakan OpenAPI 3.0.",
      contact: {
        name: "Tim Backend SmartSchool",
        email: "support@smartschool.id",
      },
    },
    servers: [
      {
        url: "/",
        description: "Default API Host",
      },
    ],
  });
};

export const swaggerSpec = generateOpenApiSpec();
export { swaggerUi };

