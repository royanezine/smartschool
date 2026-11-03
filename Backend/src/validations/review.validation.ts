import { z } from "zod";
import { paginationQuery } from "../utils/pagination";

export const reviewStatus = z.enum(["menunggu", "tampil", "disembunyikan"]);
const content = { rating: z.number().int().min(1).max(5), komentar: z.string().trim().min(1).max(500) };
export const createReviewSchema = z.object(content).strict();
export const updateReviewSchema = createReviewSchema.partial().refine(v => Object.keys(v).length > 0, "Isi rating atau komentar");
export const adminCreateReviewSchema = z.object({ ...content, penggunaId: z.string().uuid(), status: reviewStatus.default("menunggu") }).strict();
export const adminUpdateReviewSchema = z.object({ ...content, status: reviewStatus, diperbaruiPada: z.string().datetime().optional() }).partial().strict()
  .refine(v => v.rating !== undefined || v.komentar !== undefined || v.status !== undefined, "Isi perubahan review");
export const reviewQuerySchema = z.object({ ...paginationQuery, status: reviewStatus.optional(), rating: z.coerce.number().int().min(1).max(5).optional(), penggunaId: z.string().uuid().optional() });
