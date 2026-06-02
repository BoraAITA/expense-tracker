import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "İsim gerekli").max(100),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Geçerli hex renk gerekli")
    .default("#6366f1"),
  icon: z.string().max(50).optional().nullable(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
