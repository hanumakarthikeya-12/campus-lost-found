const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");
const claims = require("../controllers/claimController");

router.post("/:itemId", protect, claims.createClaim);
router.get("/mine/list", protect, claims.myClaims);
router.get("/admin/all", protect, adminOnly, claims.allClaims);
router.patch("/:id/review", protect, claims.reviewClaim);

module.exports = router;