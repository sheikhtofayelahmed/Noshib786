"use client";

import Loading from "@/components/Loading";
import NumberTable from "@/components/NumberTable";
import { useEffect, useState } from "react";

// NumberTable Component - Transformed into a visually striking casino grid
// const NumberTable = ({ rows, data, title }) => (
//   <div className="mb-16 bg-gray-900 rounded-xl shadow-2xl overflow-hidden border-2 border-red-800">
//     {/* <Ticker
//       title={`Hot Numbers (${title})`}
//       data={data.filter((n) => n.totalPlayed > 100)}
//     /> */}
//     <div className="p-6 overflow-x-auto">
//       <h3 className="text-3xl font-bold text-yellow-400 mb-8 text-center uppercase tracking-wider bg-black py-4 rounded-lg shadow-inner">
//         {title} Game Board
//       </h3>
//       <table className="w-full border-collapse text-center text-white font-mono">
//         <tbody>
//           {title !== "Single" && (
//             <tr>
//               {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((row, i) => (
//                 <td
//                   key={i}
//                   className="text-5xl text-green-600 p-4 border border-gray-500"
//                 >
//                   {row}
//                 </td>
//               ))}
//             </tr>
//           )}

//           {rows.map((row, i) => (
//             <tr
//               key={i}
//               className={(i + 1) % 6 === 0 ? "border-b-4 border-red-600" : ""}
//             >
//               {row.map((num, j) => {
//                 const found = data.find((d) => d._id === String(num));
//                 const str = found?.totalStr || 0;
//                 const rumble = found?.totalRumble || 0;

//                 const isHot = str > 0 || rumble > 0;
//                 const cellClasses = `
//                   relative p-4 text-3xl font-extrabold uppercase select-none
//                   border border-gray-700 transition-all duration-300 ease-in-out
//                   ${
//                     isHot
//                       ? "bg-gradient-to-br from-yellow-600 to-red-700 text-white shadow-xl transform scale-105"
//                       : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
//                   }
//                 `;

//                 return (
//                   <td key={j} className={cellClasses}>
//                     <div className="relative flex flex-col items-center justify-center w-full h-full space-y-1">
//                       <span className="text-3xl leading-none">{num}</span>
//                       {isHot && (
//                         <>
//                           <div className="text-sm font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md min-w-[1.5rem] text-center">
//                             <span> {str}</span>
//                           </div>
//                           <div className="text-sm font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md min-w-[1.5rem] text-center">
//                             <span> {rumble}</span>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </td>
//                 );
//               })}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   </div>
// );

// Main Page Component - Overall casino lounge feel
export default function HappyNewYear() {
  const [numberData, setNumberData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch("/api/happyNewYear");
      if (!res.ok) {
        console.error("Failed to fetch number stats:", res.statusText);
        return;
      }
      const data = await res.json();
      setNumberData(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const threeDigitRows = [
    ["128", "129", "120", "130", "140", "123", "124", "125", "126", "127"],
    ["182", "291", "201", "310", "401", "321", "412", "251", "621", "271"],
    ["218", "912", "102", "301", "410", "132", "214", "215", "216", "721"],
    ["281", "921", "210", "103", "104", "213", "241", "152", "261", "172"],
    ["821", "219", "012", "013", "041", "312", "421", "125", "162", "217"],
    ["812", "129", "021", "301", "014", "231", "142", "512", "126", "712"],
    ["137", "138", "139", "149", "159", "150", "160", "134", "135", "136"],
    ["731", "813", "391", "941", "951", "051", "601", "413", "513", "631"],
    ["317", "381", "931", "419", "195", "510", "016", "341", "315", "163"],
    ["173", "831", "193", "914", "915", "105", "061", "314", "135", "316"],
    ["713", "138", "913", "491", "159", "501", "106", "143", "153", "136"],
    ["371", "183", "931", "149", "519", "015", "610", "134", "153", "613"],
    ["146", "147", "148", "158", "168", "169", "179", "170", "180", "145"],
    ["461", "741", "814", "851", "861", "691", "971", "701", "810", "541"],
    ["164", "417", "841", "185", "618", "619", "791", "107", "081", "154"],
    ["641", "471", "481", "158", "681", "196", "179", "017", "801", "415"],
    ["614", "714", "148", "581", "186", "169", "197", "170", "018", "145"],
    ["146", "147", "841", "518", "861", "961", "971", "701", "180", "451"],
    ["236", "156", "157", "167", "230", "178", "250", "189", "234", "190"],
    ["362", "516", "571", "716", "320", "817", "520", "981", "432", "910"],
    ["623", "165", "715", "176", "203", "871", "205", "198", "243", "901"],
    ["326", "651", "157", "671", "302", "718", "052", "819", "342", "109"],
    ["263", "561", "751", "167", "230", "187", "025", "891", "324", "190"],
    ["632", "615", "175", "761", "032", "178", "502", "891", "234", "091"],
    ["245", "237", "238", "239", "249", "240", "269", "260", "270", "235"],
    ["452", "372", "832", "392", "942", "420", "962", "602", "702", "532"],
    ["425", "723", "283", "329", "294", "204", "629", "260", "027", "253"],
    ["254", "237", "382", "239", "429", "042", "296", "026", "720", "523"],
    ["245", "273", "238", "932", "249", "024", "962", "206", "072", "325"],
    ["524", "327", "823", "293", "294", "402", "269", "602", "270", "235"],
    ["290", "246", "247", "248", "258", "259", "278", "279", "289", "280"],
    ["902", "462", "472", "482", "582", "592", "872", "972", "892", "820"],
    ["209", "624", "742", "284", "825", "952", "728", "729", "298", "208"],
    ["029", "264", "427", "248", "528", "295", "278", "297", "829", "028"],
    ["920", "426", "742", "284", "852", "259", "872", "279", "982", "280"],
    ["902", "246", "247", "842", "825", "952", "278", "297", "892", "820"],
    ["380", "345", "256", "257", "267", "268", "340", "350", "360", "370"],
    ["803", "453", "652", "752", "762", "628", "403", "530", "630", "703"],
    ["038", "345", "562", "527", "276", "826", "304", "503", "306", "073"],
    ["083", "354", "625", "572", "267", "862", "043", "305", "063", "370"],
    ["308", "435", "526", "257", "726", "286", "304", "350", "360", "307"],
    ["803", "543", "265", "275", "627", "268", "430", "035", "603", "073"],
    ["470", "390", "346", "347", "348", "349", "359", "369", "379", "389"],
    ["704", "093", "436", "743", "843", "439", "953", "396", "937", "983"],
    ["074", "930", "634", "473", "384", "493", "395", "639", "973", "389"],
    ["407", "390", "346", "374", "438", "349", "359", "963", "793", "839"],
    ["470", "309", "364", "437", "348", "943", "935", "936", "397", "839"],
    ["047", "903", "643", "437", "348", "394", "593", "369", "379", "389"],
    ["489", "480", "490", "356", "357", "358", "368", "378", "450", "460"],
    ["894", "804", "904", "536", "735", "853", "836", "873", "504", "640"],
    ["498", "840", "409", "365", "357", "583", "863", "738", "054", "406"],
    ["849", "408", "049", "653", "537", "358", "638", "378", "540", "046"],
    ["948", "084", "490", "635", "735", "835", "386", "387", "045", "604"],
    ["489", "840", "940", "563", "573", "358", "368", "738", "054", "460"],
    ["560", "570", "580", "590", "456", "367", "458", "459", "469", "479"],
    ["605", "075", "850", "059", "654", "736", "584", "954", "946", "497"],
    ["065", "705", "085", "509", "645", "637", "845", "495", "694", "947"],
    ["506", "057", "580", "950", "546", "367", "854", "459", "964", "749"],
    ["650", "570", "580", "095", "456", "637", "548", "954", "496", "479"],
    ["056", "750", "085", "905", "465", "376", "458", "945", "649", "974"],
    ["579", "589", "670", "680", "690", "457", "467", "468", "478", "569"],
    ["795", "895", "706", "806", "960", "745", "647", "684", "874", "956"],
    ["597", "859", "607", "068", "096", "457", "476", "846", "478", "695"],
    ["975", "985", "760", "860", "069", "547", "674", "864", "748", "956"],
    ["957", "589", "076", "086", "690", "457", "746", "648", "748", "695"],
    ["759", "598", "670", "608", "906", "574", "647", "468", "487", "965"],
    ["678", "679", "689", "789", "780", "790", "890", "567", "568", "578"],
    ["786", "769", "896", "879", "870", "970", "980", "675", "856", "857"],
    ["867", "697", "869", "987", "708", "709", "809", "765", "658", "875"],
    ["768", "967", "986", "798", "087", "079", "908", "576", "586", "758"],
    ["678", "976", "968", "789", "870", "097", "890", "567", "856", "578"],
    ["867", "976", "698", "897", "807", "970", "980", "657", "865", "785"],
  ];
  const columns = Array.from({ length: 10 }, (_, i) => i); // 0–9 columns

  const columnData = columns.reduce((acc, col) => {
    acc[col] = [];
    return acc;
  }, {});

  numberData.forEach((item) => {
    const numStr = item._id.toString();
    const str = item.totalStr;
    const rumble = item.totalRumble;

    // Check if numStr has length 3 and all digits are unique
    if (
      numStr.length === 3 &&
      new Set(numStr).size === 3 && // ensures unique digits
      (str > 100 || rumble > 100)
    ) {
      const digitSum = numStr
        .split("")
        .map(Number)
        .reduce((a, b) => a + b, 0);
      const columnKey = digitSum % 10;

      if (!columnData[columnKey]) columnData[columnKey] = [];
      columnData[columnKey].push({ number: numStr, str, rumble });
    }
  });
  if (loading) {
    return <Loading></Loading>;
  }
  return (
    <div className="w-full p-8 bg-gradient-to-b from-black to-red-950 min-h-screen font-sans text-gray-100 select-none overflow-x-hidden">
      <h1 className="text-center text-6xl font-extrabold mb-16 uppercase tracking-widest text-red-500 drop-shadow-lg animate-pulse-light">
        🎰 Thai Lottery Agent 🎲
      </h1>
      <div className="mb-16 bg-gray-950 rounded-xl shadow-2xl border-2 border-yellow-600 overflow-x-auto">
        <h3 className="text-3xl font-bold text-yellow-400 mb-4 text-center uppercase tracking-wider bg-black py-4 rounded-lg shadow-inner">
          🎯 Hot Numbers
        </h3>
        <table className="w-full text-center font-mono text-sm md:text-base text-white">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="p-2 bg-red-900 border border-gray-700 text-4xl"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {columns.map((col) => (
                <td
                  key={col}
                  className="align-top p-2 border border-gray-700 bg-gray-900"
                >
                  {columnData[col].map(({ number, str, rumble }, idx) => (
                    <div
                      key={idx}
                      className="text-green-400 font-bold text-2xl mb-1 px-1"
                    >
                      <span className="text-white">{number}</span> = {str} ={" "}
                      <span className="text-red-500">{rumble}</span>
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <NumberTable
        title="3 Digit Unique"
        rows={threeDigitRows}
        data={numberData}
        line={6}
      />

      {/* Tailwind CSS custom animations and colors (add to your global CSS or tailwind.config.js) */}
    </div>
  );
}
