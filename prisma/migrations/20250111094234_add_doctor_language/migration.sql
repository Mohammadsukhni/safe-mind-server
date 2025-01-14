/*
  Warnings:

  - The `languages` column on the `doctor_profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[id]` on the table `doctor_profile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "doctor_languages" AS ENUM ('english', 'arabic');

-- AlterTable
ALTER TABLE "doctor_profile" DROP COLUMN "languages",
ADD COLUMN     "languages" "doctor_languages";

-- CreateIndex
CREATE UNIQUE INDEX "doctor_profile_id_key" ON "doctor_profile"("id");
