const express = require("express");
const router = express.Router();

const {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
} = require("../controllers/organizationController");

const { verifyToken } = require("../middleware/authMiddleware");

// Organization Management APIs
router.post("/organizations", verifyToken, createOrganization);
router.get("/organizations", verifyToken, getOrganizations);
router.get("/organizations/:id", verifyToken, getOrganizationById);
router.put("/organizations/:id", verifyToken, updateOrganization);
router.delete("/organizations/:id", verifyToken, deleteOrganization);

module.exports = router;
