const statusBadgeClass = {
  Active: "bg-success",
  Inactive: "bg-secondary",
};

const WorkspaceTable = ({
  workspaces,
  onEdit,
  onDelete,
  onViewMembers,
  searchText,
  setSearchText,
  statusFilter,
  setStatusFilter,
}) => {
  return (
    <div className="card p-3 mb-4">
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search workspace name"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>

        <div className="col-md-6">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Workspace</th>
              <th>Organization</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {workspaces.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center">
                  No workspaces found
                </td>
              </tr>
            ) : (
              workspaces.map((workspace) => (
                <tr key={workspace.id}>
                  <td>{workspace.workspace_name}</td>
                  <td>{workspace.organization_name}</td>
                  <td>{workspace.description || "-"}</td>
                  <td>
                    <span
                      className={`badge ${statusBadgeClass[workspace.status] || "bg-secondary"}`}
                    >
                      {workspace.status}
                    </span>
                  </td>

                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => onViewMembers(workspace)}
                      >
                        Members
                      </button>

                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => onEdit(workspace)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => onDelete(workspace.id)}
                      >
                        Delete
                      </button>
                    </div>
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

export default WorkspaceTable;
