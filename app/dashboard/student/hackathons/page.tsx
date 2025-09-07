"use client"
import { jwtDecode } from "jwt-decode"

import { useState,useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Trophy,
  Search,
  Filter,
  Heart,
  Share2,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useHackathons } from "@/hooks/use-hackathons"
import { useRegistrations } from "@/hooks/use-registrations"

export default function StudentHackathonsPage() {
  const [currentUserId,setCurrentUserId]=useState("")
  const [userprofile,setUserProfile]=useState([])
  const [selectedHackathon, setSelectedHackathon] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [favorites, setFavorites] = useState<string[]>([])

  const { toast } = useToast()
useEffect(()=>{
  const Token=localStorage.getItem("token")
  if (Token){
    try{
        const decode:any=jwtDecode(Token)
        
        console.log(decode,"decode");
        setCurrentUserId(decode.id)
        setUserProfile(decode)
    }catch(error){

    }
    
  }
},[])
  const {
    hackathons,
    loading: hackathonsLoading,
    refetch,
  } = useHackathons({
    search: searchTerm,
    status: statusFilter !== "all" ? statusFilter : undefined,
    difficulty: difficultyFilter !== "all" ? difficultyFilter : undefined,
  })

  const {
    registrations,
    loading: registrationsLoading,
    createRegistration,
  } = useRegistrations({
    user: currentUserId,
  })

  const loading = hackathonsLoading || registrationsLoading

  // Get user's registered hackathons
  const myRegistrations = registrations.map((r: any) => ({
    ...r,
    paymentStatus: r.paymentStatus || "Unknown",
    registrationDate: r.registrationDate || new Date(),
    paymentAmount: r.paymentAmount || 0,
  }))
  const myHackathonIds = myRegistrations.map((r: any) => r.hackathon?._id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Registration Open":
        return "bg-green-100 text-green-800"
      case "Active":
        return "bg-blue-100 text-blue-800"
      case "Planning":
        return "bg-yellow-100 text-yellow-800"
      case "Completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleRegister = async (hackathonId: string) => {
    try {
      const response = await createRegistration({
        user: currentUserId,
        hackathon: hackathonId,
      })

      if (response.success) {
        toast({
          title: "Registration Successful",
          description: "You have been registered for the hackathon. Please complete payment to confirm.",
        })
        refetch() // Refresh hackathons to update participant count
      } else {
        toast({
          title: "Registration Failed",
          description: response.error || "Failed to register for hackathon",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleToggleFavorite = (hackathonId: string) => {
    setFavorites((prev) =>
      prev.includes(hackathonId) ? prev.filter((id) => id !== hackathonId) : [...prev, hackathonId],
    )
  }

  const handleShare = (hackathon: any) => {
    if (navigator.share) {
      navigator.share({
        title: hackathon.title,
        text: hackathon.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied",
        description: "Hackathon link copied to clipboard",
      })
    }
  }

  const myHackathons = hackathons.filter((h: any) => myHackathonIds.includes(h._id))
  const favoriteHackathons = hackathons.filter((h: any) => favorites.includes(h._id))

  if (loading) {
    return (
      <DashboardLayout userRole="student">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading hackathons...</span>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hackathons</h1>
            <p className="text-gray-600">Discover and join exciting hackathon events</p>
          </div>
        </div>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse All ({hackathons.length})</TabsTrigger>
            <TabsTrigger value="registered">My Hackathons ({myHackathons.length})</TabsTrigger>
            <TabsTrigger value="favorites">Favorites ({favoriteHackathons.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search & Filter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search hackathons..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Registration Open">Registration Open</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hackathons Grid */}
            <div className="grid gap-6">
              {hackathons.map((hackathon: any) => {
                const isRegistered = myHackathonIds.includes(hackathon._id)
                const isFavorite = favorites.includes(hackathon._id)
                const isRegistrationOpen = hackathon.status === "Registration Open"
                const isUpcoming = new Date(hackathon.startDate) > new Date()

                return (
                  <Card key={hackathon._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{hackathon.title}</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFavorite(hackathon._id)}
                              className="p-1"
                            >
                              <Heart
                                className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                              />
                            </Button>
                          </div>
                          <CardDescription className="text-base">{hackathon.description}</CardDescription>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                            <Badge className={getDifficultyColor(hackathon.difficulty)}>{hackathon.difficulty}</Badge>
                            {isRegistered && <Badge variant="outline">Registered</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleShare(hackathon)}>
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedHackathon(hackathon)}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {new Date(hackathon.startDate).toLocaleDateString()} -{" "}
                          {new Date(hackathon.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          {hackathon.venue}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <DollarSign className="h-4 w-4" />${hackathon.registrationFee} registration
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          {hackathon.currentParticipants}/{hackathon.maxParticipants} participants
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {hackathon.categories?.map((category: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {category}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="text-gray-600">Prizes: </span>
                            <span className="font-medium">{hackathon.prizes?.join(", ")}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isRegistrationOpen && !isRegistered && isUpcoming && (
                            <Button onClick={() => handleRegister(hackathon._id)}>Register Now</Button>
                          )}
                          {isRegistered && <Button variant="outline">View Team</Button>}
                          {!isUpcoming && hackathon.status === "Planning" && (
                            <Button variant="outline" disabled>
                              <Clock className="mr-2 h-4 w-4" />
                              Coming Soon
                            </Button>
                          )}
                          {hackathon.status === "Completed" && (
                            <Button variant="outline" disabled>
                              Event Completed
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {hackathons.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-600">No hackathons found matching your criteria.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="registered" className="space-y-6">
            <div className="grid gap-6">
              {myHackathons.map((hackathon: any) => {
                const registration = myRegistrations.find((r: any) => r.hackathon?._id === hackathon._id)

                return (
                  <Card key={hackathon._id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{hackathon.title}</CardTitle>
                          <CardDescription>{hackathon.description}</CardDescription>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                            <Badge variant="outline">Registered</Badge>
                            {registration && (
                              <Badge variant={registration.paymentStatus === "Paid" ? "default" : "secondary"}>
                                {registration.paymentStatus}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-gray-600">Event Date:</span>
                          <p className="font-medium">
                            {new Date(hackathon.startDate).toLocaleDateString()} -{" "}
                            {new Date(hackathon.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Venue:</span>
                          <p className="font-medium">{hackathon.venue}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Registration Date:</span>
                          <p className="font-medium">
                            {registration ? new Date(registration.registrationDate).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Payment Amount:</span>
                          <p className="font-medium">${registration?.paymentAmount || hackathon.registrationFee}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button>View Team</Button>
                        <Button variant="outline">Track Progress</Button>
                        <Button variant="outline">Contact Mentor</Button>
                        {registration?.paymentStatus === "Pending" && <Button>Complete Payment</Button>}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {myHackathons.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-600">You haven't registered for any hackathons yet.</p>
                    <Button
                      className="mt-4"
                      onClick={() => {
                        const browseTab = document.querySelector('[value="browse"]') as HTMLElement;
                        browseTab?.click();
                      }}
                    >
                      Browse Hackathons
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <div className="grid gap-6">
              {favoriteHackathons.map((hackathon: any) => {
                const isRegistered = myHackathonIds.includes(hackathon._id)

                return (
                  <Card key={hackathon._id} className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            {hackathon.title}
                            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                          </CardTitle>
                          <CardDescription>{hackathon.description}</CardDescription>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                            {isRegistered && <Badge variant="outline">Registered</Badge>}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-gray-600">Event Date:</span>
                          <p className="font-medium">
                            {new Date(hackathon.startDate).toLocaleDateString()} -{" "}
                            {new Date(hackathon.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600">Registration Fee:</span>
                          <p className="font-medium">${hackathon.registrationFee}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!isRegistered && hackathon.status === "Registration Open" && (
                          <Button onClick={() => handleRegister(hackathon._id)}>Register Now</Button>
                        )}
                        {isRegistered && <Button variant="outline">View Team</Button>}
                        <Button variant="outline" onClick={() => setSelectedHackathon(hackathon)}>
                          View Details
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleFavorite(hackathon._id)}>
                          Remove from Favorites
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              {favoriteHackathons.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-600">You haven't added any hackathons to favorites yet.</p>
                    <Button
                      className="mt-4"
                      onClick={() => {
                        const browseTab = document.querySelector('[value="browse"]') as HTMLElement;
                        browseTab?.click();
                      }}
                    >
                      Browse Hackathons
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Hackathon Details Modal */}
        {selectedHackathon && (
          <Dialog open={!!selectedHackathon} onOpenChange={() => setSelectedHackathon(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedHackathon.title}
                  <Badge className={getStatusColor(selectedHackathon.status)}>{selectedHackathon.status}</Badge>
                </DialogTitle>
                <DialogDescription>{selectedHackathon.description}</DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="prizes">Prizes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Event Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Start Date:</span>
                          <span>{new Date(selectedHackathon.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">End Date:</span>
                          <span>{new Date(selectedHackathon.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Registration Deadline:</span>
                          <span>{new Date(selectedHackathon.registrationDeadline).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Venue:</span>
                          <span>{selectedHackathon.venue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Organizer:</span>
                          <span>{selectedHackathon.organizer?.name || "University"}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Registration Info</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Registration Fee:</span>
                          <span className="font-medium">${selectedHackathon.registrationFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Participants:</span>
                          <span>
                            {selectedHackathon.currentParticipants}/{selectedHackathon.maxParticipants}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Difficulty:</span>
                          <Badge className={getDifficultyColor(selectedHackathon.difficulty)}>
                            {selectedHackathon.difficulty}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={getStatusColor(selectedHackathon.status)}>{selectedHackathon.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>Event Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Categories</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedHackathon.categories?.map((category: string, index: number) => (
                              <Badge key={index} variant="outline">
                                {category}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Description</h4>
                          <p className="text-gray-700">{selectedHackathon.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="requirements">
                  <Card>
                    <CardHeader>
                      <CardTitle>Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedHackathon.requirements?.map((req: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="prizes">
                  <Card>
                    <CardHeader>
                      <CardTitle>Prize Pool</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedHackathon.prizes?.map((prize: string, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <Trophy
                                className={`h-6 w-6 ${index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : "text-orange-600"}`}
                              />
                              <span className="font-medium">
                                {index === 0 ? "1st Place" : index === 1 ? "2nd Place" : "3rd Place"}
                              </span>
                            </div>
                            <span className="text-xl font-bold">{prize}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4">
                {selectedHackathon.status === "Registration Open" &&
                  !myHackathonIds.includes(selectedHackathon._id) && (
                    <Button
                      onClick={() => {
                        handleRegister(selectedHackathon._id)
                        setSelectedHackathon(null)
                      }}
                    >
                      Register for Hackathon
                    </Button>
                  )}
                {myHackathonIds.includes(selectedHackathon._id) && <Button variant="outline">View My Team</Button>}
                <Button variant="ghost" onClick={() => handleToggleFavorite(selectedHackathon._id)}>
                  <Heart
                    className={`mr-2 h-4 w-4 ${favorites.includes(selectedHackathon._id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                  />
                  {favorites.includes(selectedHackathon._id) ? "Remove from Favorites" : "Add to Favorites"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}