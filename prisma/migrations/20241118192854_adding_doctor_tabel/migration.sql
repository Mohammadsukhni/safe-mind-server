/*
  Warnings:

  - You are about to drop the `admin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "admin" DROP CONSTRAINT "admin_account_id_fkey";

-- DropTable
DROP TABLE "admin";

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("account_id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" SERIAL NOT NULL,
    "account_id" INTEGER NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("account_id")
);

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
