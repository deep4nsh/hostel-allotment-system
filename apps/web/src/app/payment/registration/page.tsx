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
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            // 1. Get Amount (via Create Order or hardcoded)
            // We'll use create-order to ensure we get the backend-validated amount logic if needed, 
            // or just hardcode since we know it. Let's use create-order to be safe and consistent.
            const res = await fetch('http://localhost:3001/payments/create-order', {
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
            const amountInRupees = order.amount / 100

            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: "INR",
                name: "Hostel Allotment System",
                description: "Registration Fee",
                order_id: order.id,
                handler: async function (response: any) {
                    try {
                        // 3. Verify Payment on Backend
                        const verifyRes = await fetch('http://localhost:3001/payments/verify', {
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
                                amount: amountInRupees
                            })
                        })

                        if (verifyRes.ok) {
                            alert('Payment Successful')
                            router.push('/student/profile')
                        } else {
                            alert('Payment Verification Failed')
                        }
                    } catch (error) {
                        console.error(error)
                        alert('Verification Error')
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
            rzp1.on('payment.failed', function (response: any) {
                alert(response.error.description);
            });
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
