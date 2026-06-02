import { z } from "zod";

const intervalEnum = z.enum(["MONTHLY", "YEARLY", "WEEKLY"]);
const statusEnum = z.enum(["ACTIVE", "PAUSED", "CANCELLED"]);
const currencyEnum = z.enum(["TRY", "USD", "EUR"]);

export const subscriptionCreateSchema = z.object({
  name: z.string().min(1, "İsim gerekli").max(200),
  amount: z.coerce.number().positive("Tutar pozitif olmalı"),
  currency: currencyEnum.default("TRY"),
  logoUrl: z
    .string()
    .max(500)
    .refine((v) => v.startsWith("/uploads/") || v.startsWith("http"), {
      message: "Geçersiz logo URL",
    })
    .optional()
    .nullable(),
  interval: intervalEnum.default("MONTHLY"),
  status: statusEnum.default("ACTIVE"),
  nextDueDate: z.coerce.date(),
  reminderDays: z.coerce.number().int().min(0).max(30).default(3),
});

export const subscriptionUpdateSchema = subscriptionCreateSchema.partial();

export type SubscriptionCreateInput = z.infer<typeof subscriptionCreateSchema>;
export type SubscriptionUpdateInput = z.infer<typeof subscriptionUpdateSchema>;
