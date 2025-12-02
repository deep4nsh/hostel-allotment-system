"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"

export default function StudentPaymentsPage() {
    const [payments, setPayments] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchPayments = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                const res = await fetch('http://localhost:4000/students/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setPayments(data.payments || [])
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchPayments()
    }, [router])

    const handlePayment = async (purpose: 'MESS_FEE' | 'HOSTEL_FEE') => {
        const token = localStorage.getItem('token')
        try {
            // 1. Get Amount
            const res = await fetch('http://localhost:4000/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ purpose })
            })
            if (!res.ok) throw new Error('Failed')
            const order = await res.json()
            const amountInRupees = order.amount / 100

            // 2. Mock Verify
            const verifyRes = await fetch('http://localhost:4000/payments/mock-verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    purpose,
                    amount: amountInRupees
                })
            })
            if (verifyRes.ok) {
                alert('Payment Successful (Mock)')
                window.location.reload()
            }
        } catch (e) {
            console.error(e)
            alert('Payment initiation failed')
        }
    }

    const handleRequestRefund = async (paymentId: string) => {
        const reason = prompt('Enter reason for refund:')
        if (!reason) return

        const token = localStorage.getItem('token')
        try {
            const res = await fetch('http://localhost:4000/refunds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ paymentId, reason })
            })
            if (res.ok) {
                alert('Refund requested successfully')
            } else {
                alert('Failed to request refund')
            }
        } catch (error) {
            console.error(error)
        }
    }

    if (isLoading) return <div className="p-8">Loading...</div>

    const messFeePaid = payments.some(p => p.purpose === 'MESS_FEE' && p.status === 'COMPLETED')

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">Payments & Refunds</h1>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <Card>
                <CardHeader>
                    <CardTitle>Hostel Fee</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="text-3xl font-bold mb-4">Dynamic</div>
                        <p className="text-slate-500 mb-4">Based on Room Capacity (Single/Double/Triple)</p>
                        <Button onClick={() => handlePayment('HOSTEL_FEE')} className="w-full">Pay Hostel Fee</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mess Fee</CardTitle>
                </CardHeader>
                <CardContent>
                    {messFeePaid ? (
                        <div className="text-green-600 font-bold text-lg">Paid</div>
                    ) : (
                        <div className="space-y-2">
                            <div className="text-3xl font-bold mb-4">₹20,000</div>
                            <p className="text-slate-500 mb-4">Advance Mess Fee for the semester.</p>
                            <Button onClick={() => handlePayment('MESS_FEE')} className="w-full">Pay Mess Fee</Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-4">Purpose</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => (
                                <tr key={payment.id} className="border-b">
                                    <td className="p-4">{payment.purpose}</td>
                                    <td className="p-4">₹{payment.amount}</td>
                                    <td className="p-4">{payment.status}</td>
                                    <td className="p-4">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        {payment.status === 'COMPLETED' && (
                                            <Button variant="outline" size="sm" onClick={() => handleRequestRefund(payment.id)}>
                                                Request Refund
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div >
    )
}
