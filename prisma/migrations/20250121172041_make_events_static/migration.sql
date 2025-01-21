/*
  Warnings:

  - Added the required column `lockName` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lockStatus` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Made the column `location` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_lockId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "lockName" TEXT NOT NULL,
ADD COLUMN     "lockStatus" "Status" NOT NULL,
ALTER COLUMN "location" SET NOT NULL;
