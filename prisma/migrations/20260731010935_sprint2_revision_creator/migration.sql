-- CreateIndex
CREATE INDEX `budget_revisions_createdById_idx` ON `budget_revisions`(`createdById`);

-- AddForeignKey
ALTER TABLE `budget_revisions` ADD CONSTRAINT `budget_revisions_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
