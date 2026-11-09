import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";

export const catatAuditLog = async (
  req: AuthRequest,
  aksi: string,
  modul: string,
  entitasId: string,
  dataLama?: any,
  dataBaru?: any
) => {
  try {
    if (!req.user || !req.user.userId) return;

    await prisma.auditLog.create({
      data: {
        penggunaId: req.user.userId,
        sekolahId: req.user.sekolahId || null,
        aksi,
        modul,
        entitasId,
        dataLama: dataLama ? JSON.parse(JSON.stringify(dataLama)) : undefined,
        dataBaru: dataBaru ? JSON.parse(JSON.stringify(dataBaru)) : undefined,
        ipAddress: req.ip || null,
        userAgent: req.headers["user-agent"] || null,
      },
    });
  } catch (error) {
    console.error("Gagal mencatat audit log:", error);
  }
};