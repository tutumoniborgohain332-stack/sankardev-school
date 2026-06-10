import { Client } from 'pg';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    await client.query('ALTER TABLE gallery ADD COLUMN IF NOT EXISTS is_hero BOOLEAN NOT NULL DEFAULT FALSE;');
    console.log('Column added successfully');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    await client.end();
  }
}

run();
