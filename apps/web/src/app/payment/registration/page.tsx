"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import Script from "next/script"
import { useRouter } from "next/navigation"

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function RegistrationPaymentPage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handlePayment = async () => {
        setIsLoading(true)
        try {
            // 1. Create Order
            const token = localStorage.getItem('token') // Assuming token is stored here
            if (!token) {
                router.push('/auth/login')
                return
            }

            const res = await fetch('http://localhost:3000/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    purpose: 'REGISTRATION'
                })
            })

            if (!res.ok) throw new Error('Failed to create order')
            const order = await res.json()

            // 2. Open Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
                amount: order.amount,
                currency: order.currency,
                name: "DTU Hostel",
                description: "Registration Fee",
                order_id: order.id,
                handler: async function (response: any) {
                    // 3. Verify Payment
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
                            purpose: 'REGISTRATION',
                            amount: 1000 // Fixed amount matching backend
                        })
                    })

                    if (verifyRes.ok) {
                        alert('Payment Successful!')
                        router.push('/student/profile')
                    } else {
                        alert('Payment Verification Failed')
                    }
                },
                prefill: {
                    name: "Student Name", // TODO: Get from profile
                    email: "student@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error(error)
            alert('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
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
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={handlePayment} disabled={isLoading}>
                        {isLoading ? "Processing..." : "Pay Now"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
