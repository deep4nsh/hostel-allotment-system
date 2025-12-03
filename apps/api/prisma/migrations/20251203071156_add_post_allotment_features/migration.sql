-- AlterTable
ALTER TABLE "Allotment" ADD COLUMN     "isPossessed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "possessionDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "RoomChangeRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "currentRoomId" TEXT NOT NULL,
    "preferredHostelId" TEXT,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomSurrenderRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "allotmentId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "clearanceUrl" TEXT,
    "adminComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomSurrenderRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HostelSwapRequest" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "currentHostelId" TEXT NOT NULL,
    "targetHostelId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminComment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HostelSwapRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoomChangeRequest" ADD CONSTRAINT "RoomChangeRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomSurrenderRequest" ADD CONSTRAINT "RoomSurrenderRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HostelSwapRequest" ADD CONSTRAINT "HostelSwapRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
