-- CreateEnum
CREATE TYPE "contact_us_type" AS ENUM ('general', 'medical', 'support', 'technical');

-- CreateTable
CREATE TABLE "contact_us" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "message" TEXT NOT NULL,
    "type" "contact_us_type" NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "contact_us_pkey" PRIMARY KEY ("id")
);
