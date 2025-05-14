import React, { useState } from "react";

function App() {
  const [message, setMessage] = useState("I am going to Paris, what should I see?");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setReply("");

    try {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from API.");
      }

      const data = await response.json();
      setReply(data.reply);
    } catch (err) {
      console.error("Error:", err);
      setError("There was a problem getting a response.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem" }}>
      <h1>AI Travel Assistant</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          rows="4"
          style={{ width: "100%" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" disabled={loading} style={{ marginTop: "1rem" }}>
          {loading ? "Asking..." : "Ask"}
        </button>
      </form>

      {reply && (
        <div style={{ marginTop: "2rem", background: "#f9f9f9", padding: "1rem" }}>
          <strong>Assistant:</strong>
          <p>{reply}</p>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default App;
