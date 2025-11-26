"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AnalyticsPage() {
    const [stats, setStats] = useState<any>(null)
    const [health, setHealth] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                // Fetch Analytics
                const statsRes = await fetch('http://localhost:3001/ops/analytics', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (statsRes.ok) setStats(await statsRes.json())

                // Fetch Health
                const healthRes = await fetch('http://localhost:3001/ops/health')
                if (healthRes.ok) setHealth(await healthRes.json())

            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [router])

    const handleBackup = async () => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('http://localhost:3001/ops/backup', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                alert(`Backup created at: ${data.path}`)
            } else {
                alert('Backup failed')
            }
        } catch (error) {
            console.error(error)
        }
    }

    if (isLoading) return <div className="p-8">Loading...</div>

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">System Analytics</h1>
                <div className="flex gap-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-bold ${health?.status === 'UP' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        System Status: {health?.status || 'UNKNOWN'}
                    </div>
                    <Button onClick={handleBackup} variant="outline">Trigger Backup</Button>
                </div>
            </div>

            {stats && (
                <div className="grid md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalStudents}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Rooms Allotted</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.allotments}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Pending Refunds</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.refundRequests}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Operational Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 mb-4">
                        Use these controls to manage system operations. Backups are stored locally in the server's `backups/` directory.
                    </p>
                    <Button onClick={handleBackup}>Run Database Backup Now</Button>
                </CardContent>
            </Card>
        </div>
    )
}
