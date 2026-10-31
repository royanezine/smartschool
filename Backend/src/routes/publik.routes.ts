import { Router } from "express";
import { publicPpdbOptions, publicPpdbAnnouncements, publicPpdbLookup } from "../controllers/publicPpdb.controller";
import { requestLimit } from "../middlewares/requestLimit.middleware";
import {
  getPublicArtikel,
  getPublicHalamanBySlug,
  getPublicProfil,
  getPublicTema,
  getHalamanPublikBySubdomain,
  getKonfigurasiPublikBySubdomain
} from "../controllers/publik.controller";

const router = Router();
router.get("/:subdomain/ppdb", publicPpdbOptions);
router.get("/:subdomain/ppdb/pengumuman", publicPpdbAnnouncements);
router.post("/:subdomain/ppdb/cek-pendaftaran", requestLimit(10), publicPpdbLookup);

router.get("/:subdomain/profil", getPublicProfil);
router.get("/:subdomain/tema", getPublicTema);
router.get("/:subdomain/artikel", getPublicArtikel);
router.get("/:subdomain/halaman/:slug", getPublicHalamanBySlug);
router.get("/:subdomain/halaman", getHalamanPublikBySubdomain);
router.get("/:subdomain/konfigurasi", getKonfigurasiPublikBySubdomain);

export default router;
