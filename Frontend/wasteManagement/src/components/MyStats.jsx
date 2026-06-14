import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import axios from "../api/axios";
import { QRCodeCanvas } from "qrcode.react";

const getCategory = (wasteType) => {
  const recyclable = ['cardboard_box', 'reuseable_paper', 'cardboard_bowl', 'scrap_paper'];
  const nonRecyclable = ['plastic_bag', 'stick', 'plastic_cup', 'snack_bag', 'plastic_box', 'straw', 'plastic_cup_lid', 'scrap_plastic', 'plastic_cultery', 'plastic_bottle', 'can', 'plastic_bottle_cap'];
  const hazardous = ['battery', 'chemical_spray_can', 'chemical_plastic_bottle', 'chemical_plastic_gallon', 'light_bulb', 'paint_bucket'];

  if (recyclable.includes(wasteType)) return 'Recyclable';
  if (nonRecyclable.includes(wasteType)) return 'Non-Recyclable';
  if (hazardous.includes(wasteType)) return 'Hazardous';
  return 'Unknown';
};

const MyStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStats(res.data);
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const downloadQR = () => {
    const canvas = document.getElementById("qr-code-canvas");
    if (!canvas) return;
    
    // Add margin/padding to canvas for downloaded image
    const paddedCanvas = document.createElement("canvas");
    const padding = 20;
    paddedCanvas.width = canvas.width + padding * 2;
    paddedCanvas.height = canvas.height + padding * 2;
    const ctx = paddedCanvas.getContext("2d");
    
    // Make background white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, paddedCanvas.width, paddedCanvas.height);
    
    // Draw original QR code onto padded canvas
    ctx.drawImage(canvas, padding, padding);

    const imageUrl = paddedCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `User_${stats.id}_PointsQR.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-emerald-700 font-medium text-lg animate-pulse">Growing your stats...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center bg-red-50 text-red-600 p-6 rounded-xl mt-10 max-w-lg mx-auto shadow-sm border border-red-100">
        <span className="text-4xl block mb-3">🥀</span>
        <p className="font-semibold text-lg">Oops! Failed to load your stats.</p>
        <p className="text-sm mt-1 opacity-80">Please try again later or contact support.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-lg shadow-xl border border-emerald-100 rounded-3xl p-8 w-full">
      <div className="flex items-center mb-8 pb-4 border-b border-emerald-50">
        <span className="text-5xl mr-4 drop-shadow-sm">📊</span>
        <div className="flex-1 flex justify-between items-center">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 tracking-tight">
            My Impact
        </h2>
          <button 
            onClick={() => setShowQR(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-2 px-6 rounded-full shadow-md transition-all hover:scale-105"
          >
            <span>Spend Points (QR)</span>
            <span className="text-xl">💳</span>
          </button>
        </div>
      </div>

      {showQR && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowQR(false); }}
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-[90vw] relative">
            <button 
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl font-bold"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-emerald-800">Your Quick Pay QR</h3>
              <p className="text-sm text-gray-500 mt-2">Scan at supported campus canteens or kiosks to spend your points!</p>
              <p className="font-bold text-emerald-600 mt-1">Current Balance: {stats.points} pts</p>
            </div>
            
            <div className="flex justify-center bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-200">
                {/* 
                  We encode a URL the vendor can scan, which points to our system's payment route
                  including the user ID and short-lived token (or just their user ID if we implement vendor-side auth)
                */}
                <QRCodeCanvas 
                  id="qr-code-canvas"
                  value={`http://localhost:5173/pay?userId=${stats.id}&username=${stats.username}&points=${stats.points}`}
                  size={200}
                  level="H" // High error correction
                  className="mx-auto"
                />
            </div>

            <div className="mt-6 flex justify-center">
               <button 
                 onClick={downloadQR}
                 className="flex items-center space-x-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold py-2 px-6 rounded-xl transition-all"
               >
                 <span>Download Badge</span>
                 <span>⬇️</span>
               </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Points Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl shadow-sm border border-emerald-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm text-emerald-800 font-bold uppercase tracking-wider">Total Points</h3>
            <span className="text-3xl group-hover:scale-110 transition-transform">🌱</span>
          </div>
          <p className="text-5xl font-black text-emerald-600 drop-shadow-sm">{stats.points}</p>
        </div>

        {/* Detections Card */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-100 p-6 rounded-2xl shadow-sm border border-teal-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm text-teal-800 font-bold uppercase tracking-wider">Items Recycled</h3>
            <span className="text-3xl group-hover:scale-110 transition-transform">♻️</span>
          </div>
          <p className="text-5xl font-black text-teal-600 drop-shadow-sm">{stats.waste_logs.length}</p>
        </div>

        {/* Member Since Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-100 p-6 rounded-2xl shadow-sm border border-green-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm text-green-800 font-bold uppercase tracking-wider">Eco Hero Since</h3>
            <span className="text-3xl group-hover:scale-110 transition-transform">🌍</span>
          </div>
          <p className="text-2xl font-black text-green-600 mt-4 drop-shadow-sm">
            {new Date(stats.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="p-6 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-emerald-800">Recent Discoveries</h3>
          <span className="text-2xl">🔍</span>
        </div>
        
        {stats.waste_logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-emerald-600/70 uppercase text-xs tracking-wider">
                  <th className="p-5 font-bold">Waste Type</th>
                  <th className="p-5 font-bold">Category</th>
                  <th className="p-5 font-bold">Points Earned</th>
                  <th className="p-5 font-bold text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {stats.waste_logs.slice().reverse().map((log) => (
                  <tr key={log.id} className="hover:bg-emerald-50/40 transition-colors duration-200 group">
                    <td className="p-5 capitalize font-bold text-gray-700 flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-400 group-hover:scale-150 transition-transform shadow-sm"></div>
                      <span className="group-hover:text-emerald-700 transition-colors">{log.waste_type.replaceAll("_", " ")}</span>
                    </td>
                    <td className="p-5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm border
                        ${getCategory(log.waste_type) === 'Recyclable' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          getCategory(log.waste_type) === 'Non-Recyclable' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                          getCategory(log.waste_type) === 'Hazardous' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}
                      >
                        {getCategory(log.waste_type)}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-green-100 text-emerald-700 border border-green-200 shadow-sm group-hover:bg-green-200 transition-colors">
                        +{log.points_earned} pts
                      </span>
                    </td>
                    <td className="p-5 text-gray-500 font-medium text-right text-sm group-hover:text-emerald-600 transition-colors">
                      {new Date(log.detected_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-emerald-50/20">
            <span className="text-6xl mb-6 block opacity-70 animate-bounce">📸</span>
            <p className="text-emerald-800 text-xl font-bold mb-2">Your recycling journey awaits!</p>
            <p className="text-emerald-600/80 font-medium pb-2">Head over to the detector to scan your first item and earn points.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyStats;