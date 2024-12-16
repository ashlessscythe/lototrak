-- AlterTable
ALTER TABLE "Lock" ADD COLUMN "deleted" BOOLEAN NOT NULL DEFAULT false;

-- Revert previous migration
ALTER TABLE "Event" DROP CONSTRAINT "Event_lockId_fkey",
ADD CONSTRAINT "Event_lockId_fkey" FOREIGN KEY ("lockId") REFERENCES "Lock"("id") ON DELETE RESTRICT;
