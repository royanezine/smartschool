import { Router } from "express";
import {
  getPublicArtikel,
  getPublicHalamanBySlug,
  getPublicProfil,
  getPublicTema, getHalamanPublikBySubdomain
} from "../controllers/publik.controller";

const router = Router();

router.get("/:subdomain/profil", getPublicProfil);
router.get("/:subdomain/tema", getPublicTema);
router.get("/:subdomain/artikel", getPublicArtikel);
router.get("/:subdomain/halaman/:slug", getPublicHalamanBySlug);
router.get("/:subdomain/halaman", getHalamanPublikBySubdomain);

export default router;
