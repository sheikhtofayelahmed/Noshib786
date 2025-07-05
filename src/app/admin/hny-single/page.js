"use client";

import React, { useEffect, useState } from "react";

export default function ProfitChart() {
  const [threeD, setThreeD] = useState([]);
  const [twoD, setTwoD] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profitLoss", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        setThreeD(data.threeD || []);
        setTwoD(data.twoD || []);
      })
      .catch((err) => console.error("Error loading data:", err))
      .finally(() => setLoading(false));
  }, []);

  const renderLines = (data, type) => {
    return (
      <div className="space-y-1">
        {data.map((item, index) => {
          const percent = Math.round(item.pl);
          const isProfit = percent >= 0;
          const width = Math.min(Math.abs(percent), 100); // Limit width to 100% max

          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span className="w-12 font-mono">{item.number}</span>
              <div className="flex-1 relative h-1 bg-gray-200 rounded overflow-hidden">
                <div
                  className={`absolute top-0 bottom-0 ${
                    isProfit ? "bg-green-500" : "bg-red-500"
                  }`}
                  style={{
                    width: `${width}%`,
                    left: isProfit ? "0" : "auto",
                    right: isProfit ? "auto" : "0",
                  }}
                />
              </div>
              <span
                className={`w-12 text-right ${
                  isProfit ? "text-green-600" : "text-red-600"
                }`}
              >
                {percent > 0 ? `+${percent}%` : `${percent}%`}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading chart...</div>;
  }

  return (
    <div className="p-6 space-y-8 max-w-3xl mx-auto">
      {/* 3 Digit Section */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">3 Digit P/L</h2>
        {renderLines(threeD, "3D")}
      </div>

      {/* 2 Digit Section */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">2 Digit P/L</h2>
        {renderLines(twoD, "2D")}
      </div>
    </div>
  );
}
