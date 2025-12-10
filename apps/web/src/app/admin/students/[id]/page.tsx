"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, User } from "lucide-react"

export default function AdminStudentProfilePage() {
    const [student, setStudent] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const params = useParams()
    const router = useRouter()

    useEffect(() => {
        const fetchStudent = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/login')
                return
            }

            try {
                const res = await fetch(`/api/students/admin/${params.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setStudent(data)
                } else {
                    console.error("Failed to fetch student")
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }

        if (params.id) fetchStudent()
    }, [params.id, router])

    if (isLoading) return <div className="p-8">Loading...</div>
    if (!student) return <div className="p-8">Student not found</div>

    const renderField = (label: string, value: any) => (
        <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-slate-500">{label}</span>
            <span className="text-base">{value || '-'}</span>
        </div>
    )

    const photoDoc = student.documents?.find((d: any) => d.kind === 'PHOTO')
    const photoUrl = photoDoc ? photoDoc.fileUrl : null

    // Check termination status
    const isTerminated = student.payments?.some((p: any) => p.purpose === 'HOSTEL_FEE' && p.status === 'REFUNDED') ||
        student.refundRequests?.some((r: any) => r.feeType === 'HOSTEL_FEE' && r.status === 'APPROVED');

    return (
        <div className="p-8 space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
            </Button>

            <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <div className={`h-20 w-20 rounded-full overflow-hidden border-2 flex items-center justify-center ${isTerminated ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-100'
                        }`}>
                        {photoUrl ? (
                            <img src={photoUrl} alt={student.name} className="h-full w-full object-cover" />
                        ) : (
                            <User className={`h-10 w-10 ${isTerminated ? 'text-red-400' : 'text-slate-400'}`} />
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{student.name}</h1>
                        <div className="text-sm text-slate-500 mt-1">{student.uniqueId}</div>
                        {isTerminated && (
                            <span className="inline-block bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded mt-2">
                                TERMINATED
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                        {student.user?.role || 'STUDENT'}
                    </span>
                </div>
            </div>

            {student.allotment?.isPossessed && (
                <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-md flex items-center mb-6">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-medium">
                        Possession Confirmed by Student on {new Date(student.allotment.possessionDate).toLocaleDateString()}
                    </span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {renderField("Unique ID", student.uniqueId)}
                            {renderField("Email", student.user?.email)}
                            {renderField("Phone", student.phone)}
                            {renderField("Gender", student.gender)}
                            {renderField("Category", student.category)}
                            {renderField("Date of Birth", student.dob ? new Date(student.dob).toLocaleDateString() : '-')}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Academic Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            {renderField("Program", student.program)}
                            {renderField("Year", student.year)}
                            {renderField("CGPA", student.cgpa)}
                            {renderField("Backlogs", student.backlogs ? 'Yes' : 'No')}
                        </div>
                    </CardContent>
                </Card>

                <Card className={isTerminated ? "border-red-200 bg-red-50" : ""}>
                    <CardHeader>
                        <CardTitle className={isTerminated ? "text-red-700" : ""}>
                            {isTerminated ? "Termination Status" : "Allotment Status"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isTerminated ? (
                            <div className="p-4 bg-white border border-red-200 rounded-md text-red-700">
                                <h4 className="font-bold text-lg mb-1">Allotment Terminated</h4>
                                <p className="text-sm">
                                    Student has been refunded the Hostel Fee. Allotment is permanently cancelled.
                                </p>
                            </div>
                        ) : student.allotment ? (
                            <div className="grid grid-cols-2 gap-4">
                                {renderField("Hostel", student.allotment.room?.floor?.hostel?.name)}
                                {renderField("Room", student.allotment.room?.number)}
                                {renderField("Floor", student.allotment.room?.floor?.number)}
                                {renderField("Allotted On", new Date(student.allotment.createdAt).toLocaleDateString())}
                            </div>
                        ) : (
                            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
                                No hostel allotted yet.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <p>{student.addressLine1}</p>
                            <p>{student.city}, {student.state} - {student.pincode}</p>
                            <p>{student.country}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {student.payments && student.payments.length > 0 ? (
                            <div className="rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="p-4 font-medium">Purpose</th>
                                            <th className="p-4 font-medium">Amount</th>
                                            <th className="p-4 font-medium">Status</th>
                                            <th className="p-4 font-medium">Ref ID</th>
                                            <th className="p-4 font-medium">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {student.payments.map((payment: any) => (
                                            <tr key={payment.id} className="border-b">
                                                <td className="p-4">{payment.purpose}</td>
                                                <td className="p-4">₹{payment.amount}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-xs font-mono">{payment.txnRef}</td>
                                                <td className="p-4">{new Date(payment.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-lg">
                                No payment history found.
                            </div>
                        )}

                        {student.refundRequests && student.refundRequests.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-lg font-bold mb-3">Refund Requests</h3>
                                <div className="rounded-md border">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 border-b">
                                            <tr>
                                                <th className="p-4 font-medium">Purpose</th>
                                                <th className="p-4 font-medium">Amount</th>
                                                <th className="p-4 font-medium">Status</th>
                                                <th className="p-4 font-medium">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {student.refundRequests.map((req: any) => (
                                                <tr key={req.id} className="border-b">
                                                    <td className="p-4">{req.feeType}</td>
                                                    <td className="p-4">₹{req.amount}</td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            req.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                                req.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">{new Date(req.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
