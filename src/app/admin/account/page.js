"use client";
import React, { useEffect, useState } from "react";

export default function Account() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(""); // State for user messages

  useEffect(() => {
    // Function to fetch game summaries from the API
    async function fetchSummaries() {
      try {
        // Construct the full API URL using the appId
        const apiUrl = `/api/get-summaries`;
        const res = await fetch(apiUrl); // Fetch data from the API endpoint
        const data = await res.json(); // Parse the JSON response

        if (data.success) {
          setSummaries(data.summaries); // Update the summaries state with fetched data
          setMessage(""); // Clear any previous messages
        } else {
          console.error("Failed to fetch summaries:", data.message);
          setMessage("Failed to load summaries. Please try again."); // Display error message
        }
      } catch (error) {
        console.error("Error fetching summaries:", error);
        setMessage("An error occurred while fetching data."); // Display generic error message
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    }
    fetchSummaries(); // Call the fetch function when the component mounts
  }, []);
  if (loading) {
    return (
      <div className=" min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-green-400 font-mono text-xl">
        <p>Loading game summaries...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen overflow-x-auto bg-gradient-to-br from-gray-800 to-gray-900 text-green-400 font-mono p-4 sm:p-8 flex flex-col items-center overflow-x-auto">
      {/* Page Title */}
      <h1 className="text-4xl sm:text-5xl font-bold mb-8 text-center text-yellow-300 drop-shadow-lg">
        GAME SUMMARIES
      </h1>

      {/* Message Display */}
      {message && (
        <div className="bg-blue-900 text-blue-300 p-3 rounded-lg mb-6 shadow-md text-center">
          {message}
        </div>
      )}

      {/* Conditional rendering for no data */}
      {!summaries.length && !loading ? (
        <div className="bg-gray-700 p-8 rounded-xl shadow-lg text-center text-red-400 text-lg">
          <p>No game data found. Start playing to see your summaries!</p>
        </div>
      ) : (
        <>
          {/* Table Container - removed overflow-x-auto from here, now it's on the parent div */}
          {/* flex-shrink-0 ensures the div doesn't shrink below its content's intrinsic width */}
          <div className="overflow-x-auto w-full max-w-full rounded-xl shadow-2xl border-2 border-green-500 flex-shrink-0">
            <table
              // Added table-fixed to ensure fixed column widths
              // Increased min-width to 1024px to ensure horizontal scrolling on most mobile and tablet screens.
              className="overflow-x-auto border-collapse text-sm sm:text-base bg-gray-700 text-green-300 table-fixed"
            >
              {/* Table Header */}
              <thead className="bg-gray-900 text-yellow-300 uppercase tracking-wider">
                <tr>
                  {/* Assigned specific widths to each column header */}
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left rounded-tl-lg w-32">
                    Agent ID
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left w-32">
                    Date
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left w-24">
                    Year
                  </th>
                  {/* <th className="p-3 sm:p-4 border-b border-green-600 text-left w-28">
                    3D
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left w-28">
                    2D
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left w-28">
                    1D
                  </th> */}
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left w-28">
                    STR
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left w-32">
                    RUMBLE
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left w-28">
                    DOWN
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left w-32">
                    SINGLE
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left w-32">
                    Total Game
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left w-32">
                    Total Win
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left rounded-tr-lg w-24">
                    W/L
                  </th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {summaries.map(
                  (
                    {
                      agentId,
                      date,
                      year,
                      afterThreeD,
                      afterTwoD,
                      afterOneD,
                      afterSTR,
                      afterRUMBLE,
                      afterDOWN,
                      afterSINGLE,
                      totalGame,
                      totalWin,
                      WL,
                    },
                    i
                  ) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-600 transition-colors duration-200 ease-in-out"
                    >
                      {/* Added whitespace-nowrap to prevent text wrapping in cells */}
                      <td className="p-3 sm:p-4 border-b border-gray-600 whitespace-nowrap">
                        {agentId ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600 whitespace-nowrap">
                        {date && date !== "---"
                          ? new Date(date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600 whitespace-nowrap">
                        {year ?? "-"}
                      </td>
                      {/* <td className="p-3 sm:p-4 border-b border-gray-600 whitespace-nowrap">
                        {afterThreeD ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600 whitespace-nowrap">
                        {afterTwoD ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600 whitespace-nowrap">
                        {afterOneD ?? "-"}
                      </td> */}
                      <td className="p-3 sm:p-4 border-b border-gray-600 whitespace-nowrap">
                        {afterSTR ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600 whitespace-nowrap">
                        {afterRUMBLE ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600 whitespace-nowrap">
                        {afterDOWN ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600 whitespace-nowrap">
                        {afterSINGLE ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600 whitespace-nowrap">
                        {totalGame ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600 whitespace-nowrap">
                        {totalWin ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600 whitespace-nowrap">
                        {WL ?? "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
