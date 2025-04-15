import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const Leaderboard = () => {
  const [users, setUsers] = useState([]);

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

  return (
    <div className="bg-white shadow-xl rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">🌟 Leaderboard</h2>
      <ol className="space-y-3">
        {users.map((user, index) => (
          <li
            key={user.id}
            className="flex justify-between items-center bg-green-50 p-3 rounded-lg"
          >
            <span>
              <strong className="text-green-700">{index + 1}.</strong>{" "}
              {user.username}
            </span>
            <span className="font-semibold text-green-800">
              {user.points} pts
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Leaderboard;
