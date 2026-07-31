const db = require("../config/db");
const {
  isValidEmail,
  isValidContactNumber,
  organizationNameExists,
  canManageOrganization,
} = require("../services/workspaceService");

// Organization Management

const createOrganization = (req, res) => {
  const { organization_name, industry, company_size, email, contact_number } =
    req.body;

  if (!organization_name || !industry || !company_size || !email || !contact_number) {
    return res.status(400).json({
      message:
        "Organization name, industry, company size, email, and contact number are required",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Please enter a valid email address",
    });
  }

  if (!isValidContactNumber(contact_number)) {
    return res.status(400).json({
      message: "Please enter a valid contact number",
    });
  }

  organizationNameExists(organization_name, null, (checkErr, exists) => {
    if (checkErr) {
      console.error("Error checking organization name:", checkErr);
      return res.status(500).json({
        message: "Failed to create organization",
      });
    }

    if (exists) {
      return res.status(400).json({
        message: "An organization with this name already exists",
      });
    }

    const sql = `
      INSERT INTO organizations
      (organization_name, industry, company_size, email, contact_number, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sql,
      [organization_name, industry, company_size, email, contact_number, req.user.id],
      (err, result) => {
        if (err) {
          console.error("Error creating organization:", err);
          return res.status(500).json({
            message: "Failed to create organization",
            error: err.sqlMessage,
          });
        }

        res.status(201).json({
          message: "Organization created successfully",
          organizationId: result.insertId,
        });
      },
    );
  });
};

const getOrganizations = (req, res) => {
  const { search, status } = req.query;

  // scoped by role
  let sql = `
    SELECT DISTINCT o.*
    FROM organizations o
    LEFT JOIN workspaces w ON w.organization_id = o.id
    LEFT JOIN workspace_users wu ON wu.workspace_id = w.id
    WHERE 1 = 1
  `;
  const values = [];

  if (!req.user.is_platform_admin) {
    sql += ` AND (o.created_by = ? OR wu.user_id = ?)`;
    values.push(req.user.id, req.user.id);
  }

  if (search) {
    sql += ` AND o.organization_name LIKE ?`;
    values.push(`%${search}%`);
  }

  if (status) {
    sql += ` AND o.status = ?`;
    values.push(status);
  }

  sql += ` ORDER BY o.created_at DESC`;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching organizations:", err);
      return res.status(500).json({
        message: "Failed to fetch organizations",
      });
    }

    res.status(200).json(results);
  });
};

const getOrganizationById = (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM organizations WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error fetching organization:", err);
      return res.status(500).json({
        message: "Failed to fetch organization",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Organization not found",
      });
    }

    res.status(200).json(results[0]);
  });
};

const updateOrganization = (req, res) => {
  const { id } = req.params;
  const { organization_name, industry, company_size, email, contact_number, status } =
    req.body;

  if (email && !isValidEmail(email)) {
    return res.status(400).json({
      message: "Please enter a valid email address",
    });
  }

  if (contact_number && !isValidContactNumber(contact_number)) {
    return res.status(400).json({
      message: "Please enter a valid contact number",
    });
  }

  canManageOrganization(id, req, (accessErr, allowed) => {
    if (accessErr) {
      console.error("Error checking organization access:", accessErr);
      return res.status(500).json({
        message: "Failed to update organization",
      });
    }

    if (!allowed) {
      return res.status(403).json({
        message: "Only the organization admin can update this organization",
      });
    }

    const applyUpdate = () => {
      const sql = `
        UPDATE organizations
        SET
          organization_name = COALESCE(?, organization_name),
          industry = COALESCE(?, industry),
          company_size = COALESCE(?, company_size),
          email = COALESCE(?, email),
          contact_number = COALESCE(?, contact_number),
          status = COALESCE(?, status)
        WHERE id = ?
      `;

      db.query(
        sql,
        [organization_name, industry, company_size, email, contact_number, status, id],
        (err) => {
          if (err) {
            console.error("Error updating organization:", err);
            return res.status(500).json({
              message: "Failed to update organization",
            });
          }

          res.status(200).json({
            message: "Organization updated successfully",
          });
        },
      );
    };

    if (!organization_name) return applyUpdate();

    organizationNameExists(organization_name, id, (checkErr, exists) => {
      if (checkErr) {
        console.error("Error checking organization name:", checkErr);
        return res.status(500).json({
          message: "Failed to update organization",
        });
      }

      if (exists) {
        return res.status(400).json({
          message: "An organization with this name already exists",
        });
      }

      applyUpdate();
    });
  });
};

const deleteOrganization = (req, res) => {
  const { id } = req.params;

  canManageOrganization(id, req, (accessErr, allowed) => {
    if (accessErr) {
      console.error("Error checking organization access:", accessErr);
      return res.status(500).json({
        message: "Failed to delete organization",
      });
    }

    if (!allowed) {
      return res.status(403).json({
        message: "Only the organization admin can delete this organization",
      });
    }

    // cascades to workspaces
    db.query("DELETE FROM organizations WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("Error deleting organization:", err);
        return res.status(500).json({
          message: "Failed to delete organization",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Organization not found",
        });
      }

      res.status(200).json({
        message: "Organization deleted successfully",
      });
    });
  });
};

module.exports = {
  createOrganization,
  getOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
};
