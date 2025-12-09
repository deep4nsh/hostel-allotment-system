"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MockPaymentModal } from "@/components/payment/MockPaymentModal"

export default function StudentPaymentsContent() {
    const [payments, setPayments] = useState<any[]>([])
    const [allotment, setAllotment] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, amount: number, purpose: string }>({
        isOpen: false, amount: 0, purpose: ''
    })
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            try {
                const res = await fetch('/api/students/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setPayments(data.payments || [])
                    setAllotment(data.allotment)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [router])

    const getHostelFee = () => {
        if (!allotment) return null
        const { room } = allotment
        const capacity = room.capacity
        const isAC = room.floor?.hostel?.isAC

        if (isAC && capacity === 3) return 72000
        if (capacity === 1) return 60000
        if (capacity === 2) return 56000
        return 52000 // Triple Non-AC (or fallback)
    }

    const hostelFee = getHostelFee()
    const hostelFeePaid = payments.some(p => p.purpose === 'HOSTEL_FEE' && p.status === 'COMPLETED')

    const handlePayment = async (purpose: 'MESS_FEE' | 'HOSTEL_FEE') => {
        // We still fetch order to ensure backend validation/creation if strict, 
        // but for mock we primarily just need the amount. 
        // We can trust the frontend calculated amount for display, but let's be safe and ask connection.
        // Or simpler: just use the amount we know.

        // Actually, let's fetch 'create-order' just to get the exact amount the backend expects.
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ purpose })
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.message || 'Failed')
            }
            const order = await res.json()
            const amountInRupees = order.amount / 100 // Backend returns paise

            setModalConfig({
                isOpen: true,
                amount: amountInRupees,
                purpose: purpose
            })

        } catch (e: any) {
            console.error(e)
            alert(e.message || 'Payment initiation failed')
        }
    }

    const handleRequestRefund = async (paymentId: string) => {
        const reason = prompt('Enter reason for refund:')
        if (!reason) return

        const token = localStorage.getItem('token')
        try {
            const res = await fetch('/api/refunds', {
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
                const err = await res.json()
                alert(`Failed: ${err.message}`)
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

            <MockPaymentModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                amount={modalConfig.amount}
                purpose={modalConfig.purpose}
                onSuccess={() => window.location.reload()}
            />

            <Card>
                <CardHeader>
                    <CardTitle>Hostel Fee</CardTitle>
                </CardHeader>
                <CardContent>
                    {hostelFeePaid ? (
                        <div className="text-green-600 font-bold text-lg">Paid</div>
                    ) : (
                        <div className="space-y-2">
                            {hostelFee ? (
                                <>
                                    <div className="text-3xl font-bold mb-4">₹{hostelFee.toLocaleString()}</div>
                                    <p className="text-slate-500 mb-4">
                                        For Room {allotment.room.number} ({allotment.room.floor?.hostel?.isAC ? 'AC' : 'Non-AC'} {allotment.room.capacity === 1 ? 'Single' : allotment.room.capacity === 2 ? 'Double' : 'Triple'})
                                    </p>
                                    <Button onClick={() => handlePayment('HOSTEL_FEE')} className="w-full">Pay Hostel Fee</Button>
                                </>
                            ) : (
                                <div className="text-slate-500 italic">
                                    Fee will be generated after room allotment.
                                </div>
                            )}
                        </div>
                    )}
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
                            <div className="text-3xl font-bold mb-4">₹34,800</div>
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
