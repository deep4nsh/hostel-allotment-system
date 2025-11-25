"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function Navbar() {
    const router = useRouter()
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        setIsLoggedIn(!!token)
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsLoggedIn(false)
        router.push('/auth/login')
    }

    return (
        <nav className="border-b bg-white">
            <div className="flex h-16 items-center px-4 container mx-auto justify-between">
                <Link href="/" className="font-bold text-xl">DTU Hostels</Link>

                <div className="flex items-center space-x-4">
                    {isLoggedIn ? (
                        <>
                            <Link href="/student/profile" className="text-sm font-medium hover:underline">Profile</Link>
                            <Link href="/student/documents" className="text-sm font-medium hover:underline">Documents</Link>
                            <Link href="/student/preferences" className="text-sm font-medium hover:underline">Preferences</Link>
                            <Link href="/student/payments" className="text-sm font-medium hover:underline">Payments</Link>
                            <div className="h-4 w-[1px] bg-slate-300 mx-2"></div>
                            <Link href="/admin/allotment" className="text-sm font-medium text-slate-600 hover:underline">Admin</Link>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/auth/register">
                                <Button size="sm">Register</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
