import { useEffect, useState } from "react";
import "./HealthProfile.css";
import { supabase } from "./supabase";

function HealthProfile({
  onBack,
  healthData,
  setHealthData,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ================= LOAD PROFILE =================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("User not found:", userError);
          setLoading(false);
          return;
        }

        // Get personal information
        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) {
          console.error("Profile loading error:", profileError);
        }

        // Get health information
        const { data: healthProfile, error: healthError } =
          await supabase
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

        // Update React state with database data
        setHealthData((currentData) => ({
          ...currentData,

          // Personal information
          fullName:
            profile?.full_name ||
            currentData.fullName ||
            user.user_metadata?.full_name ||
            "",

          dateOfBirth:
            profile?.date_of_birth ||
            currentData.dateOfBirth ||
            "",

          gender:
            profile?.gender ||
            currentData.gender ||
            "",

          phone:
            profile?.phone ||
            currentData.phone ||
            "",

          email:
            profile?.email ||
            user.email ||
            currentData.email ||
            "",

          address:
            profile?.address ||
            currentData.address ||
            "",

          // Health information
          bloodGroup:
            healthProfile?.blood_group ||
            currentData.bloodGroup ||
            "",

          allergies:
            healthProfile?.allergies ||
            currentData.allergies ||
            "",

          medicalConditions:
            healthProfile?.chronic_conditions ||
            currentData.medicalConditions ||
            "",

          currentMedications:
            healthProfile?.current_medications ||
            currentData.currentMedications ||
            "",

          // Emergency contact
          emergencyContactName:
            healthProfile?.emergency_contact_name ||
            currentData.emergencyContactName ||
            "",

          emergencyPhone:
            healthProfile?.emergency_contact_phone ||
            currentData.emergencyPhone ||
            "",

          // Additional health and emergency information
          height:
            healthProfile?.height ||
            currentData.height ||
            "",

          weight:
            healthProfile?.weight ||
            currentData.weight ||
            "",

          emergencyRelationship:
            healthProfile?.emergency_relationship ||
            currentData.emergencyRelationship ||
            "",
        }));

      } catch (error) {
        console.error("Error loading health profile:", error);
      }

      setLoading(false);
    };

    loadProfile();
  }, [setHealthData]);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setHealthData({
      ...healthData,
      [name]: value,
    });
  };

  // ================= SAVE PROFILE =================
  const handleSave = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("User session not found. Please sign in again.");
        setSaving(false);
        return;
      }

      // ================= SAVE PERSONAL INFORMATION =================
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: healthData.fullName || "New User",
          email: healthData.email || user.email,
          phone: healthData.phone || null,
          date_of_birth: healthData.dateOfBirth || null,
          gender: healthData.gender || null,
          address: healthData.address || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (profileError) {
        console.error(
          "Personal profile save error:",
          profileError
        );

        alert(
          "Could not save personal information: " +
            profileError.message
        );

        setSaving(false);
        return;
      }

      // ================= SAVE HEALTH INFORMATION =================
      const { error: healthError } = await supabase
        .from("health_profiles")
        .upsert(
          {
            user_id: user.id,
            blood_group: healthData.bloodGroup || null,
            allergies: healthData.allergies || null,
            chronic_conditions:
              healthData.medicalConditions || null,
            current_medications:
              healthData.currentMedications || null,
            emergency_contact_name:
              healthData.emergencyContactName || null,
            emergency_contact_phone:
              healthData.emergencyPhone || null,

            height:
              healthData.height || null,

            weight:
              healthData.weight || null,

            emergency_relationship:
              healthData.emergencyRelationship || null,

            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (healthError) {
        console.error(
          "Health profile save error:",
          healthError
        );

        alert(
          "Could not save health information: " +
            healthError.message
        );

        setSaving(false);
        return;
      }

      alert("Health profile saved successfully! ✅");

      setIsEditing(false);
    } catch (error) {
      console.error("Save error:", error);

      alert(
        "Something went wrong while saving your profile."
      );
    }

    setSaving(false);
  };

  // ================= DATE DISPLAY FORMAT =================
  // Date input uses YYYY-MM-DD, but we display it as DD/MM/YYYY.
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "Not provided";

    const parts = dateString.split("-");

    if (parts.length !== 3) {
      return dateString;
    }

    const [year, month, day] = parts;

    if (!year || !month || !day) {
      return dateString;
    }

    return `${day}/${month}/${year}`;
  };

  // ================= DISPLAY FALLBACK =================
  const displayValue = (
    value,
    fallback = "Not provided"
  ) => {
    return value && value.trim() !== ""
      ? value
      : fallback;
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="health-profile-page">
        <div
          style={{
            padding: "50px",
            textAlign: "center",
          }}
        >
          Loading your health profile...
        </div>
      </div>
    );
  }

  return (
    <div className="health-profile-page">

      {/* ================= HEADER ================= */}
      <header className="health-profile-header">

        <div>
          <p className="profile-label">
            HEALTH PROFILE
          </p>

          <h1>My Health Profile</h1>

          <p>
            Manage your personal and important healthcare
            information.
          </p>
        </div>

        <div className="profile-header-buttons">

          {/* GO TO DASHBOARD */}
          <button
            className="back-profile-button"
            onClick={onBack}
          >
            ← Go to Dashboard
          </button>

          {/* EDIT PROFILE */}
          <button
            className="edit-profile-button"
            onClick={() => setIsEditing(true)}
          >
            ✏️ Edit Profile
          </button>

        </div>

      </header>


      {/* ================= EDIT MODE ================= */}
      {isEditing ? (

        <form
          className="profile-edit-form"
          onSubmit={handleSave}
        >

          {/* ================= PERSONAL INFORMATION ================= */}
          <section className="profile-section">

            <div className="section-title">
              <div className="section-icon">👤</div>

              <div>
                <h2>Personal Information</h2>
                <p>Your basic personal details</p>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>Full Name</label>

                <input
                  type="text"
                  name="fullName"
                  value={healthData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>


              <div className="form-group">
                <label>Date of Birth</label>

                <input
                  type="date"
                  name="dateOfBirth"
                  value={healthData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>


              <div className="form-group">
                <label>Gender</label>

                <select
                  name="gender"
                  value={healthData.gender}
                  onChange={handleChange}
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Other">
                    Other
                  </option>

                  <option value="Prefer not to say">
                    Prefer not to say
                  </option>
                </select>
              </div>


              <div className="form-group">
                <label>Phone Number</label>

                <input
                  type="tel"
                  name="phone"
                  value={healthData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>


              <div className="form-group">
                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  value={healthData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
              </div>


              <div className="form-group">
                <label>Address</label>

                <input
                  type="text"
                  name="address"
                  value={healthData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                />
              </div>

            </div>

          </section>


          {/* ================= HEALTH INFORMATION ================= */}
          <section className="profile-section">

            <div className="section-title">
              <div className="section-icon">❤️</div>

              <div>
                <h2>Health Information</h2>
                <p>
                  Important information about your health
                </p>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>Blood Group</label>

                <select
                  name="bloodGroup"
                  value={healthData.bloodGroup}
                  onChange={handleChange}
                >
                  <option value="">
                    Select blood group
                  </option>

                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>


              <div className="form-group">
                <label>Height</label>

                <input
                  type="text"
                  name="height"
                  value={healthData.height}
                  onChange={handleChange}
                  placeholder="e.g. 165 cm"
                />
              </div>


              <div className="form-group">
                <label>Weight</label>

                <input
                  type="text"
                  name="weight"
                  value={healthData.weight}
                  onChange={handleChange}
                  placeholder="e.g. 60 kg"
                />
              </div>


              <div className="form-group">
                <label>Allergies</label>

                <input
                  type="text"
                  name="allergies"
                  value={healthData.allergies}
                  onChange={handleChange}
                  placeholder="Enter allergies, if any"
                />
              </div>

            </div>

          </section>


          {/* ================= MEDICAL INFORMATION ================= */}
          <section className="profile-section">

            <div className="section-title">
              <div className="section-icon">🩺</div>

              <div>
                <h2>Medical Information</h2>
                <p>Conditions and medications</p>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-group full-width">
                <label>
                  Existing Medical Conditions
                </label>

                <textarea
                  name="medicalConditions"
                  value={healthData.medicalConditions}
                  onChange={handleChange}
                  placeholder="Enter existing medical conditions"
                />
              </div>


              <div className="form-group full-width">
                <label>
                  Current Medications
                </label>

                <textarea
                  name="currentMedications"
                  value={healthData.currentMedications}
                  onChange={handleChange}
                  placeholder="Enter current medications"
                />
              </div>

            </div>

          </section>


          {/* ================= EMERGENCY CONTACT ================= */}
          <section className="profile-section emergency-profile-section">

            <div className="section-title">

              <div className="section-icon emergency-icon-profile">
                🚨
              </div>

              <div>
                <h2>Emergency Contact</h2>

                <p>
                  Someone who can be contacted in an emergency
                </p>
              </div>

            </div>

            <div className="form-grid">

              <div className="form-group">
                <label>Contact Name</label>

                <input
                  type="text"
                  name="emergencyContactName"
                  value={healthData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Enter contact name"
                />
              </div>


              <div className="form-group">
                <label>Relationship</label>

                <input
                  type="text"
                  name="emergencyRelationship"
                  value={healthData.emergencyRelationship}
                  onChange={handleChange}
                  placeholder="e.g. Parent, Sibling"
                />
              </div>


              <div className="form-group">
                <label>Phone Number</label>

                <input
                  type="tel"
                  name="emergencyPhone"
                  value={healthData.emergencyPhone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

            </div>

          </section>


          {/* ================= FORM BUTTONS ================= */}
          <div className="profile-form-buttons">

            <button
              type="button"
              className="cancel-profile-btn"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="save-profile-btn"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Profile"}
            </button>

          </div>

        </form>

      ) : (

        /* ================= VIEW MODE ================= */
        <>

          {/* ================= PERSONAL INFORMATION ================= */}
          <section className="profile-section">

            <div className="section-title">
              <div className="section-icon">👤</div>

              <div>
                <h2>Personal Information</h2>
                <p>Your basic personal details</p>
              </div>
            </div>

            <div className="profile-grid">

              <div className="profile-field">
                <span>Full Name</span>

                <strong>
                  {displayValue(
                    healthData.fullName,
                    "Patient"
                  )}
                </strong>
              </div>


              <div className="profile-field">
                <span>Date of Birth</span>

                <strong>
                  {formatDateForDisplay(
                    healthData.dateOfBirth
                  )}
                </strong>
              </div>


              <div className="profile-field">
                <span>Gender</span>

                <strong>
                  {displayValue(
                    healthData.gender
                  )}
                </strong>
              </div>


              <div className="profile-field">
                <span>Phone Number</span>

                <strong>
                  {displayValue(
                    healthData.phone
                  )}
                </strong>
              </div>


              <div className="profile-field">
                <span>Email Address</span>

                <strong>
                  {displayValue(
                    healthData.email
                  )}
                </strong>
              </div>


              <div className="profile-field">
                <span>Address</span>

                <strong>
                  {displayValue(
                    healthData.address
                  )}
                </strong>
              </div>

            </div>

          </section>


          {/* ================= HEALTH INFORMATION ================= */}
          <section className="profile-section">

            <div className="section-title">
              <div className="section-icon">❤️</div>

              <div>
                <h2>Health Information</h2>

                <p>
                  Important information about your health
                </p>
              </div>
            </div>

            <div className="profile-grid">

              <div className="profile-field">
                <span>Blood Group</span>

                <strong>
                  {displayValue(
                    healthData.bloodGroup
                  )}
                </strong>
              </div>


              <div className="profile-field">
                <span>Height</span>

                <strong>
                  {displayValue(
                    healthData.height
                  )}
                </strong>
              </div>


              <div className="profile-field">
                <span>Weight</span>

                <strong>
                  {displayValue(
                    healthData.weight
                  )}
                </strong>
              </div>


              <div className="profile-field">
                <span>Allergies</span>

                <strong>
                  {displayValue(
                    healthData.allergies,
                    "No information"
                  )}
                </strong>
              </div>

            </div>

          </section>


          {/* ================= MEDICAL INFORMATION ================= */}
          <section className="profile-section">

            <div className="section-title">
              <div className="section-icon">🩺</div>

              <div>
                <h2>Medical Information</h2>

                <p>
                  Conditions and medications
                </p>
              </div>
            </div>


            <div className="large-profile-field">

              <span>
                Existing Medical Conditions
              </span>

              <strong>
                {displayValue(
                  healthData.medicalConditions,
                  "No information provided"
                )}
              </strong>

            </div>


            <div className="large-profile-field">

              <span>
                Current Medications
              </span>

              <strong>
                {displayValue(
                  healthData.currentMedications,
                  "No medications added"
                )}
              </strong>

            </div>

          </section>


          {/* ================= EMERGENCY CONTACT ================= */}
          <section className="profile-section emergency-profile-section">

            <div className="section-title">

              <div className="section-icon emergency-icon-profile">
                🚨
              </div>

              <div>
                <h2>Emergency Contact</h2>

                <p>
                  Someone who can be contacted in an emergency
                </p>
              </div>

            </div>


            <div className="profile-grid">

              <div className="profile-field">

                <span>Contact Name</span>

                <strong>
                  {displayValue(
                    healthData.emergencyContactName
                  )}
                </strong>

              </div>


              <div className="profile-field">

                <span>Relationship</span>

                <strong>
                  {displayValue(
                    healthData.emergencyRelationship
                  )}
                </strong>

              </div>


              <div className="profile-field">

                <span>Phone Number</span>

                <strong>
                  {displayValue(
                    healthData.emergencyPhone
                  )}
                </strong>

              </div>

            </div>

          </section>

        </>
      )}

    </div>
  );
}

export default HealthProfile;