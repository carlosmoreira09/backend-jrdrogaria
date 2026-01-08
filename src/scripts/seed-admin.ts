/**
 * Seed Admin User - Cria o super admin inicial
 * Executar: npx ts-node src/scripts/seed-admin.ts
 */

import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { AdminUser } from '../entity/AdminUser';

async function seedAdmin() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const adminUserRepository = AppDataSource.getRepository(AdminUser);

    const existingAdmin = await adminUserRepository.findOne({
      where: { email: 'admin@betterprice.com.br' },
    });

    if (existingAdmin) {
      console.log('Super admin already exists');
      await AppDataSource.destroy();
      return;
    }

    const password_hash = await bcrypt.hash('Admin@123', 10);

    const superAdmin = adminUserRepository.create({
      name: 'Super Admin',
      email: 'admin@betterprice.com.br',
      password_hash,
      role: 'super_admin',
      status: 'active',
    });

    await adminUserRepository.save(superAdmin);
    console.log('✅ Super admin created successfully');
    console.log('   Email: admin@betterprice.com.br');
    console.log('   Password: Admin@123');
    console.log('   ⚠️  CHANGE THE PASSWORD AFTER FIRST LOGIN!');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
