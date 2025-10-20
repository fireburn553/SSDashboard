/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { QRCodeCanvas } from "qrcode.react";
import GradingTable from "../../components/GradingTable";
import AddParticipantModal from "../../components/AddParticipantModal";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
interface Participant {
  pax_id: number;
  pax_fname: string;
  pax_lname: string;
  pax_email: string;
}
interface CoInstructor {
  user_id: number;
  instructor_fname: string;
  instructor_lname: string;
}
interface ClassDetails {
  class_id: number;
  class_number: string;
  course_name: string;
  is_concluded: boolean;
  establishment_name: string;
  address: string;
  cso_name: string;
  class_start_date: string;
  class_end_date: string;
  main_instructor_name: string;
  co_instructors: CoInstructor[]; // use typed co-instructors
  participants: Participant[]; // use typed participants
  invitation_token?: string;
  invitation_is_active?: boolean;
}

const ManageClass = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { fetchWithAuth } = useAuth();
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [inviteLink, setInviteLink] = useState("");
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const fetchClassDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/instructor/class/${classId}`,
        {
          // Add these headers to prevent caching
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch class details.");
      const data: ClassDetails = await response.json();
      setClassDetails(data);
      if (data.invitation_token) {
        const link = `${window.location.origin}/register/invite/${data.invitation_token}`;
        setInviteLink(link);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth, classId]);

  useEffect(() => {
    setIsLoading(true);
    fetchClassDetails();
  }, [fetchClassDetails]);

  const handleToggleInviteLink = async (newStatus: boolean) => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/instructor/class/${classId}/invite-status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: newStatus }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update link status.");
      }

      // Refresh the class details to get the updated status
      fetchClassDetails();
    } catch (err: any) {
      setModalErrorMessage(err.message);
      setShowErrorModal(true);
    }
  };
  const handlePrintCertificates = () => {
    window.open(
      `${API_BASE_URL}/api/certificates/class/${classId}`,
      "_blank"
    );
  };
  const handleGenerateLink = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/instructor/class/${classId}/invite-link`,
        { method: "POST" }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to generate link.");
      setInviteLink(data.link);
    } catch (err: any) {
      setModalErrorMessage(err.message || "Failed to generate invite link.");
      setShowErrorModal(true);
    }
  };
  const handleGenerateReport = () => {
    // This could open a new tab with the report, or trigger a download.
    // Replace with your actual report generation logic/endpoint.
    console.log("Generating report for class ID:", classId);
    window.open(`${API_BASE_URL}/api/report/${classId}/report`, "_blank");
  };
  const downloadQRCode = () => {
    const canvas = qrCodeRef.current?.querySelector("canvas");
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${
        classDetails?.class_number || "class"
      }-invite-qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const handleConclude = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/instructor/class/${classId}/conclude`,
        { method: "PUT" }
      );
      // Get the fresh data directly from the update response
      const updatedClass = await response.json();
      if (!response.ok) {
        throw new Error(updatedClass.message || "Failed to conclude class.");
      }

      // Update state with the guaranteed fresh data
      setClassDetails(updatedClass.class);
    } catch (err: any) {
      setModalErrorMessage(
        err.message || "An unknown error occurred while concluding the class."
      );
      setShowErrorModal(true);
    }
  };

  const handleConcludeClick = () => {
    setConfirmModalMessage("Are you sure you want to conclude this class?");
    setConfirmAction(() => handleConclude); // Store the function to run later
    setShowConfirmModal(true);
  };

  const handleReactivate = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/instructor/class/${classId}/reactivate`,
        { method: "PUT" }
      );
      // Get the updated object from the response
      const updatedClass = await response.json();

      if (!response.ok) {
        throw new Error("Failed to reactivate class.");
      }

      // Update state directly with the fresh data
      setClassDetails(updatedClass.class);
    } catch (err: any) {
      setModalErrorMessage(
        err.message || "An unknown error occurred while reactivating the class."
      );
      setShowErrorModal(true);
    }
  };
  const handleReactivateClick = () => {
    setConfirmModalMessage("Are you sure you want to reactivate this class?");
    setConfirmAction(() => handleReactivate); // Store the function to run later
    setShowConfirmModal(true);
  };
  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink).then(() => {
        setIsCopied(true);
        // Reset the button text after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      });
    }
  };

  if (isLoading)
    return (
      <div className="container mt-5">
        <h4>Loading Class Details...</h4>
      </div>
    );
  if (error)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  return (
    <div className="container mt-5">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-outline-secondary mb-4"
      >
        &larr; Back to Dashboard
      </button>
      <h2>Manage Class: {classDetails?.class_number}</h2>
      <h4>{classDetails?.course_name}</h4>

      <div className="row">
        {/* Left Column: Details & Actions */}
        <div className="col-lg-4">
          {/* Status Card */}

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Class Status</h5>
              <p>
                Current Status:
                <span
                  className={`badge ms-2 ${
                    classDetails?.is_concluded ? "bg-secondary" : "bg-success"
                  }`}
                >
                  {classDetails?.is_concluded ? "Concluded" : "Active"}
                </span>
              </p>
              {classDetails?.is_concluded ? (
                <>
                  <button
                    className="btn btn-success w-100"
                    onClick={handleReactivateClick}
                  >
                    Reactivate Class
                  </button>

                  {/* === 1. ADD THE "GENERATE REPORT" BUTTON === */}
                  <button
                    className="btn btn-outline-primary w-100 mt-2"
                    onClick={handleGenerateReport}
                    disabled={(classDetails?.participants?.length ?? 0) === 0}
                  >
                    Generate Report
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-danger w-100"
                  onClick={handleConcludeClick}
                >
                  Conclude Class
                </button>
              )}
            </div>
          </div>

          {/* Invite Link Card */}
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Participant Invitation</h5>
              {!inviteLink ? (
                <button
                  className="btn btn-primary"
                  onClick={handleGenerateLink}
                  disabled={classDetails?.is_concluded}
                >
                  Generate Invite Link & QR
                </button>
              ) : (
                <div className="text-center">
                  {/* Current Link Status */}
                  <p>
                    Link Status:
                    <span
                      className={`badge ms-2 ${
                        classDetails?.invitation_is_active
                          ? "bg-success"
                          : "bg-secondary"
                      }`}
                    >
                      {classDetails?.invitation_is_active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </p>

                  {/* QR Code */}
                  <div ref={qrCodeRef}>
                    <QRCodeCanvas value={inviteLink} size={256} />
                  </div>
                  <button
                    className="btn btn-success mt-3"
                    onClick={downloadQRCode}
                    disabled={classDetails?.is_concluded}
                  >
                    Download QR Code
                  </button>

                  {/* Link Input and Copy Button */}
                  <div className="input-group mt-3">
                    <input
                      type="text"
                      className="form-control"
                      value={inviteLink}
                      readOnly
                    />
                    <button
                      className={`btn ${
                        isCopied ? "btn-success" : "btn-outline-secondary"
                      }`}
                      type="button"
                      onClick={handleCopyLink}
                      disabled={classDetails?.is_concluded}
                    >
                      {isCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  {/* Enable/Disable Button */}
                  <div className="d-grid mt-3">
                    {classDetails?.invitation_is_active ? (
                      <button
                        className="btn btn-warning"
                        onClick={() => handleToggleInviteLink(false)}
                        disabled={classDetails?.is_concluded}
                      >
                        Disable Registration Link
                      </button>
                    ) : (
                      <button
                        className="btn btn-info"
                        onClick={() => handleToggleInviteLink(true)}
                        disabled={classDetails?.is_concluded}
                      >
                        Enable Registration Link
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Class Info & Participants */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Class Information</h5>
              <p>
                <strong>Course:</strong> {classDetails?.course_name}
              </p>
              <p>
                <strong>Location:</strong> {classDetails?.establishment_name} -{" "}
                {classDetails?.address}
              </p>
              <p>
                <strong>Company | School | Organization:</strong>{" "}
                {classDetails?.cso_name}
              </p>
              <p>
                <strong>Dates:</strong>{" "}
                {new Date(classDetails!.class_start_date).toLocaleDateString()}{" "}
                to {new Date(classDetails!.class_end_date).toLocaleDateString()}
              </p>
              <hr />
              <p>
                <strong>Main Instructor:</strong>{" "}
                {classDetails?.main_instructor_name}
              </p>
              {classDetails?.co_instructors &&
                classDetails.co_instructors.length > 0 && (
                  <p>
                    <strong>Co-Instructors:</strong>{" "}
                    {classDetails.co_instructors
                      .map((i) => `${i.instructor_fname} ${i.instructor_lname}`)
                      .join(", ")}
                  </p>
                )}
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              {/* Card header with title and the button */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title mb-0">
                  Participant ({classDetails?.participants?.length || 0})
                </h5>
                {classDetails?.is_concluded ? (
                  <button
                    className="btn btn-outline-secondary mt-2"
                    onClick={handlePrintCertificates}
                    disabled={(classDetails?.participants?.length ?? 0) === 0}
                  >
                    Print Certificates
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAddParticipantModal(true)}
                    disabled={classDetails?.is_concluded}
                    title={
                      classDetails?.is_concluded
                        ? "Cannot add participants to a concluded class"
                        : "Add a new participant"
                    }
                  >
                    + Add Participant
                  </button>
                )}
              </div>

              {/* Conditionally render the table or a 'no participants' message */}
              {classDetails?.participants &&
              classDetails.participants.length > 0 ? (
                <GradingTable
                  participants={classDetails.participants}
                  isReadOnly={classDetails.is_concluded}
                />
              ) : (
                <p className="text-center text-muted mt-3">
                  No participants have been added to this class yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <AddParticipantModal
        show={showAddParticipantModal}
        onClose={() => setShowAddParticipantModal(false)}
        classId={Number(classId)}
        onParticipantAdded={fetchClassDetails} // Pass the refresh function
      />

      {showErrorModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">An Error Occurred</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowErrorModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>{modalErrorMessage}</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowErrorModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showConfirmModal && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Please Confirm</h5>
              </div>
              <div className="modal-body">
                <p>{confirmModalMessage}</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    if (confirmAction) {
                      confirmAction();
                    }
                    setShowConfirmModal(false);
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClass;
