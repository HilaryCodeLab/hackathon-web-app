import React, { useState } from "react";

function App() {
  const [formData, setFormData] = useState({
    skills: [],
    interests: [],
    currentRole: "",
  });
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "skills" || name === "interests") {
      // value is converted into array
      const items = value.split(",").map((item) => item.trim());
      setFormData((prev) => ({ ...prev, [name]: items }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRecommendations(null);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: formData.skills.map((s) => s.trim()),
          interests: formData.interests.map((i) => i.trim()),
          currentRole: formData.currentRole,
        }),
      });
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
      const data = await response.json();
      setRecommendations(data.reply);
    } catch (error) {
      setError("Failed to get recommendations! Please try again");
      console.log("error calling api: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", padding: "1rem" }}>
      <h1>AI Career Advisor</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Current Role</label>
          <input
            name="currentRole"
            value={formData.currentRole}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Skills</label>
          <input
            name="skills"
            value={formData.skills.join(", ")}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Interests</label>
          <input
            name="interests"
            value={formData.interests.join(", ")}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Getting Recommendations..." : "Submit"}
        </button>
      </form>
      
      {recommendations && (
        <div style={{ marginTop: "2rem", background: "#f9f9f9", padding: "1rem" }}>
          <h2>Recommendations</h2>
          <p>{recommendations}</p>
        </div>
      )}

      {error && (
        <div style={{ marginTop: "1rem", color: "red" }}>
          <strong>{error}</strong>
        </div>
      )}

    </div>
  );
}

export default App;
