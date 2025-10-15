"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

import { Code2, Menu, X, User, Settings, LogOut } from "lucide-react"
import Link from "next/link"

// Dynamically import ModeToggle to reduce initial bundle size
const DynamicModeToggle = dynamic(() => import("@/components/mode-toggle").then(mod => ({ default: mod.ModeToggle })), {
  ssr: false,
  loading: () => <div className="w-10 h-10" />
})

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hasToken, setHasToken] = useState(false)
  const [userImage, setUserImage] = useState("")
  const [mounted, setMounted] = useState(false)
  const { userData, loading } = useCurrentUser()
  const router = useRouter()

  // Handle component mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Optimized scroll handler with throttling
  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Optimized token checking
  useEffect(() => {
    if (!mounted) return
    
    const token = localStorage.getItem('token')
    setHasToken(!!token)

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        setHasToken(!!e.newValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [mounted])

  // Memoized user profile fetching
  const fetchUserProfile = useCallback(async () => {
    if (!userData?.id) return
    
    try {
      // Check localStorage first (fastest)
      const storedProfile = localStorage.getItem("userProfile")
      const googleProfile = localStorage.getItem("googleUserProfile")
      
      if (storedProfile) {
        const profileData = JSON.parse(storedProfile)
        let imageUrl = profileData.image
        
        if (googleProfile) {
          const googleData = JSON.parse(googleProfile)
          imageUrl = googleData.imgUrl || imageUrl
        }
        
        setUserImage(imageUrl || "/placeholder.svg")
        return
      }
      
      if (googleProfile) {
        const googleData = JSON.parse(googleProfile)
        if (googleData.imgUrl) {
          setUserImage(googleData.imgUrl)
          return
        }
      }
      
      // Fetch from API only if no local data
      const response = await fetch(`/api/profiles/${userData.id}`)
      if (response.ok) {
        const { data } = await response.json()
        if (data?.image) {
          setUserImage(data.image)
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      setUserImage("/placeholder.svg")
    }
  }, [userData?.id])

  // Debounced profile fetching
  useEffect(() => {
    if (userData?.id && mounted) {
      const timeoutId = setTimeout(fetchUserProfile, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [userData?.id, mounted, fetchUserProfile])

  // Memoized dashboard URL
  const dashboardUrl = useMemo(() => {
    if (!userData?.role) return "/dashboard"
    
    const role = userData.role.toLowerCase()
    switch (role) {
      case "coordinator": return "/dashboard/coordinator"
      case "faculty": return "/dashboard/faculty"
      case "mentor": return "/dashboard/mentor"
      default: return "/dashboard/student"
    }
  }, [userData?.role])

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("userProfile")
    localStorage.removeItem("googleUserProfile")
    router.push("/auth/login")
  }, [router])

  // Memoized user initials
  const userInitials = useMemo(() => {
    if (!userData?.username) return "U"
    return userData.username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }, [userData?.username])

  // Early return for SSR
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full">
        <div className="w-full md:w-[90%] bg-background/60 backdrop-blur-md border-b border-border shadow-sm rounded-b-lg">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-foreground">
              <p className="text-primary">HackOps</p>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <div className="w-10 h-10" /> {/* Placeholder for mode toggle */}
            </div>
          </div>
        </div>
      </nav>
    )
  }
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full">
      <motion.nav
        initial={false} // Disable initial animation for faster load
        animate={{ y: 0 }}
        className={cn(
          "w-full md:w-[90%] transition-all duration-300 rounded-b-lg",
          scrolled
            ? "bg-background/60 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-transparent border-transparent",
        )}
      >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-foreground">
          {/* <Code2 className="h-6 w-6 " /> */}
          <p className="text-primary">


          HackOps

          </p>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          {hasToken ? (
            <>
              <Link href={dashboardUrl} className="font-semibold text-primary">Dashboard</Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={userImage} 
                        alt={userData?.username || "User"}
                        loading="lazy"
                      />
                      <AvatarFallback>
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userData?.username || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userData?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="font-semibold text-primary">Sign in</Link>
              <Link href="/auth/register" className="font-semibold text-primary">Sign Up</Link>
            </>
          )}
          <DynamicModeToggle />
        </div>

        <div className="flex items-center gap-4 md:hidden">
          <Button
            className="bg-none"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle mobile menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      {/* Mobile menu */}
        <motion.div
          initial={false} // Disable initial animation
          animate={{ 
            opacity: isOpen ? 1 : 0, 
            height: isOpen ? "auto" : 0 
          }}
          transition={{ duration: 0.2 }} // Faster transition
          className={`md:hidden overflow-hidden bg-card border-b border-border`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="flex flex-col gap-4">
              {hasToken ? (
                <>
                  <Button className="bg-none">
                    <Link href={dashboardUrl}>Dashboard</Link>
                  </Button>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={userImage} 
                        alt={userData?.username || "User"}
                        loading="lazy"
                      />
                      <AvatarFallback>
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{userData?.username || "User"}</p>
                      <p className="text-xs text-gray-500">{userData?.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pl-3">
                    <Button variant="ghost" className="justify-start h-auto p-2">
                      <User className="mr-2 h-4 w-4" />
                      <Link href="/profile">Profile</Link>
                    </Button>
                    <Button variant="ghost" className="justify-start h-auto p-2">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                    <Button variant="ghost" className="justify-start h-auto p-2 text-red-600" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button className="bg-none">
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button className="">
                    <Link href="/auth/register">Sign Up</Link>
                  </Button>
                </>
              )}
              <DynamicModeToggle />
            </div>
          </div>
        </motion.div>
      </motion.nav>
    </nav>
  )
}
