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

  //for job API
  const [jobTitle, setJobTitle] = useState("");
  const [seniority, setSeniority] = useState("");
  const [country, setCountry] = useState("");
  const [jobSearchError, setJobSearchError] = useState(null);

  const countryOptions = [
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "IN", name: "India" },
    { code: "CA", name: "Canada" },
    { code: "DE", name: "Germany" },
    { code: "AU", name: "Australia" },
    // Add more as needed
  ];

   // 🔽 JOB FILTER FORM HANDLER
   const handleJobSearch = async (e) => {
    e.preventDefault();
    setJobSearchError(null);

    if (!jobTitle.trim()) {
      setJobSearchError("Please enter a job title.");
      return;
    }

    const filters = {
      job_title_or: [jobTitle],
    };

    if (seniority) filters.job_seniority_or = [seniority];
    if (country) filters.job_country_code_or = [country];

    try {
      const res = await fetch("/api/generateCareerMap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });

      if (!res.ok) {
        throw new Error(`API call failed with status: ${res.status}`);
      }

      const data = await res.json();
    } catch (error) {
      setJobSearchError("Failed to fetch jobs! Please try again");
      console.error("error calling fetchJobs API:", error);
    }
  };


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

      <h2>Search Jobs</h2>
      <form onSubmit={handleJobSearch}>
        <div>
          <label>Job Title (required)</label>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Seniority (optional)</label>
          <select value={seniority} onChange={(e) => setSeniority(e.target.value)}>
            <option value="">All</option>
            <option value="junior">Junior</option>
            <option value="mid_level">Mid Level</option>
            <option value="senior">Senior</option>
          </select>
        </div>
        <div>
          <label>Country (optional)</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">All</option>
            {countryOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Search Jobs</button>
      </form>

      {jobSearchError && (
        <div style={{ color: "red", marginTop: "1rem" }}>
          <strong>{jobSearchError}</strong>
        </div>
      )}

     
    </div>
  );
}

export default App;
