'use client';

import { useEffect, useState } from "react";
import { getPendingRebates, updateRebateStatus, API_URL, getAuthHeaders } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

export default function WardenDashboardContent() {
  const [activeTab, setActiveTab] = useState('rebates');
  const [rebateRequests, setRebateRequests] = useState<any[]>([]);
  const [changeRequests, setChangeRequests] = useState<any[]>([]);
  const [surrenderRequests, setSurrenderRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadAllRequests();
  }, []);

  async function loadAllRequests() {
    setIsLoading(true);
    try {
      const [rebates, changes, surrenders] = await Promise.all([
        getPendingRebates(),
        fetch(`${API_URL}/requests/warden/change`, { headers: getAuthHeaders() }).then(res => res.ok ? res.json() : []),
        fetch(`${API_URL}/requests/warden/surrender`, { headers: getAuthHeaders() }).then(res => res.ok ? res.json() : [])
      ]);
      setRebateRequests(rebates);
      setChangeRequests(changes);
      setSurrenderRequests(surrenders);
    } catch (error) {
      console.error("Failed to load requests", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRebateDecision(id: string, status: "APPROVED" | "REJECTED") {
    try {
      await updateRebateStatus(id, status);
      setRebateRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      alert("Failed to update status");
    }
  }

  const handleRequestDecision = async (type: 'change' | 'surrender', id: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/requests/${type}/${id}/status`, {
        method: 'PATCH',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        alert('Status updated');
        loadAllRequests(); // Reload to refresh lists
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error(error);
      alert('Error updating status');
    }
  };

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Warden Dashboard</h1>
          <Button variant="outline" onClick={() => router.push("/login")}>Logout</Button>
        </div>

        <div className="flex gap-4 border-b">
          <button
            className={`px-4 py-2 ${activeTab === 'rebates' ? 'border-b-2 border-black font-bold' : ''}`}
            onClick={() => setActiveTab('rebates')}
          >
            Mess Rebates
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'change' ? 'border-b-2 border-black font-bold' : ''}`}
            onClick={() => setActiveTab('change')}
          >
            Hostel Change
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'surrender' ? 'border-b-2 border-black font-bold' : ''}`}
            onClick={() => setActiveTab('surrender')}
          >
            Surrender
          </button>
        </div>

        {activeTab === 'rebates' && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Mess Rebate Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {rebateRequests.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending requests.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-gray-700 uppercase">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Period</th>
                        <th className="px-4 py-3">Reason</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rebateRequests.map((req) => {
                        const start = new Date(req.startDate);
                        const end = new Date(req.endDate);
                        return (
                          <tr key={req.id} className="border-b bg-white hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">
                              <div>{req.student.name}</div>
                              <div className="text-xs text-gray-500">{req.student.uniqueId}</div>
                            </td>
                            <td className="px-4 py-3">
                              {start.toLocaleDateString()} - {end.toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 max-w-xs truncate" title={req.reason}>
                              {req.reason}
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRebateDecision(req.id, "APPROVED")}>
                                <Check className="w-4 h-4 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRebateDecision(req.id, "REJECTED")}>
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
        )}

        {activeTab === 'change' && (
          <div className="space-y-4">
            {changeRequests.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{req.student.name} ({req.student.uniqueId})</h3>
                    <p className="text-sm text-gray-600">Current Room: {req.currentRoomId}</p>
                    <p className="text-sm">Reason: {req.reason}</p>
                    {req.preferredHostelId && <p className="text-sm">Preferred: {req.preferredHostelId}</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {req.status}
                    </span>
                    {req.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleRequestDecision('change', req.id, 'REJECTED')}>Reject</Button>
                        <Button size="sm" onClick={() => handleRequestDecision('change', req.id, 'APPROVED')}>Approve</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {changeRequests.length === 0 && <p className="text-gray-500">No pending hostel change requests.</p>}
          </div>
        )}

        {activeTab === 'surrender' && (
          <div className="space-y-4">
            {surrenderRequests.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{req.student.name} ({req.student.uniqueId})</h3>
                    <p className="text-sm">Reason: {req.reason}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {req.status}
                    </span>
                    {req.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleRequestDecision('surrender', req.id, 'REJECTED')}>Reject</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRequestDecision('surrender', req.id, 'APPROVED')}>Approve Surrender</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {surrenderRequests.length === 0 && <p className="text-gray-500">No pending surrender requests.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
