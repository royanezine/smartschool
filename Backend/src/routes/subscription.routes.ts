import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireKepemilikanSekolah } from "../middlewares/langganan.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import {
  createPayment,
  getPendingPayments,
  extendSubscription,
  getAllLanggananSekolah,
} from "../controllers/subscription.controller";
import { cekStatusPembayaranLangganan } from "../controllers/subscriptionStatus.controller";

const router = Router();

router.get(
  "/",
  authenticate,
  requireKepemilikanSekolah,
  requireIzin("langganan.view", "langganan.view_all"),
  getAllLanggananSekolah,
);

router.post(
  "/bayar",
  authenticate,
  requireKepemilikanSekolah,
  requireIzin("manajemen_sekolah.update"),
  createPayment,
);

router.get(
  "/pending",
  authenticate,
  requireKepemilikanSekolah,
  requireIzin("manajemen_sekolah.view"),
  getPendingPayments,
);

router.get(
  "/status/:orderId",
  authenticate,
  requireKepemilikanSekolah,
  requireIzin("manajemen_sekolah.view"),
  cekStatusPembayaranLangganan,
);

router.post(
  "/perpanjang",
  authenticate,
  requireKepemilikanSekolah,
  requireIzin("manajemen_sekolah.update"),
  extendSubscription,
);

export default router;