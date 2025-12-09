import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface MockPaymentModalProps {
    isOpen: boolean
    onClose: () => void
    amount: number
    purpose: string
    onSuccess: () => void
}

export function MockPaymentModal({ isOpen, onClose, amount, purpose, onSuccess }: MockPaymentModalProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [step, setStep] = useState<'DETAILS' | 'OTP' | 'SUCCESS'>('DETAILS')

    // Form States
    const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242')
    const [expiry, setExpiry] = useState('12/30')
    const [cvv, setCvv] = useState('123')
    const [otp, setOtp] = useState('')

    const handlePay = async () => {
        setIsLoading(true)
        // Simulate processing delay
        setTimeout(() => {
            setIsLoading(false)
            setStep('OTP')
        }, 1500)
    }

    const handleVerifyOtp = async () => {
        setIsLoading(true)
        const token = localStorage.getItem('token')

        try {
            const res = await fetch('/api/payments/mock-verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    purpose,
                    amount
                })
            })

            if (res.ok) {
                setStep('SUCCESS')
                setTimeout(() => {
                    onSuccess()
                    onClose()
                }, 1500)
            } else {
                alert('Payment failed')
            }
        } catch (error) {
            console.error(error)
            alert('Payment Error')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Complete Payment</DialogTitle>
                    <DialogDescription>
                        Mock Payment Gateway (Test Mode)
                    </DialogDescription>
                </DialogHeader>

                {step === 'DETAILS' && (
                    <div className="grid gap-4 py-4">
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                            <span className="text-sm font-medium text-slate-500">Amount to Pay</span>
                            <span className="text-xl font-bold">₹{amount.toLocaleString()}</span>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="card">Card Number</Label>
                            <Input
                                id="card"
                                value={cardNumber}
                                onChange={e => setCardNumber(e.target.value)}
                                placeholder="0000 0000 0000 0000"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="expiry">Expiry</Label>
                                <Input
                                    id="expiry"
                                    value={expiry}
                                    onChange={e => setExpiry(e.target.value)}
                                    placeholder="MM/YY"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                    id="cvv"
                                    value={cvv}
                                    onChange={e => setCvv(e.target.value)}
                                    type="password"
                                    placeholder="123"
                                />
                            </div>
                        </div>

                        <Button onClick={handlePay} disabled={isLoading} className="w-full mt-2">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Pay ₹{amount.toLocaleString()}
                        </Button>
                    </div>
                )}

                {step === 'OTP' && (
                    <div className="grid gap-4 py-4">
                        <div className="text-center space-y-2">
                            <h3 className="font-semibold">Enter OTP</h3>
                            <p className="text-sm text-slate-500">Sent to mobile ending **89</p>
                        </div>

                        <Input
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
                            placeholder="123456"
                            className="text-center text-lg tracking-widest"
                            maxLength={6}
                        />

                        <Button onClick={handleVerifyOtp} disabled={isLoading || otp.length < 4} className="w-full">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Verify & Pay
                        </Button>
                        <button onClick={() => setStep('DETAILS')} className="text-xs text-slate-500 hover:underline">
                            Cancel
                        </button>
                    </div>
                )}

                {step === 'SUCCESS' && (
                    <div className="py-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-green-600">Payment Successful!</h3>
                        <p className="text-slate-500">Redirecting...</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
