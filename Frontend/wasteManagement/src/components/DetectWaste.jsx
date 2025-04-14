import React, { useState } from "react";
import axios from "../api/axios";

const DetectWaste = () => {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);

      const formData = new FormData();
      formData.append("file", file);

      try {
        setLoading(true);

        const token = localStorage.getItem("token"); 
        const res = await axios.post("/predict_image/", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
              },
        });
        setResult(res.data);
      } catch (err) {
        console.error("Error uploading file", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  return (
    <div className="w-full ">
      <div className="bg-white rounded-xl p-8 shadow-lg w-full h-full">
        <h2 className="text-3xl font-bold mb-6 text-green-700">Detect Waste & Earn Points</h2>

        <div
          className={`w-full border-4 border-dashed rounded-xl p-10 text-center transition-all duration-300 
            ${dragging ? "border-green-600 bg-green-100" : "border-gray-300 bg-gray-50"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <p className="text-lg text-gray-500">Drag & Drop your waste image here</p>
        </div>

        {preview && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Preview:</h3>
            <img src={preview} alt="Uploaded" className="w-64 rounded-lg shadow-md" />
          </div>
        )}

        {loading && <p className="mt-6 text-lg font-medium text-green-700">Analyzing...</p>}

        {result && (
          <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow">
            <h3 className="text-2xl font-bold text-green-700 mb-4">Detection Results</h3>
            <ul className="space-y-2">
              {result.detections.map((det, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center border-b pb-2 last:border-b-0"
                >
                  <span className="capitalize text-gray-700 font-medium">
                    {det.class.replaceAll("_", " ")}
                  </span>
                  <span className="text-sm bg-green-200 text-green-800 px-3 py-1 rounded-full">
                    +{det.points} pts
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 text-right font-semibold text-xl text-green-800">
              Total Points: {result.total_points}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectWaste;
