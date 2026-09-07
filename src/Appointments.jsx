import { useEffect, useState } from "react";
import "./Appointments.css";
import { supabase } from "./supabase";

function Appointments({ onBack }) {
  const [showForm, setShowForm] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    doctor: "",
    specialty: "",
    hospital: "",
    date: "",
    time: "",
    notes: "",
  });

  // -----------------------------------------
  // LOAD APPOINTMENTS FROM SUPABASE
  // -----------------------------------------
  const loadAppointments = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User error:", userError);
        return;
      }

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("patient_id", user.id)
        .order("appointment_date", {
          ascending: true,
        })
        .order("appointment_time", {
          ascending: true,
        });

      if (error) {
        console.error("Load appointments error:", error);
        return;
      }

      const formattedAppointments = (data || []).map(
        (appointment) => ({
          id: appointment.id,
          doctor: appointment.doctor_name || "",
          specialty: appointment.specialty || "",
          hospital: appointment.hospital_name || "",
          date: appointment.appointment_date || "",
          time: appointment.appointment_time
            ? appointment.appointment_time.slice(0, 5)
            : "",
          notes: appointment.notes || "",
          status:
            appointment.status === "completed"
              ? "Completed"
              : appointment.status === "cancelled"
              ? "Cancelled"
              : "Upcoming",
        })
      );

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error("Unexpected load error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  // -----------------------------------------
  // OPEN FORM
  // -----------------------------------------
  const openForm = () => {
    setShowForm(true);
  };

  // -----------------------------------------
  // CLOSE FORM
  // -----------------------------------------
  const closeForm = () => {
    setShowForm(false);

    setFormData({
      doctor: "",
      specialty: "",
      hospital: "",
      date: "",
      time: "",
      notes: "",
    });
  };

  // -----------------------------------------
  // HANDLE INPUT
  // -----------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // -----------------------------------------
  // ADD APPOINTMENT
  // -----------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.doctor ||
      !formData.date ||
      !formData.time
    ) {
      alert("Please fill Doctor Name, Date and Time.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Please login again.");
        return;
      }

      const { error } = await supabase
        .from("appointments")
        .insert({
          patient_id: user.id,
          doctor_name: formData.doctor,
          specialty: formData.specialty,
          hospital_name: formData.hospital,
          appointment_date: formData.date,
          appointment_time: formData.time,
          reason: formData.notes,
          notes: formData.notes,
          status: "scheduled",
        });

      if (error) {
        console.error(
          "Insert appointment error:",
          error
        );

        alert(
          "Unable to save appointment. Please try again."
        );

        return;
      }

      alert("Appointment saved successfully! ✅");

      closeForm();

      await loadAppointments();
    } catch (error) {
      console.error(
        "Unexpected appointment error:",
        error
      );

      alert(
        "Something went wrong while saving the appointment."
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------
  // DELETE APPOINTMENT
  // -----------------------------------------
  const deleteAppointment = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) {
        console.error(
          "Delete appointment error:",
          error
        );

        alert(
          "Unable to delete appointment."
        );

        return;
      }

      await loadAppointments();
    } catch (error) {
      console.error(
        "Unexpected delete error:",
        error
      );
    }
  };

  // -----------------------------------------
  // MARK APPOINTMENT COMPLETED
  // -----------------------------------------
  const completeAppointment = async (id) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({
          status: "completed",
        })
        .eq("id", id);

      if (error) {
        console.error(
          "Complete appointment error:",
          error
        );

        alert(
          "Unable to update appointment."
        );

        return;
      }

      await loadAppointments();
    } catch (error) {
      console.error(
        "Unexpected complete error:",
        error
      );
    }
  };

  // -----------------------------------------
  // COUNTS
  // -----------------------------------------
  const upcomingCount = appointments.filter(
    (appointment) =>
      appointment.status === "Upcoming"
  ).length;

  const completedCount = appointments.filter(
    (appointment) =>
      appointment.status === "Completed"
  ).length;

  // -----------------------------------------
  // DATE FORMAT
  // -----------------------------------------
  const formatDate = (date) => {
    if (!date) {
      return "Date not provided";
    }

    return new Date(
      date + "T00:00:00"
    ).toLocaleDateString("en-GB");
  };

  return (
    <div className="appointments-page">

      {/* PAGE HEADER */}
      <header className="appointments-header">

        <div>
          <span className="appointments-tag">
            APPOINTMENTS
          </span>

          <h1>Your Appointments</h1>

          <p>
            Manage your doctor appointments and
            healthcare visits in one place.
          </p>
        </div>

        <button
          className="add-appointment-btn"
          onClick={openForm}
        >
          + Book Appointment
        </button>

      </header>


      {/* SUMMARY CARDS */}
      <section className="appointments-summary">

        <div className="appointment-summary-card">

          <div className="appointment-summary-icon">
            📅
          </div>

          <div>
            <span>Total Appointments</span>
            <strong>
              {appointments.length}
            </strong>
          </div>

        </div>


        <div className="appointment-summary-card">

          <div className="appointment-summary-icon upcoming">
            ⏳
          </div>

          <div>
            <span>Upcoming</span>
            <strong>
              {upcomingCount}
            </strong>
          </div>

        </div>


        <div className="appointment-summary-card">

          <div className="appointment-summary-icon completed">
            ✓
          </div>

          <div>
            <span>Completed</span>
            <strong>
              {completedCount}
            </strong>
          </div>

        </div>

      </section>


      {/* APPOINTMENTS LIST */}
      <section className="all-appointments-card">

        <div className="appointments-section-header">

          <div>
            <h2>All Appointments</h2>

            <p>
              Keep track of your upcoming
              healthcare visits
            </p>
          </div>

          <button
            className="back-appointments-btn"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

        </div>


        {/* LOADING */}
        {loading ? (

          <div className="appointments-empty-state">
            <div className="appointments-empty-icon">
              🔄
            </div>

            <h2>Loading appointments...</h2>

            <p>
              Please wait while we load your
              appointments.
            </p>
          </div>

        ) : appointments.length === 0 ? (

          /* EMPTY STATE */
          <div className="appointments-empty-state">

            <div className="appointments-empty-icon">
              📅
            </div>

            <h2>No appointments yet</h2>

            <p>
              Your upcoming doctor appointments
              will appear here.
            </p>

            <button
              className="first-appointment-btn"
              onClick={openForm}
            >
              + Book Your First Appointment
            </button>

          </div>

        ) : (

          /* APPOINTMENTS */
          <div className="appointments-list">

            {appointments.map(
              (appointment) => (

                <div
                  className="appointment-item"
                  key={appointment.id}
                >

                  <div className="appointment-icon">
                    👨‍⚕️
                  </div>


                  <div className="appointment-details">

                    <div className="appointment-top">

                      <div>
                        <h3>
                          {appointment.doctor}
                        </h3>

                        <p>
                          {appointment.specialty ||
                            "General Consultation"}
                        </p>
                      </div>


                      <span
                        className={
                          appointment.status ===
                          "Completed"
                            ? "appointment-status completed-status"
                            : "appointment-status upcoming-status"
                        }
                      >
                        {appointment.status}
                      </span>

                    </div>


                    <p className="appointment-hospital">
                      🏥{" "}
                      {appointment.hospital ||
                        "Hospital not provided"}
                    </p>


                    <p className="appointment-date">
                      📅{" "}
                      {formatDate(
                        appointment.date
                      )}{" "}
                      • ⏰{" "}
                      {appointment.time ||
                        "Time not provided"}
                    </p>


                    {appointment.notes && (
                      <p className="appointment-notes">
                        📝{" "}
                        {appointment.notes}
                      </p>
                    )}


                    <div className="appointment-actions">

                      {appointment.status ===
                        "Upcoming" && (

                        <button
                          className="complete-appointment-btn"
                          onClick={() =>
                            completeAppointment(
                              appointment.id
                            )
                          }
                        >
                          ✓ Mark Completed
                        </button>

                      )}


                      <button
                        className="delete-appointment-btn"
                        onClick={() =>
                          deleteAppointment(
                            appointment.id
                          )
                        }
                      >
                        🗑 Delete
                      </button>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* ADD APPOINTMENT MODAL */}
      {showForm && (

        <div className="appointment-modal-overlay">

          <div className="appointment-modal">

            <div className="appointment-modal-header">

              <h2>Book Appointment</h2>

              <button
                className="close-appointment-modal"
                onClick={closeForm}
              >
                ✕
              </button>

            </div>


            <form onSubmit={handleSubmit}>

              <label>
                Doctor Name *
              </label>

              <input
                type="text"
                name="doctor"
                placeholder="e.g. Dr. Sharma"
                value={formData.doctor}
                onChange={handleChange}
              />


              <label>
                Specialty
              </label>

              <input
                type="text"
                name="specialty"
                placeholder="e.g. Cardiologist"
                value={formData.specialty}
                onChange={handleChange}
              />


              <label>
                Hospital / Clinic
              </label>

              <input
                type="text"
                name="hospital"
                placeholder="Enter hospital name"
                value={formData.hospital}
                onChange={handleChange}
              />


              <label>
                Date *
              </label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />


              <label>
                Time *
              </label>

              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
              />


              <label>
                Notes
              </label>

              <textarea
                name="notes"
                placeholder="Add appointment notes..."
                value={formData.notes}
                onChange={handleChange}
              />


              <div className="appointment-modal-buttons">

                <button
                  type="button"
                  className="cancel-appointment-btn"
                  onClick={closeForm}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-appointment-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Save Appointment"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Appointments;