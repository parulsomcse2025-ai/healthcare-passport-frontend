import { useEffect, useState } from "react";
import "./MedicalRecords.css";
import { supabase } from "./supabase";

function MedicalRecords({ onBack }) {
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingRecord, setEditingRecord] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "Medical Report",
    doctor: "",
    date: "",
    description: "",
  });

  // Load records from Supabase
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("User is not logged in.");
        return;
      }

      const { data, error: recordsError } = await supabase
        .from("medical_records")
        .select("*")
        .eq("patient_id", user.id)
        .order("record_date", { ascending: false });

      if (recordsError) {
        console.error("Load records error:", recordsError);
        setError("Unable to load medical records.");
        return;
      }

      const formattedRecords = (data || []).map((record) => ({
        id: record.id,
        title: record.record_type,
        type: record.record_type,
        doctor: record.doctor_name || "",
        date: record.record_date || "",
        description: record.description || "",
      }));

      setRecords(formattedRecords);
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Something went wrong while loading records.");
    } finally {
      setLoading(false);
    }
  };

  const openForm = () => {
    setEditingRecord(null);

    setFormData({
      title: "",
      type: "Medical Report",
      doctor: "",
      date: "",
      description: "",
    });

    setShowForm(true);
  };

  const openEditForm = (record) => {
    setEditingRecord(record);

    setFormData({
      title: record.title || "",
      type: record.type || "Medical Report",
      doctor: record.doctor || "",
      date: record.date || "",
      description: record.description || "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRecord(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.date) {
      alert("Please enter the record title and date.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("User is not logged in.");
        return;
      }

      if (editingRecord) {
        // UPDATE existing record
        const { error: updateError } = await supabase
          .from("medical_records")
          .update({
            record_type: formData.type,
            diagnosis: formData.title,
            description: formData.description,
            doctor_name: formData.doctor,
            record_date: formData.date,
          })
          .eq("id", editingRecord.id)
          .eq("patient_id", user.id);

        if (updateError) {
          console.error("Update record error:", updateError);
          setError("Unable to update medical record.");
          return;
        }

        alert("Medical record updated successfully! ✅");
      } else {
        // INSERT new record
        const { error: insertError } = await supabase
          .from("medical_records")
          .insert({
            patient_id: user.id,
            record_type: formData.type,
            diagnosis: formData.title,
            description: formData.description,
            doctor_name: formData.doctor,
            record_date: formData.date,
          });

        if (insertError) {
          console.error("Insert record error:", insertError);
          setError("Unable to save medical record.");
          return;
        }

        alert("Medical record saved successfully! ✅");
      }

      closeForm();
      await loadRecords();
    } catch (error) {
      console.error("Save error:", error);
      setError("Something went wrong while saving the record.");
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async (recordId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medical record?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("User is not logged in.");
        return;
      }

      const { error: deleteError } = await supabase
        .from("medical_records")
        .delete()
        .eq("id", recordId)
        .eq("patient_id", user.id);

      if (deleteError) {
        console.error("Delete record error:", deleteError);
        setError("Unable to delete medical record.");
        return;
      }

      alert("Medical record deleted successfully! 🗑️");

      await loadRecords();
    } catch (error) {
      console.error("Delete error:", error);
      setError("Something went wrong while deleting the record.");
    }
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

        {error && (
          <div className="token-error">
            ⚠️ {error}
          </div>
        )}

        {loading ? (

          <div className="records-empty-state">
            <div className="records-empty-icon">
              🔄
            </div>

            <h2>Loading medical records...</h2>

            <p>
              Please wait while your records are loaded.
            </p>
          </div>

        ) : records.length === 0 ? (

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
                    {record.type} •{" "}
                    {record.doctor || "Doctor not provided"}
                  </p>

                  <span>
                    Date:{" "}
                    {record.date
                      ? new Date(record.date + "T00:00:00").toLocaleDateString(
                        "en-GB"
                      )
                    : "Date not provided"}
                  </span>

                  {record.description && (
                    <p className="record-description">
                      {record.description}
                    </p>
                  )}

                </div>

                <div className="record-action-buttons">

                  <button
                    type="button"
                    onClick={() => openEditForm(record)}
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteRecord(record.id)}
                  >
                    🗑️
                  </button>

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

              <h2>
                {editingRecord
                  ? "Edit Medical Record"
                  : "Add Medical Record"}
              </h2>

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
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingRecord
                    ? "Update Record"
                    : "Save Record"}
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