import { Router } from "express";
import { handleMidtransWebhook } from "../controllers/webhook.controller";

const router = Router();

// Endpoint ini dipanggil otomatis oleh Midtrans, jangan dipasang auth middleware
router.post("/midtrans", handleMidtransWebhook);

export default router;
