import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Linkedin, Github, FileText, IdCard, CheckCircle, AlertCircle } from "lucide-react";

interface AlumniProfile {
  uid: string;
  fullName: string;
  college: string;
  department: string;
  branch: string;
  passingYear: number;
  company: string;
  role: string;
  linkedin: string;
  github: string;
  experience: number;
  bio: string;
  skills: string[];
  resumeUrl: string;
  idProofUrl: string;
  status: "pending" | "approved" | "rejected";
}

export function AlumniVerificationForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<AlumniProfile>({
    uid: "",
    fullName: "",
    college: "",
    department: "",
    branch: "",
    passingYear: new Date().getFullYear(),
    company: "",
    role: "",
    linkedin: "",
    github: "",
    experience: 0,
    bio: "",
    skills: [],
    resumeUrl: "",
    idProofUrl: "",
    status: "pending"
  });

  // Mock colleges and departments
  const colleges = [
    { value: "NMIMS", label: "NMIMS" },
    { value: "IIT Bombay", label: "IIT Bombay" },
    { value: "BITS Pilani", label: "BITS Pilani" },
    { value: "Delhi University", label: "Delhi University" },
    { value: "Mumbai University", label: "Mumbai University" }
  ];

  const departments = [
    { value: "Engineering", label: "Engineering" },
    { value: "Management", label: "Management" },
    { value: "Science", label: "Science" },
    { value: "Commerce", label: "Commerce" },
    { value: "Arts", label: "Arts" }
  ];

  // Load existing profile if it exists
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "alumniProfiles", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as AlumniProfile;
          setProfile({
            ...data,
            uid: user.uid,
            skills: data.skills || [] // Ensure skills is always an array
          });
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

  const handleChange = (field: keyof AlumniProfile, value: string | number | string[]) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillsChange = (value: string) => {
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
    setProfile(prev => ({ ...prev, skills: skillsArray }));
  };

  const handleFileUpload = async (file: File, field: 'resumeUrl' | 'idProofUrl') => {
    // In a real implementation, this would upload to Firebase Storage
    // For now, we'll just store the file name
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        resolve(`https://firebasestorage.googleapis.com/v0/b/prepwise-mvp.appspot.com/o/${field}-${file.name}?alt=media`);
      }, 1000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // In a real implementation, handle file uploads first
      // const resumeUrl = profile.resumeFile ? await handleFileUpload(profile.resumeFile, 'resumeUrl') : profile.resumeUrl;
      // const idProofUrl = profile.idProofFile ? await handleFileUpload(profile.idProofFile, 'idProofUrl') : profile.idProofUrl;

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
        <CardTitle>Alumni Verification Form</CardTitle>
        <CardDescription>
          Fill in your details to be verified by admin. Once approved, students will be able to see your profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={profile.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                required
              />
            </div>

            {/* College */}
            <div className="space-y-2">
              <Label htmlFor="college">College *</Label>
              <Select
                value={profile.college}
                onValueChange={(value) => handleChange("college", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select college" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college) => (
                    <SelectItem key={college.value} value={college.value}>
                      {college.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={profile.department}
                onValueChange={(value) => handleChange("department", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <Label htmlFor="branch">Branch / Specialization *</Label>
              <Input
                id="branch"
                value={profile.branch}
                onChange={(e) => handleChange("branch", e.target.value)}
                required
              />
            </div>

            {/* Passing Year */}
            <div className="space-y-2">
              <Label htmlFor="passingYear">Passing Year *</Label>
              <Select
                value={profile.passingYear.toString()}
                onValueChange={(value) => handleChange("passingYear", parseInt(value))}
                required
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

            {/* Current Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Current Company *</Label>
              <Input
                id="company"
                value={profile.company}
                onChange={(e) => handleChange("company", e.target.value)}
                required
              />
            </div>

            {/* Current Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Current Role / Designation *</Label>
              <Input
                id="role"
                value={profile.role}
                onChange={(e) => handleChange("role", e.target.value)}
                required
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn Profile URL *</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="linkedin"
                  type="url"
                  value={profile.linkedin}
                  onChange={(e) => handleChange("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* GitHub */}
            <div className="space-y-2">
              <Label htmlFor="github">GitHub Profile URL</Label>
              <div className="relative">
                <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="github"
                  type="url"
                  value={profile.github}
                  onChange={(e) => handleChange("github", e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label htmlFor="experience">Work Experience (Years) *</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                value={profile.experience}
                onChange={(e) => handleChange("experience", parseInt(e.target.value) || 0)}
                required
              />
            </div>

            {/* Skills */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="skills">Skills (comma separated) *</Label>
              <Input
                id="skills"
                value={profile.skills.join(', ')}
                onChange={(e) => handleSkillsChange(e.target.value)}
                placeholder="e.g., JavaScript, React, Node.js, Python"
                required
              />
              <p className="text-xs text-gray-500">Enter your skills separated by commas</p>
            </div>

            {/* Bio */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="bio">Short Bio / Career Summary *</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Briefly describe your career journey and expertise"
                rows={4}
                required
              />
            </div>

            {/* File Uploads */}
            <div className="space-y-4 md:col-span-2">
              <div className="space-y-2">
                <Label htmlFor="resume">Resume Upload (PDF)</Label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileText className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF files only</p>
                    </div>
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      // onChange={(e) => handleFileChange(e, 'resumeFile')}
                    />
                  </label>
                </div>
                {profile.resumeUrl && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>Resume uploaded</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idProof">ID Proof / College Proof</Label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <IdCard className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF or Image files</p>
                    </div>
                    <Input
                      id="idProof"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      // onChange={(e) => handleFileChange(e, 'idProofFile')}
                    />
                  </label>
                </div>
                {profile.idProofUrl && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    <span>ID Proof uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status and Submit */}
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
              {submitting ? "Submitting..." : profile.status === "pending" ? "Submit for Verification" : "Update Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}