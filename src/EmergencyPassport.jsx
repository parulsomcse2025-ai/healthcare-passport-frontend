import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { QRCodeSVG } from "qrcode.react";

import "./EmergencyPassport.css";
import { supabase } from "./supabase";

const TOKEN_VALIDITY_MS = 10 * 60 * 1000;

function EmergencyPassport({
  onBack,
  healthData,
  setHealthData,
}) {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [token, setToken] = useState("");
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null);
  const [countdown, setCountdown] = useState(0);
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
          .gt("expires_at", new Date().toISOString())
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
          const remainingMs =
            new Date(accessData.expires_at).getTime() -
            Date.now();

          // Ignore/deactivate tokens created by an older version
          // that had a longer expiry period than the current 10-minute rule.
          if (remainingMs > TOKEN_VALIDITY_MS + 5000) {
            await supabase
              .from("emergency_access")
              .update({ is_active: false })
              .eq("id", accessData.id);

            setToken("");
            setTokenExpiresAt(null);
          } else if (remainingMs > 0) {
            setToken(accessData.access_token);
            setTokenExpiresAt(accessData.expires_at);
          } else {
            setToken("");
            setTokenExpiresAt(null);
          }
        } else {
          setToken("");
          setTokenExpiresAt(null);
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
  // TOKEN COUNTDOWN
  // =========================================================

  useEffect(() => {
    if (!token || !tokenExpiresAt) {
      setCountdown(0);
      return;
    }

    const updateCountdown = async () => {
      const remainingMs =
        new Date(tokenExpiresAt).getTime() - Date.now();

      const remainingSeconds = Math.max(
        0,
        Math.ceil(remainingMs / 1000)
      );

      setCountdown(remainingSeconds);

      if (remainingSeconds === 0) {
        setToken("");
        setTokenExpiresAt(null);

        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            await supabase
              .from("emergency_access")
              .update({ is_active: false })
              .eq("patient_id", user.id)
              .eq("access_token", token);
          }
        } catch (error) {
          console.error(
            "Token expiry update error:",
            error
          );
        }
      }
    };

    updateCountdown();

    const interval = setInterval(
      updateCountdown,
      1000
    );

    return () => clearInterval(interval);
  }, [token, tokenExpiresAt]);

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

      // Token valid for 10 minutes
      // This keeps the QR emergency-access window short and time-limited.
      const expiresAt = new Date(
        Date.now() + TOKEN_VALIDITY_MS
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

      setToken(accessData.access_token);
      setTokenExpiresAt(accessData.expires_at);

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
        "Emergency access token and QR code generated successfully! 🔐📱"
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

                <div
                  className="generated-token"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "18px",
                  }}
                >
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

                  <div
                    style={{
                      width: "100%",
                      maxWidth: "420px",
                      marginTop: "8px",
                      padding: "24px",
                      borderRadius: "18px",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        letterSpacing: "0.08em",
                        color: "#475569",
                        marginBottom: "16px",
                      }}
                    >
                      EMERGENCY ACCESS QR
                    </div>

                    <div
                      style={{
                        display: "inline-flex",
                        padding: "14px",
                        background: "#ffffff",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <QRCodeSVG
                        value={token}
                        size={190}
                        level="M"
                        includeMargin={true}
                      />
                    </div>

                    <div
                      style={{
                        marginTop: "18px",
                        fontSize: "14px",
                        color: "#475569",
                      }}
                    >
                      <strong>
                        Patient:
                      </strong>{" "}
                      {displayValue(
                        healthData?.fullName,
                        "Patient"
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "14px",
                        color: "#475569",
                      }}
                    >
                      <strong>
                        Token ID:
                      </strong>{" "}
                      {token}
                    </div>

                    <div
                      style={{
                        marginTop: "16px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: "700",
                        fontSize: "18px",
                      }}
                    >
                      <span>⏱️</span>
                      <span>
                        {String(
                          Math.floor(countdown / 60)
                        ).padStart(2, "0")}
                        :
                        {String(
                          countdown % 60
                        ).padStart(2, "0")}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: "10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "7px",
                        padding: "7px 13px",
                        borderRadius: "999px",
                        background: countdown > 0 ? "#ecfdf5" : "#fef2f2",
                        color: countdown > 0 ? "#047857" : "#b91c1c",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      <span>●</span>
                      {countdown > 0 ? "Valid" : "Expired"}
                    </div>

                  </div>
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