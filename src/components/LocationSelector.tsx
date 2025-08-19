import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api"; // Change to your API URL

interface Location {
  code: string;
  name: string;
}

export default function LocationSelectorModal() {
  const [regions, setRegions] = useState<Location[]>([]);
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [cities_municipalities, setCitiesMunicipalities] = useState<Location[]>(
    []
  );
  const [barangays, setBarangays] = useState<Location[]>([]);
  const [subMunicipalities, setSubMunicipalities] = useState<Location[]>([]);

  const [selectedSubMunicipality, setSelectedSubMunicipality] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedCityMunicipality, setSelectedCity] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");

  // Load regions
  useEffect(() => {
    axios
      .get(`${API_BASE}/regions`)
      .then((res) => {
        const mappedRegions = res.data.map((r: { [x: string]: unknown }) => ({
          code: r["10-digit PSGC"],
          name: r["Name"],
        }));
        setRegions(mappedRegions);
      })
      .catch((err) => console.error("❌ Error loading regions:", err));
  }, []);

  // Load provinces
  useEffect(() => {
    if (selectedRegion) {
      axios
        .get(`${API_BASE}/provinces?region_code=${selectedRegion}`)
        .then((res) => {
          const mappedProvinces = res.data.map(
            (r: { [x: string]: unknown }) => ({
              code: r["10-digit PSGC"],
              name: r["Name"],
            })
          );
          setProvinces(mappedProvinces);

          if (mappedProvinces.length === 0) {
            axios
              .get(`${API_BASE}/citi_muni?region_code=${selectedRegion}`)
              .then((cityRes) => {
                const mappedCities = cityRes.data.map(
                  (r: { [x: string]: unknown }) => ({
                    code: r["10-digit PSGC"],
                    name: r["Name"],
                  })
                );
                setCitiesMunicipalities(mappedCities);
              });
          }
        });
    }
  }, [selectedRegion]);

  // Load cities
  useEffect(() => {
    if (selectedProvince) {
      axios
        .get(`${API_BASE}/citi_muni?province_code=${selectedProvince}`)
        .then((res) => {
          const mappedCities = res.data.map((r: { [x: string]: unknown }) => ({
            code: r["10-digit PSGC"],
            name: r["Name"],
          }));
          setCitiesMunicipalities(mappedCities);
        });
    }
  }, [selectedProvince]);

  // Load sub-muni or barangays
  useEffect(() => {
    if (selectedCityMunicipality) {
      axios
        .get(`${API_BASE}/sub_muni?city_code=${selectedCityMunicipality}`)
        .then((res) => {
          if (res.data.length > 0) {
            setSubMunicipalities(res.data);
          } else {
            setSubMunicipalities([]);
            axios
              .get(
                `${API_BASE}/barangays?municipality_code=${selectedCityMunicipality}`
              )
              .then((res) => {
                const mappedBarangay = res.data.map(
                  (r: { [x: string]: unknown }) => ({
                    code: r["10-digit PSGC"],
                    name: r["Name"],
                  })
                );
                setBarangays(mappedBarangay);
              });
          }
        });
    }
  }, [selectedCityMunicipality]);

  // Load barangays for sub-muni
  useEffect(() => {
    if (selectedSubMunicipality) {
      axios
        .get(
          `${API_BASE}/barangays?municipality_code=${selectedSubMunicipality}`
        )
        .then((res) => {
          const mappedBarangay = res.data.map(
            (r: { [x: string]: unknown }) => ({
              code: r["10-digit PSGC"],
              name: r["Name"],
            })
          );
          setBarangays(mappedBarangay);
        });
    }
  }, [selectedSubMunicipality]);
  return (
    <>
      {/* REGION */}
      <div className="mb-3">
        <label htmlFor="label" className="form-label">
          Region
        </label>
        <select
          className="form-select"
          aria-label="Default select example"
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
        >
          <option value="">-- Select Region --</option>
          {regions.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </select>
      </div>
      {/* Province */}
      <div className="mb-3">
        <label htmlFor="label" className="form-label">
          Province
        </label>
        <select
          className="form-select"
          aria-label="Default select example"
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          id="label"
        >
          <option value="">-- Select Province --</option>
          {provinces.map((province) => (
            <option key={province.code} value={province.code}>
              {province.name}
            </option>
          ))}
        </select>
      </div>
      {/* City and Municipality */}
      <div className="mb-3">
        <label htmlFor="label" className="form-label">
          City/Municipality
        </label>
        <select
          className="form-select"
          aria-label="Default select example"
          value={selectedCityMunicipality}
          onChange={(e) => setSelectedCity(e.target.value)}
          id="label"
        >
          <option value="">-- Select City/Municipality --</option>
          {cities_municipalities.map((cities_municipalities) => (
            <option
              key={cities_municipalities.code}
              value={cities_municipalities.code}
            >
              {cities_municipalities.name}
            </option>
          ))}
        </select>
      </div>
      {/* Sub-Municipality */}
      <div>
        {subMunicipalities.length > 0 && (
          <>
            <label htmlFor="label" className="form-label">
              Sub-Municipality
            </label>
            <select
              value={selectedSubMunicipality}
              onChange={(e) => setSelectedSubMunicipality(e.target.value)}
              className="form-control"
            >
              <option value="">-- Select Sub-Municipality --</option>
              {subMunicipalities.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
      {/* Barangay */}
      <div className="mb-3">
        <label htmlFor="label" className="form-label">
          Barangay
        </label>
        <select
          className="form-select"
          aria-label="Default select example"
          value={selectedBarangay}
          onChange={(e) => setSelectedBarangay(e.target.value)}
          id="label"
        >
          <option value="">-- Select Barangay --</option>
          {barangays.map((barangays) => (
            <option key={barangays.code} value={barangays.code}>
              {barangays.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
