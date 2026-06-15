const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log("Adding columns...");
    await pool.query(`
      ALTER TABLE admissions 
      ADD COLUMN IF NOT EXISTS student_aadhar text,
      ADD COLUMN IF NOT EXISTS student_pan text,
      ADD COLUMN IF NOT EXISTS father_aadhar text,
      ADD COLUMN IF NOT EXISTS father_pan text,
      ADD COLUMN IF NOT EXISTS mother_aadhar text,
      ADD COLUMN IF NOT EXISTS mother_pan text;
    `);
    console.log("Columns added successfully!");
  } catch (error) {
    console.error("Error adding columns:", error);
  } finally {
    await pool.end();
  }
}

run();
