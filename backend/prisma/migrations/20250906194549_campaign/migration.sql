/*
  Warnings:

  - You are about to drop the column `templateName` on the `WhatsappMessage` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `WhatsappMessage_templateName_idx` ON `WhatsappMessage`;

-- AlterTable
ALTER TABLE `WhatsappMessage` DROP COLUMN `templateName`,
    ADD COLUMN `CampaignName` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `WhatsappMessage_CampaignName_idx` ON `WhatsappMessage`(`CampaignName`);
