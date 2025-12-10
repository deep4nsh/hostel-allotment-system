"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { User } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminStudentSearchPage() {
    const [search, setSearch] = useState("")
    const [selectedHostel, setSelectedHostel] = useState<string>("all")
    const [selectedYear, setSelectedYear] = useState<string>("all")
    const [hostels, setHostels] = useState<any[]>([])
    const [results, setResults] = useState<any[]>([])
    const router = useRouter()

    useEffect(() => {
        const fetchHostels = async () => {
            const token = localStorage.getItem('token')
            if (!token) return

            try {
                const res = await fetch('/api/hostels', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (res.ok) {
                    const data = await res.json()
                    setHostels(data)
                }
            } catch (error) {
                console.error(error)
            }
        }
        fetchHostels()
    }, [])

    const handleSearch = async () => {
        const token = localStorage.getItem('token')
        if (!token) return

        try {
            const params = new URLSearchParams()
            if (search) params.append('search', search)
            if (selectedHostel && selectedHostel !== 'all') params.append('hostelId', selectedHostel)
            if (selectedYear && selectedYear !== 'all') params.append('year', selectedYear)

            const res = await fetch(`/api/students/admin/search?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setResults(data)
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">Student Search</h1>

            <div className="flex flex-col md:flex-row gap-4">
                <Input
                    className="md:w-1/3"
                    placeholder="Search by Name, Email, or Unique ID"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />

                <Select onValueChange={setSelectedHostel} value={selectedHostel}>
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="All Hostels" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Hostels</SelectItem>
                        {hostels.map(h => (
                            <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select onValueChange={setSelectedYear} value={selectedYear}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Years" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                        <SelectItem value="5">5th Year</SelectItem>
                    </SelectContent>
                </Select>

                <Button onClick={handleSearch}>Search</Button>
            </div>

            <div className="space-y-4">
                {results.map((student) => {
                    const photoDoc = student.documents?.find((d: any) => d.kind === 'PHOTO');
                    const photoUrl = photoDoc ? photoDoc.fileUrl : null;

                    return (
                        <Card key={student.id}>
                            <CardContent className="flex justify-between items-center p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full overflow-hidden border bg-slate-100 flex items-center justify-center shrink-0">
                                        {photoUrl ? (
                                            <img src={photoUrl} alt={student.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <User className="h-8 w-8 text-slate-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{student.name}</h3>
                                        <p className="text-sm text-slate-500">{student.uniqueId} | {student.user?.email}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="text-sm text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                Year: {student.year || '-'}
                                            </span>
                                            {student.allotment ? (
                                                <span className="text-green-700 font-medium text-sm bg-green-50 px-2 py-0.5 rounded border border-green-200">
                                                    {student.allotment.room?.floor?.hostel?.name} - {student.allotment.room?.number}
                                                </span>
                                            ) : (
                                                <span className="text-red-500 text-sm bg-red-50 px-2 py-0.5 rounded border border-red-200">Not Allocated</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2 mt-1">
                                            {student.payments?.some((p: any) => p.purpose === 'HOSTEL_FEE' && p.status === 'COMPLETED') && (
                                                <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase">
                                                    Hostel Fee Paid
                                                </span>
                                            )}
                                            {student.payments?.some((p: any) => p.purpose === 'MESS_FEE' && p.status === 'COMPLETED') && (
                                                <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase">
                                                    Mess Fee Paid
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Link href={`/admin/students/${student.userId}`}>
                                    <Button variant="outline">View Profile</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )
                })}
                {results.length === 0 && (search || selectedHostel !== 'all' || selectedYear !== 'all') && (
                    <p className="text-slate-500">No students found matching criteria.</p>
                )}
            </div>
        </div>
    )
}
