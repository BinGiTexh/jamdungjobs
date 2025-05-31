-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "passwordHash" TEXT;
