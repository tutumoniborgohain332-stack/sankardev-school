// Seed script: Add Principal user + staff + 5 Class VIII dummy students
import pg from "pg";
import crypto from "crypto";

const { Pool } = pg;

function hashPassword(password) {
  return crypto.createHash("sha256").update(password + "school_salt_2024").digest("hex");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  try {
    // 1. Add Principal user account
    const principalHash = hashPassword("gohain123");
    const existingPrincipal = await client.query(
      "SELECT id FROM users WHERE username = $1",
      ["tutumoni"]
    );

    let principalUserId;
    if (existingPrincipal.rows.length === 0) {
      const result = await client.query(
        `INSERT INTO users (username, password_hash, role, name) 
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ["tutumoni", principalHash, "principal", "Principal"]
      );
      principalUserId = result.rows[0].id;
      console.log("✅ Principal user created, id:", principalUserId);
    } else {
      principalUserId = existingPrincipal.rows[0].id;
      // Update password and role
      await client.query(
        "UPDATE users SET password_hash=$1, role=$2 WHERE username=$3",
        [principalHash, "principal", "tutumoni"]
      );
      console.log("✅ Principal user already exists, updated password/role");
    }

    // 2. Add Principal as staff member
    const existingStaff = await client.query(
      "SELECT id FROM staff WHERE username = $1",
      ["tutumoni"]
    );

    if (existingStaff.rows.length === 0) {
      await client.query(
        `INSERT INTO staff (name, designation, qualification, phone, join_date, username, is_headmaster, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          "Principal",
          "Principal",
          "M.A., B.Ed.",
          "",
          "2000-01-01",
          "tutumoni",
          true,
          principalUserId,
        ]
      );
      console.log("✅ Principal staff member created");
    } else {
      console.log("✅ Principal staff already exists");
    }

    // 3. Add 5 dummy Class VIII students
    const dummyStudents = [
      { name: "Rahul Kumar Das", father: "Bikash Das", mother: "Renu Das", roll: "801", apaar: "APAAR8001" },
      { name: "Priya Bora", father: "Hemanta Bora", mother: "Minu Bora", roll: "802", apaar: "APAAR8002" },
      { name: "Aman Sharma", father: "Suresh Sharma", mother: "Gita Sharma", roll: "803", apaar: "APAAR8003" },
      { name: "Sneha Kalita", father: "Prabin Kalita", mother: "Purnima Kalita", roll: "804", apaar: "APAAR8004" },
      { name: "Dipak Nath", father: "Ranjit Nath", mother: "Kabita Nath", roll: "805", apaar: "APAAR8005" },
    ];

    for (const s of dummyStudents) {
      const exists = await client.query(
        "SELECT id FROM students WHERE apaar_id = $1",
        [s.apaar]
      );
      if (exists.rows.length === 0) {
        await client.query(
          `INSERT INTO students (student_name, father_name, mother_name, class_name, roll_number, apaar_id, admission_date, nationality)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [s.name, s.father, s.mother, "VIII", s.roll, s.apaar, "2020-04-01", "Indian"]
        );
        console.log(`✅ Student added: ${s.name}`);
      } else {
        console.log(`⚠️  Student already exists: ${s.name}`);
      }
    }

    console.log("\n🎉 Seed completed!");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
