require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'daily_essentials',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

const seedAdmin = async () => {
  try {
    console.log('Connecting to database...');
    
    // Check if admin already exists
    const checkAdmin = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@dailyessentials.com']);
    
    if (checkAdmin.rows.length > 0) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    console.log('Creating initial admin user...');
    
    const adminPassword = 'Admin@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const query = `
      INSERT INTO users (full_name, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, full_name, email, role
    `;

    const result = await pool.query(query, ['System Admin', 'admin@dailyessentials.com', hashedPassword, 'admin', 'active']);
    
    console.log('Admin user successfully created!');
    console.log(result.rows[0]);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
