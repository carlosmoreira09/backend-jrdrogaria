import mysql from 'mysql2/promise';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

function generateToken(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 32);
}

async function fullMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'shoppinglist-database',
  });

  try {
    console.log('🔧 Running full data migration...\n');
    
    // Disable FK checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Get default tenant ID (first one)
    const [tenants] = await connection.query('SELECT id FROM tenant ORDER BY id LIMIT 1') as any;
    const defaultTenantId = tenants.length > 0 ? tenants[0].id : null;
    
    if (!defaultTenantId) {
      console.log('❌ No tenant found! Please create at least one tenant first.');
      await connection.end();
      process.exit(1);
    }
    
    console.log(`📌 Using default tenant ID: ${defaultTenantId}\n`);

    // 1. Migrate tenant slugs
    console.log('📌 Step 1: Migrating tenant slugs...');
    const [tenantsWithoutSlug] = await connection.query(`
      SELECT id, name FROM tenant WHERE slug IS NULL OR slug = ''
    `) as any;
    for (const tenant of tenantsWithoutSlug) {
      const slug = generateSlug(tenant.name || `tenant-${tenant.id}`);
      await connection.query('UPDATE tenant SET slug = ? WHERE id = ?', [slug, tenant.id]);
    }
    console.log(`  ✅ ${tenantsWithoutSlug.length} slugs updated\n`);

    // 2. Assign orphan users to default tenant
    console.log('📌 Step 2: Assigning orphan users to default tenant...');
    const [orphanUsers] = await connection.query(`
      SELECT COUNT(*) as cnt FROM users WHERE tenantId IS NULL OR tenantId = 0
    `) as any;
    if (orphanUsers[0].cnt > 0) {
      await connection.query(`UPDATE users SET tenantId = ? WHERE tenantId IS NULL OR tenantId = 0`, [defaultTenantId]);
      console.log(`  ✅ ${orphanUsers[0].cnt} users assigned\n`);
    } else {
      console.log('  ✅ No orphan users\n');
    }

    // 3. Assign orphan products to default tenant
    console.log('📌 Step 3: Assigning orphan products to default tenant...');
    const [orphanProducts] = await connection.query(`
      SELECT COUNT(*) as cnt FROM products WHERE tenantId IS NULL OR tenantId = 0
    `) as any;
    if (orphanProducts[0].cnt > 0) {
      await connection.query(`UPDATE products SET tenantId = ? WHERE tenantId IS NULL OR tenantId = 0`, [defaultTenantId]);
      console.log(`  ✅ ${orphanProducts[0].cnt} products assigned\n`);
    } else {
      console.log('  ✅ No orphan products\n');
    }

    // 4. Assign orphan suppliers to default tenant
    console.log('📌 Step 4: Assigning orphan suppliers to default tenant...');
    const [orphanSuppliers] = await connection.query(`
      SELECT COUNT(*) as cnt FROM supplier WHERE tenantId IS NULL OR tenantId = 0
    `) as any;
    if (orphanSuppliers[0].cnt > 0) {
      await connection.query(`UPDATE supplier SET tenantId = ? WHERE tenantId IS NULL OR tenantId = 0`, [defaultTenantId]);
      console.log(`  ✅ ${orphanSuppliers[0].cnt} suppliers assigned\n`);
    } else {
      console.log('  ✅ No orphan suppliers\n');
    }

    // 5. Assign orphan quotation_request to default tenant
    console.log('📌 Step 5: Assigning orphan quotation requests to default tenant...');
    const [orphanQuotations] = await connection.query(`
      SELECT COUNT(*) as cnt FROM quotation_request WHERE tenantId IS NULL OR tenantId = 0
    `) as any;
    if (orphanQuotations[0].cnt > 0) {
      await connection.query(`UPDATE quotation_request SET tenantId = ? WHERE tenantId IS NULL OR tenantId = 0`, [defaultTenantId]);
      console.log(`  ✅ ${orphanQuotations[0].cnt} quotation requests assigned\n`);
    } else {
      console.log('  ✅ No orphan quotation requests\n');
    }

    // 6. Generate token_hash for supplier_quotation
    console.log('📌 Step 6: Generating token_hash for supplier quotations...');
    // First copy from accessToken if exists
    try {
      await connection.query(`
        UPDATE supplier_quotation 
        SET token_hash = accessToken 
        WHERE (token_hash IS NULL OR token_hash = '') 
          AND accessToken IS NOT NULL AND accessToken != ''
      `);
    } catch (e) {
      // accessToken column might not exist
    }
    
    const [quotationsWithoutToken] = await connection.query(`
      SELECT id FROM supplier_quotation WHERE token_hash IS NULL OR token_hash = ''
    `) as any;
    for (const sq of quotationsWithoutToken) {
      await connection.query('UPDATE supplier_quotation SET token_hash = ? WHERE id = ?', [generateToken(), sq.id]);
    }
    console.log(`  ✅ ${quotationsWithoutToken.length} tokens generated\n`);

    // 7. Set default values for status fields
    console.log('📌 Step 7: Setting default values...');
    await connection.query(`UPDATE tenant SET status = 'active' WHERE status IS NULL OR status = ''`);
    await connection.query(`UPDATE tenant SET plan = 'basic' WHERE plan IS NULL OR plan = ''`);
    await connection.query(`UPDATE users SET status = 'active' WHERE status IS NULL OR status = ''`);
    await connection.query(`UPDATE supplier SET status = 'active' WHERE status IS NULL OR status = ''`);
    await connection.query(`UPDATE products SET is_active = 1 WHERE is_active IS NULL`);
    console.log('  ✅ Default values set\n');

    // Re-enable FK checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    await connection.end();
    
    console.log('✅ Full migration complete! Now restart your app.');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await connection.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    await connection.end();
    process.exit(1);
  }
}

fullMigration();
