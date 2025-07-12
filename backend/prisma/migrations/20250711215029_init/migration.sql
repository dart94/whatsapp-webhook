-- CreateTable
CREATE TABLE `WhatsappMessage` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `wa_id` VARCHAR(191) NOT NULL,
    `message_id` VARCHAR(191) NOT NULL,
    `direction` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NULL,
    `body_text` VARCHAR(191) NULL,
    `context_message_id` VARCHAR(191) NULL,
    `timestamp` BIGINT NULL,
    `raw_json` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
