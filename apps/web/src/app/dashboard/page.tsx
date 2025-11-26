"use client";

import { ProfileForm } from "@/components/student/ProfileForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Student Profile</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Please ensure your details are correct. These will be used for allotment.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <ProfileForm />
          </div>
        </div>
      </main>
    </div>
  );
}
