/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import AddLocationModal from "../../components/AddLocationModal";
import AddCsoModal from "../../components/AddCsoModal";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// --- Interfaces for our data shapes ---
interface DropdownOption {
  id: number;
  name: string;
}

interface Course {
  course_id: number;
  course_name: string; // Changed from ReactNode for simplicity
  total_days: number;
  total_hours: number;
}

interface Instructor {
  user_id: number;
  user_fname: string;
  user_lname: string;
}

// --- Initial State for the form ---
const initialFormData = {
  class_start_date: "",
  class_end_date: "",
  class_final_evaluation_date: "",
  class_number: "",
  class_total_hours: 0,
  class_total_days: 0,
  training_location_id: "",
  cso_id: "",
  course_id: "",
  instructors: [] as number[],
};

const CreateClass = () => {
  const { fetchWithAuth, user } = useAuth();
  const navigate = useNavigate();

  // --- State Hooks ---
  const [formData, setFormData] = useState(initialFormData);
  const [dropdownData, setDropdownData] = useState({
    courses: [] as Course[],
    locations: [] as DropdownOption[],
    csos: [] as DropdownOption[],
    allInstructors: [] as Instructor[],
  });
  const [selectedInstructors, setSelectedInstructors] = useState<Instructor[]>(
    []
  );
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCsoModal, setShowCsoModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    try {
      const [coursesRes, locationsRes, csosRes, instructorsRes] =
        await Promise.all([
          fetchWithAuth(`${API_BASE_URL}/api/instructor/courses`),
          fetchWithAuth(`${API_BASE_URL}/api/instructor/locations`),
          fetchWithAuth(`${API_BASE_URL}/api/instructor/csos`),
          fetchWithAuth(`${API_BASE_URL}/api/instructor/approved-instructors`),
        ]);

      if (
        !coursesRes.ok ||
        !locationsRes.ok ||
        !csosRes.ok ||
        !instructorsRes.ok
      ) {
        throw new Error("Failed to load required data.");
      }
      const coursesData = await coursesRes.json();
      const instructorsData = await instructorsRes.json();
      setDropdownData({
        courses: coursesData.map((c: any) => ({
          ...c,
          course_id: Number(c.course_id), // Ensure course_id is a number
        })),
        locations: (await locationsRes.json()).map((l: any) => ({
          id: l.training_location_id,
          name: l.establishment_name,
        })),
        csos: (await csosRes.json()).map((c: any) => ({
          id: c.cso_id,
          name: c.cso_name,
        })),
        allInstructors: instructorsData.map((inst: any) => ({
          ...inst,
          user_id: Number(inst.user_id),
        })),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Event Handlers ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value;
    const selectedCourse = dropdownData.courses.find(
      (c) => c.course_id === Number(courseId)
    );
    console.log(selectedCourse);
    setFormData((prev) => ({
      ...prev,
      course_id: courseId,
      class_total_days: selectedCourse?.total_days || 0,
      class_total_hours: selectedCourse?.total_hours || 0,
    }));
  };

  const handleSelectInstructor = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const instructorId = Number(e.target.value);
    if (!instructorId) return;

    const instructorToAdd = dropdownData.allInstructors.find(
      (inst) => inst.user_id === instructorId
    );
    console.log(instructorToAdd);
    if (instructorToAdd) {
      setSelectedInstructors((prev) => [...prev, instructorToAdd]);
      setFormData((prev) => ({
        ...prev,
        instructors: [...prev.instructors, instructorId],
      }));
    }
    e.target.value = ""; // Reset dropdown
  };

  const handleRemoveInstructor = (instructorId: number) => {
    setSelectedInstructors((prev) =>
      prev.filter((inst) => inst.user_id !== instructorId)
    );
    setFormData((prev) => ({
      ...prev,
      instructors: prev.instructors.filter((id) => id !== instructorId),
    }));
  };

  const handleNewLocationAdded = (newLocation: {
    training_location_id: number;
    establishment_name: string;
  }) => {
    setDropdownData((prev) => ({
      ...prev,
      locations: [
        ...prev.locations,
        {
          id: newLocation.training_location_id,
          name: newLocation.establishment_name,
        },
      ],
    }));
    setFormData((prev) => ({
      ...prev,
      training_location_id: String(newLocation.training_location_id),
    }));
  };

  const handleNewCsoAdded = (newCso: { cso_id: number; cso_name: string }) => {
    setDropdownData((prev) => ({
      ...prev,
      csos: [
        ...prev.csos,
        {
          id: newCso.cso_id,
          name: newCso.cso_name,
        },
      ],
    }));
    setFormData((prev) => ({
      ...prev,
      cso_id: String(newCso.cso_id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/instructor/class`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to create class.");
      alert("Class created successfully!");
      navigate("/instructor");
    } catch (err: any) {
      setError(err.message);
    }
  };

  // --- Derived State ---
  // Filter the list for the dropdown on every render.
  const instructorsForDropdown = dropdownData.allInstructors.filter(
    (inst) =>
      inst.user_id !== user?.user_id && // Use user.id from the token
      !selectedInstructors.some((selected) => selected.user_id === inst.user_id)
  );
  if (isLoading) return <div>Loading form data...</div>;

  return (
    <div className="container mt-5">
      <h2>Create New Class</h2>
      <p>Fill out the details below to register a new class.</p>
      <form onSubmit={handleSubmit}>
        {error && <div className="alert alert-danger">{error}</div>}

        {/* --- Card sections for form fields --- */}
        {/* Class Details */}
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Class Details</h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="class_number" className="form-label">
                  Class Number
                </label>
                <input
                  type="text"
                  name="class_number"
                  id="class_number"
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="course_id" className="form-label">
                  Course
                </label>
                <select
                  name="course_id"
                  id="course_id"
                  className="form-select"
                  value={formData.course_id}
                  onChange={handleCourseChange}
                  required
                >
                  <option value="">Select a Course</option>
                  {dropdownData.courses.map((c) => (
                    <option key={c.course_id} value={c.course_id}>
                      {c.course_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="class_total_days" className="form-label">
                  Total Days
                </label>
                <input
                  type="number"
                  name="class_total_days"
                  id="class_total_days"
                  className="form-control"
                  value={formData.class_total_days}
                  readOnly
                />
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="class_total_hours" className="form-label">
                  Total Hours
                </label>
                <input
                  type="number"
                  name="class_total_hours"
                  id="class_total_hours"
                  className="form-control"
                  value={formData.class_total_hours}
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Dates</h5>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label htmlFor="class_start_date" className="form-label">
                  Start Date
                </label>
                <input
                  type="date"
                  name="class_start_date"
                  id="class_start_date"
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label htmlFor="class_end_date" className="form-label">
                  End Date
                </label>
                <input
                  type="date"
                  name="class_end_date"
                  id="class_end_date"
                  className="form-control"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label
                  htmlFor="class_final_evaluation_date"
                  className="form-label"
                >
                  Final Evaluation Date
                </label>
                <input
                  type="date"
                  name="class_final_evaluation_date"
                  id="class_final_evaluation_date"
                  className="form-control"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location & Sponsoring Organization */}
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Location & Sponsor</h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="training_location_id" className="form-label">
                  Training Location
                </label>
                <div className="input-group">
                  <select
                    name="training_location_id"
                    id="training_location_id"
                    className="form-select"
                    value={formData.training_location_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a Location</option>
                    {dropdownData.locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <label htmlFor="cso_id" className="form-label">
                  Company | School | Organization (CSO)
                </label>
                <div className="input-group">
                  <select
                    name="cso_id"
                    id="cso_id"
                    className="form-select"
                    value={formData.cso_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a CSO</option>
                    {dropdownData.csos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setShowCsoModal(true)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Instructors */}
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">Additional Instructors</h5>
            <p>
              Select other instructors to assist. You are automatically assigned
              as the main instructor.
            </p>
            <div className="mb-3">
              <select
                className="form-select"
                onChange={handleSelectInstructor}
                value=""
              >
                <option value="">-- Add an instructor --</option>
                {instructorsForDropdown.map((i) => (
                  <option key={i.user_id} value={i.user_id}>
                    {i.user_fname} {i.user_lname}
                  </option>
                ))}
              </select>
            </div>
            <div>
              {selectedInstructors.map((instructor) => (
                <span
                  key={instructor.user_id}
                  className="badge bg-primary me-2 p-2"
                >
                  {instructor.user_fname} {instructor.user_lname}
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-2"
                    aria-label="Remove"
                    onClick={() => handleRemoveInstructor(instructor.user_id)}
                    style={{ fontSize: "0.65em" }}
                  ></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Create Class
        </button>
      </form>

      <AddLocationModal
        show={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationAdded={handleNewLocationAdded}
      />

      <AddCsoModal
        show={showCsoModal}
        onClose={() => setShowCsoModal(false)}
        onCsoAdded={handleNewCsoAdded}
      />
    </div>
  );
};

export default CreateClass;
