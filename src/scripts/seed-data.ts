import { AppDataSource } from '../config/database';
import { Tenant } from '../entity/Tenant';
import { Store } from '../entity/Store';
import { Users } from '../entity/Users';
import { UserStore } from '../entity/UserStore';
import bcrypt from 'bcryptjs';

async function seedData() {
  try {
    await AppDataSource.initialize();
    console.log('🌱 Seeding database...\n');

    const tenantRepo = AppDataSource.getRepository(Tenant);
    const storeRepo = AppDataSource.getRepository(Store);
    const userRepo = AppDataSource.getRepository(Users);
    const userStoreRepo = AppDataSource.getRepository(UserStore);

    // 1. Create Tenant
    console.log('📌 Creating tenant...');
    let tenant = await tenantRepo.findOne({ where: { slug: 'jr-drogaria' } });
    
    if (!tenant) {
      tenant = tenantRepo.create({
        name: 'JR Drogaria',
        slug: 'jr-drogaria',
        status: 'active',
        plan: 'pro',
      });
      tenant = await tenantRepo.save(tenant);
      console.log(`  ✅ Created tenant: ${tenant.name} (ID: ${tenant.id})`);
    } else {
      console.log(`  ⏭️  Tenant already exists: ${tenant.name}`);
    }

    // 2. Create Stores
    console.log('\n📌 Creating stores...');
    const storeNames = [
      { name: 'JR', code: 'JR' },
      { name: 'GS', code: 'GS' },
      { name: 'Barão', code: 'BARAO' },
      { name: 'LB', code: 'LB' },
    ];

    const stores: Store[] = [];
    for (const s of storeNames) {
      let store = await storeRepo.findOne({ where: { tenant: { id: tenant.id }, code: s.code } });
      if (!store) {
        store = storeRepo.create({
          tenant,
          name: s.name,
          code: s.code,
          status: 'active',
          sortOrder: storeNames.indexOf(s) + 1,
        });
        store = await storeRepo.save(store);
        console.log(`  ✅ Created store: ${store.name} (ID: ${store.id})`);
      } else {
        console.log(`  ⏭️  Store already exists: ${store.name}`);
      }
      stores.push(store);
    }

    // 3. Create Admin User
    console.log('\n📌 Creating admin user...');
    let adminUser = await userRepo.findOne({ where: { email: 'admin@jrdrogaria.com.br' } });
    
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = userRepo.create({
        tenant,
        fullName: 'Administrador',
        email: 'admin@jrdrogaria.com.br',
        password: hashedPassword,
        role: 'tenant_owner',
        status: 'active',
      });
      adminUser = await userRepo.save(adminUser);
      console.log(`  ✅ Created admin user: ${adminUser.email} (ID: ${adminUser.id})`);
      console.log(`     Password: admin123`);
    } else {
      console.log(`  ⏭️  Admin user already exists: ${adminUser.email}`);
    }

    // 4. Link user to all stores
    console.log('\n📌 Linking user to stores...');
    for (const store of stores) {
      const existing = await userStoreRepo.findOne({
        where: { user_id: adminUser.id, store_id: store.id }
      });
      if (!existing) {
        const userStore = userStoreRepo.create({
          user_id: adminUser.id,
          store_id: store.id,
          user: adminUser,
          store,
        });
        await userStoreRepo.save(userStore);
        console.log(`  ✅ Linked user to store: ${store.name}`);
      }
    }

    await AppDataSource.destroy();

    console.log('\n✅ Seed complete!\n');
    console.log('📋 Summary:');
    console.log(`   Tenant: ${tenant.name} (slug: ${tenant.slug})`);
    console.log(`   Stores: ${stores.map(s => s.name).join(', ')}`);
    console.log(`   Admin: admin@jrdrogaria.com.br / admin123`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedData();
