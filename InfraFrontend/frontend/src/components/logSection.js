"use client";
import React, { useEffect, useState } from "react";
import Log from "./Log"; // Component to display individual log details
import axios from "axios";

export default function LogSection() {
  const [logs, setLogs] = useState([]); // Real-time logs
  const [errorRange, setErrorRange] = useState({ min: 100, max: 500 });
  const [timeFilter, setTimeFilter] = useState(0); // Time filter state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function getTimeInISOFormat(date) {
    return date.toISOString().split(".")[0] + "Z"; // Remove milliseconds
  }

  // Fetch logs from the API
  const fetchLogs = async (startTime, stopTime) => {
    setLoading(true);
    try {
      const query = `from(bucket:%20%22SegFault%22)%20%7C%3E%20range(start:%20${startTime},%20stop:%20${stopTime})`;

      const response = await axios.get(`http://127.0.0.1:57091/api/influxdb/query?query=${query}`);
      // const response = await axios.get("http://127.0.0.1:57091/api/influxdb/query?query=from(bucket:%20%22SegFault%22)%20%7C%3E%20range(start:%202024-09-01T00:00:00Z,%20stop:%202024-09-30T23:59:59Z)");
      console.log(response.data.length);
      setLogs(response.data); // Directly set fetched logs
      setError(null);
    } catch (err) {
      setError("Error fetching logs");
      console.error("Error fetching logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter logs by error range
  const filterLogsByRange = (logs, range) => {
    return logs.filter(log => {
      const statusCode = parseInt(log._seq, 10); // Assuming _seq represents status code for filtering
      return statusCode >= range.min && statusCode <= range.max;
    });
  };

  // Handle time filter selection
  const handleTimeFilter = (filter) => {
    setTimeFilter(filter);
    // Calculate start and stop times based on filter
    const now = new Date();
    const stopTime = getTimeInISOFormat(now);
    var startTime = getTimeInISOFormat(new Date(now.getTime() - filter * 1000));

    if (filter==0){
      startTime = getTimeInISOFormat(new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000));
    }
    // const now = new Date();
    // const stopTime = now.toISOString();
    // const startTime = new Date(now.getTime() - filter * 1000).toISOString(); // Subtracting filter in seconds
    fetchLogs(startTime, stopTime); // Fetch logs based on the selected time filter
  };

  // useEffect(() => {
  //   console.log("Updated logs:", logs); // Check the updated logs here
  // }, [logs]);
  

  // Effect for fetching logs on mount and interval
  useEffect(() => {
    const fetchInitialLogs = async () => {
      const now = new Date();
      const stopTime = getTimeInISOFormat(now);
      var startTime = getTimeInISOFormat(new Date(now.getTime() - 50 * 1000));
      if (timeFilter==0){
        startTime = getTimeInISOFormat(new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000));
      }
      // const now = new Date();
      // const stopTime = now.toISOString();
      // const startTime = new Date(now.getTime() - timeFilter * 1000).toISOString(); // Initial fetch based on time filter
      console.log(startTime,stopTime);
      await fetchLogs(startTime, stopTime);
    };

    fetchInitialLogs(); // Fetch logs on mount
    const intervalId = setInterval(() => handleTimeFilter(timeFilter), 500000); // Poll for new logs every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [timeFilter]); // Re-fetch if timeFilter changes

  // Filter logs by error range
  const filteredLogs = filterLogsByRange(logs, errorRange);

  return (
    <div className="log-section flex flex-col m-5 p-5 shadow-xl my-10 bg-[#16141A] border-2 border-white rounded-lg">
      <h1 className="text-white flex justify-center mb-10">
        Log<span className="text-[#915EFF]">Section</span>
      </h1>

      {/* Time Filter Dropdown */}
      <div className="flex justify-center mb-4">
        <select
          className="p-2 m-2 border-2 rounded"
          value={timeFilter}
          onChange={(e) => handleTimeFilter(Number(e.target.value))}
        >
          <option value={0}>RealTime</option>
          <option value={5 * 60}>Last 5 Minutes</option>
          <option value={10 * 60}>Last 10 Minutes</option>
          <option value={30 * 60}>Last 30 Minutes</option>
          <option value={60 * 60}>Last 1 Hour</option>
        </select>
      </div>

      {/* Log Display */}
      <div className="overflow-y-auto h-[250px] shadow-md bg-[#16141A]">
        {loading ? (
          <p className="text-center text-gray-500">Loading logs...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : logs.length === 0 ? (
          <p className="text-center text-gray-500">No logs available.</p>
        ) : (
          <ul className="p-10 rounded-lg">
            {logs.map((log, index) => (
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
