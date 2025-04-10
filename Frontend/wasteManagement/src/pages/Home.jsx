import React from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Smart Waste Detection and Point Allocation System</h1>
        <p className="text-gray-600 mb-8">Manage waste, earn rewards, and save the planet.</p>
        
        <div className="flex flex-col gap-4">
          <Link to="/register">
            <button className="w-full py-3 px-6 rounded-xl bg-green-600 text-white font-semibold shadow-md hover:bg-green-700 transition duration-300">
              Register
            </button>
          </Link>

          <Link to="/login">
            <button className="w-full py-3 px-6 rounded-xl border-2 border-green-600 text-green-600 font-semibold hover:bg-green-50 transition duration-300">
              Login
            </button>
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-6">Crafted with 💚 by Sandun</p>
      </div>
    </div>
  );
};

export default Index;
