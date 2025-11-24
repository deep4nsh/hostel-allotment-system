"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function StudentProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                const res = await fetch('http://localhost:3000/students/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (!res.ok) throw new Error('Failed to fetch profile')

                const data = await res.json()
                setProfile(data)
            } catch (error) {
                console.error(error)
                // router.push('/auth/login')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
    }, [router])

    if (isLoading) return <div className="p-8 text-center">Loading profile...</div>
    if (!profile) return <div className="p-8 text-center">Failed to load profile</div>

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

                <Card>
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>Your registered information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-500">Name</label>
                                <p className="text-lg">{profile.name || 'Not set'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Email</label>
                                <p className="text-lg">{profile.user?.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Student ID</label>
                                <p className="text-lg">{profile.uniqueId || 'Pending Allocation'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-500">Status</label>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Registered
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Downloads</CardTitle>
                        <CardDescription>Important documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="w-full md:w-auto" onClick={async () => {
                            const token = localStorage.getItem('token')
                            const res = await fetch('http://localhost:3000/students/me/slip', {
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
                        }}>
                            Download Registration Slip
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
