import { useState } from "react";
import { useLocationSelector } from "../hooks/useLocationSelector";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
interface Gender {
  id: number;
  label: string;
}

function SignUp() {
  const navigate = useNavigate();
  const genders: Gender[] = [
    { id: 1, label: "Male" },
    { id: 2, label: "Female" },
  ];

  // Form state - Storing all selected codes is the correct approach
  const [form, setForm] = useState({
    user_fname: "",
    user_mname: "",
    user_lname: "",
    user_bday: "",
    user_complete_address: "",
    user_region: "",
    user_province: "",
    user_municipality_city: "",
    user_submunicipality: "",
    user_barangay: "",
    user_email: "",
    user_password: "",
    confirmPassword: "",
    user_authority_number: "",
    gender_id: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  // Location hook
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

  // Handle form input changes for general fields
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Add this password check
    if (form.user_password !== form.confirmPassword) {
      alert("Passwords do not match!");
      return; // Stop the submission if they don't match
    }

    const payload = {
      user_fname: form.user_fname,
      user_mname: form.user_mname,
      user_lname: form.user_lname,
      user_bday: form.user_bday,
      user_complete_address: form.user_complete_address,
      user_region: regions.find((r) => r.code == form.user_region)?.name || "",
      user_province:
        provinces.find((p) => p.code == form.user_province)?.name || "",
      user_municipality_city:
        municipalities.find((m) => m.code == form.user_municipality_city)
          ?.name || "",
      user_submunicipality:
        subMunicipalities.find((s) => s.code == form.user_submunicipality)
          ?.name || null,
      user_barangay:
        barangays.find((b) => b.code == form.user_barangay)?.name || "",
      user_email: form.user_email,
      user_password: form.user_password,
      user_authority_number: form.user_authority_number,
      gender_id: Number(form.gender_id),
    };
    console.log("✅ Final Payload:", payload);
    // You can now send the 'payload' to your API.
    try {
      // IMPORTANT: Replace with your actual backend URL
      const API_URL = `${API_BASE_URL}/api/register`;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Server Response:", data);
        alert(data.message || "Registration successful!");
        navigate("/");
      } else {
        // Handle errors from the server (e.g., "Email already exists")
        alert(`Error: ${data.message || "Registration failed."}`);
      }
    } catch (error) {
      console.error("❌ Registration Error:", error);
      alert("A network error occurred. Please try again.");
    }
  };

  return (
    <div
      className="container d-flex align-items-center justify-content-center"
      style={{ minHeight: "90vh" }}
    >
      <div className="card shadow p-4" style={{ maxWidth: 600, width: "100%" }}>
        <h2 className="mb-4 text-center">Registration</h2>
        <form onSubmit={handleSubmit}>
          {/* Name, Birthday, Gender, Address inputs remain the same... */}
          <div className="row">
            <div className="mb-3 col-md-4">
              <label className="form-label">First Name</label>
              <input
                name="user_fname"
                className="form-control"
                value={form.user_fname}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3 col-md-4">
              <label className="form-label">Middle Name</label>
              <input
                name="user_mname"
                className="form-control"
                value={form.user_mname}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3 col-md-4">
              <label className="form-label">Last Name</label>
              <input
                name="user_lname"
                className="form-control"
                value={form.user_lname}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="mb-3 col-md-6">
              <label className="form-label">Birthday</label>
              <input
                type="date"
                name="user_bday"
                className="form-control"
                value={form.user_bday}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3 col-md-6">
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

          <div className="mb-3">
            <label className="form-label">Complete Address</label>
            <input
              name="user_complete_address"
              className="form-control"
              value={form.user_complete_address}
              onChange={handleChange}
              required
            />
          </div>

          {/* Location Selects */}
          <div className="row">
            {/* Region */}
            <div className="mb-3">
              <label className="form-label">Region</label>
              <select
                name="user_region"
                className="form-select"
                value={form.user_region}
                onChange={(e) => {
                  const code = e.target.value;
                  handleRegionChange(code);
                  setForm((prev) => ({
                    ...prev,
                    user_region: code,
                    user_province: "",
                    user_municipality_city: "",
                    user_submunicipality: "",
                    user_barangay: "",
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

            {/* Province (Conditional) */}
            {provinces.length > 0 && (
              <div className="mb-3">
                <label className="form-label">Province</label>
                <select
                  name="user_province"
                  className="form-select"
                  value={form.user_province}
                  onChange={(e) => {
                    const code = e.target.value;
                    handleProvinceChange(code);
                    setForm((prev) => ({
                      ...prev,
                      user_province: code,
                      user_municipality_city: "",
                      user_submunicipality: "",
                      user_barangay: "",
                    }));
                  }}
                  disabled={!form.user_region}
                  required
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

            {/* Municipality/City */}
            <div className="mb-3">
              <label className="form-label">Municipality/City</label>
              <select
                name="user_municipality_city"
                className="form-select"
                value={form.user_municipality_city}
                onChange={(e) => {
                  const code = e.target.value;
                  handleMunicipalityChange(code);
                  setForm((prev) => ({
                    ...prev,
                    user_municipality_city: code,
                    user_submunicipality: "",
                    user_barangay: "",
                  }));
                }}
                disabled={municipalities.length === 0}
                required
              >
                <option value="">Select Municipality/City</option>
                {municipalities.map((m) => (
                  <option key={m.code} value={m.code}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-Municipality (Conditional) */}
            {subMunicipalities.length > 0 && (
              <div className="mb-3">
                <label className="form-label">Sub-Municipality</label>
                <select
                  name="user_submunicipality"
                  className="form-select"
                  value={form.user_submunicipality}
                  onChange={(e) => {
                    const code = e.target.value;
                    handleSubMunicipalityChange(code);
                    setForm((prev) => ({
                      ...prev,
                      user_submunicipality: code,
                      user_barangay: "",
                    }));
                  }}
                  disabled={!form.user_municipality_city}
                  required
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
                name="user_barangay"
                className="form-select"
                value={form.user_barangay}
                onChange={handleChange}
                disabled={barangays.length === 0}
                required
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

          {/* ... (Email, Password, Authority Number inputs using generic handleChange) ... */}
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="user_email"
              className="form-control"
              value={form.user_email}
              onChange={handleChange}
              required
            />
          </div>
          {/* Password */}
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"}
                name="user_password"
                className="form-control"
                value={form.user_password}
                onChange={handleChange}
                required
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {/* This is a simple SVG for an eye icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.816 1.221-2.25 2.16-3.725 2.766C9.99 11.224 8.24 11.5 6.5 11.5c-1.739 0-3.322-.26-4.649-.717C.979 10.333.345 9.358.173 9.043a.5.5 0 0 1 0-.086z" />
                  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              className="form-control"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Authority Number</label>
            <input
              name="user_authority_number"
              className="form-control"
              value={form.user_authority_number}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
