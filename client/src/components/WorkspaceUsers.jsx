import { useState } from "react";
import RoleManagement from "./RoleManagement";

const WorkspaceUsers = ({
  workspace,
  members,
  onAddMember,
  onRoleChange,
  onRemove,
  onClose,
}) => {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("Viewer");
  const [error, setError] = useState("");

  const handleAdd = (event) => {
    event.preventDefault();

    if (!userId.trim()) {
      setError("Please enter the user's ID");
      return;
    }

    setError("");
    onAddMember({ workspace_id: workspace.id, user_id: userId, role });
    setUserId("");
    setRole("Viewer");
  };

  return (
    <div className="card p-3 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">
          Members of "{workspace.workspace_name}"
        </h5>
        <button className="btn btn-sm btn-secondary" onClick={onClose}>
          Close
        </button>
      </div>

      <form className="row g-2 align-items-end mb-3" onSubmit={handleAdd}>
        <div className="col-md-4">
          <label className="form-label">User ID</label>
          <input
            type="number"
            className="form-control"
            placeholder="e.g. 3"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Role</label>
          <select
            className="form-select"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="Admin">Admin</option>
            <option value="Analyst">Analyst</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>

        <div className="col-md-4">
          <button className="btn btn-primary w-100" type="submit">
            Add to Workspace
          </button>
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined Date</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">
                  No members yet
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id}>
                  <td>{member.full_name}</td>
                  <td>{member.email}</td>
                  <td>{member.joined_date?.slice(0, 10)}</td>
                  <td>
                    <RoleManagement
                      member={member}
                      onRoleChange={onRoleChange}
                      onRemove={onRemove}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkspaceUsers;
