"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brain, Target, User, Play, Clock, BarChart, Calendar, TrendingUp, TrendingDown, Video, FileText, ChevronDown, FileSearch, FilePlus, ClipboardList, Loader2 } from "lucide-react";
import { AIResumeBot } from "@/components/student/AIResumeBot";
import { AIInterviewModal } from "@/components/student/AIInterviewModal";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAIInterview, setShowAIInterview] = useState(false);
  const [showResumeChecker, setShowResumeChecker] = useState(false);
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  // Real-time recent activities from Firestore
  useEffect(() => {
    if (!user) return;
    const activitiesRef = collection(db, "userActivities", user.uid, "activities");
    const q = query(activitiesRef, orderBy("timestamp", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const acts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentActivities(acts);
      setActivitiesLoading(false);
    }, () => {
      setActivitiesLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Mock data for dashboard
  const interviewStats = {
    totalPracticed: 12,
    avgScore: 78,
    lastPractice: "2026-01-10",
    upcomingInterviews: 3
  };

  const skillAssessment = [
    { skill: "JavaScript", level: 85, change: 12 },
    { skill: "React", level: 78, change: 5 },
    { skill: "Node.js", level: 72, change: -3 },
    { skill: "Python", level: 65, change: 8 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, <span className="font-semibold text-indigo-600">{user?.displayName || user?.email?.split('@')[0]}</span></span>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Stats Cards */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interviews Practiced</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interviewStats.totalPracticed}</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Interview Score</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interviewStats.avgScore}%</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Interviews</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{interviewStats.upcomingInterviews}</div>
              <p className="text-xs text-muted-foreground">Scheduled this week</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interview Practice Section */}
          <div className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-indigo-600" />
                  Interview Practice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h3 className="font-semibold text-indigo-800 mb-2">AI-Powered Interview Practice</h3>
                  <p className="text-indigo-700 text-sm mb-4">
                    Practice with our advanced AI interviewer that simulates real interview scenarios with video and voice capabilities.
                  </p>
                  <Button 
                    className="w-full flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setShowAIInterview(true)}
                  >
                    <Play className="h-4 w-4" />
                    Start AI Interview
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <Button 
                    className="flex items-center gap-2" 
                    onClick={() => navigate("/student/alumni")}
                  >
                    <User className="h-4 w-4" />
                    Connect with Alumni
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Access to Resume Lab */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Resume Lab
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Upload your resume for AI-powered analysis or build a professional resume from scratch.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                    onClick={() => setShowResumeChecker(true)}
                  >
                    <FileSearch className="h-4 w-4" />
                    Resume Checker
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Recent Activities */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Clock className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No activities yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Complete an interview or upload a resume to see activity here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        {activity.type === "interview" ? (
                          <Video className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <FileText className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          {activity.type === "interview" ? (
                            <>
                              <p className="font-medium text-sm">
                                {activity.company} — {activity.role}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {activity.score !== undefined && (
                                  <Badge variant="secondary" className="text-xs">
                                    Score: {activity.score}%
                                  </Badge>
                                )}
                                <span className="text-xs text-gray-500">
                                  {activity.timestamp?.toDate
                                    ? activity.timestamp.toDate().toLocaleDateString()
                                    : activity.date || ""}
                                </span>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="font-medium text-sm">{activity.title || activity.action}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {activity.timestamp?.toDate
                                  ? activity.timestamp.toDate().toLocaleDateString()
                                  : activity.date || ""}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      {/* AI Interview Modal */}
      <AIInterviewModal
        externalOpen={showAIInterview}
        onExternalClose={() => setShowAIInterview(false)}
        showFloatingButton={false}
      />
      
      {/* Resume Checker Modal */}
      <AIResumeBot
        externalOpen={showResumeChecker}
        onExternalClose={() => setShowResumeChecker(false)}
        showFloatingButton={false}
      />
    </div>
  );
}