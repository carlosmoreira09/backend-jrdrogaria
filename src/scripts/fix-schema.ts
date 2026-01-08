import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'shoppinglist-database',
  });

  try {
    console.log('🔧 Fixing database schema...');
    console.log('⏳ Disabling foreign key checks...');
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    const tables = [
      'quotation_item',
      'supplier_quotation', 
      'supplier_price',
      'purchase_order',
      'purchase_order_item',
      'quotation_request',
      'products',
      'supplier',
      'users',
      'store',
      'user_store'
    ];

    for (const table of tables) {
      try {
        // Get all foreign keys for this table
        const [foreignKeys] = await connection.query(`
          SELECT CONSTRAINT_NAME 
          FROM information_schema.TABLE_CONSTRAINTS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = ? 
          AND CONSTRAINT_TYPE = 'FOREIGN KEY'
        `, [table]) as any;

        for (const fk of foreignKeys) {
          try {
            console.log(`  🗑️  Dropping FK ${fk.CONSTRAINT_NAME} on ${table}`);
            await connection.query(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
          } catch (e: any) {
            console.log(`  ⚠️  Could not drop FK ${fk.CONSTRAINT_NAME}: ${e.message}`);
          }
        }

        // Get all non-primary indexes for this table
        const [indexes] = await connection.query(`
          SELECT DISTINCT INDEX_NAME 
          FROM information_schema.STATISTICS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND TABLE_NAME = ?
          AND INDEX_NAME != 'PRIMARY'
        `, [table]) as any;

        for (const idx of indexes) {
          try {
            console.log(`  🗑️  Dropping index ${idx.INDEX_NAME} on ${table}`);
            await connection.query(`DROP INDEX \`${idx.INDEX_NAME}\` ON \`${table}\``);
          } catch (e: any) {
            console.log(`  ⚠️  Could not drop index ${idx.INDEX_NAME}: ${e.message}`);
          }
        }
      } catch (e: any) {
        console.log(`  ⚠️  Error processing table ${table}: ${e.message}`);
      }
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Re-enabled foreign key checks');
    
    await connection.end();
    
    console.log('✅ Schema cleanup complete! Now restart your app.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await connection.end();
    process.exit(1);
  }
}

fixSchema();
