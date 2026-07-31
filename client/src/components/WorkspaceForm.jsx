import { useEffect, useState } from "react";

const initialForm = {
  organization_id: "",
  workspace_name: "",
  description: "",
  status: "Active",
};

const WorkspaceForm = ({
  organizations,
  onSubmit,
  editingWorkspace,
  onCancel,
  defaultOrganizationId,
}) => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingWorkspace) {
      setFormData({
        organization_id: editingWorkspace.organization_id || "",
        workspace_name: editingWorkspace.workspace_name || "",
        description: editingWorkspace.description || "",
        status: editingWorkspace.status || "Active",
      });
    } else {
      setFormData({
        ...initialForm,
        organization_id: defaultOrganizationId || "",
      });
    }
    setErrors({});
  }, [editingWorkspace, defaultOrganizationId]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_id)
      newErrors.organization_id = "Organization is required";

    if (!formData.workspace_name.trim())
      newErrors.workspace_name = "Workspace name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (validateForm()) {
      onSubmit(formData);

      if (!editingWorkspace) {
        setFormData({ ...initialForm, organization_id: defaultOrganizationId || "" });
      }

      setErrors({});
    }
  };

  return (
    <div className="card p-3 mb-4">
      <h5>{editingWorkspace ? "Edit Workspace" : "Create Workspace"}</h5>

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Organization</label>
            <select
              name="organization_id"
              className="form-select"
              value={formData.organization_id}
              onChange={handleChange}
              disabled={!!editingWorkspace}
            >
              <option value="">Select organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.organization_name}
                </option>
              ))}
            </select>
            {errors.organization_id && (
              <small className="text-danger">{errors.organization_id}</small>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">Workspace Name</label>
            <input
              type="text"
              name="workspace_name"
              className="form-control"
              value={formData.workspace_name}
              onChange={handleChange}
            />
            {errors.workspace_name && (
              <small className="text-danger">{errors.workspace_name}</small>
            )}
          </div>

          <div className="col-md-12">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control"
              rows={2}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {editingWorkspace && (
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}
        </div>

        <div className="mt-3 d-flex gap-2">
          <button className="btn btn-primary" type="submit">
            {editingWorkspace ? "Update Workspace" : "Create Workspace"}
          </button>

          {editingWorkspace && (
            <button className="btn btn-secondary" type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default WorkspaceForm;
