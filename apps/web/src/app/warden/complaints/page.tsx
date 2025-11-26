"use client";

import { useEffect, useState } from "react";
import { getWardenComplaints, updateComplaintStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function WardenComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    try {
      const data = await getWardenComplaints();
      setComplaints(data);
    } catch (error) {
      console.error(error);
    } finally {
        setIsLoading(false);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    try {
      await updateComplaintStatus(id, status);
      // Optimistic update
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    } catch (error) {
      alert("Failed to update status");
    }
  }

  if (isLoading) return <div className="p-8">Loading complaints...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Complaint Management</h1>
          <Button variant="outline" onClick={() => router.push("/login")}>Logout</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            {complaints.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No complaints found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 uppercase">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Hostel</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map((c) => (
                      <tr key={c.id} className="border-b bg-white hover:bg-gray-50">
                        <td className="px-4 py-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                             <div>{c.student.name}</div>
                             <div className="text-xs text-gray-500">{c.student.uniqueId}</div>
                        </td>
                        <td className="px-4 py-3">{c.hostel?.name || 'N/A'}</td>
                        <td className="px-4 py-3 font-medium">{c.category}</td>
                        <td className="px-4 py-3 max-w-xs truncate" title={c.description}>
                            {c.description}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            c.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                            c.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            c.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                             <Select onValueChange={(val) => handleStatusChange(c.id, val)} defaultValue={c.status}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Update Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="OPEN">Open</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                    <SelectItem value="REJECTED">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </td>
                      </tr>
                    ))}
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
