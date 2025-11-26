"use client";

import { useEffect, useState } from "react";
import { getPendingRebates, updateRebateStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

export default function WardenDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const data = await getPendingRebates();
      setRequests(data);
    } catch (error) {
      console.error("Failed to load requests", error);
      // Ideally redirect if 403, but simple catch is okay for now
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDecision(id: string, status: "APPROVED" | "REJECTED") {
    try {
      await updateRebateStatus(id, status);
      // Remove from list
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      alert("Failed to update status");
    }
  }

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Warden Dashboard</h1>
          <Button variant="outline" onClick={() => router.push("/login")}>Logout</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Mess Rebate Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending requests.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 uppercase">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Period</th>
                      <th className="px-4 py-3">Days</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Hostel/Room</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => {
                      const start = new Date(req.startDate);
                      const end = new Date(req.endDate);
                      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                      const room = req.student?.allotment?.room;
                      const hostelName = room?.floor?.hostel?.name || "N/A";
                      const roomNum = room?.number || "N/A";

                      return (
                        <tr key={req.id} className="border-b bg-white hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">
                            <div>{req.student.name}</div>
                            <div className="text-xs text-gray-500">{req.student.uniqueId}</div>
                          </td>
                          <td className="px-4 py-3">
                            {start.toLocaleDateString()} - {end.toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">{days}</td>
                          <td className="px-4 py-3 max-w-xs truncate" title={req.reason}>
                            {req.reason}
                          </td>
                          <td className="px-4 py-3">
                            {hostelName} / {roomNum}
                          </td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleDecision(req.id, "APPROVED")}
                            >
                              <Check className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDecision(req.id, "REJECTED")}
                            >
                              <X className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
