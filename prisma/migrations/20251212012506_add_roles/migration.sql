/*
  Warnings:

  - You are about to drop the column `isPremium` on the `Subscription` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BASIC', 'PREMIUM', 'ADMIN');

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "isPremium";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'BASIC';
