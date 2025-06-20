import React from "react";

const NumberTable = ({ rows, data, title, line, single }) => (
  <div className="mb-16 bg-gray-900 rounded-xl shadow-2xl overflow-hidden border-2 border-red-800">
    {/* <Ticker
      title={`Hot Numbers (${title})`}
      data={data.filter((n) => n.totalPlayed > 100)}
    /> */}
    <div className="p-6 overflow-x-auto">
      <h3 className="text-3xl font-bold text-yellow-400 mb-8 text-center uppercase tracking-wider bg-black py-4 rounded-lg shadow-inner">
        {title} Game Board
      </h3>
      <table className="w-full border-collapse text-center text-white font-mono">
        <tbody>
          {title !== "Single" && (
            <tr>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((row, i) => (
                <td
                  key={i}
                  className="text-5xl text-green-600 p-4 border border-gray-500"
                >
                  {row}
                </td>
              ))}
            </tr>
          )}

          {rows.map((row, i) => (
            <tr
              key={i}
              className={
                (i + 1) % line === 0 ? "border-b-4 border-red-600" : ""
              }
            >
              {row.map((num, j) => {
                const found = data.find((d) => d._id === String(num));
                const str = found?.totalStr || 0;
                const rumble = found?.totalRumble || 0;

                const isHot = str > 0 || rumble > 0;
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
                  <td key={j} className={cellClasses}>
                    <div className="relative flex flex-col items-center justify-center w-full h-full space-y-1">
                      <span className="text-3xl leading-none">{num}</span>
                      {isHot && (
                        <div className="flex justify-between">
                          <div className="mx-2 text-sm font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md min-w-[1.5rem] text-center">
                            <span> {str}</span>
                          </div>
                          {!single && (
                            <div className="text-sm font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md min-w-[1.5rem] text-center">
                              <span> {rumble}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
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
export default NumberTable;
