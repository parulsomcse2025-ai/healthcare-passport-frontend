import { useEffect, useState } from "react";
import "./AIAssistant.css";
import { supabase } from "./supabase";

function AIAssistant({ onBack }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I'm your AI Healthcare Assistant. I can help you understand your health information, medical records, prescriptions, and appointments.",
    },
  ]);

  const [input, setInput] = useState("");

  // ================= HEALTH DATA =================
  const [healthData, setHealthData] = useState(null);
  const [loadingHealthData, setLoadingHealthData] = useState(true);

  // ================= SUMMARY =================
  const [summary, setSummary] = useState("");
  const [summaryGenerated, setSummaryGenerated] = useState(false);

  // ================= TRANSLATION =================
  const [selectedLanguage, setSelectedLanguage] = useState("Hindi");
  const [translatedSummary, setTranslatedSummary] = useState("");

  // ================= LOAD HEALTH PROFILE =================
  useEffect(() => {
    const loadHealthData = async () => {
      try {
        setLoadingHealthData(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("AI Assistant - User error:", userError);
          setLoadingHealthData(false);
          return;
        }

        // ================= PROFILE INFORMATION =================
        const {
          data: profileData,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select(
            "full_name, email, phone, date_of_birth, gender, address"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error(
            "AI Assistant - Profile error:",
            profileError
          );
        }

        // ================= HEALTH PROFILE =================
        const {
          data: healthProfileData,
          error: healthError,
        } = await supabase
          .from("health_profiles")
          .select(
            "blood_group, height, weight, allergies, chronic_conditions, current_medications, emergency_contact_name, emergency_contact_phone, emergency_relationship"
          )
          .eq("user_id", user.id)
          .maybeSingle();

        if (healthError) {
          console.error(
            "AI Assistant - Health profile error:",
            healthError
          );
        }

        // ================= COMBINE DATA =================
        const combinedData = {
          fullName: profileData?.full_name || "",
          dateOfBirth: profileData?.date_of_birth || "",
          gender: profileData?.gender || "",
          phone: profileData?.phone || "",
          email: profileData?.email || user.email || "",
          address: profileData?.address || "",

          bloodGroup: healthProfileData?.blood_group || "",
          height: healthProfileData?.height || "",
          weight: healthProfileData?.weight || "",
          allergies: healthProfileData?.allergies || "",

          medicalConditions:
            healthProfileData?.chronic_conditions || "",

          currentMedications:
            healthProfileData?.current_medications || "",

          emergencyContactName:
            healthProfileData?.emergency_contact_name || "",

          emergencyPhone:
            healthProfileData?.emergency_contact_phone || "",

          relationship:
            healthProfileData?.emergency_relationship || "",
        };

        setHealthData(combinedData);

        console.log(
          "AI Assistant - Health data:",
          combinedData
        );
      } catch (error) {
        console.error(
          "AI Assistant - Unexpected error:",
          error
        );
      } finally {
        setLoadingHealthData(false);
      }
    };

    loadHealthData();
  }, []);

  // ================= GENERATE MEDICAL SUMMARY =================
  const generateSummary = () => {
    if (!healthData) {
      return;
    }

    const name =
      healthData.fullName || "The patient";

    const bloodGroup =
      healthData.bloodGroup || "not available";

    const allergies =
      healthData.allergies || "none recorded";

    const conditions =
      healthData.medicalConditions || "none recorded";

    const medications =
      healthData.currentMedications || "none recorded";

    const emergencyContact =
      healthData.emergencyContactName
        ? `${healthData.emergencyContactName}${
            healthData.emergencyPhone
              ? ` (${healthData.emergencyPhone})`
              : ""
          }`
        : "not available";

    const generatedSummary = `${name} has blood group ${bloodGroup}. Known allergies: ${allergies}. Medical conditions: ${conditions}. Current medications: ${medications}. Emergency contact: ${emergencyContact}.`;

    setSummary(generatedSummary);
    setSummaryGenerated(true);
    setTranslatedSummary("");
  };

  // ================= TRANSLATION =================
  const translateSummary = () => {
    if (!summary) {
      return;
    }

    // ================= ENGLISH =================
    if (selectedLanguage === "English") {
      setTranslatedSummary(summary);
      return;
    }

    // ================= HINDI =================
    if (selectedLanguage === "Hindi") {
      setTranslatedSummary(
        "आपातकालीन चिकित्सा सारांश: " +
          "रक्त समूह: " +
          (healthData?.bloodGroup || "उपलब्ध नहीं") +
          ". एलर्जी: " +
          (healthData?.allergies || "कोई दर्ज नहीं").replace(
            "none recorded",
            "कोई दर्ज नहीं"
          ) +
          ". चिकित्सीय स्थितियां: " +
          (healthData?.medicalConditions || "कोई दर्ज नहीं").replace(
            "none recorded",
            "कोई दर्ज नहीं"
          ) +
          ". वर्तमान दवाएं: " +
          (healthData?.currentMedications || "कोई दर्ज नहीं").replace(
            "none recorded",
            "कोई दर्ज नहीं"
          ) +
          "."
      );
      return;
    }

    // ================= BENGALI =================
    if (selectedLanguage === "Bengali") {
      setTranslatedSummary(
        "জরুরি চিকিৎসা সারাংশ: রক্তের গ্রুপ: " +
          (healthData?.bloodGroup || "উপলব্ধ নেই") +
          ". অ্যালার্জি: " +
          (healthData?.allergies || "কোনও তথ্য নেই") +
          ". চিকিৎসাগত অবস্থা: " +
          (healthData?.medicalConditions || "কোনও তথ্য নেই") +
          ". বর্তমান ওষুধ: " +
          (healthData?.currentMedications || "কোনও তথ্য নেই") +
          "."
      );
      return;
    }

    // ================= SPANISH =================
    if (selectedLanguage === "Spanish") {
      setTranslatedSummary(
        "Resumen médico de emergencia: Grupo sanguíneo: " +
          (healthData?.bloodGroup || "no disponible") +
          ". Alergias: " +
          (healthData?.allergies || "ninguna registrada") +
          ". Condiciones médicas: " +
          (healthData?.medicalConditions || "ninguna registrada") +
          ". Medicamentos actuales: " +
          (healthData?.currentMedications || "ninguno registrado") +
          "."
      );
    }
  };

  // ================= AI RESPONSE =================
  const getAIResponse = (message) => {
    const userMessage = message.toLowerCase();

    if (
      userMessage.includes("emergency") ||
      userMessage.includes("chest pain") ||
      userMessage.includes("can't breathe") ||
      userMessage.includes("cannot breathe")
    ) {
      return "If this may be a medical emergency, please contact local emergency services or go to the nearest emergency department immediately. Do not rely on this chat for emergency care.";
    }

    if (
      userMessage.includes("summary") ||
      userMessage.includes("summarize") ||
      userMessage.includes("medical summary")
    ) {
      return "You can use the AI Medical Summary section to generate a concise summary from your saved health profile information.";
    }

    if (
      userMessage.includes("translation") ||
      userMessage.includes("translate") ||
      userMessage.includes("language")
    ) {
      return "You can generate the medical summary and select a supported language to view a translated version.";
    }

    if (
      userMessage.includes("prescription") ||
      userMessage.includes("medicine") ||
      userMessage.includes("medication")
    ) {
      return "You can view your saved prescriptions from the Prescriptions section. Always take medicines according to your doctor's instructions.";
    }

    if (
      userMessage.includes("appointment") ||
      userMessage.includes("doctor")
    ) {
      return "You can manage your healthcare visits from the Appointments section, where you can add and track upcoming appointments.";
    }

    if (
      userMessage.includes("medical record") ||
      userMessage.includes("report")
    ) {
      return "Your medical documents and health reports can be managed from the Medical Records section.";
    }

    if (
      userMessage.includes("health profile") ||
      userMessage.includes("blood group") ||
      userMessage.includes("allergy")
    ) {
      return "You can update important personal health information, including allergies and blood group, from your Health Profile.";
    }

    return "I can help you navigate your healthcare information in this platform. You can ask about your medical records, prescriptions, appointments, health profile, medical summary, or translation.";
  };

  // ================= SEND MESSAGE =================
  const sendMessage = () => {
    const trimmedMessage = input.trim();

    if (!trimmedMessage) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmedMessage,
    };

    const aiMessage = {
      id: Date.now() + 1,
      sender: "ai",
      text: getAIResponse(trimmedMessage),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
      aiMessage,
    ]);

    setInput("");
  };

  // ================= ENTER KEY =================
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  // ================= SUGGESTION =================
  const askSuggestion = (question) => {
    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: question,
    };

    const aiMessage = {
      id: Date.now() + 1,
      sender: "ai",
      text: getAIResponse(question),
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage,
      aiMessage,
    ]);

    setInput("");
  };

  return (
    <div className="ai-assistant-page">

      {/* ================= HEADER ================= */}
      <header className="ai-header">
        <div>
          <span className="ai-page-tag">
            AI HEALTHCARE ASSISTANT
          </span>

          <h1>
            How can I help you today?
          </h1>

          <p>
            Ask questions about your healthcare information and get
            guidance within this platform.
          </p>
        </div>

        <button
          className="ai-back-btn"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>
      </header>

      {/* ================= SAFETY NOTICE ================= */}
      <div className="ai-safety-notice">
        <span>⚠️</span>

        <p>
          This AI assistant provides general information and platform
          guidance. It is not a replacement for professional medical advice,
          diagnosis, or emergency care.
        </p>
      </div>

      {/* =====================================================
          AI MEDICAL SUMMARY
          ===================================================== */}
      <section className="ai-chat-card ai-summary-card">

        {/* ================= SUMMARY HEADER ================= */}
        <div className="ai-chat-header">

          <div className="ai-chat-icon summary-icon">
            🧠
          </div>

          <div>
            <h2>
              AI Medical Summary
            </h2>

            <span>
              AI-assisted summary from your saved health information
            </span>
          </div>

          <div className="ai-summary-badge">
            ✨ AI Assisted
          </div>

        </div>

        {/* ================= LOADING ================= */}
        {loadingHealthData ? (

          <div className="summary-loading">
            <div className="loading-icon">
              ⏳
            </div>

            <p>
              Loading your health information...
            </p>
          </div>

        ) : (

          <div className="summary-content">

            {/* ================= BEFORE SUMMARY ================= */}
            {!summaryGenerated ? (

              <div className="summary-intro">

                <div className="summary-intro-icon">
                  🩺
                </div>

                <h3>
                  Get a quick overview of your health
                </h3>

                <p>
                  Generate a concise medical summary using the information
                  saved in your Health Profile. This can help you quickly
                  review important medical information.
                </p>

                <button
                  className="generate-summary-btn"
                  onClick={generateSummary}
                >
                  <span>✨</span>
                  Generate AI Medical Summary
                </button>

                <div className="summary-info">
                  🔒 Based on your saved health profile information
                </div>

              </div>

            ) : (

              <div className="generated-summary">

                {/* ================= SUMMARY TITLE ================= */}
                <div className="summary-title-row">

                  <div>

                    <span className="summary-label">
                      EMERGENCY MEDICAL SUMMARY
                    </span>

                    <h3>
                      {healthData?.fullName || "Patient"}
                    </h3>

                  </div>

                  <div className="summary-status">
                    ✓ Generated
                  </div>

                </div>

                {/* ================= MEDICAL INFORMATION ================= */}
                <div className="medical-info-grid">

                  {/* BLOOD GROUP */}
                  <div className="medical-info-item">

                    <span className="medical-info-icon">
                      🩸
                    </span>

                    <div>
                      <small>
                        Blood Group
                      </small>

                      <strong>
                        {healthData?.bloodGroup || "Not available"}
                      </strong>
                    </div>

                  </div>

                  {/* ALLERGIES */}
                  <div className="medical-info-item">

                    <span className="medical-info-icon">
                      ⚠️
                    </span>

                    <div>
                      <small>
                        Allergies
                      </small>

                      <strong>
                        {healthData?.allergies || "None recorded"}
                      </strong>
                    </div>

                  </div>

                  {/* MEDICAL CONDITIONS */}
                  <div className="medical-info-item">

                    <span className="medical-info-icon">
                      🩺
                    </span>

                    <div>
                      <small>
                        Medical Conditions
                      </small>

                      <strong>
                        {healthData?.medicalConditions || "None recorded"}
                      </strong>
                    </div>

                  </div>

                  {/* CURRENT MEDICATIONS */}
                  <div className="medical-info-item">

                    <span className="medical-info-icon">
                      💊
                    </span>

                    <div>
                      <small>
                        Current Medications
                      </small>

                      <strong>
                        {healthData?.currentMedications || "None recorded"}
                      </strong>
                    </div>

                  </div>

                </div>

                {/* ================= AI GENERATED TEXT ================= */}
                <div className="summary-text-box">

                  <div className="summary-text-header">
                    <span>🤖</span>

                    <strong>
                      AI-generated overview
                    </strong>
                  </div>

                  <p>
                    {summary}
                  </p>

                </div>

                {/* ================= TRANSLATION ================= */}
                <div className="translation-section">

                  <div className="translation-header">

                    <div>

                      <span className="translation-icon">
                        🌐
                      </span>

                      <div>

                        <strong>
                          Translate Summary
                        </strong>

                        <small>
                          View your medical summary in another language
                        </small>

                      </div>

                    </div>

                  </div>

                  {/* ================= TRANSLATION CONTROLS ================= */}
                  <div className="translation-controls">

                    <select
                      value={selectedLanguage}
                      onChange={(event) =>
                        setSelectedLanguage(event.target.value)
                      }
                      className="language-select"
                    >
                      <option value="English">
                        English
                      </option>

                      <option value="Hindi">
                        Hindi
                      </option>

                      <option value="Bengali">
                        Bengali
                      </option>

                      <option value="Spanish">
                        Spanish
                      </option>
                    </select>

                    <button
                      className="translate-btn"
                      onClick={translateSummary}
                    >
                      🌐 Translate
                    </button>

                  </div>

                  {/* ================= TRANSLATED SUMMARY ================= */}
                  {translatedSummary && (

                    <div className="translated-summary">

                      <div className="translated-title">

                        <span>
                          ✓
                        </span>

                        <strong>
                          {selectedLanguage} Translation
                        </strong>

                      </div>

                      <p>
                        {translatedSummary}
                      </p>

                    </div>

                  )}

                </div>

              </div>

            )}

          </div>

        )}

      </section>

      {/* =====================================================
          HEALTHCARE CHAT ASSISTANT
          ===================================================== */}
      <section className="ai-chat-card">

        {/* ================= CHAT HEADER ================= */}
        <div className="ai-chat-header">

          <div className="ai-chat-icon">
            🤖
          </div>

          <div>
            <h2>
              Healthcare Assistant
            </h2>

            <span>
              ● Online
            </span>
          </div>

        </div>

        {/* ================= MESSAGES ================= */}
        <div className="ai-messages">

          {messages.map((message) => (

            <div
              key={message.id}
              className={`ai-message-row ${
                message.sender === "user"
                  ? "user-row"
                  : "assistant-row"
              }`}
            >

              {/* AI AVATAR */}
              {message.sender === "ai" && (
                <div className="message-avatar">
                  🤖
                </div>
              )}

              {/* MESSAGE */}
              <div
                className={`message-bubble ${
                  message.sender === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >
                {message.text}
              </div>

            </div>

          ))}

        </div>

        {/* ================= SUGGESTED QUESTIONS ================= */}
        <div className="suggested-questions">

          <p>
            Try asking:
          </p>

          <div className="suggestion-buttons">

            <button
              onClick={() =>
                askSuggestion(
                  "Where can I see my prescriptions?"
                )
              }
            >
              💊 My prescriptions
            </button>

            <button
              onClick={() =>
                askSuggestion(
                  "How do I manage appointments?"
                )
              }
            >
              📅 My appointments
            </button>

            <button
              onClick={() =>
                askSuggestion(
                  "Where are my medical records?"
                )
              }
            >
              📋 Medical records
            </button>

            <button
              onClick={() =>
                askSuggestion(
                  "How do I update my health profile?"
                )
              }
            >
              🩺 Health profile
            </button>

          </div>

        </div>

        {/* ================= INPUT ================= */}
        <div className="ai-input-section">

          <input
            type="text"
            placeholder="Ask something about your healthcare information..."
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
          />

          <button
            onClick={sendMessage}
          >
            Send →
          </button>

        </div>

      </section>

    </div>
  );
}

export default AIAssistant;