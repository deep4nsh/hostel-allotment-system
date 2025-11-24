"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function DocumentsPage() {
    const [uploading, setUploading] = useState<string | null>(null)
    const [ocrResult, setOcrResult] = useState<any>(null)
    const router = useRouter()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'PHOTO' | 'SIGNATURE' | 'ADMISSION_LETTER') => {
        if (!e.target.files || !e.target.files[0]) return
        const file = e.target.files[0]
        setUploading(type)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', type)

        const token = localStorage.getItem('token')
        try {
            const res = await fetch('http://localhost:3000/documents/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })
            if (res.ok) {
                alert(`${type} uploaded successfully!`)
            } else {
                alert('Upload failed')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setUploading(null)
        }
    }

    const handleScan = async () => {
        const token = localStorage.getItem('token')
        try {
            const res = await fetch('http://localhost:3000/documents/ocr', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (res.ok) {
                const data = await res.json()
                setOcrResult(data.data)
                alert('OCR Scan Complete! Profile data extracted.')
            } else {
                alert('OCR failed')
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold">Document Uploads</h1>
            <p className="text-slate-500">Please upload the required documents. Use "Scan" on Admission Letter to autofill details.</p>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Photo */}
                <Card>
                    <CardHeader>
                        <CardTitle>Passport Photo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUpload(e, 'PHOTO')}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        />
                        {uploading === 'PHOTO' && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
                    </CardContent>
                </Card>

                {/* Signature */}
                <Card>
                    <CardHeader>
                        <CardTitle>Signature</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUpload(e, 'SIGNATURE')}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        />
                        {uploading === 'SIGNATURE' && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}
                    </CardContent>
                </Card>

                {/* Admission Letter */}
                <Card>
                    <CardHeader>
                        <CardTitle>Admission Letter</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <input
                            type="file"
                            accept=".pdf,.jpg,.png"
                            onChange={(e) => handleUpload(e, 'ADMISSION_LETTER')}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        />
                        {uploading === 'ADMISSION_LETTER' && <p className="text-sm text-blue-600 mt-2">Uploading...</p>}

                        <div className="border-t pt-4">
                            <Button onClick={handleScan} variant="outline" className="w-full">
                                Scan & Autofill
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {ocrResult && (
                <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                        <CardTitle className="text-green-800">Extracted Data</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-green-700">
                        <p><strong>Name:</strong> {ocrResult.name}</p>
                        <p><strong>Rank:</strong> {ocrResult.rank}</p>
                        <p><strong>Category:</strong> {ocrResult.category}</p>
                        <p><strong>App No:</strong> {ocrResult.applicationNo}</p>
                        <p className="text-xs mt-2 text-green-600">* This data would be autofilled into your profile.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
