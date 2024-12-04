-- AlterEnum
ALTER TYPE "EventType" ADD VALUE 'SAFETY_CHECK_COMPLETED';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "safetyChecks" JSONB;

-- AlterTable
ALTER TABLE "Lock" ADD COLUMN     "safetyProcedures" JSONB;
