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
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 text-green-400 font-mono p-4 sm:p-8 flex flex-col items-center">
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
          {/* Table Container for Horizontal Scrolling on Small Screens */}
          {/* flex-shrink-0 ensures the div doesn't shrink below its content's intrinsic width */}
          <div className="w-full max-w-full overflow-x-auto rounded-xl shadow-2xl border-2 border-green-500 flex-shrink-0">
            <table
              // Increased min-width to 1024px to ensure horizontal scrolling on most mobile and tablet screens.
              className="min-w-full min-w-[1024px] border-collapse text-sm sm:text-base bg-gray-700 text-green-300"
            >
              {/* Table Header */}
              <thead className="bg-gray-900 text-yellow-300 uppercase tracking-wider">
                <tr>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left rounded-tl-lg">
                    Agent ID
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left">
                    Date
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left">
                    Year
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left">
                    After 3D
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left">
                    After 2D
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left">
                    After 1D
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left">
                    After STR
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left">
                    After RUMBLE
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left">
                    After DOWN
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left">
                    After SINGLE
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left">
                    Total Game
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left">
                    Total Win
                  </th>
                  <th className="p-3 sm:p-4 border-b border-green-600 text-left rounded-tr-lg">
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
                      <td className="p-3 sm:p-4 border-b border-gray-600">
                        {agentId ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600">
                        {date && date !== "---"
                          ? new Date(date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600">
                        {year ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600">
                        {afterThreeD ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600">
                        {afterTwoD ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600">
                        {afterOneD ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600">
                        {afterSTR ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600">
                        {afterRUMBLE ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600">
                        {afterDOWN ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600">
                        {afterSINGLE ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600">
                        {totalGame ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600">
                        {totalWin ?? "-"}
                      </td>
                      <td className="p-3 sm:p-4 border-b border-gray-600">
                        {WL ?? "-"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Delete Button */}
        </>
      )}
    </div>
  );
}
