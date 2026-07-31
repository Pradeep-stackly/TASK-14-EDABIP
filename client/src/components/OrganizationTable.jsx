// organizations list
const statusBadgeClass = {
  Active: "bg-success",
  Inactive: "bg-secondary",
};

const OrganizationTable = ({
  organizations,
  onEdit,
  onDelete,
  onViewWorkspaces,
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
            placeholder="Search organization name"
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
              <th>Organization</th>
              <th>Industry</th>
              <th>Company Size</th>
              <th>Email</th>
              <th>Contact Number</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {organizations.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center">
                  No organizations found
                </td>
              </tr>
            ) : (
              organizations.map((org) => (
                <tr key={org.id}>
                  <td>{org.organization_name}</td>
                  <td>{org.industry}</td>
                  <td>{org.company_size}</td>
                  <td>{org.email}</td>
                  <td>{org.contact_number}</td>
                  <td>
                    <span
                      className={`badge ${statusBadgeClass[org.status] || "bg-secondary"}`}
                    >
                      {org.status}
                    </span>
                  </td>

                  <td>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => onViewWorkspaces(org)}
                      >
                        Workspaces
                      </button>

                      <button
                        className="btn btn-sm btn-warning"
                        onClick={() => onEdit(org)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => onDelete(org.id)}
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

export default OrganizationTable;
