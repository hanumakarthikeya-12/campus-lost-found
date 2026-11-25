const Item = require("../models/Item");

exports.createItem = async (req, res) => {
  try {
    const { title, type, category, description, location, date } = req.body;
    if (!title || !type || !category || !description || !location || !date) {
      return res.status(400).json({ message: "Please complete all required item fields" });
    }
    if (!["lost", "found"].includes(type)) return res.status(400).json({ message: "Type must be lost or found" });

    const item = await Item.create({
      title, type, category, description, location, date,
      image: req.file ? `/uploads/${req.file.filename}` : "",
      reportedBy: req.user._id
    });
    const populated = await item.populate("reportedBy", "name");
    res.status(201).json({ message: "Item report created", item: populated });
  } catch (error) {
    res.status(500).json({ message: "Could not create item" });
  }
};

exports.getItems = async (req, res) => {
  try {
    const { search, category, location, type, sort = "newest", status } = req.query;
    const filter = {};
    if (type && ["lost", "found"].includes(type)) filter.type = type;
    if (category) filter.category = { $regex: category, $options: "i" };
    if (location) filter.location = { $regex: location, $options: "i" };
    if (status) filter.status = status;
    if (search) filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } }
    ];
    const sortOrder = sort === "oldest" ? 1 : -1;
    const items = await Item.find(filter).populate("reportedBy", "name").sort({ date: sortOrder, createdAt: -1 });
    res.json({ count: items.length, items });
  } catch (error) {
    res.status(500).json({ message: "Could not retrieve items" });
  }
};

exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("reportedBy", "name email");
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ item });
  } catch (error) {
    res.status(400).json({ message: "Invalid item ID" });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (String(item.reportedBy) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can update only your own item" });
    }
    const allowed = ["title", "category", "description", "location", "date", "status"];
    allowed.forEach(key => { if (req.body[key] !== undefined) item[key] = req.body[key]; });
    if (req.body.type && ["lost", "found"].includes(req.body.type)) item.type = req.body.type;
    if (req.file) item.image = `/uploads/${req.file.filename}`;
    await item.save();
    res.json({ message: "Item updated", item });
  } catch (error) {
    res.status(400).json({ message: "Could not update item" });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (String(item.reportedBy) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "You can delete only your own item" });
    }
    await item.deleteOne();
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(400).json({ message: "Could not delete item" });
  }
};