import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function dropTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'shoppinglist-database',
  });

  try {
    console.log('🗑️  Dropping tables...\n');
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    const tables = [
      'user_store',
      'store',
      'supplier_price',
      'supplier_quotation',
      'quotation_item',
      'quotation_request',
      'purchase_order_item',
      'purchase_order',
      'shopping_list',
      'products',
      'supplier',
      'users',
      'tenant',
    ];

    for (const table of tables) {
      try {
        await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
        console.log(`  ✅ Dropped: ${table}`);
      } catch (e: any) {
        console.log(`  ⚠️  ${table}: ${e.message}`);
      }
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    await connection.end();
    
    console.log('\n✅ All tables dropped! Now run: npm run dev');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    await connection.end();
    process.exit(1);
  }
}

dropTables();
