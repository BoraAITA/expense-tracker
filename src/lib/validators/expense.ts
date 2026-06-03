import { z } from "zod";

const currencyEnum = z.enum(["TRY", "USD", "EUR"]);

export const expenseCreateSchema = z.object({
  title: z.string().min(1, "Başlık gerekli").max(200),
  amount: z.coerce.number().positive("Tutar pozitif olmalı"),
  currency: currencyEnum.default("TRY"),
  description: z.string().max(1000).optional().nullable(),
  date: z.coerce.date(),
  categoryId: z.string().cuid().optional().nullable(),
  installmentTotal: z.coerce.number().int().min(2).max(60).optional().nullable(),
  installmentCurrent: z.coerce.number().int().min(1).max(60).optional().nullable(),
}).refine(
  (data) => {
    const hasTotal = data.installmentTotal != null;
    const hasCurrent = data.installmentCurrent != null;
    if (hasTotal !== hasCurrent) return false;
    if (hasTotal && hasCurrent && data.installmentCurrent! > data.installmentTotal!) return false;
    return true;
  },
  { message: "Taksit bilgileri tutarsız" }
);

export const expenseUpdateSchema = z.object({
  title: z.string().min(1, "Başlık gerekli").max(200).optional(),
  amount: z.coerce.number().positive("Tutar pozitif olmalı").optional(),
  currency: currencyEnum.optional(),
  description: z.string().max(1000).optional().nullable(),
  date: z.coerce.date().optional(),
  categoryId: z.string().cuid().optional().nullable(),
  installmentTotal: z.coerce.number().int().min(2).max(60).optional().nullable(),
  installmentCurrent: z.coerce.number().int().min(1).max(60).optional().nullable(),
}).refine(
  (data) => {
    const hasTotal = data.installmentTotal != null;
    const hasCurrent = data.installmentCurrent != null;
    if (hasTotal !== hasCurrent) return false;
    if (hasTotal && hasCurrent && data.installmentCurrent! > data.installmentTotal!) return false;
    return true;
  },
  { message: "Taksit bilgileri tutarsız" }
);

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
