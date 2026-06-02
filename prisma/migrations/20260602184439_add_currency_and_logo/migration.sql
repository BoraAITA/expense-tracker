-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('TRY', 'USD', 'EUR');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'TRY',
ADD COLUMN     "logoUrl" TEXT;
