import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DetectWaste from '../components/DetectWaste'; // Importing the component
import Leaderboard from '../components/Leaderboard'; // Importing the component

const Dashboard = () => {
  const [username, setUsername] = useState('Guest');
  const [activeComponent, setActiveComponent] = useState('detect');

  useEffect(() => {
    const storedName = localStorage.getItem('username');
    if (storedName) {
      setUsername(storedName);
    }
  }, []);

  const renderContent = () => {
    switch (activeComponent) {
      case 'detect':
        return <DetectWaste />;
      case 'leaderboard':
        return <Leaderboard />;; // replace with <Leaderboard />
      case 'stats':
        return <div>Stats Coming Soon 📊</div>; // replace with <MyStats />
      default:
        return <DetectWaste />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-green-600 text-white p-6 flex-shrink-0">
        <h2 className="text-3xl font-bold text-center mb-8">Dashboard</h2>
        <br />
        <nav className="space-y-4">
          <button
            onClick={() => setActiveComponent('detect')}
            className="w-full text-left text-xl hover:bg-green-700 py-2 px-4 rounded-lg transition"
          >
            Detect Waste & Earn Points
          </button>

          <div className="border-t border-green-400 my-2"></div>

          <button
            onClick={() => setActiveComponent('leaderboard')}
            className="w-full text-left text-xl hover:bg-green-700 py-2 px-4 rounded-lg transition"
          >
            Leaderboard
          </button>

          <div className="border-t border-green-400 my-2"></div>

          <button
            onClick={() => setActiveComponent('stats')}
            className="w-full text-left text-xl hover:bg-green-700 py-2 px-4 rounded-lg transition"
          >
            My Stats
          </button>

          <div className="border-t border-green-400 my-2"></div>

          <Link
            to="/logout"
            className="block text-xl hover:bg-green-700 py-2 px-4 rounded-lg transition"
          >
            Logout
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto h-screen p-8">
        <div className="bg-white shadow-xl rounded-xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {username} 👋</h1>
          <p className="text-gray-600 mt-2">
            Your efforts in recycling are changing the world! Keep up the amazing work 🌱
          </p>
        </div>

        {/* Render the selected component */}
        {renderContent()}
      </div>
    </div>

  );
};

export default Dashboard;
