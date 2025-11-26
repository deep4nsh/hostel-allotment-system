"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function StudentProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const [allotment, setAllotment] = useState<any>(null)
    const [waitlist, setWaitlist] = useState<any>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                const res = await fetch('http://localhost:3001/students/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setProfile(data)
                    // Check for allotment in profile data if included, or fetch separately
                    // Assuming students/me includes allotment based on previous service updates
                    if (data.allotment) {
                        setAllotment(data.allotment)
                    }
                } else {
                    console.error('Failed to fetch profile:', res.status, res.statusText)
                }

                const wlRes = await fetch('http://localhost:3001/waitlist/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (wlRes.ok) {
                    const wlData = await wlRes.json()
                    setWaitlist(wlData)
                } else {
                    console.warn('Failed to fetch waitlist:', wlRes.status, wlRes.statusText)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
    }, [router])

    const handleDownloadSlip = async () => {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3001/students/me/slip', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'registration-slip.pdf'
            a.click()
        } else {
            alert('Failed to download slip')
        }
    }

    const handleDownloadAllotmentLetter = async () => {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:3001/letters/allotment', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'allotment-letter.pdf'
            a.click()
        } else {
            alert('Failed to download allotment letter')
        }
    }

    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<any>({})

    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name,
                phone: profile.phone || '',
                address: profile.address || '',
                gender: profile.gender || '',
                year: profile.year || '',
                program: profile.program || ''
            })
        }
    }, [profile])

    const handleUpdateProfile = async () => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('http://localhost:3001/students/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    year: formData.year ? parseInt(formData.year) : undefined
                })
            })
            if (res.ok) {
                const updated = await res.json()
                setProfile(updated)
                setIsEditing(false)
                alert('Profile updated successfully')
            } else {
                alert('Failed to update profile')
            }
        } catch (error) {
            console.error(error)
            alert('Error updating profile')
        }
    }

    const handleGenerateId = async () => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('http://localhost:3001/students/me/generate-id', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const updated = await res.json()
                setProfile(updated)
                alert('Unique ID generated!')
            } else {
                alert('Failed to generate ID')
            }
        } catch (error) {
            console.error(error)
        }
    }

    if (isLoading) return <div className="p-8">Loading...</div>
    if (!profile) return <div className="p-8">Failed to load profile</div>

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
                    <Button variant="outline" onClick={() => {
                        localStorage.removeItem('token')
                        router.push('/')
                    }}>Logout</Button>
                </div>

                {allotment ? (
                    <Card className="bg-green-50 border-green-200">
                        <CardHeader>
                            <CardTitle className="text-green-700">🎉 Hostel Allotted!</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-lg">You have been allotted a room.</p>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <span className="font-semibold">Room:</span> {allotment.room?.number}
                                </div>
                                <div>
                                    <span className="font-semibold">Floor:</span> {allotment.room?.floor?.number}
                                </div>
                            </div>
                            <Button className="mt-4 bg-green-600 hover:bg-green-700" onClick={handleDownloadAllotmentLetter}>
                                Download Allotment Letter
                            </Button>
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
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Profile Details</CardTitle>
                            <CardDescription>Your registered information</CardDescription>
                        </div>
                        <Button variant={isEditing ? "secondary" : "default"} onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-500">Name</label>
                                {isEditing ? (
                                    <input className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                ) : (
                                    <p className="text-lg">{profile.name || 'Not set'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Email</label>
                                <p className="text-lg">{profile.user?.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Phone</label>
                                {isEditing ? (
                                    <input className="w-full p-2 border rounded" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                ) : (
                                    <p className="text-lg">{profile.phone || 'Not set'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Address</label>
                                {isEditing ? (
                                    <input className="w-full p-2 border rounded" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                                ) : (
                                    <p className="text-lg">{profile.address || 'Not set'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Gender</label>
                                {isEditing ? (
                                    <select className="w-full p-2 border rounded" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                                        <option value="">Select</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                ) : (
                                    <p className="text-lg">{profile.gender || 'Not set'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Year</label>
                                {isEditing ? (
                                    <input type="number" className="w-full p-2 border rounded" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                                ) : (
                                    <p className="text-lg">{profile.year || 'Not set'}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Student ID</label>
                                <div className="flex items-center gap-2">
                                    <p className="text-lg">{profile.uniqueId || 'Pending Allocation'}</p>
                                    {!profile.uniqueId && !isEditing && (
                                        <Button size="sm" onClick={handleGenerateId}>Generate ID</Button>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Status</label>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {allotment ? 'Allotted' : 'Registered'}
                                </span>
                            </div>
                        </div>
                        {isEditing && (
                            <Button className="w-full" onClick={handleUpdateProfile}>Save Changes</Button>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Downloads</CardTitle>
                        <CardDescription>Important documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full md:w-auto" onClick={handleDownloadSlip}>
                            Download Registration Slip
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
