'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { API_URL, getAuthHeaders, getProfileEditRequests, requestEditAccess } from '@/lib/api';

export default function StudentRequestsContent() {
    const [activeTab, setActiveTab] = useState('room-swap'); // room-swap, hostel-change, surrender, edit-profile
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<any>({ changeRequests: [], surrenderRequests: [] });
    const [editRequests, setEditRequests] = useState<any[]>([]);
    const [allotment, setAllotment] = useState<any>(null);

    // Room Swap (P2P) State
    const [swapListings, setSwapListings] = useState<any[]>([]);
    const [swapInvites, setSwapInvites] = useState<{ sent: any[], received: any[] }>({ sent: [], received: [] });
    const [myListing, setMyListing] = useState<boolean>(false); // Helper to track if user listed

    // Forms
    const [changeReason, setChangeReason] = useState('');
    const [preferredHostel, setPreferredHostel] = useState('');
    const [surrenderReason, setSurrenderReason] = useState('');
    const [editProfileReason, setEditProfileReason] = useState('');

    // State for hostels
    const [hostels, setHostels] = useState<any[]>([]);

    useEffect(() => {
        fetchAllotment();
        fetchRequests();
        fetchEditRequests();
        fetchHostels();
        // New P2P Fetches
        fetchSwapListings();
        fetchSwapInvites();
    }, []);

    const fetchHostels = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/hostels', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setHostels(data);
            }
        } catch (e) {
            console.error("Failed to fetch hostels", e);
        }
    }

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

    // --- P2P ROOM SWAP Functions ---

    const fetchSwapListings = async () => {
        try {
            const res = await fetch(`${API_URL}/room-swap/list`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setSwapListings(data);
            }
        } catch (error) { console.error(error); }
    };

    const fetchSwapInvites = async () => {
        try {
            const res = await fetch(`${API_URL}/room-swap/invites`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setSwapInvites(data);
            }
        } catch (error) { console.error(error); }
    };

    const handleListMyRoom = async () => {
        if (!confirm('Are you sure you want to list your room for swapping? Other students in your hostel will see it.')) return;
        try {
            const res = await fetch(`${API_URL}/room-swap/list`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                alert('Room listed successfully!');
                fetchSwapListings(); // To refresh UI state logic if we tracked "myListing" better, but simple re-fetch works
                setMyListing(true);
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to list room');
            }
        } catch (e) { alert('Error listing room'); }
    };

    const handleRemoveListing = async () => {
        if (!confirm('Remove your room from swap listings?')) return;
        try {
            const res = await fetch(`${API_URL}/room-swap/list`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                alert('Listing removed.');
                fetchSwapListings();
                setMyListing(false);
            }
        } catch (e) { alert('Error removing listing'); }
    };

    const handleSendSwapInvite = async (targetStudentId: string) => {
        try {
            const res = await fetch(`${API_URL}/room-swap/invite`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetStudentId })
            });
            if (res.ok) {
                alert('Invite sent!');
                fetchSwapInvites();
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to send invite');
            }
        } catch (e) { alert('Error sending invite'); }
    }

    const handleRespondInvite = async (inviteId: string, status: 'ACCEPTED' | 'REJECTED') => {
        if (status === 'ACCEPTED' && !confirm('Accepting this invite will IMMEDIATELY swap your rooms. This action is irreversible. Proceed?')) return;

        try {
            const res = await fetch(`${API_URL}/room-swap/invite/${inviteId}/respond`, {
                method: 'POST',
                headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                alert(status === 'ACCEPTED' ? 'Swap Successful! Your room has been updated.' : 'Invite rejected.');
                fetchSwapInvites();
                fetchAllotment(); // Refresh allotment to show new room
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to respond');
            }
        } catch (e) { alert('Error responding to invite'); }
    }


    // --- Existing Handlers ---

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
                    className={`px-4 py-2 whitespace-nowrap ${activeTab === 'room-swap' ? 'border-b-2 border-black font-bold' : ''}`}
                    onClick={() => setActiveTab('room-swap')}
                >
                    Room Swap
                </button>
                <button
                    className={`px-4 py-2 whitespace-nowrap ${activeTab === 'hostel-change' ? 'border-b-2 border-black font-bold' : ''}`}
                    onClick={() => setActiveTab('hostel-change')}
                >
                    Hostel Change
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

            {activeTab === 'room-swap' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Available Rooms for Swap (Same Hostel)</CardTitle>
                            <div className="space-x-2">
                                <Button variant="outline" onClick={handleListMyRoom}>List My Room</Button>
                                <Button variant="destructive" onClick={handleRemoveListing}>Remove Listing</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-4">
                                List your room here to find other students in your hostel who want to swap.
                                If you see a room you like, send an invite!
                            </p>

                            {swapListings.length === 0 ? (
                                <p className="text-gray-500 italic">No rooms listed for swap in your hostel yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {swapListings.map((listing: any) => (
                                        <div key={listing.id} className="p-4 border rounded flex justify-between items-center bg-white hover:shadow-sm">
                                            <div>
                                                <h4 className="font-bold text-lg">Room {listing.student.allotment?.room?.number}</h4>
                                                <p className="text-sm text-gray-600">{listing.student.name} ({listing.student.uniqueId})</p>
                                                <p className="text-xs text-gray-400">Listed: {new Date(listing.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <Button onClick={() => handleSendSwapInvite(listing.studentId)}>Request Swap</Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle>Incoming Invites</CardTitle></CardHeader>
                            <CardContent>
                                {swapInvites.received.length === 0 ? (
                                    <p className="text-gray-500">No incoming invites.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {swapInvites.received.map((invite: any) => (
                                            <div key={invite.id} className="p-3 border rounded bg-blue-50">
                                                <p className="font-medium">Request from {invite.sender.name}</p>
                                                <p className="text-sm text-gray-600">Room: {invite.sender.allotment?.room?.number}</p>
                                                {invite.status === 'PENDING' && (
                                                    <div className="flex gap-2 mt-2">
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleRespondInvite(invite.id, 'ACCEPTED')}>Accept & Swap</Button>
                                                        <Button size="sm" variant="outline" onClick={() => handleRespondInvite(invite.id, 'REJECTED')}>Reject</Button>
                                                    </div>
                                                )}
                                                {invite.status !== 'PENDING' && <span className="text-xs font-bold mt-2 block">{invite.status}</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Sent Invites</CardTitle></CardHeader>
                            <CardContent>
                                {swapInvites.sent.length === 0 ? (
                                    <p className="text-gray-500">No sent invites.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {swapInvites.sent.map((invite: any) => (
                                            <div key={invite.id} className="p-3 border rounded bg-gray-50">
                                                <p className="font-medium">To: {invite.receiver.name}</p>
                                                <p className="text-sm text-gray-600">Room: {invite.receiver.allotment?.room?.number}</p>
                                                <span className={`px-2 py-0.5 rounded text-xs mt-2 inline-block
                                                    ${invite.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                                                        invite.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                    {invite.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'hostel-change' && (
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader><CardTitle>Request Hostel Change</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitChange} className="space-y-4">
                                <div>
                                    <Label>Preferred Hostel (Optional)</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={preferredHostel}
                                        onChange={(e) => setPreferredHostel(e.target.value)}
                                    >
                                        <option value="">Select Hostel</option>
                                        {hostels.map((h: any) => (
                                            <option key={h.id} value={h.id}>{h.name}</option>
                                        ))}
                                    </select>
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
                        <CardHeader><CardTitle>My Hostel Change Requests</CardTitle></CardHeader>
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
