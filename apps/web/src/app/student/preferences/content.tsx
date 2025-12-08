"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"


export default function PreferencesPageContent() {
    const [hostels, setHostels] = useState<any[]>([])
    const [preferences, setPreferences] = useState<{ floorId: string, rank: number }[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const [studentYear, setStudentYear] = useState<number | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            try {
                // Fetch Profile to check Year
                const profileRes = await fetch('/api/students/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (profileRes.ok) {
                    const profile = await profileRes.json()
                    setStudentYear(profile.year)
                }

                // Fetch Hostels
                const res = await fetch('/api/hostels', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setHostels(data)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [router])

    const handleAddPreference = (floorId: string) => {
        if (preferences.find(p => p.floorId === floorId)) return
        setPreferences([...preferences, { floorId, rank: preferences.length + 1 }])
    }

    const handleSubmit = async () => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/students/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ preferences })
            })

            if (res.ok) {
                alert('Preferences saved!')
                router.push('/student/profile')
            } else {
                alert('Failed to save preferences')
            }
        } catch (error) {
            console.error(error)
            alert('Error saving preferences')
        }
    }



    if (isLoading) return <div className="p-8">Loading...</div>

    if (studentYear === 1) {
        return (
            <div className="p-8 text-center space-y-4">
                <h1 className="text-2xl font-bold text-red-600">Not Eligible</h1>
                <p className="text-lg">Preferences selection is not eligible for 1st year students.</p>
                <Button onClick={() => router.push('/student/profile')}>Back to Profile</Button>
            </div>
        )
    }



    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">Select Preferences</h1>
            <p className="text-slate-500">Select floors in order of preference.</p>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Available Floors</h2>
                    {hostels.map(hostel => (
                        <Card key={hostel.id}>
                            <CardHeader>
                                <CardTitle>{hostel.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {hostel.floors?.map((floor: any) => (
                                    <div key={floor.id} className="flex justify-between items-center p-2 border rounded">
                                        <span>Floor {floor.number} ({floor.gender})</span>
                                        <Button size="sm" onClick={() => handleAddPreference(floor.id)}>
                                            Add
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Your Preferences</h2>
                    <Card>
                        <CardContent className="p-4 space-y-2">
                            {preferences.length === 0 && <p className="text-slate-400">No preferences selected</p>}
                            {preferences.map((pref, index) => (
                                <div key={pref.floorId} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                    <span className="font-bold mr-4">#{index + 1}</span>
                                    <span className="flex-1">Floor ID: {pref.floorId}</span>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setPreferences(preferences.filter(p => p.floorId !== pref.floorId))
                                    }}>Remove</Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Button className="w-full" onClick={handleSubmit} disabled={preferences.length === 0}>
                        Submit Preferences
                    </Button>
                </div>
            </div>
        </div>
    )
}
