// hash.js
import bcrypt from "bcrypt";

const password = process.argv[2]; // read from command line
const saltRounds = 10;

if (!password) {
  console.error("Usage: node hash.js <password>");
  process.exit(1);
}

const run = async () => {
  const hashed = await bcrypt.hash(password, saltRounds);
  console.log("Hashed password:\n", hashed);
};

run();
