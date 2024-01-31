require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User.js")

mongoose.connect(process.env.DATABASE_URL);

async function migrateData() {
  try {
    const users = await User.find();

    for (const user of users) {
      // Modify the structure according to the new schema
      user.highscores = {
        timeTrial: {
          hse60: user.highscores.hse60 || 0,
          hsm90: user.highscores.hsm90 || 0,
          hsh120: user.highscores.hsh120 || 0,
        }
      };

      // Save the updated document
      await user.save();
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

migrateData();
