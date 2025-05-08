import bcryptjs from "bcryptjs";

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

function generatePasswordWithPepper(password) {
  return password + process.env.PEPPER;
}

async function hash(password) {
  const rounds = getNumberOfRounds();
  const passwordWithPepper = generatePasswordWithPepper(password);
  return await bcryptjs.hash(passwordWithPepper, rounds);
}

async function compare(providedPassword, storedPassword) {
  const passwordWithPepper = generatePasswordWithPepper(providedPassword);
  return await bcryptjs.compare(passwordWithPepper, storedPassword);
}

const password = {
  hash,
  compare,
};

export default password;
