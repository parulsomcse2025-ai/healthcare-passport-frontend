import "./Dashboard.css";

function Dashboard({
  onHealthProfile,
  onEmergencyPassport,
  onMedicalRecords,
  onPrescriptions,
  onAppointments,
  onAIAssistant,

  medicalRecords = [],
  prescriptions = [],
  appointments = [],
  healthData = {},
}) {
  // ================= PATIENT INFORMATION =================

  const patientName =
    healthData.fullName && healthData.fullName.trim() !== ""
      ? healthData.fullName
      : "Patient";

  // ================= PRESCRIPTIONS =================

  const activePrescriptions = prescriptions.filter(
    (prescription) => prescription.status === "Active"
  ).length;

  // ================= APPOINTMENTS =================

  const upcomingAppointments = appointments.filter(
    (appointment) =>
      appointment.status !== "Completed" &&
      appointment.status !== "Cancelled"
  );

  // ================= NOTIFICATION =================

  const handleNotification = () => {
    alert("You have no new notifications.");
  };

  // ================= SETTINGS =================

  const handleSettings = () => {
    alert("Settings feature will be added in a future version.");
  };

  // ================= LOGOUT =================

  const handleLogout = () => {
    alert("Logout feature is not connected yet.");
  };

  return (
    <div className="dashboard">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        {/* ================= BRAND ================= */}

        <div className="dashboard-brand">

          <div className="dashboard-logo">
            +
          </div>

          <div>
            <h2>Healthcare</h2>

            <span>
              AI Medical Passport
            </span>
          </div>

        </div>


        {/* ================= NAVIGATION ================= */}

        <nav className="sidebar-nav">

          {/* DASHBOARD */}

          <button
            className="nav-item active"
            onClick={() => window.scrollTo({
              top: 0,
              behavior: "smooth",
            })}
          >
            <span>🏠</span>
            Dashboard
          </button>


          {/* HEALTH PROFILE */}

          <button
            className="nav-item"
            onClick={onHealthProfile}
          >
            <span>👤</span>
            Health Profile
          </button>


          {/* MEDICAL RECORDS */}

          <button
            className="nav-item"
            onClick={onMedicalRecords}
          >
            <span>📋</span>
            Medical Records
          </button>


          {/* PRESCRIPTIONS */}

          <button
            className="nav-item"
            onClick={onPrescriptions}
          >
            <span>💊</span>
            Prescriptions
          </button>


          {/* APPOINTMENTS */}

          <button
            className="nav-item"
            onClick={onAppointments}
          >
            <span>📅</span>
            Appointments
          </button>


          {/* EMERGENCY PASSPORT */}

          <button
            className="nav-item"
            onClick={onEmergencyPassport}
          >
            <span>🚨</span>
            Emergency Passport
          </button>


          {/* AI ASSISTANT */}

          <button
            className="nav-item"
            onClick={onAIAssistant}
          >
            <span>🤖</span>
            AI Assistant
          </button>

        </nav>


        {/* ================= SIDEBAR BOTTOM ================= */}

        <div className="sidebar-bottom">

          {/* SETTINGS */}

          <button
            className="nav-item"
            onClick={handleSettings}
          >
            <span>⚙️</span>
            Settings
          </button>


          {/* LOGOUT */}

          <button
            className="nav-item logout"
            onClick={handleLogout}
          >
            <span>🚪</span>
            Logout
          </button>

        </div>

      </aside>


      {/* ================= MAIN DASHBOARD ================= */}

      <main className="dashboard-main">


        {/* ================= HEADER ================= */}

        <header className="dashboard-header">

          <div>

            <p className="dashboard-label">
              DASHBOARD
            </p>


            <h1>
              Welcome back, {patientName}
            </h1>


            <p className="dashboard-welcome">
              Here's an overview of your healthcare information.
            </p>

          </div>


          <div className="profile">

            {/* NOTIFICATION */}

            <button
              className="notification"
              onClick={handleNotification}
              title="Notifications"
            >
              🔔
            </button>


            {/* PROFILE AVATAR */}

            <button
              className="profile-avatar"
              onClick={onHealthProfile}
              title="Open Health Profile"
              style={{
                border: "none",
                cursor: "pointer",
              }}
            >
              {patientName.charAt(0).toUpperCase()}
            </button>


            {/* PROFILE INFO */}

            <div
              className="profile-info"
              onClick={onHealthProfile}
              style={{
                cursor: "pointer",
              }}
              title="Open Health Profile"
            >

              <strong>
                {patientName}
              </strong>

              <span>
                Patient
              </span>

            </div>

          </div>

        </header>


        {/* ================= EMERGENCY BANNER ================= */}

        <section className="emergency-banner">

          <div>

            <div className="emergency-icon">
              🚨
            </div>


            <div>

              <strong>
                Emergency Medical Passport
              </strong>

              <p>
                Quickly access your important medical information
                during an emergency.
              </p>

            </div>

          </div>


          <button onClick={onEmergencyPassport}>
            Open Emergency Passport
          </button>

        </section>


        {/* ================= SUMMARY CARDS ================= */}

        <section className="summary-grid">


          {/* HEALTH PROFILE */}

          <div
            className="summary-card"
            onClick={onHealthProfile}
          >

            <div className="summary-icon blue">
              👤
            </div>

            <div>

              <span>
                Health Profile
              </span>

              <strong>
                {healthData.fullName
                  ? "Updated"
                  : "Incomplete"}
              </strong>

            </div>

          </div>


          {/* MEDICAL RECORDS */}

          <div
            className="summary-card"
            onClick={onMedicalRecords}
          >

            <div className="summary-icon green">
              📋
            </div>

            <div>

              <span>
                Medical Records
              </span>

              <strong>
                {medicalRecords.length}
              </strong>

            </div>

          </div>


          {/* PRESCRIPTIONS */}

          <div
            className="summary-card"
            onClick={onPrescriptions}
          >

            <div className="summary-icon purple">
              💊
            </div>

            <div>

              <span>
                Active Prescriptions
              </span>

              <strong>
                {activePrescriptions}
              </strong>

            </div>

          </div>


          {/* APPOINTMENTS */}

          <div
            className="summary-card"
            onClick={onAppointments}
          >

            <div className="summary-icon orange">
              📅
            </div>

            <div>

              <span>
                Upcoming Appointments
              </span>

              <strong>
                {upcomingAppointments.length}
              </strong>

            </div>

          </div>

        </section>


        {/* ================= CONTENT GRID ================= */}

        <section className="dashboard-grid">


          {/* ================= MEDICAL RECORDS ================= */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>
                  Recent Medical Records
                </h2>

                <p>
                  Your latest healthcare documents
                </p>

              </div>


              <button onClick={onMedicalRecords}>
                View All →
              </button>

            </div>


            {medicalRecords.length === 0 ? (

              <div
                className="empty-state"
                onClick={onMedicalRecords}
                style={{
                  cursor: "pointer",
                }}
              >

                <div>
                  📋
                </div>

                <strong>
                  No medical records yet
                </strong>

                <p>
                  Add your medical reports and healthcare documents
                  to keep your information organized.
                </p>

              </div>

            ) : (

              <div className="dashboard-record-list">

                {medicalRecords
                  .slice(-3)
                  .reverse()
                  .map((record) => (

                    <div
                      className="dashboard-record-item"
                      key={record.id}
                      onClick={onMedicalRecords}
                      style={{
                        cursor: "pointer",
                      }}
                    >

                      <div className="dashboard-item-icon">

                        {record.type === "Prescription"
                          ? "💊"
                          : "📋"}

                      </div>


                      <div>

                        <strong>
                          {record.title}
                        </strong>

                        <p>
                          {record.type}
                        </p>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </div>


          {/* ================= PRESCRIPTIONS ================= */}

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>
                  Recent Prescriptions
                </h2>

                <p>
                  Your current medicines and treatments
                </p>

              </div>


              <button onClick={onPrescriptions}>
                View All →
              </button>

            </div>


            {prescriptions.length === 0 ? (

              <div
                className="empty-state"
                onClick={onPrescriptions}
                style={{
                  cursor: "pointer",
                }}
              >

                <div>
                  💊
                </div>

                <strong>
                  No prescriptions yet
                </strong>

                <p>
                  Add your prescribed medicines to keep track
                  of your treatment schedule.
                </p>

              </div>

            ) : (

              <div className="dashboard-prescription-list">

                {prescriptions
                  .slice(-3)
                  .reverse()
                  .map((prescription) => (

                    <div
                      className="dashboard-prescription-item"
                      key={prescription.id}
                      onClick={onPrescriptions}
                      style={{
                        cursor: "pointer",
                      }}
                    >

                      <div className="dashboard-item-icon">
                        💊
                      </div>


                      <div className="dashboard-prescription-info">

                        <strong>
                          {prescription.medicine}
                        </strong>

                        <p>
                          {prescription.dosage}
                          {" • "}
                          {prescription.frequency}
                        </p>

                      </div>


                      <span className="dashboard-prescription-status">
                        {prescription.status}
                      </span>

                    </div>

                  ))}

              </div>

            )}

          </div>


          {/* ================= APPOINTMENTS ================= */}

          <div className="dashboard-card dashboard-wide-card">

            <div className="card-header">

              <div>

                <h2>
                  Upcoming Appointments
                </h2>

                <p>
                  Your upcoming healthcare visits
                </p>

              </div>


              <button onClick={onAppointments}>
                View All →
              </button>

            </div>


            {upcomingAppointments.length === 0 ? (

              <div
                className="empty-state"
                onClick={onAppointments}
                style={{
                  cursor: "pointer",
                }}
              >

                <div>
                  📅
                </div>

                <strong>
                  No upcoming appointments
                </strong>

                <p>
                  Schedule an appointment with your doctor
                  to keep track of your healthcare visits.
                </p>

              </div>

            ) : (

              <div className="dashboard-appointment-list">

                {upcomingAppointments
                  .slice(0, 3)
                  .map((appointment) => (

                    <div
                      className="dashboard-appointment-item"
                      key={appointment.id}
                      onClick={onAppointments}
                      style={{
                        cursor: "pointer",
                      }}
                    >

                      <div className="appointment-small-icon">
                        📅
                      </div>


                      <div>

                        <strong>
                          {appointment.doctor ||
                            "Doctor Appointment"}
                        </strong>

                        <p>

                          {appointment.date}

                          {appointment.time &&
                            ` • ${appointment.time}`}

                        </p>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </div>

        </section>


        {/* ================= AI ASSISTANT ================= */}

        <section
          className="ai-card"
          style={{
            cursor: "pointer",
          }}
          onClick={onAIAssistant}
        >

          <div className="ai-icon">
            🤖
          </div>


          <div className="ai-content">

            <span>
              AI HEALTH ASSISTANT
            </span>

            <h2>
              Need help understanding your health information?
            </h2>

            <p>
              Ask the AI Assistant questions about your medical
              records, prescriptions, appointments, and general
              healthcare information.
            </p>

          </div>


          <button
            onClick={(e) => {
              e.stopPropagation();
              onAIAssistant();
            }}
          >
            Ask AI Assistant
          </button>

        </section>

      </main>

    </div>
  );
}

export default Dashboard;