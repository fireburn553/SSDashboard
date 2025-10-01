import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Signin from "./auth/SignIn";
import SignUp from "./auth/SignUp";
import InstructorHome from "./pages/InstructorHome";
import ProtectedRoute from "./auth/ProtectedRoute";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

function App() {
  const { isLoggedIn } = useAuth();

  return (
    <div>
      <header className="fixed-top shadow">
        <Header signIn={isLoggedIn} />
      </header>
      <main className="main-content bg-light">
        <Routes>
          {!isLoggedIn && <Route path="/" element={<Home />} />}
          {!isLoggedIn && <Route path="/signin" element={<Signin />} />}
          {!isLoggedIn && <Route path="/signup" element={<SignUp />} />}
          <Route
            path="/instructor"
            element={
              <ProtectedRoute>
                <InstructorHome />
              </ProtectedRoute>
            }
          />
          {/* Redirect all other routes */}
          <Route
            path="*"
            element={
              <Navigate to={isLoggedIn ? "/instructor" : "/signin"} replace />
            }
          />
        </Routes>
      </main>
      <footer className="fixed-bottom shadow">
        <Footer />
      </footer>
    </div>
  );
}

export default App;
