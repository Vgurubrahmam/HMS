"use client"

import type React from "react"

import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Code2,
  Menu,
  Bell,
  Settings,
  LogOut,
  User,
  Home,
  Calendar,
  Users,
  Trophy,
  CreditCard,
  FileText,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ModeToggle } from "./mode-toggle"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole: "coordinator" | "faculty" | "student" | "mentor"
  userName?: string
  userEmail?: string
}

const roleMenuItems = {
  coordinator: [
    { icon: Home, label: "Dashboard", href: "/dashboard/coordinator" },
    { icon: Calendar, label: "Hackathons", href: "/dashboard/coordinator/hackathons" },
    { icon: Users, label: "Teams", href: "/dashboard/coordinator/teams" },
    { icon: User, label: "Mentors", href: "/dashboard/coordinator/mentors" },
    { icon: CreditCard, label: "Payments", href: "/dashboard/coordinator/payments" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/coordinator/analytics" },
  ],
  faculty: [
    { icon: Home, label: "Dashboard", href: "/dashboard/faculty" },
    { icon: Users, label: "Students", href: "/dashboard/faculty/students" },
    { icon: Calendar, label: "Hackathons", href: "/dashboard/faculty/hackathons" },
    { icon: CreditCard, label: "Payments", href: "/dashboard/faculty/payments" },
    { icon: BarChart3, label: "Reports", href: "/dashboard/faculty/reports" },
  ],
  student: [
    { icon: Home, label: "Dashboard", href: "/dashboard/student" },
    { icon: Calendar, label: "Hackathons", href: "/dashboard/student/hackathons" },
    { icon: CreditCard, label: "Payments", href: "/dashboard/student/payments" },
    { icon: FileText, label: "Certificates", href: "/dashboard/student/certificates" },
  ],
  mentor: [
    { icon: Home, label: "Dashboard", href: "/dashboard/mentor" },
    { icon: Users, label: "My Teams", href: "/dashboard/mentor/teams" },
    { icon: Calendar, label: "Hackathons", href: "/dashboard/mentor/hackathons" },
    { icon: BarChart3, label: "Progress", href: "/dashboard/mentor/progress" },
    { icon: FileText, label: "History", href: "/dashboard/mentor/history" },
  ],
}


export function DashboardLayout({
  children,
  userRole: initialUserRole,
  userName: initialUserName,
  userEmail,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userName, setUserName] = useState(initialUserName || "User");
  const [userRole, setUserRole] = useState<"coordinator" | "faculty" | "student" | "mentor">(initialUserRole || "student");
  const [userImage, setUserImage] = useState("");
  const router = useRouter()
  const pathname = usePathname()

useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decoded: any = jwtDecode(token)
        if (decoded) {
          setUserName(decoded.username || "User")
          // Map "Coordinator" to "coordinator" for compatibility
          const mappedRole =
            decoded.role === "Coordinator"
              ? "coordinator"
              : decoded.role;
          setUserRole(
            mappedRole === "coordinator" ||
            mappedRole === "faculty" ||
            mappedRole === "student" ||
            mappedRole === "mentor"
              ? mappedRole
              : "student"
          );
          setUserImage(decoded.image || "/placeholder.svg")
        }
      } catch (err) {
        console.error("Failed to decode token:", err)
      }
    }
  }, [])

  const menuItems = roleMenuItems[userRole]

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/auth/login")

  }

  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col justify-between h-full">

        <div>
        <div className="flex items-center justify-center h-16 border-b">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Code2 className="h-6 w-6 text-blue-600 " />
            <p className="text-black">HackathonMS</p>
          </Link>
        </div>

        <nav className="mt-8">
          <div className="px-4 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Menu
            </p>
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors",
                  isActive && "bg-blue-50 text-blue-600 border-r-2 border-blue-600",
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        </div>
       <div className="p-4">
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <div
        className="flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-md cursor-pointer"
      >
        <Avatar className="h-8 w-8 text-black">
          <AvatarImage src={userImage} />
          <AvatarFallback>
            {userName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium">{userName}</p>
          <p className="text-xs text-gray-500">{userRole}</p>
        </div>
      </div>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel>My Account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <User className="mr-2 h-4 w-4" />
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</div>

            </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6 ">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex justify-end items-center gap-4 w-full">
            
            
            <ModeToggle/>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
