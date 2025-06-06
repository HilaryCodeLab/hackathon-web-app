import React from "react";

const DownloadCareerCSV = ({ careerMap }) => {
  const flattenData = () => {
    if (!careerMap || !Array.isArray(careerMap.nodes)) return [];

    return careerMap.nodes.map((node) => ({
      id: node.id,
      label: node.data.label,
      note: node.data.note,
      year: node.data.year || "", // fallback if missing
    }));
  };

  const convertToCSV = (data) => {
    if (!data.length) return "";

    const header = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    );
    return [header, ...rows].join("\n");
  };

  const downloadCSV = () => {
    const flatData = flattenData();
    const csvContent = convertToCSV(flatData);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "career_map.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={downloadCSV} disabled={!careerMap?.nodes?.length}>
      Download Career Map as CSV
    </button>
  );
};

export default DownloadCareerCSV;
