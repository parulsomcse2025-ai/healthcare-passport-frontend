import { useState } from "react";
import "./Appointments.css";

function Appointments({ onBack, appointments, setAppointments }) {
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    doctor: "",
    specialty: "",
    hospital: "",
    date: "",
    time: "",
    notes: "",
  });

  // Open appointment form
  const openForm = () => {
    setShowForm(true);
  };

  // Close appointment form
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

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Add appointment
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.doctor ||
      !formData.date ||
      !formData.time
    ) {
      alert("Please fill Doctor Name, Date and Time.");
      return;
    }

    const newAppointment = {
      id: Date.now(),
      ...formData,
      status: "Upcoming",
    };

    setAppointments([
      ...appointments,
      newAppointment,
    ]);

    closeForm();
  };

  // Delete appointment
  const deleteAppointment = (id) => {
    const updatedAppointments = appointments.filter(
      (appointment) => appointment.id !== id
    );

    setAppointments(updatedAppointments);
  };

  // Mark appointment as completed
  const completeAppointment = (id) => {
    const updatedAppointments = appointments.map(
      (appointment) =>
        appointment.id === id
          ? {
              ...appointment,
              status: "Completed",
            }
          : appointment
    );

    setAppointments(updatedAppointments);
  };

  // Appointment counts
  const upcomingCount = appointments.filter(
    (appointment) => appointment.status === "Upcoming"
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "Completed"
  ).length;

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
            Manage your doctor appointments and healthcare visits
            in one place.
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
            <strong>{appointments.length}</strong>
          </div>

        </div>


        <div className="appointment-summary-card">

          <div className="appointment-summary-icon upcoming">
            ⏳
          </div>

          <div>
            <span>Upcoming</span>
            <strong>{upcomingCount}</strong>
          </div>

        </div>


        <div className="appointment-summary-card">

          <div className="appointment-summary-icon completed">
            ✓
          </div>

          <div>
            <span>Completed</span>
            <strong>{completedCount}</strong>
          </div>

        </div>

      </section>


      {/* APPOINTMENTS LIST */}
      <section className="all-appointments-card">

        <div className="appointments-section-header">

          <div>
            <h2>All Appointments</h2>

            <p>
              Keep track of your upcoming healthcare visits
            </p>
          </div>

          <button
            className="back-appointments-btn"
            onClick={onBack}
          >
            ← Back to Dashboard
          </button>

        </div>


        {/* EMPTY STATE */}
        {appointments.length === 0 ? (

          <div className="appointments-empty-state">

            <div className="appointments-empty-icon">
              📅
            </div>

            <h2>No appointments yet</h2>

            <p>
              Your upcoming doctor appointments will appear here.
            </p>

            <button
              className="first-appointment-btn"
              onClick={openForm}
            >
              + Book Your First Appointment
            </button>

          </div>

        ) : (

          <div className="appointments-list">

            {appointments.map((appointment) => (

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
                        appointment.status === "Completed"
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
                    📅 {appointment.date} • ⏰ {appointment.time}
                  </p>


                  {appointment.notes && (
                    <p className="appointment-notes">
                      📝 {appointment.notes}
                    </p>
                  )}


                  <div className="appointment-actions">

                    {appointment.status === "Upcoming" && (
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

            ))}

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

              <label>Doctor Name *</label>

              <input
                type="text"
                name="doctor"
                placeholder="e.g. Dr. Sharma"
                value={formData.doctor}
                onChange={handleChange}
              />


              <label>Specialty</label>

              <input
                type="text"
                name="specialty"
                placeholder="e.g. Cardiologist"
                value={formData.specialty}
                onChange={handleChange}
              />


              <label>Hospital / Clinic</label>

              <input
                type="text"
                name="hospital"
                placeholder="Enter hospital name"
                value={formData.hospital}
                onChange={handleChange}
              />


              <label>Date *</label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />


              <label>Time *</label>

              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
              />


              <label>Notes</label>

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
                >
                  Save Appointment
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