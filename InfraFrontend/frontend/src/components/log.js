import React from 'react';

export default function Log({ logData }) {
  // Check if logData is present
  if (!logData) {
    return <div>No log data available.</div>;
  }

  // Destructure the logData object
  const { time, value, field, measurement, _seq } = logData;

  // Convert the ISO timestamp to a human-readable format
  const logTime = new Date(time).toLocaleString(); // Format the time for display

  return (
    <div className="flex justify-between bg-[#16141A] border-b border-gray-200 py-2 px-4">
      <span className="w-1/4"><strong>Timestamp:</strong> {logTime}</span>
      <span className="w-1/4"><strong>Log Message:</strong> {value}</span>
      <span className="w-1/4"><strong>Field:</strong> {field}</span>
      <span className="w-1/4"><strong>Measurement:</strong> {measurement}</span>
      <span className="w-1/4"><strong>Status Code:</strong> {_seq}</span>
    </div>
  );
}
