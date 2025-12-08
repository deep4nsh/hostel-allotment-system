"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminHostelsContent() {
    const [hostels, setHostels] = useState<any[]>([])
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

    if (isLoading) return <div className="p-8">Loading...</div>

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Hostels</h1>
                <Button onClick={() => alert('Create Modal TODO')}>Add Hostel</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {hostels.map((hostel) => (
                    <Link key={hostel.id} href={`/admin/hostels/${hostel.id}`}>
                        <Card className="hover:bg-slate-50 transition-colors cursor-pointer">
                            <CardHeader>
                                <CardTitle>{hostel.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500">
                                    {hostel.floors?.length || 0} Floors
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
