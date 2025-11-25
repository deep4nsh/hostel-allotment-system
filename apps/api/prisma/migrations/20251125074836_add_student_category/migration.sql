-- CreateEnum
CREATE TYPE "Category" AS ENUM ('DELHI', 'OUTSIDE_DELHI', 'PH', 'NRI');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "category" "Category" NOT NULL DEFAULT 'DELHI';
