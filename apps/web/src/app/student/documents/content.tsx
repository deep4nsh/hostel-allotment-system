"use client";

import { useEffect, useState } from "react";
import { getMyDocuments, uploadDocument, deleteDocument, getProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Upload, FileText, Trash2, Eye, CheckCircle, AlertCircle, Lock } from "lucide-react";

export default function DocumentsPageContent() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [isFeePaid, setIsFeePaid] = useState(false);
  const [hasAllotment, setHasAllotment] = useState(false);
  const router = useRouter();

  // State for file inputs
  const [files, setFiles] = useState<{ [key: string]: File | null }>({});
  const [aadharFront, setAadharFront] = useState<File | null>(null);
  const [aadharBack, setAadharBack] = useState<File | null>(null);

  useEffect(() => {
    loadDocuments();
    checkFeeStatus();
  }, []);

  async function checkFeeStatus() {
    try {
      const profile = await getProfile();
      if (profile) {
        if (profile.payments) {
          // Check for HOSTEL_FEE with status COMPLETED
          const paid = profile.payments.some((p: any) =>
            p.purpose === 'HOSTEL_FEE' && (p.status === 'COMPLETED' || p.status === 'PAID')
          );
          setIsFeePaid(paid);
        }
        if (profile.allotment && profile.allotment.isPossessed) {
          setHasAllotment(true);
        }
      }
    } catch (error) {
      console.error("Failed to fetch profile for fee status", error);
    }
  }

  async function handleDownloadIDCard() {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/students/me/id-card', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hostel-id-card.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        const err = await res.json();
        alert(`Failed to download ID Card: ${err.message}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error downloading ID Card');
    }
  }

  async function loadDocuments() {
    try {
      const data = await getMyDocuments();
      setDocuments(data);
    } catch (error) {
      console.error(error);
    }
  }

  const docTypes = [
    { value: "UNDERTAKING", label: "E-Stamp Undertaking" },
    { value: "ADMISSION_LETTER", label: "Admission Letter" },
    { value: "MEDICAL_CERTIFICATE", label: "Medical Certificate" },
    { value: "PHOTO", label: "Passport Size Photo" },
    { value: "SIGNATURE", label: "Signature" },
    { value: "AADHAR", label: "Aadhar Card" },
  ];

  async function handleSingleUpload(type: string) {
    const file = files[type];
    if (!file) return;

    setUploadingType(type);
    try {
      await uploadDocument(file, type);
      // alert("Document uploaded successfully!"); // Removed alert for smoother UX, maybe add a toast later
      setFiles({ ...files, [type]: null });
      loadDocuments();
    } catch (error: any) {
      alert(error.message || "Upload failed");
    } finally {
      setUploadingType(null);
    }
  }

  async function handleAadharUpload() {
    if (!aadharFront || !aadharBack) return;
    setUploadingType('AADHAR');
    try {
      await Promise.all([
        uploadDocument(aadharFront, 'AADHAR_FRONT'),
        uploadDocument(aadharBack, 'AADHAR_BACK')
      ]);
      setAadharFront(null);
      setAadharBack(null);
      loadDocuments();
    } catch (error: any) {
      alert(error.message || "Upload failed");
    } finally {
      setUploadingType(null);
    }
  }

  async function handleDelete(type: string) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      if (type === 'AADHAR') {
        // Try deleting both, ignore errors if one is missing
        await Promise.allSettled([
          deleteDocument('AADHAR_FRONT'),
          deleteDocument('AADHAR_BACK')
        ]);
      } else {
        await deleteDocument(type);
      }
      loadDocuments();
    } catch (error: any) {
      alert(error.message || 'Delete failed');
    }
  }

  const isUploaded = (type: string) => {
    if (type === 'AADHAR') {
      const front = documents.find(d => d.kind === 'AADHAR_FRONT');
      const back = documents.find(d => d.kind === 'AADHAR_BACK');
      return !!(front && back);
    }
    return !!documents.find(d => d.kind === type);
  };

  const getUploadedDoc = (type: string) => {
    if (type === 'AADHAR') {
      // Return front for link purposes, or maybe just logic to show viewed button
      return documents.find(d => d.kind === 'AADHAR_FRONT');
    }
    return documents.find(d => d.kind === type);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
            <p className="text-gray-500 mt-1">Upload and manage your required documents for hostel allotment.</p>
          </div>
          <div className="flex gap-2">
            {hasAllotment && (
              <Button onClick={handleDownloadIDCard}>
                <FileText className="w-4 h-4 mr-2" />
                Download ID Card
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docTypes.map((doc) => {
            const uploaded = isUploaded(doc.value);
            const uploadedDoc = getUploadedDoc(doc.value);
            const isLoading = uploadingType === doc.value;

            // Logic for Undertaking: Disabled if Fee NOT Paid
            const isUndertaking = doc.value === 'UNDERTAKING';
            const isDisabled = isUndertaking && !isFeePaid && !uploaded;

            return (
              <Card key={doc.value} className={`flex flex-col ${uploaded ? 'border-green-200 bg-green-50/30' : ''}`}>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">{doc.label}</CardTitle>
                    {uploaded ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" /> Uploaded
                      </span>
                    ) : isDisabled ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        <Lock className="w-3 h-3 mr-1" /> Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                        <AlertCircle className="w-3 h-3 mr-1" /> Pending
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {uploaded ? (
                    <div className="py-2">
                      {/* For Aadhar, we might want to show two links? matching original logic which just showed list */}
                      {/* Original logic: showed list of all uploaded docs.
                             Here we are inside a card for a specific type.
                             If Aadhar, we have 2 docs in backend.
                         */}
                      {doc.value === 'AADHAR' ? (
                        <div className="space-y-2">
                          {documents.filter(d => d.kind.startsWith('AADHAR')).map(d => (
                            <div key={d.id} className="flex items-center justify-between text-sm bg-white p-2 rounded border">
                              <span className="truncate max-w-[150px]">{d.kind === 'AADHAR_FRONT' ? 'Front' : 'Back'}</span>
                              <a href={d.fileUrl} target="_blank" className="text-blue-600 hover:underline flex items-center">
                                <Eye className="w-3 h-3 mr-1" /> View
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-sm bg-white p-3 rounded border">
                          <div className="flex items-center text-gray-700">
                            <FileText className="w-4 h-4 mr-2 text-blue-500" />
                            <span>Document File</span>
                          </div>
                          <a href={uploadedDoc?.fileUrl} target="_blank" className="text-blue-600 hover:underline flex items-center">
                            <Eye className="w-3 h-3 mr-1" /> View
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {isDisabled ? (
                        <div className="text-sm text-gray-500 italic p-2 bg-gray-50 rounded border border-dashed text-center">
                          Hostel fees must be paid to unlock this upload.
                        </div>
                      ) : (
                        <>
                          {doc.value === 'AADHAR' ? (
                            <>
                              <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Front Side</label>
                                <Input
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  onChange={(e) => setAadharFront(e.target.files?.[0] || null)}
                                  className="bg-white"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Back Side</label>
                                <Input
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.pdf"
                                  onChange={(e) => setAadharBack(e.target.files?.[0] || null)}
                                  className="bg-white"
                                />
                              </div>
                            </>
                          ) : (
                            <div>
                              <label className="text-xs font-medium text-gray-500 mb-1 block">Select File</label>
                              <Input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setFiles(prev => ({ ...prev, [doc.value]: e.target.files?.[0] || null }))}
                                className="bg-white"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  {uploaded ? (
                    <Button variant="destructive" className="w-full" onClick={() => handleDelete(doc.value)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete Document
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => doc.value === 'AADHAR' ? handleAadharUpload() : handleSingleUpload(doc.value)}
                      disabled={isDisabled || isLoading || (doc.value === 'AADHAR' ? (!aadharFront || !aadharBack) : !files[doc.value])}
                    >
                      {isLoading ? (
                        "Uploading..."
                      ) : isDisabled ? "Locked" : (
                        <>
                          <Upload className="w-4 h-4 mr-2" /> Upload
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

