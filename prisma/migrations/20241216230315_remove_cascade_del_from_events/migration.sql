-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_lockId_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "lockId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_lockId_fkey" FOREIGN KEY ("lockId") REFERENCES "Lock"("id") ON DELETE SET NULL ON UPDATE CASCADE;
