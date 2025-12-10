import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"

interface AllotmentJourneyProps {
    profile: any
    waitlist: any
}

export function AllotmentJourney({ profile, waitlist }: AllotmentJourneyProps) {
    if (!profile) return null

    // 1. Profile Complete
    const isProfileComplete = profile.isProfileFrozen

    // 2. Documents Uploaded
    const requiredDocs = ['ADMISSION_LETTER', 'AADHAR_FRONT', 'AADHAR_BACK', 'PHOTO', 'SIGNATURE']
    const uploadedDocs = profile.documents?.map((d: any) => d.kind) || []
    const isDocsComplete = requiredDocs.every(d => uploadedDocs.includes(d))

    // 3. Request Submitted (Paid Token Fee)
    const isRequestSubmitted = !!waitlist || profile.payments?.some((p: any) => p.purpose === 'ALLOTMENT_REQUEST' && p.status === 'COMPLETED')

    // 4. Allotment Granted
    const isAllotted = !!profile.allotment

    // 5. Fees Paid
    const isHostelFeePaid = profile.payments?.some((p: any) => p.purpose === 'HOSTEL_FEE' && p.status === 'COMPLETED')
    const isMessFeePaid = profile.payments?.some((p: any) => p.purpose === 'MESS_FEE' && p.status === 'COMPLETED')
    const isFeesPaid = isHostelFeePaid && isMessFeePaid

    // 6. Possession Taken
    const isPossessed = profile.allotment?.isPossessed

    const steps = [
        {
            id: 1,
            title: "Complete Profile",
            description: "Fill in all your personal and academic details.",
            isCompleted: isProfileComplete,
            isCurrent: !isProfileComplete,
            link: "/student/profile",
            actionText: "Go to Profile"
        },
        {
            id: 2,
            title: "Upload Documents",
            description: "Upload required documents (Admission Letter, Aadhar, Photo, Signature).",
            isCompleted: isDocsComplete,
            isCurrent: isProfileComplete && !isDocsComplete,
            link: "/student/documents",
            actionText: "Upload Documents"
        },
        {
            id: 3,
            title: "Request Allotment",
            description: "Pay the token fee (₹1,000) and join the waitlist.",
            isCompleted: isRequestSubmitted,
            isCurrent: isProfileComplete && isDocsComplete && !isRequestSubmitted,
            link: "/student/allotment",
            actionText: "Request Allotment"
        },
        {
            id: 4,
            title: "Wait for Allotment",
            description: `Your waitlist position: ${waitlist?.position ?? 'N/A'}. Wait for admin allocation.`,
            isCompleted: isAllotted,
            isCurrent: isRequestSubmitted && !isAllotted,
            link: "/student/allotment", // Stay on allotment page to check status
            actionText: "Check Status"
        },
        {
            id: 5,
            title: "Pay Hostel & Mess Fees",
            description: "Once allotted, pay your hostel and mess fees to secure the room.",
            isCompleted: isFeesPaid,
            isCurrent: isAllotted && !isFeesPaid,
            link: "/student/payments",
            actionText: "Pay Fees"
        },
        {
            id: 6,
            title: "Confirm Possession",
            description: "Physically occupy the room and acknowledge possession.",
            isCompleted: isPossessed,
            isCurrent: isAllotted && isFeesPaid && !isPossessed,
            link: "/student/profile", // Possession is on the dashboard/profile
            actionText: "Acknowledge"
        }
    ]

    // Find the index of the current step to highlight progress
    const currentStepIndex = steps.findIndex(s => s.isCurrent)

    return (
        <Card className="mb-8 border-blue-200 shadow-sm">
            <CardHeader className="bg-blue-50/40 pb-4">
                <CardTitle className="text-xl text-blue-900 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Your Allotment Journey
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200" />

                    <div className="space-y-8">
                        {steps.map((step, index) => {
                            // Determine state: completed, current, or pending
                            let state = 'pending'
                            if (step.isCompleted) state = 'completed'
                            else if (step.isCurrent) state = 'current'

                            // For "Wait for Allotment", if we are past it (allotted), it's completed.
                            // If we are at it, it's current. 
                            // My logic above handles this.

                            return (
                                <div key={step.id} className="relative flex gap-4">
                                    {/* Icon */}
                                    <div className="relative z-10 flex-none">
                                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center border-4 
                            ${state === 'completed' ? 'bg-green-100 border-green-50 text-green-600' :
                                                state === 'current' ? 'bg-blue-600 border-blue-100 text-white shadow-md' :
                                                    'bg-white border-slate-100 text-slate-300'}
                        `}>
                                            {state === 'completed' ? <CheckCircle2 className="w-6 h-6" /> :
                                                state === 'current' ? <span className="font-bold">{step.id}</span> :
                                                    <Circle className="w-6 h-6" />}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className={`flex-1 pt-1 ${state === 'pending' ? 'opacity-50' : 'opacity-100'}`}>
                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                            <div>
                                                <h3 className={`font-semibold text-lg ${state === 'current' ? 'text-blue-700' : 'text-slate-900'}`}>
                                                    {step.title}
                                                </h3>
                                                <p className="text-slate-500 text-sm mt-1 max-w-md">
                                                    {step.description}
                                                </p>
                                            </div>

                                            {/* Action Button */}
                                            {state !== 'completed' && state !== 'pending' && (
                                                <Link href={step.link}>
                                                    <Button size="sm" className={state === 'current' ? 'animate-pulse' : ''}>
                                                        {step.actionText} <ArrowRight className="w-4 h-4 ml-1" />
                                                    </Button>
                                                </Link>
                                            )}
                                            {/* Show View Button for completed steps too if accessible */}
                                            {state === 'completed' && step.id !== 6 && (
                                                <Link href={step.link}>
                                                    <Button variant="ghost" size="sm" className="text-slate-400">
                                                        View
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
