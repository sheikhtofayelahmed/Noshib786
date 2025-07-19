import React, { useMemo, useState } from "react";

const WinHistory = ({ rows, title }) => {
  return (
    <div className="my-10 mx-5 md:mx-auto max-w-4xl  bg-gray-900 rounded-xl shadow-2xl border-2 border-cyan-800">
      <h3 className="text-base md:text-2xl font-bold text-yellow-400 mb-4 text-center uppercase tracking-wider bg-black py-2 rounded-lg shadow-inner">
        {title} Game Board
      </h3>

      <div className="overflow-x-auto ">
        <table className="min-w-[350px] w-full border-collapse text-center text-white font-mono text-sm md:text-base">
          <tbody className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-purple-700/80 transition-colors duration-300"
              >
                {row.map((num, colIndex) => {
                  const cellClasses = `
          p-1 md:p-2 text-xs md:text-sm font-bold uppercase select-none
          border border-purple-700 text-yellow-400 drop-shadow-lg
          transition
        `;
                  return (
                    <td key={colIndex} className={cellClasses}>
                      {num}
                    </td>
                  );
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
