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
      {/* ... rest of the component code */}
    </div>
  );
}