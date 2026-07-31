const db = require("../config/db");

// ---------- Validation helpers ----------

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidContactNumber = (number) => {
  return /^[0-9+\-\s]{7,15}$/.test(number);
};

// ---------- Uniqueness checks ----------

const organizationNameExists = (name, excludeId, callback) => {
  let sql = "SELECT id FROM organizations WHERE organization_name = ?";
  const values = [name];

  if (excludeId) {
    sql += " AND id != ?";
    values.push(excludeId);
  }

  db.query(sql, values, (err, results) => {
    if (err) return callback(err);
    callback(null, results.length > 0);
  });
};

const workspaceNameExistsInOrg = (organizationId, name, excludeId, callback) => {
  let sql =
    "SELECT id FROM workspaces WHERE organization_id = ? AND workspace_name = ?";
  const values = [organizationId, name];

  if (excludeId) {
    sql += " AND id != ?";
    values.push(excludeId);
  }

  db.query(sql, values, (err, results) => {
    if (err) return callback(err);
    callback(null, results.length > 0);
  });
};

const workspaceUserExists = (workspaceId, userId, callback) => {
  const sql =
    "SELECT id FROM workspace_users WHERE workspace_id = ? AND user_id = ?";

  db.query(sql, [workspaceId, userId], (err, results) => {
    if (err) return callback(err);
    callback(null, results.length > 0);
  });
};

// ---------- Access / ownership checks ----------

// org creator check
const isOrganizationAdmin = (organizationId, userId, callback) => {
  const sql = "SELECT created_by FROM organizations WHERE id = ?";

  db.query(sql, [organizationId], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(null, false);
    callback(null, results[0].created_by === Number(userId));
  });
};

// access check
const canManageOrganization = (organizationId, req, callback) => {
  if (req.user.is_platform_admin) return callback(null, true);

  isOrganizationAdmin(organizationId, req.user.id, callback);
};

const getWorkspaceOrganizationId = (workspaceId, callback) => {
  const sql = "SELECT organization_id FROM workspaces WHERE id = ?";

  db.query(sql, [workspaceId], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(null, null);
    callback(null, results[0].organization_id);
  });
};

const canManageWorkspace = (workspaceId, req, callback) => {
  if (req.user.is_platform_admin) return callback(null, true);

  getWorkspaceOrganizationId(workspaceId, (err, organizationId) => {
    if (err) return callback(err);
    if (!organizationId) return callback(null, false);

    isOrganizationAdmin(organizationId, req.user.id, callback);
  });
};

module.exports = {
  isValidEmail,
  isValidContactNumber,
  organizationNameExists,
  workspaceNameExistsInOrg,
  workspaceUserExists,
  isOrganizationAdmin,
  canManageOrganization,
  canManageWorkspace,
  getWorkspaceOrganizationId,
};
