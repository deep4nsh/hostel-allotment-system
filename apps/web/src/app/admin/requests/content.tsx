'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPendingEditRequests, approveEditRequest, rejectEditRequest } from '@/lib/api';
import { Check, X } from 'lucide-react';

export default function AdminRequestsPageContent() {
    const [activeTab, setActiveTab] = useState('profile');
    const [requests, setRequests] = useState<any[]>([]);
    const [waitlist, setWaitlist] = useState<any[]>([]);
    const [changeRequests, setChangeRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRequests();
        fetchWaitlist();
        fetchChangeRequests();
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

    const fetchChangeRequests = async () => {
        try {
            // Re-using existing endpoint for now as it returns all change requests
            const token = localStorage.getItem('token');
            const res = await fetch('/api/requests/warden/change', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setChangeRequests(data);
            }
        } catch (error) { console.error(error); }
    }

    const fetchWaitlist = async () => {
        try {
            const data = await import("@/lib/api").then(m => m.getPriorityWaitlist());
            setWaitlist(data);
        } catch (error) {
            console.error('Failed to fetch waitlist', error);
        }
    }

    const handleApprove = async (id: string, type: 'edit' | 'change' = 'edit') => {
        if (!confirm('Approve this request?')) return;
        setProcessingId(id);
        try {
            if (type === 'edit') {
                await approveEditRequest(id);
            } else {
                const token = localStorage.getItem('token');
                await fetch(`/api/requests/change/${id}/status`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'APPROVED' })
                });
            }
            alert('Request approved');
            type === 'edit' ? fetchRequests() : fetchChangeRequests();
        } catch (error) {
            alert('Failed to approve request');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string, type: 'edit' | 'change' = 'edit') => {
        if (!confirm('Reject this request?')) return;
        setProcessingId(id);
        try {
            if (type === 'edit') {
                await rejectEditRequest(id);
            } else {
                const token = localStorage.getItem('token');
                await fetch(`/api/requests/change/${id}/status`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'REJECTED' })
                });
            }
            alert('Request rejected');
            type === 'edit' ? fetchRequests() : fetchChangeRequests();
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
                    className={`px-4 py-2 ${activeTab === 'change' ? 'border-b-2 border-black font-bold' : ''}`}
                    onClick={() => setActiveTab('change')}
                >
                    Hostel Change
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
                                                onClick={() => handleApprove(req.id, 'edit')}
                                                disabled={processingId === req.id}
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Approve
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                onClick={() => handleReject(req.id, 'edit')}
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

            {activeTab === 'change' && (
                <div className="space-y-4">
                    {changeRequests.length === 0 ? (
                        <p className="text-gray-500">No pending hostel change requests.</p>
                    ) : (
                        changeRequests.map((req) => (
                            <Card key={req.id}>
                                <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-lg">{req.student?.name} ({req.student?.uniqueId})</h3>
                                        <p className="text-sm text-gray-600">
                                            <strong>Current:</strong> {req.student?.allotment?.room?.floor?.hostel?.name || 'Unknown'} (Room {req.student?.allotment?.room?.number})
                                        </p>
                                        <p className="text-sm text-blue-600">
                                            <strong>Requested:</strong> {req.preferredHostel?.name || 'Any Available'}
                                        </p>
                                        <p className="text-sm italic text-gray-700 bg-gray-50 p-2 rounded">
                                            "{req.reason}"
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(req.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-2 min-w-[150px]">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {req.status}
                                        </span>
                                        {req.status === 'PENDING' && (
                                            <div className="flex gap-2 mt-2">
                                                <Button size="sm" onClick={() => handleApprove(req.id, 'change')} disabled={processingId === req.id}>
                                                    Approve
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleReject(req.id, 'change')} disabled={processingId === req.id}>
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
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
