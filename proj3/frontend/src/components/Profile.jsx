 
import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // adjust your import
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import ReviewsList from './ReviewsList';

export default function Profile({ user, onUpdate }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    location: {
      address: "",
      city: "",
      state: "",
      zip_code: "",
      latitude: 0,
      longitude: 0,
    },
    bio: "",
    profile_picture: "",
    dietary_preferences: {
      dietary_restrictions: [],
      allergens: [],
      cuisine_preferences: [],
      spice_level: "",
    },
    social_media: {
      facebook: "",
      instagram: "",
      twitter: "",
    },
  });

  useEffect(() => {
    if (user) setFormData(user);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNestedChange = (parent, key, value) => {
  setFormData(prev => ({
    ...prev,
    [parent]: {
      ...prev[parent],
      [key]: value
    }
  }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("email");
      const res = await fetch("http://localhost:8000/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const updatedUser = await res.json();
      toast.success("Profile updated!");
      if (onUpdate) onUpdate(updatedUser);
      setIsEditing(false); 
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };


  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return; // Stop if user cancels
    
    try {
      const res = await fetch("http://localhost:8000/api/users/me", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${user.email}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete account");
      toast.success("Account deleted!");
      localStorage.clear();
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Error deleting account");
    }
  };

  if (!user) {
    return <p>Loading profile...</p>;
  }

  return (
     
    <Dialog.Root>
      {/* Avatar Trigger */}
      <Dialog.Trigger asChild>
        <Avatar className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer">
          <AvatarFallback>
            <User className="w-3 h-3 sm:w-4 sm:h-4" />
          </AvatarFallback>
        </Avatar>
      </Dialog.Trigger>

      {/* Dialog Content */}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b">
            <Dialog.Title className="text-xl font-bold">Your Profile</Dialog.Title>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4">

          {!isEditing ? (
            <div className="space-y-4">
              <p><strong>Full Name:</strong> {user?.full_name || "Guest"}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phone || "-"}</p>
              <p><strong>Bio:</strong> {user.bio || "-"}</p>
              <p><strong>Location:</strong> {user.location?.address || "-"}</p>
              <p><strong>Social Media:</strong> 
                {user.social_media?.facebook && ` FB: ${user.social_media.facebook}`}
                {user.social_media?.instagram && ` IG: ${user.social_media.instagram}`}
                {user.social_media?.twitter && ` TW: ${user.social_media.twitter}`}
              </p>

              {/* Reviews Section */}
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">My Reviews</h3>
                <ReviewsList userId={user.id} />
              </div>

              <div className="flex justify-between mt-4">
                <button
                  className="cursor-pointer bg-primary text-white px-4 py-2 rounded"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
                <button
                  className="cursor-pointer bg-red-500 text-white px-4 py-2 rounded"
                  onClick={handleDelete}
                >
                  Delete Account
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic info */}
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} placeholder="Full Name" className="w-full border rounded p-2" />
              <input type="text" name="phone" value={formData.phone || ""} onChange={handleChange} placeholder="Phone" className="w-full border rounded p-2" />
              <textarea name="bio" value={formData.bio || ""} onChange={handleChange} placeholder="Bio" className="w-full border rounded p-2" />

              {/* Location */}
              <h3 className="font-semibold">Location</h3>
              {["address","city","state","zip_code"].map(field => (
                <input
                  key={field}
                  type="text"
                  value={formData.location[field] || ""}
                  onChange={e => handleNestedChange("location", field, e.target.value)}
                  placeholder={field}
                  className="w-full border rounded p-2"
                />
              ))}

              {/* Social Media */}
              <h3 className="font-semibold">Social Media</h3>
              {["facebook","instagram","twitter"].map(field => (
                <input
                  key={field}
                  type="text"
                  value={formData.social_media[field] || ""}
                  onChange={e => handleNestedChange("social_media", field, e.target.value)}
                  placeholder={field}
                  className="w-full border rounded p-2"
                />
              ))}

              <div className="flex justify-between">
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Save</button>
                <button type="button" className="text-gray-500 hover:text-gray-700" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
          </div>

          <Dialog.Close className="cursor-pointer absolute top-3 right-3 text-gray-500 hover:text-gray-700">
            ✕
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
