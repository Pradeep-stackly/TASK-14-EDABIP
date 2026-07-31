const db = require("../config/db");
const {
  workspaceNameExistsInOrg,
  workspaceUserExists,
  canManageOrganization,
  canManageWorkspace,
  getWorkspaceOrganizationId,
} = require("../services/workspaceService");

// Workspace Management

const createWorkspace = (req, res) => {
  const { organization_id, workspace_name, description } = req.body;

  if (!organization_id || !workspace_name) {
    return res.status(400).json({
      message: "Organization and workspace name are required",
    });
  }

  // admin only
  canManageOrganization(organization_id, req, (accessErr, allowed) => {
    if (accessErr) {
      console.error("Error checking organization access:", accessErr);
      return res.status(500).json({
        message: "Failed to create workspace",
      });
    }

    if (!allowed) {
      return res.status(403).json({
        message: "Only the organization admin can create workspaces",
      });
    }

    workspaceNameExistsInOrg(organization_id, workspace_name, null, (checkErr, exists) => {
      if (checkErr) {
        console.error("Error checking workspace name:", checkErr);
        return res.status(500).json({
          message: "Failed to create workspace",
        });
      }

      if (exists) {
        return res.status(400).json({
          message: "A workspace with this name already exists in this organization",
        });
      }

      const sql = `
        INSERT INTO workspaces (organization_id, workspace_name, description)
        VALUES (?, ?, ?)
      `;

      db.query(sql, [organization_id, workspace_name, description || null], (err, result) => {
        if (err) {
          console.error("Error creating workspace:", err);
          return res.status(500).json({
            message: "Failed to create workspace",
            error: err.sqlMessage,
          });
        }

        res.status(201).json({
          message: "Workspace created successfully",
          workspaceId: result.insertId,
        });
      });
    });
  });
};

const getWorkspaces = (req, res) => {
  const { organization_id, search, status } = req.query;

  let sql = `
    SELECT DISTINCT w.*, o.organization_name
    FROM workspaces w
    JOIN organizations o ON w.organization_id = o.id
    LEFT JOIN workspace_users wu ON wu.workspace_id = w.id
    WHERE 1 = 1
  `;
  const values = [];

  if (!req.user.is_platform_admin) {
    sql += ` AND (o.created_by = ? OR wu.user_id = ?)`;
    values.push(req.user.id, req.user.id);
  }

  if (organization_id) {
    sql += ` AND w.organization_id = ?`;
    values.push(organization_id);
  }

  if (search) {
    sql += ` AND w.workspace_name LIKE ?`;
    values.push(`%${search}%`);
  }

  if (status) {
    sql += ` AND w.status = ?`;
    values.push(status);
  }

  sql += ` ORDER BY w.created_at DESC`;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error fetching workspaces:", err);
      return res.status(500).json({
        message: "Failed to fetch workspaces",
      });
    }

    res.status(200).json(results);
  });
};

const getWorkspaceById = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT w.*, o.organization_name
    FROM workspaces w
    JOIN organizations o ON w.organization_id = o.id
    WHERE w.id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching workspace:", err);
      return res.status(500).json({
        message: "Failed to fetch workspace",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    res.status(200).json(results[0]);
  });
};

const updateWorkspace = (req, res) => {
  const { id } = req.params;
  const { workspace_name, description, status } = req.body;

  canManageWorkspace(id, req, (accessErr, allowed) => {
    if (accessErr) {
      console.error("Error checking workspace access:", accessErr);
      return res.status(500).json({
        message: "Failed to update workspace",
      });
    }

    if (!allowed) {
      return res.status(403).json({
        message: "Only the organization admin can update this workspace",
      });
    }

    const applyUpdate = () => {
      const sql = `
        UPDATE workspaces
        SET
          workspace_name = COALESCE(?, workspace_name),
          description = COALESCE(?, description),
          status = COALESCE(?, status)
        WHERE id = ?
      `;

      db.query(sql, [workspace_name, description, status, id], (err) => {
        if (err) {
          console.error("Error updating workspace:", err);
          return res.status(500).json({
            message: "Failed to update workspace",
          });
        }

        res.status(200).json({
          message: "Workspace updated successfully",
        });
      });
    };

    if (!workspace_name) return applyUpdate();

    getWorkspaceOrganizationId(id, (orgErr, organizationId) => {
      if (orgErr) {
        console.error("Error fetching workspace organization:", orgErr);
        return res.status(500).json({
          message: "Failed to update workspace",
        });
      }

      workspaceNameExistsInOrg(organizationId, workspace_name, id, (checkErr, exists) => {
        if (checkErr) {
          console.error("Error checking workspace name:", checkErr);
          return res.status(500).json({
            message: "Failed to update workspace",
          });
        }

        if (exists) {
          return res.status(400).json({
            message: "A workspace with this name already exists in this organization",
          });
        }

        applyUpdate();
      });
    });
  });
};

const deleteWorkspace = (req, res) => {
  const { id } = req.params;

  canManageWorkspace(id, req, (accessErr, allowed) => {
    if (accessErr) {
      console.error("Error checking workspace access:", accessErr);
      return res.status(500).json({
        message: "Failed to delete workspace",
      });
    }

    if (!allowed) {
      return res.status(403).json({
        message: "Only the organization admin can delete this workspace",
      });
    }

    // cascades to members
    db.query("DELETE FROM workspaces WHERE id = ?", [id], (err, result) => {
      if (err) {
        console.error("Error deleting workspace:", err);
        return res.status(500).json({
          message: "Failed to delete workspace",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Workspace not found",
        });
      }

      res.status(200).json({
        message: "Workspace deleted successfully",
      });
    });
  });
};

// ---------- Workspace Users (members & roles) ----------

const addWorkspaceUser = (req, res) => {
  const { workspace_id, user_id, role } = req.body;

  if (!workspace_id || !user_id) {
    return res.status(400).json({
      message: "Workspace and user are required",
    });
  }

  canManageWorkspace(workspace_id, req, (accessErr, allowed) => {
    if (accessErr) {
      console.error("Error checking workspace access:", accessErr);
      return res.status(500).json({
        message: "Failed to add user to workspace",
      });
    }

    if (!allowed) {
      return res.status(403).json({
        message: "Only the organization admin can add users to this workspace",
      });
    }

    workspaceUserExists(workspace_id, user_id, (checkErr, exists) => {
      if (checkErr) {
        console.error("Error checking workspace membership:", checkErr);
        return res.status(500).json({
          message: "Failed to add user to workspace",
        });
      }

      if (exists) {
        return res.status(400).json({
          message: "This user is already a member of this workspace",
        });
      }

      const sql = `
        INSERT INTO workspace_users (workspace_id, user_id, role)
        VALUES (?, ?, ?)
      `;

      db.query(sql, [workspace_id, user_id, role || "Viewer"], (err, result) => {
        if (err) {
          console.error("Error adding user to workspace:", err);
          return res.status(500).json({
            message: "Failed to add user to workspace",
            error: err.sqlMessage,
          });
        }

        res.status(201).json({
          message: "User added to workspace successfully",
          workspaceUserId: result.insertId,
        });
      });
    });
  });
};

const updateWorkspaceUserRole = (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({
      message: "Role is required",
    });
  }

  const sql = "SELECT workspace_id FROM workspace_users WHERE id = ?";

  db.query(sql, [id], (fetchErr, results) => {
    if (fetchErr) {
      console.error("Error fetching workspace member:", fetchErr);
      return res.status(500).json({
        message: "Failed to update role",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Workspace member not found",
      });
    }

    canManageWorkspace(results[0].workspace_id, req, (accessErr, allowed) => {
      if (accessErr) {
        console.error("Error checking workspace access:", accessErr);
        return res.status(500).json({
          message: "Failed to update role",
        });
      }

      if (!allowed) {
        return res.status(403).json({
          message: "Only the organization admin can change member roles",
        });
      }

      db.query(
        "UPDATE workspace_users SET role = ? WHERE id = ?",
        [role, id],
        (updateErr) => {
          if (updateErr) {
            console.error("Error updating role:", updateErr);
            return res.status(500).json({
              message: "Failed to update role",
            });
          }

          res.status(200).json({
            message: "Member role updated successfully",
          });
        },
      );
    });
  });
};

const removeWorkspaceUser = (req, res) => {
  const { id } = req.params;

  const sql = "SELECT workspace_id FROM workspace_users WHERE id = ?";

  db.query(sql, [id], (fetchErr, results) => {
    if (fetchErr) {
      console.error("Error fetching workspace member:", fetchErr);
      return res.status(500).json({
        message: "Failed to remove member",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Workspace member not found",
      });
    }

    canManageWorkspace(results[0].workspace_id, req, (accessErr, allowed) => {
      if (accessErr) {
        console.error("Error checking workspace access:", accessErr);
        return res.status(500).json({
          message: "Failed to remove member",
        });
      }

      if (!allowed) {
        return res.status(403).json({
          message: "Only the organization admin can remove members",
        });
      }

      db.query("DELETE FROM workspace_users WHERE id = ?", [id], (deleteErr) => {
        if (deleteErr) {
          console.error("Error removing member:", deleteErr);
          return res.status(500).json({
            message: "Failed to remove member",
          });
        }

        res.status(200).json({
          message: "Member removed from workspace successfully",
        });
      });
    });
  });
};

const getWorkspaceUsers = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT wu.id, wu.workspace_id, wu.role, wu.joined_date,
           u.id AS user_id, u.full_name, u.email
    FROM workspace_users wu
    JOIN users u ON wu.user_id = u.id
    WHERE wu.workspace_id = ?
    ORDER BY wu.joined_date DESC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching workspace members:", err);
      return res.status(500).json({
        message: "Failed to fetch workspace members",
      });
    }

    res.status(200).json(results);
  });
};

// ---------- Dashboard ----------

const getDashboard = (req, res) => {
  const scopeClause = req.user.is_platform_admin
    ? ""
    : "WHERE o.created_by = :userId";

  const cardsSql = `
    SELECT
      (SELECT COUNT(*) FROM organizations o ${scopeClause}) AS totalOrganizations,
      (SELECT COUNT(*) FROM organizations o ${scopeClause ? scopeClause + " AND o.status = 'Active'" : "WHERE o.status = 'Active'"}) AS activeOrganizations,
      (SELECT COUNT(*) FROM workspaces w JOIN organizations o ON w.organization_id = o.id ${scopeClause}) AS totalWorkspaces,
      (SELECT COUNT(DISTINCT u.id) FROM users u) AS activeUsers,
      (SELECT COUNT(*) FROM workspace_users wu
        JOIN workspaces w ON wu.workspace_id = w.id
        JOIN organizations o ON w.organization_id = o.id
        ${scopeClause}
      ) AS totalWorkspaceMembers
  `;

  const industrySql = `
    SELECT o.industry, COUNT(*) AS count
    FROM organizations o
    ${scopeClause}
    GROUP BY o.industry
  `;

  const roleSql = `
    SELECT wu.role, COUNT(*) AS count
    FROM workspace_users wu
    JOIN workspaces w ON wu.workspace_id = w.id
    JOIN organizations o ON w.organization_id = o.id
    ${scopeClause}
    GROUP BY wu.role
  `;

  const monthlySql = `
    SELECT DATE_FORMAT(w.created_at, '%Y-%m') AS month, COUNT(*) AS count
    FROM workspaces w
    JOIN organizations o ON w.organization_id = o.id
    ${scopeClause}
    GROUP BY month
    ORDER BY month
  `;

  // swap in user id
  const userId = req.user.id;
  const withUserId = (sql) => sql.replace(/:userId/g, db.escape(userId));

  db.query(withUserId(cardsSql), (err, cardResults) => {
    if (err) {
      console.error("Error fetching dashboard cards:", err);
      return res.status(500).json({
        message: "Failed to fetch dashboard",
      });
    }

    db.query(withUserId(industrySql), (industryErr, organizationsByIndustry) => {
      if (industryErr) {
        console.error("Error fetching industry breakdown:", industryErr);
        return res.status(500).json({
          message: "Failed to fetch dashboard",
        });
      }

      db.query(withUserId(roleSql), (roleErr, usersByRole) => {
        if (roleErr) {
          console.error("Error fetching role breakdown:", roleErr);
          return res.status(500).json({
            message: "Failed to fetch dashboard",
          });
        }

        db.query(withUserId(monthlySql), (monthErr, workspacesPerMonth) => {
          if (monthErr) {
            console.error("Error fetching monthly workspace count:", monthErr);
            return res.status(500).json({
              message: "Failed to fetch dashboard",
            });
          }

          res.status(200).json({
            cards: cardResults[0],
            organizationsByIndustry,
            usersByRole,
            workspacesPerMonth,
          });
        });
      });
    });
  });
};

module.exports = {
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
};
