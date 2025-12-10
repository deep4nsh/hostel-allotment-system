"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileForm } from "@/components/student/ProfileForm"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"

export default function StudentProfileContent() {
    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const [allotment, setAllotment] = useState<any>(null)
    const [waitlist, setWaitlist] = useState<any>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            try {
                const res = await fetch('/api/students/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setProfile(data)
                    if (data.allotment) {
                        setAllotment(data.allotment)
                    }
                } else {
                    console.error('Failed to fetch profile:', res.status, res.statusText)
                    if (res.status === 401) {
                        localStorage.removeItem('token')
                        router.push('/login')
                    }
                }

                const wlRes = await fetch('/api/waitlist/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (wlRes.ok) {
                    const wlData = await wlRes.json()
                    setWaitlist(wlData)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
    }, [router])



    if (isLoading) return <div className="p-8">Loading...</div>
    if (!profile) return <div className="p-8">Failed to load profile</div>

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
                    <Button variant="outline" onClick={() => {
                        localStorage.removeItem('token')
                        router.push('/login')
                    }}>Logout</Button>
                </div>

                {allotment ? (
                    <Card className="bg-green-50 border-green-200">
                        <CardHeader>
                            <CardTitle className="text-green-700">🎉 Hostel Allotted!</CardTitle>
                            {!profile?.payments?.some((p: any) => p.purpose === 'HOSTEL_FEE' && p.status === 'COMPLETED') && (
                                <div className="text-red-600 text-sm mt-1">Warning: Hostel Fee is pending.</div>
                            )}
                            {!profile?.payments?.some((p: any) => p.purpose === 'MESS_FEE' && p.status === 'COMPLETED') && (
                                <div className="text-red-600 text-sm mt-1">Warning: Mess Fee is pending.</div>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-lg">You have been allotted a room.</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="font-semibold">Room:</span> {allotment.room?.number}
                                </div>
                                <div>
                                    <span className="font-semibold">Floor:</span> {allotment.room?.floor?.number}
                                </div>
                            </div>

                            {/* Possession Logic */}
                            {allotment.isPossessed ? (
                                <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-md text-green-800 text-sm flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Possession confirmed on {new Date(allotment.possessionDate).toLocaleDateString()}
                                </div>
                            ) : (
                                profile?.payments?.some((p: any) => p.purpose === 'HOSTEL_FEE' && p.status === 'COMPLETED') && (
                                    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm space-y-3">
                                        <h3 className="font-semibold text-gray-900">Final Acknowledgment</h3>
                                        <div className="flex items-start space-x-2">
                                            <input
                                                type="checkbox"
                                                id="possessionCheck"
                                                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                onChange={(e) => {
                                                    const btn = document.getElementById('confirmPossessionBtn') as HTMLButtonElement;
                                                    if (btn) btn.disabled = !e.target.checked;
                                                }}
                                            />
                                            <label htmlFor="possessionCheck" className="text-sm text-gray-700">
                                                I hereby confirm that I have possessed the hostel room allotted to me. This is the final acknowledgment that the hostel is taken.
                                            </label>
                                        </div>
                                        <Button
                                            id="confirmPossessionBtn"
                                            disabled={true}
                                            onClick={async () => {
                                                try {
                                                    const token = localStorage.getItem('token');
                                                    const res = await fetch('/api/students/me/ack-possession', {
                                                        method: 'POST',
                                                        headers: { 'Authorization': `Bearer ${token}` }
                                                    });
                                                    if (res.ok) {
                                                        // Refresh profile
                                                        window.location.reload();
                                                    } else {
                                                        alert('Failed to acknowledge possession');
                                                    }
                                                } catch (e) {
                                                    console.error(e);
                                                }
                                            }}
                                            className="w-full sm:w-auto"
                                        >
                                            Confirm Possession
                                        </Button>
                                    </div>
                                )
                            )}

                        </CardContent>
                    </Card>
                ) : (
                    waitlist && waitlist.position && (
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-700">Waitlist Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg">Your current waitlist position: <span className="font-bold text-2xl">{waitlist.position}</span></p>
                                <p className="text-sm text-blue-600">Status: {waitlist.status}</p>
                            </CardContent>
                        </Card>
                    )
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>Your registered information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfileForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
