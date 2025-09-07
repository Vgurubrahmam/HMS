import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  userProfile: {
    username: string;
    id: string;
    email: string;
    phone?: string;
    branch?: string;
    year?: string;
    gender?: string;
    github?: string;
    image?:string;
  };
}

function ProfileForm({ userProfile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    username: userProfile?.username || "",
    id: userProfile?.id || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone || "",
    branch: userProfile?.branch || "",
    year: userProfile?.year || "",
    gender: userProfile?.gender || "",
    github: userProfile?.github || "",
    image:userProfile?.image||"",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        alert("Profile updated successfully");
      } else {
        alert(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Username"
        required
      />
      <Input
        name="id"
        value={formData.id}
        onChange={handleChange}
        placeholder="ID"
        required
        disabled
      />
      <Input
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
    <Input
    name="image"
    value={formData.image}
    onChange={handleChange}
    placeholder="Profile"

    />
      <Input
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Phone Number"
      />
      <Input
        name="branch"
        value={formData.branch}
        onChange={handleChange}
        placeholder="Branch"
      />
      <Input
        name="year"
        value={formData.year}
        onChange={handleChange}
        placeholder="Year"
      />
      <Input
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        placeholder="Gender"
      />
      <Input
        name="github"
        value={formData.github}
        onChange={handleChange}
        placeholder="GitHub Link"
      />
      <Button type="submit">Save</Button>
    </form>
  );
}

export default ProfileForm;
