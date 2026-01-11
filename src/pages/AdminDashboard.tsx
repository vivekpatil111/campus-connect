"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, UserCheck, Handshake, CheckCircle, AlertCircle, Clock as ClockIcon, Search, MoreVertical, Eye, Trash2, UserPlus, UserMinus, Check, X, GraduationCap, Linkedin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

// Debug component to catch errors
const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error("Error caught by boundary:", error.error);
      setHasError(true);
      setError(error.error);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-600 font-medium">Error Loading Admin Dashboard</h3>
        <p className="text-red-500 text-sm mt-2">{error?.message}</p>
        <p className="text-red-400 text-xs mt-1">Check browser console for details</p>
      </div>
    );
  }

  return <>{children}</>;
};

interface User {
  uid: string;
  fullName: string;
  email: string;
  role: "student" | "alumni" | "admin";
  collegeName?: string;
  department?: string;
  currentYear?: string;
  createdAt?: Date;
}

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
  status: "pending" | "approved" | "rejected";
  submittedAt?: Date;
}

interface MentorshipRequest {
  id: string;
  studentId: string;
  alumniId: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  timestamp: Date;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debug state
  const [debugInfo, setDebugInfo] = useState({
    firebaseConnected: false,
    userLoaded: false,
    isAdmin: false,
    dataLoading: true
  });

  // Dashboard stats
  const [totalAlumni, setTotalAlumni] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [activeMentorships, setActiveMentorships] = useState(0);

  // Data collections
  const [pendingProfiles, setPendingProfiles] = useState<AlumniProfile[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [alumni, setAlumni] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<AlumniProfile | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isProfileDetailOpen, setIsProfileDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Debug logging
  useEffect(() => {
    console.log("AdminDashboard mounted");
    console.log("Firebase auth:", auth);
    console.log("Firebase db:", db);
    console.log("Current user:", user);
    console.log("Auth loading:", authLoading);

    // Check Firebase connection
    setDebugInfo(prev => ({
      ...prev,
      firebaseConnected: !!auth && !!db,
      userLoaded: !authLoading,
      isAdmin: user?.role === "admin"
    }));
  }, [user, authLoading]);

  // Debug: Check if user is admin
  useEffect(() => {
    if (!authLoading && user) {
      console.log("User role:", user.role);
      console.log("Is admin:", user.role === "admin");

      if (user.role !== "admin") {
        console.warn("User is not admin, redirecting...");
        navigate("/dashboard");
      }
    }
  }, [user, authLoading, navigate]);

  // Real-time data fetching
  useEffect(() => {
    if (!user || authLoading || user.role !== "admin") {
      console.log("Skipping data fetch - not admin or loading");
      return;
    }

    console.log("Starting real-time data listeners...");

    // Set up real-time listeners
    const unsubscribeListeners = [
      // Dashboard stats
      onSnapshot(query(collection(db, "users"), where("role", "==", "alumni")), (snapshot) => {
        console.log("Alumni count updated:", snapshot.size);
        setTotalAlumni(snapshot.size);
      }, (error) => {
        console.error("Error fetching alumni count:", error);
      }),

      onSnapshot(query(collection(db, "alumniProfiles"), where("status", "==", "pending")), (snapshot) => {
        console.log("Pending approvals updated:", snapshot.size);
        setPendingApprovals(snapshot.size);
      }, (error) => {
        console.error("Error fetching pending approvals:", error);
      }),

      onSnapshot(query(collection(db, "users"), where("role", "==", "student")), (snapshot) => {
        console.log("Student count updated:", snapshot.size);
        setTotalStudents(snapshot.size);
      }, (error) => {
        console.error("Error fetching student count:", error);
      }),

      onSnapshot(query(collection(db, "mentorshipRequests"), where("status", "==", "accepted")), (snapshot) => {
        console.log("Active mentorships updated:", snapshot.size);
        setActiveMentorships(snapshot.size);
      }, (error) => {
        console.error("Error fetching active mentorships:", error);
      }),

      // Pending profiles
      onSnapshot(query(collection(db, "alumniProfiles"), where("status", "==", "pending")), (snapshot) => {
        const profiles: AlumniProfile[] = [];
        snapshot.forEach((doc) => {
          profiles.push({ uid: doc.id, ...doc.data() } as AlumniProfile);
        });
        console.log("Pending profiles loaded:", profiles.length);
        setPendingProfiles(profiles);
      }, (error) => {
        console.error("Error fetching pending profiles:", error);
      }),

      // Students
      onSnapshot(query(collection(db, "users"), where("role", "==", "student")), (snapshot) => {
        const studentsList: User[] = [];
        snapshot.forEach((doc) => {
          studentsList.push({ uid: doc.id, ...doc.data() } as User);
        });
        console.log("Students loaded:", studentsList.length);
        setStudents(studentsList);
      }, (error) => {
        console.error("Error fetching students:", error);
      }),

      // Alumni
      onSnapshot(query(collection(db, "users"), where("role", "==", "alumni")), (snapshot) => {
        const alumniList: User[] = [];
        snapshot.forEach((doc) => {
          alumniList.push({ uid: doc.id, ...doc.data() } as User);
        });
        console.log("Alumni loaded:", alumniList.length);
        setAlumni(alumniList);
      }, (error) => {
        console.error("Error fetching alumni:", error);
      }),

      // Admins
      onSnapshot(query(collection(db, "users"), where("role", "==", "admin")), (snapshot) => {
        const adminsList: User[] = [];
        snapshot.forEach((doc) => {
          adminsList.push({ uid: doc.id, ...doc.data() } as User);
        });
        console.log("Admins loaded:", adminsList.length);
        setAdmins(adminsList);
      }, (error) => {
        console.error("Error fetching admins:", error);
      })
    ];

    // Clean up listeners on unmount
    return () => {
      console.log("Cleaning up data listeners");
      unsubscribeListeners.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.error("Error cleaning up listener:", error);
        }
      });
    };
  }, [user, authLoading]);

  // Set loading state based on data availability
  useEffect(() => {
    if (authLoading) {
      console.log("Auth still loading");
      return;
    }

    if (!user) {
      console.log("No user authenticated");
      setLoading(false);
      return;
    }

    if (user.role !== "admin") {
      console.log("User is not admin");
      setLoading(false);
      return;
    }

    // Check if we have some data
    const hasData = totalAlumni > 0 || pendingApprovals > 0 || totalStudents > 0 || activeMentorships > 0;
    if (hasData) {
      console.log("Data loaded, setting loading to false");
      setLoading(false);
    }
  }, [authLoading, user, totalAlumni, pendingApprovals, totalStudents, activeMentorships]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Filter data based on search query with null checks
  const filteredPendingProfiles = pendingProfiles.filter(profile =>
    (profile.fullName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (profile.college?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (profile.company?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(student =>
    (student.fullName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (student.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (student.collegeName?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const filteredAlumni = alumni.filter(alumni =>
    (alumni.fullName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (alumni.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (alumni.collegeName?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const filteredAdmins = admins.filter(admin =>
    (admin.fullName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (admin.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  // Approve alumni profile
  const approveAlumni = async (uid: string) => {
    try {
      await updateDoc(doc(db, "alumniProfiles", uid), {
        status: "approved",
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Profile Approved",
        description: "Alumni profile has been approved successfully",
        variant: "default"
      });
    } catch (error) {
      console.error("Error approving profile:", error);
      toast({
        title: "Error",
        description: "Failed to approve profile",
        variant: "destructive"
      });
    }
  };

  // Reject alumni profile
  const rejectAlumni = async (uid: string) => {
    try {
      await updateDoc(doc(db, "alumniProfiles", uid), {
        status: "rejected",
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Profile Rejected",
        description: "Alumni profile has been rejected",
        variant: "default"
      });
    } catch (error) {
      console.error("Error rejecting profile:", error);
      toast({
        title: "Error",
        description: "Failed to reject profile",
        variant: "destructive"
      });
    }
  };

  // View user details
  const viewUserDetails = async (userId: string, role: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        setSelectedUser({ uid: userDoc.id, ...userDoc.data() } as User);
        setIsUserDetailOpen(true);
      }

      // If alumni, also fetch profile data
      if (role === "alumni") {
        const profileDoc = await getDoc(doc(db, "alumniProfiles", userId));
        if (profileDoc.exists()) {
          setSelectedProfile({ uid: profileDoc.id, ...profileDoc.data() } as AlumniProfile);
        }
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast({
        title: "Error",
        description: "Failed to load user details",
        variant: "destructive"
      });
    }
  };

  // Format date
  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  // Debug: Show loading state
  if (authLoading) {
    console.log("Rendering auth loading state");
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Debug: Show no user state
  if (!user) {
    console.log("Rendering no user state");
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Authenticated</h2>
          <p className="text-gray-600">Please log in to access the admin dashboard.</p>
          <Button onClick={() => navigate("/login")} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Debug: Show not admin state
  if (user.role !== "admin") {
    console.log("Rendering not admin state");
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have admin privileges to access this page.</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Debug: Show debug info
  console.log("Rendering main admin dashboard");
  console.log("Debug info:", debugInfo);
  console.log("Loading state:", loading);
  console.log("User:", user);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <img
                  src="/campusprep-logo.png"
                  alt="CampusPrep Logo"
                  className="h-10 w-10 object-contain mr-3"
                />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">CampusPrep Admin Panel</h1>
                  <p className="text-sm text-gray-600">From Campus to Career</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 hidden sm:block">Welcome, {user?.email}</span>
                <Button onClick={handleSignOut} variant="outline" className="text-sm">
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main>
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            {/* Debug Info Banner */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-blue-800">Debug Info:</span>
                <span className={`px-2 py-1 rounded-full text-xs ${debugInfo.firebaseConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  Firebase: {debugInfo.firebaseConnected ? 'Connected' : 'Disconnected'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${debugInfo.userLoaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  User: {debugInfo.userLoaded ? 'Loaded' : 'Loading'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${debugInfo.isAdmin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  Role: {debugInfo.isAdmin ? 'Admin' : 'Not Admin'}
                </span>
              </div>
              <p className="text-blue-700">Check browser console for detailed logs</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalAlumni}</div>
                  <p className="text-xs text-muted-foreground">Verified alumni profiles</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingApprovals}</div>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Active student accounts</p>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Mentorships</CardTitle>
                  <Handshake className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeMentorships}</div>
                  <p className="text-xs text-muted-foreground">Ongoing sessions</p>
                </CardContent>
              </Card>
            </div>

            {/* Search and Tabs */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users or profiles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="pending">Pending ({pendingApprovals})</TabsTrigger>
                  <TabsTrigger value="students">Students ({totalStudents})</TabsTrigger>
                  <TabsTrigger value="alumni">Alumni ({totalAlumni})</TabsTrigger>
                  <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Content based on active tab */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Pending Approvals Tab */}
              <TabsContent value="pending">
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>Pending Alumni Approvals</CardTitle>
                    <p className="text-sm text-gray-600">Review and verify alumni profiles for student visibility</p>
                  </CardHeader>
                  <CardContent>
                    {filteredPendingProfiles.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                          <CheckCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No pending approvals</h3>
                        <p className="text-gray-600">All submitted alumni profiles have been reviewed.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredPendingProfiles.map((profile) => (
                          <div key={profile.uid} className="border rounded-lg p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback className="bg-indigo-600 text-white">
                                    {profile.fullName ? profile.fullName.charAt(0) : 'A'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{profile.fullName}</h3>
                                  <p className="text-sm text-gray-600">{profile.company} - {profile.role}</p>
                                  <p className="text-sm text-gray-500">{profile.college}, {profile.department}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewUserDetails(profile.uid, "alumni")}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => rejectAlumni(profile.uid)}
                                  className="flex items-center gap-1"
                                >
                                  <X className="w-4 h-4" />
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => approveAlumni(profile.uid)}
                                  className="flex items-center gap-1"
                                >
                                  <Check className="w-4 h-4" />
                                  Approve
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-sm">
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                {profile.branch} - {profile.passingYear}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Linkedin className="w-3 h-3" />
                                {profile.linkedin ? "LinkedIn" : "No LinkedIn"}
                              </Badge>
                              <Badge variant="outline">
                                Submitted: {formatDate(profile.submittedAt)}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Students Tab */}
              <TabsContent value="students">
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>Student Accounts</CardTitle>
                    <p className="text-sm text-gray-600">Manage all student users</p>
                  </CardHeader>
                  <CardContent>
                    {filteredStudents.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                          <UserCheck className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No students found</h3>
                        <p className="text-gray-600">There are no student accounts matching your search.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredStudents.map((student) => (
                          <div key={student.uid} className="border rounded-lg p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback className="bg-blue-600 text-white">
                                    {student.fullName ? student.fullName.charAt(0) : 'S'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{student.fullName}</h3>
                                  <p className="text-sm text-gray-600">{student.email}</p>
                                  <p className="text-sm text-gray-500">
                                    {student.collegeName} - {student.department} {student.currentYear && `- ${student.currentYear}`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewUserDetails(student.uid, "student")}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-gray-500">
                              Joined: {formatDate(student.createdAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Alumni Tab */}
              <TabsContent value="alumni">
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>Alumni Accounts</CardTitle>
                    <p className="text-sm text-gray-600">Manage all alumni users</p>
                  </CardHeader>
                  <CardContent>
                    {filteredAlumni.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                          <UserCheck className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No alumni found</h3>
                        <p className="text-gray-600">There are no alumni accounts matching your search.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredAlumni.map((alumni) => (
                          <div key={alumni.uid} className="border rounded-lg p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback className="bg-green-600 text-white">
                                    {alumni.fullName ? alumni.fullName.charAt(0) : 'A'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{alumni.fullName}</h3>
                                  <p className="text-sm text-gray-600">{alumni.email}</p>
                                  <p className="text-sm text-gray-500">
                                    {alumni.collegeName} - {alumni.department}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewUserDetails(alumni.uid, "alumni")}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-gray-500">
                              Joined: {formatDate(alumni.createdAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Admins Tab */}
              <TabsContent value="admins">
                <Card className="bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle>Admin Accounts</CardTitle>
                    <p className="text-sm text-gray-600">Manage all admin users</p>
                  </CardHeader>
                  <CardContent>
                    {filteredAdmins.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                          <UserCheck className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No admins found</h3>
                        <p className="text-gray-600">There are no admin accounts matching your search.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredAdmins.map((admin) => (
                          <div key={admin.uid} className="border rounded-lg p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback className="bg-purple-600 text-white">
                                    {admin.fullName ? admin.fullName.charAt(0) : 'A'}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{admin.fullName}</h3>
                                  <p className="text-sm text-gray-600">{admin.email}</p>
                                  <p className="text-sm text-gray-500">Admin Account</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => viewUserDetails(admin.uid, "admin")}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </Button>
                              </div>
                            </div>
                            <div className="mt-3 text-sm text-gray-500">
                              Joined: {formatDate(admin.createdAt)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* User Detail Modal */}
        <Dialog open={isUserDetailOpen} onOpenChange={setIsUserDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Detailed information about the selected user
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="bg-indigo-600 text-white text-lg">
                      {selectedUser.fullName ? selectedUser.fullName.charAt(0) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedUser.fullName}</h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <Badge variant="secondary" className="mt-1">
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Account Created</h4>
                      <p className="text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    {selectedUser.collegeName && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">College</h4>
                        <p className="text-gray-900">{selectedUser.collegeName}</p>
                      </div>
                    )}
                    {selectedUser.department && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Department</h4>
                        <p className="text-gray-900">{selectedUser.department}</p>
                      </div>
                    )}
                    {selectedUser.currentYear && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Current Year</h4>
                        <p className="text-gray-900">{selectedUser.currentYear}</p>
                      </div>
                    )}
                  </div>

                  {selectedProfile && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Company</h4>
                        <p className="text-gray-900">{selectedProfile.company}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Role</h4>
                        <p className="text-gray-900">{selectedProfile.role}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Branch</h4>
                        <p className="text-gray-900">{selectedProfile.branch}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Passing Year</h4>
                        <p className="text-gray-900">{selectedProfile.passingYear}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">LinkedIn</h4>
                        <a href={selectedProfile.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          View Profile
                        </a>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Status</h4>
                        <Badge variant={
                          selectedProfile.status === "approved" ? "default" :
                          selectedProfile.status === "rejected" ? "destructive" : "secondary"
                        }>
                          {selectedProfile.status.charAt(0).toUpperCase() + selectedProfile.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsUserDetailOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <footer className="py-6 px-4 border-t mt-12">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-gray-500">
              CampusPrep • Team Block Minds
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}