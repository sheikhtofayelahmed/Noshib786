"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

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

  const formatData = (data) =>
    data.map((item) => ({
      number: item.number,
      payout: item.payout,
      pl: item.pl,
    }));

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading chart...</div>;
  }

  return (
    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 3 Digit Profit */}
      <div className="bg-white p-4 shadow-lg rounded-xl">
        <h2 className="text-xl font-semibold mb-4">3 Digit Profit</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formatData(threeD)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="number" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pl" fill="#10b981" name="Profit" />
            <Bar dataKey="payout" fill="#3b82f6" name="Payout" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 2 Digit Profit */}
      <div className="bg-white p-4 shadow-lg rounded-xl">
        <h2 className="text-xl font-semibold mb-4">2 Digit Profit</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formatData(twoD)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="number" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="pl" fill="#ef4444" name="Profit" />
            <Bar dataKey="payout" fill="#facc15" name="Payout" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
