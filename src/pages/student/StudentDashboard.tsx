import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Code, Database, Brain, Target, User, Briefcase, Rocket, Play, Clock, Check, Star, AlertTriangle, Lightbulb, BarChart, LineChart, PieChart, Download, Filter, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { InterviewStatusTracker } from "@/components/student/InterviewStatusTracker";
import { InterviewQuickStart } from "@/components/student/InterviewQuickStart";
import { InterviewTips } from "@/components/student/InterviewTips";
import { PerformanceAnalytics } from "@/components/student/PerformanceAnalytics";
import { AIResumeBot } from "@/components/student/AIResumeBot";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const companies = [
    { value: "google", label: "Google", logo: "G", color: "bg-blue-100 text-blue-600" },
    { value: "microsoft", label: "Microsoft", logo: "M", color: "bg-red-100 text-red-600" },
    { value: "amazon", label: "Amazon", logo: "A", color: "bg-orange-100 text-orange-600" },
    { value: "meta", label: "Meta", logo: "F", color: "bg-indigo-100 text-indigo-600" },
    { value: "apple", label: "Apple", logo: "🍎", color: "bg-gray-100 text-gray-600" }
  ];

  const roles = [
    { value: "frontend", label: "Frontend Developer", icon: <Code className="w-4 h-4" /> },
    { value: "backend", label: "Backend Developer", icon: <Database className="w-4 h-4" /> },
    { value: "ml", label: "ML Engineer", icon: <Brain className="w-4 h-4" /> },
    { value: "data", label: "Data Scientist", icon: <Target className="w-4 h-4" /> }
  ];

  const interviewTypes = [
    { value: "technical", label: "Technical Interview", icon: <Code className="w-4 h-4" />, duration: "45 min" },
    { value: "hr", label: "HR/Behavioral", icon: <User className="w-4 h-4" />, duration: "30 min" },
    { value: "system-design", label: "System Design", icon: <Database className="w-4 h-4" />, duration: "60 min" }
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleStartInterview = () => {
    if (selectedCompany && selectedRole && selectedType) {
      navigate("/student/interview-simulation", {
        state: {
          company: selectedCompany,
          role: selectedRole,
          type: selectedType
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.email}</span>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <InterviewStatusTracker
            company="Google"
            role="Frontend Engineer"
            rounds={[
              { id: "technical", name: "Technical Interview", status: "not-started" },
              { id: "hr", name: "HR / Behavioral", status: "not-started" },
              { id: "gd", name: "Group Discussion (GD)", status: "not-started" }
            ]}
            onResumeRound={(roundId) => console.log("Resume round:", roundId)}
          />

          <InterviewQuickStart />

          <InterviewTips />

          <PerformanceAnalytics
            metrics={[
              { name: "Overall Score", value: 85, previous: 78 },
              { name: "Technical Skills", value: 90, previous: 85 },
              { name: "Communication", value: 80, previous: 75 },
              { name: "Problem Solving", value: 88, previous: 82 }
            ]}
            reports={[
              {
                id: "1",
                company: "Google",
                role: "Frontend Engineer",
                score: 85,
                date: "2024-03-15",
                companyLogo: "G"
              },
              {
                id: "2",
                company: "Microsoft",
                role: "Backend Engineer",
                score: 90,
                date: "2024-03-10",
                companyLogo: "M"
              }
            ]}
            onDownloadReport={(reportId) => console.log("Download report:", reportId)}
          />

          {/* AI Resume Bot Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Resume Analysis</h2>
            <p className="text-gray-600 mb-6">
              Upload your resume and get AI-powered analysis to find the best alumni mentors for you
            </p>
            <AIResumeBot />
          </div>
        </div>
      </main>
    </div>
  );
}