require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres', // connect to default DB first to create nexusestate
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
  try {
    console.log('Connecting to PostgreSQL...');
    
    // 1. Create Database if it doesn't exist
    const res = await pool.query("SELECT 1 FROM pg_database WHERE datname = 'nexusestate'");
    if (res.rowCount === 0) {
      console.log('Creating database nexusestate...');
      await pool.query('CREATE DATABASE nexusestate');
    } else {
      console.log('Database nexusestate already exists.');
    }
    
    await pool.end();

    // 2. Connect to the new database
    console.log('Connecting to nexusestate database...');
    const nexusPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: 'nexusestate',
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    });

    // 3. Read and execute the SQL files
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const triggersPath = path.join(__dirname, '..', 'database', 'triggers.sql');
    const transactionsPath = path.join(__dirname, '..', 'database', 'transactions.sql');
    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');

    if (fs.existsSync(schemaPath)) {
      console.log('Executing schema from database/schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await nexusPool.query(schemaSql);
      console.log('Schema successfully applied!');
    } else {
      console.log('database/schema.sql not found.');
    }

    if (fs.existsSync(triggersPath)) {
      console.log('Executing triggers from database/triggers.sql...');
      const triggersSql = fs.readFileSync(triggersPath, 'utf8');
      await nexusPool.query(triggersSql);
      console.log('Triggers successfully applied!');
    } else {
      console.log('database/triggers.sql not found.');
    }

    if (fs.existsSync(transactionsPath)) {
      console.log('Executing transactions from database/transactions.sql...');
      const transactionsSql = fs.readFileSync(transactionsPath, 'utf8');
      await nexusPool.query(transactionsSql);
      console.log('Transactions successfully applied!');
    } else {
      console.log('database/transactions.sql not found.');
    }

    if (fs.existsSync(seedPath)) {
      console.log('Executing seed from database/seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await nexusPool.query(seedSql);
      console.log('Seed data successfully applied!');
    } else {
      console.log('database/seed.sql not found.');
    }
    
    await nexusPool.end();
    console.log('Database setup completed successfully.');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

setupDatabase();
