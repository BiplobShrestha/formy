const bcrypt = require("bcryptjs");
const User = require("../models/User");
const CitizenRecord = require("../models/CitizenRecord");
const Notice = require("../models/Notice");
const { accounts, defaultPasswords, citizens, notices } = require("./data");

async function seedAccount(role, envName) {
  const { name, phone } = accounts[role];
  const exists = await User.findOne({ phone });
  if (exists) return;
  const password = process.env[envName] || defaultPasswords[role];
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name, phone, passwordHash, role });
  console.log(`Seeded ${role} account (${phone})`);
}

async function seed() {
  await seedAccount("admin", "ADMIN_PASSWORD");
  await seedAccount("officer", "OFFICER_PASSWORD");

  for (const c of citizens) {
    await CitizenRecord.updateOne(
      { citizenshipNumber: c.citizenshipNumber },
      { $set: c },
      { upsert: true }
    );
  }
  console.log(`Citizen records synced (${citizens.length})`);

  if ((await Notice.countDocuments()) === 0) {
    await Notice.insertMany(notices);
    console.log("Seeded notices");
  }
}

module.exports = seed;
