#!/usr/bin/env node
import 'dotenv/config.js';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const migrationPath = path.join(__dirname, 'prisma/migrations/0_init/migration.sql');
const sql = fs.readFileSync(migrationPath, 'utf-8');

const prisma = new PrismaClient({
  log: ['error'],
});

async function runMigration() {
  let connected = false;
  try {
    console.log('Applying migration...');
    
    // Test connection first
    console.log('Testing database connection...');
    await Promise.race([
      prisma.$executeRawUnsafe('SELECT 1'),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
    ]);
    connected = true;
    console.log('✓ Connected to database');
    
    // Split by ; and filter empty statements
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('→ Executing statement...');
        try {
          await prisma.$executeRawUnsafe(statement);
        } catch (e) {
          // Ignore "already exists" errors
          if (e.message && e.message.includes('already exists')) {
            console.log('  (Already exists, skipping)');
          } else {
            throw e;
          }
        }
      }
    }
    
    console.log('✓ Migration applied successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connected) {
      await prisma.$disconnect();
    }
  }
}

runMigration();
