require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Item = require("./models/Item");
const bcrypt = require("bcryptjs");

async function seed() {
  await connectDB();
  let user = await User.findOne({ email: "student@campus.edu" });
  if (!user) {
    user = await User.create({
      name: "Demo Student", email: "student@campus.edu",
      password: await bcrypt.hash("Student@123", 12)
    });
  }
  await Item.deleteMany({ reportedBy: user._id });
  const samples = [
    ["Black Wallet", "lost", "Accessories", "Black leather wallet with student ID inside.", "Library", 1],
    ["Blue Water Bottle", "found", "Bottle", "Blue stainless steel bottle found near the main gate.", "Main Gate", 2],
    ["Scientific Calculator", "lost", "Electronics", "Casio scientific calculator with a small scratch.", "Block A - Room 204", 3],
    ["Set of Keys", "found", "Keys", "Three keys on a red keychain.", "Cafeteria", 4],
    ["Wireless Earbuds", "lost", "Electronics", "White wireless earbuds in a charging case.", "Computer Lab", 5],
    ["Grey Backpack", "found", "Bags", "Grey backpack left beside the seminar hall.", "Seminar Hall", 6],
    ["Student ID Card", "lost", "ID Card", "University ID card. Name is visible on the card.", "Sports Ground", 7],
    ["Umbrella", "found", "Accessories", "Navy blue folding umbrella.", "Block C Reception", 8],
    ["Notebook", "lost", "Books", "Green notebook containing Web Technology notes.", "Reading Room", 9],
    ["USB Drive", "found", "Electronics", "32 GB black USB drive found in the library.", "Library", 10]
  ];
  await Item.insertMany(samples.map(([title, type, category, description, location, days]) => ({
    title, type, category, description, location,
    date: new Date(Date.now() - days * 86400000), reportedBy: user._id
  })));
  console.log("Inserted 10 demo items.");
  console.log("Demo user: student@campus.edu / Student@123");
  process.exit(0);
}
seed().catch(err => { console.error(err); process.exit(1); });