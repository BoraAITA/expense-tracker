import { z } from "zod";

export const notificationQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  status: z.enum(["SENT", "FAILED", "all"]).optional().default("all"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

export const settingsUpdateSchema = z.object({
  notificationEmail: z.string().email(),
});
