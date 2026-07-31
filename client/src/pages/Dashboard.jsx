import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

import OrganizationForm from "../components/OrganizationForm";
import OrganizationTable from "../components/OrganizationTable";
import WorkspaceForm from "../components/WorkspaceForm";
import WorkspaceTable from "../components/WorkspaceTable";
import WorkspaceUsers from "../components/WorkspaceUsers";
import OrganizationDashboard from "../components/OrganizationDashboard";

import {
  getOrganizations,
  addOrganization,
  updateOrganization,
  deleteOrganization,
  getWorkspaces,
  addWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getWorkspaceUsers,
  addWorkspaceUser,
  updateWorkspaceUserRole,
  removeWorkspaceUser,
  getDashboard,
} from "../services/api";

const Dashboard = () => {
  const { token, user, logout } = useAuth();

  const [activeSection, setActiveSection] = useState("overview");

  // Organizations
  const [organizations, setOrganizations] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState("");
  const [orgMessage, setOrgMessage] = useState("");
  const [editingOrganization, setEditingOrganization] = useState(null);
  const [showOrgForm, setShowOrgForm] = useState(false);
  const [orgSearchText, setOrgSearchText] = useState("");
  const [orgStatusFilter, setOrgStatusFilter] = useState("");

  // Workspaces
  const [workspaces, setWorkspaces] = useState([]);
  const [workspacesLoading, setWorkspacesLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState("");
  const [workspaceMessage, setWorkspaceMessage] = useState("");
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [workspaceSearchText, setWorkspaceSearchText] = useState("");
  const [workspaceStatusFilter, setWorkspaceStatusFilter] = useState("");
  const [filterOrgId, setFilterOrgId] = useState(null);

  // Workspace members
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Dashboard
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // ---------- Organizations ----------

  const loadOrganizations = async () => {
    setOrgLoading(true);
    setOrgError("");

    try {
      const params = {};
      if (orgSearchText) params.search = orgSearchText;
      if (orgStatusFilter) params.status = orgStatusFilter;

      const response = await getOrganizations(token, params);
      setOrganizations(response.data);
    } catch (error) {
      setOrgError(
        error.response?.data?.message || "Failed to load organizations",
      );
    }

    setOrgLoading(false);
  };

  useEffect(() => {
    if (activeSection === "organizations") loadOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, orgSearchText, orgStatusFilter]);

  const handleOrgSubmit = async (formData) => {
    setOrgError("");
    setOrgMessage("");

    try {
      if (editingOrganization) {
        await updateOrganization(editingOrganization.id, formData, token);
        setOrgMessage("Organization updated successfully");
      } else {
        await addOrganization(formData, token);
        setOrgMessage("Organization created successfully");
      }

      setEditingOrganization(null);
      setShowOrgForm(false);
      loadOrganizations();
    } catch (error) {
      setOrgError(
        error.response?.data?.message || "Failed to save organization",
      );
    }
  };

  const handleOrgDelete = async (id) => {
    if (!window.confirm("Delete this organization and all its workspaces?"))
      return;

    try {
      await deleteOrganization(id, token);
      loadOrganizations();
    } catch (error) {
      setOrgError(
        error.response?.data?.message || "Failed to delete organization",
      );
    }
  };

  const handleViewWorkspaces = (org) => {
    setFilterOrgId(org.id);
    setActiveSection("workspaces");
  };

  // ---------- Workspaces ----------

  const loadWorkspaces = async () => {
    setWorkspacesLoading(true);
    setWorkspaceError("");

    try {
      const params = {};
      if (filterOrgId) params.organization_id = filterOrgId;
      if (workspaceSearchText) params.search = workspaceSearchText;
      if (workspaceStatusFilter) params.status = workspaceStatusFilter;

      const response = await getWorkspaces(token, params);
      setWorkspaces(response.data);
    } catch (error) {
      setWorkspaceError(
        error.response?.data?.message || "Failed to load workspaces",
      );
    }

    setWorkspacesLoading(false);
  };

  useEffect(() => {
    if (activeSection === "workspaces") {
      loadWorkspaces();
      if (organizations.length === 0) loadOrganizations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, filterOrgId, workspaceSearchText, workspaceStatusFilter]);

  const handleWorkspaceSubmit = async (formData) => {
    setWorkspaceError("");
    setWorkspaceMessage("");

    try {
      if (editingWorkspace) {
        await updateWorkspace(editingWorkspace.id, formData, token);
        setWorkspaceMessage("Workspace updated successfully");
      } else {
        await addWorkspace(formData, token);
        setWorkspaceMessage("Workspace created successfully");
      }

      setEditingWorkspace(null);
      setShowWorkspaceForm(false);
      loadWorkspaces();
    } catch (error) {
      setWorkspaceError(
        error.response?.data?.message || "Failed to save workspace",
      );
    }
  };

  const handleWorkspaceDelete = async (id) => {
    if (!window.confirm("Delete this workspace?")) return;

    try {
      await deleteWorkspace(id, token);
      loadWorkspaces();
    } catch (error) {
      setWorkspaceError(
        error.response?.data?.message || "Failed to delete workspace",
      );
    }
  };

  // ---------- Workspace members ----------

  const loadMembers = async (workspace) => {
    setSelectedWorkspace(workspace);
    setMembersLoading(true);

    try {
      const response = await getWorkspaceUsers(workspace.id, token);
      setMembers(response.data);
    } catch (error) {
      setWorkspaceError(
        error.response?.data?.message || "Failed to load workspace members",
      );
    }

    setMembersLoading(false);
  };

  const handleAddMember = async (data) => {
    try {
      await addWorkspaceUser(data, token);
      loadMembers(selectedWorkspace);
    } catch (error) {
      setWorkspaceError(
        error.response?.data?.message || "Failed to add member",
      );
    }
  };

  const handleRoleChange = async (workspaceUserId, role) => {
    try {
      await updateWorkspaceUserRole(workspaceUserId, role, token);
      loadMembers(selectedWorkspace);
    } catch (error) {
      setWorkspaceError(
        error.response?.data?.message || "Failed to update role",
      );
    }
  };

  const handleRemoveMember = async (workspaceUserId) => {
    if (!window.confirm("Remove this member from the workspace?")) return;

    try {
      await removeWorkspaceUser(workspaceUserId, token);
      loadMembers(selectedWorkspace);
    } catch (error) {
      setWorkspaceError(
        error.response?.data?.message || "Failed to remove member",
      );
    }
  };

  // ---------- Dashboard ----------

  const loadDashboard = async () => {
    setDashboardLoading(true);

    try {
      const response = await getDashboard(token);
      setDashboard(response.data);
    } catch {
      // ignore, leave blank
    }

    setDashboardLoading(false);
  };

  useEffect(() => {
    if (activeSection === "overview") loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  return (
    <div className="container-fluid p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">EDABIP - Organization & Workspace Management</h4>
        <div>
          <span className="me-3">
            {user?.full_name}
            {user?.is_platform_admin ? " (Platform Admin)" : ""}
          </span>
          <button className="btn btn-outline-danger btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <ul className="nav nav-tabs mb-3">
        {["overview", "organizations", "workspaces"].map((section) => (
          <li className="nav-item" key={section}>
            <button
              className={`nav-link ${activeSection === section ? "active" : ""}`}
              onClick={() => setActiveSection(section)}
            >
              {section === "overview"
                ? "Dashboard"
                : section === "organizations"
                  ? "Organizations"
                  : "Workspaces"}
            </button>
          </li>
        ))}
      </ul>

      {activeSection === "overview" && (
        <OrganizationDashboard dashboard={dashboard} loading={dashboardLoading} />
      )}

      {activeSection === "organizations" && (
        <>
          {orgError && <div className="alert alert-danger">{orgError}</div>}
          {orgMessage && <div className="alert alert-success">{orgMessage}</div>}

          <button
            className="btn btn-primary mb-3"
            onClick={() => {
              setEditingOrganization(null);
              setShowOrgForm(!showOrgForm);
            }}
          >
            {showOrgForm ? "Hide Form" : "+ New Organization"}
          </button>

          {(showOrgForm || editingOrganization) && (
            <OrganizationForm
              onSubmit={handleOrgSubmit}
              editingOrganization={editingOrganization}
              onCancel={() => {
                setEditingOrganization(null);
                setShowOrgForm(false);
              }}
            />
          )}

          {orgLoading ? (
            <p>Loading organizations...</p>
          ) : (
            <OrganizationTable
              organizations={organizations}
              onEdit={(org) => {
                setEditingOrganization(org);
                setShowOrgForm(true);
              }}
              onDelete={handleOrgDelete}
              onViewWorkspaces={handleViewWorkspaces}
              searchText={orgSearchText}
              setSearchText={setOrgSearchText}
              statusFilter={orgStatusFilter}
              setStatusFilter={setOrgStatusFilter}
            />
          )}
        </>
      )}

      {activeSection === "workspaces" && (
        <>
          {workspaceError && (
            <div className="alert alert-danger">{workspaceError}</div>
          )}
          {workspaceMessage && (
            <div className="alert alert-success">{workspaceMessage}</div>
          )}

          {filterOrgId && (
            <div className="mb-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setFilterOrgId(null)}
              >
                Clear organization filter
              </button>
            </div>
          )}

          <button
            className="btn btn-primary mb-3"
            onClick={() => {
              setEditingWorkspace(null);
              setShowWorkspaceForm(!showWorkspaceForm);
            }}
          >
            {showWorkspaceForm ? "Hide Form" : "+ New Workspace"}
          </button>

          {(showWorkspaceForm || editingWorkspace) && (
            <WorkspaceForm
              organizations={organizations}
              onSubmit={handleWorkspaceSubmit}
              editingWorkspace={editingWorkspace}
              defaultOrganizationId={filterOrgId}
              onCancel={() => {
                setEditingWorkspace(null);
                setShowWorkspaceForm(false);
              }}
            />
          )}

          {selectedWorkspace && (
            <WorkspaceUsers
              workspace={selectedWorkspace}
              members={membersLoading ? [] : members}
              onAddMember={handleAddMember}
              onRoleChange={handleRoleChange}
              onRemove={handleRemoveMember}
              onClose={() => setSelectedWorkspace(null)}
            />
          )}

          {workspacesLoading ? (
            <p>Loading workspaces...</p>
          ) : (
            <WorkspaceTable
              workspaces={workspaces}
              onEdit={(workspace) => {
                setEditingWorkspace(workspace);
                setShowWorkspaceForm(true);
              }}
              onDelete={handleWorkspaceDelete}
              onViewMembers={loadMembers}
              searchText={workspaceSearchText}
              setSearchText={setWorkspaceSearchText}
              statusFilter={workspaceStatusFilter}
              setStatusFilter={setWorkspaceStatusFilter}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
