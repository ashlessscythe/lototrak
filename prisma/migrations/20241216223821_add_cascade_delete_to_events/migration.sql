-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_lockId_fkey";

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_lockId_fkey" FOREIGN KEY ("lockId") REFERENCES "Lock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
