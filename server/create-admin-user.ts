import { hashPassword } from './auth';
import { storage } from './storage';

async function createAdminUser() {
  try {
    // Check if user already exists
    const existingUser = await storage.getUserByUsername('harunabdullahrakin@gmail.com');
    if (existingUser) {
      console.log('User already exists!');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await hashPassword('iamrakin');
    
    // Create admin user
    const user = await storage.createUser({
      username: 'harunabdullahrakin@gmail.com',
      email: 'harunabdullahrakin@gmail.com',
      password: hashedPassword,
      firstName: 'Harun Abdullah',
      lastName: 'Rakin',
      role: 'admin'
    });

    console.log('Admin user created successfully:', user);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();