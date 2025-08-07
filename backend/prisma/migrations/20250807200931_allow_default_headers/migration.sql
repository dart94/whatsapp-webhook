/*
  Warnings:

  - The primary key for the `SheetIntegration` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `SheetIntegration` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `SheetIntegration` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `headers` JSON NULL,
    ADD PRIMARY KEY (`id`);
