"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Award, 
  Download, 
  Eye, 
  Share2, 
  Calendar, 
  Trophy, 
  Medal,
  Star,
  CheckCircle,
  ExternalLink,
  Search,
  Filter
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/hooks/use-current-user"

interface Certificate {
  _id: string
  type: "Participation" | "Completion" | "Winner" | "Achievement" | "Skill"
  title: string
  description: string
  hackathon: {
    _id: string
    title: string
    organizer: string
  }
  student: {
    _id: string
    username: string
    email: string
  }
  team?: {
    name: string
    position?: number
  }
  skills?: string[]
  issuedDate: string
  validUntil?: string
  certificateUrl: string
  certificateId: string
  issuer: {
    name: string
    logo?: string
  }
  verification: {
    code: string
    url: string
  }
  metadata: {
    grade?: string
    score?: number
    totalParticipants?: number
  }
  status: "Active" | "Revoked" | "Expired"
}

interface CertificateStats {
  total: number
  participation: number
  completion: number
  achievement: number
  skill: number
}

export function DigitalCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const { userData } = useCurrentUser()
  const { toast } = useToast()

  const [stats, setStats] = useState<CertificateStats>({
    total: 0,
    participation: 0,
    completion: 0,
    achievement: 0,
    skill: 0
  })

  useEffect(() => {
    if (userData?.id) {
      fetchCertificates()
    }
  }, [userData])

  useEffect(() => {
    filterCertificates()
    calculateStats()
  }, [certificates, searchTerm, typeFilter])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/certificates/student/${userData?.id}`)
      if (response.ok) {
        const data = await response.json()
        setCertificates(data.data || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch certificates",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while fetching certificates",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterCertificates = () => {
    let filtered = certificates

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cert => 
        cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(cert => cert.type === typeFilter)
    }

    setFilteredCertificates(filtered)
  }

  const calculateStats = () => {
    const stats = {
      total: certificates.length,
      participation: certificates.filter(c => c.type === "Participation").length,
      completion: certificates.filter(c => c.type === "Completion").length,
      achievement: certificates.filter(c => c.type === "Achievement").length,
      skill: certificates.filter(c => c.type === "Skill").length,
    }
    setStats(stats)
  }

  const downloadCertificate = async (certificate: Certificate) => {
    try {
      const response = await fetch(`/api/certificates/${certificate._id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${certificate.title.replace(/\s+/g, '_')}_Certificate.pdf`
        a.click()
        toast({
          title: "Success",
          description: "Certificate downloaded successfully",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to download certificate",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const shareCertificate = async (certificate: Certificate) => {
    const shareData = {
      title: certificate.title,
      text: `I earned a ${certificate.type} certificate for ${certificate.hackathon.title}!`,
      url: certificate.verification.url
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // Fallback to copying link
        copyToClipboard(certificate.verification.url)
      }
    } else {
      copyToClipboard(certificate.verification.url)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Link Copied",
      description: "Certificate verification link copied to clipboard",
    })
  }

  const verifyCertificate = (certificate: Certificate) => {
    window.open(certificate.verification.url, '_blank')
  }

  const previewCertificate = (certificate: Certificate) => {
    setSelectedCertificate(certificate)
    setIsPreviewOpen(true)
  }

  const getCertificateIcon = (type: string) => {
    switch (type) {
      case "Participation": return <Award className="h-6 w-6 text-blue-600" />
      case "Completion": return <CheckCircle className="h-6 w-6 text-green-600" />
      case "Winner": return <Trophy className="h-6 w-6 text-yellow-600" />
      case "Achievement": return <Medal className="h-6 w-6 text-purple-600" />
      case "Skill": return <Star className="h-6 w-6 text-orange-600" />
      default: return <Award className="h-6 w-6 text-gray-600" />
    }
  }

  const getCertificateColor = (type: string) => {
    switch (type) {
      case "Participation": return "bg-blue-100 text-blue-800 border-blue-200"
      case "Completion": return "bg-green-100 text-green-800 border-green-200"
      case "Winner": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Achievement": return "bg-purple-100 text-purple-800 border-purple-200"
      case "Skill": return "bg-orange-100 text-orange-800 border-orange-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800"
      case "Revoked": return "bg-red-100 text-red-800"
      case "Expired": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Digital Certificates</h2>
          <p className="text-gray-600">View, download, and share your earned certificates</p>
        </div>
        <Button onClick={fetchCertificates} disabled={loading}>
          <Award className="mr-2 h-4 w-4" />
          Refresh Certificates
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Certificates</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold">{stats.completion}</p>
            <p className="text-sm text-gray-600">Completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
            <p className="text-2xl font-bold">{stats.achievement}</p>
            <p className="text-sm text-gray-600">Achievement</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <p className="text-2xl font-bold">{stats.skill}</p>
            <p className="text-sm text-gray-600">Skill</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Medal className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <p className="text-2xl font-bold">{stats.participation}</p>
            <p className="text-sm text-gray-600">Participation</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={typeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("all")}
              >
                All
              </Button>
              <Button
                variant={typeFilter === "Participation" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("Participation")}
              >
                Participation
              </Button>
              <Button
                variant={typeFilter === "Completion" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("Completion")}
              >
                Completion
              </Button>
              <Button
                variant={typeFilter === "Achievement" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("Achievement")}
              >
                Achievement
              </Button>
              <Button
                variant={typeFilter === "Skill" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("Skill")}
              >
                Skill
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCertificates.map((certificate) => (
          <Card key={certificate._id} className={`hover:shadow-lg transition-shadow cursor-pointer ${getCertificateColor(certificate.type)}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCertificateIcon(certificate.type)}
                  <Badge variant="outline" className="text-xs">
                    {certificate.type}
                  </Badge>
                </div>
                <Badge className={getStatusColor(certificate.status)} variant="outline">
                  {certificate.status}
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight">{certificate.title}</CardTitle>
              <CardDescription className="text-sm">
                {certificate.hackathon.title}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">{certificate.description}</p>

              {/* Certificate Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Issued:</span>
                  <span className="font-medium">{new Date(certificate.issuedDate).toLocaleDateString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <span className="font-mono text-xs">{certificate.certificateId}</span>
                </div>

                {certificate.team && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Team:</span>
                    <span className="font-medium">{certificate.team.name}</span>
                  </div>
                )}

                {certificate.team?.position && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Position:</span>
                    <span className="font-medium text-yellow-600">#{certificate.team.position}</span>
                  </div>
                )}

                {certificate.metadata?.score && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-medium">{certificate.metadata.score}/100</span>
                  </div>
                )}
              </div>

              {/* Skills */}
              {certificate.skills && certificate.skills.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 mb-2">Skills Validated:</p>
                  <div className="flex flex-wrap gap-1">
                    {certificate.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {certificate.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{certificate.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => previewCertificate(certificate)}
                  className="flex-1"
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Preview
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => downloadCertificate(certificate)}
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => shareCertificate(certificate)}
                >
                  <Share2 className="h-3 w-3" />
                </Button>
              </div>

              {/* Verification */}
              <div className="pt-2 border-t">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => verifyCertificate(certificate)}
                  className="w-full text-xs"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Verify Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCertificates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">No certificates found</p>
            <p className="text-sm text-gray-500">
              {searchTerm || typeFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Complete hackathons to earn your first certificate!"}
            </p>
            {!searchTerm && typeFilter === "all" && (
              <Button className="mt-4" onClick={() => window.location.href = '/dashboard/student/hackathons'}>
                Browse Hackathons
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Certificate Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedCertificate && getCertificateIcon(selectedCertificate.type)}
              Certificate Preview
            </DialogTitle>
          </DialogHeader>
          
          {selectedCertificate && (
            <div className="space-y-6">
              {/* Certificate Image/Preview */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg text-center border-2 border-dashed border-gray-300">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-2xl font-bold mb-2">{selectedCertificate.title}</h2>
                  <p className="text-lg text-gray-700 mb-4">
                    This certifies that <strong>{selectedCertificate.student.username}</strong> has successfully
                  </p>
                  <p className="text-base text-gray-600 mb-4">{selectedCertificate.description}</p>
                  <p className="text-lg font-semibold mb-2">{selectedCertificate.hackathon.title}</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Issued on {new Date(selectedCertificate.issuedDate).toLocaleDateString()}
                  </p>
                  <div className="border-t pt-4">
                    <p className="text-xs text-gray-500">Certificate ID: {selectedCertificate.certificateId}</p>
                    <p className="text-xs text-gray-500">Verification Code: {selectedCertificate.verification.code}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-center">
                <Button onClick={() => downloadCertificate(selectedCertificate)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => shareCertificate(selectedCertificate)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" onClick={() => verifyCertificate(selectedCertificate)}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Verify Online
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}