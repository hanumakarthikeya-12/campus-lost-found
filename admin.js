const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const Item = require("../models/Item");
const Claim = require("../models/Claim");
const User = require("../models/User");

router.get("/stats", protect, adminOnly, async (_req, res) => {
  const [users, items, lost, found, pendingClaims, returned] = await Promise.all([
    User.countDocuments(), Item.countDocuments(), Item.countDocuments({ type: "lost" }),
    Item.countDocuments({ type: "found" }), Claim.countDocuments({ status: "pending" }),
    Item.countDocuments({ status: "returned" })
  ]);
  res.json({ users, items, lost, found, pendingClaims, returned });
});

router.get("/items", protect, adminOnly, async (_req, res) => {
  const items = await Item.find().populate("reportedBy", "name email").sort({ createdAt: -1 });
  res.json({ count: items.length, items });
});

router.patch("/items/:id/status", protect, adminOnly, async (req, res) => {
  const allowed = ["open", "claimed", "returned", "closed"];
  if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid item status" });
  const item = await Item.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!item) return res.status(404).json({ message: "Item not found" });
  res.json({ message: "Status updated", item });
});

router.delete("/items/:id", protect, adminOnly, async (req, res) => {
  const item = await Item.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: "Item not found" });
  await Claim.deleteMany({ item: item._id });
  res.json({ message: "Item and related claims deleted" });
});

module.exports = router;