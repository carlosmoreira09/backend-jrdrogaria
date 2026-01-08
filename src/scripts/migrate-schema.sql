-- =============================================================================
-- BetterPrice SaaS Migration Script
-- Phase 1: Multi-tenant + Multi-store Foundation
-- =============================================================================
-- Run this script ONCE to update the database schema
-- After running, set synchronize: true in database.ts
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================================
-- 1. TENANT TABLE - Add new columns
-- =============================================================================
ALTER TABLE `tenant` 
  ADD COLUMN IF NOT EXISTS `slug` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `status` ENUM('active', 'suspended', 'cancelled') DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS `plan` ENUM('basic', 'professional', 'enterprise') DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS `settings` JSON NULL,
  ADD COLUMN IF NOT EXISTS `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Generate slugs for existing tenants without slug
UPDATE `tenant` SET `slug` = LOWER(REPLACE(REPLACE(`name`, ' ', '-'), '.', '')) WHERE `slug` IS NULL OR `slug` = '';

-- Add unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS `IDX_tenant_slug` ON `tenant` (`slug`);
CREATE INDEX IF NOT EXISTS `IDX_tenant_status` ON `tenant` (`status`);

-- =============================================================================
-- 2. STORE TABLE - Create if not exists
-- =============================================================================
CREATE TABLE IF NOT EXISTS `store` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `code` VARCHAR(50) NULL,
  `address` VARCHAR(500) NULL,
  `phone` VARCHAR(50) NULL,
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `sortOrder` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `FK_store_tenant` FOREIGN KEY (`tenantId`) REFERENCES `tenant`(`id`) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS `IDX_store_tenant_code` ON `store` (`tenantId`, `code`);
CREATE INDEX IF NOT EXISTS `IDX_store_tenant_status` ON `store` (`tenantId`, `status`);

-- =============================================================================
-- 3. USER_STORE TABLE - Create if not exists (N:N relationship)
-- =============================================================================
CREATE TABLE IF NOT EXISTS `user_store` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `store_id` INT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `FK_user_store_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `FK_user_store_store` FOREIGN KEY (`store_id`) REFERENCES `store`(`id`) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS `IDX_user_store_unique` ON `user_store` (`user_id`, `store_id`);

-- =============================================================================
-- 4. USERS TABLE - Add new columns
-- =============================================================================
ALTER TABLE `users`
  ADD COLUMN IF NOT EXISTS `status` ENUM('active', 'inactive', 'pending') DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS `last_login_at` DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Rename role column if needed (ensure enum values)
-- ALTER TABLE `users` MODIFY COLUMN `role` ENUM('tenant_owner', 'admin', 'manager', 'operator') DEFAULT 'operator';

UPDATE `users` SET `status` = 'active' WHERE `status` IS NULL;

CREATE INDEX IF NOT EXISTS `IDX_users_tenant_email` ON `users` (`tenantId`, `email`);
CREATE INDEX IF NOT EXISTS `IDX_users_tenant_status` ON `users` (`tenantId`, `status`);

-- =============================================================================
-- 5. PRODUCTS TABLE - Add tenant column if not exists
-- =============================================================================
ALTER TABLE `products`
  ADD COLUMN IF NOT EXISTS `tenantId` INT NULL,
  ADD COLUMN IF NOT EXISTS `sku` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `barcode` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `category` VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS `unit` VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS `is_active` TINYINT(1) DEFAULT 1;

UPDATE `products` SET `is_active` = 1 WHERE `is_active` IS NULL;

CREATE INDEX IF NOT EXISTS `IDX_products_tenant_name` ON `products` (`tenantId`, `product_name`);
CREATE INDEX IF NOT EXISTS `IDX_products_tenant_sku` ON `products` (`tenantId`, `sku`);
CREATE INDEX IF NOT EXISTS `IDX_products_tenant_barcode` ON `products` (`tenantId`, `barcode`);

-- =============================================================================
-- 6. SUPPLIER TABLE - Add tenant column if not exists
-- =============================================================================
ALTER TABLE `supplier`
  ADD COLUMN IF NOT EXISTS `tenantId` INT NULL,
  ADD COLUMN IF NOT EXISTS `cnpj` VARCHAR(20) NULL,
  ADD COLUMN IF NOT EXISTS `email` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `phone` VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS `contactName` VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS `status` ENUM('active', 'inactive') DEFAULT 'active';

UPDATE `supplier` SET `status` = 'active' WHERE `status` IS NULL;

CREATE INDEX IF NOT EXISTS `IDX_supplier_tenant_name` ON `supplier` (`tenantId`, `supplier_name`);
CREATE INDEX IF NOT EXISTS `IDX_supplier_tenant_status` ON `supplier` (`tenantId`, `status`);

-- =============================================================================
-- 7. QUOTATION_REQUEST TABLE - Add store column
-- =============================================================================
ALTER TABLE `quotation_request`
  ADD COLUMN IF NOT EXISTS `storeId` INT NULL,
  ADD COLUMN IF NOT EXISTS `created_by_userId` INT NULL;

CREATE INDEX IF NOT EXISTS `IDX_quotation_tenant_store_created` ON `quotation_request` (`tenantId`, `storeId`, `created_at`);
CREATE INDEX IF NOT EXISTS `IDX_quotation_tenant_store_status` ON `quotation_request` (`tenantId`, `storeId`, `status`);

-- =============================================================================
-- 8. QUOTATION_ITEM TABLE - Add tenant and store columns
-- =============================================================================
ALTER TABLE `quotation_item`
  ADD COLUMN IF NOT EXISTS `tenantId` INT NULL,
  ADD COLUMN IF NOT EXISTS `storeId` INT NULL,
  ADD COLUMN IF NOT EXISTS `quantity` DECIMAL(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `notes` TEXT NULL;

-- Migrate totalQuantity to quantity if exists
-- UPDATE `quotation_item` SET `quantity` = `totalQuantity` WHERE `quantity` IS NULL OR `quantity` = 0;

CREATE INDEX IF NOT EXISTS `IDX_qi_tenant_store_quotation` ON `quotation_item` (`tenantId`, `storeId`, `quotationRequestId`);
CREATE INDEX IF NOT EXISTS `IDX_qi_tenant_store_product` ON `quotation_item` (`tenantId`, `storeId`, `productId`);

-- =============================================================================
-- 9. SUPPLIER_QUOTATION TABLE - Add tenant, store, token_hash columns
-- =============================================================================
ALTER TABLE `supplier_quotation`
  ADD COLUMN IF NOT EXISTS `tenantId` INT NULL,
  ADD COLUMN IF NOT EXISTS `storeId` INT NULL,
  ADD COLUMN IF NOT EXISTS `token_hash` VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS `expires_at` DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `revoked_at` DATETIME NULL;

-- Copy accessToken to token_hash if accessToken exists
UPDATE `supplier_quotation` SET `token_hash` = `accessToken` WHERE (`token_hash` IS NULL OR `token_hash` = '') AND `accessToken` IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS `IDX_sq_token_hash` ON `supplier_quotation` (`token_hash`);
CREATE INDEX IF NOT EXISTS `IDX_sq_tenant_store_quotation` ON `supplier_quotation` (`tenantId`, `storeId`, `quotationRequestId`);
CREATE INDEX IF NOT EXISTS `IDX_sq_tenant_store_supplier` ON `supplier_quotation` (`tenantId`, `storeId`, `supplierId`);
CREATE INDEX IF NOT EXISTS `IDX_sq_tenant_store_status` ON `supplier_quotation` (`tenantId`, `storeId`, `status`);

-- =============================================================================
-- 10. SUPPLIER_PRICE TABLE - Add tenant column
-- =============================================================================
ALTER TABLE `supplier_price`
  ADD COLUMN IF NOT EXISTS `tenantId` INT NULL;

CREATE INDEX IF NOT EXISTS `IDX_sp_tenant_product` ON `supplier_price` (`tenantId`, `productId`);

-- =============================================================================
-- 11. PURCHASE_ORDER TABLE - Add store column
-- =============================================================================
ALTER TABLE `purchase_order`
  ADD COLUMN IF NOT EXISTS `storeId` INT NULL,
  ADD COLUMN IF NOT EXISTS `created_by_userId` INT NULL;

CREATE INDEX IF NOT EXISTS `IDX_po_tenant_store_created` ON `purchase_order` (`tenantId`, `storeId`, `created_at`);
CREATE INDEX IF NOT EXISTS `IDX_po_tenant_store_status` ON `purchase_order` (`tenantId`, `storeId`, `status`);
CREATE INDEX IF NOT EXISTS `IDX_po_tenant_store_supplier` ON `purchase_order` (`tenantId`, `storeId`, `supplierId`);

-- =============================================================================
-- 12. PURCHASE_ORDER_ITEM TABLE - Add tenant and store columns
-- =============================================================================
ALTER TABLE `purchase_order_item`
  ADD COLUMN IF NOT EXISTS `tenantId` INT NULL,
  ADD COLUMN IF NOT EXISTS `storeId` INT NULL,
  ADD COLUMN IF NOT EXISTS `quantity` DECIMAL(10,2) DEFAULT 0;

CREATE INDEX IF NOT EXISTS `IDX_poi_tenant_store_order` ON `purchase_order_item` (`tenantId`, `storeId`, `purchaseOrderId`);
CREATE INDEX IF NOT EXISTS `IDX_poi_tenant_store_product` ON `purchase_order_item` (`tenantId`, `storeId`, `productId`);

-- =============================================================================
-- 13. CREATE DEFAULT STORES FOR EXISTING TENANT
-- =============================================================================
-- Create the 4 default stores (JR, GS, BARÃO, LB) for tenant 1
INSERT IGNORE INTO `store` (`tenantId`, `name`, `code`, `status`, `sortOrder`) VALUES
  (1, 'JR', 'JR', 'active', 1),
  (1, 'GS', 'GS', 'active', 2),
  (1, 'Barão', 'BARAO', 'active', 3),
  (1, 'LB', 'LB', 'active', 4);

-- =============================================================================
-- 14. ASSIGN DEFAULT TENANT TO ORPHAN RECORDS
-- =============================================================================
-- Get default tenant ID (should be 1)
SET @default_tenant_id = 1;

UPDATE `users` SET `tenantId` = @default_tenant_id WHERE `tenantId` IS NULL OR `tenantId` = 0;
UPDATE `products` SET `tenantId` = @default_tenant_id WHERE `tenantId` IS NULL OR `tenantId` = 0;
UPDATE `supplier` SET `tenantId` = @default_tenant_id WHERE `tenantId` IS NULL OR `tenantId` = 0;
UPDATE `quotation_request` SET `tenantId` = @default_tenant_id WHERE `tenantId` IS NULL OR `tenantId` = 0;
UPDATE `quotation_item` SET `tenantId` = @default_tenant_id WHERE `tenantId` IS NULL OR `tenantId` = 0;
UPDATE `supplier_quotation` SET `tenantId` = @default_tenant_id WHERE `tenantId` IS NULL OR `tenantId` = 0;
UPDATE `supplier_price` SET `tenantId` = @default_tenant_id WHERE `tenantId` IS NULL OR `tenantId` = 0;
UPDATE `purchase_order` SET `tenantId` = @default_tenant_id WHERE `tenantId` IS NULL OR `tenantId` = 0;
UPDATE `purchase_order_item` SET `tenantId` = @default_tenant_id WHERE `tenantId` IS NULL OR `tenantId` = 0;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- DONE! After running this script:
-- 1. Verify all data was migrated correctly
-- 2. Set synchronize: true in database.ts
-- 3. Restart the backend
-- =============================================================================
SELECT 'Migration complete!' as status;
