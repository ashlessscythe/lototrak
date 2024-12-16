/*
  Warnings:

  - Made the column `lockId` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_lockId_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "lockId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_lockId_fkey" FOREIGN KEY ("lockId") REFERENCES "Lock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
