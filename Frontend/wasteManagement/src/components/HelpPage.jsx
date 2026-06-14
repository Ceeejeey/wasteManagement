import React from 'react';

const HelpPage = () => {
  return (
    <div className="bg-white/90 backdrop-blur-lg shadow-xl border border-emerald-100 rounded-3xl p-6 w-full mx-auto">
      <div className="flex items-center mb-8 pb-4 border-b border-emerald-50">
        <span className="text-5xl mr-4 drop-shadow-sm">📖</span>
        <div className="flex-1">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-500 tracking-tight">
            How It Works
          </h2>
          <p className="text-gray-500 mt-2 font-medium">Your guide to earning and spending Eco points.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Step 1 */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl shadow-sm border border-emerald-200 flex items-start gap-6 hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
            📸
          </div>
          <div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">1. Capture Waste Images</h3>
            <p className="text-emerald-800/80 leading-relaxed">
              Use the "Detect Waste" tool to scan your recyclable and non-recyclable items. Our AI system will automatically identify the waste category and award you points for disposing of them correctly!
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-100 p-6 rounded-2xl shadow-sm border border-teal-200 flex items-start gap-6 hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
            ⭐
          </div>
          <div className="w-full">
            <h3 className="text-xl font-bold text-teal-900 mb-2">2. Collect Points & Climb the Ranks</h3>
            <p className="text-teal-800/80 leading-relaxed mb-4">
              Different waste types yield different points. Rise up the global leaderboard to earn massive multipliers on every scan:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-yellow-200 text-center">
                <div className="text-2xl mb-1">🥇</div>
                <div className="font-bold text-yellow-600">1st Place</div>
                <div className="text-xs font-black bg-yellow-100 text-yellow-800 py-1 px-2 rounded-lg mt-2 inline-block">2.0x POINTS</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="text-2xl mb-1">🥈</div>
                <div className="font-bold text-gray-500">2nd Place</div>
                <div className="text-xs font-black bg-gray-100 text-gray-700 py-1 px-2 rounded-lg mt-2 inline-block">1.5x POINTS</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-200 text-center">
                <div className="text-2xl mb-1">🥉</div>
                <div className="font-bold text-orange-600">3rd Place</div>
                <div className="text-xs font-black bg-orange-100 text-orange-800 py-1 px-2 rounded-lg mt-2 inline-block">1.25x POINTS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-100 p-6 rounded-2xl shadow-sm border border-blue-200 flex items-start gap-6 hover:shadow-md transition-shadow">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl shadow-sm flex-shrink-0">
            💳
          </div>
          <div>
            <h3 className="text-xl font-bold text-indigo-900 mb-2">3. Spend Your Points</h3>
            <p className="text-indigo-800/80 leading-relaxed">
              Head over to "My Stats" and click "Spend Points (QR)". Supported campus kiosks and canteens can scan this QR code to let you buy snacks, stationery, and other cool rewards using the points you've saved up.
            </p>
          </div>
        </div>

        {/* Monthly Notice */}
        <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-2xl shadow-sm">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🏆</span>
            <div>
              <h4 className="text-amber-800 font-bold">Monthly Badge Downloads</h4>
              <p className="text-amber-700/80 text-sm mt-1">
                Badge downloads become available when the contest ends on the <strong>last day of each month</strong>! Maintain your position on the leaderboard to claim your official badge.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HelpPage;
