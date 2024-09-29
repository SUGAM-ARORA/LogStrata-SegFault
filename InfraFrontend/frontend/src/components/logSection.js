// "use client"
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Log from "./log";

// export default function LogSection() {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   // Fetching function

//   // const fetchLogs = async () => {
//   //   setLoading(true); // Set loading state to true
//   //   try {
//   //     const response = await axios.get("http://localhost:3001/api/logs"); // Adjust the URL to your API
//   //     setLogs((prevLogs) => [...prevLogs, ...response.data]); // Set fetched logs
//   //     setError(null); // Reset error state
//   //   } catch (err) {
//   //     setError("Error fetching logs"); // Handle error
//   //     console.error("Error fetching logs:", err);
//   //   } finally {
//   //     setLoading(false); // Set loading state to false
//   //   }
//   // };

//   const generateLogData = () => {
//     const currentTime = new Date();
//     const timestamp = `${currentTime.getMonth() + 1}/${currentTime.getDate()} ${currentTime.getHours()}:${String(currentTime.getMinutes()).padStart(2, '0')}:${String(currentTime.getSeconds()).padStart(2, '0')}`;
//     const statusCode = Math.floor(Math.random() * (501 - 100)) + 100; // Random status code between 100 and 500
//     return [timestamp, Math.floor(currentTime.getTime() / 1000), statusCode];
//   };

//   // // Polling

//   // useEffect(() => {
//   //   fetchLogs(); // Fetch initial logs
//   //   const interval = setInterval(() => {
//   //     fetchLogs(); // Poll for new logs every 5 seconds
//   //   }, 5000);

//   //   // Cleanup the interval on component unmount
//   //   return () => clearInterval(interval);
//   // }, []);
//   const logData = [];
//   const currentTime = new Date();

  
//   // Generate log data (120 entries representing the last 2 hours)
//   for (let i = 0; i < 120; i++) {
//     const time = new Date(currentTime.getTime() - i * 60000); // Subtract i minutes
//     const timestamp = `${time.getMonth() + 1}/${time.getDate()} ${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`;
//     const statusCode = Math.floor(Math.random() * (501 - 100)) + 100; // Random status code between 100 and 500
//     logData.push([timestamp, Math.floor(time.getTime() / 1000), statusCode]);
//   }

//   // Reverse log data so most recent logs come first
//   logData.reverse();

//   // Debugging: Print logData to the console

//   return (
//     <div className="log-section">
//       <h1>Log Section</h1>
//       {logData.length === 0 ? (
//         <p>No logs available.</p>
//       ) : (
//         <ul>
//           {logData.map((log, index) => (
//             <li key={index}>
//               <Log logData={log} /> {/* Log component displays log details */}
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }


"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Log from "./Log";
import { styles } from "./styles";

export default function LogSection() {
  const [logs, setLogs] = useState([]); // Real-time logs
  const [errorRange, setErrorRange] = useState({ min: 100, max: 500 });
  const [timeFilter, setTimeFilter] = useState(0); // Time filter state
  const [fetchedLogs, setFetchedLogs] = useState([]); // State for fetched logs

  // Function to generate new log data
  const generateLogData = () => {
    const currentTime = new Date();
    const timestamp = `${currentTime.getMonth() + 1}/${currentTime.getDate()} ${currentTime.getHours()}:${String(currentTime.getMinutes()).padStart(2, '0')}:${String(currentTime.getSeconds()).padStart(2, '0')}`;
    const statusCode = Math.floor(Math.random() * (501 - 100)) + 100; // Random status code between 100 and 500
    return [timestamp, Math.floor(currentTime.getTime() / 1000), statusCode];
  };

  // Function to filter logs by error range
  const filterLogsByRange = (logs, range) => {
    return logs.filter(log => log[2] >= range.min && log[2] <= range.max);
  };

  // Function to format timestamp in ISO 8601 format
  const formatToISO8601 = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toISOString(); // Converts to ISO 8601 format
  };

  // Function to get logs for the selected time range
  const fetchLogs = async (start, end) => {
    try {
      const response = await axios.get('/api/logs', {
        params: {
          start: formatToISO8601(start),
          end: formatToISO8601(end),
        },
      });
      setFetchedLogs(response.data.logs); // Assuming the backend returns logs as an array
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  // Handle time filter selection
  const handleTimeFilter = (filter) => {
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds since epoch
    let timeLimitStart = currentTime; // Start time for fetching logs
    let timeLimitEnd = currentTime; // End time for fetching logs

    switch (filter) {
      case 5 * 60: // Last 5 minutes
        timeLimitStart = currentTime - 5 * 60;
        break;
      case 10 * 60: // Last 10 minutes
        timeLimitStart = currentTime - 10 * 60;
        break;
      case 30 * 60: // Last 30 minutes
        timeLimitStart = currentTime - 30 * 60;
        break;
      case 60 * 60: // Last 1 hour
        timeLimitStart = currentTime - 60 * 60;
        break;
      default:
        timeLimitStart = 0; // No time filter, fetch all logs
    }

    setTimeFilter(filter);
    if (timeLimitStart !== 0) {
      fetchLogs(timeLimitStart, timeLimitEnd); // Fetch logs for the selected time range
    }
  };

  // Effect for generating new logs (if no time filter is active)
  useEffect(() => {
    let intervalId;

    if (timeFilter === 0) { // Only generate new logs if no time filter is selected
      intervalId = setInterval(() => {
        const newLog = generateLogData(); // Generate new log data
        setLogs((prevLogs) => {
          const updatedLogs = [...prevLogs, newLog]; // Append new log to the end
          if (updatedLogs.length > 50) {
            updatedLogs.shift(); // Maintain a maximum of 50 log entries
          }
          return updatedLogs;
        });
      }, 500); // Update every half second
    } else {
      // When a time filter is applied, set the logs to the fetched logs
      setLogs(fetchedLogs); 
    }

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [timeFilter, fetchedLogs]); // Include fetchedLogs and timeFilter in the dependency array

  // Filter logs by error range
  const filteredLogs = filterLogsByRange(timeFilter === 0 ? logs : fetchedLogs, errorRange);

  return (
    <div className="log-section flex flex-col m-5 p-5 shadow-xl my-10 bg-[#16141A] border-2 border-white rounded-lg">
      <h1 className={`${styles.heroHeadText} text-white flex justify-center mb-10`}>
        Log<span className="text-[#915EFF]">Section</span>
      </h1>

      {/* Error Range Inputs */}
      <div className="flex justify-center mb-4">
        <input
          type="number"
          placeholder="Min Error Code"
          value={errorRange.min}
          onChange={(e) => setErrorRange({ ...errorRange, min: e.target.value })}
          className="p-2 m-2 border-2 rounded"
        />
        <input
          type="number"
          placeholder="Max Error Code"
          value={errorRange.max}
          onChange={(e) => setErrorRange({ ...errorRange, max: e.target.value })}
          className="p-2 m-2 border-2 rounded"
        />
      </div>

      {/* Time Filter Dropdown */}
      <div className="flex justify-center mb-4">
        <select
          className="p-2 m-2 border-2 rounded"
          value={timeFilter}
          onChange={(e) => handleTimeFilter(Number(e.target.value))}
        >
          <option value={0}>All Time</option>
          <option value={5 * 60}>Last 5 Minutes</option>
          <option value={10 * 60}>Last 10 Minutes</option>
          <option value={30 * 60}>Last 30 Minutes</option>
          <option value={60 * 60}>Last 1 Hour</option>
        </select>
      </div>

      {/* Log Display */}
      <div className="overflow-y-auto h-[250px] shadow-md bg-[#16141A]">
        {filteredLogs.length === 0 ? (
          <p className="text-center text-gray-500">No logs available.</p>
        ) : (
          <ul className="p-10 rounded-lg">
            {filteredLogs.map((log, index) => (
              <li className="text-white" key={index}>
                <Log logData={log} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
