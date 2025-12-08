"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminRefundsContent() {
    const [requests, setRequests] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    const fetchRequests = async () => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }

        try {
            const res = await fetch('/api/refunds', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setRequests(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [router])

    const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch(`/api/refunds/${id}/decide`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ decision })
            })
            if (res.ok) {
                alert(`Refund ${decision}`)
                fetchRequests()
            } else {
                alert('Failed to process refund')
            }
        } catch (error) {
            console.error(error)
        }
    }

    if (isLoading) return <div className="p-8">Loading...</div>

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">Refund Requests</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-4">Student</th>
                                <th className="p-4">Fee Type</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id} className="border-b">
                                    <td className="p-4">
                                        <div>{req.student.name}</div>
                                        <div className="text-xs text-slate-500">{req.student.user.email}</div>
                                    </td>
                                    <td className="p-4">{req.feeType}</td>
                                    <td className="p-4">₹{req.amount}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="p-4 space-x-2">
                                        {req.status === 'PENDING' && (
                                            <>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleDecision(req.id, 'APPROVED')}>
                                                    Approve
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleDecision(req.id, 'REJECTED')}>
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-slate-500">No refund requests found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    )
}
