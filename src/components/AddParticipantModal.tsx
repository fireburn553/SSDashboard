/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useLocationSelector } from "../hooks/useLocationSelector";
import { useAuth } from "../auth/AuthContext";

// Interfaces for HEA and CSO dropdowns
interface HEA {
  hea_id: number;
  hea_name: string;
}
interface CSO {
  cso_id: number;
  cso_name: string;
}

interface AddParticipantModalProps {
  show: boolean;
  onClose: () => void;
  classId: number;
  onParticipantAdded: () => void; // A function to tell the parent to refresh
}

interface Gender {
  id: number;
  label: string;
}
const genders: Gender[] = [
  { id: 1, label: "Male" },
  { id: 2, label: "Female" },
];
const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  show,
  onClose,
  classId,
  onParticipantAdded,
}) => {
  // Use the same state and logic as your registration form
  const [form, setForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    nickname: "",
    birthday: "",
    birthplace: "",
    address: "",
    region: "",
    province: "",
    municipality_city: "",
    submunicipality: "",
    barangay: "",
    email: "",
    telephone: "",
    cellphone_number: "",
    civil_status: "",
    blood_type: "",
    maab_number: "",
    profession_occupation: "",
    highest_educational_attainment_id: "",
    gender_id: "",
    company_school_organization_id: "",
  });
  const [heas, setHeas] = useState<HEA[]>([]);
  const [csos, setCsos] = useState<CSO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { fetchWithAuth } = useAuth(); // Use authenticated fetch

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

  // Fetch dropdown data
  useEffect(() => {
    // This is the same fetchOptions from your registration form
    const fetchOptions = async () => {
      try {
        const heaRes = await fetch("http://localhost:5000/api/participant/hea");
        const heaData = await heaRes.json();
        setHeas(heaData);
        const csoRes = await fetch(
          "http://localhost:5000/api/participant/csos"
        );
        const csoData = await csoRes.json();
        setCsos(csoData);
      } catch (err) {
        console.error("❌ Failed to fetch options:", err);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const payload = {
      ...form,
      region: regions.find((r) => r.code == form.region)?.name || "",
      province: provinces.find((p) => p.code == form.province)?.name || "",
      municipality_city:
        municipalities.find((m) => m.code == form.municipality_city)?.name ||
        "",
      submunicipality:
        subMunicipalities.find((s) => s.code == form.submunicipality)?.name ||
        null,
      barangay: barangays.find((b) => b.code == form.barangay)?.name || "",
      gender_id: Number(form.gender_id),
      highest_educational_attainment_id: Number(
        form.highest_educational_attainment_id
      ),
      company_school_organization_id: Number(
        form.company_school_organization_id
      ),
    };

    try {
      const response = await fetchWithAuth(
        `http://localhost:5000/api/instructor/class/${classId}/participants`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to add participant.");

      onParticipantAdded(); // Tell the parent component to refresh its data
      onClose(); // Close the modal
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Manually Add Participant</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div
              className="container d-flex align-items-center justify-content-center"
              style={{ minHeight: "90vh" }}
            >
              <form onSubmit={handleSubmit}>
                {/* Names */}
                <div className="row">
                  <div className="mb-3 col-md-4">
                    <label className="form-label">First Name</label>
                    <input
                      name="first_name"
                      className="form-control"
                      value={form.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3 col-md-4">
                    <label className="form-label">Middle Name</label>
                    <input
                      name="middle_name"
                      className="form-control"
                      value={form.middle_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3 col-md-4">
                    <label className="form-label">Last Name</label>
                    <input
                      name="last_name"
                      className="form-control"
                      value={form.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                {/* Nickname, Birthday, Gender */}
                <div className="row">
                  <div className="mb-3 col-md-4">
                    <label className="form-label">Nickname</label>
                    <input
                      name="nickname"
                      className="form-control"
                      value={form.nickname}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3 col-md-4">
                    <label className="form-label">Birthday</label>
                    <input
                      type="date"
                      name="birthday"
                      className="form-control"
                      value={form.birthday}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3 col-md-4">
                    <label className="form-label">Gender</label>
                    <select
                      name="gender_id"
                      className="form-select"
                      value={form.gender_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      {genders.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Birthplace */}
                <div className="mb-3">
                  <label className="form-label">Birthplace</label>
                  <input
                    name="birthplace"
                    className="form-control"
                    value={form.birthplace}
                    onChange={handleChange}
                  />
                </div>

                {/* Address */}
                <div className="mb-3">
                  <label className="form-label">Complete Address</label>
                  <input
                    name="address"
                    className="form-control"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Location Selectors */}
                <div className="row">
                  {/* Region */}
                  <div className="mb-3">
                    <label className="form-label">Region</label>
                    <select
                      name="region"
                      className="form-select"
                      value={form.region}
                      onChange={(e) => {
                        const code = e.target.value;
                        handleRegionChange(code);
                        setForm((prev) => ({
                          ...prev,
                          region: code,
                          province: "",
                          municipality_city: "",
                          submunicipality: "",
                          barangay: "",
                        }));
                      }}
                      required
                    >
                      <option value="">Select Region</option>
                      {regions.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Province */}
                  {provinces.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">Province</label>
                      <select
                        name="province"
                        className="form-select"
                        value={form.province}
                        onChange={(e) => {
                          const code = e.target.value;
                          handleProvinceChange(code);
                          setForm((prev) => ({
                            ...prev,
                            province: code,
                            municipality_city: "",
                            submunicipality: "",
                            barangay: "",
                          }));
                        }}
                        disabled={!form.region}
                      >
                        <option value="">Select Province</option>
                        {provinces.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Municipality */}
                  <div className="mb-3">
                    <label className="form-label">Municipality/City</label>
                    <select
                      name="municipality_city"
                      className="form-select"
                      value={form.municipality_city}
                      onChange={(e) => {
                        const code = e.target.value;
                        handleMunicipalityChange(code);
                        setForm((prev) => ({
                          ...prev,
                          municipality_city: code,
                          submunicipality: "",
                          barangay: "",
                        }));
                      }}
                      disabled={municipalities.length === 0}
                    >
                      <option value="">Select Municipality/City</option>
                      {municipalities.map((m) => (
                        <option key={m.code} value={m.code}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Submunicipality */}
                  {subMunicipalities.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">Sub-Municipality</label>
                      <select
                        name="submunicipality"
                        className="form-select"
                        value={form.submunicipality}
                        onChange={(e) => {
                          const code = e.target.value;
                          handleSubMunicipalityChange(code);
                          setForm((prev) => ({
                            ...prev,
                            submunicipality: code,
                            barangay: "",
                          }));
                        }}
                        disabled={!form.municipality_city}
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

                  {/* Barangay */}
                  <div className="mb-3">
                    <label className="form-label">Barangay</label>
                    <select
                      name="barangay"
                      className="form-select"
                      value={form.barangay}
                      onChange={handleChange}
                      disabled={barangays.length === 0}
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

                {/* Contact Info */}
                <div className="row">
                  <div className="mb-3 col-md-4">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3 col-md-4">
                    <label className="form-label">Telephone</label>
                    <input
                      name="telephone"
                      className="form-control"
                      value={form.telephone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3 col-md-4">
                    <label className="form-label">Cellphone</label>
                    <input
                      name="cellphone_number"
                      className="form-control"
                      value={form.cellphone_number}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Other Info */}
                <div className="row">
                  <div className="mb-3 col-md-4">
                    <label className="form-label">Civil Status</label>
                    <select
                      name="civil_status"
                      className="form-select"
                      value={form.civil_status}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Civil Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Separated">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  <div className="mb-3 col-md-4">
                    <label className="form-label">Blood Type</label>
                    <input
                      name="blood_type"
                      className="form-control"
                      value={form.blood_type}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3 col-md-4">
                    <label className="form-label">MAAB Number</label>
                    <input
                      name="maab_number"
                      className="form-control"
                      value={form.maab_number}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Profession, HEA, CSO */}
                <div className="row">
                  <div className="mb-3 col-md-4">
                    <label className="form-label">Profession/Occupation</label>
                    <input
                      name="profession_occupation"
                      className="form-control"
                      value={form.profession_occupation}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3 col-md-4">
                    <label className="form-label">
                      Highest Educational Attainment
                    </label>
                    <select
                      name="highest_educational_attainment_id"
                      className="form-select"
                      value={form.highest_educational_attainment_id}
                      onChange={handleChange}
                    >
                      <option value="">Select HEA</option>
                      {heas.map((h) => (
                        <option key={h.hea_id} value={h.hea_id}>
                          {h.hea_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3 col-md-4">
                    <label className="form-label">CSO</label>
                    <select
                      name="company_school_organization_id"
                      className="form-select"
                      value={form.company_school_organization_id}
                      onChange={handleChange}
                    >
                      <option value="">Select CSO</option>
                      {csos.map((c) => (
                        <option key={c.cso_id} value={c.cso_id}>
                          {c.cso_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Register"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddParticipantModal;
