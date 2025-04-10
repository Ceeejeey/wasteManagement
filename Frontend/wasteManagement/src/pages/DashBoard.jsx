import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [username] = useState(localStorage.getItem('username') || 'Guest'); // Fetch username from local storage or default

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-green-600 text-white p-6">
  <h2 className="text-3xl font-bold text-center mb-8">Dashboard</h2>
  <br />
  <nav className="space-y-4">
    {/* Link: Detect Waste & Earn Points */}
    <Link
      to="/detect"
      className="block text-xl hover:bg-green-700 py-2 px-4 rounded-lg transition"
    >
      Detect Waste & Earn Points
    </Link>

    {/* Divider */}
    <div className="border-t border-green-400 my-2"></div>

    {/* Link: Leaderboard */}
    <Link
      to="/leaderboard"
      className="block text-xl hover:bg-green-700 py-2 px-4 rounded-lg transition"
    >
      Leaderboard
    </Link>

    {/* Divider */}
    <div className="border-t border-green-400 my-2"></div>

    {/* Link: My Stats */}
    <Link
      to="/stats"
      className="block text-xl hover:bg-green-700 py-2 px-4 rounded-lg transition"
    >
      My Stats
    </Link>

    {/* Divider */}
    <div className="border-t border-green-400 my-2"></div>

    {/* Link: Logout */}
    <Link
      to="/logout"
      className="block text-xl hover:bg-green-700 py-2 px-4 rounded-lg transition"
    >
      Logout
    </Link>
  </nav>
</div>


      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="bg-white shadow-xl rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {username} 👋</h1>
          <p className="text-gray-600 mt-2">Your efforts in recycling are changing the world! Keep up the amazing work 🌱</p>
        </div>

        {/* Additional content like detected waste, points, leaderboard, etc. */}
        {/* This will dynamically change based on the route */}
      </div>
    </div>
  );
};

export default Dashboard;
