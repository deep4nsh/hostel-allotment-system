"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

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

    return (
        <div className="p-8 space-y-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
            </Button>

            <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold">{student.name}</h1>
                <div className="text-right">
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                        {student.user?.role || 'STUDENT'}
                    </span>
                </div>
            </div>

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

                <Card>
                    <CardHeader>
                        <CardTitle>Allotment Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {student.allotment ? (
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
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
