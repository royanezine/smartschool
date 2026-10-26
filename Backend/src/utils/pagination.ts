import { z } from "zod";

export const paginationQuery = {
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(20),
};

export function paginationMeta(page: number, limit: number, total: number) {
  const totalPages = Math.ceil(total / limit);
  return {
    page, limit, total, totalData: total, totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1 && totalPages > 0,
  };
}
