"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { createPaymentOrder, mockVerifyPayment, joinWaitlist, getWaitlistPosition } from "@/lib/api"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export default function AllotmentPageContent() {
    const [status, setStatus] = useState<'LOADING' | 'NOT_PAID' | 'PAID_NOT_JOINED' | 'WAITLISTED' | 'ACTIVE' | 'ALLOTTED'>('LOADING')
    const [position, setPosition] = useState<number | null>(null)
    const [allotment, setAllotment] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const [documents, setDocuments] = useState<any[]>([])
    const [missingDocs, setMissingDocs] = useState<string[]>([])

    useEffect(() => {
        checkStatus()
        checkDocuments()
    }, [])

    const checkDocuments = async () => {
        try {
            const docs = await import("@/lib/api").then(m => m.getMyDocuments())
            setDocuments(docs)
            const required = ['ADMISSION_LETTER', 'AADHAR_FRONT', 'AADHAR_BACK', 'PHOTO', 'SIGNATURE']
            const uploaded = docs.map((d: any) => d.kind)
            const missing = required.filter(r => !uploaded.includes(r))
            setMissingDocs(missing)
        } catch (e) {
            console.error("Failed to fetch documents", e)
        }
    }

    const checkStatus = async () => {
        try {
            const res = await getWaitlistPosition()
            if (res.status === 'ALLOTTED') {
                setStatus('ALLOTTED')
                setAllotment(res.allotment)
            } else if (res.status === 'WAITLISTED' || res.status === 'ACTIVE') {
                setStatus('WAITLISTED')
                setPosition(res.position)
            } else if (res.status === 'PAID_NOT_JOINED') {
                setStatus('PAID_NOT_JOINED')
            } else {
                setStatus('NOT_PAID')
            }
        } catch (e) {
            console.error(e)
            setStatus('NOT_PAID')
        }
    }

    const handleHostelFeePayment = async () => {
        setLoading(true)
        try {
            // Mock Hostel Fee Payment (e.g. 50k)
            await mockVerifyPayment('HOSTEL_FEE', 50000)
            await checkStatus() // Reload to see confirmed status
            alert('Hostel Fee Paid Successfully! Allotment Confirmed.')
        } catch (e: any) {
            console.error(e)
            alert(e.message || 'Payment failed')
        } finally {
            setLoading(false)
        }
    }

    const handlePaymentAndJoin = async () => {
        if (missingDocs.length > 0) {
            alert(`Please upload missing documents: ${missingDocs.join(', ')}`)
            return
        }
        setLoading(true)
        try {
            // 1. Create Order (Skipped for Mock)
            // const order = await createPaymentOrder('ALLOTMENT_REQUEST')
            const amountInRupees = 1000

            // 2. Mock Verify (In real app, Razorpay modal here)
            await mockVerifyPayment('ALLOTMENT_REQUEST', amountInRupees)

            // 3. Join Waitlist
            await joinWaitlist()

            await checkStatus()
            alert('Payment Successful & Request Submitted!')
        } catch (e: any) {
            console.error(e)
            alert(e.message || 'Process failed')
        } finally {
            setLoading(false)
        }
    }

    const handleJoinOnly = async () => {
        if (missingDocs.length > 0) {
            alert(`Please upload missing documents: ${missingDocs.join(', ')}`)
            return
        }
        setLoading(true)
        try {
            await joinWaitlist()
            await checkStatus()
        } catch (e: any) {
            console.error(e)
            alert(e.message || 'Failed to join waitlist')
        } finally {
            setLoading(false)
        }
    }

    if (status === 'LOADING') {
        return <div className="flex justify-center items-center h-[calc(100vh-4rem)]"><Loader2 className="animate-spin" /></div>
    }

    if (status === 'ALLOTTED' && allotment) {
        const today = new Date();
        const validTill = new Date(allotment.validTill);
        const isExpired = today > validTill;
        const isPossessed = allotment.isPossessed;

        const daysLeft = Math.ceil((validTill.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return (
            <div className="container mx-auto p-8 max-w-3xl space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Allotment Status</h1>
                    <p className="text-slate-500">View your room details and complete the process.</p>
                </div>

                <Card className={isExpired && !isPossessed ? "border-red-500" : "border-green-500"}>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            {isPossessed ? (
                                <>
                                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                                    <span>Allotment Confirmed</span>
                                </>
                            ) : isExpired ? (
                                <span className="text-red-600">Allotment Expired</span>
                            ) : (
                                <span>Provisional Allotment</span>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {isPossessed ? "You have successfully secured this room." : isExpired ? "You failed to pay fees in time." : "Please pay the hostel fee to secure your room."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-500">Hostel</p>
                                <p className="text-lg font-semibold">{allotment.room?.floor?.hostel?.name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Room Number</p>
                                <p className="text-2xl font-bold">{allotment.room?.number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Floor</p>
                                <p className="font-medium">{allotment.room?.floor?.number === 0 ? "Ground" : allotment.room?.floor?.number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Type</p>
                                <p className="font-medium">{allotment.room?.capacity === 1 ? 'Single' : allotment.room?.capacity === 2 ? 'Double' : 'Triple'} Seater</p>
                            </div>
                        </div>

                        {!isPossessed && !isExpired && (
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start space-x-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-yellow-800">Payment Deadline</h4>
                                    <p className="text-sm text-yellow-700">
                                        You must pay the hostel fee by <strong>{validTill.toLocaleDateString()}</strong> ({daysLeft} days left).
                                        Failure to pay will result in cancellation.
                                    </p>
                                </div>
                            </div>
                        )}

                        {!isPossessed && !isExpired && (
                            <div className="pt-4">
                                <Button size="lg" className="w-full" onClick={handleHostelFeePayment} disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Pay Hostel Fee & Confirm
                                </Button>
                            </div>
                        )}

                        {isPossessed && (
                            <div className="bg-green-50 text-green-800 p-4 rounded-lg text-center">
                                Possession Granted on {new Date(allotment.possessionDate).toLocaleDateString()}
                            </div>
                        )}

                        {isExpired && !isPossessed && (
                            <div className="bg-red-50 text-red-800 p-4 rounded-lg text-center">
                                This allotment has been cancelled due to non-payment.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-8 max-w-3xl space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Hostel Allotment Request</h1>
                <p className="text-slate-500">Request a hostel seat by paying the token fee and joining the priority waitlist.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Request Status</CardTitle>
                    <CardDescription>Current status of your allotment request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {status === 'WAITLISTED' ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                            <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold">Request Submitted</h3>
                                <p className="text-slate-500">You are currently in the waitlist.</p>
                            </div>
                            <div className="bg-slate-100 px-6 py-3 rounded-lg">
                                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Current Position</p>
                                <p className="text-4xl font-bold text-blue-600">#{position}</p>
                            </div>
                            <p className="text-sm text-slate-400 max-w-md">
                                Priority is determined by your distance from DTU. Students living further away get higher priority.
                            </p>
                        </div>
                    ) : status === 'PAID_NOT_JOINED' ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                            <div className="h-16 w-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
                                <AlertCircle className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold">Payment Complete</h3>
                                <p className="text-slate-500">You have paid the fee but haven't joined the waitlist yet.</p>
                            </div>
                            <Button size="lg" onClick={handleJoinOnly} disabled={loading || missingDocs.length > 0}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Join Waitlist Now
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900 mb-2">Process</h4>
                                <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                                    <li>Pay a refundable token fee of ₹1,000.</li>
                                    <li>Your request will be added to the priority waitlist.</li>
                                    <li>Waitlist is sorted based on distance from DTU (Highest distance = Top priority).</li>
                                    <li>Once allotted, you will be notified to pay the hostel fee.</li>
                                </ol>
                            </div>

                            <div className="flex flex-col items-center space-y-4 pt-4">
                                <div className="text-center">
                                    <p className="text-sm text-slate-500 mb-1">Token Fee Amount</p>
                                    <p className="text-3xl font-bold">₹1,000</p>
                                </div>
                                <Button size="lg" className="w-full max-w-sm" onClick={handlePaymentAndJoin} disabled={loading || missingDocs.length > 0}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Pay & Request Allotment
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
