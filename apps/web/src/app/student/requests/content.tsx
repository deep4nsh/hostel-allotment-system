'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { API_URL, getAuthHeaders, getProfileEditRequests, requestEditAccess } from '@/lib/api';

export default function StudentRequestsContent() {
    const [activeTab, setActiveTab] = useState('change'); // change, surrender, possession, edit-profile
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<any>({ changeRequests: [], surrenderRequests: [] });
    const [editRequests, setEditRequests] = useState<any[]>([]);
    const [allotment, setAllotment] = useState<any>(null);

    // Forms
    const [changeReason, setChangeReason] = useState('');
    const [preferredHostel, setPreferredHostel] = useState('');
    const [surrenderReason, setSurrenderReason] = useState('');
    const [editProfileReason, setEditProfileReason] = useState('');

    useEffect(() => {
        fetchRequests();
        fetchAllotment();
        fetchEditRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${API_URL}/requests/my`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setRequests(data);
            }
        } catch (error) {
            console.error('Failed to fetch requests', error);
        }
    };

    const fetchEditRequests = async () => {
        try {
            const data = await getProfileEditRequests();
            setEditRequests(data);
        } catch (error) {
            console.error('Failed to fetch edit requests', error);
        }
    };

    const fetchAllotment = async () => {
        try {
            const res = await fetch(`${API_URL}/allotment/me`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setAllotment(data);
            }
        } catch (error) {
            console.error('Failed to fetch allotment', error);
        }
    };

    const handleSubmitChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/requests/change`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: changeReason, preferredHostelId: preferredHostel }),
            });
            if (res.ok) {
                alert('Request submitted successfully');
                setChangeReason('');
                setPreferredHostel('');
                fetchRequests();
            } else {
                alert('Failed to submit request');
            }
        } catch (error) {
            console.error(error);
            alert('Error submitting request');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitSurrender = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/requests/surrender`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: surrenderReason }),
            });
            if (res.ok) {
                alert('Surrender request submitted');
                setSurrenderReason('');
                fetchRequests();
            } else {
                alert('Failed to submit request');
            }
        } catch (error) {
            console.error(error);
            alert('Error submitting request');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitEditProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await requestEditAccess(editProfileReason);
            alert('Edit request submitted successfully');
            setEditProfileReason('');
            fetchEditRequests();
        } catch (error: any) {
            alert(error.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPossession = async () => {
        if (!confirm('Are you sure you have taken possession of the room?')) return;
        try {
            const res = await fetch(`${API_URL}/requests/possession`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });
            if (res.ok) {
                alert('Possession confirmed!');
                fetchAllotment();
            }
        } catch (error) {
            alert('Failed to confirm possession');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Manage Allotment & Requests</h1>

            {/* Possession Status */}
            {allotment && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-lg">Current Allotment</h3>
                            <p>Room: {allotment.room?.number} ({allotment.room?.floor?.hostel?.name})</p>
                            <p className="text-sm text-gray-600">Status: {allotment.isPossessed ? 'Possessed ✅' : 'Pending Possession ⏳'}</p>
                        </div>
                        {!allotment.isPossessed && (
                            <Button onClick={handleConfirmPossession}>Confirm Possession</Button>
                        )}
                    </CardContent>
                </Card>
            )}

            <div className="flex gap-4 border-b overflow-x-auto">
                <button
                    className={`px-4 py-2 whitespace-nowrap ${activeTab === 'change' ? 'border-b-2 border-black font-bold' : ''}`}
                    onClick={() => setActiveTab('change')}
                >
                    Room Change
                </button>
                <button
                    className={`px-4 py-2 whitespace-nowrap ${activeTab === 'surrender' ? 'border-b-2 border-black font-bold' : ''}`}
                    onClick={() => setActiveTab('surrender')}
                >
                    Surrender Room
                </button>
                <button
                    className={`px-4 py-2 whitespace-nowrap ${activeTab === 'edit-profile' ? 'border-b-2 border-black font-bold' : ''}`}
                    onClick={() => setActiveTab('edit-profile')}
                >
                    Profile Edit Access
                </button>
            </div>

            {activeTab === 'change' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Request Room Change</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitChange} className="space-y-4">
                                <div>
                                    <Label>Preferred Hostel (Optional)</Label>
                                    <Input
                                        placeholder="e.g. Aryabhatta"
                                        value={preferredHostel}
                                        onChange={(e) => setPreferredHostel(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Reason for Change</Label>
                                    <Textarea
                                        required
                                        placeholder="Why do you want to change?"
                                        value={changeReason}
                                        onChange={(e) => setChangeReason(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" disabled={loading}>Submit Request</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>My Change Requests</CardTitle></CardHeader>
                        <CardContent>
                            {requests.changeRequests?.length === 0 ? (
                                <p className="text-gray-500">No requests found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {requests.changeRequests?.map((req: any) => (
                                        <div key={req.id} className="p-3 border rounded bg-gray-50">
                                            <div className="flex justify-between">
                                                <span className="font-medium">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs ${req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-sm mt-1">{req.reason}</p>
                                            {req.adminComment && <p className="text-xs text-red-600 mt-1">Admin: {req.adminComment}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'surrender' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Surrender Room</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitSurrender} className="space-y-4">
                                <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 mb-4">
                                    Warning: Surrendering your room is irreversible. You will lose your current allotment.
                                </div>
                                <div>
                                    <Label>Reason for Surrender</Label>
                                    <Textarea
                                        required
                                        placeholder="Why are you leaving?"
                                        value={surrenderReason}
                                        onChange={(e) => setSurrenderReason(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" variant="destructive" disabled={loading}>Submit Surrender Request</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Surrender History</CardTitle></CardHeader>
                        <CardContent>
                            {requests.surrenderRequests?.length === 0 ? (
                                <p className="text-gray-500">No requests found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {requests.surrenderRequests?.map((req: any) => (
                                        <div key={req.id} className="p-3 border rounded bg-gray-50">
                                            <div className="flex justify-between">
                                                <span className="font-medium">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs ${req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-sm mt-1">{req.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'edit-profile' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Request Profile Edit Access</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitEditProfile} className="space-y-4">
                                <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-4">
                                    If your profile is frozen, you must request access to make changes.
                                </div>
                                <div>
                                    <Label>Reason for Edit</Label>
                                    <Textarea
                                        required
                                        placeholder="e.g., Correction in address, Updated phone number..."
                                        value={editProfileReason}
                                        onChange={(e) => setEditProfileReason(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" disabled={loading}>Submit Request</Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Request History</CardTitle></CardHeader>
                        <CardContent>
                            {editRequests.length === 0 ? (
                                <p className="text-gray-500">No requests found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {editRequests.map((req: any) => (
                                        <div key={req.id} className="p-3 border rounded bg-gray-50">
                                            <div className="flex justify-between">
                                                <span className="font-medium">{new Date(req.createdAt).toLocaleDateString()}</span>
                                                <span className={`px-2 py-0.5 rounded text-xs ${req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                    req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-sm mt-1">{req.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
