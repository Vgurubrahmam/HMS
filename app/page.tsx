import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Component } from "lucide-react"
import { Code, Users, Trophy, Calendar, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Github, Linkedin, Mail, ArrowUp } from "lucide-react"
import { AppProps } from "next/app"
import { SessionProvider } from "next-auth/react"

export default function HomePage({Component,pageProps}:AppProps) {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

    // <SessionProvider session={pageProps.session}>
    //   <Component {...pageProps}/>

    // </SessionProvider>
  return (
    <div className="h-screen w-screen overflow-auto ">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mt-16">

          <h1 className="text-5xl font-bold tracking-tight mb-6 ">
            Streamline Your Hackathon Experience
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            From registration to certification, manage every aspect of your hackathon with our comprehensive platform
            designed for coordinators, faculty, students, and mentors.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link href="/auth/login">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">View Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl text-white dark:text-black font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools for every stakeholder in your hackathon ecosystem
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Code className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>For Coordinators</CardTitle>
              <CardDescription>
                Complete hackathon management with team formation and resource allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Create & manage hackathons
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Assign mentors & rooms
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Form teams & track progress
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>For Faculty</CardTitle>
              <CardDescription>Monitor registrations, payments, and student progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  View registrations & payments
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Access student histories
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Department analytics
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Trophy className="h-10 w-10 text-purple-600 mb-2" />
              <CardTitle>For Students</CardTitle>
              <CardDescription>Register, pay, track progress, and earn certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Easy registration & payment
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Progress tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Digital certifications
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <Calendar className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>For Mentors</CardTitle>
              <CardDescription>Guide teams and track mentoring history</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Team guidance tools
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Progress monitoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Mentoring history
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      
      <footer className="bg-card border-t border-border py-5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                <Code2 className="h-6 w-6 text-blue-600" />
                <p className="text-black dark:text-white w-fit">
                  HackathonMS

                </p>
              </Link>
              <CardContent className="py-2 text-start">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-xl mb-8 opacity-90">Join thousands of hackathon organizers who trust our platform</p>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/auth/register">
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </div>

            <div className="flex flex-col  items-end space-y-2">
              <p className="font-semibold text-xl">Developed and Maintained By</p>

              {/* Developer: Guru Brahmam */}
              <div className="flex justify-between items-end gap-2">
                <p className="font-medium">Guru Brahmam</p>
                <div className="flex  space-x-4">
                  <a href="https://github.com/Vgurubrahmam" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Github className="h-5 w-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/guru-brahmam-velpula" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="mailto:vgurubrahmam338@gmail.com" aria-label="Email" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Developer: Varshitha */}
              <div className="flex justify-center items-center gap-2">
                <p className="font-medium">Varshitha</p>
                <div className="flex space-x-4">
                  <a href="https://github.com/varshitha" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Github className="h-5 w-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/varshitha" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="mailto:varshitha@example.com" aria-label="Email" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Developer: Santhosi */}
              <div className="flex justify-center items-center gap-2">
                <p className="font-medium">Santhoshi</p>
                <div className="flex space-x-4">
                  <a href="https://github.com/santhosi" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Github className="h-5 w-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/santhosi" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="mailto:santhosi@example.com" aria-label="Email" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Developer: Haricharan */}
              <div className="flex justify-center items-center gap-2">
                <p className="font-medium">Haricharan</p>
                <div className="flex space-x-4">
                  <a href="https://github.com/haricharan" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Github className="h-5 w-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/haricharan" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="mailto:haricharan@example.com" aria-label="Email" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Developer: Kokila */}
              <div className="flex justify-center items-center gap-2">
                <p className="font-medium">Kokila</p>
                <div className="flex space-x-4 ">
                  <a href="https://github.com/kokila" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Github className="h-5 w-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/kokila" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="mailto:kokila@example.com" aria-label="Email" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Developer: Mounika */}
              <div className="flex justify-center items-center gap-2">
                <p className="font-medium">Mounika</p>
                <div className="flex space-x-4">
                  <a href="https://github.com/mounika" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Github className="h-5 w-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/mounika" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a href="mailto:mounika@example.com" aria-label="Email" className="text-muted-foreground hover:text-foreground transition-colors duration-300">
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>

          </div>

          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} HackathonMS. All rights reserved.</p>
            <p className="text-muted-foreground text-sm mt-2 md:mt-0">
              Built with Next.js, Tailwind CSS, and Framer Motion
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
