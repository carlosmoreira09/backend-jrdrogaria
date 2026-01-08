-- Migration script to fix foreign key constraints before TypeORM sync
-- Run this manually in MySQL before starting the app

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all foreign keys on quotation_item that reference the old index
ALTER TABLE `quotation_item` DROP FOREIGN KEY IF EXISTS `FK_quotation_item_quotation_request`;
ALTER TABLE `quotation_item` DROP FOREIGN KEY IF EXISTS `FK_quotation_item_product`;

-- Drop all foreign keys on supplier_quotation
ALTER TABLE `supplier_quotation` DROP FOREIGN KEY IF EXISTS `FK_supplier_quotation_quotation_request`;
ALTER TABLE `supplier_quotation` DROP FOREIGN KEY IF EXISTS `FK_supplier_quotation_supplier`;

-- Drop all foreign keys on supplier_price
ALTER TABLE `supplier_price` DROP FOREIGN KEY IF EXISTS `FK_supplier_price_supplier_quotation`;
ALTER TABLE `supplier_price` DROP FOREIGN KEY IF EXISTS `FK_supplier_price_product`;

-- Drop all foreign keys on purchase_order
ALTER TABLE `purchase_order` DROP FOREIGN KEY IF EXISTS `FK_purchase_order_quotation_request`;
ALTER TABLE `purchase_order` DROP FOREIGN KEY IF EXISTS `FK_purchase_order_supplier`;
ALTER TABLE `purchase_order` DROP FOREIGN KEY IF EXISTS `FK_purchase_order_tenant`;

-- Drop all foreign keys on purchase_order_item
ALTER TABLE `purchase_order_item` DROP FOREIGN KEY IF EXISTS `FK_purchase_order_item_purchase_order`;
ALTER TABLE `purchase_order_item` DROP FOREIGN KEY IF EXISTS `FK_purchase_order_item_product`;

-- Drop problematic indexes if they exist
DROP INDEX IF EXISTS `IDX_14cdd5cf5b14961cb69d6e3e5e` ON `quotation_item`;
DROP INDEX IF EXISTS `IDX_quotation_item_quotation` ON `quotation_item`;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Note: After running this script, start your app and TypeORM will recreate
-- the foreign keys and indexes with the new schema
