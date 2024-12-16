-- AlterTable
ALTER TABLE "Event" DROP CONSTRAINT "Event_lockId_fkey",
ADD CONSTRAINT "Event_lockId_fkey" FOREIGN KEY ("lockId") REFERENCES "Lock"("id") ON DELETE SET NULL;
