import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const MyStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 tracking-tight">
          My Impact
        </h2>
      </div>
      
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