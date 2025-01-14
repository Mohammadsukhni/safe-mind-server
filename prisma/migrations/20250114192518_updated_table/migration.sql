-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "doctor_languages" ADD VALUE 'french';
ALTER TYPE "doctor_languages" ADD VALUE 'spanish';
ALTER TYPE "doctor_languages" ADD VALUE 'german';
ALTER TYPE "doctor_languages" ADD VALUE 'italian';
ALTER TYPE "doctor_languages" ADD VALUE 'turkish';
