"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
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
                {results.map((student) => (
                    <Card key={student.id}>
                        <CardContent className="flex justify-between items-center p-6">
                            <div>
                                <h3 className="font-bold text-lg">{student.name}</h3>
                                <p className="text-sm text-slate-500">{student.uniqueId} | {student.user?.email}</p>
                                <p className="text-sm text-slate-600 mt-1">
                                    Year: <span className="font-medium">{student.year || '-'}</span>
                                </p>
                                <p className="text-sm">
                                    {student.allotment ? (
                                        <span className="text-green-700 font-medium">
                                            Allocated: {student.allotment.room?.floor?.hostel?.name} - Room {student.allotment.room?.number}
                                        </span>
                                    ) : (
                                        <span className="text-red-500">Not Allocated</span>
                                    )}
                                </p>
                                <div className="flex gap-2 mt-2">
                                    {student.payments?.some((p: any) => p.purpose === 'HOSTEL_FEE' && p.status === 'COMPLETED') && (
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                            Hostel Paid
                                        </span>
                                    )}
                                    {student.payments?.some((p: any) => p.purpose === 'MESS_FEE' && p.status === 'COMPLETED') && (
                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                                            Mess Paid
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Link href={`/admin/students/${student.userId}`}>
                                <Button variant="outline">View Profile</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
                {results.length === 0 && (search || selectedHostel !== 'all' || selectedYear !== 'all') && (
                    <p className="text-slate-500">No students found matching criteria.</p>
                )}
            </div>
        </div>
    )
}
