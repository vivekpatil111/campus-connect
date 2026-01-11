import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, AlertCircle, Clock, Building, GraduationCap, Briefcase, Linkedin, Github } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  status: "pending" | "approved" | "rejected";
}

export function MentorProfileCard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AlumniProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch alumni profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "alumniProfiles", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile({ uid: docSnap.id, ...docSnap.data() } as AlumniProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const getStatusIcon = () => {
    switch (profile?.status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (profile?.status) {
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return "Pending";
    }
  };

  const getStatusBadgeVariant = () => {
    switch (profile?.status) {
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Mentor Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <CardTitle>Mentor Profile</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No profile found. Please complete your verification form.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Mentor Profile</span>
          <Badge variant={getStatusBadgeVariant()} className="flex items-center gap-1">
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-indigo-600 text-white text-lg">
              {profile.fullName ? profile.fullName.charAt(0) : 'A'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{profile.fullName}</h3>
            <p className="text-gray-600">{profile.role}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Company Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Company</p>
                <p className="font-medium">{profile.company}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Experience</p>
                <p className="font-medium">{profile.experience} years</p>
              </div>
            </div>
          </div>

          {/* Education Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">College</p>
                <p className="font-medium">{profile.college}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{profile.department}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Branch</p>
                <p className="font-medium">{profile.branch}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Passing Year</p>
                <p className="font-medium">{profile.passingYear}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">About Me</h4>
          <p className="text-gray-600">{profile.bio}</p>
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {profile.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-gray-500">No skills listed</p>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          {profile.linkedin && (
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          )}
          {profile.github && (
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-800 hover:text-gray-900"
            >
              <Github className="w-5 h-5" />
            </a>
          )}
        </div>

        {/* Status Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Profile Status</h4>
          <p className="text-sm text-blue-700">
            {profile.status === "pending" && "Your profile is under review by admin. Once approved, students will be able to see your profile and request mentorship."}
            {profile.status === "approved" && "Your profile is verified and visible to students. You can now receive mentorship requests."}
            {profile.status === "rejected" && "Your profile was not approved. Please review the requirements and update your profile."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}