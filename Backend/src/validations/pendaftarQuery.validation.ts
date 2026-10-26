import { z } from "zod";
import { paginationQuery } from "../utils/pagination";

export const pendaftarQuerySchema = z.object({
  ...paginationQuery,
  search: z.string().trim().max(200).optional(),
  sekolahId: z.string().uuid().optional(),
  jalurPpdbId: z.string().uuid().optional(),
  gelombangPpdbId: z.string().uuid().optional(),
  status: z.enum(["menunggu", "lulus", "ditolak"]).optional(),
});
