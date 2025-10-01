// src/auth/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  loading: boolean;
  login: () => void;
  logout: () => void;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// INACTIVITY TIME LIMIT
const INACTIVITY_LIMIT = 15 * 10 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(
    () => !!localStorage.getItem("isLoggedIn")
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

  // 🔹 Login
  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
    startInactivityTimer(); // start inactivity tracking
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed", err);
    }

    setIsLoggedIn(false);
    localStorage.removeItem("isLoggedIn");
    clearInactivityTimer();
  };

  // 🔹 Fetch wrapper for authenticated requests
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, { ...options, credentials: "include" });
    if (response.status === 401 || response.status === 403) {
      await logout();
    }
    return response;
  };

  // 🔹 Check cookie validity on app load
  const checkAuth = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/check-auth", {
        credentials: "include",
      });
      if (res.ok) {
        setIsLoggedIn(true);
        localStorage.setItem("isLoggedIn", "true");
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem("isLoggedIn");
      }
    } catch {
      setIsLoggedIn(false);
      localStorage.removeItem("isLoggedIn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // 🔹 Inactivity timer
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

  // 🔹 Track user activity
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
  }, [isLoggedIn]);

  // 🔹 Handle modal OK click
  const handleModalOk = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, loading, login, logout, fetchWithAuth }}
    >
      {children}

      {/* Inactivity logout modal */}
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
