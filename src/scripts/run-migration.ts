import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'shoppinglist-database',
    multipleStatements: true,
  });

  try {
    console.log('🚀 Running schema migration...\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'migrate-schema.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Remove comments for cleaner execution
    sql = sql.replace(/--.*$/gm, '');
    
    // Split by semicolon and filter empty statements
    const statements = sql.split(';').filter(s => s.trim().length > 0);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      const trimmed = statement.trim();
      if (!trimmed) continue;
      
      try {
        await connection.query(trimmed);
        successCount++;
        
        // Log important statements
        if (trimmed.includes('CREATE TABLE')) {
          const match = trimmed.match(/CREATE TABLE.*`(\w+)`/i);
          if (match) console.log(`  ✅ Created table: ${match[1]}`);
        } else if (trimmed.includes('ALTER TABLE') && trimmed.includes('ADD COLUMN')) {
          const match = trimmed.match(/ALTER TABLE `(\w+)`/i);
          if (match) console.log(`  ✅ Added columns to: ${match[1]}`);
        } else if (trimmed.includes('CREATE') && trimmed.includes('INDEX')) {
          // Silently succeed for indexes
        } else if (trimmed.includes('INSERT')) {
          console.log(`  ✅ Inserted default data`);
        } else if (trimmed.includes('UPDATE')) {
          console.log(`  ✅ Updated orphan records`);
        }
      } catch (e: any) {
        // Ignore "already exists" errors
        if (e.code === 'ER_DUP_FIELDNAME' || 
            e.code === 'ER_TABLE_EXISTS_ERROR' ||
            e.code === 'ER_DUP_KEYNAME' ||
            e.code === 'ER_DUP_ENTRY') {
          // Expected errors, skip silently
        } else {
          console.log(`  ⚠️  Warning: ${e.message.substring(0, 80)}`);
          errorCount++;
        }
      }
    }

    console.log(`\n📊 Summary: ${successCount} statements executed, ${errorCount} warnings`);
    
    // Verify migration
    console.log('\n📋 Verifying migration...');
    
    const [stores] = await connection.query('SELECT COUNT(*) as cnt FROM store') as any;
    console.log(`  - Stores: ${stores[0].cnt}`);
    
    const [tenants] = await connection.query('SELECT COUNT(*) as cnt FROM tenant WHERE slug IS NOT NULL') as any;
    console.log(`  - Tenants with slug: ${tenants[0].cnt}`);
    
    await connection.end();
    
    console.log('\n✅ Migration complete!');
    console.log('\n📌 Next steps:');
    console.log('   1. Set synchronize: true in database.ts');
    console.log('   2. Restart the backend: npm run dev');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await connection.end();
    process.exit(1);
  }
}

runMigration();
