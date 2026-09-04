import { useState } from "react";
import "./MedicalRecords.css";

function MedicalRecords({ onBack, records = [], setRecords }) {
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    type: "Medical Report",
    doctor: "",
    date: "",
    description: "",
  });

  const openForm = () => {
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);

    setFormData({
      title: "",
      type: "Medical Report",
      doctor: "",
      date: "",
      description: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.date) {
      alert("Please enter the record title and date.");
      return;
    }

    const newRecord = {
      id: Date.now(),
      ...formData,
    };

    setRecords((previousRecords) => [
      ...previousRecords,
      newRecord,
    ]);

    closeForm();
  };

  const prescriptionCount = records.filter(
    (record) => record.type === "Prescription"
  ).length;

  const reportCount = records.filter(
    (record) => record.type === "Medical Report"
  ).length;

  return (
    <div className="medical-records-page">

      <header className="records-header">
        <div>
          <span className="page-tag">
            MEDICAL RECORDS
          </span>

          <h1>Your Medical Records</h1>

          <p>
            Keep all your important healthcare reports and medical
            information organized in one place.
          </p>
        </div>

        <button
          className="add-record-btn"
          onClick={openForm}
        >
          + Add Medical Record
        </button>
      </header>


      <section className="records-summary">

        <div className="record-summary-card">
          <div className="record-summary-icon">
            📋
          </div>

          <div>
            <span>Total Records</span>
            <strong>{records.length}</strong>
          </div>
        </div>


        <div className="record-summary-card">
          <div className="record-summary-icon">
            🏥
          </div>

          <div>
            <span>Medical Reports</span>
            <strong>{reportCount}</strong>
          </div>
        </div>


        <div className="record-summary-card">
          <div className="record-summary-icon">
            💊
          </div>

          <div>
            <span>Prescriptions</span>
            <strong>{prescriptionCount}</strong>
          </div>
        </div>

      </section>


      <section className="all-records-card">

        <div className="records-section-header">

          <div>
            <h2>All Medical Records</h2>
            <p>Your healthcare history</p>
          </div>

          <button
            className="back-records-btn"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

        </div>


        {records.length === 0 ? (

          <div className="records-empty-state">

            <div className="records-empty-icon">
              📋
            </div>

            <h2>No medical records yet</h2>

            <p>
              Your medical reports, prescriptions and healthcare
              documents will appear here.
            </p>

            <button
              className="first-record-btn"
              onClick={openForm}
            >
              + Add Your First Record
            </button>

          </div>

        ) : (

          <div className="records-list">

            {records.map((record) => (

              <div
                className="medical-record-item"
                key={record.id}
              >

                <div className="medical-record-icon">
                  {record.type === "Prescription"
                    ? "💊"
                    : "📋"}
                </div>


                <div className="medical-record-details">

                  <h3>{record.title}</h3>

                  <p>
                    {record.type} • {record.doctor || "Doctor not provided"}
                  </p>

                  <span>
                    Date: {record.date}
                  </span>

                  {record.description && (
                    <p className="record-description">
                      {record.description}
                    </p>
                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {showForm && (

        <div className="record-modal-overlay">

          <div className="record-modal">

            <div className="modal-header">

              <h2>Add Medical Record</h2>

              <button
                type="button"
                className="close-modal-btn"
                onClick={closeForm}
              >
                ✕
              </button>

            </div>


            <form onSubmit={handleSubmit}>

              <label>Record Title</label>

              <input
                type="text"
                name="title"
                placeholder="e.g. Blood Test Report"
                value={formData.title}
                onChange={handleChange}
              />


              <label>Record Type</label>

              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option>Medical Report</option>
                <option>Prescription</option>
                <option>Lab Report</option>
                <option>Other</option>
              </select>


              <label>Doctor / Hospital</label>

              <input
                type="text"
                name="doctor"
                placeholder="Enter doctor or hospital name"
                value={formData.doctor}
                onChange={handleChange}
              />


              <label>Date</label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />


              <label>Description</label>

              <textarea
                name="description"
                placeholder="Add additional information..."
                value={formData.description}
                onChange={handleChange}
              />


              <div className="modal-buttons">

                <button
                  type="button"
                  className="cancel-record-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-record-btn"
                >
                  Save Record
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default MedicalRecords;