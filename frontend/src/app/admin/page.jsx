"use client";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { getReportStatusCounts } from "../../services/reports";
import { getActivityUpdateReportLog } from "../../services/logs";
import { useRouter } from "next/navigation";

const COLOR_MAP = {
  "PENDING": "#FFBB28",
  "IN PROGRESS": "#FF8042",
  "ON THE WAY": "#0088FE",
  "DONE": "#00C49F"
};

const Dashboard = () => {
  const router = useRouter();
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
      if ([400, 401, 402, 403].includes(error.status)) {
        router.push('/login');
      }
      return error;
    } finally {
      setLoading(false);
    }
  };

  const fetchReportStats = async () => {
    try {
      const data = await getReportStatusCounts();
      setReportStats(
        data.map((item) => ({
          name: item.status.toUpperCase(),
          value: item.count,
          color: COLOR_MAP[item.status.toUpperCase()] || "#ccc",
        }))
      );
    } catch (error) {
      if ([400, 401, 402, 403].includes(error.status)) {
        router.push('/login');
      }
      return error;
    }
  };

  const highlightStatusChange = (text, fromStatus, toStatus) => {
    const fromColor = COLOR_MAP[fromStatus.toUpperCase()] || "#ccc";
    const toColor = COLOR_MAP[toStatus.toUpperCase()] || "#ccc";

    // Ganti "from ..." menjadi <span style="color:black">from</span> <span style="color:...">status</span>
    return text
      .replace(
        new RegExp(`from ${fromStatus}`, "i"),
        `<span style="color:#000;">from</span> <span style="color:${fromColor}; font-weight:500;">${fromStatus}</span>`
      )
      .replace(
        new RegExp(`to ${toStatus}`, "i"),
        `<span style="color:#000;">to</span> <span style="color:${toColor}; font-weight:500;">${toStatus}</span>`
      );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[70vh]">
      {/* Activity Log */}
      <div className="lg:w-2/3 w-full p-4 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Activity Log</h2>

        <div className="max-h-[570px] overflow-y-auto border rounded-md p-2">
          {loading ? (
            <p className="text-gray-500 text-center py-3">Memuat data...</p>
          ) : (
            <ul>
              {activityLog.map((log) => {
                const detail = log.detail_action?.replace("{username}", log.User?.Username || "Unknown") || "";
                const match = detail.match(/from (.*?) to (.*)/i);
                const fromStatus = match?.[1] || "";
                const toStatus = match?.[2] || "";
                const highlightedDetail = highlightStatusChange(detail, fromStatus, toStatus);

                return (
                  <li key={log.ID} className="p-3 border-b last:border-none">
                    <p className="text-gray-600 text-xs">{log.timestamp ? formatDate(log.timestamp) : ""}</p>
                    <p className="font-semibold mb-1">{log.action}</p>
                    <p
                      className="text-gray-700"
                      dangerouslySetInnerHTML={{ __html: highlightedDetail }}
                    />
                  </li>
                );
              })}
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
              <Cell key={`cell-${index}`} fill={entry.color} />
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
