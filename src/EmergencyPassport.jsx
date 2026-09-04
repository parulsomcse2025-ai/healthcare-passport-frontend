import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import "./EmergencyPassport.css";

function EmergencyPassport({ onBack, healthData }) {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [token, setToken] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  // Generate temporary doctor access token
  const generateToken = () => {
    const newToken =
      Math.random().toString(36).substring(2, 6).toUpperCase() +
      "-" +
      Math.random().toString(36).substring(2, 6).toUpperCase();

    setToken(newToken);
  };

  // Get user's current location when emergency mode is activated
  useEffect(() => {
    if (emergencyMode && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        () => {
          // Default location if permission is denied
          setUserLocation([28.9845, 77.7064]);
        }
      );
    }
  }, [emergencyMode]);

  // Sample nearby hospitals
  const hospitals = [
    {
      id: 1,
      name: "City Hospital",
      position: [28.9845, 77.7050],
    },
    {
      id: 2,
      name: "Emergency Care Hospital",
      position: [28.9900, 77.7100],
    },
    {
      id: 3,
      name: "General Medical Center",
      position: [28.9780, 77.7000],
    },
  ];

  // Display fallback text when information is empty
  const displayValue = (value, fallback = "Not provided") => {
    return value && value.trim() !== "" ? value : fallback;
  };

  return (
    <div className="emergency-page">

      {/* HEADER */}
      <header className="emergency-header">
        <div className="emergency-logo-section">

          <div className="emergency-logo">
            +
          </div>

          <div>
            <h2>Healthcare</h2>
            <p>Emergency Medical Passport</p>
          </div>

        </div>

        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>
      </header>


      {/* MAIN CONTENT */}
      <main className="emergency-content">

        {/* PAGE TITLE */}
        <div className="emergency-page-title">

          <div>

            <span className="page-tag">
              EMERGENCY PASSPORT
            </span>

            <h1>
              Emergency Medical Information
            </h1>

            <p>
              Important healthcare information that can be quickly accessed
              during an emergency.
            </p>

          </div>


          <button
            className={`emergency-mode-btn ${
              emergencyMode ? "active" : ""
            }`}
            onClick={() => setEmergencyMode(!emergencyMode)}
          >
            🚨{" "}
            {emergencyMode
              ? "Emergency Mode Active"
              : "Activate Emergency Mode"}
          </button>

        </div>


        {/* EMERGENCY MODE STATUS */}
        {emergencyMode && (
          <div className="emergency-active-banner">

            <div className="pulse-icon">
              🚨
            </div>

            <div>

              <strong>
                EMERGENCY MODE ACTIVE
              </strong>

              <p>
                Your critical medical information is now ready for
                emergency access.
              </p>

            </div>

          </div>
        )}


        {/* EMERGENCY MEDICAL SUMMARY */}
        <section className="emergency-summary-card">

          <div className="card-heading">

            <div className="card-icon">
              ❤️
            </div>

            <div>

              <h2>
                Emergency Medical Summary
              </h2>

              <p>
                Critical information for healthcare professionals
              </p>

            </div>

          </div>


          <div className="emergency-grid">

            <div className="info-box">
              <span>Patient Name</span>
              <strong>
                {displayValue(healthData?.fullName, "Patient")}
              </strong>
            </div>


            <div className="info-box">
              <span>Blood Group</span>
              <strong>
                {displayValue(healthData?.bloodGroup)}
              </strong>
            </div>


            <div className="info-box">
              <span>Allergies</span>
              <strong>
                {displayValue(healthData?.allergies, "No information")}
              </strong>
            </div>


            <div className="info-box">
              <span>Medical Conditions</span>
              <strong>
                {displayValue(
                  healthData?.medicalConditions,
                  "No information"
                )}
              </strong>
            </div>


            <div className="info-box">
              <span>Current Medication</span>
              <strong>
                {displayValue(
                  healthData?.currentMedications,
                  "No medications added"
                )}
              </strong>
            </div>


            <div className="info-box">
              <span>Emergency Contact</span>

              <strong>
                {healthData?.emergencyContactName
                  ? `${healthData.emergencyContactName}${
                      healthData.emergencyPhone
                        ? ` (${healthData.emergencyPhone})`
                        : ""
                    }`
                  : "Not provided"}
              </strong>
            </div>

          </div>

        </section>


        {/* NEARBY HOSPITALS */}
        {emergencyMode && (
          <section className="hospital-card">

            <div className="card-heading">

              <div className="card-icon hospital-icon">
                🏥
              </div>

              <div>

                <h2>
                  Nearby Hospitals
                </h2>

                <p>
                  Healthcare facilities near your location
                </p>

              </div>

            </div>


            {/* MAP */}
            <div className="map-container">

              {userLocation ? (

                <MapContainer
                  center={userLocation}
                  zoom={14}
                  scrollWheelZoom={true}
                  style={{
                    height: "400px",
                    width: "100%",
                  }}
                >

                  {/* MAP TILES */}
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />


                  {/* USER LOCATION */}
                  <Marker position={userLocation}>
                    <Popup>
                      📍 Your Current Location
                    </Popup>
                  </Marker>


                  {/* HOSPITAL MARKERS */}
                  {hospitals.map((hospital) => (
                    <Marker
                      key={hospital.id}
                      position={hospital.position}
                    >
                      <Popup>
                        🏥 <strong>{hospital.name}</strong>

                        <br />

                        Nearby emergency healthcare facility
                      </Popup>
                    </Marker>
                  ))}

                </MapContainer>

              ) : (

                <div className="map-loading">
                  📍 Getting your location...
                </div>

              )}

            </div>

          </section>
        )}


        {/* DOCTOR EMERGENCY TOKEN */}
        {emergencyMode && (
          <section className="token-card">

            <div className="card-heading">

              <div className="card-icon token-icon">
                🔐
              </div>

              <div>

                <h2>
                  Doctor Emergency Access
                </h2>

                <p>
                  Generate a secure temporary token for healthcare
                  professionals.
                </p>

              </div>

            </div>


            <div className="token-content">

              {token ? (

                <div className="generated-token">

                  <span>
                    EMERGENCY ACCESS TOKEN
                  </span>

                  <h2>
                    {token}
                  </h2>

                  <p>
                    Temporary access for emergency medical information
                  </p>

                </div>

              ) : (

                <p className="token-message">
                  Generate a temporary secure token to allow a doctor
                  to access your emergency medical information.
                </p>

              )}


              <button
                className="generate-token-btn"
                onClick={generateToken}
              >
                🔐 Generate Doctor Token
              </button>

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default EmergencyPassport;