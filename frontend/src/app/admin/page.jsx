"use client";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { getReportStatusCounts } from "@/services/reports";
import { getActivityUpdateReportLog } from "@/services/logs";

const Dashboard = () => {
  const [activityLog, setActivityLog] = useState([]);
  const [reportStats, setReportStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    fetchActivityLog();
    fetchReportStats();
  }, []);

  const fetchActivityLog = async () => {
    try {
      const logs = await getActivityUpdateReportLog();
      if (logs.length === 0) {
        setActivityLog([{ ID: 0, action: "Log update tidak tersedia", detail_action: "" }]);
      } else {
        setActivityLog(logs);
      }
    } catch (error) {
      return error
    } finally {
      setLoading(false);
    }
  };

  const fetchReportStats = async () => {
    try {
      const data = await getReportStatusCounts();
      setReportStats(data.map(item => ({
        name: item.status.toUpperCase(),
        value: item.count
      })));
    } catch (error) {
      return error
    }
  };

  const COLORS = ["#FFBB28", "#FF8042", "#0088FE", "#00C49F"];

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[70vh]">
      {/* Activity Log */}
      <div className="lg:w-2/3 w-full p-4 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Activity Log</h2>
        
        {/* Scrollable Container */}
        <div className="max-h-[570px] overflow-y-auto border rounded-md p-2">
          {loading ? (
            <p className="text-gray-500 text-center py-3">Memuat data...</p>
          ) : (
            <ul>
              {activityLog.map((log) => (
                <li key={log.ID} className="p-3 border-b last:border-none">
                  <p className="text-gray-600 text-xs">{log.Timestamp ? formatDate(log.Timestamp) : ""}</p>
                  <p className="font-semibold">{log.action}</p>
                  <p className="text-gray-700">{log.detail_action?.replace("{username}", log.User?.Username || "Unknown")}</p>
                  {log.Report && (
                    <p className="text-sm text-gray-500">
                      Room: {log.Report.room}, Status: {log.Report.status}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Pie Chart */}
      <div className="lg:w-1/3 w-full p-4 bg-white rounded-lg shadow-lg flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Report Status Overview</h2>
        <PieChart width={280} height={280}>
          <Pie
            data={reportStats}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {reportStats.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </div>
    </div>
  );
};

export default Dashboard;
