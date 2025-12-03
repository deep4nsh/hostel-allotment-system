import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-slate-900">DTU Hostel Allotment</CardTitle>
          <CardDescription>
            Welcome to the official hostel allotment system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-medium">Admissions 2025-26</p>
            <p>Registration is currently open for first-year students.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/login">Student Login</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/register">New Registration</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
