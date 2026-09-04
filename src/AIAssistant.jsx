import { useState } from "react";
import "./AIAssistant.css";

function AIAssistant({ onBack }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "ai",
      text: "Hello! I'm your AI Healthcare Assistant. I can help you understand your health information, medical records, prescriptions, and appointments.",
    },
  ]);

  const [input, setInput] = useState("");

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

    return "I can help you navigate your healthcare information in this platform. You can ask about your medical records, prescriptions, appointments, or health profile.";
  };

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

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  const askSuggestion = (question) => {
    setInput(question);

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


      {/* ================= CHAT SECTION ================= */}
      <section className="ai-chat-card">

        {/* CHAT HEADER */}
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


        {/* MESSAGES */}
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

              {message.sender === "ai" && (
                <div className="message-avatar">
                  🤖
                </div>
              )}

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


        {/* SUGGESTED QUESTIONS */}
        <div className="suggested-questions">

          <p>
            Try asking:
          </p>

          <div className="suggestion-buttons">

            <button
              onClick={() =>
                askSuggestion("Where can I see my prescriptions?")
              }
            >
              💊 My prescriptions
            </button>

            <button
              onClick={() =>
                askSuggestion("How do I manage appointments?")
              }
            >
              📅 My appointments
            </button>

            <button
              onClick={() =>
                askSuggestion("Where are my medical records?")
              }
            >
              📋 Medical records
            </button>

            <button
              onClick={() =>
                askSuggestion("How do I update my health profile?")
              }
            >
              🩺 Health profile
            </button>

          </div>

        </div>


        {/* INPUT */}
        <div className="ai-input-section">

          <input
            type="text"
            placeholder="Ask something about your healthcare information..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
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