const express = require("express");
const router = express.Router();

const { getDonationHistory, downloadCertificate } = require("../controllers/certificate.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/history", protect, authorizeRoles("donor"), getDonationHistory);
router.get("/download", protect, authorizeRoles("donor"), downloadCertificate);

module.exports = router;