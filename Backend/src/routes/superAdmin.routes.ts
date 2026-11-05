/**
 * Routes: Pengaturan Super Admin Platform
 *
 * Semua endpoint dilindungi oleh:
 *   1. authenticate  – memvalidasi JWT
 *   2. authorizeRoles("super_admin") – hanya super_admin yang boleh akses
 *
 * Base path: /api/super-admin
 *
 * KonfigurasiSistem:
 *   GET    /konfigurasi              – list (filter: ?kategori=INTEGRASI&search=smtp)
 *   GET    /konfigurasi/:kunci       – detail per kunci
 *   PUT    /konfigurasi/:kunci       – upsert (create or update)
 *   DELETE /konfigurasi/:kunci       – hapus
 *
 * TemplateNotifikasi:
 *   GET    /template-notifikasi              – list (paginasi)
 *   GET    /template-notifikasi/:id          – detail
 *   POST   /template-notifikasi              – buat baru
 *   PUT    /template-notifikasi/:id          – update
 *   DELETE /template-notifikasi/:id          – hapus
 *   PATCH  /template-notifikasi/:id/toggle   – aktif/nonaktif
 */

import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { requestLimit } from "../middlewares/requestLimit.middleware";

import {
  listKonfigurasiSistem,
  getKonfigurasiSistemByKunci,
  upsertKonfigurasiSistem,
  deleteKonfigurasiSistem,
} from "../controllers/konfigurasiSistem.controller";

import {
  listTemplateNotifikasi,
  getTemplateNotifikasiById,
  createTemplateNotifikasi,
  updateTemplateNotifikasi,
  deleteTemplateNotifikasi,
  toggleTemplateNotifikasi,
} from "../controllers/templateNotifikasi.controller";

const router = Router();

// Semua route di bawah ini wajib terautentikasi sebagai super_admin
router.use(authenticate, authorizeRoles("super_admin"));
router.use(requestLimit(120, 60 * 1000));
router.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// ── KonfigurasiSistem ────────────────────────────────────────────────────────
router.get("/konfigurasi", listKonfigurasiSistem);
router.get("/konfigurasi/:kunci", getKonfigurasiSistemByKunci);
router.put("/konfigurasi/:kunci", upsertKonfigurasiSistem);
router.delete("/konfigurasi/:kunci", deleteKonfigurasiSistem);

// ── TemplateNotifikasi ───────────────────────────────────────────────────────
router.get("/template-notifikasi", listTemplateNotifikasi);
router.get("/template-notifikasi/:id", getTemplateNotifikasiById);
router.post("/template-notifikasi", createTemplateNotifikasi);
router.put("/template-notifikasi/:id", updateTemplateNotifikasi);
router.delete("/template-notifikasi/:id", deleteTemplateNotifikasi);
router.patch("/template-notifikasi/:id/toggle", toggleTemplateNotifikasi);

export default router;

