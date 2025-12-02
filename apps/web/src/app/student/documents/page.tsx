"use client";

import { useEffect, useState } from "react";
import { getMyDocuments, uploadDocument } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Upload, FileText } from "lucide-react";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("UNDERTAKING");
  const [file, setFile] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const data = await getMyDocuments();
      setDocuments(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setIsLoading(true);
    try {
      await uploadDocument(file, selectedType);
      alert("Document uploaded successfully!");
      setFile(null);
      // Reset file input value manually if needed or rely on key
      loadDocuments();
    } catch (error: any) {
      alert(error.message || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  }

  const docTypes = [
    { value: "UNDERTAKING", label: "E-Stamp Undertaking" },
    { value: "ADMISSION_LETTER", label: "Admission Letter" },
    { value: "MEDICAL_CERTIFICATE", label: "Medical Certificate" },
    { value: "PHOTO", label: "Passport Size Photo" },
    { value: "SIGNATURE", label: "Signature" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <Button variant="outline" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload New Document</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Document Type</label>
                  <Select onValueChange={setSelectedType} defaultValue="UNDERTAKING">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {docTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Select File</label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isLoading || !file}>
                {isLoading ? "Uploading..." : (
                  <>
                    <Upload className="w-4 h-4 mr-2" /> Upload Document
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No documents uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow">
                    <div className="p-2 bg-blue-50 rounded-full mr-4">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {docTypes.find(t => t.value === doc.kind)?.label || doc.kind}
                      </p>
                      <p className="text-xs text-gray-500">
                        Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      href={`http://localhost:4000${doc.fileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 hover:underline ml-2"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
