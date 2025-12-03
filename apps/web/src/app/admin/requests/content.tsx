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

    useEffect(() => {
        fetchRequests();
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
            <h1 className="text-2xl font-bold">Profile Edit Requests</h1>

            {requests.length === 0 ? (
                <p className="text-gray-500">No pending requests.</p>
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
        </div>
    );
}
