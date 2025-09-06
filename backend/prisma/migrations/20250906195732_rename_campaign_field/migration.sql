/*
  Warnings:

  - You are about to drop the column `CampaignName` on the `WhatsappMessage` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `WhatsappMessage_CampaignName_idx` ON `WhatsappMessage`;

-- AlterTable
ALTER TABLE `WhatsappMessage` DROP COLUMN `CampaignName`,
    ADD COLUMN `campaignName` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `WhatsappMessage_campaignName_idx` ON `WhatsappMessage`(`campaignName`);
