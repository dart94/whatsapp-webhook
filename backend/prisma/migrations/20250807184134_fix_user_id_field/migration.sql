/*
  Warnings:

  - You are about to alter the column `userId` on the `SheetIntegration` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `SheetIntegration` DROP FOREIGN KEY `SheetIntegration_userId_fkey`;

-- DropIndex
DROP INDEX `SheetIntegration_userId_fkey` ON `SheetIntegration`;

-- AlterTable
ALTER TABLE `SheetIntegration` MODIFY `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `SheetIntegration` ADD CONSTRAINT `SheetIntegration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
