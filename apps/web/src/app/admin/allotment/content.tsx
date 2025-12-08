"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminAllotmentContent() {
    const [hostels, setHostels] = useState<any[]>([])
    const [selectedHostel, setSelectedHostel] = useState<string>('')
    const [allotments, setAllotments] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchHostels = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            try {
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

        fetchHostels()
    }, [router])

    const fetchAllotments = async (hostelId: string) => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/allotment/list/${hostelId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setAllotments(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleTriggerAllotment = async () => {
        if (!selectedHostel) return
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/allotment/trigger/${selectedHostel}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const result = await res.json()
                alert(`Allotment Complete!\nEligible Students: ${result.totalEligible}\nAllotted Seats: ${result.allotted}\nWaitlisted: ${result.waitlisted}`)
                fetchAllotments(selectedHostel)
            } else {
                const err = await res.json()
                alert(`Failed to trigger allotment: ${err.message}`)
            }
        } catch (error: any) {
            console.error(error)
            alert(`Error triggering allotment: ${error.message}`)
        }
    }

    useEffect(() => {
        if (selectedHostel) {
            fetchAllotments(selectedHostel)
        }
    }, [selectedHostel])

    if (isLoading) return <div className="p-8">Loading...</div>

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">Allotment Dashboard</h1>

            <div className="flex items-center gap-4">
                <Select onValueChange={setSelectedHostel} value={selectedHostel}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select Hostel" />
                    </SelectTrigger>
                    <SelectContent>
                        {hostels.map(h => (
                            <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button onClick={handleTriggerAllotment} disabled={!selectedHostel}>
                    Run Allotment Algorithm
                </Button>
            </div>

            {selectedHostel && (
                <Card>
                    <CardHeader>
                        <CardTitle>Allotment Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="p-4 font-medium">Student</th>
                                        <th className="p-4 font-medium">Email</th>
                                        <th className="p-4 font-medium">Room</th>
                                        <th className="p-4 font-medium">Floor</th>
                                        <th className="p-4 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allotments.map((allotment) => (
                                        <tr key={allotment.id} className="border-b">
                                            <td className="p-4">{allotment.student.name}</td>
                                            <td className="p-4">{allotment.student.user.email}</td>
                                            <td className="p-4">{allotment.room.number}</td>
                                            <td className="p-4">{allotment.room.floor.number}</td>
                                            <td className="p-4">{allotment.status}</td>
                                        </tr>
                                    ))}
                                    {allotments.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-4 text-center text-slate-500">No allotments found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
