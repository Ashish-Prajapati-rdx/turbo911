const fetch = globalThis.fetch || require("node-fetch");

async function run() {
  const res = await fetch("http://localhost:3000/api/staff/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role: "doctor",
      email: "doctor@turbo911.in",
      password: "password123",
    }),
  });
  const text = await res.text();
  console.log("Status:", res.status);
  console.log(text);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
