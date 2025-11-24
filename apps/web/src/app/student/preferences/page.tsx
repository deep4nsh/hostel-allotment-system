"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function StudentPreferencesPage() {
    const [hostels, setHostels] = useState<any[]>([])
    const [preferences, setPreferences] = useState<{ floorId: string, rank: number }[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPaid, setIsPaid] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const fetchHostels = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                const res = await fetch('http://localhost:3000/hostels', {
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

    const handleAddPreference = (floorId: string) => {
        if (preferences.find(p => p.floorId === floorId)) return
        setPreferences([...preferences, { floorId, rank: preferences.length + 1 }])
    }

    const handleSubmit = async () => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('http://localhost:3000/students/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ preferences })
            })

            if (res.ok) {
                alert('Preferences saved!')
                router.push('/student/profile')
            } else {
                alert('Failed to save preferences')
            }
        } catch (error) {
            console.error(error)
            alert('Error saving preferences')
        }
    }

    const handlePayment = async () => {
        // Reuse payment logic (copy-paste for now, should be a hook)
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('http://localhost:3000/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: 10000, purpose: 'SEAT_BOOKING' }) // 10k INR
            })
            if (!res.ok) throw new Error('Failed')
            const order = await res.json()

            const options = {
                key: 'test_key_id',
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
                            purpose: 'SEAT_BOOKING',
                            amount: 10000
                        })
                    })
                    if (verifyRes.ok) {
                        alert('Payment Successful')
                        setIsPaid(true)
                    }
                }
            }
            const rzp = new (window as any).Razorpay(options)
            rzp.open()
        } catch (e) {
            console.error(e)
        }
    }

    if (isLoading) return <div className="p-8">Loading...</div>

    if (!isPaid) {
        return (
            <div className="p-8 text-center space-y-4">
                <h1 className="text-2xl font-bold">Seat Booking Fee Required</h1>
                <p>You must pay the seat booking fee of ₹10,000 to submit preferences.</p>
                <Button onClick={handlePayment}>Pay ₹10,000</Button>
                <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">Select Preferences</h1>
            <p className="text-slate-500">Select floors in order of preference.</p>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Available Floors</h2>
                    {hostels.map(hostel => (
                        <Card key={hostel.id}>
                            <CardHeader>
                                <CardTitle>{hostel.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {hostel.floors?.map((floor: any) => (
                                    <div key={floor.id} className="flex justify-between items-center p-2 border rounded">
                                        <span>Floor {floor.number} ({floor.gender})</span>
                                        <Button size="sm" onClick={() => handleAddPreference(floor.id)}>
                                            Add
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Your Preferences</h2>
                    <Card>
                        <CardContent className="p-4 space-y-2">
                            {preferences.length === 0 && <p className="text-slate-400">No preferences selected</p>}
                            {preferences.map((pref, index) => (
                                <div key={pref.floorId} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                    <span className="font-bold mr-4">#{index + 1}</span>
                                    <span className="flex-1">Floor ID: {pref.floorId}</span>
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setPreferences(preferences.filter(p => p.floorId !== pref.floorId))
                                    }}>Remove</Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Button className="w-full" onClick={handleSubmit} disabled={preferences.length === 0}>
                        Submit Preferences
                    </Button>
                </div>
            </div>
        </div>
    )
}
