import { useEffect, useState } from "react";
import "./Dashboard.css";
import { supabase } from "./supabase";

function Dashboard({
  onHealthProfile,
  onEmergencyPassport,
  onMedicalRecords,
  onPrescriptions,
  onAppointments,
  onAIAssistant,
  onHealthcareResources,
  onDoctorEmergencyAccess,
}) {
  // ================= DATA STATES =================

  const [medicalRecords, setMedicalRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [healthData, setHealthData] = useState({
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    bloodGroup: "",
    height: "",
    weight: "",
    allergies: "",
    medicalConditions: "",
    currentMedications: "",
    emergencyContactName: "",
    relationship: "",
    emergencyPhone: "",
  });

  const [loading, setLoading] = useState(true);

  // ================= LOAD DASHBOARD DATA =================

  const loadDashboardData = async () => {
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

      // ==========================================
      // LOAD PROFILE
      // ==========================================

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error(
          "Profile load error:",
          profileError
        );
      }

      // ==========================================
      // LOAD HEALTH PROFILE
      // ==========================================

      const {
        data: healthProfile,
        error: healthError,
      } = await supabase
        .from("health_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (healthError) {
        console.error(
          "Health profile load error:",
          healthError
        );
      }

      // Combine profile + health profile

      setHealthData({
        fullName: profile?.full_name || "",
        dateOfBirth: profile?.date_of_birth || "",
        gender: profile?.gender || "",
        phone: profile?.phone || "",
        email:
          profile?.email ||
          user.email ||
          "",
        address: profile?.address || "",

        bloodGroup:
          healthProfile?.blood_group || "",

        height:
          healthProfile?.height || "",

        weight:
          healthProfile?.weight || "",

        allergies:
          healthProfile?.allergies || "",

        medicalConditions:
          healthProfile?.chronic_conditions || "",

        currentMedications:
          healthProfile?.current_medications || "",

        emergencyContactName:
          healthProfile?.emergency_contact_name ||
          "",

        relationship:
          healthProfile?.emergency_relationship ||
          "",

        emergencyPhone:
          healthProfile?.emergency_contact_phone ||
          "",
      });

      // ==========================================
      // LOAD MEDICAL RECORDS
      // ==========================================

      const {
        data: records,
        error: recordsError,
      } = await supabase
        .from("medical_records")
        .select("*")
        .eq("patient_id", user.id)
        .order("record_date", {
          ascending: false,
        });

      if (recordsError) {
        console.error(
          "Medical records load error:",
          recordsError
        );
      } else {
        const formattedRecords =
          (records || []).map(
            (record) => ({
              id: record.id,

              title:
                record.diagnosis ||
                record.record_type ||
                "Medical Record",

              type:
                record.record_type ||
                "Medical Record",

              doctor:
                record.doctor_name || "",

              date:
                record.record_date || "",

              description:
                record.description || "",
            })
          );

        setMedicalRecords(
          formattedRecords
        );
      }

      // ==========================================
      // LOAD PRESCRIPTIONS
      // ==========================================

      const {
        data: prescriptionData,
        error: prescriptionError,
      } = await supabase
        .from("prescriptions")
        .select("*")
        .eq("patient_id", user.id)
        .order("prescription_date", {
          ascending: false,
        });

      if (prescriptionError) {
        console.error(
          "Prescriptions load error:",
          prescriptionError
        );
      } else {
        const formattedPrescriptions =
          (prescriptionData || []).map(
            (prescription) => {
              let endDate = "";

              if (prescription.duration) {
                const daysMatch =
                  prescription.duration.match(
                    /\d+/
                  );

                if (daysMatch) {
                  const days = parseInt(
                    daysMatch[0],
                    10
                  );

                  if (
                    prescription.prescription_date
                  ) {
                    const date =
                      new Date(
                        prescription.prescription_date +
                          "T00:00:00"
                      );

                    date.setDate(
                      date.getDate() +
                        days -
                        1
                    );

                    endDate =
                      date
                        .toISOString()
                        .split("T")[0];
                  }
                }
              }

              let status = "Active";

              if (endDate) {
                const today = new Date();

                today.setHours(
                  0,
                  0,
                  0,
                  0
                );

                const end = new Date(
                  endDate +
                    "T00:00:00"
                );

                if (end < today) {
                  status = "Completed";
                }
              }

              return {
                id: prescription.id,

                medicine:
                  prescription.medicine_name,

                dosage:
                  prescription.dosage || "",

                frequency:
                  prescription.frequency ||
                  "",

                doctor:
                  prescription.doctor_name ||
                  "",

                startDate:
                  prescription.prescription_date ||
                  "",

                endDate,

                status,
              };
            }
          );

        setPrescriptions(
          formattedPrescriptions
        );
      }

      // ==========================================
      // LOAD APPOINTMENTS
      // ==========================================

      const {
        data: appointmentData,
        error: appointmentError,
      } = await supabase
        .from("appointments")
        .select(
          "id, doctor_name, specialty, hospital_name, appointment_date, appointment_time, reason, notes, status"
        )
        .eq("patient_id", user.id)
        .order("appointment_date", {
          ascending: true,
        })
        .order("appointment_time", {
          ascending: true,
        });

      // Debug information
      console.log(
        "Dashboard - Supabase appointments:",
        appointmentData
      );

      if (appointmentError) {
        console.error(
          "Appointments load error:",
          appointmentError
        );

        setAppointments([]);
      } else {
        const formattedAppointments =
          (appointmentData || []).map(
            (appointment) => {
              const dbStatus =
                String(
                  appointment.status ||
                    "scheduled"
                ).toLowerCase();

              let displayStatus =
                "Upcoming";

              if (
                dbStatus ===
                "completed"
              ) {
                displayStatus =
                  "Completed";
              } else if (
                dbStatus ===
                "cancelled"
              ) {
                displayStatus =
                  "Cancelled";
              } else {
                displayStatus =
                  "Upcoming";
              }

              return {
                id: appointment.id,

                doctor:
                  appointment.doctor_name ||
                  "",

                specialty:
                  appointment.specialty ||
                  "",

                hospital:
                  appointment.hospital_name ||
                  "",

                date:
                  appointment.appointment_date ||
                  "",

                time:
                  appointment.appointment_time
                    ? String(
                        appointment.appointment_time
                      ).slice(0, 5)
                    : "",

                notes:
                  appointment.notes ||
                  appointment.reason ||
                  "",

                status:
                  displayStatus,
              };
            }
          );

        console.log(
          "Dashboard - Formatted appointments:",
          formattedAppointments
        );

        setAppointments(
          formattedAppointments
        );
      }
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD DATA WHEN DASHBOARD OPENS =================

  useEffect(() => {
    loadDashboardData();
  }, []);

  // ================= PATIENT INFORMATION =================

  const patientName =
    healthData.fullName &&
    healthData.fullName.trim() !== ""
      ? healthData.fullName
      : "Patient";

  // ================= PRESCRIPTIONS =================

  const activePrescriptions =
    prescriptions.filter(
      (prescription) =>
        prescription.status ===
        "Active"
    ).length;

  // ================= APPOINTMENTS =================

  const upcomingAppointments =
    appointments;

  // ================= NOTIFICATION =================

  const handleNotification = () => {
    alert(
      "You have no new notifications."
    );
  };

  // ================= SETTINGS =================

  const handleSettings = () => {
    alert(
      "Settings feature will be added in a future version."
    );
  };

  // ================= LOGOUT =================

  const handleLogout = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Logout error:",
        error
      );

      alert("Unable to logout.");
      return;
    }

    localStorage.removeItem(
      "currentPage"
    );

    window.location.reload();
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="dashboard">
        <main className="dashboard-main">
          <div
            style={{
              padding: "40px",
              textAlign: "center",
            }}
          >
            <h2>
              Loading your dashboard...
            </h2>

            <p>
              Fetching your healthcare
              information.
            </p>
          </div>
        </main>
      </div>
    );
  }

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
            <h2>
              Healthcare
            </h2>

            <span>
              AI Medical Passport
            </span>
          </div>

        </div>

        {/* ================= NAVIGATION ================= */}

        <nav className="sidebar-nav">

          <button
            className="nav-item active"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <span>🏠</span>
            Dashboard
          </button>

          <button
            className="nav-item"
            onClick={onHealthProfile}
          >
            <span>👤</span>
            Health Profile
          </button>

          <button
            className="nav-item"
            onClick={onMedicalRecords}
          >
            <span>📋</span>
            Medical Records
          </button>

          <button
            className="nav-item"
            onClick={onPrescriptions}
          >
            <span>💊</span>
            Prescriptions
          </button>

          <button
            className="nav-item"
            onClick={onAppointments}
          >
            <span>📅</span>
            Appointments
          </button>

          <button
            className="nav-item"
            onClick={onEmergencyPassport}
          >
            <span>🚨</span>
            Emergency Passport
          </button>

          <button
            className="nav-item"
            onClick={onAIAssistant}
          >
            <span>🤖</span>
            AI Assistant
          </button>

          {/* ================= HEALTHCARE RESOURCES ================= */}

          <button
            className="nav-item"
            onClick={onHealthcareResources}
          >
            <span>🏥</span>
            Healthcare Resources
          </button>

        </nav>

        {/* ================= SIDEBAR BOTTOM ================= */}

        <div className="sidebar-bottom">

          <button
            className="nav-item"
            onClick={handleSettings}
          >
            <span>⚙️</span>
            Settings
          </button>

          <button
            className="nav-item logout"
            onClick={handleLogout}
          >
            <span>🚪</span>
            Logout
          </button>

          <button
            className="nav-item"
            onClick={onDoctorEmergencyAccess}
          >
            <span>🩺</span>
            Doctor Emergency Access
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

            <button
              className="notification"
              onClick={
                handleNotification
              }
              title="Notifications"
            >
              🔔
            </button>

            <button
              className="profile-avatar"
              onClick={
                onHealthProfile
              }
              title="Open Health Profile"
              style={{
                border: "none",
                cursor: "pointer",
              }}
            >
              {patientName
                .charAt(0)
                .toUpperCase()}
            </button>

            <div
              className="profile-info"
              onClick={
                onHealthProfile
              }
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

          <button
            onClick={
              onEmergencyPassport
            }
          >
            Open Emergency Passport
          </button>

        </section>

        {/* ================= SUMMARY CARDS ================= */}

        <section className="summary-grid">

          {/* HEALTH PROFILE */}

          <div
            className="summary-card"
            onClick={
              onHealthProfile
            }
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
            onClick={
              onMedicalRecords
            }
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
            onClick={
              onPrescriptions
            }
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
            onClick={
              onAppointments
            }
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

              <button
                onClick={
                  onMedicalRecords
                }
              >
                View All →
              </button>

            </div>

            {medicalRecords.length ===
            0 ? (

              <div
                className="empty-state"
                onClick={
                  onMedicalRecords
                }
                style={{
                  cursor:
                    "pointer",
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
                  .slice(0, 3)
                  .map(
                    (record) => (

                      <div
                        className="dashboard-record-item"
                        key={
                          record.id
                        }
                        onClick={
                          onMedicalRecords
                        }
                        style={{
                          cursor:
                            "pointer",
                        }}
                      >

                        <div className="dashboard-item-icon">

                          {record.type ===
                          "Prescription"
                            ? "💊"
                            : "📋"}

                        </div>

                        <div>

                          <strong>
                            {
                              record.title
                            }
                          </strong>

                          <p>
                            {
                              record.type
                            }
                          </p>

                        </div>

                      </div>

                    )
                  )}

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

              <button
                onClick={
                  onPrescriptions
                }
              >
                View All →
              </button>

            </div>

            {prescriptions.length ===
            0 ? (

              <div
                className="empty-state"
                onClick={
                  onPrescriptions
                }
                style={{
                  cursor:
                    "pointer",
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
                  .slice(0, 3)
                  .map(
                    (
                      prescription
                    ) => (

                      <div
                        className="dashboard-prescription-item"
                        key={
                          prescription.id
                        }
                        onClick={
                          onPrescriptions
                        }
                        style={{
                          cursor:
                            "pointer",
                        }}
                      >

                        <div className="dashboard-item-icon">
                          💊
                        </div>

                        <div className="dashboard-prescription-info">

                          <strong>
                            {
                              prescription.medicine
                            }
                          </strong>

                          <p>
                            {
                              prescription.dosage
                            }
                            {" • "}
                            {
                              prescription.frequency
                            }
                          </p>

                        </div>

                        <span className="dashboard-prescription-status">
                          {
                            prescription.status
                          }
                        </span>

                      </div>

                    )
                  )}

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

              <button
                onClick={
                  onAppointments
                }
              >
                View All →
              </button>

            </div>

            {upcomingAppointments.length ===
            0 ? (

              <div
                className="empty-state"
                onClick={
                  onAppointments
                }
                style={{
                  cursor:
                    "pointer",
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
                  .map(
                    (
                      appointment
                    ) => (

                      <div
                        className="dashboard-appointment-item"
                        key={
                          appointment.id
                        }
                        onClick={
                          onAppointments
                        }
                        style={{
                          cursor:
                            "pointer",
                        }}
                      >

                        <div className="appointment-small-icon">
                          📅
                        </div>

                        <div>

                          <strong>
                            {
                              appointment.doctor ||
                              "Doctor Appointment"
                            }
                          </strong>

                          <p>
                            {appointment.date &&
                              new Date(
                                appointment.date +
                                  "T00:00:00"
                              ).toLocaleDateString(
                                "en-GB"
                              )}

                            {appointment.time &&
                              ` • ${appointment.time}`}
                          </p>

                        </div>

                      </div>

                    )
                  )}

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
          onClick={
            onAIAssistant
          }
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