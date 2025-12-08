"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminStudentSearchPage() {
    const [search, setSearch] = useState("")
    const [results, setResults] = useState<any[]>([])
    const router = useRouter()

    const handleSearch = async () => {
        const token = localStorage.getItem('token')
        if (!token) return

        try {
            const params = new URLSearchParams()
            if (search) params.append('search', search)

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

            <div className="flex gap-4">
                <Input
                    placeholder="Search by Name, Email, or Unique ID"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>Search</Button>
            </div>

            <div className="space-y-4">
                {results.map((student) => (
                    <Card key={student.id}>
                        <CardContent className="flex justify-between items-center p-6">
                            <div>
                                <h3 className="font-bold text-lg">{student.name}</h3>
                                <p className="text-sm text-slate-500">{student.uniqueId} | {student.user?.email}</p>
                                <p className="text-sm">
                                    {student.allotment ? (
                                        `Allocated: ${student.allotment.room?.floor?.hostel?.name} - Room ${student.allotment.room?.number}`
                                    ) : (
                                        <span className="text-red-500">Not Allocated</span>
                                    )}
                                </p>
                            </div>
                            <Link href={`/admin/students/${student.userId}`}>
                                <Button variant="outline">View Profile</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
                {results.length === 0 && search && (
                    <p className="text-slate-500">No students found.</p>
                )}
            </div>
        </div>
    )
}
