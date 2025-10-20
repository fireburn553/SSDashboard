import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Header() {
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-secondary p-3">
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
                <NavLink className="nav-link text-white" to="/signin">
                  Sign In
                </NavLink>
              </li>
            ) : (
              // ### SHOW ROLE-BASED NAVIGATION IF LOGGED IN ###
              <>
                {/* Admin-Only Links */}
                {user?.role === "Admin" && (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link text-white" to="/admin">
                        Dashboard
                      </NavLink>
                    </li>
                    {/* Admin Management Dropdown */}
                    <li className="nav-item dropdown">
                      <a
                        className="nav-link dropdown-toggle text-white"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        Manage
                      </a>
                      <ul className="dropdown-menu dropdown-menu-end">
                        <li>
                          <NavLink
                            className="dropdown-item"
                            to="/admin/manage-classes"
                          >
                            Trainings Conducted
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            className="dropdown-item"
                            to="/admin/manage-instructors"
                          >
                            Instructors
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            className="dropdown-item"
                            to="/admin/participants"
                          >
                            All Participants
                          </NavLink>
                        </li>
                      </ul>
                    </li>
                  </>
                )}

                {/* Instructor-Only Links */}
                {user?.role === "Instructor" && (
                  <>
                    <li className="nav-item">
                      <NavLink className="nav-link text-white" to="/instructor">
                        My Dashboard
                      </NavLink>
                    </li>
                    <li className="nav-item">
                      <NavLink
                        className="nav-link text-white"
                        to="/instructor/create-class"
                      >
                        Create Class
                      </NavLink>
                    </li>
                  </>
                )}

                {/* Welcome Message & Logout Button for all logged-in users */}
                <li className="nav-item ms-lg-3 dropdown">
                  <a
                    className="nav-link dropdown-toggle text-white"
                    href="#"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Welcome, {user?.user_fname}!
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                      <button className="dropdown-item" onClick={logout}>
                        Logout
                      </button>
                    </li>
                  </ul>
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
