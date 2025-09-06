-- AlterTable
ALTER TABLE `WhatsappMessage` ADD COLUMN `templateName` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `WhatsappMessage_templateName_idx` ON `WhatsappMessage`(`templateName`);
