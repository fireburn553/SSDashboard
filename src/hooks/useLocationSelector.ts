/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_LOCATION_SELECTOR_API;

export interface Location {
  code: string;
  name: string;
}

// This is the final, corrected hook that handles all scenarios.
export function useLocationSelector() {
  const [regions, setRegions] = useState<Location[]>([]);
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [municipalities, setMunicipalities] = useState<Location[]>([]);
  const [subMunicipalities, setSubMunicipalities] = useState<Location[]>([]);
  const [barangays, setBarangays] = useState<Location[]>([]);

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedMunicipality, setSelectedMunicipality] = useState("");
  const [selectedSubMunicipality, setSelectedSubMunicipality] = useState("");

  const loadLocations = async (url: string): Promise<any[]> => {
    try {
      const res = await axios.get(url);
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error(`❌ Error loading locations from ${url}:`, err);
      return [];
    }
  };

  // Load regions on mount
  useEffect(() => {
    (async () => {
      const regionsData = await loadLocations(`${API_BASE}/regions`);
      setRegions(regionsData.map((r: any) => ({ code: r["10-digit PSGC"], name: r["Name"] })));
    })();
  }, []);

  // When region changes, load its provinces OR its municipalities if it has no provinces (e.g., NCR)
  useEffect(() => {
    setProvinces([]);
    setMunicipalities([]);
    setSubMunicipalities([]);
    setBarangays([]);
    setSelectedProvince("");
    setSelectedMunicipality("");
    setSelectedSubMunicipality("");

    if (!selectedRegion) return;

    (async () => {
      const provincesData = await loadLocations(`${API_BASE}/provinces?region_code=${selectedRegion}`);
      if (provincesData.length > 0) {
        setProvinces(provincesData.map((p: any) => ({ code: p["10-digit PSGC"], name: p["Name"] })));
      } else {
        // This is the fix for regions with no provinces
        const citiesData = await loadLocations(`${API_BASE}/citi_muni?region_code=${selectedRegion}`);
        setMunicipalities(citiesData.map((c: any) => ({ code: c["10-digit PSGC"], name: c["Name"] })));
      }
    })();
  }, [selectedRegion]);

  // When province changes, load its municipalities
  useEffect(() => {
    setMunicipalities([]);
    setSubMunicipalities([]);
    setBarangays([]);
    setSelectedMunicipality("");
    setSelectedSubMunicipality("");

    if (!selectedProvince) return;

    (async () => {
      const citiesData = await loadLocations(`${API_BASE}/citi_muni?province_code=${selectedProvince}`);
      setMunicipalities(citiesData.map((c: any) => ({ code: c["10-digit PSGC"], name: c["Name"] })));
    })();
  }, [selectedProvince]);

  // When municipality changes, load its sub-municipalities OR its barangays if it has no sub-municipalities
  useEffect(() => {
    setSubMunicipalities([]);
    setBarangays([]);
    setSelectedSubMunicipality("");

    if (!selectedMunicipality) return;

    (async () => {
      const subMuniData = await loadLocations(`${API_BASE}/sub_muni?city_code=${selectedMunicipality}`);
      if (subMuniData.length > 0) {
        // This is the fix for cities with sub-municipalities
        setSubMunicipalities(subMuniData.map((s: any) => ({ code: s["10-digit PSGC"], name: s["Name"] })));
      } else {
        const barangayData = await loadLocations(`${API_BASE}/barangays?municipality_code=${selectedMunicipality}`);
        setBarangays(barangayData.map((b: any) => ({ code: b["10-digit PSGC"], name: b["Name"] })));
      }
    })();
  }, [selectedMunicipality]);

  // When sub-municipality changes, load its barangays
  useEffect(() => {
    setBarangays([]);
    if (!selectedSubMunicipality) return;
    (async () => {
      const barangayData = await loadLocations(`${API_BASE}/barangays?municipality_code=${selectedSubMunicipality}`);
      setBarangays(barangayData.map((b: any) => ({ code: b["10-digit PSGC"], name: b["Name"] })));
    })();
  }, [selectedSubMunicipality]);

  return {
    regions,
    provinces,
    municipalities,
    subMunicipalities,
    barangays,
    handleRegionChange: setSelectedRegion,
    handleProvinceChange: setSelectedProvince,
    handleMunicipalityChange: setSelectedMunicipality,
    handleSubMunicipalityChange: setSelectedSubMunicipality,
  };
}