require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => res.json({ status: "ok", message: "Campus Lost and Found API is running" }));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/items", require("./routes/items"));
app.use("/api/claims", require("./routes/claims"));
app.use("/api/admin", require("./routes/admin"));

app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(400).json({ message: err.message || "Request failed" });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const email = process.env.ADMIN_EMAIL.toLowerCase();
      const existing = await User.findOne({ email });
      if (!existing) {
        const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
        await User.create({ name: "Campus Administrator", email, password, role: "admin" });
        console.log(`Initial admin created: ${email}`);
      }
    }
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

start();