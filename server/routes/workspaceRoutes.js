const express = require("express");
const router = express.Router();

const {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceUser,
  updateWorkspaceUserRole,
  removeWorkspaceUser,
  getWorkspaceUsers,
  getDashboard,
} = require("../controllers/workspaceController");

const { verifyToken } = require("../middleware/authMiddleware");

// Workspace Management APIs
router.get("/dashboard", verifyToken, getDashboard);

router.post("/workspaces", verifyToken, createWorkspace);
router.get("/workspaces", verifyToken, getWorkspaces);
router.get("/workspaces/:id", verifyToken, getWorkspaceById);
router.put("/workspaces/:id", verifyToken, updateWorkspace);
router.delete("/workspaces/:id", verifyToken, deleteWorkspace);

// Workspace User (member & role) APIs
router.post("/workspaces/users", verifyToken, addWorkspaceUser);
router.put("/workspaces/users/:id", verifyToken, updateWorkspaceUserRole);
router.delete("/workspaces/users/:id", verifyToken, removeWorkspaceUser);
router.get("/workspaces/:id/users", verifyToken, getWorkspaceUsers);

module.exports = router;
