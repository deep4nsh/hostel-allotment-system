'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPendingEditRequests, approveEditRequest, rejectEditRequest } from '@/lib/api';
import { Check, X } from 'lucide-react';

export default function AdminRequestsPageContent() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [waitlist, setWaitlist] = useState<any[]>([]);

    useEffect(() => {
        fetchRequests();
        fetchWaitlist();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await getPendingEditRequests();
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch requests', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWaitlist = async () => {
        try {
            const data = await import("@/lib/api").then(m => m.getPriorityWaitlist());
            setWaitlist(data);
        } catch (error) {
            console.error('Failed to fetch waitlist', error);
        }
    }

    const handleApprove = async (id: string) => {
        if (!confirm('Approve this request? The student profile will be unfrozen.')) return;
        setProcessingId(id);
        try {
            await approveEditRequest(id);
            alert('Request approved');
            fetchRequests();
        } catch (error) {
            alert('Failed to approve request');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Reject this request?')) return;
        setProcessingId(id);
        try {
            await rejectEditRequest(id);
            alert('Request rejected');
            fetchRequests();
        } catch (error) {
            alert('Failed to reject request');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="p-6">Loading requests...</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Admin Requests</h1>

            <div className="flex gap-4 border-b">
                <button
                    className={`px-4 py-2 ${activeTab === 'profile' ? 'border-b-2 border-black font-bold' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile Edits
                </button>
                <button
                    className={`px-4 py-2 ${activeTab === 'waitlist' ? 'border-b-2 border-black font-bold' : ''}`}
                    onClick={() => setActiveTab('waitlist')}
                >
                    Allotment Waitlist
                </button>
            </div>

            {activeTab === 'profile' && (
                <>
                    {requests.length === 0 ? (
                        <p className="text-gray-500">No pending profile edit requests.</p>
                    ) : (
                        <div className="grid gap-4">
                            {requests.map((req) => (
                                <Card key={req.id}>
                                    <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                        <div>
                                            <h3 className="font-semibold text-lg">{req.student?.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                {req.student?.uniqueId} • {req.student?.program} • Year {req.student?.year}
                                            </p>
                                            <div className="mt-2 bg-gray-50 p-2 rounded text-sm border">
                                                <span className="font-medium">Reason:</span> {req.reason}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Requested on: {new Date(req.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="text-green-600 border-green-200 hover:bg-green-50"
                                                onClick={() => handleApprove(req.id)}
                                                disabled={processingId === req.id}
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => handleReject(req.id)}
                                                disabled={processingId === req.id}
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Reject
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'waitlist' && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        This list shows students who have paid the eligibility fee and joined the waitlist.
                        They will be considered in the next allotment run.
                    </p>
                    {waitlist.length === 0 ? (
                        <p className="text-gray-500">No students in waitlist.</p>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-100 text-gray-700 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">#</th>
                                        <th className="px-4 py-3">Student</th>
                                        <th className="px-4 py-3">Paid Date</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {waitlist.map((entry, idx) => (
                                        <tr key={entry.id} className="border-b bg-white hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{entry.student?.name}</div>
                                                <div className="text-xs text-gray-500">{entry.student?.uniqueId || entry.student?.user?.email}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {new Date(entry.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                    {entry.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
