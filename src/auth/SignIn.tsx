import { useState } from "react";
import { useNavigate } from "react-router-dom";   // ✅ add this
import { useAuth } from "./AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();                 // ✅ add this

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("🔹 handleSubmit triggered");
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // if backend sets a cookie
      });

      const data = await response.json();
      console.log("✅ Parsed response data:", data);

      if (!response.ok) throw new Error(data.message || "Login failed.");

      if (data.token) {
        console.log("🔐 Token received, logging in...");
        auth.login(data.token);

        // ✅ Redirect based on user role
        const role = data.user?.role || data.role || "User";
        if (role === "Admin") navigate("/admin");
        else if (role === "Instructor") navigate("/instructor");
        else navigate("/");
      } else {
        throw new Error("No token received, authorization denied");
      }
    } catch (error: any) {
      console.error("🔥 Error during login:", error);
      setError(error.message);
    }
  };

  return (
    <div
      className="container d-flex align-items-center justify-content-center"
      style={{ minHeight: "80vh" }}
    >
      <div className="card shadow p-4" style={{ maxWidth: 400, width: "100%" }}>
        <h2 className="mb-4 text-center">Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                👁
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button type="submit" className="btn btn-primary w-100">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignIn;
