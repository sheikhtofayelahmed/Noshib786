"use client";

import { useEffect, useState } from "react";

// NumberTable Component - Transformed into a visually striking casino grid
const NumberTable = ({ rows, data, title }) => (
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
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((row, i) => (
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
            <tr key={i}>
              {row.map((num, j) => {
                const found = data.find((d) => d._id === String(num));
                const played = found?.totalPlayed || 0;

                const isHot = played > 0;
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
                        <div className="text-sm font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md min-w-[1.5rem] text-center">
                          {played}
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

// Main Page Component - Overall casino lounge feel
export default function HappyNewYear() {
  const [numberData, setNumberData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/happyNewYear");
      if (!res.ok) {
        console.error("Failed to fetch number stats:", res.statusText);
        return;
      }
      const data = await res.json();
      setNumberData(data);
    };
    fetchData();
  }, []);

  const threeDigitRows = [
    ["012", "013", "014", "015", "016", "017", "018", "019", "021", "023"],
    ["024", "025", "026", "027", "028", "029", "031", "032", "034", "035"],
    ["036", "037", "038", "039", "041", "042", "043", "045", "046", "047"],
    ["048", "049", "051", "052", "053", "054", "056", "057", "058", "059"],
    ["061", "062", "063", "064", "065", "067", "068", "069", "071", "072"],
    ["073", "074", "075", "076", "078", "079", "081", "082", "083", "084"],
    ["085", "086", "087", "089", "091", "092", "093", "094", "095", "096"],
    ["097", "098", "102", "103", "104", "105", "106", "107", "108", "109"],
    ["120", "123", "124", "125", "126", "127", "128", "129", "130", "132"],
    ["134", "135", "136", "137", "138", "139", "140", "142", "143", "145"],
    ["146", "147", "148", "149", "150", "152", "153", "154", "156", "157"],
    ["158", "159", "160", "162", "163", "164", "165", "167", "168", "169"],
    ["170", "172", "173", "174", "175", "176", "178", "179", "180", "182"],
    ["183", "184", "185", "186", "187", "189", "190", "192", "193", "194"],
    ["195", "196", "197", "198", "201", "203", "204", "205", "206", "207"],
    ["208", "209", "210", "213", "214", "215", "216", "217", "218", "219"],
    ["230", "231", "234", "235", "236", "237", "238", "239", "240", "241"],
    ["243", "245", "246", "247", "248", "249", "250", "251", "253", "254"],
    ["256", "257", "258", "259", "260", "261", "263", "264", "265", "267"],
    ["268", "269", "270", "271", "273", "274", "275", "276", "278", "279"],
    ["280", "281", "283", "284", "285", "286", "287", "289", "290", "291"],
    ["293", "294", "295", "296", "297", "298", "301", "302", "304", "305"],
    ["306", "307", "308", "309", "310", "312", "314", "315", "316", "317"],
    ["318", "319", "320", "321", "324", "325", "326", "327", "328", "329"],
    ["340", "341", "342", "345", "346", "347", "348", "349", "350", "351"],
    ["352", "354", "356", "357", "358", "359", "360", "361", "362", "364"],
    ["365", "367", "368", "369", "370", "371", "372", "374", "375", "376"],
    ["378", "379", "380", "381", "382", "384", "385", "386", "387", "389"],
    ["390", "391", "392", "394", "395", "396", "397", "398", "401", "402"],
    ["403", "405", "406", "407", "408", "409", "410", "412", "413", "415"],
    ["416", "417", "418", "419", "420", "421", "423", "425", "426", "427"],
    ["428", "429", "430", "431", "432", "435", "436", "437", "438", "439"],
    ["450", "451", "452", "453", "456", "457", "458", "459", "460", "461"],
    ["462", "463", "465", "467", "468", "469", "470", "471", "472", "473"],
    ["475", "476", "478", "479", "480", "481", "482", "483", "485", "486"],
    ["487", "489", "490", "491", "492", "493", "495", "496", "497", "498"],
    ["501", "502", "503", "504", "506", "507", "508", "509", "510", "512"],
    ["513", "514", "516", "517", "518", "519", "520", "521", "523", "524"],
    ["526", "527", "528", "529", "530", "531", "532", "534", "536", "537"],
    ["538", "539", "540", "541", "542", "543", "546", "547", "548", "549"],
    ["560", "561", "562", "563", "564", "567", "568", "569", "570", "571"],
    ["572", "573", "574", "576", "578", "579", "580", "581", "582", "583"],
    ["584", "586", "587", "589", "590", "591", "592", "593", "594", "596"],
    ["597", "598", "601", "602", "603", "604", "605", "607", "608", "609"],
    ["610", "612", "613", "614", "615", "617", "618", "619", "620", "621"],
    ["623", "624", "625", "627", "628", "629", "630", "631", "632", "634"],
    ["635", "637", "638", "639", "640", "641", "642", "643", "645", "647"],
    ["648", "649", "650", "651", "652", "653", "654", "657", "658", "659"],
    ["670", "671", "672", "673", "674", "675", "678", "679", "680", "681"],
    ["682", "683", "684", "685", "687", "689", "690", "691", "692", "693"],
    ["694", "695", "697", "698", "701", "702", "703", "704", "705", "706"],
    ["708", "709", "710", "712", "713", "714", "715", "716", "718", "719"],
    ["720", "721", "723", "724", "725", "726", "728", "729", "730", "731"],
    ["732", "734", "735", "736", "738", "739", "740", "741", "742", "743"],
    ["745", "746", "748", "749", "750", "751", "752", "753", "754", "756"],
    ["758", "759", "760", "761", "762", "763", "764", "765", "768", "769"],
    ["780", "781", "782", "783", "784", "785", "786", "789", "790", "791"],
    ["792", "793", "794", "795", "796", "798", "801", "802", "803", "804"],
    ["805", "806", "807", "809", "810", "812", "813", "814", "815", "816"],
    ["817", "819", "820", "821", "823", "824", "825", "826", "827", "829"],
    ["830", "831", "832", "834", "835", "836", "837", "839", "840", "841"],
    ["842", "843", "845", "846", "847", "849", "850", "851", "852", "853"],
    ["854", "856", "857", "859", "860", "861", "862", "863", "864", "865"],
    ["867", "869", "870", "871", "872", "873", "874", "875", "876", "879"],
    ["890", "891", "892", "893", "894", "895", "896", "897", "901", "902"],
    ["903", "904", "905", "906", "907", "908", "910", "912", "913", "914"],
    ["915", "916", "917", "918", "920", "921", "923", "924", "925", "926"],
    ["927", "928", "930", "931", "932", "934", "935", "936", "937", "938"],
    ["940", "941", "942", "943", "945", "946", "947", "948", "950", "951"],
    ["952", "953", "954", "956", "957", "958", "960", "961", "962", "963"],
    ["964", "965", "967", "968", "970", "971", "972", "973", "974", "975"],
    ["976", "978", "980", "981", "982", "983", "984", "985", "986", "987"],
  ];
  const columns = Array.from({ length: 10 }, (_, i) => i); // 0–9 columns

  const columnData = columns.reduce((acc, col) => {
    acc[col] = [];
    return acc;
  }, {});

  numberData.forEach((item) => {
    const numStr = item._id.toString();
    const played = item.totalPlayed;

    // Check if numStr has length 3 and all digits are unique
    if (
      numStr.length === 3 &&
      new Set(numStr).size === 3 && // ensures unique digits
      played > 100
    ) {
      const digitSum = numStr
        .split("")
        .map(Number)
        .reduce((a, b) => a + b, 0);
      const columnKey = digitSum % 10;

      if (!columnData[columnKey]) columnData[columnKey] = [];
      columnData[columnKey].push({ number: numStr, played });
    }
  });

  return (
    <div className="w-full p-8 bg-gradient-to-b from-black to-red-950 min-h-screen font-sans text-gray-100 select-none overflow-x-hidden">
      <h1 className="text-center text-6xl font-extrabold mb-16 uppercase tracking-widest text-red-500 drop-shadow-lg animate-pulse-light">
        🎰 Thai Lottery Agent 🎲
      </h1>
      <div className="mb-16 bg-gray-950 rounded-xl shadow-2xl border-2 border-yellow-600 overflow-x-auto">
        <h3 className="text-3xl font-bold text-yellow-400 mb-4 text-center uppercase tracking-wider bg-black py-4 rounded-lg shadow-inner">
          🎯 Hot Numbers by Last Digit of Sum
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
                  {columnData[col].map(({ number, played }, idx) => (
                    <div
                      key={idx}
                      className="text-green-400 font-bold text-2xl mb-1 px-1"
                    >
                      <span className="text-white">{number}</span> = {played}
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
      />

      {/* Tailwind CSS custom animations and colors (add to your global CSS or tailwind.config.js) */}
    </div>
  );
}
