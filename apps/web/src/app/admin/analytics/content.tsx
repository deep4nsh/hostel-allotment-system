"use client";

import { useEffect, useState } from "react";
import { getAdminAnalytics } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Home, IndianRupee, AlertCircle } from "lucide-react";

export default function AnalyticsPageContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getAdminAnalytics();
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="p-8">Loading analytics...</div>;
  if (!data) return <div className="p-8">Failed to load data.</div>;

  const { overview, hostelStats, demographics } = data;

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Operational Analytics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-blue-100 rounded-full mr-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Students</p>
              <h3 className="text-2xl font-bold">{overview.totalStudents}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-green-100 rounded-full mr-4">
              <Home className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Allotments Made</p>
              <h3 className="text-2xl font-bold">{overview.allotmentsCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-yellow-100 rounded-full mr-4">
              <IndianRupee className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold">₹{(overview.totalRevenue || 0).toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="p-3 bg-red-100 rounded-full mr-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Refunds</p>
              <h3 className="text-2xl font-bold">{overview.pendingRefunds}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hostel Occupancy */}
      <Card>
        <CardHeader>
          <CardTitle>Hostel Occupancy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-700 uppercase">
                <tr>
                  <th className="px-4 py-3">Hostel Name</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Occupied</th>
                  <th className="px-4 py-3 w-1/3">Utilization</th>
                </tr>
              </thead>
              <tbody>
                {hostelStats.map((h: any) => (
                  <tr key={h.name} className="border-b">
                    <td className="px-4 py-3 font-medium">{h.name}</td>
                    <td className="px-4 py-3">{h.capacity}</td>
                    <td className="px-4 py-3">{h.occupancy}</td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${h.fillRate > 90 ? 'bg-red-600' : h.fillRate > 70 ? 'bg-yellow-400' : 'bg-green-600'}`}
                          style={{ width: `${h.fillRate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">{h.fillRate.toFixed(1)}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Demographics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Students by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {demographics.byCategory.map((c: any) => (
                <li key={c.category} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <span className="font-medium text-gray-700">{c.category}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded text-sm font-bold">{c.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students by Year</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {demographics.byYear.map((y: any) => (
                <li key={y.year} className="flex justify-between items-center border-b pb-2 last:border-0">
                  <span className="font-medium text-gray-700">Year {y.year}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded text-sm font-bold">{y.count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
