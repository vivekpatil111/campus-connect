import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, FileText, BarChart, Users, Check, Clock, X, AlertTriangle, Star, MessageCircle, Calendar, Search, Filter, Download, ArrowRight, ArrowLeft, Play, Pause, StopCircle, Mic, MicOff, Video, VideoOff, Eye, Camera, CheckCircle, AlertCircle, Loader2, User, GraduationCap, Linkedin, Briefcase, Code, Database, Brain, Lightbulb, TrendingUp, TrendingDown, Target, Award, Trophy, Medal, ChartBar, ChartPie, ChartLine, Cog, Settings, Bell, Bookmark, Heart, Share, MoreVertical, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { InterviewSetup } from "@/components/interview/InterviewSetup";
import { AlumniConnection } from "@/components/student/AlumniConnection";
import { AIResumeBot } from "@/components/student/AIResumeBot";
import { MentorshipRequests } from "@/components/alumni/MentorshipRequests";
import { SessionHistory } from "@/components/alumni/SessionHistory";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Dashboard state
  const [activeSection, setActiveSection] = useState("interview-prep");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [interviewRounds, setInterviewRounds] = useState([
    { id: "hr", name: "HR / Behavioral Round", status: "not-started", duration: 30, questions: 8 },
    { id: "technical", name: "Technical Round", status: "not-started", duration: 45, questions: 10 }
  ]);
  const [interviewHistory, setInterviewHistory] = useState([
    { id: "1", company: "Google", role: "Frontend Engineer", date: "2024-03-15", score: 85, status: "completed" },
    { id: "2", company: "Microsoft", role: "Backend Engineer", date: "2024-03-10", score: 78, status: "completed" }
  ]);
  const [showInterviewSetup, setShowInterviewSetup] = useState(false);
  const [showAlumniConnection, setShowAlumniConnection] = useState(false);

  // Company and role options
  const companies = [
    { value: "google", label: "Google", logo: "G", color: "bg-blue-100 text-blue-600" },
    { value: "microsoft", label: "Microsoft", logo: "M", color: "bg-red-100 text-red-600" },
    { value: "amazon", label: "Amazon", logo: "A", color: "bg-orange-100 text-orange-600" },
    { value: "meta", label: "Meta", logo: "F", color: "bg-indigo-100 text-indigo-600" },
    { value: "apple", label: "Apple", logo: "🍎", color: "bg-gray-100 text-gray-600" }
  ];

  const roles = [
    { value: "frontend", label: "Frontend Developer", icon: <Code className="w-4 h-4" />, description: "Focus on UI/UX and client-side development" },
    { value: "backend", label: "Backend Developer", icon: <Database className="w-4 h-4" />, description: "Focus on server-side logic and databases" },
    { value: "ml", label: "ML Engineer", icon: <Brain className="w-4 h-4" />, description: "Focus on machine learning and data science" },
    { value: "data", label: "Data Scientist", icon: <ChartBar className="w-4 h-4" />, description: "Focus on data analysis and insights" },
    { value: "pm", label: "Product Manager", icon: <Target className="w-4 h-4" />, description: "Focus on product strategy and execution" }
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive"
      });
    }
  };

  const handleStartInterview = (company: string, role: string, type: string) => {
    setSelectedCompany(company);
    setSelectedRole(role);
    setShowInterviewSetup(true);
  };

  const handleStartInterviewPrep = () => {
    setActiveSection("interview-prep");
    setShowInterviewSetup(true);
  };

  const handleCompleteRound = (roundId: string) => {
    setInterviewRounds(prev => prev.map(round =>
      round.id === roundId ? { ...round, status: "completed" } : round
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700"><Check className="w-3 h-3 mr-1" /> Completed</Badge>;
      case "in-progress":
        return <Badge variant="secondary" className="bg-yellow-600 hover:bg-yellow-700"><Clock className="w-3 h-3 mr-1" /> In Progress</Badge>;
      case "not-started":
        return <Badge variant="outline"><AlertTriangle className="w-3 h-3 mr-1" /> Not Started</Badge>;
      default:
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" /> Failed</Badge>;
    }
  };

  const getCompanyLogo = (company: string) => {
    const found = companies.find(c => c.value === company);
    return found ? (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${found.color}`}>
        <span className="font-bold">{found.logo}</span>
      </div>
    ) : null;
  };

  const calculateOverallScore = () => {
    if (interviewHistory.length === 0) return 0;
    const total = interviewHistory.reduce((sum, interview) => sum + interview.score, 0);
    return Math.round(total / interviewHistory.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-600 text-white font-bold text-xl px-3 py-2 rounded-lg flex items-center gap-2">
                <span>CP</span>
                <span className="text-xs font-normal">CampusPrep</span>
              </div>
              <span className="hidden sm:block text-gray-600">Welcome, {user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/student")}>
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section - Quick Actions */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Start Interview Prep */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200"
              onClick={handleStartInterviewPrep}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Start Interview Prep</h3>
                <p className="text-sm text-gray-600 mb-4">Begin your AI-powered interview practice</p>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  <Play className="w-4 h-4 mr-2" />
                  Start Now
                </Button>
              </CardContent>
            </Card>

            {/* Upload Resume */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload Resume</h3>
                <p className="text-sm text-gray-600 mb-4">Get AI analysis and mentor matches</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Analyze Resume
                </Button>
              </CardContent>
            </Card>

            {/* My Interview Reports */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200"
              onClick={() => setActiveSection("reports")}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">My Interview Reports</h3>
                <p className="text-sm text-gray-600 mb-4">View your performance history</p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Eye className="w-4 h-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Card>

            {/* My Mentors */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200"
              onClick={() => setActiveSection("mentors")}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">My Mentors</h3>
                <p className="text-sm text-gray-600 mb-4">Connect with verified alumni</p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  <Handshake className="w-4 h-4 mr-2" />
                  View Mentors
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Interview Prep Section */}
        {activeSection === "interview-prep" && (
          <div className="space-y-8">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Interview Preparation</CardTitle>
                <CardDescription>Select company and role to begin your practice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Select Company
                    </label>
                    <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.value} value={company.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded ${company.color}`}>
                                <span className="font-bold">{company.logo}</span>
                              </div>
                              <span>{company.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Select Role
                    </label>
                    <Select value={selectedRole} onValueChange={setSelectedRole} disabled={!selectedCompany}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              {role.icon}
                              <span>{role.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Interview Rounds */}
                {selectedCompany && selectedRole && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {interviewRounds.map((round) => (
                      <Card key={round.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                {round.id === "hr" ? (
                                  <User className="w-5 h-5 text-indigo-600" />
                                ) : (
                                  <Code className="w-5 h-5 text-indigo-600" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{round.name}</h3>
                                <p className="text-sm text-gray-500">
                                  {round.duration} minutes • {round.questions} questions
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(round.status)}
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>
                                {round.status === "completed" ? "100%" :
                                 round.status === "in-progress" ? "50%" : "0%"}
                              </span>
                            </div>
                            <Progress
                              value={
                                round.status === "completed" ? 100 :
                                round.status === "in-progress" ? 50 : 0
                              }
                              className="h-2"
                            />
                          </div>

                          <Button
                            onClick={() => handleStartInterview(selectedCompany, selectedRole, round.id)}
                            className="w-full bg-indigo-600 hover:bg-indigo-700"
                            disabled={round.status === "completed"}
                          >
                            {round.status === "completed" ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Completed
                              </>
                            ) : round.status === "in-progress" ? (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Resume
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-2" />
                                Start Round
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interview Tips */}
            <Card className="bg-indigo-50 border-indigo-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-indigo-800">Interview Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Lightbulb className="w-6 h-6 text-indigo-600" />
                      <h3 className="font-medium text-gray-900">Prepare Thoroughly</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Research the company, role, and common interview questions for your position.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Mic className="w-6 h-6 text-indigo-600" />
                      <h3 className="font-medium text-gray-900">Practice Out Loud</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Use our AI interview simulator to practice speaking clearly and confidently.
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="w-6 h-6 text-indigo-600" />
                      <h3 className="font-medium text-gray-900">Time Management</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Practice concise answers that fit within the time limits for each question.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Interview Status Tracker */}
        {activeSection === "status" && (
          <div className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Interview Status Tracker</CardTitle>
                <CardDescription>Track your progress across different companies and roles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {interviewHistory.map((interview) => (
                    <div key={interview.id} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {getCompanyLogo(interview.company)}
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {interview.company} - {interview.role}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(interview.date).toLocaleDateString()} • {interview.score}% Score
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(interview.status)}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/student/interview-simulation`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Summary */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Progress Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-3">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeDasharray={`${calculateOverallScore() * 3.6}, 360`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900">{calculateOverallScore()}%</span>
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-900">Overall Score</h3>
                    <p className="text-sm text-gray-600">Average across all interviews</p>
                  </div>

                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center">
                      <div className="text-4xl font-bold text-green-600">
                        {interviewHistory.filter(i => i.status === "completed").length}
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-900">Completed Interviews</h3>
                    <p className="text-sm text-gray-600">Successfully finished sessions</p>
                  </div>

                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center">
                      <div className="text-4xl font-bold text-indigo-600">
                        {interviewRounds.filter(r => r.status === "completed").length}/{interviewRounds.length}
                      </div>
                    </div>
                    <h3 className="font-medium text-gray-900">Rounds Progress</h3>
                    <p className="text-sm text-gray-600">Current interview rounds</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Interview Reports Section */}
        {activeSection === "reports" && (
          <div className="space-y-6">
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Interview Reports</CardTitle>
                <CardDescription>Detailed analysis of your interview performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {interviewHistory.map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getCompanyLogo(report.company)}
                            <div>
                              <h3 className="font-medium text-gray-900">{report.company}</h3>
                              <p className="text-sm text-gray-500">{report.role}</p>
                            </div>
                          </div>
                          <Badge variant="default" className="bg-indigo-600">
                            {report.score}%
                          </Badge>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-1">
                            {new Date(report.date).toLocaleDateString()}
                          </p>
                          <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Status</span>
                            <span className="capitalize">{report.status}</span>
                          </div>
                          <Progress value={report.score} className="h-2" />
                        </div>

                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                          <Download className="w-4 h-4 mr-2" />
                          Download Report
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Analytics */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Score Distribution</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Technical Skills</span>
                        <span className="font-medium">82%</span>
                      </div>
                      <Progress value={82} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Communication</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <Progress value={78} className="h-2" />

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Problem Solving</span>
                        <span className="font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Improvement Areas</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Time Management</p>
                          <p className="text-sm text-gray-600">Practice more concise responses</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-600 mt-1" />
                        <div>
                          <p className="font-medium text-gray-900">Technical Depth</p>
                          <p className="text-sm text-gray-600">Study advanced algorithms and system design</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mentors Section */}
        {activeSection === "mentors" && (
          <div className="space-y-6">
            <AlumniConnection />
            <MentorshipRequests />
            <SessionHistory />
          </div>
        )}
      </main>

      {/* AI Resume Bot (Floating) */}
      <AIResumeBot />

      {/* Interview Setup Modal */}
      {showInterviewSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Interview Setup</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowInterviewSetup(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-gray-600">
                Configure your interview session for {selectedCompany} - {selectedRole}
              </p>
            </div>
            <div className="p-6">
              <InterviewSetup onStartInterview={handleStartInterview} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}