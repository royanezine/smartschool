import { Router } from "express";
import {
  getPublicArtikel,
  getPublicHalamanBySlug,
} from "../controllers/publik.controller";

const router = Router();

router.get("/:subdomain/artikel", getPublicArtikel);
router.get("/:subdomain/halaman/:slug", getPublicHalamanBySlug);

export default router;
