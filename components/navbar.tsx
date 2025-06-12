"use client"
import { useState,useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

import { Code2, Menu, X } from "lucide-react"
import Link from "next/link"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

 useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "w-full md:w-[90%] transition-all duration-300  rounded-b-lg",
          scrolled
            ? "bg-background/60 backdrop-blur-md border-b border-border shadow-sm"
            : "bg-transparent border-transparent",
        )}
      >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Code2 className="h-6 w-6 text-blue-600" />
          <p className="text-white dark:text-black">
          HackathonMS

          </p>
        </Link>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-4">
          <Button className="bg-none">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button className="">
                <Link href="/auth/register">Sign Up</Link>
              </Button>
          <ModeToggle />
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
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? "auto" : 0 }}
          transition={{ duration: 0.3 }}
          className={`md:hidden overflow-hidden bg-card border-b border-border`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <div className="flex flex-col gap-4">
              <Button className="bg-none">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button className="">
                <Link href="/auth/register">Sign Up</Link>
              </Button>
              <ModeToggle />
            </div>
          </div>
        </motion.div>
      </motion.nav>
    </nav>
  )
}
