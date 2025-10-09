/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";

// --- CHANGE 1: Update the Instructor interface ---
// 'Suspended' is not a state we manage here according to the new logic.
interface Instructor {
  user_id: number;
  user_fname: string;
  user_lname: string;
  user_email: string;
  status: "Approved" | "Rejected" | "Disabled" | "Pending";
}

const ManageInstructors = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { fetchWithAuth } = useAuth();
  const navigate = useNavigate();
  const fetchInstructors = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetchWithAuth(
        "http://localhost:5000/api/admin/instructors"
      );
      if (!response.ok) throw new Error("Failed to fetch instructors.");
      const data = await response.json();
      setInstructors(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  // --- CHANGE 2: Update the handleUpdateStatus function ---
  // The only actions from this page are to 'Disable' or 'Approve' (reactivate).
  const handleUpdateStatus = async (
    userId: number,
    newStatus: "Disabled" | "Approved"
  ) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:5000/api/admin/instructors/${userId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) throw new Error(`Failed to update status.`);
      fetchInstructors(); // Refresh list on success
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-5">
        <h4>Loading Instructors...</h4>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline-secondary mb-4"
      >
        &larr; Back to Dashboard
      </button>
      <h2>Manage Instructors</h2>
      <p>View all registered instructors and manage their account status.</p>

      {error && <div className="alert alert-danger">{error}</div>}

      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {instructors.map((instructor) => (
            <tr key={instructor.user_id}>
              <td>
                {instructor.user_fname} {instructor.user_lname}
              </td>
              <td>{instructor.user_email}</td>
              <td>
                <span
                  className={`badge ${
                    instructor.status === "Approved"
                      ? "bg-success"
                      : instructor.status === "Disabled"
                      ? "bg-secondary"
                      : instructor.status === "Rejected"
                      ? "bg-danger"
                      : "bg-info" // for Pending
                  }`}
                >
                  {instructor.status}
                </span>
              </td>
              <td>
                {/* --- CHANGE 3: Implement the new action button logic --- */}

                {/* If status is 'Approved', the only action is to 'Disable' */}
                {instructor.status === "Approved" && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      handleUpdateStatus(instructor.user_id, "Disabled")
                    }
                  >
                    Disable
                  </button>
                )}

                {/* If status is 'Disabled', the only action is to 'Approve' (reactivate) */}
                {instructor.status === "Disabled" && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() =>
                      handleUpdateStatus(instructor.user_id, "Approved")
                    }
                  >
                    Reactivate
                  </button>
                )}

                {/* If status is 'Pending' or 'Rejected', show no action button */}
                {(instructor.status === "Pending" ||
                  instructor.status === "Rejected") && (
                  <span className="text-muted fst-italic">
                    No action available
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageInstructors;
