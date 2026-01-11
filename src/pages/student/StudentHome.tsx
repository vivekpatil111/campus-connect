import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Play, Star, Clock, Check, Brain, GraduationCap, BookOpen, BarChart, Users, MessageCircle, Upload, FileText, Search, User, Linkedin, Star as StarIcon, X, AlertTriangle, ThumbsUp, Loader2, Lightbulb, ChevronRight, StopCircle, Video, Code } from "lucide-react";
import { AIInterviewModal } from "@/components/student/AIInterviewModal";

export default function StudentHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
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
      <main>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Student Dashboard</h2>

              {/* AI Tools Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Enhanced AI Interview Card */}
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-indigo-600" />
                      AI Interview Practice
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      Practice realistic video interviews with AI-powered questions and feedback
                    </CardDescription>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Mic className="w-3 h-3" />
                        Voice Recording
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Video className="w-3 h-3" />
                        Video Call
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Real-time Feedback
                      </Badge>
                    </div>
                    <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white">
                      <Play className="w-4 h-4 mr-2" />
                      Start Practice
                    </Button>
                  </CardContent>
                </Card>

                {/* Mock Interviews Card */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Mock Interviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      Schedule practice interviews with verified alumni mentors
                    </CardDescription>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Flexible Scheduling
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        Live Feedback
                      </Badge>
                    </div>
                    <Button
                      className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => navigate("/student/alumni")}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Find Mentors
                    </Button>
                  </CardContent>
                </Card>

                {/* Performance Tracking Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-purple-600" />
                      Performance Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4">
                      Track your interview performance and improvement over time
                    </CardDescription>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Interviews Completed</span>
                        <span className="font-medium">5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Average Score</span>
                        <span className="font-medium">78%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Improvement Rate</span>
                        <span className="font-medium text-green-600">+12%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Tips Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-600" />
                      Quick Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Practice with our AI interview system daily</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Review your performance metrics regularly</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Connect with alumni mentors for feedback</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-green-600" />
                      Learning Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Interview preparation guides</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Code className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Coding challenge practice</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-green-600 mt-0.5" />
                        <span>Alumni networking opportunities</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* AI Interview Modal */}
      <AIInterviewModal />
    </div>
  );
}