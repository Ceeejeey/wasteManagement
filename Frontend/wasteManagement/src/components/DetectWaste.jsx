import React, { useState, useRef, useEffect } from "react";
import axios from "../api/axios";

const POINTS_TO_LKR = 5;

const DetectWaste = () => {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [reviewState, setReviewState] = useState("idle"); // idle | reviewing | reverted | claimed
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  const startCamera = async () => {
    try {
      setCameraActive(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera", err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        const previewURL = URL.createObjectURL(file);
        setPreview(previewURL);
        uploadFile(file);
        stopCamera();
      }, "image/jpeg");
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      setResult(null);
      setReviewState("idle");
      const token = localStorage.getItem("token");
      const res = await axios.post("/predict_image/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setResult(res.data);
      setReviewState("reviewing");
    } catch (err) {
      console.error("Error uploading file", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);
      uploadFile(file);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);
      uploadFile(file);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => { setDragging(false); };

  const handleClaimPoints = async () => {
    if (!result?.detections?.length) {
      resetScan();
      return;
    }
    try {
      const token = localStorage.getItem("token");
      // Only NOW do we persist points — the user has reviewed and approved
      await axios.post("/api/confirm_detection", {
        detections: result.detections.map(det => ({
          waste_type: det.class,
          points_earned: det.points
        }))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReviewState("claimed");
    } catch (err) {
      console.error("Failed to confirm detection", err);
    }
  };

  const handleRejectDetection = () => {
    // Points were never saved, just reset the UI
    setReviewState("reverted");
  };

  const resetScan = () => {
    setResult(null);
    setPreview(null);
    setReviewState("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const categoryStyle = (category) => {
    if (category === "Recyclable") return "bg-blue-100 text-blue-700 border border-blue-200";
    if (category === "Non-Recyclable") return "bg-orange-100 text-orange-700 border border-orange-200";
    if (category === "Hazardous") return "bg-red-100 text-red-700 border border-red-200";
    return "bg-gray-100 text-gray-700 border border-gray-200";
  };

  // --- REVIEW SCREEN ---
  if (reviewState === "reviewing" && result) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-xl p-8 shadow-lg w-full">
          <h2 className="text-3xl font-bold mb-2 text-green-700">Detection Results</h2>
          <p className="text-gray-500 mb-6 text-sm">Please review — are these results correct?</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preview Image */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 flex items-center justify-center">
              <img src={preview} alt="Scanned" className="max-h-72 rounded-xl shadow-md object-contain w-full" />
            </div>

            {/* Detections List */}
            <div className="flex flex-col">
              {result.detections.length > 0 ? (
                <ul className="space-y-3 flex-1">
                  {result.detections.map((det, index) => (
                    <li key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="capitalize text-gray-800 font-bold text-base">
                          {det.class.replaceAll("_", " ")}
                        </span>
                        <div className="text-right">
                          <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold shadow-sm block">
                            +{det.points} pts
                          </span>
                          <span className="text-xs text-gray-400 mt-0.5 block">≈ {det.points * POINTS_TO_LKR} LKR</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${categoryStyle(det.category)}`}>
                          {det.category}
                        </span>
                        <span className="text-gray-400 text-xs bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                          Accuracy: {det.accuracy}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                  <span className="text-5xl mb-3">🤷</span>
                  <p className="text-gray-600 font-semibold">No waste detected</p>
                  <p className="text-gray-400 text-sm mt-1">Try a clearer image or different angle.</p>
                </div>
              )}

              {/* Total Points Summary */}
              {result.detections.length > 0 && (
                <div className="mt-4 bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-800">Total Earned</span>
                    <div className="text-right">
                      <span className="font-black text-2xl text-emerald-700">+{result.total_points} pts</span>
                      <span className="text-emerald-500 text-sm block">≈ {result.total_points * POINTS_TO_LKR} LKR</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Review Action Prompt */}
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
            <p className="text-amber-800 font-bold text-lg mb-1">Are these detection results correct?</p>
            <p className="text-amber-600 text-sm mb-4">If the AI misidentified your waste, you can reject the result and try again.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleClaimPoints}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow transition-all hover:scale-105"
              >
                ✅ Yes, Claim Points
              </button>
              <button
                onClick={handleRejectDetection}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-bold py-3 px-6 rounded-xl border border-red-200 transition-all hover:scale-105"
              >
                ❌ No, Incorrect Output
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- CLAIMED SCREEN ---
  if (reviewState === "claimed") {
    return (
      <div className="w-full">
        <div className="bg-white rounded-xl p-8 shadow-lg w-full text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-md">
            <span className="text-5xl">🌱</span>
          </div>
          <h2 className="text-3xl font-bold text-emerald-700 mb-2">Points Claimed!</h2>
          <p className="text-gray-500 mb-1">You earned <span className="font-black text-emerald-600">+{result?.total_points} pts</span></p>
          <p className="text-gray-400 text-sm mb-8">≈ {(result?.total_points || 0) * POINTS_TO_LKR} LKR equivalent</p>
          <button
            onClick={resetScan}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all hover:scale-105"
          >
            Scan Another Item
          </button>
        </div>
      </div>
    );
  }

  // --- REVERTED / RETRY SCREEN ---
  if (reviewState === "reverted") {
    return (
      <div className="w-full">
        <div className="bg-white rounded-xl p-8 shadow-lg w-full text-center">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-md">
            <span className="text-5xl">🔄</span>
          </div>
          <h2 className="text-3xl font-bold text-orange-700 mb-2">Points Reverted</h2>
          <p className="text-gray-500 mb-8">No worries! The incorrect detection has been removed. Please try again with a clearer image.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => { resetScan(); setTimeout(startCamera, 100); }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow transition-all hover:scale-105"
            >
              📷 Re-capture
            </button>
            <button
              onClick={resetScan}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow transition-all hover:scale-105"
            >
              📁 Re-upload
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- DEFAULT UPLOAD/CAMERA SCREEN ---
  return (
    <div className="w-full">
      <div className="bg-white rounded-xl p-8 shadow-lg w-full h-full">
        <h2 className="text-3xl font-bold mb-6 text-green-700">Detect Waste & Earn Points</h2>

        <div
          onClick={() => fileInputRef.current.click()}
          className={`w-full border-4 border-dashed rounded-xl p-10 text-center transition-all duration-300 mb-6 cursor-pointer hover:border-green-500 hover:bg-green-50/50
            ${dragging ? "border-green-600 bg-green-100" : "border-gray-300 bg-gray-50"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <span className="text-5xl block mb-3 opacity-60">🗑️</span>
          <p className="text-lg text-gray-500 font-medium">Drag & Drop your waste image here</p>
          <p className="text-sm text-gray-400 mt-2">or <span className="text-green-600 font-semibold underline">click to browse files</span></p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div className="flex flex-col items-center mt-4">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow transition"
            >
              📷 Open Camera
            </button>
          ) : (
            <div className="flex flex-col items-center space-y-4 w-full">
              <video ref={videoRef} autoPlay className="w-full max-w-md border-2 border-green-500 rounded-lg"></video>
              <div className="space-x-4">
                <button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Capture Photo
                </button>
                <button onClick={stopCamera} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                  Cancel
                </button>
              </div>
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
          )}
        </div>

        {loading && (
          <div className="mt-8 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-3"></div>
            <p className="text-lg font-medium text-green-700 animate-pulse">Analyzing your waste...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetectWaste;
