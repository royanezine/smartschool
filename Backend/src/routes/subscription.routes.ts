import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant } from "../middlewares/tenant.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  createPayment,
  getPendingPayments,
  extendSubscription,
  getAllLanggananSekolah,
} from "../controllers/subscription.controller";

const router = Router();

router.get(
  "/",
  authenticate,
  requireIzin("langganan.view_all"),
  getAllLanggananSekolah,
);

router.post(
  "/bayar",
  authenticate,
  requireTenant,
  requireIzin("manajemen_sekolah.update"),
  createPayment,
);

router.get(
  "/pending",
  authenticate,
  requireTenant,
  requireIzin("manajemen_sekolah.view"),
  getPendingPayments,
);

router.post(
  "/perpanjang",
  authenticate,
  requireTenant,
  requireIzin("manajemen_sekolah.update"),
  extendSubscription,
);

export default router;
