export default function NumberChart() {
  return (
    <main className="p-4 max-w-5xl mx-auto min-h-screen bg-gradient-to-br from-black via-red-900 to-black text-yellow-300 font-mono">
      <h1 className="text-4xl sm:text-6xl font-extrabold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-500 to-red-500 animate-pulse drop-shadow-[0_0_10px_gold]">
        🎰 HAPPY NEW YEAR 2025 🎰
      </h1>

      <div className="space-y-8">
        <Section title="🎯 SINGLE" rows={singleRows} />
        <Section title="💥 DOUBLE" rows={doubleRows} />
        <Section title="🎲 DOWN" rows={downRows} />
      </div>
    </main>
  );
}

function Section({ title, rows }) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-yellow-400">{title}</h2>
      <TableSection rows={rows} />
    </div>
  );
}

function TableSection({ rows }) {
  return (
    <div className="overflow-x-auto bg-gray-900 bg-opacity-80 rounded-lg shadow-lg ring-2 ring-yellow-500">
      <table className="min-w-full text-sm sm:text-base table-auto border border-yellow-500">
        <thead className="bg-yellow-500">
          <tr>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
              <th
                key={num}
                className="px-2 sm:px-4 py-2 border border-yellow-500 text-center font-semibold text-black"
              >
                {num}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}>
              {row.map((n, j) => (
                <td
                  key={j}
                  className="px-2 sm:px-4 py-2 border border-yellow-500 text-center text-yellow-300 font-semibold"
                >
                  {n}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const singleRows = [
  [128, 129, 120, 130, 140, 123, 124, 125, 126, 127],
  [137, 138, 139, 149, 159, 150, 160, 134, 135, 136],
  [146, 147, 148, 158, 168, 169, 179, 170, 180, 145],
  [236, 156, 157, 167, 230, 178, 250, 189, 234, 190],
  [245, 237, 238, 239, 249, 240, 269, 260, 270, 235],
  [290, 246, 247, 248, 258, 259, 278, 279, 289, 280],
  [380, 345, 256, 257, 267, 268, 340, 350, 360, 370],
  [470, 390, 346, 347, 348, 349, 359, 369, 379, 389],
  [489, 480, 490, 356, 357, 358, 368, 378, 450, 460],
  [560, 570, 580, 590, 456, 367, 458, 459, 469, 479],
  [579, 589, 670, 680, 690, 457, 467, 468, 478, 569],
  [678, 679, 689, 789, 780, 790, 890, 567, 568, 578],
];

const doubleRows = [
  [100, 110, 166, 112, 113, 114, 115, 116, 117, 118],
  [119, 200, 229, 220, 122, 277, 133, 224, 144, 226],
  [155, 228, 300, 266, 177, 330, 188, 233, 199, 244],
  [227, 255, 337, 338, 339, 448, 223, 288, 225, 299],
  [335, 336, 355, 400, 366, 466, 377, 440, 388, 334],
  [344, 499, 445, 446, 447, 556, 449, 477, 559, 488],
  [399, 660, 599, 455, 500, 600, 557, 558, 577, 550],
  [588, 688, 779, 699, 799, 880, 566, 800, 667, 668],
  [669, 778, 788, 770, 889, 899, 700, 990, 900, 677],
  [777, 444, 111, 888, 555, 222, 999, 666, 333, "000"],
];

const downRows = [
  [10, 20, 30, 40, 50, 60, 70, 80, 90, 0],
  [29, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  [38, 39, 49, 22, 23, 24, 25, 26, 27, 28],
  [47, 48, 58, 59, 69, 33, 34, 35, 36, 37],
  [56, 57, 67, 68, 78, 79, 89, 44, 45, 46],
  ["XX", 66, "XX", 77, "XX", 88, "XX", 99, "XX", 55],
];
