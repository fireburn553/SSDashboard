// src/auth/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
interface User {
  user_id: number;
  user_fname: string;
  user_lname: string;
  role: string;
  user_email: string;
}

// Added the 'user' state to the context type.
interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  user: User | null; // Store the full user object
  login: (userData: User) => void; // Login function now accepts user data
  logout: () => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// INACTIVITY TIME LIMIT
const INACTIVITY_LIMIT = 15 * 60 * 1000; // Corrected to 15 minutes

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // We now also get the 'user' object from localStorage on initial load.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => !!localStorage.getItem("isLoggedIn")
  );
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  // It now accepts the user data from the sign-in component.
  const login = (userData: User) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem("isLoggedIn", "true");
    // Store the user object as a string in localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    startInactivityTimer();
  };

  // It now clears the user state and removes the user from localStorage.
  const logout = async () => {
    try {
      // It's good practice to have a logout endpoint to invalidate the cookie
      await fetch(`${API_BASE_URL}/api/logout`, {
        // Assuming this is your logout endpoint
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed", err);
    }

    setIsLoggedIn(false);
    setUser(null); // Clear user data
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user"); // Remove user data
    clearInactivityTimer();
  };

  // Fetch wrapper for authenticated requests (Unchanged)
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, { ...options, credentials: "include" });
    if (response.status === 401 || response.status === 403) {
      await logout();
    }
    return response;
  };

  // Assume '/check-auth' returns the user data if the session is valid
  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/check-auth`, {
        // Assuming this is your check-auth endpoint
        credentials: "include",
      });
      if (res.ok) {
        const { user: userData } = await res.json(); // Destructure the user object from response
        setIsLoggedIn(true);
        setUser(userData);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        // If check fails, ensure everything is cleared
        await logout();
      }
    } catch {
      await logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // All inactivity logic remains unchanged
  const startInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setShowLogoutModal(true);
    }, INACTIVITY_LIMIT);
  };

  const resetInactivityTimer = () => {
    startInactivityTimer();
  };

  const clearInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
  };

  useEffect(() => {
    if (isLoggedIn) {
      window.addEventListener("mousemove", resetInactivityTimer);
      window.addEventListener("keydown", resetInactivityTimer);
      window.addEventListener("click", resetInactivityTimer);
      startInactivityTimer();
    }
    return () => {
      window.removeEventListener("mousemove", resetInactivityTimer);
      window.removeEventListener("keydown", resetInactivityTimer);
      window.removeEventListener("click", resetInactivityTimer);
      clearInactivityTimer();
    };
  }, [isLoggedIn, resetInactivityTimer]);

  const handleModalOk = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, loading, user, login, logout, fetchWithAuth }}
    >
      {children}

      {/* Inactivity logout modal (Unchanged) */}
      {showLogoutModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Session Expired</h5>
              </div>
              <div className="modal-body">
                <p>You have been logged out due to inactivity.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleModalOk}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

// Hook remains unchanged
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
