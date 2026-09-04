import { useState } from "react";
import "./HealthProfile.css";

function HealthProfile({
  onBack,
  healthData,
  setHealthData,
}) {
  const [isEditing, setIsEditing] = useState(false);

  // Handles changes in all form fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setHealthData({
      ...healthData,
      [name]: value,
    });
  };

  // Save profile
  const handleSave = (e) => {
    e.preventDefault();
    setIsEditing(false);
  };

  // Display fallback value
  const displayValue = (value, fallback = "Not provided") => {
    return value && value.trim() !== "" ? value : fallback;
  };

  return (
    <div className="health-profile-page">

      {/* ================= HEADER ================= */}
      <header className="health-profile-header">

        <div>
          <p className="profile-label">HEALTH PROFILE</p>

          <h1>My Health Profile</h1>

          <p>
            Manage your personal and important healthcare information.
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

          {/* PERSONAL INFORMATION */}
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
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
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


          {/* HEALTH INFORMATION */}
          <section className="profile-section">

            <div className="section-title">
              <div className="section-icon">❤️</div>

              <div>
                <h2>Health Information</h2>
                <p>Important information about your health</p>
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
                  <option value="">Select blood group</option>
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


          {/* MEDICAL INFORMATION */}
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
                <label>Existing Medical Conditions</label>

                <textarea
                  name="medicalConditions"
                  value={healthData.medicalConditions}
                  onChange={handleChange}
                  placeholder="Enter existing medical conditions"
                />
              </div>


              <div className="form-group full-width">
                <label>Current Medications</label>

                <textarea
                  name="currentMedications"
                  value={healthData.currentMedications}
                  onChange={handleChange}
                  placeholder="Enter current medications"
                />
              </div>

            </div>

          </section>


          {/* EMERGENCY CONTACT */}
          <section className="profile-section emergency-profile-section">

            <div className="section-title">
              <div className="section-icon emergency-icon-profile">
                🚨
              </div>

              <div>
                <h2>Emergency Contact</h2>
                <p>Someone who can be contacted in an emergency</p>
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


          {/* FORM BUTTONS */}
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
            >
              Save Profile
            </button>

          </div>

        </form>

      ) : (

        /* ================= VIEW MODE ================= */
        <>

          {/* PERSONAL INFORMATION */}
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
                  {displayValue(healthData.fullName, "Patient")}
                </strong>
              </div>

              <div className="profile-field">
                <span>Date of Birth</span>
                <strong>
                  {displayValue(healthData.dateOfBirth)}
                </strong>
              </div>

              <div className="profile-field">
                <span>Gender</span>
                <strong>
                  {displayValue(healthData.gender)}
                </strong>
              </div>

              <div className="profile-field">
                <span>Phone Number</span>
                <strong>
                  {displayValue(healthData.phone)}
                </strong>
              </div>

              <div className="profile-field">
                <span>Email Address</span>
                <strong>
                  {displayValue(healthData.email)}
                </strong>
              </div>

              <div className="profile-field">
                <span>Address</span>
                <strong>
                  {displayValue(healthData.address)}
                </strong>
              </div>

            </div>

          </section>


          {/* HEALTH INFORMATION */}
          <section className="profile-section">

            <div className="section-title">
              <div className="section-icon">❤️</div>

              <div>
                <h2>Health Information</h2>
                <p>Important information about your health</p>
              </div>
            </div>

            <div className="profile-grid">

              <div className="profile-field">
                <span>Blood Group</span>
                <strong>
                  {displayValue(healthData.bloodGroup)}
                </strong>
              </div>

              <div className="profile-field">
                <span>Height</span>
                <strong>
                  {displayValue(healthData.height)}
                </strong>
              </div>

              <div className="profile-field">
                <span>Weight</span>
                <strong>
                  {displayValue(healthData.weight)}
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


          {/* MEDICAL INFORMATION */}
          <section className="profile-section">

            <div className="section-title">
              <div className="section-icon">🩺</div>

              <div>
                <h2>Medical Information</h2>
                <p>Conditions and medications</p>
              </div>
            </div>

            <div className="large-profile-field">
              <span>Existing Medical Conditions</span>
              <strong>
                {displayValue(
                  healthData.medicalConditions,
                  "No information provided"
                )}
              </strong>
            </div>

            <div className="large-profile-field">
              <span>Current Medications</span>
              <strong>
                {displayValue(
                  healthData.currentMedications,
                  "No medications added"
                )}
              </strong>
            </div>

          </section>


          {/* EMERGENCY CONTACT */}
          <section className="profile-section emergency-profile-section">

            <div className="section-title">

              <div className="section-icon emergency-icon-profile">
                🚨
              </div>

              <div>
                <h2>Emergency Contact</h2>
                <p>Someone who can be contacted in an emergency</p>
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