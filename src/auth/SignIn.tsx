import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function SignIn() {
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }), // matches backend
        credentials: "include", // important to receive the cookie
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
      }

      // ✅ Call login() from AuthContext to update state and localStorage
      login(data.user); // Pass the user data received from the backend
      const userRole = data.user.role;
      // ✅ Redirect to protected route
      if (userRole === "Admin") {
        navigate("/admin"); // Or your main admin dashboard route
      } else if (userRole === "Instructor") {
        navigate("/instructor");
      } else {
        // Fallback for any other roles or unexpected cases
        navigate("/");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
      console.error(err);
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
            <label htmlFor="username" className="form-label">
              Email
            </label>
            <input
              id="username"
              type="text"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>
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
                {/* This is a simple SVG for an eye icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.816 1.221-2.25 2.16-3.725 2.766C9.99 11.224 8.24 11.5 6.5 11.5c-1.739 0-3.322-.26-4.649-.717C.979 10.333.345 9.358.173 9.043a.5.5 0 0 1 0-.086z" />
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                </svg>
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
