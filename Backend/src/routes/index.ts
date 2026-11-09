import { Router } from "express";
import jabatanRoutes from "./jabatan.routes";

const router = Router();

// Registrasi routes jabatan
router.use("/jabatan", jabatanRoutes);

export default router;
export { jabatanRoutes };

