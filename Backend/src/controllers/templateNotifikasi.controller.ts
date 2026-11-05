/**
 * Controller: TemplateNotifikasi (Pengaturan Super Admin Platform)
 *
 * Endpoint:
 *   GET    /api/super-admin/template-notifikasi          – list (paginasi)
 *   GET    /api/super-admin/template-notifikasi/:id      – detail
 *   POST   /api/super-admin/template-notifikasi          – buat baru
 *   PUT    /api/super-admin/template-notifikasi/:id      – update
 *   DELETE /api/super-admin/template-notifikasi/:id      – hapus
 *   PATCH  /api/super-admin/template-notifikasi/:id/toggle – aktif/nonaktif
 */

import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { successResponse, paginatedResponse } from "../utils/responseFormatter";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  createTemplateNotifikasiSchema,
  updateTemplateNotifikasiSchema,
  listTemplateNotifikasiQuerySchema,
} from "../validations/templateNotifikasi.validation";

// ─── GET List (dengan paginasi) ───────────────────────────────────────────────

export const listTemplateNotifikasi = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { kanal, eventTarget, isActive, search, page, limit } =
      listTemplateNotifikasiQuerySchema.parse(req.query);

    const where: Prisma.TemplateNotifikasiWhereInput = {};
    if (kanal) where.kanal = kanal;
    if (eventTarget)
      where.eventTarget = { contains: eventTarget, mode: "insensitive" };
    if (isActive !== undefined) where.isActive = isActive;
    if (search) {
      where.OR = [
        { eventTarget: { contains: search, mode: "insensitive" } },
        { subjek: { contains: search, mode: "insensitive" } },
        { isiTemplate: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      prisma.templateNotifikasi.count({ where }),
      prisma.templateNotifikasi.findMany({
        where,
        orderBy: [{ eventTarget: "asc" }, { kanal: "asc" }],
        skip,
        take: limit,
      }),
    ]);

    return paginatedResponse(
      res,
      "Berhasil mengambil daftar template notifikasi",
      data,
      page,
      limit,
      total,
    );
  } catch (error) {
    next(error);
  }
};

// ─── GET Detail ───────────────────────────────────────────────────────────────

export const getTemplateNotifikasiById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = z.string().uuid("ID tidak valid").parse(req.params.id);

    const template = await prisma.templateNotifikasi.findUnique({
      where: { id },
    });
    if (!template) throw new AppError("Template notifikasi tidak ditemukan", 404);

    return successResponse(res, "Berhasil mengambil template notifikasi", template);
  } catch (error) {
    next(error);
  }
};

// ─── POST Create ──────────────────────────────────────────────────────────────

export const createTemplateNotifikasi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const parsed = createTemplateNotifikasiSchema.parse(req.body);

    // Pastikan kombinasi eventTarget + kanal unik
    const existing = await prisma.templateNotifikasi.findUnique({
      where: {
        eventTarget_kanal: {
          eventTarget: parsed.eventTarget,
          kanal: parsed.kanal,
        },
      },
    });
    if (existing) {
      throw new AppError(
        `Template untuk event "${parsed.eventTarget}" via kanal "${parsed.kanal}" sudah ada`,
        409,
      );
    }

    const template = await prisma.templateNotifikasi.create({
      data: {
        eventTarget: parsed.eventTarget,
        kanal: parsed.kanal,
        subjek: parsed.subjek ?? null,
        isiTemplate: parsed.isiTemplate,
        variabel: parsed.variabel ?? Prisma.DbNull,
        isActive: parsed.isActive ?? true,
        dibuatOleh: userId,
        diperbaruiOleh: userId,
      },
    });

    return successResponse(
      res,
      "Template notifikasi berhasil dibuat",
      template,
      201,
    );
  } catch (error) {
    next(error);
  }
};

// ─── PUT Update ───────────────────────────────────────────────────────────────

export const updateTemplateNotifikasi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const id = z.string().uuid("ID tidak valid").parse(req.params.id);
    const parsed = updateTemplateNotifikasiSchema.parse(req.body);

    const existing = await prisma.templateNotifikasi.findUnique({
      where: { id },
    });
    if (!existing) throw new AppError("Template notifikasi tidak ditemukan", 404);

    const updated = await prisma.templateNotifikasi.update({
      where: { id },
      data: {
        ...(parsed.subjek !== undefined && { subjek: parsed.subjek }),
        ...(parsed.isiTemplate !== undefined && {
          isiTemplate: parsed.isiTemplate,
        }),
        ...(parsed.variabel !== undefined && {
          variabel: parsed.variabel ?? Prisma.DbNull,
        }),
        ...(parsed.isActive !== undefined && { isActive: parsed.isActive }),
        diperbaruiOleh: userId,
      },
    });

    return successResponse(res, "Template notifikasi diperbarui", updated);
  } catch (error) {
    next(error);
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

export const deleteTemplateNotifikasi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = z.string().uuid("ID tidak valid").parse(req.params.id);

    const existing = await prisma.templateNotifikasi.findUnique({
      where: { id },
    });
    if (!existing) throw new AppError("Template notifikasi tidak ditemukan", 404);

    await prisma.templateNotifikasi.delete({ where: { id } });

    return successResponse(res, "Template notifikasi berhasil dihapus", null);
  } catch (error) {
    next(error);
  }
};

// ─── PATCH Toggle isActive ────────────────────────────────────────────────────

export const toggleTemplateNotifikasi = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.userId;
    const id = z.string().uuid("ID tidak valid").parse(req.params.id);

    const existing = await prisma.templateNotifikasi.findUnique({
      where: { id },
    });
    if (!existing) throw new AppError("Template notifikasi tidak ditemukan", 404);

    const [updated] = await prisma.$queryRaw<Prisma.TemplateNotifikasiGetPayload<{}>[]>`
      UPDATE template_notifikasi SET is_active = NOT is_active,
        diperbarui_pada = CURRENT_TIMESTAMP, diperbarui_oleh = ${userId}
      WHERE id = ${id}
      RETURNING id, event_target AS "eventTarget", kanal, subjek, isi_template AS "isiTemplate",
        variabel, is_active AS "isActive", dibuat_pada AS "dibuatPada", diperbarui_pada AS "diperbaruiPada",
        dibuat_oleh AS "dibuatOleh", diperbarui_oleh AS "diperbaruiOleh"
    `;
    if (!updated) throw new AppError("Template notifikasi tidak ditemukan",404);

    return successResponse(
      res,
      `Template notifikasi ${updated.isActive ? "diaktifkan" : "dinonaktifkan"}`,
      updated,
    );
  } catch (error) {
    next(error);
  }
};

