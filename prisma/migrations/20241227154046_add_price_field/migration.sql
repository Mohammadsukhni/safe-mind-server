/*
  Warnings:

  - Added the required column `price` to the `Appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "price" TEXT NOT NULL;
