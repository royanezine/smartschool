import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { requireTenant, requireSubscription } from "../middlewares/tenant.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";
import { requireIzin } from "../middlewares/izin.middleware";
import { jurusanResource, asesmenMinatResource, pengumumanResource } from "../controllers/qaResources.controller";

export const jurusanRoutes = Router();
jurusanRoutes.use(authenticate, requireTenant, requireSubscription, authorizeRoles("admin_sekolah", "guru", "siswa"));
jurusanRoutes.get("/", requireIzin("akademik.view"), jurusanResource);
jurusanRoutes.get("/:id", requireIzin("akademik.view"), jurusanResource);
jurusanRoutes.post("/", authorizeRoles("admin_sekolah"), requireIzin("akademik.create"), jurusanResource);
jurusanRoutes.put("/:id", authorizeRoles("admin_sekolah"), requireIzin("akademik.update"), jurusanResource);
jurusanRoutes.delete("/:id", authorizeRoles("admin_sekolah"), requireIzin("akademik.delete"), jurusanResource);

export const asesmenMinatRoutes = Router();
asesmenMinatRoutes.use(authenticate, requireTenant, requireSubscription, authorizeRoles("admin_sekolah", "guru", "siswa"));
asesmenMinatRoutes.get("/", asesmenMinatResource);
asesmenMinatRoutes.get("/:id", asesmenMinatResource);
asesmenMinatRoutes.post("/", authorizeRoles("admin_sekolah", "guru"), asesmenMinatResource);
asesmenMinatRoutes.put("/:id", authorizeRoles("admin_sekolah", "guru"), asesmenMinatResource);
asesmenMinatRoutes.delete("/:id", authorizeRoles("admin_sekolah", "guru"), asesmenMinatResource);

export const pengumumanRoutes = Router();
pengumumanRoutes.use(authenticate, requireTenant, requireSubscription);
pengumumanRoutes.get("/", requireIzin("ppdb.view"), pengumumanResource);
pengumumanRoutes.get("/:id", requireIzin("ppdb.view"), pengumumanResource);
pengumumanRoutes.post("/", requireIzin("ppdb.create"), pengumumanResource);
pengumumanRoutes.put("/:id", requireIzin("ppdb.update"), pengumumanResource);
pengumumanRoutes.delete("/:id", requireIzin("ppdb.delete"), pengumumanResource);
