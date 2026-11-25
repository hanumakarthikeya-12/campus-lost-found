const Claim = require("../models/Claim");
const Item = require("../models/Item");

exports.createClaim = async (req, res) => {
  try {
    const { message, proof } = req.body;
    if (!message) return res.status(400).json({ message: "Please explain why this item belongs to you" });
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (String(item.reportedBy) === String(req.user._id)) return res.status(400).json({ message: "You cannot claim your own report" });
    if (item.status !== "open") return res.status(400).json({ message: "This item is not available for claims" });

    const claim = await Claim.create({ item: item._id, claimant: req.user._id, message, proof: proof || "" });
    res.status(201).json({ message: "Claim submitted", claim });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You have already submitted a claim for this item" });
    res.status(500).json({ message: "Could not submit claim" });
  }
};

exports.myClaims = async (req, res) => {
  const claims = await Claim.find({ claimant: req.user._id }).populate("item").sort({ createdAt: -1 });
  res.json({ count: claims.length, claims });
};

exports.reviewClaim = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Status must be approved or rejected" });
    const claim = await Claim.findById(req.params.id).populate("item");
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    if (String(claim.item.reportedBy) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only the item reporter or admin can review this claim" });
    }
    claim.status = status;
    await claim.save();
    if (status === "approved") {
      await Item.findByIdAndUpdate(claim.item._id, { status: "returned" });
      await Claim.updateMany({ item: claim.item._id, _id: { $ne: claim._id }, status: "pending" }, { status: "rejected" });
    }
    res.json({ message: `Claim ${status}`, claim });
  } catch (error) {
    res.status(400).json({ message: "Could not review claim" });
  }
};

exports.allClaims = async (req, res) => {
  const claims = await Claim.find().populate("item").populate("claimant", "name email").sort({ createdAt: -1 });
  res.json({ count: claims.length, claims });
};