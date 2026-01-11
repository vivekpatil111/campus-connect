import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Code, Database, Brain, Target, User, Briefcase, Rocket, Play, Clock, Check, Star, AlertTriangle, Lightbulb, BarChart, LineChart, PieChart, Download, Filter, Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { AIResumeBot } from "@/components/student/AIResumeBot";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
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