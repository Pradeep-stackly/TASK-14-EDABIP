// role dropdown + remove
const RoleManagement = ({ member, onRoleChange, onRemove }) => {
  return (
    <div className="d-flex align-items-center gap-2">
      <select
        className="form-select form-select-sm"
        style={{ width: "auto" }}
        value={member.role}
        onChange={(event) => onRoleChange(member.id, event.target.value)}
      >
        <option value="Admin">Admin</option>
        <option value="Analyst">Analyst</option>
        <option value="Viewer">Viewer</option>
      </select>

      <button
        className="btn btn-sm btn-outline-danger"
        onClick={() => onRemove(member.id)}
      >
        Remove
      </button>
    </div>
  );
};

export default RoleManagement;
