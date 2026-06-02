import { z } from "zod";

export const expenseCreateSchema = z.object({
  title: z.string().min(1, "Başlık gerekli").max(200),
  amount: z.coerce.number().positive("Tutar pozitif olmalı"),
  description: z.string().max(1000).optional().nullable(),
  date: z.coerce.date(),
  categoryId: z.string().cuid().optional().nullable(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export const expenseQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ExpenseCreateInput = z.infer<typeof expenseCreateSchema>;
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateSchema>;
