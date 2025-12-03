-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "cgpa" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "floorPreference" TEXT,
ADD COLUMN     "isProfileFrozen" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roomTypePreference" TEXT;

-- CreateTable
CREATE TABLE "ProfileEditRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfileEditRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProfileEditRequest" ADD CONSTRAINT "ProfileEditRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
