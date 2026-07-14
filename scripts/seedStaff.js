const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config({ path: "server/.env" });

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in server/.env");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const staff = db.collection("staff");

  await staff.insertMany([
    {
      role: "ambulance",
      email: "unit@turbo911.in",
      vehicleReg: "MP-09-AB-1234",
      passcode: "ambulance-secret",
    },
    { role: "doctor", email: "doctor@turbo911.in", password: "password123" },
    { role: "command", email: "command@turbo911.in", password: "password123" },
  ]);

  console.log("Seeded staff documents");
  await client.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
