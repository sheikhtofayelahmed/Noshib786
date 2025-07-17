import React, { useMemo, useState } from "react";

const WinHistory = ({ rows, title }) => {
  return (
    <div className="mt-10 w-full bg-gray-900 rounded-xl shadow-2xl border-2 border-red-800">
      <h3 className="text-base md:text-2xl font-bold text-yellow-400 mb-4 text-center uppercase tracking-wider bg-black py-2 rounded-lg shadow-inner">
        {title} Game Board
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-[350px] w-full border-collapse text-center text-white font-mono text-sm md:text-base">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((num, colIndex) => {
                  return <td key={colIndex}>{num}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WinHistory;
