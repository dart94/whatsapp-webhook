-- AlterTable
ALTER TABLE `WhatsappMessage` ADD COLUMN `read` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `SheetIntegration` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `spreadsheetId` VARCHAR(191) NOT NULL,
    `sheetName` VARCHAR(191) NOT NULL,
    `headers` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
