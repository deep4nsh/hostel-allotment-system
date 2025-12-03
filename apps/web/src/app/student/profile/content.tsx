"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfileForm } from "@/components/student/ProfileForm"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

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
                const res = await fetch('http://localhost:4000/students/me', {
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

                const wlRes = await fetch('http://localhost:4000/waitlist/me', {
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

    const handleDownloadSlip = async () => {
        const token = localStorage.getItem('token')
        const res = await fetch('http://localhost:4000/students/me/slip', {
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
        const res = await fetch('http://localhost:4000/letters/allotment', {
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
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>Your registered information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfileForm />
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
