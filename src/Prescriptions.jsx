import { useState } from "react";
import "./Prescriptions.css";

function Prescriptions({
  onBack,
  prescriptions,
  setPrescriptions,
}) {
  // Controls the Add Prescription form
  const [showForm, setShowForm] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    medicine: "",
    dosage: "",
    frequency: "Once Daily",
    doctor: "",
    startDate: "",
    endDate: "",
  });

  // Open form
  const openForm = () => {
    setShowForm(true);
  };

  // Close form and reset data
  const closeForm = () => {
    setShowForm(false);

    setFormData({
      medicine: "",
      dosage: "",
      frequency: "Once Daily",
      doctor: "",
      startDate: "",
      endDate: "",
    });
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Save prescription
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.medicine ||
      !formData.dosage ||
      !formData.startDate
    ) {
      alert("Please fill in Medicine Name, Dosage and Start Date.");
      return;
    }

    const newPrescription = {
      id: Date.now(),
      ...formData,
      status: "Active",
    };

    setPrescriptions([
      ...prescriptions,
      newPrescription,
    ]);

    closeForm();
  };

  // Count active prescriptions
  const activePrescriptions = prescriptions.filter(
    (prescription) => prescription.status === "Active"
  ).length;

  // Count completed prescriptions
  const completedPrescriptions =
    prescriptions.length - activePrescriptions;

  return (
    <div className="prescriptions-page">

      {/* ================= PAGE HEADER ================= */}
      <header className="prescriptions-header">

        <div>
          <span className="prescriptions-tag">
            PRESCRIPTIONS
          </span>

          <h1>
            Your Prescriptions
          </h1>

          <p>
            Keep track of your medicines, dosage, and treatment schedule
            in one place.
          </p>
        </div>

        <button
          className="add-prescription-btn"
          onClick={openForm}
        >
          + Add Prescription
        </button>

      </header>


      {/* ================= SUMMARY CARDS ================= */}
      <section className="prescriptions-summary">

        <div className="prescription-summary-card">

          <div className="prescription-summary-icon">
            💊
          </div>

          <div>
            <span>Total Prescriptions</span>
            <strong>{prescriptions.length}</strong>
          </div>

        </div>


        <div className="prescription-summary-card">

          <div className="prescription-summary-icon green">
            ✓
          </div>

          <div>
            <span>Active Prescriptions</span>
            <strong>{activePrescriptions}</strong>
          </div>

        </div>


        <div className="prescription-summary-card">

          <div className="prescription-summary-icon orange">
            📅
          </div>

          <div>
            <span>Completed</span>
            <strong>
              {completedPrescriptions}
            </strong>
          </div>

        </div>

      </section>


      {/* ================= PRESCRIPTIONS LIST ================= */}
      <section className="all-prescriptions-card">

        <div className="prescriptions-section-header">

          <div>
            <h2>
              All Prescriptions
            </h2>

            <p>
              Manage your medicines and treatment schedules
            </p>
          </div>

          <button
            className="back-prescriptions-btn"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

        </div>


        {/* EMPTY STATE */}
        {prescriptions.length === 0 ? (

          <div className="prescriptions-empty-state">

            <div className="prescriptions-empty-icon">
              💊
            </div>

            <h2>
              No prescriptions yet
            </h2>

            <p>
              Your prescribed medicines and treatment information
              will appear here.
            </p>

            <button
              className="first-prescription-btn"
              onClick={openForm}
            >
              + Add Your First Prescription
            </button>

          </div>

        ) : (

          <div className="prescriptions-list">

            {prescriptions.map((prescription) => (

              <div
                className="prescription-item"
                key={prescription.id}
              >

                <div className="prescription-icon">
                  💊
                </div>


                <div className="prescription-details">

                  <div className="prescription-top">

                    <div>

                      <h3>
                        {prescription.medicine}
                      </h3>

                      <p>
                        {prescription.dosage}
                        {" • "}
                        {prescription.frequency}
                      </p>

                    </div>


                    <span className="prescription-status">
                      {prescription.status}
                    </span>

                  </div>


                  <p className="doctor-name">
                    👨‍⚕️{" "}
                    {prescription.doctor ||
                      "Doctor not provided"}
                  </p>


                  <p className="prescription-dates">
                    📅 {prescription.startDate}

                    {prescription.endDate &&
                      ` → ${prescription.endDate}`}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* ================= ADD PRESCRIPTION MODAL ================= */}
      {showForm && (

        <div className="prescription-modal-overlay">

          <div className="prescription-modal">

            <div className="prescription-modal-header">

              <h2>
                Add Prescription
              </h2>

              <button
                type="button"
                className="close-prescription-modal"
                onClick={closeForm}
              >
                ✕
              </button>

            </div>


            <form onSubmit={handleSubmit}>

              {/* MEDICINE */}
              <label>
                Medicine Name
              </label>

              <input
                type="text"
                name="medicine"
                placeholder="e.g. Paracetamol"
                value={formData.medicine}
                onChange={handleChange}
              />


              {/* DOSAGE */}
              <label>
                Dosage
              </label>

              <input
                type="text"
                name="dosage"
                placeholder="e.g. 500 mg"
                value={formData.dosage}
                onChange={handleChange}
              />


              {/* FREQUENCY */}
              <label>
                Frequency
              </label>

              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
              >
                <option>Once Daily</option>
                <option>Twice Daily</option>
                <option>Three Times Daily</option>
                <option>As Needed</option>
              </select>


              {/* DOCTOR */}
              <label>
                Doctor Name
              </label>

              <input
                type="text"
                name="doctor"
                placeholder="Enter doctor's name"
                value={formData.doctor}
                onChange={handleChange}
              />


              {/* START DATE */}
              <label>
                Start Date
              </label>

              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />


              {/* END DATE */}
              <label>
                End Date (Optional)
              </label>

              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />


              {/* BUTTONS */}
              <div className="prescription-modal-buttons">

                <button
                  type="button"
                  className="cancel-prescription-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-prescription-btn"
                >
                  Save Prescription
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Prescriptions;