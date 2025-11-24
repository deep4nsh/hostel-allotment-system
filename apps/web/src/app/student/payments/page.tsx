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
                const res = await fetch('http://localhost:3000/students/me', {
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

    const handlePayMessFee = async () => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('http://localhost:3000/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: 20000, purpose: 'MESS_FEE' }) // 20k INR
            })
            if (!res.ok) throw new Error('Failed')
            const order = await res.json()

            const options = {
                key: 'test_key_id', // Replace with env var
                amount: order.amount,
                currency: order.currency,
                order_id: order.id,
                handler: async function (response: any) {
                    const verifyRes = await fetch('http://localhost:3000/payments/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                            purpose: 'MESS_FEE',
                            amount: 20000
                        })
                    })
                    if (verifyRes.ok) {
                        alert('Payment Successful')
                        window.location.reload()
                    }
                }
            }
            const rzp = new (window as any).Razorpay(options)
            rzp.open()
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
            const res = await fetch('http://localhost:3000/refunds', {
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
                    <CardTitle>Mess Fee</CardTitle>
                </CardHeader>
                <CardContent>
                    {messFeePaid ? (
                        <div className="text-green-600 font-bold text-lg">Paid</div>
                    ) : (
                        <div className="space-y-2">
                            <p>Amount: ₹20,000</p>
                            <Button onClick={handlePayMessFee}>Pay Mess Fee</Button>
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
        </div>
    )
}
