"use client";

import Loading from "@/components/Loading";
import NumberTable from "@/components/NumberTable";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { useEffect, useState } from "react";

export default function HappyNewYear() {
  const [error, setError] = useState(null);
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
    ["182", "291", "201", "103", "401", "321", "412", "251", "621", "271"],
    ["218", "912", "102", "301", "410", "132", "214", "215", "216", "721"],
    ["281", "921", "210", "310", "104", "213", "241", "152", "261", "172"],
    ["821", "219", "012", "013", "041", "312", "421", "521", "162", "217"],
    ["812", "192", "021", "031", "014", "231", "142", "512", "612", "712"],
    ["137", "138", "139", "149", "159", "150", "160", "134", "135", "136"],
    ["731", "813", "193", "941", "951", "051", "601", "413", "153", "631"],
    ["317", "381", "319", "419", "195", "510", "016", "341", "315", "163"],
    ["173", "831", "391", "914", "915", "105", "061", "314", "351", "316"],
    ["713", "318", "913", "491", "591", "501", "106", "143", "513", "361"],
    ["371", "183", "931", "194", "519", "015", "610", "431", "531", "613"],
    ["146", "147", "148", "158", "168", "169", "179", "170", "180", "145"],
    ["461", "741", "814", "851", "861", "691", "197", "701", "810", "541"],
    ["164", "417", "841", "185", "618", "619", "791", "107", "081", "154"],
    ["641", "471", "481", "815", "681", "196", "719", "017", "801", "415"],
    ["614", "714", "184", "581", "186", "916", "917", "071", "018", "514"],
    ["416", "174", "418", "518", "816", "961", "971", "710", "108", "451"],
    ["236", "156", "157", "167", "230", "178", "250", "189", "234", "190"],
    ["362", "516", "571", "716", "320", "817", "520", "981", "432", "910"],
    ["623", "165", "715", "176", "203", "871", "205", "198", "243", "901"],
    ["326", "651", "517", "671", "302", "718", "052", "918", "342", "109"],
    ["263", "561", "751", "617", "023", "187", "025", "891", "324", "019"],
    ["632", "615", "175", "761", "032", "781", "502", "819", "423", "091"],
    ["245", "237", "238", "239", "249", "240", "269", "260", "270", "235"],
    ["452", "372", "832", "392", "942", "420", "962", "602", "702", "532"],
    ["425", "723", "283", "329", "294", "204", "629", "062", "027", "253"],
    ["254", "732", "382", "923", "429", "042", "296", "026", "720", "523"],
    ["542", "273", "328", "932", "924", "024", "926", "206", "072", "325"],
    ["524", "327", "823", "293", "492", "402", "692", "620", "207", "352"],
    ["290", "246", "247", "248", "258", "259", "278", "279", "289", "280"],
    ["209", "462", "472", "482", "582", "592", "872", "972", "892", "820"],
    ["029", "624", "742", "284", "825", "952", "728", "729", "298", "208"],
    ["092", "264", "427", "824", "528", "295", "287", "297", "829", "028"],
    ["920", "426", "724", "428", "852", "529", "827", "927", "982", "082"],
    ["902", "642", "274", "842", "285", "925", "782", "792", "928", "802"],
    ["380", "345", "256", "257", "267", "268", "340", "350", "360", "370"],
    ["308", "453", "652", "752", "762", "628", "403", "530", "630", "703"],
    ["038", "534", "562", "527", "627", "826", "304", "503", "306", "073"],
    ["083", "354", "625", "572", "672", "862", "043", "305", "063", "730"],
    ["830", "435", "526", "725", "726", "286", "034", "053", "036", "307"],
    ["803", "543", "265", "275", "276", "682", "430", "035", "603", "037"],
    ["470", "390", "346", "347", "348", "349", "359", "369", "379", "389"],
    ["407", "309", "436", "743", "843", "439", "953", "396", "937", "983"],
    ["074", "039", "634", "473", "384", "493", "395", "639", "973", "398"],
    ["047", "093", "463", "374", "438", "934", "935", "963", "793", "839"],
    ["704", "930", "364", "437", "834", "943", "539", "936", "397", "893"],
    ["740", "903", "643", "734", "483", "394", "593", "693", "739", "938"],
    ["489", "480", "490", "356", "357", "358", "368", "378", "450", "460"],
    ["498", "408", "904", "536", "735", "853", "836", "873", "504", "640"],
    ["849", "840", "409", "365", "375", "583", "863", "738", "054", "406"],
    ["894", "804", "049", "653", "537", "385", "638", "837", "540", "046"],
    ["948", "084", "094", "635", "753", "835", "386", "387", "045", "604"],
    ["984", "048", "940", "563", "573", "538", "683", "783", "405", "064"],
    ["560", "570", "580", "590", "456", "367", "458", "459", "469", "479"],
    ["605", "507", "850", "059", "654", "736", "584", "954", "946", "497"],
    ["065", "075", "085", "509", "645", "637", "845", "495", "694", "947"],
    ["506", "057", "508", "950", "546", "763", "854", "549", "964", "749"],
    ["650", "705", "805", "095", "564", "673", "548", "594", "496", "794"],
    ["056", "750", "058", "905", "465", "376", "485", "945", "649", "974"],
    ["579", "589", "670", "680", "690", "457", "467", "468", "478", "569"],
    ["795", "598", "706", "806", "960", "745", "647", "684", "874", "956"],
    ["597", "859", "607", "068", "096", "475", "476", "846", "847", "695"],
    ["975", "895", "760", "860", "069", "547", "674", "864", "748", "596"],
    ["957", "958", "076", "086", "609", "754", "746", "648", "784", "659"],
    ["759", "985", "067", "608", "906", "574", "764", "486", "487", "965"],
    ["678", "679", "689", "789", "780", "790", "890", "567", "568", "578"],
    ["687", "697", "896", "879", "870", "970", "980", "675", "685", "857"],
    ["768", "769", "869", "987", "708", "709", "809", "765", "658", "875"],
    ["786", "796", "986", "798", "087", "079", "908", "576", "586", "758"],
    ["867", "967", "968", "978", "078", "097", "089", "756", "856", "587"],
    ["876", "976", "698", "897", "807", "907", "098", "657", "865", "785"],
  ];
  const columns = [...Array(9).keys()].map((i) => i + 1).concat(0);
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
  // Utility to get all 6 permutations of a unique 3-digit number
  const getPermutations = (number) => {
    const digits = number.split("");
    const perms = new Set();

    const permute = (arr, m = "") => {
      if (arr.length === 0) perms.add(m);
      else {
        for (let i = 0; i < arr.length; i++) {
          let copy = arr.slice();
          let next = copy.splice(i, 1);
          permute(copy, m + next);
        }
      }
    };

    permute(digits);
    return Array.from(perms);
  };
  const getTotalRumble = (numStr) => {
    const permutations = getPermutations(numStr);
    return permutations.reduce((total, perm) => {
      const found = numberData.find((n) => n._id === perm);
      return total + (found?.totalRumble || 0);
    }, 0);
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin-slow text-6xl text-yellow-300">🎲</div>
      </div>
    );
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
        <table className="w-full text-center font-mono text-sm md:text-base text-white border-collapse">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="p-4 bg-red-900 border border-gray-700 text-4xl"
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
                      className={`flex flex-col items-center justify-center space-y-1 mb-2 p-2 rounded-lg transition-all duration-300 ease-in-out ${
                        idx % 2 !== 0
                          ? "bg-gradient-to-br from-indigo-600 to-sky-700 text-white shadow-xl transform scale-105"
                          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                      }`}
                    >
                      <div className=" font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md min-w-[1.5rem] text-center">
                        {getTotalRumble(number)}
                      </div>
                      <span className="text-3xl font-extrabold uppercase">
                        {number}
                      </span>
                      <div className="flex justify-center space-x-2">
                        <div className="text-sm font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md min-w-[1.5rem] text-center">
                          {str}
                        </div>
                        <div className="text-sm font-bold text-black bg-white px-2 py-0.5 rounded-full shadow-md min-w-[1.5rem] text-center">
                          {rumble}
                        </div>
                      </div>
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
      <ScrollToTopButton />
    </div>
  );
}
