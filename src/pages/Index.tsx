import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, GraduationCap, ChevronLeft, ChevronRight, Play, Users } from "lucide-react";
import IntelligentMockInterview from "@/components/IntelligentMockInterview";
import CandidateLoginVideo from "@/components/CandidateLoginVideo";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isMockInterviewOpen, setIsMockInterviewOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Mock student profile data
  const studentProfile = {
    name: user?.email || "Alex Johnson",
    field: "Computer Science",
    educationLevel: "Undergraduate",
    interviewReadiness: 72,
    strengths: ["Problem-solving", "Communication", "Teamwork"],
    areasForImprovement: [
      "Provide more specific examples",
      "Better time management in responses",
      "Connect experiences to job requirements"
    ]
  };

  const interviewCards = [
    {
      id: 1,
      title: "Frontend Engineer",
      subtitle: "Tech Company",
      duration: "5 min AI Interview",
      image: "/placeholder.svg?height=120&width=120"
    },
    {
      id: 2,
      title: "Backend Engineer",
      subtitle: "Tech Company",
      duration: "7 min AI Interview",
      image: "/placeholder.svg?height=120&width=120"
    },
    {
      id: 3,
      title: "ML Engineer",
      subtitle: "Tech Company",
      duration: "8 min AI Interview",
      image: "/placeholder.svg?height=120&width=120"
    }
  ];

  const nextCard = () => {
    setCurrentCard((prev) => (prev + 1) % interviewCards.length);
  };

  const prevCard = () => {
    setCurrentCard((prev) => (prev - 1 + interviewCards.length) % interviewCards.length);
  };

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-blue-50 to-white">
      {/* Mock Interview Modal */}
      <IntelligentMockInterview
        isOpen={isMockInterviewOpen}
        onClose={() => setIsMockInterviewOpen(false)}
        studentProfile={studentProfile}
      />

      {/* Particles background effect */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-indigo-200 opacity-20"
            style={{
              width: `${Math.random() * 100 + 20}px`,
              height: `${Math.random() * 100 + 20}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `pulse ${Math.random() * 10 + 10}s infinite`
            }}
          />
        ))}
      </div>

      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="bg-indigo-700 text-white font-bold text-xl w-10 h-10 rounded-lg flex items-center justify-center">
                CP
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">CampusPrep</span>
            </div>

            {/* Navigation Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-700 hover:text-indigo-700 font-medium">Mock Interviews</a>
              <a href="#" className="text-gray-700 hover:text-indigo-700 font-medium">Interview Prep</a>
              <a href="#" className="text-gray-700 hover:text-indigo-700 font-medium">Resume Lab</a>
              <a href="#" className="text-gray-700 hover:text-indigo-700 font-medium">Skill Practice</a>
            </div>

            {/* Search and Login */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search jobs by title, skill or company"
                  className="pl-10 pr-4 py-2 w-64 rounded-full border-indigo-200 focus:ring-indigo-500"
                />
              </div>
              <Button
                className="bg-indigo-700 hover:bg-indigo-800 text-white rounded-full px-6"
                onClick={() => navigate(user ? "/dashboard" : "/login")}
              >
                {user ? "Go to Dashboard" : "Candidate Login"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Interview Preparation with <span className="text-indigo-700">AI Mentor</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl">
                Practice mock interviews, get expert feedback, and grow with confidence.
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-indigo-50 rounded-full py-2 px-4 w-fit">
              <GraduationCap className="h-5 w-5 text-indigo-700" />
              <span className="text-indigo-800 font-medium">Trusted by 5,00,000+ students & professionals</span>
            </div>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
              <Button
                className="bg-indigo-700 hover:bg-indigo-800 text-white rounded-full px-8 py-6 text-lg font-medium"
                onClick={() => setIsMockInterviewOpen(true)}
              >
                Start Mock Interview
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-8 py-6 text-lg font-medium border-indigo-300 text-indigo-800 hover:bg-indigo-50"
                onClick={() => setIsMockInterviewOpen(true)}
              >
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Right Content - Card Carousel */}
          <div className="relative">
            <div className="relative h-96 flex items-center justify-center">
              {/* Side Cards */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 transform opacity-60 blur-sm scale-90">
                <Card className="w-64 rounded-2xl overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                      <h3 className="font-bold text-gray-900">{interviewCards[(currentCard - 1 + interviewCards.length) % interviewCards.length].title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{interviewCards[(currentCard - 1 + interviewCards.length) % interviewCards.length].subtitle}</p>
                      <Badge variant="secondary" className="text-xs">
                        {interviewCards[(currentCard - 1 + interviewCards.length) % interviewCards.length].duration}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Center Card */}
              <div className="relative z-10">
                <Card className="w-72 rounded-2xl overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                        <Users className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="font-bold text-xl text-gray-900">{interviewCards[currentCard].title}</h3>
                      <p className="text-gray-600 mb-2">{interviewCards[currentCard].subtitle}</p>
                      <Button
                        className="w-full bg-indigo-700 hover:bg-indigo-800 text-white rounded-full mt-4"
                        onClick={() => setIsMockInterviewOpen(true)}
                      >
                        Practice Interview
                      </Button>
                      <Badge variant="secondary" className="mt-4">
                        {interviewCards[currentCard].duration}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side Cards */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 transform opacity-60 blur-sm scale-90">
                <Card className="w-64 rounded-2xl overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                      <h3 className="font-bold text-gray-900">{interviewCards[(currentCard + 1) % interviewCards.length].title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{interviewCards[(currentCard + 1) % interviewCards.length].subtitle}</p>
                      <Badge variant="secondary" className="text-xs">
                        {interviewCards[(currentCard + 1) % interviewCards.length].duration}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="flex justify-center mt-8 space-x-4">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-indigo-300 text-indigo-800 hover:bg-indigo-50"
                onClick={prevCard}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full border-indigo-300 text-indigo-800 hover:bg-indigo-50"
                onClick={nextCard}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Prepare with Confidence</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered platform helps you master every aspect of the interview process
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="rounded-2xl overflow-hidden border-0 bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8">
              <div className="bg-indigo-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <div className="bg-indigo-700 w-10 h-10 rounded-lg"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Mock Interviews</h3>
              <p className="text-gray-600 mb-4">
                Practice with our advanced AI interviewer that simulates real interview scenarios
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-700 rounded-full mr-3"></div>
                  <span>Industry-specific questions</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-700 rounded-full mr-3"></div>
                  <span>Real-time feedback</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-700 rounded-full mr-3"></div>
                  <span>Performance analytics</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="rounded-2xl overflow-hidden border-0 bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8">
              <div className="bg-teal-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <div className="bg-teal-600 w-10 h-10 rounded-lg"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Feedback</h3>
              <p className="text-gray-600 mb-4">
                Get detailed analysis of your performance from industry professionals
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-teal-600 rounded-full mr-3"></div>
                  <span>Communication skills assessment</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-teal-600 rounded-full mr-3"></div>
                  <span>Technical knowledge evaluation</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-teal-600 rounded-full mr-3"></div>
                  <span>Personalized improvement tips</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          <Card className="rounded-2xl overflow-hidden border-0 bg-white/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-8">
              <div className="bg-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <div className="bg-purple-700 w-10 h-10 rounded-lg"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Skill Development</h3>
              <p className="text-gray-600 mb-4">
                Enhance your core competencies with targeted practice modules
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-700 rounded-full mr-3"></div>
                  <span>Resume building workshops</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-700 rounded-full mr-3"></div>
                  <span>Behavioral interview prep</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-purple-700 rounded-full mr-3"></div>
                  <span>Technical skill assessments</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Login Demo Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">See How Easy It Is to Get Started</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch our quick demo of the login process and dashboard access
          </p>
        </div>
        <CandidateLoginVideo />
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="bg-indigo-700 text-white font-bold text-xl w-10 h-10 rounded-lg flex items-center justify-center">
                CP
              </div>
              <span className="ml-2 text-xl font-bold">CampusPrep</span>
            </div>
            <div className="flex space-x-8">
              <a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-300 hover:text-white">Terms of Service</a>
              <a href="#" className="text-gray-300 hover:text-white">Contact Us</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>© 2026 CampusPrep. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;