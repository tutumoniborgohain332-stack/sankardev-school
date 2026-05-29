const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect()
  .then(() => {
    console.log("Connected successfully");
    return client.query("SELECT NOW()");
  })
  .then(res => {
    console.log(res.rows[0]);
    client.end();
  })
  .catch(err => {
    console.error("Connection error", err.stack);
    client.end();
  });
