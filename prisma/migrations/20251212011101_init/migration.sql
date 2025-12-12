-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "minecraftUsername" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "transactionId" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "currentPeriodEnd" TIMESTAMP(3),
    "id" TEXT NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("transactionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_id_key" ON "Subscription"("id");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
