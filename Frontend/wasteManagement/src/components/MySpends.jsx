import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const MySpends = () => {
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
        <p className="text-emerald-700 font-medium text-lg animate-pulse">Loading your spending history...</p>
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
        <span className="text-5xl mr-4 drop-shadow-sm">💳</span>
        <div className="flex-1 flex justify-between items-center">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 tracking-tight">
            My Spending History
          </h2>
          <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl font-bold shadow-sm">
            Balance: {stats.points} pts
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
        <div className="p-6 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-emerald-800">Recent Purchases</h3>
          <span className="text-2xl">🛍️</span>
        </div>
        
        {stats.spend_logs && stats.spend_logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-emerald-600/70 uppercase text-xs tracking-wider">
                  <th className="p-5 font-bold">Item Description</th>
                  <th className="p-5 font-bold">Points Spent</th>
                  <th className="p-5 font-bold text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {stats.spend_logs.slice().reverse().map((log) => (
                  <tr key={log.id} className="hover:bg-emerald-50/40 transition-colors duration-200 group">
                    <td className="p-5 capitalize font-bold text-gray-700 flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-400 to-orange-400 group-hover:scale-150 transition-transform shadow-sm"></div>
                      <span className="group-hover:text-emerald-700 transition-colors">{log.spent_on || "General Purchase"}</span>
                    </td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-red-50 text-red-700 border border-red-100 shadow-sm group-hover:bg-red-100 transition-colors">
                        -{log.amount} pts
                      </span>
                    </td>
                    <td className="p-5 text-gray-500 font-medium text-right text-sm group-hover:text-emerald-600 transition-colors">
                      {new Date(log.spent_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-6 bg-emerald-50/20">
            <span className="text-6xl mb-6 block opacity-70 animate-bounce">☕</span>
            <p className="text-emerald-800 text-xl font-bold mb-2">You haven't spent any points yet!</p>
            <p className="text-emerald-600/80 font-medium pb-2">Use your points at supported vendors to grab a snack.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySpends;
