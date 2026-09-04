import { useState } from "react";

import Home from "./home";
import Login from "./login";
import Dashboard from "./Dashboard";
import HealthProfile from "./HealthProfile";
import EmergencyPassport from "./EmergencyPassport";
import MedicalRecords from "./MedicalRecords";
import Prescriptions from "./Prescriptions";
import Appointments from "./Appointments";
import AIAssistant from "./AIAssistant";

function App() {
  // ================= CURRENT PAGE =================
  const [page, setPage] = useState("home");

  // ================= MEDICAL RECORDS =================
  const [medicalRecords, setMedicalRecords] = useState([]);

  // ================= PRESCRIPTIONS =================
  const [prescriptions, setPrescriptions] = useState([]);

  // ================= APPOINTMENTS =================
  const [appointments, setAppointments] = useState([]);

  // ================= HEALTH PROFILE =================
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

  return (
    <>
      {/* ================= HOME PAGE ================= */}
      {page === "home" && (
        <Home
          onGetStarted={() => setPage("login")}
          onLogin={() => setPage("login")}
        />
      )}

      {/* ================= LOGIN PAGE ================= */}
      {page === "login" && (
        <Login
          onLogin={() => setPage("dashboard")}
        />
      )}

      {/* ================= DASHBOARD ================= */}
      {page === "dashboard" && (
        <Dashboard
          onHealthProfile={() => setPage("health-profile")}
          onEmergencyPassport={() =>
            setPage("emergency-passport")
          }
          onMedicalRecords={() =>
            setPage("medical-records")
          }
          onPrescriptions={() =>
            setPage("prescriptions")
          }
          onAppointments={() =>
            setPage("appointments")
          }
          onAIAssistant={() =>
            setPage("ai-assistant")
          }

          medicalRecords={medicalRecords}
          prescriptions={prescriptions}
          appointments={appointments}
          healthData={healthData}
        />
      )}

      {/* ================= HEALTH PROFILE ================= */}
      {page === "health-profile" && (
        <HealthProfile
          onBack={() => setPage("dashboard")}
          healthData={healthData}
          setHealthData={setHealthData}
        />
      )}

      {/* ================= EMERGENCY PASSPORT ================= */}
      {page === "emergency-passport" && (
        <EmergencyPassport
          onBack={() => setPage("dashboard")}
          healthData={healthData}
        />
      )}

      {/* ================= MEDICAL RECORDS ================= */}
      {page === "medical-records" && (
        <MedicalRecords
          onBack={() => setPage("dashboard")}
          records={medicalRecords}
          setRecords={setMedicalRecords}
        />
      )}

      {/* ================= PRESCRIPTIONS ================= */}
      {page === "prescriptions" && (
        <Prescriptions
          onBack={() => setPage("dashboard")}
          prescriptions={prescriptions}
          setPrescriptions={setPrescriptions}
        />
      )}

      {/* ================= APPOINTMENTS ================= */}
      {page === "appointments" && (
        <Appointments
          onBack={() => setPage("dashboard")}
          appointments={appointments}
          setAppointments={setAppointments}
        />
      )}

      {/* ================= AI ASSISTANT ================= */}
      {page === "ai-assistant" && (
        <AIAssistant
          onBack={() => setPage("dashboard")}
        />
      )}
    </>
  );
}

export default App;