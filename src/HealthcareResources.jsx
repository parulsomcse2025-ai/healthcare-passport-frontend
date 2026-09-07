import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./HealthcareResources.css";
import ResourceMap from "./ResourceMap";

function HealthcareResources({ onBack }) {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("healthcare_resources")
      .select(
        "id, name, resource_type, address, city, latitude, longitude, phone, availability_status"
      )
      .order("name", { ascending: true });

    if (error) {
      console.error("Healthcare resources error:", error);
      setResources([]);
    } else {
      console.log("Healthcare resources:", data);
      setResources(data || []);
    }

    setLoading(false);
  };

  const filteredResources = resources.filter((resource) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      resource.name?.toLowerCase().includes(searchText) ||
      resource.city?.toLowerCase().includes(searchText) ||
      resource.address?.toLowerCase().includes(searchText);

    const matchesType =
      typeFilter === "All" ||
      resource.resource_type?.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  return (
    <div className="resource-page">
      <div className="resource-header">
        <button className="resource-back-btn" onClick={onBack}>
          ← Back
        </button>

        <div>
          <h1>Healthcare Resources</h1>
          <p>
            Find suitable healthcare resources based on your needs.
          </p>
        </div>
      </div>

      <div className="resource-search-section">
        <input
          type="text"
          placeholder="Search hospital, clinic, pharmacy..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">All Resources</option>
          <option value="Hospital">Hospitals</option>
          <option value="Clinic">Clinics</option>
          <option value="Pharmacy">Pharmacies</option>
          <option value="Blood Bank">Blood Banks</option>
        </select>
      </div>

      {loading ? (
        <div className="resource-loading">
          <p>Loading healthcare resources...</p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="resource-empty">
          <div>🔍</div>
          <h3>No resources found</h3>
          <p>Try changing your search or filter.</p>
        </div>
      ) : (
        <div className="resource-grid">
          {filteredResources.map((resource) => (
            <div className="resource-card" key={resource.id}>
              <div className="resource-card-top">
                <div className="resource-icon">
                  {resource.resource_type === "Hospital"
                    ? "🏥"
                    : resource.resource_type === "Clinic"
                    ? "🩺"
                    : resource.resource_type === "Pharmacy"
                    ? "💊"
                    : resource.resource_type === "Blood Bank"
                    ? "🩸"
                    : "🏥"}
                </div>

                <span
                  className={`resource-status ${
                    resource.availability_status === "available"
                      ? "available"
                      : "limited"
                  }`}
                >
                  {resource.availability_status === "available"
                    ? "Available"
                    : "Limited"}
                </span>
              </div>

              <h2>{resource.name}</h2>

              <p className="resource-type">
                {resource.resource_type}
              </p>

              <div className="resource-info">
                <p>
                  📍 {resource.address}
                  {resource.city ? `, ${resource.city}` : ""}
                </p>

                {resource.phone && (
                  <p>📞 {resource.phone}</p>
                )}
              </div>

              <button
                className="resource-map-btn"
                onClick={() => {
                  if (resource.latitude && resource.longitude) {
                    window.open(
                      `https://www.openstreetmap.org/?mlat=${resource.latitude}&mlon=${resource.longitude}#map=16/${resource.latitude}/${resource.longitude}`,
                      "_blank"
                    );
                  }
                }}
              >
                📍 View Location
              </button>
            </div>
          ))}
        </div>
      )}

      {/*==========Resource Map Section==========*/}
      <ResourceMap resources={filteredResources} />
    </div>
  );
}

export default HealthcareResources;