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

async function columnExists(connection: any, table: string, column: string): Promise<boolean> {
  const [result] = await connection.query(`
    SELECT COUNT(*) as cnt FROM information_schema.columns 
    WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?
  `, [table, column]) as any;
  return result[0].cnt > 0;
}

async function migrateData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'shoppinglist-database',
  });

  try {
    console.log('🔧 Running data migration...\n');

    // 1. Migrate tenant slugs
    if (await columnExists(connection, 'tenant', 'slug')) {
      console.log('📌 Migrating tenant slugs...');
      const [tenants] = await connection.query(`
        SELECT id, name FROM tenant WHERE slug IS NULL OR slug = ''
      `) as any;

      for (const tenant of tenants) {
        const slug = generateSlug(tenant.name || `tenant-${tenant.id}`);
        console.log(`  ✏️  tenant ${tenant.id}: ${slug}`);
        await connection.query('UPDATE tenant SET slug = ? WHERE id = ?', [slug, tenant.id]);
      }
      console.log(`  ✅ ${tenants.length} tenants updated\n`);
    }

    // 2. Migrate supplier_quotation token_hash (from accessToken if exists)
    if (await columnExists(connection, 'supplier_quotation', 'token_hash')) {
      console.log('📌 Migrating supplier_quotation token_hash...');
      
      // Check if accessToken column exists
      const hasAccessToken = await columnExists(connection, 'supplier_quotation', 'accessToken');
      
      if (hasAccessToken) {
        // Copy from accessToken where token_hash is empty
        await connection.query(`
          UPDATE supplier_quotation 
          SET token_hash = accessToken 
          WHERE (token_hash IS NULL OR token_hash = '') AND accessToken IS NOT NULL AND accessToken != ''
        `);
      }
      
      // Generate new tokens for any remaining empty ones
      const [quotations] = await connection.query(`
        SELECT id FROM supplier_quotation WHERE token_hash IS NULL OR token_hash = ''
      `) as any;

      for (const sq of quotations) {
        const token = generateToken();
        console.log(`  ✏️  supplier_quotation ${sq.id}: ${token.substring(0, 8)}...`);
        await connection.query('UPDATE supplier_quotation SET token_hash = ? WHERE id = ?', [token, sq.id]);
      }
      console.log(`  ✅ ${quotations.length} tokens generated\n`);
    }

    // 3. Set default values for nullable fields that became required
    console.log('📌 Setting default values for new required fields...');
    
    // Tenant status and plan
    if (await columnExists(connection, 'tenant', 'status')) {
      await connection.query(`UPDATE tenant SET status = 'active' WHERE status IS NULL OR status = ''`);
      console.log('  ✅ tenant.status defaults set');
    }
    if (await columnExists(connection, 'tenant', 'plan')) {
      await connection.query(`UPDATE tenant SET plan = 'basic' WHERE plan IS NULL OR plan = ''`);
      console.log('  ✅ tenant.plan defaults set');
    }

    // Users status
    if (await columnExists(connection, 'users', 'status')) {
      await connection.query(`UPDATE users SET status = 'active' WHERE status IS NULL OR status = ''`);
      console.log('  ✅ users.status defaults set');
    }

    // Supplier status
    if (await columnExists(connection, 'supplier', 'status')) {
      await connection.query(`UPDATE supplier SET status = 'active' WHERE status IS NULL OR status = ''`);
      console.log('  ✅ supplier.status defaults set');
    }

    // Products is_active
    if (await columnExists(connection, 'products', 'is_active')) {
      await connection.query(`UPDATE products SET is_active = 1 WHERE is_active IS NULL`);
      console.log('  ✅ products.is_active defaults set');
    }

    // Store status
    if (await columnExists(connection, 'store', 'status')) {
      await connection.query(`UPDATE store SET status = 'active' WHERE status IS NULL OR status = ''`);
      console.log('  ✅ store.status defaults set');
    }

    await connection.end();
    
    console.log('\n✅ Migration complete! Now restart your app.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await connection.end();
    process.exit(1);
  }
}

migrateData();
