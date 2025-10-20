/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext"; // Adjust the path as needed
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Define the shape of a participant's grade data
interface ParticipantGrade {
  pax_id: number;
  pax_name: string;
  knowledge: number | null;
  skills: number | null;
  remarks: "passed" | "failed" | "drop" | "auto";
}

// Define the props the component will accept
interface GradingTableProps {
  participants: any[];
  isReadOnly: boolean; // Add this new prop
}

const GradingTable: React.FC<GradingTableProps> = ({
  participants,
  isReadOnly,
}) => {
  const { fetchWithAuth } = useAuth();

  // State for the grades being edited
  const [grades, setGrades] = useState<ParticipantGrade[]>([]);
  // State for the configurable passing average
  const [passingAverage, setPassingAverage] = useState<number>(75);
  // State to track the saving status for each row
  // Track which row is currently being edited. `null` means no row is in edit mode.
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  // Store a backup of the row's data when editing starts, for the cancel functionality.
  const [originalRowData, setOriginalRowData] =
    useState<ParticipantGrade | null>(null);
  // Track the saving status for the row currently being saved.
  const [isSaving, setIsSaving] = useState(false);

  // Initialize the grading state when the participants prop changes
  useEffect(() => {
    const initialGrades = participants.map((p) => ({
      pax_id: p.pax_id,
      pax_name: `${p.pax_fname} ${p.pax_lname}`,
      knowledge: p.pax_knowledge,
      skills: p.pax_skills,
      remarks: p.pax_remarks || "auto",
    }));
    setGrades(initialGrades);
  }, [participants]);

  // Handle changes to input fields
  const handleInputChange = (
    pax_id: number,
    field: keyof ParticipantGrade,
    value: string | number
  ) => {
    setGrades((currentGrades) =>
      currentGrades.map((g) =>
        g.pax_id === pax_id ? { ...g, [field]: value } : g
      )
    );
  };

  // When the "Edit" button is clicked
  const handleEditClick = (participantGrade: ParticipantGrade) => {
    setEditingRowId(participantGrade.pax_id);
    setOriginalRowData(participantGrade); // Backup the current data
  };

  // When the "Cancel" button is clicked
  const handleCancelClick = () => {
    // Restore the grades from the backup
    if (originalRowData) {
      setGrades((currentGrades) =>
        currentGrades.map((g) =>
          g.pax_id === originalRowData.pax_id ? originalRowData : g
        )
      );
    }
    setEditingRowId(null); // Exit edit mode
    setOriginalRowData(null);
  };

  // When the "Save" button is clicked
  const handleSaveClick = async (pax_id: number) => {
    const participantGrade = grades.find((g) => g.pax_id === pax_id);
    if (!participantGrade) return;

    let finalRemark = participantGrade.remarks;
    if (finalRemark === "auto") {
      const avg =
        (Number(participantGrade.knowledge) + Number(participantGrade.skills)) /
        2;
      finalRemark = avg >= passingAverage ? "passed" : "failed";
    }

    setIsSaving(true);

    try {
      await fetchWithAuth(`${API_BASE_URL}/api/grades/${pax_id}/grades`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowledge: participantGrade.knowledge,
          skills: participantGrade.skills,
          remarks: finalRemark,
        }),
      });

      setEditingRowId(null); // Exit edit mode on success
      setOriginalRowData(null);
    } catch (err) {
      console.error("Failed to save grades for pax_id:", pax_id, err);
      // Here you can call your error modal if you want
      // setModalErrorMessage("Failed to save. Please try again.");
      // setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">Participant Grades</h5>
          <div className="d-flex align-items-center">
            <label htmlFor="passingAverage" className="form-label me-2 mb-0">
              Passing Average:
            </label>
            <input
              type="number"
              className="form-control"
              style={{ width: "80px" }}
              id="passingAverage"
              value={passingAverage}
              onChange={(e) => setPassingAverage(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="table-responsive-cards">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Participant Name</th>
                <th>Knowledge</th>
                <th>Skills</th>
                <th>Average</th>
                <th>Status (Auto)</th>
                <th>Final Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => {
                const isEditing = editingRowId === g.pax_id;
                const average =
                  g.knowledge !== null && g.skills !== null
                    ? ((Number(g.knowledge) + Number(g.skills)) / 2).toFixed(1)
                    : "N/A";
                const automaticStatus =
                  average !== "N/A"
                    ? Number(average) >= passingAverage
                      ? "Passed"
                      : "Failed"
                    : "Pending";
                const statusColor =
                  automaticStatus === "Passed"
                    ? "bg-success"
                    : automaticStatus === "Failed"
                    ? "bg-danger"
                    : "bg-secondary";

                return (
                  <tr key={g.pax_id}>
                    <td data-label="Participant Name">{g.pax_name}</td>
                    {/* === 3. UPDATED JSX with conditional rendering === */}
                    <td data-label="Knowledge">
                      {isEditing ? (
                        <input
                          type="number"
                          className="form-control"
                          style={{ width: "100px" }}
                          value={g.knowledge || ""}
                          onChange={(e) =>
                            handleInputChange(
                              g.pax_id,
                              "knowledge",
                              e.target.value === ""
                                ? "" // Change null to an empty string for input fields
                                : Number(e.target.value)
                            )
                          }
                        />
                      ) : (
                        g.knowledge
                      )}
                    </td>
                    <td data-label="Skills">
                      {isEditing ? (
                        <input
                          type="number"
                          className="form-control"
                          style={{ width: "100px" }}
                          value={g.skills || ""}
                          onChange={(e) =>
                            handleInputChange(
                              g.pax_id,
                              "skills",
                              e.target.value === ""
                                ? "" // Change null to an empty string for input fields
                                : Number(e.target.value)
                            )
                          }
                        />
                      ) : (
                        g.skills
                      )}
                    </td>
                    <td data-label="Average">
                      <strong>{average}</strong>
                    </td>
                    <td data-label="Status (Auto)">
                      <span className={`badge ${statusColor}`}>
                        {automaticStatus}
                      </span>
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          className="form-select"
                          style={{ width: "170px" }}
                          value={g.remarks}
                          onChange={(e) =>
                            handleInputChange(
                              g.pax_id,
                              "remarks",
                              e.target.value
                            )
                          }
                        >
                          <option value="auto">Auto</option>
                          <option value="passed">Pass (Override)</option>
                          <option value="failed">Fail (Override)</option>
                          <option value="drop">Drop</option>
                        </select>
                      ) : (
                        g.remarks.charAt(0).toUpperCase() + g.remarks.slice(1) // Capitalize first letter
                      )}
                    </td>
                    <td data-label="Actions" className="text-end">
                      {!isReadOnly &&
                        (isEditing ? (
                          <div className="d-flex gap-2 justify-content-end">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={handleCancelClick}
                            >
                              Cancel
                            </button>
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleSaveClick(g.pax_id)}
                              disabled={isSaving}
                            >
                              {isSaving ? "Saving..." : "Save"}
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditClick(g)}
                          >
                            Edit
                          </button>
                        ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GradingTable;
