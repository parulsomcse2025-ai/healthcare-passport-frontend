import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

import "./EmergencyPassport.css";
import { supabase } from "./supabase";

function EmergencyPassport({
  onBack,
  healthData,
  setHealthData,
}) {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [token, setToken] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [generatingToken, setGeneratingToken] = useState(false);

  // =========================================================
  // DISPLAY FALLBACK
  // =========================================================

  const displayValue = (
    value,
    fallback = "Not provided"
  ) => {
    if (value === null || value === undefined) {
      return fallback;
    }

    const text = String(value).trim();

    return text !== "" ? text : fallback;
  };

  // =========================================================
  // GENERATE RANDOM TOKEN
  // =========================================================

  const createRandomToken = () => {
    const part1 = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();

    const part2 = Math.random()
      .toString(36)
      .substring(2, 6)
      .toUpperCase();

    return `${part1}-${part2}`;
  };

  // =========================================================
  // SAVE EMERGENCY PASSPORT TO SUPABASE
  // =========================================================

  const saveEmergencyPassport = async (
    user,
    dataToSave
  ) => {
    if (!user) {
      return false;
    }

    const emergencySummary = `
Patient: ${displayValue(
      dataToSave?.fullName,
      "Patient"
    )}
Blood Group: ${displayValue(
      dataToSave?.bloodGroup
    )}
Allergies: ${displayValue(
      dataToSave?.allergies,
      "None provided"
    )}
Medical Conditions: ${displayValue(
      dataToSave?.medicalConditions,
      "None provided"
    )}
Current Medications: ${displayValue(
      dataToSave?.currentMedications,
      "None provided"
    )}
Emergency Contact: ${
      dataToSave?.emergencyContactName
        ? `${dataToSave.emergencyContactName}${
            dataToSave?.emergencyPhone
              ? ` (${dataToSave.emergencyPhone})`
              : ""
          }`
        : "Not provided"
    }
    `.trim();

    const { error } = await supabase
      .from("emergency_passports")
      .upsert(
        {
          patient_id: user.id,

          emergency_summary: emergencySummary,

          blood_group:
            dataToSave?.bloodGroup || null,

          allergies:
            dataToSave?.allergies || null,

          critical_conditions:
            dataToSave?.medicalConditions || null,

          current_medications:
            dataToSave?.currentMedications || null,

          emergency_contact:
            dataToSave?.emergencyContactName
              ? `${dataToSave.emergencyContactName}${
                  dataToSave?.emergencyPhone
                    ? ` - ${dataToSave.emergencyPhone}`
                    : ""
                }`
              : null,

          is_active: true,

          updated_at:
            new Date().toISOString(),
        },
        {
          onConflict: "patient_id",
        }
      );

    if (error) {
      console.error(
        "Emergency passport save error:",
        error
      );

      return false;
    }

    return true;
  };

  // =========================================================
  // LOAD EXISTING DATA
  // =========================================================

  useEffect(() => {
    const loadEmergencyData = async () => {
      try {
        // =====================================================
        // GET CURRENT USER
        // =====================================================

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error(
            "Emergency passport user error:",
            userError
          );

          setLoading(false);
          return;
        }

        // =====================================================
        // LOAD PERSONAL PROFILE
        // =====================================================

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error(
            "Profile loading error:",
            profileError
          );
        }

        // =====================================================
        // LOAD HEALTH PROFILE
        // =====================================================

        const {
          data: healthProfile,
          error: healthError,
        } = await supabase
          .from("health_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (healthError) {
          console.error(
            "Health profile loading error:",
            healthError
          );
        }

        // =====================================================
        // CREATE FRESH HEALTH DATA
        // =====================================================

        const freshHealthData = {
          ...healthData,

          // Personal information
          fullName:
            profile?.full_name ||
            healthData?.fullName ||
            user.user_metadata?.full_name ||
            "",

          dateOfBirth:
            profile?.date_of_birth ||
            healthData?.dateOfBirth ||
            "",

          gender:
            profile?.gender ||
            healthData?.gender ||
            "",

          phone:
            profile?.phone ||
            healthData?.phone ||
            "",

          email:
            profile?.email ||
            user.email ||
            healthData?.email ||
            "",

          address:
            profile?.address ||
            healthData?.address ||
            "",

          // Health information
          bloodGroup:
            healthProfile?.blood_group ||
            healthData?.bloodGroup ||
            "",

          allergies:
            healthProfile?.allergies ||
            healthData?.allergies ||
            "",

          medicalConditions:
            healthProfile?.chronic_conditions ||
            healthData?.medicalConditions ||
            "",

          currentMedications:
            healthProfile?.current_medications ||
            healthData?.currentMedications ||
            "",

          // Emergency contact
          emergencyContactName:
            healthProfile?.emergency_contact_name ||
            healthData?.emergencyContactName ||
            "",

          emergencyPhone:
            healthProfile?.emergency_contact_phone ||
            healthData?.emergencyPhone ||
            "",

          // Additional information
          height:
            healthProfile?.height ||
            healthData?.height ||
            "",

          weight:
            healthProfile?.weight ||
            healthData?.weight ||
            "",

          emergencyRelationship:
            healthProfile?.emergency_relationship ||
            healthData?.emergencyRelationship ||
            "",
        };

        // =====================================================
        // UPDATE REACT STATE
        // =====================================================

        setHealthData(freshHealthData);

        // =====================================================
        // SAVE FRESH DATA TO EMERGENCY PASSPORT
        // =====================================================

        await saveEmergencyPassport(
          user,
          freshHealthData
        );

        // =====================================================
        // LOAD ACTIVE EMERGENCY TOKEN
        // =====================================================

        const {
          data: accessData,
          error: accessError,
        } = await supabase
          .from("emergency_access")
          .select("*")
          .eq("patient_id", user.id)
          .eq("is_active", true)
          .gt(
            "expires_at",
            new Date().toISOString()
          )
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (accessError) {
          console.error(
            "Emergency access loading error:",
            accessError
          );
        }

        if (accessData) {
          setToken(
            accessData.access_token
          );
        } else {
          setToken("");
        }
      } catch (error) {
        console.error(
          "Emergency passport loading error:",
          error
        );
      }

      setLoading(false);
    };

    loadEmergencyData();

    // We intentionally load the latest
    // database data once when this page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================
  // GET USER LOCATION
  // =========================================================

  useEffect(() => {
    if (
      emergencyMode &&
      navigator.geolocation
    ) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        () => {
          // Default demo location
          setUserLocation([
            28.9845,
            77.7064,
          ]);
        }
      );
    }
  }, [emergencyMode]);

  // =========================================================
  // GENERATE DOCTOR EMERGENCY TOKEN
  // =========================================================

  const generateToken = async () => {
    try {
      setGeneratingToken(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert(
          "User session not found. Please sign in again."
        );

        setGeneratingToken(false);
        return;
      }

      // =====================================================
      // DEACTIVATE OLD ACTIVE TOKENS
      // =====================================================

      const {
        error: deactivateError,
      } = await supabase
        .from("emergency_access")
        .update({
          is_active: false,
        })
        .eq("patient_id", user.id)
        .eq("is_active", true);

      if (deactivateError) {
        console.error(
          "Old token deactivation error:",
          deactivateError
        );
      }

      // =====================================================
      // CREATE NEW TOKEN
      // =====================================================

      const newToken = createRandomToken();

      // Token valid for 30 minutes
      const expiresAt = new Date(
        Date.now() + 30 * 60 * 1000
      ).toISOString();

      // =====================================================
      // SAVE TOKEN
      // =====================================================

      const {
        data: accessData,
        error: accessError,
      } = await supabase
        .from("emergency_access")
        .insert({
          patient_id: user.id,

          access_token: newToken,

          authorized_user:
            "Emergency Healthcare Professional",

          purpose:
            "Emergency access to critical medical information",

          expires_at: expiresAt,

          is_active: true,
        })
        .select()
        .single();

      if (accessError) {
        console.error(
          "Token save error:",
          accessError
        );

        alert(
          "Could not generate emergency token: " +
            accessError.message
        );

        setGeneratingToken(false);
        return;
      }

      // =====================================================
      // UPDATE UI
      // =====================================================

      setToken(
        accessData.access_token
      );

      // =====================================================
      // CREATE ACCESS LOG
      // =====================================================

      const {
        error: logError,
      } = await supabase
        .from("emergency_access_logs")
        .insert({
          patient_id: user.id,

          access_id: accessData.id,

          accessed_by:
            "Patient - Emergency Token Generation",

          access_type:
            "Emergency access token generated",

          accessed_at:
            new Date().toISOString(),
        });

      if (logError) {
        console.error(
          "Emergency access log error:",
          logError
        );
      }

      alert(
        "Emergency access token generated successfully! 🔐"
      );
    } catch (error) {
      console.error(
        "Token generation error:",
        error
      );

      alert(
        "Something went wrong while generating the token."
      );
    }

    setGeneratingToken(false);
  };

  // =========================================================
  // NEARBY HOSPITALS
  // =========================================================

  const hospitals = [
    {
      id: 1,
      name: "City Hospital",
      position: [
        28.9845,
        77.7050,
      ],
    },

    {
      id: 2,
      name: "Emergency Care Hospital",
      position: [
        28.9900,
        77.7100,
      ],
    },

    {
      id: 3,
      name: "General Medical Center",
      position: [
        28.9780,
        77.7000,
      ],
    },
  ];

  // =========================================================
  // LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <div className="emergency-page">
        <div
          style={{
            padding: "60px",
            textAlign: "center",
          }}
        >
          <h2>
            Loading Emergency Medical Passport...
          </h2>

          <p>
            Preparing your emergency information.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="emergency-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="emergency-header">

        <div className="emergency-logo-section">

          <div className="emergency-logo">
            +
          </div>

          <div>
            <h2>Healthcare</h2>

            <p>
              Emergency Medical Passport
            </p>
          </div>

        </div>

        <button
          className="back-btn"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="emergency-content">

        {/* ===================================================
            PAGE TITLE
        ==================================================== */}

        <div className="emergency-page-title">

          <div>

            <span className="page-tag">
              EMERGENCY PASSPORT
            </span>

            <h1>
              Emergency Medical Information
            </h1>

            <p>
              Important healthcare information that can be
              quickly accessed during an emergency.
            </p>

          </div>


          <button
            className={`emergency-mode-btn ${
              emergencyMode
                ? "active"
                : ""
            }`}
            onClick={() =>
              setEmergencyMode(
                !emergencyMode
              )
            }
          >
            🚨{" "}
            {emergencyMode
              ? "Emergency Mode Active"
              : "Activate Emergency Mode"}
          </button>

        </div>


        {/* ===================================================
            EMERGENCY MODE STATUS
        ==================================================== */}

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
                Your critical medical information is now
                ready for emergency access.
              </p>

            </div>

          </div>

        )}


        {/* ===================================================
            EMERGENCY MEDICAL SUMMARY
        ==================================================== */}

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
                Critical information for healthcare
                professionals
              </p>

            </div>

          </div>


          <div className="emergency-grid">

            {/* PATIENT NAME */}

            <div className="info-box">

              <span>
                Patient Name
              </span>

              <strong>
                {displayValue(
                  healthData?.fullName,
                  "Patient"
                )}
              </strong>

            </div>


            {/* BLOOD GROUP */}

            <div className="info-box">

              <span>
                Blood Group
              </span>

              <strong>
                {displayValue(
                  healthData?.bloodGroup
                )}
              </strong>

            </div>


            {/* ALLERGIES */}

            <div className="info-box">

              <span>
                Allergies
              </span>

              <strong>
                {displayValue(
                  healthData?.allergies,
                  "No information"
                )}
              </strong>

            </div>


            {/* MEDICAL CONDITIONS */}

            <div className="info-box">

              <span>
                Medical Conditions
              </span>

              <strong>
                {displayValue(
                  healthData?.medicalConditions,
                  "No information"
                )}
              </strong>

            </div>


            {/* MEDICATIONS */}

            <div className="info-box">

              <span>
                Current Medication
              </span>

              <strong>
                {displayValue(
                  healthData?.currentMedications,
                  "No medications added"
                )}
              </strong>

            </div>


            {/* EMERGENCY CONTACT */}

            <div className="info-box">

              <span>
                Emergency Contact
              </span>

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


        {/* ===================================================
            NEARBY HOSPITALS
        ==================================================== */}

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

                  <Marker
                    position={userLocation}
                  >

                    <Popup>
                      📍 Your Current Location
                    </Popup>

                  </Marker>


                  {/* HOSPITAL MARKERS */}

                  {hospitals.map(
                    (hospital) => (

                      <Marker
                        key={hospital.id}
                        position={
                          hospital.position
                        }
                      >

                        <Popup>

                          🏥{" "}
                          <strong>
                            {hospital.name}
                          </strong>

                          <br />

                          Nearby emergency
                          healthcare facility

                        </Popup>

                      </Marker>

                    )
                  )}

                </MapContainer>

              ) : (

                <div className="map-loading">

                  📍 Getting your location...

                </div>

              )}

            </div>

          </section>

        )}


        {/* ===================================================
            DOCTOR EMERGENCY TOKEN
        ==================================================== */}

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
                  Generate a secure temporary token for
                  healthcare professionals.
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
                    Temporary access for emergency
                    medical information
                  </p>

                </div>

              ) : (

                <p className="token-message">

                  Generate a temporary secure token to allow
                  a doctor to access your emergency medical
                  information.

                </p>

              )}


              <button
                className="generate-token-btn"
                onClick={generateToken}
                disabled={generatingToken}
              >

                {generatingToken
                  ? "🔄 Generating..."
                  : "🔐 Generate Doctor Token"}

              </button>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default EmergencyPassport;