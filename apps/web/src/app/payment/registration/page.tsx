"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegistrationPaymentPage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handlePayment = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login') // Redirect to main login
                return
            }

            // --- MOCK PAYMENT FLOW ---
            // Instead of calling Razorpay, we directly tell the backend to record a successful payment.

            const res = await fetch('/api/payments/mock-verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    purpose: 'REGISTRATION',
                    amount: 1000 // Fixed amount for registration
                })
            })

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Mock payment failed');
            }

            alert('Payment Successful (Mock Mode)')
            router.push('/dashboard') // Redirect to dashboard

        } catch (error: any) {
            console.error(error)
            alert(`Payment Error: ${error.message}`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Registration Fee</CardTitle>
                    <CardDescription>
                        Pay the non-refundable registration fee to proceed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center p-4 bg-white rounded-lg border">
                        <span className="font-medium">Amount</span>
                        <span className="text-xl font-bold">₹1000.00</span>
                    </div>
                    <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md">
                        <strong>Mock Mode:</strong> Clicking "Pay Now" will instantly simulate a successful transaction.
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handlePayment} disabled={isLoading}>
                        {isLoading ? "Processing..." : "Pay Now (Mock)"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
