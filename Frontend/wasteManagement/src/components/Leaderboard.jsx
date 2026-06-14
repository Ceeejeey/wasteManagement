import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [previewBadge, setPreviewBadge] = useState(null);
  const [badgeImageUrl, setBadgeImageUrl] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/leaderboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      }
    };

    fetchLeaderboard();
  }, []);

  const generateBadgeCanvas = (user, rank) => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    // Background color based on rank
    const colors = {
      1: "#FFD700", // Gold
      2: "#C0C0C0", // Silver
      3: "#CD7F32", // Bronze
    };
    const mainColor = colors[rank];
    const darkerColor = rank === 1 ? "#B8860B" : rank === 2 ? "#808080" : "#8B4513";

    // Draw outer ribbon
    ctx.fillStyle = darkerColor;
    ctx.beginPath();
    ctx.arc(200, 200, 190, 0, 2 * Math.PI);
    ctx.fill();

    // Draw inner circle
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.arc(200, 200, 170, 0, 2 * Math.PI);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#fff";
    ctx.stroke();

    // Add text
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    
    ctx.font = "bold 40px sans-serif";
    const title = rank === 1 ? "🥇 1st Place" : rank === 2 ? "🥈 2nd Place" : "🥉 3rd Place";
    ctx.fillText(title, 200, 120);

    ctx.font = "bold 24px sans-serif";
    ctx.fillText("Monthly Eco-Champion", 200, 170);

    // Dynamic text color for readability against metallic backgrounds
    ctx.fillStyle = "#333";
    ctx.font = "bold 22px sans-serif";
    ctx.fillText(`Name: ${user.username}`, 200, 230);
    
    ctx.font = "18px monospace";
    ctx.fillText(`User ID: ${user.id}`, 200, 260);

    const multiplier = rank === 1 ? "2.0x" : rank === 2 ? "1.5x" : "1.25x";
    ctx.fillStyle = "#222";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText(`✨ ${multiplier} POINTS MULTIPLIER ✨`, 200, 290);
    
    ctx.fillStyle = "#fff";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(`Score: ${user.points} pts`, 200, 330);

    return canvas;
  };

  const downloadBadge = (user, rank) => {
    const canvas = generateBadgeCanvas(user, rank);
    const link = document.createElement("a");
    link.download = `badge_${user.username}_rank${rank}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const viewBadge = (user, rank) => {
    const canvas = generateBadgeCanvas(user, rank);
    setBadgeImageUrl(canvas.toDataURL("image/png"));
    setPreviewBadge({ user, rank });
  };

  const getMedal = (index) => {
    if (index === 0) return "🥇 Gold";
    if (index === 1) return "🥈 Silver";
    if (index === 2) return "🥉 Bronze";
    return null;
  };

  const loggedInUsername = localStorage.getItem("username");

  const isLastDayOfMonth = () => {
    const today = new Date();
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);
    return today.getMonth() !== nextDay.getMonth();
  };

  const showDownload = isLastDayOfMonth();

  return (
    <div className="bg-white shadow-xl rounded-xl p-6">
      <div className="mb-4 text-center">
        <h2 className="text-3xl font-bold text-green-700">🌟 Monthly Leaderboard</h2>
        <p className="text-gray-500 text-sm mt-1">Top 3 collectors get exclusive monthly badges!</p>
      </div>

      <ol className="space-y-4 mt-6">
        {users.map((user, index) => {
          const medal = getMedal(index);
          const isTopThree = index < 3;
          
          return (
            <li
              key={user.id}
              className={`flex flex-col sm:flex-row justify-between items-center p-4 rounded-lg border-2 transition hover:shadow-md
                ${index === 0 ? "bg-yellow-50 border-yellow-400" : 
                  index === 1 ? "bg-gray-50 border-gray-400" : 
                  index === 2 ? "bg-orange-50 border-orange-400" : "bg-green-50 border-transparent"}`}
            >
              <div className="flex items-center space-x-3 mb-2 sm:mb-0 w-full sm:w-auto">
                <span className="font-bold text-lg w-8 text-center text-gray-600">
                  #{index + 1}
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-gray-800 text-lg flex items-center flex-wrap gap-2">
                    {user.username} 
                    {medal && <span className="ml-2 text-xs bg-white px-2 py-1 rounded-full shadow-sm border">{medal}</span>}
                    {user.points >= 100 ? (
                      <span className="text-xs bg-purple-100 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-black shadow-sm flex items-center gap-1">
                        🏆 100+ Points
                      </span>
                    ) : user.points >= 50 ? (
                      <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-black shadow-sm flex items-center gap-1">
                        🌱 50+ Points
                      </span>
                    ) : null}
                  </span>
                  {isTopThree && (
                    <span className="text-xs text-gray-500 font-mono mt-1">ID: {user.id}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
                <span className="font-extrabold text-green-800 text-xl border-b-2 border-green-200">
                  {user.points} <span className="text-sm font-normal text-green-600">pts</span>
                </span>
                
                {isTopThree && (
                  <button
                    onClick={() => viewBadge(user, index + 1)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded shadow transition whitespace-nowrap"
                  >
                    View Badge
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Badge Preview Modal */}
      {previewBadge && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full relative border border-emerald-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setPreviewBadge(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 text-2xl font-bold transition-colors"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-emerald-800">Champion Badge</h3>
              <p className="text-sm text-gray-500 mt-1">Preview of {previewBadge.user.username}'s badge</p>
            </div>
            
            <div className="flex justify-center">
              <img 
                src={badgeImageUrl} 
                alt="Badge Preview" 
                className="w-64 h-64 rounded-full shadow-lg border-4 border-emerald-100"
              />
            </div>

            <div className="mt-6 space-y-3">
              {previewBadge.user.username === loggedInUsername && showDownload ? (
                <button
                  onClick={() => downloadBadge(previewBadge.user, previewBadge.rank)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-md"
                >
                  Download Badge 💾
                </button>
              ) : (
                <div className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold p-3 rounded-xl text-center">
                  ⚠️ Official downloads are only available to the champion at the end of the month!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
