/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLocationSelector } from "../hooks/useLocationSelector";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
interface AddLocationModalProps {
  show: boolean;
  onClose: () => void;
  onLocationAdded: (newLocation: {
    training_location_id: number;
    establishment_name: string;
  }) => void;
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({
  show,
  onClose,
  onLocationAdded,
}) => {
  const { fetchWithAuth } = useAuth();

  // Location hooks
  const {
    regions,
    provinces,
    municipalities,
    subMunicipalities,
    barangays,
    handleRegionChange,
    handleProvinceChange,
    handleMunicipalityChange,
    handleSubMunicipalityChange,
  } = useLocationSelector();

  // State for fields unique to this form
  const [establishmentName, setEstablishmentName] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  // --- CHANGE 1: State to store the selected location CODES ---
  const [locationCodes, setLocationCodes] = useState({
    region: "",
    province: "",
    municipality_city: "",
    submunicipality: "",
    barangay: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // --- CHANGE 2: Build the payload by converting CODES to NAMES ---
    // This mirrors the logic from your working ParticipantRegistration form
    const payload = {
      establishment_name: establishmentName,
      address: address,
      region: regions.find((r) => r.code == locationCodes.region)?.name || "",
      province:
        provinces.find((p) => p.code == locationCodes.province)?.name || "",
      municipality_city:
        municipalities.find((m) => m.code == locationCodes.municipality_city)
          ?.name || "",
      submunicipality:
        subMunicipalities.find((s) => s.code == locationCodes.submunicipality)
          ?.name || null,
      barangay:
        barangays.find((b) => b.code == locationCodes.barangay)?.name || "",
    };

    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/instructor/locations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to add location.");

      onLocationAdded(data);
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
            <h5 className="modal-title">Add New Training Location</h5>
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
                <label className="form-label">Establishment Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={establishmentName}
                  onChange={(e) => setEstablishmentName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Address (Street, Building, etc.)
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              {/* --- CHANGE 3: Update onChange handlers to use setLocationCodes --- */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Region</label>
                  <select
                    className="form-select"
                    required
                    value={locationCodes.region}
                    onChange={(e) => {
                      const code = e.target.value;
                      handleRegionChange(code);
                      setLocationCodes({
                        region: code,
                        province: "",
                        municipality_city: "",
                        submunicipality: "",
                        barangay: "",
                      });
                    }}
                  >
                    <option value="">Select Region</option>
                    {regions.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Province</label>
                  <select
                    className="form-select"
                    disabled={provinces.length === 0}
                    value={locationCodes.province}
                    onChange={(e) => {
                      const code = e.target.value;
                      handleProvinceChange(code);
                      setLocationCodes((p) => ({
                        ...p,
                        province: code,
                        municipality_city: "",
                        submunicipality: "",
                        barangay: "",
                      }));
                    }}
                  >
                    <option value="">Select Province</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Municipality / City</label>
                  <select
                    className="form-select"
                    required
                    disabled={municipalities.length === 0}
                    value={locationCodes.municipality_city}
                    onChange={(e) => {
                      const code = e.target.value;
                      handleMunicipalityChange(code);
                      setLocationCodes((p) => ({
                        ...p,
                        municipality_city: code,
                        submunicipality: "",
                        barangay: "",
                      }));
                    }}
                  >
                    <option value="">Select Municipality/City</option>
                    {municipalities.map((m) => (
                      <option key={m.code} value={m.code}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* --- CHANGE 4: Conditionally render Sub-Municipality --- */}
                {subMunicipalities.length > 0 && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Sub-Municipality</label>
                    <select
                      className="form-select"
                      value={locationCodes.submunicipality}
                      onChange={(e) => {
                        const code = e.target.value;
                        handleSubMunicipalityChange(code);
                        setLocationCodes((p) => ({
                          ...p,
                          submunicipality: code,
                          barangay: "",
                        }));
                      }}
                    >
                      <option value="">Select Sub-Municipality</option>
                      {subMunicipalities.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="col-md-6 mb-3">
                  <label className="form-label">Barangay</label>
                  <select
                    className="form-select"
                    required
                    disabled={barangays.length === 0}
                    value={locationCodes.barangay}
                    onChange={(e) => {
                      setLocationCodes((p) => ({
                        ...p,
                        barangay: e.target.value,
                      }));
                    }}
                  >
                    <option value="">Select Barangay</option>
                    {barangays.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                Save Location
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddLocationModal;
