import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Header() {
  // Get everything we need from the AuthContext
  const { isLoggedIn, user, logout } = useAuth();
  console.log("Current User Object", user);
  return (
    <header className="navbar navbar-expand-lg bg-secondary p-3">
      <div className="container-fluid">
        {/* Left side - Logo/Title */}
        <Link className="navbar-brand text-white fw-bold" to="/">
          Safety Service Dashboard
        </Link>

        {/* Navbar toggle (for mobile view) */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Right side - Navigation Links */}
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav mb-2 mb-lg-0 align-items-center">
            {!isLoggedIn ? (
              // ### SHOW SIGN IN IF NOT LOGGED IN ###
              <li className="nav-item">
                <Link className="nav-link active text-white" to="/signin">
                  Sign In
                </Link>
              </li>
            ) : (
              // ### SHOW ROLE-BASED NAVIGATION IF LOGGED IN ###
              <>
                {/* Admin-Only Links */}
                {user?.role === "Admin" && (
                  <li className="nav-item">
                    {/* This is now a single link to the main admin dashboard */}
                    <NavLink className="nav-link" to="/admin">
                      Admin Dashboard
                    </NavLink>
                  </li>
                )}

                {/* Instructor-Only Links */}
                {user?.role === "Instructor" && (
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/instructor">
                      My Dashboard
                    </Link>
                  </li>
                )}

                {/* Welcome Message & Logout Button for all logged-in users */}
                <li className="nav-item ms-lg-3">
                  <span className="navbar-text text-white me-3">
                    Welcome, {user?.user_fname}!
                  </span>
                  <button className="btn btn-outline-light" onClick={logout}>
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </header>
  );
}

export default Header;
