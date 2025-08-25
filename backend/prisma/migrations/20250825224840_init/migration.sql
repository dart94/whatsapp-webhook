/*
  Warnings:

  - You are about to drop the column `ACCESS_TOKEN_ID` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `PHONE_NUMBER_ID` on the `Group` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Group` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Group` DROP COLUMN `ACCESS_TOKEN_ID`,
    DROP COLUMN `PHONE_NUMBER_ID`;

-- CreateTable
CREATE TABLE `GroupIntegration` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phoneNumberId` INTEGER NOT NULL,
    `accessTokenId` VARCHAR(191) NOT NULL,
    `groupId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Group_name_key` ON `Group`(`name`);

-- AddForeignKey
ALTER TABLE `GroupIntegration` ADD CONSTRAINT `GroupIntegration_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
