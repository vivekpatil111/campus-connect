import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AlumniProfile {
  uid: string;
  college: string;
  department: string;
  passingYear: string;
  company: string;
  role: string;
  status: "pending" | "approved" | "rejected";
}

export function AlumniProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<AlumniProfile>({
    uid: "",
    college: "",
    department: "",
    passingYear: "",
    company: "",
    role: "",
    status: "pending"
  });

  // Load existing profile if it exists
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const docRef = doc(db, "alumniProfiles", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProfile({ ...docSnap.data() as AlumniProfile, uid: user.uid });
        } else {
          setProfile(prev => ({ ...prev, uid: user.uid }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, toast]);

  const handleChange = (field: keyof AlumniProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await setDoc(doc(db, "alumniProfiles", user!.uid), {
        ...profile,
        uid: user!.uid,
        status: "pending",
        updatedAt: new Date()
      });
      
      toast({
        title: "Profile Submitted",
        description: "Your profile has been submitted for verification. Please wait for admin approval."
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Alumni Profile</CardTitle>
        <CardDescription>
          Fill in your details to be verified by admin. Once approved, students will be able to see your profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="college">College *</Label>
              <Input
                id="college"
                value={profile.college}
                onChange={(e) => handleChange("college", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                value={profile.department}
                onChange={(e) => handleChange("department", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="passingYear">Passing Year *</Label>
              <Select 
                value={profile.passingYear} 
                onValueChange={(value) => handleChange("passingYear", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={profile.company}
                onChange={(e) => handleChange("company", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={profile.role}
                onChange={(e) => handleChange("role", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4">
            <div>
              {profile.status !== "pending" && (
                <p className="text-sm text-gray-600">
                  Status:{" "}
                  <span className={`font-medium ${
                    profile.status === "approved" ? "text-green-600" : "text-red-600"
                  }`}>
                    {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                  </span>
                </p>
              )}
            </div>
            
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit for Verification"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}