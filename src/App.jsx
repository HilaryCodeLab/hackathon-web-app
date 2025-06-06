import React, { useState } from "react";
import { ReactFlow, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import DownloadCareerCSV from "./DownloadCareerCSV"; // Make sure this exists
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    skills: [],
    interests: [],
    currentRole: "",
  });
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);

  const [jobTitle, setJobTitle] = useState("");
  const [seniority, setSeniority] = useState("");
  const [country, setCountry] = useState("");
  const [jobSearchError, setJobSearchError] = useState(null);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [narrationIndex, setNarrationIndex] = useState(0);
  const [isNarrating, setIsNarrating] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

  const countryOptions = [
    { code: "AU", name: "Australia" },
    { code: "BD", name: "Bangladesh" },
    { code: "BN", name: "Brunei" },
    { code: "KH", name: "Cambodia" },
    { code: "CA", name: "Canada" },
    { code: "CN", name: "China" },
    { code: "IN", name: "India" },
    { code: "ID", name: "Indonesia" },
    { code: "JP", name: "Japan" },
    { code: "KR", name: "Korea" },
    { code: "LA", name: "Laos" },
    { code: "MY", name: "Malaysia" },
    { code: "MM", name: "Myanmar" },
    { code: "NP", name: "Nepal" },
    { code: "NZ", name: "New Zealand" },
    { code: "PH", name: "Philippines" },
    { code: "SG", name: "Singapore" },
    { code: "LK", name: "Sri Lanka" },
    { code: "TH", name: "Thailand" },
    { code: "US", name: "United States" },
    { code: "GB", name: "United Kingdom" },
    { code: "VN", name: "Vietnam" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "skills" || name === "interests") {
      const items = value.split(",").map((item) => item.trim());
      setFormData((prev) => ({ ...prev, [name]: items }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();
      setRecommendations(data.reply);
    } catch (err) {
      setError("Failed to get recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const handleJobSearch = async (e) => {
    e.preventDefault();
    setJobSearchError(null);


    if (!jobTitle.trim()) {
      setJobSearchError("Please enter a job title.");
      return;
    }

    const filters = { job_title_or: [jobTitle] };
    if (seniority) filters.job_seniority_or = [seniority];
    if (country) filters.job_country_code_or = [country];

    try {
      const res = await fetch("/api/generateCareerMap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filters),
      });

      if (!res.ok) throw new Error("Job API failed");

      const data = await res.json();
      if (data.nodes && data.edges) {
        const edgesWithArrows = data.edges.map((edge) => ({
          ...edge,
          style: { stroke: "#FF0072" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#FF0072" },
        }));

        setNodes(data.nodes);
        setEdges(edgesWithArrows);
      } else {
        setJobSearchError("Unexpected response format.");
      }
    } catch (err) {
      setJobSearchError("Failed to fetch career map.");
    }

  };

  const highlightedNodes = nodes.map((node, index) => ({
    ...node,
    style: {
      ...node.style,
      backgroundColor: darkMode ? "#fff":"#1e1e1e",
      color: darkMode ? "#000":"#fff",
      border: index === narrationIndex && isNarrating ? "3px solid #FF0072" : undefined,
      padding: 16,
      minWidth: 180,
      minHeight: 80,
      fontSize: 14,
      borderRadius: 8,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      whiteSpace: "normal",
      wordBreak: "break-word",
    },
  }));

  return (
    <div className="container">
      <h1>AI Career Advisor</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Current Role</label>
          <input name="currentRole" value={formData.currentRole} onChange={handleChange} required />
        </div>
        <div>
          <label>Skills (comma-separated)</label>
          <input name="skills" value={formData.skills.join(", ")} onChange={handleChange} required />
        </div>
        <div>
          <label>Interests (comma-separated)</label>
          <input name="interests" value={formData.interests.join(", ")} onChange={handleChange} required />
        </div>
        <div className="button-group">
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Get Recommendations"}
          </button>
        </div>
      </form>

      {recommendations && <p style={{ marginTop: "1rem" }}>{recommendations}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2 style={{ marginTop: "2rem" }}>Explore Career Path</h2>

      <form onSubmit={handleJobSearch}>
        <div>
          <label>Job Title (required)</label>
          <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
        </div>
        <div>
          <label>Seniority</label>
          <select value={seniority} onChange={(e) => setSeniority(e.target.value)}>
            <option value="">All</option>
            <option value="junior">Junior</option>
            <option value="mid_level">Mid Level</option>
            <option value="senior">Senior</option>
          </select>
        </div>
        <div>
          <label>Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">All</option>
            {countryOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="button-group">

          <button type="submit"> Search </button>

        </div>

      </form>

      {jobSearchError && <p style={{ color: "red" }}>{jobSearchError}</p>}

      {nodes.length > 0 && edges.length > 0 && (
        <div className="career-map-container">
          <div className="career-map-button-group">
            <DownloadCareerCSV careerMap={{ nodes }} />
            <button onClick={() => { setIsNarrating(true); setNarrationIndex(0); }}>Start Narration</button>
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className={`toggle-mode-button ${darkMode ? "dark" : ""}`}
            >
              Switch to {darkMode ? "Light" : "Dark"} Mode
            </button>
          </div>
          <ReactFlow
            style={{ minHeight: "100%", width: "100%" }}
            className={darkMode ? "reactflow-dark" : ""}
            nodes={highlightedNodes}
            edges={edges}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            nodesDraggable={false}
            nodesConnectable={false}
            panOnDrag
            zoomOnScroll
            zoomOnPinch
            selectionOnDrag={false}
            proOptions={{ hideAttribution: true }}
          />
        </div>
      )}

      {isNarrating && nodes.length > 0 && (
        <div className="narration-container">
          <h3>Narration</h3>
          <p><strong>{nodes[narrationIndex].data.label}</strong></p>
          <p>{nodes[narrationIndex].data.note}</p>
          <div className="button-group">
            <button onClick={() => setNarrationIndex((prev) => Math.max(prev - 1, 0))} disabled={narrationIndex === 0}>Previous</button>
            <button onClick={() => setNarrationIndex((prev) => Math.min(prev + 1, nodes.length - 1))} disabled={narrationIndex === nodes.length - 1}>Next</button>
            <button onClick={() => setIsNarrating(false)}>End</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
