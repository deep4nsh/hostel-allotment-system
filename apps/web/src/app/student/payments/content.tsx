"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MockPaymentModal } from "@/components/payment/MockPaymentModal"

export default function StudentPaymentsContent() {
    const [payments, setPayments] = useState<any[]>([])
    const [allotment, setAllotment] = useState<any>(null)
    const [refundRequests, setRefundRequests] = useState<any[]>([])
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
                const res = await fetch(`/api/students/me?t=${Date.now()}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                })
                if (res.ok) {
                    const data = await res.json()
                    console.log('API Response:', data)
                    console.log('Payments:', data.payments)
                    setPayments(data.payments || [])
                    setRefundRequests(data.refundRequests || [])
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

    const handlePayment = async (purpose: 'MESS_FEE' | 'HOSTEL_FEE') => {
        let amount = 0;
        if (purpose === 'MESS_FEE') {
            amount = 34800;
        } else {
            const calculatedFee = getHostelFee();
            if (!calculatedFee) {
                alert('Hostel fee not generated yet.');
                return;
            }
            amount = calculatedFee;
        }

        setModalConfig({
            isOpen: true,
            amount: amount,
            purpose: purpose
        })
    }

    const handleRequestRefund = async (paymentId: string) => {
        const confirmed = confirm(
            "WARNING: Requesting a refund for Hostel Fee will CANCEL your admission and automatically process a refund for your Mess Fee as well.\n\nAre you sure you want to proceed?"
        )
        if (!confirmed) return

        const reason = "Student requested cancellation via dashboard";

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
                window.location.reload()
            } else {
                const err = await res.json()
                alert(`Failed: ${err.message}`)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleDownloadReceipt = async (paymentId: string) => {
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/payments/${paymentId}/receipt`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })

            if (res.ok) {
                const blob = await res.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `receipt-${paymentId}.pdf`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                a.remove()
            } else {
                console.error('Download failed:', res.status, res.statusText)
                alert('Failed to download receipt')
            }
        } catch (error) {
            console.error('Error downloading receipt:', error)
            alert('Error downloading receipt')
        }
    }

    if (isLoading) return <div className="p-8">Loading...</div>

    const hostelFeePaid = payments.some(p => p.purpose === 'HOSTEL_FEE' && p.status?.toUpperCase() === 'COMPLETED')
    const messFeePaid = payments.some(p => p.purpose === 'MESS_FEE' && p.status?.toUpperCase() === 'COMPLETED')

    // Check for active refunds
    const pendingHostelRefund = refundRequests.find(r => r.feeType === 'HOSTEL_FEE' && ['PENDING', 'APPROVED', 'PROCESSED'].includes(r.status))
    const hostelRefundStatus = pendingHostelRefund?.status

    console.log('Derived Status:', { hostelFeePaid, messFeePaid, payments })

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Payments & Refunds</h1>
                <div className="flex gap-4">
                    <Button
                        variant={hostelFeePaid && messFeePaid ? "default" : "outline"}
                        onClick={() => window.open('/api/students/me/slip', '_blank')}
                    >
                        {hostelFeePaid && messFeePaid ? "Download Allotment Letter" : "Download Allotment Notice"}
                    </Button>
                </div>
            </div>

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
                    {hostelRefundStatus ? (
                        <div className={`font-bold text-lg ${hostelRefundStatus === 'PENDING' ? 'text-yellow-600' : 'text-red-600'}`}>
                            {hostelRefundStatus === 'PENDING' ? 'Refund Request Pending' : 'Refund Processed (Admission Cancelled)'}
                        </div>
                    ) : (
                        hostelFeePaid ? (
                            <div className="text-green-600 font-bold text-lg">Paid</div>
                        ) : (
                            <div className="space-y-2">
                                {hostelFee ? (
                                    <>
                                        <div className="text-3xl font-bold mb-4">₹{hostelFee.toLocaleString()}</div>
                                        <p className="text-slate-500 mb-4">
                                            For Room {allotment?.room?.number} ({allotment?.room?.floor?.hostel?.isAC ? 'AC' : 'Non-AC'} {allotment?.room?.capacity === 1 ? 'Single' : allotment?.room?.capacity === 2 ? 'Double' : 'Triple'})
                                        </p>
                                        <Button onClick={() => handlePayment('HOSTEL_FEE')} className="w-full">Pay Hostel Fee</Button>
                                    </>
                                ) : (
                                    <div className="text-slate-500 italic">
                                        Fee will be generated after room allotment.
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mess Fee</CardTitle>
                </CardHeader>
                <CardContent>
                    {hostelRefundStatus ? (
                        <div className={`font-bold text-lg ${hostelRefundStatus === 'PENDING' ? 'text-yellow-600' : 'text-red-600'}`}>
                            {hostelRefundStatus === 'PENDING' ? 'Refund Request Pending' : 'Refund Processed'}
                        </div>
                    ) : (
                        messFeePaid ? (
                            <div className="text-green-600 font-bold text-lg">Paid</div>
                        ) : (
                            <div className="space-y-2">
                                <div className="text-3xl font-bold mb-4">₹34,800</div>
                                <p className="text-slate-500 mb-4">Advance Mess Fee for the semester.</p>
                                <Button onClick={() => handlePayment('MESS_FEE')} className="w-full">Pay Mess Fee</Button>
                            </div>
                        )
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
                                    <td className="p-4 space-x-2">
                                        {payment.status === 'COMPLETED' && payment.purpose === 'HOSTEL_FEE' && !hostelRefundStatus && (
                                            <Button variant="outline" size="sm" onClick={() => handleRequestRefund(payment.id)}>
                                                Cancel & Refund
                                            </Button>
                                        )}
                                        {payment.status === 'COMPLETED' && payment.purpose === 'HOSTEL_FEE' && hostelRefundStatus && (
                                            <span className="text-yellow-600 font-medium text-xs">Refresh for updates</span>
                                        )}
                                        {payment.status === 'COMPLETED' && ['HOSTEL_FEE', 'MESS_FEE', 'ALLOTMENT_REQUEST'].includes(payment.purpose) && (
                                            <Button variant="outline" size="sm" onClick={() => handleDownloadReceipt(payment.id)}>
                                                Download Receipt
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
