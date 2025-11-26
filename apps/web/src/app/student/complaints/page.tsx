"use client";

import { useEffect, useState } from "react";
import { createComplaint, getMyComplaints } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

export default function StudentComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [formData, setFormData] = useState({ category: "ELECTRICITY", description: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    try {
      const data = await getMyComplaints();
      setComplaints(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createComplaint(formData);
      alert("Complaint submitted successfully!");
      setFormData({ ...formData, description: "" });
      loadComplaints();
    } catch (error: any) {
      alert(error.message || "Failed to submit complaint");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
             <h1 className="text-2xl font-bold">Maintenance & Complaints</h1>
             <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Raise New Complaint</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <Select 
                    onValueChange={(val) => setFormData({ ...formData, category: val })} 
                    defaultValue="ELECTRICITY"
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ELECTRICITY">Electricity</SelectItem>
                      <SelectItem value="PLUMBING">Plumbing</SelectItem>
                      <SelectItem value="CARPENTRY">Carpentry</SelectItem>
                      <SelectItem value="CLEANING">Cleaning</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  placeholder="Describe the issue (e.g., Fan not working in Room 101)"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Complaint"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            {complaints.length === 0 ? (
              <p className="text-gray-500">No complaints raised.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Description</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="px-4 py-2">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2 font-medium">{c.category}</td>
                      <td className="px-4 py-2">{c.description}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          c.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                          c.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {c.status}
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
