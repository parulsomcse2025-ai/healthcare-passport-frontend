import { useState } from "react";
import "./DoctorEmergencyAccess.css";
import { supabase } from "./supabase";

function DoctorEmergencyAccess({ onBack }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patientInfo, setPatientInfo] = useState(null);

  const verifyToken = async () => {
    setError("");
    setPatientInfo(null);

    const enteredToken = token.trim().toUpperCase();

    if (!enteredToken) {
      setError("Please enter the emergency access token.");
      return;
    }

    try {
      setLoading(true);

      const { data, error: rpcError } = await supabase.rpc(
        "verify_emergency_access",
        {
          input_token: enteredToken,
        }
      );

      if (rpcError) {
        console.error("Emergency access error:", rpcError);

        const errorMessage = rpcError.message || "";

        if (errorMessage.includes("TOKEN_EXPIRED")) {
          setError(
            "This emergency token has expired. Please generate a new token."
          );
        } else if (errorMessage.includes("INVALID_OR_INACTIVE_TOKEN")) {
          setError("Invalid or inactive emergency token.");
        } else if (errorMessage.includes("PATIENT_NOT_FOUND")) {
          setError("Patient information could not be found.");
        } else if (
          errorMessage.includes("EMERGENCY_PASSPORT_NOT_FOUND")
        ) {
          setError("Emergency passport is not available for this patient.");
        } else {
          setError(
            "Unable to access emergency information. Please try again."
          );
        }

        return;
      }

      if (!data || data.length === 0) {
        setError("No emergency information was found.");
        return;
      }

      setPatientInfo(data[0]);

      alert("Emergency access verified successfully! 🔐");
    } catch (error) {
      console.error("Verification error:", error);
      setError(
        "Something went wrong while verifying the emergency token."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearAccess = () => {
    setPatientInfo(null);
    setToken("");
    setError("");
  };

  return (
    <div className="doctor-access-page">
      <header className="doctor-access-header">
        <div className="doctor-access-logo-section">
          <div className="doctor-access-logo">+</div>

          <div>
            <h2>Healthcare</h2>
            <p>Doctor Emergency Access</p>
          </div>
        </div>

        <button className="doctor-back-btn" onClick={onBack}>
          ← Back
        </button>
      </header>

      <main className="doctor-access-content">
        {!patientInfo ? (
          <div className="doctor-access-card">
            <div className="doctor-access-icon">🔐</div>

            <span className="doctor-access-tag">
              CONTROLLED EMERGENCY ACCESS
            </span>

            <h1>Emergency Medical Access</h1>

            <p className="doctor-access-description">
              Enter the temporary emergency access token provided
              by the patient to securely access their critical
              medical information.
            </p>

            <div className="token-input-section">
              <label>Emergency Access Token</label>

              <input
                type="text"
                placeholder="Example: AB12-CD34"
                value={token}
                onChange={(e) =>
                  setToken(e.target.value.toUpperCase())
                }
                maxLength={9}
              />
            </div>

            {error && (
              <div className="token-error">
                ⚠️ {error}
              </div>
            )}

            <button
              className="verify-token-btn"
              onClick={verifyToken}
              disabled={loading}
            >
              {loading
                ? "🔄 Verifying..."
                : "🔓 Verify Emergency Token"}
            </button>

            <div className="access-information">
              <div className="information-icon">🛡️</div>

              <div>
                <strong>Controlled Access</strong>

                <p>
                  Emergency access is temporary and expires
                  automatically. Access activity is recorded
                  for security and auditing.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="emergency-medical-card">
            <div className="emergency-success-header">
              <div className="success-icon">✓</div>

              <div>
                <span>ACCESS VERIFIED</span>
                <h1>Emergency Medical Information</h1>
              </div>
            </div>

            <div className="patient-basic-info">
              <h2>Patient Information</h2>

              <div className="patient-name">
                {patientInfo.patient_name}
              </div>
            </div>

            <div className="critical-alert">
              <span>🚨</span>

              <div>
                <strong>Emergency Information</strong>

                <p>
                  This information is provided through the
                  patient's controlled emergency passport.
                </p>
              </div>
            </div>

            <div className="medical-info-grid">
              <div className="medical-info-box">
                <span>🩸 Blood Group</span>

                <strong>
                  {patientInfo.blood_group || "Not available"}
                </strong>
              </div>

              <div className="medical-info-box">
                <span>⚠️ Allergies</span>

                <strong>
                  {patientInfo.allergies || "None recorded"}
                </strong>
              </div>

              <div className="medical-info-box">
                <span>🏥 Critical Conditions</span>

                <strong>
                  {patientInfo.critical_conditions ||
                    "None recorded"}
                </strong>
              </div>

              <div className="medical-info-box">
                <span>💊 Current Medications</span>

                <strong>
                  {patientInfo.current_medications ||
                    "None recorded"}
                </strong>
              </div>
            </div>

            <div className="emergency-contact-box">
              <span>📞 Emergency Contact</span>

              <strong>
                {patientInfo.emergency_contact ||
                  "Not available"}
              </strong>
            </div>

            <div className="minimum-information-note">
              <span>🛡️</span>

              <p>
                Only the minimum necessary emergency medical
                information is displayed. Access activity is
                recorded for security and auditing.
              </p>
            </div>

            <button
              className="close-emergency-access-btn"
              onClick={clearAccess}
            >
              🔒 Close Emergency Access
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default DoctorEmergencyAccess;