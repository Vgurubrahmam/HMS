"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar, Users, Plus, Edit, Trash2, Eye, MapPin, DollarSign, IndianRupee } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CoordinatorHackathonsPage() {
const [hackathons, setHackathons] = useState<Hackathon[]>([])

  const [selectedHackathon, setSelectedHackathon] = useState<any>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newHackathon, setNewHackathon] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    registrationFee: "",
    maxParticipants: "",
    registrationDeadline: "",
    venue: "",
    categories: "",
    prizes: "",
    currentParticipants: "",
    mentorAssigned: "",
    teamsFormed: "",
    status: "Planning",
  })

  const { toast } = useToast()
  interface Hackathon {
    id: number | string
    title: string
    description: string
    status: string
    startDate: string
    endDate: string
    registrationFee: number
    registrationDeadline: string
    maxParticipants: number
    currentParticipants: number
    venue: string
    prizes: string[]
    categories: string[]
    mentorAssigned: number
    teamsFormed: number
  }

  interface NewHackathon {
    title: string
    description: string
    startDate: string
    registrationDeadline: string
    endDate: string
    registrationFee: string
    maxParticipants: string
    venue: string
    categories: string
    prizes: string
    currentParticipants: string
    mentorAssigned: string
    teamsFormed: string
    status: string
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Registration Open":
        return "bg-blue-100 text-blue-800"
      case "Planning":
        return "bg-yellow-100 text-yellow-800"
      case "Completed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (
        !newHackathon.title ||
        !newHackathon.description ||
        !newHackathon.startDate ||
        !newHackathon.endDate ||
        !newHackathon.registrationDeadline ||
        !newHackathon.registrationFee ||
        !newHackathon.maxParticipants ||
        !newHackathon.venue ||
        !newHackathon.categories ||
        !newHackathon.prizes ||
        !newHackathon.mentorAssigned ||
        !newHackathon.teamsFormed
      ) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all required fields",
        });
        setLoading(false);
        return;
      }

      // Format hackathon data
      const formattedHackathon = {
        title: newHackathon.title,
        description: newHackathon.description,
        startDate: newHackathon.startDate,
        endDate: newHackathon.endDate,

        registrationDeadline: newHackathon.registrationDeadline,
        registrationFee: Number.parseInt(newHackathon.registrationFee),
        maxParticipants: Number.parseInt(newHackathon.maxParticipants),
        venue: newHackathon.venue,
        categories: newHackathon.categories
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c),
        prizes: newHackathon.prizes
          .split(",")
          .map((p) => p.trim())
          .filter((p) => p),
        status: newHackathon.status || "Planning",
        currentParticipants: Number.parseInt(newHackathon.currentParticipants) || 0,
        mentorAssigned: Number.parseInt(newHackathon.mentorAssigned) || 0,
        teamsFormed: Number.parseInt(newHackathon.teamsFormed) || 0,
      };

      const res = await fetch("/api/hackathons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedHackathon),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Error creating hackathon",
        });
        throw new Error(data.message || "Error creating hackathon");
      }

      // On success, update hackathons state and reset form
      setHackathons([
        ...hackathons,
        {
          id: data.hackathon.id, // Use MongoDB _id from response
          ...formattedHackathon,
          startDate: new Date(formattedHackathon.startDate).toISOString().split("T")[0],
          endDate: new Date(formattedHackathon.endDate).toISOString().split("T")[0],
          registrationDeadline: new Date(formattedHackathon.registrationDeadline).toISOString().split("T")[0],
        },
      ]);

      setNewHackathon({
        title: "",
        description: "",
        startDate: "",
        registrationDeadline: "",
        endDate: "",
        registrationFee: "",
        maxParticipants: "",
        venue: "",
        categories: "",
        prizes: "",
        currentParticipants: "",
        mentorAssigned: "",
        teamsFormed: "",
        status: "Planning"
      });

      setIsCreateDialogOpen(false);

      toast({
        title: "Hackathon Created",
        description: data.message || "New hackathon has been successfully created.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong during Hackathon Creation.",
      });
    } finally {
      setLoading(false);
    }
  };

  // get method hackthon
  useEffect(() => {
    const fetchHackathons = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/hackathons", {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        })
        const data = await res.json()

        if (res.ok) {
          setHackathons(data.data)
          // toast({
          //   title: "Success",
          //   description: "Hackathons fetched successfully",
          // })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: data.message || "Error feteching hackthons"
          })
        }

      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Something went wrong while fetching hackathons"

        })
      } finally {
        setLoading(false)
      }
    }
    fetchHackathons()
  }, [])


  const handleDeleteHackathon = async (id: string) => {
    setLoading(true);


    try {
      const res = await fetch(`/api/hackathons/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.message || "Error deleting hackathon",
        });
        throw new Error(data.message || "Error deleting hackathon");
      }

      setHackathons((prev) => prev.filter((h) => {
        const hackathonId = (h as any)._id ?? h.id;
        return String(hackathonId) !== String(id);
      }));

      toast({
        title: "Hackathon Deleted",
        description: data.message || "Hackathon has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Something went wrong during deletion.",
      });
    } finally {
      setLoading(false);
    }
  };
  // put method
  // Debugged handleUpdateHackathon
  const handleUpdateHackathon = async (id: string, updatedData: Partial<NewHackathon>) => {
    console.log('Updating hackathon with ID:', id); // Debug log

    if (!id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Hackathon ID is missing.',
      });
      return;
    }

    if (!selectedHackathon || selectedHackathon._id !== id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Selected hackathon mismatch.',
      });
      return;
    }

    setLoading(true);
    try {
      // Validate required fields
      if (
        !updatedData.title ||
        !updatedData.description ||
        !updatedData.startDate ||
        !updatedData.endDate ||
        !updatedData.registrationDeadline ||
        !updatedData.registrationFee ||
        !updatedData.maxParticipants ||
        !updatedData.venue ||
        !updatedData.categories ||
        !updatedData.prizes ||
        !updatedData.mentorAssigned ||
        !updatedData.teamsFormed
      ) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Please fill in all required fields',
        });
        return;
      }

      // Format data for backend
      const formattedData = {
        _id: id, // Ensure ID is included in the formatted data
        title: updatedData.title,
        description: updatedData.description,
        startDate: updatedData.startDate,
        endDate: updatedData.endDate,
        registrationDeadline: updatedData.registrationDeadline,
        registrationFee: Number.parseInt(updatedData.registrationFee as string),
        maxParticipants: Number.parseInt(updatedData.maxParticipants as string),
        venue: updatedData.venue,
        categories: updatedData.categories
          ?.split(',')
          .map((c) => c.trim())
          .filter((c) => c) || [],
        prizes: updatedData.prizes
          ?.split(',')
          .map((p) => p.trim())
          .filter((p) => p) || [],
        status: updatedData.status || 'Planning',
        currentParticipants: Number.parseInt(updatedData.currentParticipants as string) || 0,
        mentorAssigned: Number.parseInt(updatedData.mentorAssigned as string) || 0,
        teamsFormed: Number.parseInt(updatedData.teamsFormed as string) || 0,
      };

      const res = await fetch(`/api/hackathons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: data.message || 'Error updating hackathon',
        });
        throw new Error(data.message || 'Error updating hackathon');
      }

      // Update state with formatted data
      setHackathons((prev) =>
        prev.map((h: any) => {
          // Get the hackathon ID, handling both MongoDB _id and regular id
          const hackathonId = h._id || h.id;
          
          // Only update if IDs match
          if (String(hackathonId) === String(id)) {
            console.log('Updating hackathon:', id); // Debug log
            return {
              ...h, // Keep existing properties
              ...formattedData, // Update with new data
              _id: hackathonId, // Preserve the ID
              id: hackathonId, // Preserve the ID
              startDate: new Date(formattedData.startDate).toISOString().split('T')[0],
              endDate: new Date(formattedData.endDate).toISOString().split('T')[0],
              registrationDeadline: new Date(formattedData.registrationDeadline).toISOString().split('T')[0],
            };
          }
          return h; // Return unchanged for non-matching IDs
        })
      );

      setIsEditDialogOpen(false);
      toast({
        title: 'Hackathon Updated',
        description: data.message || 'Hackathon has been successfully updated.',
      });
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Something went wrong during update.',
      });
    } finally {
      setLoading(false);
    }
  };

  // State for editing hackathon
  const [editHackathon, setEditHackathon] = useState<NewHackathon>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationDeadline: "",
    registrationFee: '',
    maxParticipants: '',
    venue: '',
    categories: '',
    prizes: '',
    currentParticipants: '',
    mentorAssigned: '',
    teamsFormed: '',
    status: 'Planning',
  });

  // Initialize edit form with selected hackathon data
  const handleEditClick = (hackathon: Hackathon) => {
    const formatDate = (date: string | Date) => {
      if (!date) return '';
      const d = new Date(date);
      return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
    };

    // Set the selected hackathon first
    setSelectedHackathon(hackathon);

    setEditHackathon({
      title: hackathon.title || "",
      description: hackathon.description || "",
      startDate: formatDate(hackathon.startDate),
      endDate: formatDate(hackathon.endDate),
      registrationDeadline: formatDate(hackathon.registrationDeadline),
      registrationFee: hackathon.registrationFee?.toString() || "",
      maxParticipants: hackathon.maxParticipants?.toString() || "",
      venue: hackathon.venue || "",
      categories: hackathon.categories?.join(", ") || "",
      prizes: hackathon.prizes?.join(", ") || "",
      currentParticipants: hackathon.currentParticipants?.toString() || "",
      mentorAssigned: hackathon.mentorAssigned?.toString() || "",
      teamsFormed: hackathon.teamsFormed?.toString() || "",
      status: hackathon.status || "Planning",
    });

    setIsEditDialogOpen(true);
  };
  return (
    <DashboardLayout userRole="coordinator">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hackathon Management</h1>
            <p className="text-gray-600">Create, manage, and monitor all hackathon events</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Hackathon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Hackathon</DialogTitle>
                <DialogDescription>Fill in the details to create a new hackathon event</DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { handleSubmit(e); }}>
                <div className="grid gap-4 py-4">
                  {/* Title and Venue */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                      <Input
                        id="title"
                        value={newHackathon.title}
                        onChange={(e) => setNewHackathon({ ...newHackathon, title: e.target.value })}
                        placeholder="Hackathon title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="venue">Venue <span className="text-red-500">*</span></Label>
                      <Input
                        id="venue"
                        value={newHackathon.venue}
                        onChange={(e) => setNewHackathon({ ...newHackathon, venue: e.target.value })}
                        placeholder="Event venue"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
                    <Textarea
                      id="description"
                      value={newHackathon.description}
                      onChange={(e) => setNewHackathon({ ...newHackathon, description: e.target.value })}
                      placeholder="Hackathon description"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Start and End Dates */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date <span className="text-red-500">*</span></Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newHackathon.startDate}
                        onChange={(e) => setNewHackathon({ ...newHackathon, startDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date <span className="text-red-500">*</span></Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newHackathon.endDate}
                        onChange={(e) => setNewHackathon({ ...newHackathon, endDate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registrationDeadline">Registration Deadline <span className="text-red-500">*</span></Label>
                      <Input
                        id="registrationDeadline"
                        type="date"
                        value={newHackathon.registrationDeadline}
                        onChange={(e) => setNewHackathon({ ...newHackathon, registrationDeadline: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Registration Fee and Max Participants */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registrationFee">Registration Fee ($) <span className="text-red-500">*</span></Label>
                      <Input
                        id="registrationFee"
                        type="number"
                        value={newHackathon.registrationFee}
                        onChange={(e) => setNewHackathon({ ...newHackathon, registrationFee: e.target.value })}
                        placeholder="50"
                        required
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxParticipants">Max Participants <span className="text-red-500">*</span></Label>
                      <Input
                        id="maxParticipants"
                        type="number"
                        value={newHackathon.maxParticipants}
                        onChange={(e) => setNewHackathon({ ...newHackathon, maxParticipants: e.target.value })}
                        placeholder="200"
                        required
                        min="1"
                      />
                    </div>
                    {/* Status */}
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <select
                        id="status"
                        value={newHackathon.status || "Planning"}
                        onChange={(e) => setNewHackathon({ ...newHackathon, status: e.target.value })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="Planning">Planning</option>
                        <option value="Registration Open">Registration Open</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>





                  {/* Additional Fields with Defaults */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentParticipants">Current Participants</Label>
                      <Input
                        id="currentParticipants"
                        type="number"
                        value={newHackathon.currentParticipants}
                        onChange={(e) =>
                          setNewHackathon({
                            ...newHackathon,
                            currentParticipants: e.target.value,
                          })
                        }
                        placeholder="0"
                        min="0"
                      />

                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mentorAssigned">Mentors Assigned</Label>
                      <Input
                        id="mentorAssigned"
                        type="number"
                        value={newHackathon.mentorAssigned}
                        onChange={(e) => setNewHackathon({ ...newHackathon, mentorAssigned: e.target.value })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamsFormed">Teams Formed</Label>
                      <Input
                        id="teamsFormed"
                        type="number"
                        value={newHackathon.teamsFormed}
                        onChange={(e) => setNewHackathon({ ...newHackathon, teamsFormed: e.target.value })}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                  {/* Categories and Prizes */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="categories">Categories (comma-separated) <span className="text-red-500">*</span></Label>
                      <Input
                        id="categories"
                        value={newHackathon.categories}
                        onChange={(e) => setNewHackathon({ ...newHackathon, categories: e.target.value })}
                        placeholder="AI/ML, Web Development, Mobile Apps"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="prizes">Prizes (comma-separated) <span className="text-red-500">*</span></Label>
                      <Input
                        id="prizes"
                        value={newHackathon.prizes}
                        onChange={(e) => setNewHackathon({ ...newHackathon, prizes: e.target.value })}
                        placeholder="$5000, $3000, $1000"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Hackathon
                  </Button>
                </div>

              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Hackathons Grid */}
        <div className="grid gap-6">
          {hackathons.map((hackathon: any) => (
            <Card key={hackathon.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{hackathon.title}</CardTitle>
                    <CardDescription className="mt-2">{hackathon.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(hackathon.status)}>{hackathon.status}</Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedHackathon(hackathon)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Dialog key={hackathon._id} open={isEditDialogOpen && selectedHackathon?._id === hackathon._id} onOpenChange={(open) => {
                          if (!open) {
                            setIsEditDialogOpen(false);
                            setSelectedHackathon(null);
                          }
                        }}>
                        <DialogTrigger asChild>
                          <button className="" onClick={() => handleEditClick(hackathon)}>
                            <Edit className="mr-2 h-4 w-4" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Hackathon</DialogTitle>
                            <DialogDescription>Update the details of the hackathon</DialogDescription>
                          </DialogHeader>
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (selectedHackathon?._id) {
                                handleUpdateHackathon(selectedHackathon._id, editHackathon);
                              }
                            }}
                          >
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-title">Title <span className="text-red-500">*</span></Label>
                                  <Input
                                    id="edit-title"
                                    value={editHackathon.title}
                                    onChange={(e) => setEditHackathon({ ...editHackathon, title: e.target.value })}
                                    placeholder="Hackathon title"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-venue">Venue <span className="text-red-500">*</span></Label>
                                  <Input
                                    id="edit-venue"
                                    value={editHackathon.venue}
                                    onChange={(e) => setEditHackathon({ ...editHackathon, venue: e.target.value })}
                                    placeholder="Event venue"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-description">Description <span className="text-red-500">*</span></Label>
                                <Textarea
                                  id="edit-description"
                                  value={editHackathon.description}
                                  onChange={(e) => setEditHackathon({ ...editHackathon, description: e.target.value })}
                                  placeholder="Hackathon description"
                                  rows={3}
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-startDate">Start Date <span className="text-red-500">*</span></Label>
                                  <Input
                                    id="edit-startDate"
                                    type="date"
                                    value={editHackathon.startDate}
                                    onChange={(e) => setEditHackathon({ ...editHackathon, startDate: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-endDate">End Date <span className="text-red-500">*</span></Label>
                                  <Input
                                    id="edit-endDate"
                                    type="date"
                                    value={editHackathon.endDate}
                                    onChange={(e) => setEditHackathon({ ...editHackathon, endDate: e.target.value })}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-registrationDeadline"> registration Deadline<span className="text-red-500">*</span></Label>
                                  <Input
                                    id="edit-registrationDeadline"
                                    type="date"
                                    value={editHackathon.registrationDeadline}
                                    onChange={(e) => setEditHackathon({ ...editHackathon, registrationDeadline: e.target.value })}
                                    required
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-registrationFee">Registration Fee ($) <span className="text-red-500">*</span></Label>
                                  <Input
                                    id="edit-registrationFee"
                                    type="number"
                                    value={editHackathon.registrationFee}
                                    onChange={(e) => setEditHackathon({ ...editHackathon, registrationFee: e.target.value })}
                                    placeholder="50"
                                    required
                                    min="0"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-maxParticipants">Max Participants <span className="text-red-500">*</span></Label>
                                  <Input
                                    id="edit-maxParticipants"
                                    type="number"
                                    value={editHackathon.maxParticipants}
                                    onChange={(e) => setEditHackathon({ ...editHackathon, maxParticipants: e.target.value })}
                                    placeholder="200"
                                    required
                                    min="1"
                                  />
                                </div>
                                {/* Status */}
                                <div className="space-y-2">
                                  <Label htmlFor="status">Status</Label>
                                  <select
                                    id="status"
                                    value={editHackathon.status}
                                    onChange={(e) => setEditHackathon({ ...editHackathon, status: e.target.value })}
                                    className="w-full p-2 border rounded-md"
                                  >
                                    <option value="Planning">Planning</option>
                                    <option value="Registration Open">Registration Open</option>
                                    <option value="Active">Active</option>
                                    <option value="Completed">Completed</option>
                                  </select>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-categories">Categories (comma-separated) <span className="text-red-500">*</span></Label>
                                  <Input
                                    id="edit-categories"
                                    value={editHackathon.categories}
                                    onChange={(e) => setEditHackathon({ ...editHackathon, categories: e.target.value })}
                                    placeholder="AI/ML, Web Development, Mobile Apps"
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-prizes">Prizes (comma-separated) <span className="text-red-500">*</span></Label>
                                  <Input
                                    id="edit-prizes"
                                    value={editHackathon.prizes}
                                    onChange={(e) => setEditHackathon({ ...editHackathon, prizes: e.target.value })}
                                    placeholder="$5000, $3000, $1000"
                                    required
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="currentParticipants">Current Participants</Label>
                                  <Input
                                    id="currentParticipants"
                                    type="number"
                                    value={editHackathon.currentParticipants}
                                    onChange={(e) =>
                                      setEditHackathon({
                                        ...editHackathon,
                                        currentParticipants: e.target.value,
                                      })
                                    }
                                    placeholder="0"
                                    min="0"
                                  />

                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="mentorAssigned">Mentors Assigned</Label>
                                  <Input
                                    id="mentorAssigned"
                                    type="number"
                                    value={editHackathon.mentorAssigned}
                                    onChange={(e) => setEditHackathon({ ...editHackathon, mentorAssigned: e.target.value })}
                                    placeholder="0"
                                    min="0"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="teamsFormed">Teams Formed</Label>
                                  <Input
                                    id="teamsFormed"
                                    type="number"
                                    value={editHackathon.teamsFormed}
                                    onChange={(e) => setEditHackathon({ ...editHackathon, teamsFormed: e.target.value })}
                                    placeholder="0"
                                    min="0"
                                  />
                                </div>
                              </div>

                            </div>
                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={loading}>
                                {loading ? 'Updating...' : 'Update Hackathon'}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete the hackathon "${hackathon.title}"?`)) {
                            handleDeleteHackathon(hackathon._id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    {formatDate(hackathon.startDate)} - {formatDate(hackathon.endDate)}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {hackathon.venue}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <IndianRupee className="h-4 w-4" />{hackathon.registrationFee} registration
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    {hackathon.currentParticipants}/{hackathon.maxParticipants} participants
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Registration Progress</span>
                      <span>{Math.round((hackathon.currentParticipants / hackathon.maxParticipants) * 100)}%</span>
                    </div>
                    <Progress
                      value={(hackathon.currentParticipants / hackathon.maxParticipants) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {hackathon.categories.map((category: any, index: any) => (
                      <Badge key={index} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{hackathon.currentParticipants}</p>
                      <p className="text-xs text-gray-600">Current participants</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{hackathon.mentorAssigned}</p>
                      <p className="text-xs text-gray-600">Mentors Assigned</p>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{hackathon.teamsFormed}</p>
                      <p className="text-xs text-gray-600">Teams Formed</p>
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Hackathon Details Modal */}
        {selectedHackathon && (
          <Dialog open={!!selectedHackathon} onOpenChange={() => setSelectedHackathon(null)}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{selectedHackathon.title}</DialogTitle>
                <DialogDescription>Detailed hackathon information and management</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="participants">Participants</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                  <TabsTrigger value="mentors">Mentors</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Event Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <Badge className={getStatusColor(selectedHackathon.status)}>{selectedHackathon.status}</Badge>
                        </div>
                        <div className="flex flex-col justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span>
                            Start Date : {formatDate(selectedHackathon.startDate)}
                          </span>
                          <span>
                            End Date : {formatDate(selectedHackathon.endDate)}
                          </span>
                          <span>
                            RegistrationDeadline : {formatDate(selectedHackathon.registrationDeadline)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Venue:</span>
                          <span>{selectedHackathon.venue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Registration Fee:</span>
                          <div className="flex justify-content-center items-center">
                            <IndianRupee className="h-4 w-4 "/>
                            {selectedHackathon.registrationFee}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Prizes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {selectedHackathon.prizes.map((prize: string, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-gray-600">
                                {index === 0 ? "1st Place" : index === 1 ? "2nd Place" : "3rd Place"}:
                              </span>
                              <span className="font-medium">{prize}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="participants">
                  <Card>
                    <CardHeader>
                      <CardTitle>Registered Participants</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">Participant management interface would go here... and which registered there names will get here </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="teams">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">Team formation and management interface would go here...  and which teams are formed dynamically there data get here</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="mentors">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mentor Assignment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">Mentor assignment interface would go here... which mentor is active for upcoming hacthons</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
