/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";

interface AddCsoModalProps {
  show: boolean;
  onClose: () => void;
  onCsoAdded: (newCso: {
    cso_id: number;
    cso_name: string;
    cso_type: string;
  }) => void;
}

const AddCsoModal: React.FC<AddCsoModalProps> = ({
  show,
  onClose,
  onCsoAdded,
}) => {
  const { fetchWithAuth } = useAuth();

  //State for fields unique to this form
  const [csoName, setCsoName] = useState("");
  const [csoType, setCsoType] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const payload = {
      cso_name: csoName,
      cso_type: csoType,
    };

    try {
      const response = await fetchWithAuth(
        "http://localhost:5000/api/instructor/csos",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.message || "Failed to add Company/School/Organization."
        );

      onCsoAdded(data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!show) return null;
  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Add New Company | School | Organization
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label className="form-label">
                  Company/School/Organization Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={csoName}
                  onChange={(e) => setCsoName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="cso_type" className="form-label">
                  Company/School/Organization Type
                </label>
                <select
                  name="cso_type"
                  id="cso_type"
                  className="form-select"
                  value={csoType}
                  onChange={(e) => setCsoType(e.target.value)}
                  required
                >
                  <option value="default">Select a CSO</option>
                  <option value="C">Company</option>
                  <option value="S">School</option>
                  <option value="O">Organization</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button type="submit" className="btn btn-primary">
                Save CSO
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCsoModal;
