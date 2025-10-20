/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";

interface PendingInstructor {
  user_id: number;
  user_fname: string;
  user_lname: string;
  user_email: string;
}

const InstructorApproval = () => {
  const [pendingInstructors, setPendingInstructors] = useState<
    PendingInstructor[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { fetchWithAuth } = useAuth();

  const fetchPendingInstructors = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetchWithAuth(
        "http://localhost:5000/api/admin/instructors/pending"
      );
      if (!response.ok) throw new Error("Failed to fetch pending instructors.");

      const data = await response.json();
      setPendingInstructors(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingInstructors();
  }, [fetchWithAuth]);

  // The status parameter is now 'Approved' or 'Rejected'
  const handleUpdateStatus = async (
    userId: number,
    status: "Approved" | "Rejected"
  ) => {
    try {
      // Your existing PUT endpoint is fine, we just need to send the correct status
      const response = await fetchWithAuth(
        `http://localhost:5000/api/admin/instructors/${userId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok)
        throw new Error(
          `Failed to ${status === "Approved" ? "approve" : "deny"} instructor.`
        );

      fetchPendingInstructors();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-5">
        <h4>Loading pending requests...</h4>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2>Instructor Account Approval</h2>
      <p>Review and approve or deny new instructor registrations.</p>

      {error && <div className="alert alert-danger">{error}</div>}

      {pendingInstructors.length === 0 ? (
        <div className="alert alert-info">
          There are no pending instructor registrations at this time.
        </div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingInstructors.map((instructor) => (
              <tr key={instructor.user_id}>
                <td>
                  {instructor.user_fname} {instructor.user_lname}
                </td>
                <td>{instructor.user_email}</td>
                <td>
                  <button
                    className="btn btn-success me-2"
                    // --- CHANGE 1: Send 'Approved' ---
                    onClick={() =>
                      handleUpdateStatus(instructor.user_id, "Approved")
                    }
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    // --- CHANGE 2: Send 'Rejected' ---
                    onClick={() =>
                      handleUpdateStatus(instructor.user_id, "Rejected")
                    }
                  >
                    Deny
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InstructorApproval;
