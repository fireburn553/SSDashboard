import { useEffect, useState } from "react";
import Button from "../components/Button";

interface Region {
  id: number;
  name: string;
}
interface Province {
  id: number;
  name: string;
}
interface Municipality {
  id: number;
  name: string;
}
interface Barangay {
  id: number;
  name: string;
}
interface Gender {
  id: number;
  label: string;
}

function SignUp() {
  // Form state
  const [form, setForm] = useState({
    user_fname: "",
    user_mname: "",
    user_lname: "",
    user_bday: "",
    user_complete_address: "",
    user_region: "",
    user_province: "",
    user_submunicipality: "",
    user_municipality_city: "",
    user_barangay: "",
    user_email: "",
    user_password: "",
    user_authority_number: "",
    gender_id: "",
  });

  // Dropdown data
  const [regions, setRegions] = useState<Region[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const genders: Gender[] = [
    { id: 1, label: "Male" },
    { id: 2, label: "Female" },
  ];

  // Simulate API calls
  useEffect(() => {
    // Replace with your API call
    setRegions([
      { id: 1, name: "Bicol" },
      { id: 2, name: "NCR" },
    ]);
  }, []);

  useEffect(() => {
    if (form.user_region) {
      // Replace with your API call
      setProvinces([
        { id: 1, name: "Camarines Sur" },
        { id: 2, name: "Albay" },
      ]);
    }
  }, [form.user_region]);

  useEffect(() => {
    if (form.user_province) {
      // Replace with your API call
      setMunicipalities([
        { id: 1, name: "Naga" },
        { id: 2, name: "Iriga" },
      ]);
    }
  }, [form.user_province]);

  useEffect(() => {
    if (form.user_municipality_city) {
      // Replace with your API call
      setBarangays([
        { id: 1, name: "Concepcion Pequeña" },
        { id: 2, name: "Bagumbayan Norte" },
      ]);
    }
  }, [form.user_municipality_city]);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit form to API here
    alert(JSON.stringify(form, null, 2));
  };

  return (
    <div
      className="container d-flex align-items-center justify-content-center"
      style={{ minHeight: "90vh" }}
    >
      <div className="card shadow p-4" style={{ maxWidth: 600, width: "100%" }}>
        <h2 className="mb-4 text-center">Registration</h2>
        <form onSubmit={handleSubmit}>
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
          <div className="row">
            <div className="mb-3 col-md-4">
              <label className="form-label">Region</label>
              <select
                name="user_region"
                className="form-select"
                value={form.user_region}
                onChange={handleChange}
                required
              >
                <option value="">Select Region</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3 col-md-4">
              <label className="form-label">Province</label>
              <select
                name="user_province"
                className="form-select"
                value={form.user_province}
                onChange={handleChange}
                required
              >
                <option value="">Select Province</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3 col-md-4">
              <label className="form-label">Submunicipality</label>
              <input
                name="user_submunicipality"
                className="form-control"
                value={form.user_submunicipality}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="row">
            <div className="mb-3 col-md-6">
              <label className="form-label">Municipality/City</label>
              <select
                name="user_municipality_city"
                className="form-select"
                value={form.user_municipality_city}
                onChange={handleChange}
                required
              >
                <option value="">Select Municipality/City</option>
                {municipalities.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3 col-md-6">
              <label className="form-label">Barangay</label>
              <select
                name="user_barangay"
                className="form-select"
                value={form.user_barangay}
                onChange={handleChange}
                required
              >
                <option value="">Select Barangay</option>
                {barangays.map((b) => (
                  <option key={b.id} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="user_password"
              className="form-control"
              value={form.user_password}
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
          <Button
            color="primary"
            size={100}
            onClick={function (): void {
              throw new Error("Function not implemented.");
            }}
          >
            Sign Up
          </Button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
