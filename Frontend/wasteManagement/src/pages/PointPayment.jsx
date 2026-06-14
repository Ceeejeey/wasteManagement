import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

const POINTS_TO_LKR = 5;

const PointPayment = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("userId");
  const username = searchParams.get("username");
  const currentPoints = parseInt(searchParams.get("points") || "0");

  const [amount, setAmount] = useState("");
  const [spentOn, setSpentOn] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const lkrValue = amount && !isNaN(amount) ? parseInt(amount) * POINTS_TO_LKR : 0;
  const currentLKR = currentPoints * POINTS_TO_LKR;

  const handlePayment = async () => {
    if (!amount || parseInt(amount) <= 0) {
      setError("Please enter a valid amount of points.");
      return;
    }
    if (parseInt(amount) > currentPoints) {
      setError(`Insufficient points. You only have ${currentPoints} pts available.`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/spend_points", {
        user_id: userId,
        amount: parseInt(amount),
        spent_on: spentOn || "General Purchase"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);

    } catch (err) {
      setError(err.response?.data?.detail || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-sm w-full">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-1">You spent <span className="font-bold text-emerald-700">{amount} pts</span></p>
          <p className="text-emerald-500 text-sm mb-6">= {parseInt(amount) * POINTS_TO_LKR} LKR</p>
          <p className="text-sm text-gray-400 animate-pulse">Redirecting back...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-sm w-full border-t-8 border-emerald-500">
        <div className="text-center mb-6">
          <span className="text-5xl block mb-4">💳</span>
          <h2 className="text-2xl font-black text-gray-800">EcoPay Checkout</h2>
          <p className="text-gray-500 text-sm mt-1">Paying with green points</p>
          <div className="bg-gray-100 text-gray-500 text-xs font-bold mt-2 inline-block px-3 py-1 rounded-full">
            Rate: 1 Point = {POINTS_TO_LKR} LKR
          </div>
        </div>

        {/* User Info + Balance */}
        <div className="bg-emerald-50 p-4 rounded-xl mb-5 border border-emerald-100">
          <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider mb-1">Paying User</p>
          <div className="flex justify-between items-start">
            <div>
              <p className="font-bold text-lg text-emerald-900">{username}</p>
              <p className="text-xs font-mono text-emerald-500 mt-0.5">ID: {userId}</p>
            </div>
            <div className="text-right">
              <span className="bg-emerald-200 text-emerald-900 text-sm font-black px-3 py-1 rounded-full block">
                {currentPoints} pts
              </span>
              <span className="text-emerald-600 text-xs mt-1 block font-medium">
                ≈ {currentLKR} LKR
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium mb-4 text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Points Amount Input */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Points to Spend</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xl font-bold text-center"
            placeholder="e.g. 50"
            min="1"
            max={currentPoints}
          />
          {/* Live LKR conversion */}
          {lkrValue > 0 && (
            <div className="mt-2 text-center">
              <span className="inline-block bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm px-4 py-1 rounded-full">
                {amount} pts = {lkrValue} LKR
              </span>
            </div>
          )}
        </div>

        {/* Description Input */}
        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">Item Description</label>
          <input
            type="text"
            value={spentOn}
            onChange={(e) => setSpentOn(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-md text-center"
            placeholder="e.g. Coffee"
          />
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50 hover:scale-105"
        >
          {loading ? "Processing..." : `Confirm Payment${lkrValue > 0 ? ` (${lkrValue} LKR)` : ""}`}
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PointPayment;