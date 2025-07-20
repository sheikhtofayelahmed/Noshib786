"use client";

import WinHistory from "@/components/winHistory";
import { useEffect, useState } from "react";

export default function Noshib786() {
  const [threeUp, setThreeUp] = useState(null);
  const [downGame, setDownGame] = useState(null);
  const [date, setDate] = useState(null);
  const [winStatus, setWinStatus] = useState(false);

  const [targetTime, setTargetTime] = useState(null);
  const [upcomingEndTime, setUpcomingEndTime] = useState(null);
  const [isUpcomingPhase, setIsUpcomingPhase] = useState(false);
  const [showBlinkingZero, setShowBlinkingZero] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ text: "", isWarning: false });
  const [error, setError] = useState("");

  // ✅ Fetch game status from API
  useEffect(() => {
    const fetchGameStatus = async () => {
      try {
        const res = await fetch("/api/game-status");
        const data = await res.json();
        if (data.targetDateTime) setTargetTime(new Date(data.targetDateTime));
        if (data.upcomingEndTime)
          setUpcomingEndTime(new Date(data.upcomingEndTime));
      } catch (err) {
        setError("Failed to fetch game status.");
      }
    };

    fetchGameStatus();
  }, []);

  // ⏳ Countdown handler
  useEffect(() => {
    if (!targetTime && !upcomingEndTime) return;

    const interval = setInterval(() => {
      const now = new Date();

      if (targetTime && now < targetTime) {
        // Phase 1: Main game countdown
        const diff = targetTime - now;
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        const isWarning = diff <= 10 * 60 * 1000;

        // setTimeLeft({
        //   text: `বর্তমান গেম এর সময় বাকি আছে : ${hrs}h ${mins}m ${secs}s`,
        //   isWarning,
        //   color: "remain",
        // });
      } else if (upcomingEndTime && now < upcomingEndTime) {
        // Phase 2: Upcoming win countdown
        setIsUpcomingPhase(true);
        const diff = upcomingEndTime - now;
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({
          text: `পরবর্তী উইন: ${mins}m ${secs}s`,
          isWarning: true,
          color: "upcoming",
        });
      } else if (upcomingEndTime && now >= upcomingEndTime) {
        // Phase 3: Blinking finale
        clearInterval(interval);
        setShowBlinkingZero(true);
        setTimeLeft({ text: "00m 00s", isWarning: true });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime, upcomingEndTime]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/win-status");
        const data = await res.json();
        setThreeUp(data.threeUp);
        setDownGame(data.downGame);
        setDate(data.gameDate);
        setWinStatus(data.winStatus);
      } catch (error) {
        console.error("Error fetching winning numbers:", error);
      }
    };

    fetchData();
  }, []);
  const threeDigitRows = [
    ["128", "129", "120", "130", "140", "123", "124", "125", "126", "127"],
    // ["182", "291", "201", "103", "401", "321", "412", "251", "621", "271"],
    // ["218", "912", "102", "301", "410", "132", "214", "215", "216", "721"],
    // ["281", "921", "210", "310", "104", "213", "241", "152", "261", "172"],
    // ["821", "219", "012", "013", "041", "312", "421", "521", "162", "217"],
    // ["812", "192", "021", "031", "014", "231", "142", "512", "612", "712"],
    ["137", "138", "139", "149", "159", "150", "160", "134", "135", "136"],
    // ["731", "813", "193", "941", "951", "051", "601", "413", "153", "631"],
    // ["317", "381", "319", "419", "195", "510", "016", "341", "315", "163"],
    // ["173", "831", "391", "914", "915", "105", "061", "314", "351", "316"],
    // ["713", "318", "913", "491", "591", "501", "106", "143", "513", "361"],
    // ["371", "183", "931", "194", "519", "015", "610", "431", "531", "613"],
    ["146", "147", "148", "158", "168", "169", "179", "170", "180", "145"],
    // ["461", "741", "814", "851", "861", "691", "197", "701", "810", "541"],
    // ["164", "417", "841", "185", "618", "619", "791", "107", "081", "154"],
    // ["641", "471", "481", "815", "681", "196", "719", "017", "801", "415"],
    // ["614", "714", "184", "581", "186", "916", "917", "071", "018", "514"],
    // ["416", "174", "418", "518", "816", "961", "971", "710", "108", "451"],
    ["236", "156", "157", "167", "230", "178", "250", "189", "234", "190"],
    // ["362", "516", "571", "716", "320", "817", "520", "981", "432", "910"],
    // ["623", "165", "715", "176", "203", "871", "205", "198", "243", "901"],
    // ["326", "651", "517", "671", "302", "718", "052", "918", "342", "109"],
    // ["263", "561", "751", "617", "023", "187", "025", "891", "324", "019"],
    // ["632", "615", "175", "761", "032", "781", "502", "819", "423", "091"],
    ["245", "237", "238", "239", "249", "240", "269", "260", "270", "235"],
    // ["452", "372", "832", "392", "942", "420", "962", "602", "702", "532"],
    // ["425", "723", "283", "329", "294", "204", "629", "062", "027", "253"],
    // ["254", "732", "382", "923", "429", "042", "296", "026", "720", "523"],
    // ["542", "273", "328", "932", "924", "024", "926", "206", "072", "325"],
    // ["524", "327", "823", "293", "492", "402", "692", "620", "207", "352"],
    ["290", "246", "247", "248", "258", "259", "278", "279", "289", "280"],
    // ["209", "462", "472", "482", "582", "592", "872", "972", "892", "820"],
    // ["029", "624", "742", "284", "825", "952", "728", "729", "298", "208"],
    // ["092", "264", "427", "824", "528", "295", "287", "297", "829", "028"],
    // ["920", "426", "724", "428", "852", "529", "827", "927", "982", "082"],
    // ["902", "642", "274", "842", "285", "925", "782", "792", "928", "802"],
    ["380", "345", "256", "257", "267", "268", "340", "350", "360", "370"],
    // ["308", "453", "652", "752", "762", "628", "403", "530", "630", "703"],
    // ["038", "534", "562", "527", "627", "826", "304", "503", "306", "073"],
    // ["083", "354", "625", "572", "672", "862", "043", "305", "063", "730"],
    // ["830", "435", "526", "725", "726", "286", "034", "053", "036", "307"],
    // ["803", "543", "265", "275", "276", "682", "430", "035", "603", "037"],
    ["470", "390", "346", "347", "348", "349", "359", "369", "379", "389"],
    // ["407", "309", "436", "743", "843", "439", "953", "396", "937", "983"],
    // ["074", "039", "634", "473", "384", "493", "395", "639", "973", "398"],
    // ["047", "093", "463", "374", "438", "934", "935", "963", "793", "839"],
    // ["704", "930", "364", "437", "834", "943", "539", "936", "397", "893"],
    // ["740", "903", "643", "734", "483", "394", "593", "693", "739", "938"],
    ["489", "480", "490", "356", "357", "358", "368", "378", "450", "460"],
    // ["498", "408", "904", "536", "735", "853", "836", "873", "504", "640"],
    // ["849", "840", "409", "365", "375", "583", "863", "738", "054", "406"],
    // ["894", "804", "049", "653", "537", "385", "638", "837", "540", "046"],
    // ["948", "084", "094", "635", "753", "835", "386", "387", "045", "604"],
    // ["984", "048", "940", "563", "573", "538", "683", "783", "405", "064"],
    ["560", "570", "580", "590", "456", "367", "458", "459", "469", "479"],
    // ["605", "507", "850", "059", "654", "736", "584", "954", "946", "497"],
    // ["065", "075", "085", "509", "645", "637", "845", "495", "694", "947"],
    // ["506", "057", "508", "950", "546", "763", "854", "549", "964", "749"],
    // ["650", "705", "805", "095", "564", "673", "548", "594", "496", "794"],
    // ["056", "750", "058", "905", "465", "376", "485", "945", "649", "974"],
    ["579", "589", "670", "680", "690", "457", "467", "468", "478", "569"],
    // ["795", "598", "706", "806", "960", "745", "647", "684", "874", "956"],
    // ["597", "859", "607", "068", "096", "475", "476", "846", "847", "695"],
    // ["975", "895", "760", "860", "069", "547", "674", "864", "748", "596"],
    // ["957", "958", "076", "086", "609", "754", "746", "648", "784", "659"],
    // ["759", "985", "067", "608", "906", "574", "764", "486", "487", "965"],
    ["678", "679", "689", "789", "780", "790", "890", "567", "568", "578"],
    // ["687", "697", "896", "879", "870", "970", "980", "675", "685", "857"],
    // ["768", "769", "869", "987", "708", "709", "809", "765", "658", "875"],
    // ["786", "796", "986", "798", "087", "079", "908", "576", "586", "758"],
    // ["867", "967", "968", "978", "078", "097", "089", "756", "856", "587"],
    // ["876", "976", "698", "897", "807", "907", "098", "657", "865", "785"],
  ];
  const doubleRows = [
    ["100", "110", "166", "112", "113", "114", "115", "116", "117", "118"],
    // ["010", "101", "616", "121", "131", "141", "151", "161", "171", "181"],
    // ["001", "011", "661", "211", "311", "411", "511", "611", "711", "811"],
    ["119", "200", "229", "220", "122", "277", "133", "224", "144", "226"],
    // ["191", "020", "292", "202", "212", "727", "313", "242", "414", "262"],
    // ["911", "002", "922", "022", "221", "772", "331", "422", "441", "622"],
    ["155", "228", "300", "266", "177", "330", "188", "233", "199", "244"],
    // ["515", "282", "030", "626", "717", "303", "818", "323", "919", "424"],
    // ["551", "822", "003", "662", "771", "033", "881", "332", "991", "442"],
    ["227", "255", "337", "338", "339", "448", "223", "288", "225", "299"],
    // ["272", "525", "373", "383", "393", "484", "232", "828", "252", "929"],
    // ["722", "552", "733", "833", "933", "844", "322", "882", "522", "992"],
    ["335", "336", "355", "400", "366", "466", "377", "440", "388", "334"],
    // ["353", "363", "535", "040", "636", "646", "737", "404", "838", "343"],
    // ["533", "633", "553", "004", "663", "664", "773", "044", "883", "433"],
    ["344", "499", "445", "446", "447", "556", "449", "477", "559", "488"],
    // ["434", "949", "454", "464", "474", "565", "494", "747", "595", "848"],
    // ["443", "994", "544", "644", "744", "655", "944", "774", "955", "884"],
    ["399", "660", "599", "455", "500", "600", "557", "558", "577", "550"],
    // ["939", "606", "959", "545", "050", "060", "575", "585", "757", "505"],
    // ["993", "066", "995", "554", "005", "006", "755", "855", "775", "055"],
    ["588", "688", "779", "699", "799", "880", "566", "800", "667", "668"],
    // ["858", "868", "797", "969", "979", "808", "656", "080", "676", "686"],
    // ["885", "886", "977", "996", "997", "088", "665", "008", "766", "866"],
    ["669", "778", "788", "770", "889", "899", "700", "990", "900", "677"],
    // ["696", "787", "878", "707", "898", "989", "070", "909", "090", "767"],
    // ["966", "877", "887", "077", "988", "998", "007", "099", "009", "776"],
    ["777", "444", "111", "888", "555", "222", "999", "666", "333", "000"],
  ];
  const downRows = [
    ["10", "20", "30", "40", "50", "60", "70", "80", "90", "00"],
    // ["01", "02", "03", "04", "05", "06", "07", "08", "09", "XX"],
    ["29", "11", "12", "13", "14", "15", "16", "17", "18", "19"],
    // ["92", "XX", "21", "31", "41", "51", "61", "71", "81", "91"],
    ["38", "39", "49", "22", "23", "24", "25", "26", "27", "28"],
    // ["83", "93", "94", "XX", "32", "42", "52", "62", "72", "82"],
    ["47", "48", "58", "59", "69", "33", "34", "35", "36", "37"],
    // ["74", "84", "85", "95", "96", "XX", "43", "53", "63", "73"],
    ["56", "57", "67", "68", "78", "79", "89", "44", "45", "46"],
    // ["65", "75", "76", "86", "87", "97", "98", "XX", "54", "64"],
    ["XX", "66", "XX", "77", "XX", "88", "XX", "99", "XX", "55"],
  ];

  return (
    <div className="">
      <div className="my-8 mx-5 md:mx-auto max-w-4xl  bg-gradient-to-br from-black via-gray-900 to-red-600 rounded-2xl shadow-lg ring-1 ring-cyan-700 p-6 text-center text-white">
        <h2 className="font-bangla text-4xl font-bold text-cyan-400 mb-6 tracking-wider uppercase">
          🏆 সর্বশেষ বিজয়ী নাম্বার
        </h2>
        <div className="mt-10 text-center">
          {error && (
            <div className="text-red-500 font-extrabold drop-shadow-md">
              {error}
            </div>
          )}
          <div class="my-5 py-5 font-bangla px-4 bg-gradient-to-br from-yellow-100 to-pink-100 border-4 border-yellow-400 rounded-lg shadow-lg text-center space-y-4">
            <span class="block text-4xl font-extrabold glow text-fuchsia-600">
              ✨ নসীব ৭৮৬ ✨
            </span>

            <p class="text-2xl font-semibold text-red-700 shake">
              ড্র প্রতি রবিবার
            </p>
            <p class=" decoration-wavy text-purple-600 font-bold text-4xl">
              উইন নাম্বার জানানো হবে রাত ১০ টা ৩০ মিনিটে
            </p>

            <div class="bg-gradient-to-r from-purple-300 via-yellow-100 to-pink-300 p-4 rounded-lg border border-red-400 shadow-md">
              <p class="text-xl font-medium text-gray-900 mt-2">
                নসীব পরিবর্তন করতে
                <span class="px-2 font-bold text-pink-800 pulse">আজই</span>
                চলে আসুন নিকটস্ত এজেন্ট এর কাছে।
              </p>
            </div>
          </div>
          {!showBlinkingZero && (
            <div
              className={`font-bangla mb-10 px-6 py-4 rounded-2xl  text-4xl tracking-widest transition duration-500 bg-gradient-to-r from-purple-800 via-pink-600 to-blue-500 text-yellow-200 shadow-md shadow-pink-400/30`}
            >
              {timeLeft.text}
            </div>
          )}

          {showBlinkingZero && !winStatus && (
            <div className="text-6xl font-extrabold font-mono text-red-500 animate-blink my-12 drop-shadow-lg">
              00:00:00
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-around items-center gap-8 text-center">
          {/* 3UP Game */}
          <div className="bg-gradient-to-br from-sky-100 to-blue-200 text-gray-900 rounded-2xl px-6 py-5 shadow-lg w-64 hover:shadow-blue-300 transition duration-300 border border-blue-200 glow-animation">
            <div className="text-lg font-semibold mb-2">
              🎯
              <span className="font-bangla block text-4xl font-extrabold glow text-blue-700 tracking-wide">
                নসীব 3UP
              </span>
            </div>
            <p className="text-5xl font-black tracking-wider text-blue-900 drop-shadow-sm">
              {typeof winStatus === "boolean" && winStatus
                ? threeUp || "XXX"
                : "XXX"}
            </p>
          </div>

          {/* Date */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-blue-400 text-3xl animate-pulse drop-shadow">
              🗓️
            </span>
            <span className="font-bangla text-xl text-gray-700">
              <span className="font-bangla block text-5xl font-extrabold glow text-white tracking-wide">
                নসীব তারিখ
              </span>
            </span>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 text-transparent bg-clip-text tracking-wide">
              {typeof winStatus === "boolean" && winStatus
                ? date || "---"
                : "---"}
            </span>
          </div>

          {/* DOWN Game */}
          <div className="bg-gradient-to-br from-indigo-100 to-purple-200 text-gray-900 rounded-2xl px-6 py-5 shadow-lg w-64 hover:shadow-indigo-300 transition duration-300 border border-indigo-200 glow-animation">
            <h3 className="text-lg font-semibold mb-2">
              💥
              <span className="font-bangla block text-4xl font-extrabold glow text-indigo-700 tracking-wide">
                নসীব DOWN
              </span>
            </h3>
            <p className="text-5xl font-black tracking-wider text-indigo-900 drop-shadow-sm">
              {typeof winStatus === "boolean" && winStatus
                ? downGame || "XX"
                : "XX"}
            </p>
          </div>
        </div>
      </div>
      <div className="mx-10 flex flex-col sm:flex-row justify-center gap-6 my-20">
        {/* Tips Button */}
        <button className="font-bangla bg-gradient-to-r from-purple-800 via-pink-600 to-red-500 text-white font-bold px-10 py-6 rounded-full shadow-lg hover:shadow-pink-500/50 hover:scale-105 transition-all duration-300 tracking-widest text-2xl uppercase glow-animation">
          🔮 নসীব টিপস
        </button>

        {/* Win History Button */}
        <button
          onClick={() => (window.location.href = "/history/winHistory")}
          className=" font-bangla bg-gradient-to-r from-black via-gray-800 to-purple-900 text-yellow-300 font-bold px-10 py-6 rounded-full shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all duration-300 tracking-widest text-2xl uppercase glow-animation"
        >
          🧿 নসীব উইন
        </button>
      </div>

      <WinHistory title="3 Digit Unique" rows={threeDigitRows}></WinHistory>
      <WinHistory
        title="Double (3 Digit - 2 Aligned)"
        rows={doubleRows}
      ></WinHistory>
      <WinHistory title="Down (2 Digit)" rows={downRows}></WinHistory>
    </div>
  );
}
