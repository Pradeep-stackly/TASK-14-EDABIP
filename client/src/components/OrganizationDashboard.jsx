import RatingChart from "./RatingChart";

const OrganizationDashboard = ({ dashboard, loading }) => {
  const cards = dashboard?.cards || {};
  const organizationsByIndustry = dashboard?.organizationsByIndustry || [];
  const usersByRole = dashboard?.usersByRole || [];
  const workspacesPerMonth = dashboard?.workspacesPerMonth || [];

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-2">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <h4 className="mb-3">EDABIP Dashboard</h4>

      <div className="row">
        <div className="col-md-3 col-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6>Total Organizations</h6>
              <h3>{cards.totalOrganizations || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6>Active Organizations</h6>
              <h3>{cards.activeOrganizations || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6>Total Workspaces</h6>
              <h3>{cards.totalWorkspaces || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6>Active Users</h6>
              <h3>{cards.activeUsers || 0}</h3>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h6>Total Workspace Members</h6>
              <h3>{cards.totalWorkspaceMembers || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <RatingChart
            title="Organizations by Industry"
            type="pie"
            data={organizationsByIndustry}
            dataKey="count"
            nameKey="industry"
          />
        </div>

        <div className="col-lg-6 mb-4">
          <RatingChart
            title="Users by Role"
            type="bar"
            data={usersByRole}
            dataKey="count"
            nameKey="role"
            seriesName="Users"
          />
        </div>

        <div className="col-lg-6 mb-4">
          <RatingChart
            title="Workspaces Created per Month"
            type="line"
            data={workspacesPerMonth}
            dataKey="count"
            nameKey="month"
            seriesName="Workspaces"
          />
        </div>
      </div>
    </div>
  );
};

export default OrganizationDashboard;
