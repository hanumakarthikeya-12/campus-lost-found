const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  type: { type: String, enum: ["lost", "found"], required: true },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  location: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  image: { type: String, default: "" },
  status: { type: String, enum: ["open", "claimed", "returned", "closed"], default: "open" },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);