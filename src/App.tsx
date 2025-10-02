import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Signin from "./auth/Signin";
import SignUp from "./auth/SignUp";
import InstructorHome from "./pages/InstructorHome";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./auth/ProtectedRoute";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import ParticipantRegistration from "./pages/ParticipantRegistration";

function App() {
  const { isLoggedIn } = useAuth();

  return (
    <div>
      <header className="fixed-top shadow">
        <Header signIn={isLoggedIn} />
      </header>
      <main className="main-content bg-light">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/register/invite/:inviteToken"
            element={<ParticipantRegistration />}
          />
          <Route
            path="/instructor"
            element={
              <ProtectedRoute>
                <InstructorHome />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="fixed-bottom shadow">
        <Footer />
      </footer>
    </div>
  );
}

export default App;
