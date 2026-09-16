import { z } from "zod";

export const createPaymentSchema = z.object({
  paketId: z.string().uuid("ID Paket tidak valid"),
  siklusPenagihan: z.enum(["monthly", "annual"], {
    error: (issue) =>
      issue.input === undefined
        ? "Siklus penagihan wajib diisi"
        : "Siklus penagihan harus 'monthly' atau 'annual'",
  }),
});

export const extendSubscriptionSchema = z.object({
  paketId: z.string().uuid("ID Paket tidak valid"),

  siklusPenagihan: z.enum(["monthly", "annual"], {
    error: (issue) =>
      issue.input === undefined
        ? "Siklus penagihan wajib diisi"
        : "Siklus penagihan harus 'monthly' atau 'annual'",
  }),
})