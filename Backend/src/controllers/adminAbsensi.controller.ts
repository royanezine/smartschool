import { NextFunction, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { AuthRequest } from "../middlewares/auth.middleware";
import { attendanceInclude, attendanceListFilter, attendanceSchoolFilter } from "../services/absensiQuery.service";
import { AppError } from "../utils/appError";
import { paginationMeta } from "../utils/pagination";
import { resolveSchoolId } from "../utils/schoolScope";
import { successResponse } from "../utils/responseFormatter";
import { absensiListQuerySchema, updateAbsensiSchema } from "../validations/absensi.validation";

export async function getAbsensiSekolah(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const query = absensiListQuerySchema.parse(req.query);
    const sekolahId = resolveSchoolId(req.user, query.sekolahId);
    const where = attendanceListFilter(query, sekolahId);
    const [data, groups] = await Promise.all([
      prisma.absensi.findMany({
        where, skip: (query.page - 1) * query.limit, take: query.limit,
        include: attendanceInclude, orderBy: [{ tanggal: "desc" }, { dibuatPada: "desc" }, { id: "asc" }],
      }),
      prisma.absensi.groupBy({ by: ["status", "statusShift", "terlambatMenit"], where, _count: { _all: true } }),
    ]);
    const statistik = { total: 0, hadir: 0, terlambat: 0, izin: 0, sakit: 0, alpha: 0 };
    for (const group of groups) {
      const count = group._count._all;
      statistik.total += count;
      if (group.status === "hadir" || group.status === "terlambat") {
        statistik.hadir += count;
        if (group.status === "terlambat" || group.statusShift?.includes("terlambat") || (group.terlambatMenit || 0) > 0) {
          statistik.terlambat += count;
        }
      } else if (group.status === "izin" || group.status === "sakit" || group.status === "alpha") {
        statistik[group.status] += count;
      }
    }
    return res.json({
      success: true, message: "Data presensi sekolah berhasil diambil", data,
      meta: paginationMeta(query.page, query.limit, statistik.total), statistik,
    });
  } catch (error) { next(error); }
}

export async function updateAbsensiByAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const body = updateAbsensiSchema.parse(req.body);
    const requestedSchoolId = z.string().uuid().optional().parse(req.query.sekolahId);
    const sekolahId = resolveSchoolId(req.user, requestedSchoolId);
    const where = { ...attendanceSchoolFilter(sekolahId), id };
    const data = await prisma.$transaction(async tx => {
      const existing = await tx.absensi.findFirst({ where });
      if (!existing) throw new AppError("Presensi tidak ditemukan", 404, "RESOURCE_NOT_FOUND");
      const early = existing.statusShift?.includes("pulang_cepat");
      return tx.absensi.update({
        where,
        data: {
          ...(body.status !== undefined && {
            status: body.status === "terlambat" ? "hadir" : body.status,
            statusShift: body.status === "terlambat"
              ? early ? "terlambat_dan_pulang_cepat" : "terlambat"
              : body.status === "hadir" && early ? "pulang_cepat" : "tepat_waktu",
            ...(body.status !== "terlambat" && { terlambatMenit: 0 }),
          }),
          ...(body.keterangan !== undefined && { keterangan: body.keterangan }),
          diperbaruiOleh: req.user!.userId,
        },
        include: attendanceInclude,
      });
    });
    return successResponse(res, "Presensi berhasil diperbarui", data);
  } catch (error) { next(error); }
}
