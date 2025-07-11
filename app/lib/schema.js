// app/lib/schema.js
import { z } from 'zod';

export const accountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['CHECKING', 'SAVINGS', 'CREDIT'], {
    required_error: 'Account type is required',
  }),
  balance: z.number({ required_error: "Balance is required" }),
  isDefault: z.boolean().optional(),
});

// Updated transactionSchema based on the suggested code change
export const transactionSchema = z.object({
  amount: z.preprocess((val) => Number(val), z.number()),
  date: z.preprocess(
    (val) => (val instanceof Date ? val : new Date(val)),
    z.date()
  ),
  category: z.string({ required_error: "Category is required" }),
  accountId: z.string({ required_error: "Account is required" }),
  type: z.enum(["EXPENSE", "INCOME"], { required_error: "Type is required" }),
  // ...other fields...
});