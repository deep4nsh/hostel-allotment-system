"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, UploadCloud } from "lucide-react";

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    // Form States
    const [guardianData, setGuardianData] = useState({
        name: "",
        phone: "",
        address: "",
        foodPreference: "VEG"
    });

    const [bankData, setBankData] = useState({
        accountNo: "",
        ifsc: "",
        holderName: "",
        type: "PERSONAL"
    });

    // Fetch Profile on Mount
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return router.push('/auth/login');

            try {
                // Fetch Profile
                const res = await fetch('http://localhost:4000/students/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    // Pre-fill if exists
                    setGuardianData({
                        name: data.guardianName || "",
                        phone: data.guardianPhone || "",
                        address: data.guardianAddress || "",
                        foodPreference: data.foodPreference || "VEG"
                    });
                    setBankData({
                        accountNo: data.bankAccountNo || "",
                        ifsc: data.bankIfsc || "",
                        holderName: data.bankHolderName || "",
                        type: data.bankAccountType || "PERSONAL"
                    });
                }

                // Fetch Documents
                const docRes = await fetch('http://localhost:4000/documents/my', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (docRes.ok) {
                    const docs = await docRes.json();
                    setUploadedDocs(docs.map((d: any) => d.kind));
                }
            } catch (e) {
                console.error(e);
            }
        };
        fetchProfile();
    }, [router]);

    const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);

    // --- STEP 1: DOCUMENT UPLOAD ---
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        if (!e.target.files?.[0]) return;
        setIsLoading(true);
        const formData = new FormData();
        formData.append('file', e.target.files[0]);
        formData.append('type', type);

        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:4000/documents/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                setUploadedDocs(prev => [...prev, type]);
                alert(`${type} uploaded!`);
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error(error);
            alert('Upload failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDocument = async (type: string) => {
        if (!confirm(`Are you sure you want to delete ${type}?`)) return;
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:4000/documents/${type}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setUploadedDocs(prev => prev.filter(d => d !== type));
                alert(`${type} deleted!`);
            } else {
                alert('Delete failed');
            }
        } catch (error) {
            console.error(error);
            alert('Delete failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOCR = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:4000/documents/ocr', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                alert('OCR Complete! Profile Updated.');
                // Refresh profile
                const pRes = await fetch('http://localhost:4000/students/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setProfile(await pRes.json());
                setStep(2);
            } else {
                const errorData = await res.json();
                alert(`OCR Failed: ${errorData.message}`);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred during OCR processing.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- STEP 2: GUARDIAN & FOOD ---
    const submitGuardian = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            await fetch('http://localhost:4000/students/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    guardianName: guardianData.name,
                    guardianPhone: guardianData.phone,
                    guardianAddress: guardianData.address,
                    foodPreference: guardianData.foodPreference
                })
            });
            setStep(3);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    // --- STEP 3: BANK DETAILS ---
    const submitBank = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            await fetch('http://localhost:4000/students/me', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bankAccountNo: bankData.accountNo,
                    bankIfsc: bankData.ifsc,
                    bankHolderName: bankData.holderName,
                    bankAccountType: bankData.type
                })
            });
            setStep(4);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (!profile) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex justify-center items-start pt-20">
            <div className="w-full max-w-2xl space-y-6">

                {/* Progress Bar */}
                <div className="flex justify-between mb-8">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`flex items-center gap-2 ${step >= s ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= s ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>
                                {s}
                            </div>
                            <span className="hidden md:block text-sm">
                                {s === 1 ? 'Documents' : s === 2 ? 'Guardian' : s === 3 ? 'Bank' : 'Done'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* STEP 1: DOCUMENTS */}
                {step === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Documents</CardTitle>
                            <CardDescription>Please upload clear copies of the following.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {['ADMISSION_LETTER', 'AADHAR', 'SIGNATURE', 'EXCEPTION_DOC'].map((type) => (
                                <div key={type} className="grid gap-2">
                                    <Label>{type.replace('_', ' ')}</Label>
                                    {uploadedDocs.includes(type) ? (
                                        <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                                            <div className="flex items-center gap-2 text-green-700">
                                                <CheckCircle2 className="h-4 w-4" />
                                                <span className="text-sm font-medium">Uploaded</span>
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteDocument(type)}
                                                disabled={isLoading}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    ) : (
                                        <Input
                                            type="file"
                                            onChange={(e) => handleFileUpload(e, type)}
                                            disabled={isLoading}
                                        />
                                    )}
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                onClick={handleOCR}
                                disabled={isLoading || !uploadedDocs.includes('ADMISSION_LETTER')}
                            >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                                {uploadedDocs.includes('ADMISSION_LETTER') ? 'Process & Auto-Fill Profile' : 'Upload Admission Letter to Proceed'}
                            </Button>
                        </CardFooter>
                    </Card>
                )}

                {/* STEP 2: GUARDIAN & FOOD */}
                {step === 2 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Details</CardTitle>
                            <CardDescription>Review auto-filled data and add guardian info.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800 mb-4">
                                <p><strong>Auto-Detected:</strong> {profile.name} ({profile.program})</p>
                            </div>

                            <div className="grid gap-2">
                                <Label>Food Preference</Label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={guardianData.foodPreference}
                                    onChange={(e) => setGuardianData({ ...guardianData, foodPreference: e.target.value })}
                                >
                                    <option value="VEG">Vegetarian</option>
                                    <option value="NON_VEG">Non-Vegetarian</option>
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Local Guardian Name</Label>
                                <Input value={guardianData.name} onChange={(e) => setGuardianData({ ...guardianData, name: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Guardian Phone</Label>
                                <Input value={guardianData.phone} onChange={(e) => setGuardianData({ ...guardianData, phone: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Guardian Address</Label>
                                <Input value={guardianData.address} onChange={(e) => setGuardianData({ ...guardianData, address: e.target.value })} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={submitGuardian} disabled={isLoading}>Next: Bank Details</Button>
                        </CardFooter>
                    </Card>
                )}

                {/* STEP 3: BANK DETAILS */}
                {step === 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Bank Details</CardTitle>
                            <CardDescription>For refunds and scholarship purposes.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label>Account Type</Label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={bankData.type}
                                    onChange={(e) => setBankData({ ...bankData, type: e.target.value })}
                                >
                                    <option value="PERSONAL">Personal</option>
                                    <option value="JOINT">Joint</option>
                                </select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Account Holder Name</Label>
                                <Input value={bankData.holderName} onChange={(e) => setBankData({ ...bankData, holderName: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Account Number</Label>
                                <Input value={bankData.accountNo} onChange={(e) => setBankData({ ...bankData, accountNo: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>IFSC Code</Label>
                                <Input value={bankData.ifsc} onChange={(e) => setBankData({ ...bankData, ifsc: e.target.value })} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={submitBank} disabled={isLoading}>Submit & Generate Form</Button>
                        </CardFooter>
                    </Card>
                )}

                {/* STEP 4: SUCCESS */}
                {step === 4 && (
                    <Card className="border-green-200 bg-green-50">
                        <CardHeader>
                            <div className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="h-6 w-6" />
                                <CardTitle>Application Submitted!</CardTitle>
                            </div>
                            <CardDescription>
                                Your details have been recorded. Your allotment status is currently <strong>PENDING</strong>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-green-800">
                                You will be notified once the admin processes your allotment based on the uploaded documents and priority rules.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => router.push('/dashboard')}>
                                Go to Dashboard
                            </Button>
                        </CardFooter>
                    </Card>
                )}

            </div>
        </div>
    );
}
