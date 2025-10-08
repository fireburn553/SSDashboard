/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext"; // Adjust the path as needed

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
  participants: any[]; // Use the detailed participant type from your ManageClass page
}

const GradingTable: React.FC<GradingTableProps> = ({ participants }) => {
  const { fetchWithAuth } = useAuth();

  // State for the grades being edited
  const [grades, setGrades] = useState<ParticipantGrade[]>([]);
  // State for the configurable passing average
  const [passingAverage, setPassingAverage] = useState<number>(75);
  // State to track the saving status for each row
  const [savingStatus, setSavingStatus] = useState<{
    [key: number]: "idle" | "saving" | "saved" | "error";
  }>({});

  // Initialize the grading state when the participants prop changes
  useEffect(() => {
    const initialGrades = participants.map((p) => ({
      pax_id: p.pax_id,
      pax_name: `${p.pax_fname} ${p.pax_lname}`,
      knowledge: p.pax_knowledge,
      skills: p.pax_skills,
      remarks: p.pax_remarks || "auto", // Default to 'auto' if no remark is set
    }));
    setGrades(initialGrades);

    // Initialize saving status for all participants
    const initialSavingStatus: { [key: number]: "idle" } = {};
    participants.forEach((p) => {
      initialSavingStatus[p.pax_id] = "idle";
    });
    setSavingStatus(initialSavingStatus);
  }, [participants]);

  // Handle changes to input fields (knowledge, skills, remarks)
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

  // Auto-save function triggered when an input field loses focus (onBlur)
  const handleSave = async (pax_id: number) => {
    const participantGrade = grades.find((g) => g.pax_id === pax_id);
    if (!participantGrade) return;

    // Calculate the final remark to save
    let finalRemark = participantGrade.remarks;
    if (finalRemark === "auto") {
      const avg =
        (Number(participantGrade.knowledge) + Number(participantGrade.skills)) /
        2;
      finalRemark = avg >= passingAverage ? "passed" : "failed";
    }

    // Set status to 'saving' to show a spinner
    setSavingStatus((prev) => ({ ...prev, [pax_id]: "saving" }));

    try {
      await fetchWithAuth(`http://localhost:5000/api/grades/${pax_id}/grades`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowledge: participantGrade.knowledge,
          skills: participantGrade.skills,
          remarks: finalRemark,
        }),
      });

      // Set status to 'saved' to show a checkmark
      setSavingStatus((prev) => ({ ...prev, [pax_id]: "saved" }));
    } catch (err) {
      // Set status to 'error' to show an error icon
      setSavingStatus((prev) => ({ ...prev, [pax_id]: "error" }));
      console.error("Failed to save grades for pax_id:", pax_id, err);
    } finally {
      // After 2 seconds, reset the status icon to idle
      setTimeout(() => {
        setSavingStatus((prev) => ({ ...prev, [pax_id]: "idle" }));
      }, 2000);
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

        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Participant Name</th>
                <th style={{ width: "120px" }}>Knowledge</th>
                <th style={{ width: "120px" }}>Skills</th>
                <th style={{ width: "120px" }}>Average</th>
                <th style={{ width: "150px" }}>Status (Auto)</th>
                <th style={{ width: "180px" }}>Final Status</th>
                <th style={{ width: "50px" }}></th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => {
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
                    <td>{g.pax_name}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={g.knowledge || ""}
                        onChange={(e) =>
                          handleInputChange(
                            g.pax_id,
                            "knowledge",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        onBlur={() => handleSave(g.pax_id)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        value={g.skills || ""}
                        onChange={(e) =>
                          handleInputChange(
                            g.pax_id,
                            "skills",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        onBlur={() => handleSave(g.pax_id)}
                      />
                    </td>
                    <td>
                      <strong>{average}</strong>
                    </td>
                    <td>
                      <span className={`badge ${statusColor}`}>
                        {automaticStatus}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-select"
                        value={g.remarks}
                        onChange={(e) =>
                          handleInputChange(g.pax_id, "remarks", e.target.value)
                        }
                        onBlur={() => handleSave(g.pax_id)}
                      >
                        <option value="auto">Auto</option>
                        <option value="passed">Pass (Override)</option>
                        <option value="failed">Fail (Override)</option>
                        <option value="drop">Drop</option>
                      </select>
                    </td>
                    <td>
                      {savingStatus[g.pax_id] === "saving" && (
                        <div
                          className="spinner-border spinner-border-sm"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      )}
                      {savingStatus[g.pax_id] === "saved" && (
                        <span className="text-success">✔</span>
                      )}
                      {savingStatus[g.pax_id] === "error" && (
                        <span className="text-danger">✖</span>
                      )}
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
