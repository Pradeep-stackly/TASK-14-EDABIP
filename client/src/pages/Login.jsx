import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { register } from "../services/api";

const Login = () => {
  const { login } = useAuth();

  const [mode, setMode] = useState("login"); // login | register

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await login(email, password);

    if (!result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await register({
        full_name: fullName,
        email,
        password,
      });

      setMessage(response.data.message);
      setMode("login");
      setPassword("");
    } catch (registerError) {
      setError(
        registerError.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    }

    setLoading(false);
  };

  return (
    <div className="app-bg min-vh-100 d-flex align-items-center justify-content-center">
      <div
        className="card shadow p-4"
        style={{ width: "100%", maxWidth: "420px" }}
      >
        <h3 className="text-center mb-3">EDABIP Login</h3>

        {error && <div className="alert alert-danger">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {mode === "login" ? (
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Enter email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="At least 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        <div className="mt-3 text-center">
          {mode === "login" ? (
            <button
              className="btn btn-link"
              onClick={() => {
                setMode("register");
                setError("");
                setMessage("");
              }}
            >
              New organization? Create an account
            </button>
          ) : (
            <button
              className="btn btn-link"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
            >
              Already have an account? Login
            </button>
          )}
        </div>

        <div className="mt-3 small text-muted">
          <p className="mb-0">Platform Admin: admin@edabip.com / Passw0rd!</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
