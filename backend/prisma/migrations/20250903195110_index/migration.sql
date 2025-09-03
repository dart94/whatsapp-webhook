-- CreateIndex
CREATE INDEX `WhatsappMessage_status_idx` ON `WhatsappMessage`(`status`);

-- CreateIndex
CREATE INDEX `WhatsappMessage_sentByUserId_createdAt_idx` ON `WhatsappMessage`(`sentByUserId`, `createdAt`);

-- CreateIndex
CREATE INDEX `WhatsappMessage_groupIntegrationId_createdAt_idx` ON `WhatsappMessage`(`groupIntegrationId`, `createdAt`);
