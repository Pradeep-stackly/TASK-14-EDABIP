import { useEffect, useState } from "react";

const initialForm = {
  organization_name: "",
  industry: "",
  company_size: "",
  email: "",
  contact_number: "",
  status: "Active",
};

const OrganizationForm = ({ onSubmit, editingOrganization, onCancel }) => {
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingOrganization) {
      setFormData({
        organization_name: editingOrganization.organization_name || "",
        industry: editingOrganization.industry || "",
        company_size: editingOrganization.company_size || "",
        email: editingOrganization.email || "",
        contact_number: editingOrganization.contact_number || "",
        status: editingOrganization.status || "Active",
      });
    } else {
      setFormData(initialForm);
    }
    setErrors({});
  }, [editingOrganization]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organization_name.trim())
      newErrors.organization_name = "Organization name is required";

    if (!formData.industry.trim())
      newErrors.industry = "Industry is required";

    if (!formData.company_size.trim())
      newErrors.company_size = "Company size is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = "Contact number is required";
    } else if (!/^[0-9+\-\s]{7,15}$/.test(formData.contact_number)) {
      newErrors.contact_number = "Please enter a valid contact number";
    }

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

      if (!editingOrganization) {
        setFormData(initialForm);
      }

      setErrors({});
    }
  };

  return (
    <div className="card p-3 mb-4">
      <h5>{editingOrganization ? "Edit Organization" : "Create Organization"}</h5>

      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Organization Name</label>
            <input
              type="text"
              name="organization_name"
              className="form-control"
              value={formData.organization_name}
              onChange={handleChange}
            />
            {errors.organization_name && (
              <small className="text-danger">{errors.organization_name}</small>
            )}
          </div>

          <div className="col-md-6">
            <label className="form-label">Industry</label>
            <input
              type="text"
              name="industry"
              className="form-control"
              placeholder="e.g. Information Technology"
              value={formData.industry}
              onChange={handleChange}
            />
            {errors.industry && (
              <small className="text-danger">{errors.industry}</small>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label">Company Size</label>
            <select
              name="company_size"
              className="form-select"
              value={formData.company_size}
              onChange={handleChange}
            >
              <option value="">Select size</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="500+">500+</option>
            </select>
            {errors.company_size && (
              <small className="text-danger">{errors.company_size}</small>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <small className="text-danger">{errors.email}</small>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label">Contact Number</label>
            <input
              type="text"
              name="contact_number"
              className="form-control"
              value={formData.contact_number}
              onChange={handleChange}
            />
            {errors.contact_number && (
              <small className="text-danger">{errors.contact_number}</small>
            )}
          </div>

          {editingOrganization && (
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
            {editingOrganization ? "Update Organization" : "Create Organization"}
          </button>

          {editingOrganization && (
            <button className="btn btn-secondary" type="button" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default OrganizationForm;
