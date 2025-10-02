import { useAuth } from "../auth/AuthContext";

interface HeaderProps {
  signIn: boolean; // pass this as a prop (true/false depending on login state)
}

function Header({ signIn }: HeaderProps) {
  const { logout } = useAuth();

  return (
    <header className="navbar navbar-expand-lg bg-secondary p-3">
      <div className="container-fluid">
        {/* Left side - Logo/Title */}
        <a className="navbar-brand text-white fw-bold" href="/">
          Safety Service Dashboard
        </a>

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

        {/* Conditional Rendering */}
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarSupportedContent"
        >
          <ul className="navbar-nav mb-2 mb-lg-0">
            {!signIn ? (
              // Show Sign In if not logged in
              <li className="nav-item">
                <a
                  className="nav-link active text-white"
                  aria-current="page"
                  href="/signin"
                >
                  Sign In
                </a>
              </li>
            ) : (
              // Show navigation if logged in
              <>
                <li className="nav-item">
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
