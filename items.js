const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/auth");
const items = require("../controllers/itemController");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG, WEBP or GIF images are allowed"));
  }
});

router.get("/", items.getItems);
router.get("/:id", items.getItem);
router.post("/", protect, upload.single("image"), items.createItem);
router.put("/:id", protect, upload.single("image"), items.updateItem);
router.delete("/:id", protect, items.deleteItem);

module.exports = router;