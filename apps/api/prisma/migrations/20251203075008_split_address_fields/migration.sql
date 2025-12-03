/*
  Warnings:

  - You are about to drop the column `address` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "address",
ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT DEFAULT 'India',
ADD COLUMN     "pincode" TEXT,
ADD COLUMN     "state" TEXT;
