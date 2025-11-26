"use client";

import { useEffect, useState } from "react";
import { createRebateRequest, getMyRebates } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function StudentRebatePage() {
  const [myRebates, setMyRebates] = useState<any[]>([]);
  const [formData, setFormData] = useState({ startDate: "", endDate: "", reason: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadRebates();
  }, []);

  async function loadRebates() {
    try {
      const data = await getMyRebates();
      setMyRebates(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createRebateRequest(formData);
      alert("Request submitted successfully!");
      setFormData({ startDate: "", endDate: "", reason: "" });
      loadRebates();
    } catch (error: any) {
      alert(error.message || "Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between">
             <h1 className="text-2xl font-bold">Mess Rebate Application</h1>
             <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
       

        <Card>
          <CardHeader>
            <CardTitle>Apply for Rebate</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <Input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <Input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <Input
                  placeholder="Medical reason, family function, etc."
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Rebate History</CardTitle>
          </CardHeader>
          <CardContent>
            {myRebates.length === 0 ? (
              <p className="text-gray-500">No rebate history.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">Period</th>
                    <th className="px-4 py-2">Reason</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myRebates.map((req) => (
                    <tr key={req.id} className="border-b">
                      <td className="px-4 py-2">
                        {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{req.reason}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
