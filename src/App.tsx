import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Signin from "./auth/Signin";
import SignUp from "./auth/SignUp";
import InstructorHome from "./pages/Instructor/InstructorHome";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./auth/ProtectedRoute";
import { Routes, Route, Navigate } from "react-router-dom"; // 1. Import Navigate
import { useAuth } from "./auth/AuthContext";
import ParticipantRegistration from "./pages/Instructor/ParticipantRegistration";
import InstructorApproval from "./pages/Admin/InstructorApproval";
import ManageInstructors from "./pages/Admin/ManageInstructors";
import CreateClass from "./pages/Instructor/CreateClass";
import ManageClass from "./pages/Instructor/ManageClass";
import AdminHome from "./pages/Admin/AdminHome";
import ManageAllClasses from "./pages/Admin/ManageAllClass";
import AllParticipants from "./pages/Admin/AllParticipants";

// 2. Create a component to handle the home page redirect logic
const HomeRedirect = () => {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    // If the user is not logged in, show the public Home page.
    return <Home />;
  }

  // If the user is logged in, redirect them based on their role.
  if (user?.role === "Admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === "Instructor") {
    return <Navigate to="/instructor" replace />;
  }

  // As a fallback, show the public home page if role is not found
  return <Home />;
};

function App() {
  // 3. You no longer need to get isLoggedIn here for the Header
  return (
    <div>
      <header className="fixed-top shadow">
        {/* 4. The updated Header gets its own state, so no prop is needed */}
        <Header />
      </header>
      <main className="main-content ">
        <Routes>
          {/* 5. Replace the old Home route with our new redirect component */}
          <Route path="/" element={<HomeRedirect />} />

          {/* All other public routes */}
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/register/invite/:inviteToken"
            element={<ParticipantRegistration />}
          />

          {/* Protected Instructor Route */}
          <Route
            path="/instructor"
            element={
              <ProtectedRoute roles={["Instructor"]}>
                <InstructorHome />
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <AdminHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/create-class"
            element={
              <ProtectedRoute roles={["Instructor"]}>
                <CreateClass />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/class/:classId"
            element={
              <ProtectedRoute roles={["Instructor", "Admin"]}>
                <ManageClass />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approvals"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <InstructorApproval />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-instructors"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <ManageInstructors />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-classes"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <ManageAllClasses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/participants"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <AllParticipants />
              </ProtectedRoute>
            }
          />
          {/* Catch-all Not Found Route */}
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
