-- AlterTable
ALTER TABLE `WhatsappMessage` ADD COLUMN `fromPhone` VARCHAR(191) NULL,
    ADD COLUMN `groupIntegrationId` INTEGER NULL,
    ADD COLUMN `sentByUserId` INTEGER NULL,
    ADD COLUMN `toPhone` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `WhatsappMessage_sentByUserId_idx` ON `WhatsappMessage`(`sentByUserId`);

-- CreateIndex
CREATE INDEX `WhatsappMessage_groupIntegrationId_idx` ON `WhatsappMessage`(`groupIntegrationId`);

-- CreateIndex
CREATE INDEX `WhatsappMessage_fromPhone_idx` ON `WhatsappMessage`(`fromPhone`);

-- CreateIndex
CREATE INDEX `WhatsappMessage_toPhone_idx` ON `WhatsappMessage`(`toPhone`);

-- CreateIndex
CREATE INDEX `WhatsappMessage_direction_idx` ON `WhatsappMessage`(`direction`);

-- CreateIndex
CREATE INDEX `WhatsappMessage_wa_id_idx` ON `WhatsappMessage`(`wa_id`);

-- CreateIndex
CREATE INDEX `WhatsappMessage_message_id_idx` ON `WhatsappMessage`(`message_id`);

-- CreateIndex
CREATE INDEX `WhatsappMessage_createdAt_idx` ON `WhatsappMessage`(`createdAt`);

-- AddForeignKey
ALTER TABLE `WhatsappMessage` ADD CONSTRAINT `WhatsappMessage_sentByUserId_fkey` FOREIGN KEY (`sentByUserId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WhatsappMessage` ADD CONSTRAINT `WhatsappMessage_groupIntegrationId_fkey` FOREIGN KEY (`groupIntegrationId`) REFERENCES `GroupIntegration`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
