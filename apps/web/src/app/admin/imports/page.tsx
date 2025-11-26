"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminImportsPage() {
    const [file, setFile] = useState<File | null>(null)
    const [results, setResults] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setIsLoading(true)
        const formData = new FormData()
        formData.append('file', file)

        const token = localStorage.getItem('token')
        try {
            const res = await fetch('http://localhost:3001/imports/students', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (res.ok) {
                const data = await res.json()
                setResults(data)
                alert('Import processed!')
            } else {
                alert('Import failed')
            }
        } catch (error) {
            console.error(error)
            alert('Error uploading file')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">Bulk Import Students</h1>
            <p className="text-slate-500">Upload an Excel file (.xlsx) with columns: Name, Email, Phone, Gender, Rank</p>

            <Card>
                <CardHeader>
                    <CardTitle>Upload File</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <input type="file" accept=".xlsx" onChange={handleFileChange} className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100
          "/>
                    <Button onClick={handleUpload} disabled={!file || isLoading}>
                        {isLoading ? 'Uploading...' : 'Upload & Process'}
                    </Button>
                </CardContent>
            </Card>

            {results && (
                <Card>
                    <CardHeader>
                        <CardTitle>Import Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex gap-4">
                            <div className="text-green-600 font-bold">Success: {results.success}</div>
                            <div className="text-red-600 font-bold">Failed: {results.failed}</div>
                        </div>
                        {results.errors.length > 0 && (
                            <div className="mt-4 p-4 bg-red-50 rounded text-sm text-red-700 max-h-60 overflow-y-auto">
                                <h4 className="font-semibold mb-2">Errors:</h4>
                                <ul className="list-disc pl-4 space-y-1">
                                    {results.errors.map((err: string, i: number) => (
                                        <li key={i}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
