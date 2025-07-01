import React from "react";

const NumberTable = ({ rows, data, title, line, single }) => {
  const chunkSize = line;

  // 🔁 Chunk rows into groups of 6
  const rowGroups = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    rowGroups.push(rows.slice(i, i + chunkSize));
  }

  // 🔢 Compute column rumble totals per chunk
  const groupedColumnRumbleTotals = rowGroups.map((group) =>
    group[0].map((_, colIndex) =>
      group.reduce((sum, row) => {
        const num = row[colIndex];
        const found = data.find((d) => d._id === String(num));
        return sum + (found?.totalRumble || 0);
      }, 0)
    )
  );

  return (
    <div className="mb-16 bg-gray-900 rounded-xl shadow-2xl overflow-hidden border-2 border-red-800">
      <div className="p-6 overflow-x-auto">
        <h3 className="text-3xl font-bold text-yellow-400 mb-8 text-center uppercase tracking-wider bg-black py-4 rounded-lg shadow-inner">
          {title} Game Board
        </h3>
        <table className="w-full border-collapse text-center text-white font-mono">
          <tbody>
            {/* Optional column headers */}
            {title !== "Single" && (
              <tr>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((colNum) => (
                  <td
                    key={colNum}
                    className="text-4xl text-green-500 p-4 border border-gray-500"
                  >
                    {colNum}
                  </td>
                ))}
              </tr>
            )}

            {/* 🔁 Render each chunk of 6 rows */}
            {rowGroups.map((group, groupIndex) =>
              group.map((row, rowIndex) => {
                const globalRowIndex = groupIndex * chunkSize + rowIndex;

                return (
                  <tr
                    key={globalRowIndex}
                    className={
                      (globalRowIndex + 1) % line === 0
                        ? "border-b-4 border-red-600"
                        : ""
                    }
                  >
                    {row.map((num, colIndex) => {
                      const found = data.find((d) => d._id === String(num));
                      const str = found?.totalStr || 0;
                      const rumble = found?.totalRumble || 0;
                      const isHot = str > 0 || rumble > 0;

                      const colTotal =
                        groupedColumnRumbleTotals[groupIndex][colIndex];

                      const cellClasses = `
                        relative p-4 text-3xl font-extrabold uppercase select-none
                        border border-gray-700 transition-all duration-300 ease-in-out
                        ${
                          isHot
                            ? "bg-gradient-to-br from-yellow-600 to-red-700 text-white shadow-xl transform scale-105"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                        }
                      `;

                      return (
                        <td key={colIndex} className={cellClasses}>
                          <div
                            className="relative flex flex-col items-center justify-center w-full h-full space-y-1
                              transition-transform duration-300 ease-in-out hover:scale-[1.3]"
                          >
                            {/* 🧮 Chunk column total */}
                            <span className="mx-1 text-sm font-bold text-white bg-green-900 px-2 py-0.5 rounded-full shadow-md text-center min-w-[1.5rem]">
                              {colTotal}
                            </span>

                            {/* 🔢 Number */}
                            <span className="text-3xl leading-none">{num}</span>

                            {/* 📊 Stats */}
                            {isHot && (
                              <div className="flex justify-between mt-2">
                                <div className="mx-1 text-sm font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md text-center min-w-[1.5rem]">
                                  {str}
                                </div>
                                {!single && (
                                  <div className="text-sm font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md text-center min-w-[1.5rem]">
                                    {rumble}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NumberTable;
