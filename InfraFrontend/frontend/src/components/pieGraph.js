"use client";
import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import axios from "axios";

const PieChart = () => {
  const [logData, setLogData] = useState([]);
  const [chartData, setChartData] = useState({ datasets: [] });

//   Function to fetch logs
  const fetchLogs = async () => {
    try {
      const response = await axios.get('/api/logs'); // Replace with your API endpoint
      setLogData(response.data); // Assuming response.data is an array of logs
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  // Function to process logs and update chart data
  const processLogData = () => {
    const fieldCounts = {};

    logData.forEach(log => {
      if (log.field) {
        fieldCounts[log.field] = (fieldCounts[log.field] || 0) + 1;
      }
    });

    const labels = Object.keys(fieldCounts);
    const dataValues = Object.values(fieldCounts);

    setChartData({
      labels: labels,
      datasets: [
        {
          data: dataValues,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
          ],
        },
      ],
    });
  };

  // Effect to fetch logs and process data
  useEffect(() => {
    fetchLogs(); // Initial fetch
    const intervalId = setInterval(() => {
      fetchLogs(); // Polling every 5 seconds
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Update chart data when log data changes
  useEffect(() => {
    if (logData.length > 0) {
      processLogData();
    }
  }, [logData]);

  return (
    <div>
      <h2>Log Field Distribution</h2>
      <Pie data={chartData} />
    </div>
  );
};

export default PieChart;
