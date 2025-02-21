"use client";
import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { getReportStatusCounts } from "@/services/reports";

const Dashboard = () => {
  const [activityLog, setActivityLog] = useState([]);
  const [reportStats, setReportStats] = useState([]);

  const formatDate = (isoString) => {

    return new Date(isoString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };  

  useEffect(() => {
    const dummyData = [
      {
        ID: 31,
        action: "Update Report",
        detail_action: "{username} updated status report room A to (In Progress)",
        target_report_id: 59,
        UserID: 1,
        Timestamp: "2025-02-20T01:49:38.304186Z",
        User: {
          ID: 1,
          Username: "agrieva",
          Role: "user"
        },
        Report: {
          ID: 59,
          room: "D423",
          status: "pending",
          description: "AC rusak"
        }
      },
      {
        ID: 32,
        action: "Update Report",
        detail_action: "{username} updated status report room B to (Done)",
        target_report_id: 60,
        UserID: 2,
        Timestamp: "2025-02-20T02:15:10.123456Z",
        User: {
          ID: 2,
          Username: "john_doe",
          Role: "admin"
        },
        Report: {
          ID: 60,
          room: "D500",
          status: "done",
          description: "Lampu mati"
        }
      },
      {
        ID: 33,
        action: "Update Report",
        detail_action: "{username} updated status report room C to (On The Way)",
        target_report_id: 61,
        UserID: 3,
        Timestamp: "2025-02-20T03:25:05.654321Z",
        User: {
          ID: 3,
          Username: "jane_doe",
          Role: "user"
        },
        Report: {
          ID: 61,
          room: "D250",
          status: "on the way",
          description: "Kipas angin rusak"
        }
      }
    ];

    setActivityLog(dummyData);
  }, []);


  useEffect(() => {
    fetchReportStats();
  }, []);

  const fetchReportStats = async () => {
    try {
      const data = await getReportStatusCounts();
      setReportStats(data.map(item => ({
        name: item.status.toUpperCase(),
        value: item.count
      })));
    } catch (error) {
      console.error("Failed to fetch report stats:", error);
    }
  };

  const COLORS = ["#FFBB28", "#FF8042", "#0088FE", "#00C49F"];

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[70vh]">
      {/* Activity Log */}
      <div className="lg:w-2/3 w-full p-4 bg-white rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-xl font-bold mb-4">Activity Log</h2>
        <div className="max-h-full overflow-y-auto">
          <ul>
            {activityLog.map((log) => (
              <li key={log.ID} className="p-3 border-b">
                <p className="text-gray-600 text-xs">{formatDate(log.Timestamp)}</p>
                <p className="font-semibold">{log.action}</p>
                <p className="text-gray-700">{log.detail_action.replace("{username}", log.User.Username)}</p>
                <p className="text-sm text-gray-500">
                  Room: {log.Report.room}, Status: {log.Report.status}
                </p>
              </li>
            ))}
          </ul>
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
