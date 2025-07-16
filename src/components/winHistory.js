import React, { useMemo, useState } from "react";

const WinHistory = ({ rows, data, title }) => {
  const [activeNumber, setActiveNumber] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Collect all matched numbers from winStatus: true entries
  const matchedNumbers = new Set();

  data.forEach((entry) => {
    if (entry.winStatus) {
      matchedNumbers.add(entry.threeUp);
      matchedNumbers.add(entry.downGame);
    }
  });
  const matchDates = useMemo(() => {
    const map = new Map();
    data.forEach(({ threeUp, downGame, gameDate, winStatus }) => {
      if (!winStatus) return;

      [threeUp, downGame].forEach((num) => {
        if (!map.has(num)) map.set(num, []);
        map.get(num).push(gameDate);
      });
    });
    return map;
  }, [data]);
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
                  const isMatch = matchedNumbers.has(num);

                  const cellClasses = ` p-1 md:p-2 text-xs md:text-sm font-bold uppercase select-none
  border border-gray-700 transition
  ${
    isMatch
      ? "bg-gradient-to-br from-green-600 to-yellow-400 text-black scale-[1.05] shadow-md animate-pulse"
      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
  }
`;

                  return (
                    <td
                      key={colIndex}
                      className={cellClasses}
                      onClick={() => {
                        if (matchDates.has(num)) {
                          setActiveNumber(num);
                          setIsModalOpen(true);
                        }
                      }}
                    >
                      {num}

                      {/* {activeNumber === num && (
                        <div className="mt-1 text-xs font-bold text-black space-y-1">
                          {matchDates.get(num).map((date, i) => (
                            <div key={i}>🏆 {date}</div>
                          ))}
                        </div>
                      )} */}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && activeNumber && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-gradient-to-br from-green-600 to-yellow-400 text-black border-4 border-yellow-500 rounded-xl shadow-2xl p-6 w-[90%] max-w-sm text-center animate-fade-in font-mono">
            <h4 className="text-2xl font-bold text-red-700 mb-4">
              🎯 {activeNumber}
            </h4>

            <div className="space-y-2 text-black font-bold text-sm">
              {matchDates.get(activeNumber).map((date, i) => (
                <div
                  key={i}
                  className="bg-yellow-300 rounded-lg p-2 shadow-inner"
                >
                  🏆 {date}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setActiveNumber(null);
                setIsModalOpen(false);
              }}
              className="mt-6 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-md transition"
            >
              🚪 Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinHistory;
