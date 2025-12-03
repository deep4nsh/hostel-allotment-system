"use client";

import { ProfileForm } from "@/components/student/ProfileForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/student/profile");
  }, [router]);

  return null;
}
