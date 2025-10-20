/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react"; // Ensure qrcode.react is installed: npm install qrcode.react @types/qrcode.react
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Define the props interface for this component
interface ClassInvitationManagerProps {
  classId: number;
}

const ClassInvitationManager: React.FC<ClassInvitationManagerProps> = ({
  classId,
}) => {
  const [inviteLink, setInviteLink] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Note: For this to work, you might need a GET endpoint to fetch the initial status.
  // Let's assume you've added: GET /api/instructor/class/:id/invite-status
  useEffect(() => {
    const fetchInviteStatus = async () => {
      try {
        // This is a conceptual endpoint you might need to create
        const response = await fetch(
          `${API_BASE_URL}/api/instructor/class/${classId}/invite-status`,
          { credentials: "include" }
        );
        if (response.ok) {
          const data = await response.json();
          setIsActive(data.isActive);
          setInviteLink(data.link); // Assume this endpoint also returns the link if it exists
        }
      } catch (err) {
        setError("Failed to fetch invitation status.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchInviteStatus();
  }, [classId]);

  const handleGenerateLink = async () => {
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/instructor/class/${classId}/invite-link`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to generate link.");

      setInviteLink(data.link);
      setIsActive(true); // Generating a link should make it active
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async () => {
    setError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/instructor/class/${classId}/invite-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ isActive: !isActive }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to update status.");

      setIsActive(data.isActive);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <div>Loading Invitation Settings...</div>;
  }

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h5 className="card-title">Participant Registration</h5>
        <p className="card-text">
          Generate a shareable link and QR code to allow participants to
          register for this class.
        </p>

        {!inviteLink ? (
          <button className="btn btn-primary" onClick={handleGenerateLink}>
            Generate Invite Link
          </button>
        ) : (
          <div>
            <div className="mb-3">
              <label htmlFor="inviteLink" className="form-label">
                Invitation Link:
              </label>
              <input
                type="text"
                readOnly
                className="form-control"
                id="inviteLink"
                value={inviteLink}
              />
            </div>

            <div className="mb-3">
              <p>Registration QR Code:</p>
              <QRCodeSVG value={inviteLink} size={128} />
            </div>

            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="registrationSwitch"
                checked={isActive}
                onChange={handleToggleStatus}
              />
              <label className="form-check-label" htmlFor="registrationSwitch">
                {isActive ? "Registration is OPEN" : "Registration is CLOSED"}
              </label>
            </div>
          </div>
        )}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    </div>
  );
};

export default ClassInvitationManager;
