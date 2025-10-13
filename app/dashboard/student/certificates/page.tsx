"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Award, Download, Share2, Eye, Search, Calendar, Trophy, Medal, Star, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCertificates } from "@/hooks/use-certificates"
import { useCurrentUser } from "@/hooks/use-current-user"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function StudentCertificatesPage() {
  const { userData, loading: userLoading } = useCurrentUser()
  const currentUserId = userData?.id

  const [selectedCertificate, setSelectedCertificate] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [yearFilter, setYearFilter] = useState("all")

  const { toast } = useToast()

  const { certificates, loading, error } = useCertificates({
    user: currentUserId,
    type: typeFilter !== "all" ? typeFilter : undefined,
  })

  const filteredCertificates = certificates.filter((cert: any) => {
    const matchesSearch =
      cert.hackathon?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.achievement?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = yearFilter === "all" || new Date(cert.issueDate).getFullYear().toString() === yearFilter

    return matchesSearch && matchesYear
  })

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "Winner":
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case "Special Award":
        return <Star className="h-5 w-5 text-purple-500" />
      case "Participation":
        return <Medal className="h-5 w-5 text-blue-500" />
      default:
        return <Award className="h-5 w-5 text-gray-500" />
    }
  }

  const getAchievementColor = (type: string) => {
    switch (type) {
      case "Winner":
        return "bg-yellow-100 text-yellow-800"
      case "Special Award":
        return "bg-purple-100 text-purple-800"
      case "Participation":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDownload = (certificate: any) => {
    toast({
      title: "Download Started",
      description: `Downloading certificate for ${certificate.hackathon?.title}`,
    })
  }

  const handleShare = (certificate: any) => {
    if (navigator.share) {
      navigator.share({
        title: `Certificate - ${certificate.achievement}`,
        text: `I earned a certificate for ${certificate.achievement} in ${certificate.hackathon?.title}`,
        url: certificate.verificationUrl,
      })
    } else {
      navigator.clipboard.writeText(certificate.verificationUrl)
      toast({
        title: "Link Copied",
        description: "Certificate verification link copied to clipboard",
      })
    }
  }

  const handleVerify = (certificate: any) => {
    window.open(certificate.verificationUrl, "_blank")
  }

  const stats = {
    total: certificates.length,
    winners: certificates.filter((c: any) => c.type === "Winner").length,
    specialAwards: certificates.filter((c: any) => c.type === "Special Award").length,
    participations: certificates.filter((c: any) => c.type === "Participation").length,
  }

  if (loading) {
    return (
      <DashboardLayout userRole="student">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading certificates...</span>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userRole="student">
        <div className="text-center py-8">
          <p className="text-red-600">Error: {error}</p>
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
            <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
            <p className="text-gray-600">View and manage your hackathon achievements</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Certificates</CardTitle>
              <Award className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-1">Across all hackathons</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Winner Certificates</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.winners}</div>
              <p className="text-xs text-gray-600 mt-1">1st, 2nd, 3rd place wins</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Special Awards</CardTitle>
              <Star className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.specialAwards}</div>
              <p className="text-xs text-gray-600 mt-1">Best design, innovation, etc.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Participations</CardTitle>
              <Medal className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.participations}</div>
              <p className="text-xs text-gray-600 mt-1">Completion certificates</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search certificates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Winner">Winner Certificates</SelectItem>
                  <SelectItem value="Special Award">Special Awards</SelectItem>
                  <SelectItem value="Participation">Participation</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Certificates Grid */}
        <div className="grid gap-6">
          {filteredCertificates.map((certificate: any) => (
            <Card key={certificate._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    {getAchievementIcon(certificate.type)}
                    <div>
                      <CardTitle className="text-xl">{certificate.hackathon?.title}</CardTitle>
                      <CardDescription className="mt-1">{certificate.achievement}</CardDescription>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getAchievementColor(certificate.type)}>{certificate.type}</Badge>
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(certificate.issueDate).toLocaleDateString()}
                        </Badge>
                        {certificate.rank && <Badge variant="outline">Rank #{certificate.rank}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCertificate(certificate)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleShare(certificate)}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(certificate)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Certificate ID:</span>
                      <p className="font-mono text-xs">{certificate.certificateNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Issue Date:</span>
                      <p className="font-medium">{new Date(certificate.issueDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Achievement:</span>
                      <p className="font-medium">{certificate.achievement}</p>
                    </div>
                  </div>

                  {certificate.skills && certificate.skills.length > 0 && (
                    <div>
                      <span className="text-gray-600 text-sm">Skills Demonstrated:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {certificate.skills.map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      Verification: {certificate.verificationUrl ? "Available" : "Not available"}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleVerify(certificate)}>
                        Verify Certificate
                      </Button>
                      <Button size="sm" onClick={() => handleDownload(certificate)}>
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCertificates.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {certificates.length === 0
                  ? "No certificates earned yet."
                  : "No certificates found matching your criteria."}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Participate in hackathons to earn certificates and showcase your achievements!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Certificate Details Modal */}
        {selectedCertificate && (
          <Dialog open={!!selectedCertificate} onOpenChange={() => setSelectedCertificate(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getAchievementIcon(selectedCertificate.type)}
                  {selectedCertificate.hackathon?.title}
                </DialogTitle>
                <DialogDescription>{selectedCertificate.achievement}</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Certificate Preview */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg border-2 border-dashed border-blue-200">
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">{getAchievementIcon(selectedCertificate.type)}</div>
                    <h3 className="text-2xl font-bold text-gray-900">Certificate of Achievement</h3>
                    <p className="text-lg text-gray-700">This certifies that</p>
                    <p className="text-xl font-bold text-blue-600">{selectedCertificate.user?.name || "Student"}</p>
                    <p className="text-lg text-gray-700">has successfully achieved</p>
                    <p className="text-xl font-semibold text-gray-900">{selectedCertificate.achievement}</p>
                    <p className="text-lg text-gray-700">in the</p>
                    <p className="text-xl font-bold text-purple-600">{selectedCertificate.hackathon?.title}</p>
                    <div className="pt-4">
                      <p className="text-sm text-gray-600">
                        Issued on {new Date(selectedCertificate.issueDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Certificate ID: {selectedCertificate.certificateNumber}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Certificate Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Achievement Type:</span>
                      <Badge className={getAchievementColor(selectedCertificate.type)}>
                        {selectedCertificate.type}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Issue Date:</span>
                      <p className="font-medium">{new Date(selectedCertificate.issueDate).toLocaleDateString()}</p>
                    </div>
                    {selectedCertificate.rank && (
                      <div>
                        <span className="text-sm text-gray-600">Rank:</span>
                        <p className="font-medium">#{selectedCertificate.rank}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm text-gray-600">Hackathon:</span>
                      <p className="font-medium">{selectedCertificate.hackathon?.title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Certificate ID:</span>
                      <p className="font-mono text-sm">{selectedCertificate.certificateNumber}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Verification:</span>
                      <p className="text-sm text-green-600">✓ Verified</p>
                    </div>
                  </div>
                </div>

                {selectedCertificate.skills && selectedCertificate.skills.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Skills Demonstrated:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCertificate.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => handleVerify(selectedCertificate)}>
                    Verify Online
                  </Button>
                  <Button variant="outline" onClick={() => handleShare(selectedCertificate)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button onClick={() => handleDownload(selectedCertificate)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
