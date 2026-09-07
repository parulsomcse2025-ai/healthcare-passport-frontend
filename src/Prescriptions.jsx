import { useEffect, useState } from "react";
import "./Prescriptions.css";
import { supabase } from "./supabase";

function Prescriptions({ onBack }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [editingPrescription, setEditingPrescription] =
    useState(null);

  const [formData, setFormData] = useState({
    medicine: "",
    dosage: "",
    frequency: "Once Daily",
    doctor: "",
    startDate: "",
    endDate: "",
  });

  // Load prescriptions from Supabase
  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
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

      const { data, error: prescriptionError } =
        await supabase
          .from("prescriptions")
          .select("*")
          .eq("patient_id", user.id)
          .order("prescription_date", {
            ascending: false,
          });

      if (prescriptionError) {
        console.error(
          "Load prescriptions error:",
          prescriptionError
        );

        setError("Unable to load prescriptions.");
        return;
      }

      const formattedPrescriptions = (data || []).map(
        (prescription) => ({
          id: prescription.id,
          medicine: prescription.medicine_name,
          dosage: prescription.dosage || "",
          frequency: prescription.frequency || "Once Daily",
          doctor: prescription.doctor_name || "",
          startDate: prescription.prescription_date || "",
          endDate: calculateEndDate(
            prescription.prescription_date,
            prescription.duration
          ),
          duration: prescription.duration || "",
          instructions: prescription.instructions || "",
          status: getPrescriptionStatus(
            prescription.prescription_date,
            prescription.duration
          ),
        })
      );

      setPrescriptions(formattedPrescriptions);
    } catch (error) {
      console.error("Unexpected error:", error);
      setError("Something went wrong while loading prescriptions.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate end date using duration
  const calculateEndDate = (startDate, duration) => {
    if (!startDate || !duration) {
      return "";
    }

    const match = duration.match(/\d+/);

    if (!match) {
      return "";
    }

    const days = parseInt(match[0], 10);

    const date = new Date(startDate + "T00:00:00");

    date.setDate(date.getDate() + days - 1);

    return date.toISOString().split("T")[0];
  };

  // Determine prescription status
  const getPrescriptionStatus = (startDate, duration) => {
    if (!startDate) {
      return "Active";
    }

    const endDate = calculateEndDate(startDate, duration);

    if (!endDate) {
      return "Active";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endingDate = new Date(endDate + "T00:00:00");

    if (endingDate < today) {
      return "Completed";
    }

    return "Active";
  };

  // Format date as DD/MM/YYYY
  const formatDate = (date) => {
    if (!date) {
      return "Date not provided";
    }

    return new Date(
      date + "T00:00:00"
    ).toLocaleDateString("en-GB");
  };

  // Calculate duration in days
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) {
      return null;
    }

    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");

    const difference =
      Math.round(
        (end - start) / (1000 * 60 * 60 * 24)
      ) + 1;

    return difference;
  };

  // Open add form
  const openForm = () => {
    setEditingPrescription(null);

    setFormData({
      medicine: "",
      dosage: "",
      frequency: "Once Daily",
      doctor: "",
      startDate: "",
      endDate: "",
    });

    setShowForm(true);
  };

  // Open edit form
  const openEditForm = (prescription) => {
    setEditingPrescription(prescription);

    setFormData({
      medicine: prescription.medicine || "",
      dosage: prescription.dosage || "",
      frequency:
        prescription.frequency || "Once Daily",
      doctor: prescription.doctor || "",
      startDate: prescription.startDate || "",
      endDate: prescription.endDate || "",
    });

    setShowForm(true);
  };

  // Close form
  const closeForm = () => {
    setShowForm(false);
    setEditingPrescription(null);

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

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Save / Update prescription
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.medicine ||
      !formData.dosage ||
      !formData.startDate
    ) {
      alert(
        "Please fill in Medicine Name, Dosage and Start Date."
      );
      return;
    }

    if (
      formData.endDate &&
      formData.endDate < formData.startDate
    ) {
      alert("End Date cannot be before Start Date.");
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

      const durationDays = calculateDuration(
        formData.startDate,
        formData.endDate
      );

      const duration =
        durationDays !== null
          ? `${durationDays} days`
          : null;

      const prescriptionData = {
        patient_id: user.id,
        doctor_name: formData.doctor,
        medicine_name: formData.medicine,
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: duration,
        prescription_date: formData.startDate,
      };

      if (editingPrescription) {
        // UPDATE
        const { error: updateError } =
          await supabase
            .from("prescriptions")
            .update(prescriptionData)
            .eq("id", editingPrescription.id)
            .eq("patient_id", user.id);

        if (updateError) {
          console.error(
            "Update prescription error:",
            updateError
          );

          setError(
            "Unable to update prescription."
          );
          return;
        }

        alert(
          "Prescription updated successfully! ✅"
        );
      } else {
        // INSERT
        const { error: insertError } =
          await supabase
            .from("prescriptions")
            .insert(prescriptionData);

        if (insertError) {
          console.error(
            "Insert prescription error:",
            insertError
          );

          setError(
            "Unable to save prescription."
          );
          return;
        }

        alert(
          "Prescription saved successfully! ✅"
        );
      }

      closeForm();
      await loadPrescriptions();
    } catch (error) {
      console.error("Save prescription error:", error);

      setError(
        "Something went wrong while saving prescription."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete prescription
  const deletePrescription = async (prescriptionId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this prescription?"
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

      const { error: deleteError } =
        await supabase
          .from("prescriptions")
          .delete()
          .eq("id", prescriptionId)
          .eq("patient_id", user.id);

      if (deleteError) {
        console.error(
          "Delete prescription error:",
          deleteError
        );

        setError(
          "Unable to delete prescription."
        );
        return;
      }

      alert(
        "Prescription deleted successfully! 🗑️"
      );

      await loadPrescriptions();
    } catch (error) {
      console.error("Delete error:", error);

      setError(
        "Something went wrong while deleting prescription."
      );
    }
  };

  // Count active prescriptions
  const activePrescriptions =
    prescriptions.filter(
      (prescription) =>
        prescription.status === "Active"
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

          <h1>Your Prescriptions</h1>

          <p>
            Keep track of your medicines, dosage, and
            treatment schedule in one place.
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
            <strong>
              {prescriptions.length}
            </strong>
          </div>

        </div>


        <div className="prescription-summary-card">

          <div className="prescription-summary-icon green">
            ✓
          </div>

          <div>
            <span>Active Prescriptions</span>
            <strong>
              {activePrescriptions}
            </strong>
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
            <h2>All Prescriptions</h2>

            <p>
              Manage your medicines and treatment
              schedules
            </p>
          </div>

          <button
            className="back-prescriptions-btn"
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

          <div className="prescriptions-empty-state">

            <div className="prescriptions-empty-icon">
              🔄
            </div>

            <h2>
              Loading prescriptions...
            </h2>

            <p>
              Please wait while your prescriptions
              are loaded.
            </p>

          </div>

        ) : prescriptions.length === 0 ? (

          <div className="prescriptions-empty-state">

            <div className="prescriptions-empty-icon">
              💊
            </div>

            <h2>
              No prescriptions yet
            </h2>

            <p>
              Your prescribed medicines and treatment
              information will appear here.
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

            {prescriptions.map(
              (prescription) => (

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
                      📅{" "}
                      {formatDate(
                        prescription.startDate
                      )}

                      {prescription.endDate &&
                        ` → ${formatDate(
                          prescription.endDate
                        )}`}
                    </p>

                  </div>


                  <div className="prescription-action-buttons">

                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(
                          prescription
                        )
                      }
                    >
                      ✏️
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deletePrescription(
                          prescription.id
                        )
                      }
                    >
                      🗑️
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* ================= ADD / EDIT MODAL ================= */}

      {showForm && (

        <div className="prescription-modal-overlay">

          <div className="prescription-modal">

            <div className="prescription-modal-header">

              <h2>
                {editingPrescription
                  ? "Edit Prescription"
                  : "Add Prescription"}
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
                <option>
                  Three Times Daily
                </option>
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
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingPrescription
                    ? "Update Prescription"
                    : "Save Prescription"}
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