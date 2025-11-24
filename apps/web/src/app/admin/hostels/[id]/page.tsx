"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"

export default function AdminHostelDetailsPage() {
    const [hostel, setHostel] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const params = useParams()
    const router = useRouter()

    useEffect(() => {
        const fetchHostel = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                const res = await fetch(`http://localhost:3000/hostels/${params.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setHostel(data)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        if (params.id) fetchHostel()
    }, [params.id, router])

    if (isLoading) return <div className="p-8">Loading...</div>
    if (!hostel) return <div className="p-8">Hostel not found</div>

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{hostel.name}</h1>
                <Button onClick={() => alert('Add Floor Modal TODO')}>Add Floor</Button>
            </div>

            <div className="space-y-4">
                {hostel.floors?.map((floor: any) => (
                    <Card key={floor.id}>
                        <CardHeader>
                            <CardTitle>Floor {floor.number} ({floor.gender})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {floor.rooms?.map((room: any) => (
                                    <div key={room.id} className="p-4 border rounded-lg text-center">
                                        <div className="font-bold">Room {room.number}</div>
                                        <div className="text-sm text-slate-500">
                                            Cap: {room.capacity} | Occ: {room.occupancy}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
