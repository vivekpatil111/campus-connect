import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, Play, Clock, Check, Star, Code, Database, Brain, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function InterviewQuickStart() {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const companies = [
    { value: "google", label: "Google", icon: "G", color: "bg-blue-100 text-blue-600" },
    { value: "microsoft", label: "Microsoft", icon: "M", color: "bg-red-100 text-red-600" },
    { value: "amazon", label: "Amazon", icon: "A", color: "bg-orange-100 text-orange-600" },
    { value: "meta", label: "Meta", icon: "F", color: "bg-indigo-100 text-indigo-600" },
    { value: "apple", label: "Apple", icon: "🍎", color: "bg-gray-100 text-gray-600" }
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

  const getCompanyIcon = (company: string) => {
    const found = companies.find(c => c.value === company);
    return found ? (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${found.color}`}>
        <span className="font-bold">{found.icon}</span>
      </div>
    ) : null;
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-indigo-800 flex items-center gap-2">
          <Rocket className="w-6 h-6" />
          Quick Start Interview
        </CardTitle>
        <CardDescription>Begin your AI-powered interview practice in seconds</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Company Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-indigo-700 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Select Company
            </label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.value} value={company.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded ${company.color}`}>
                        <span className="font-bold">{company.icon}</span>
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
            <label className="text-sm font-medium text-indigo-700 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Select Role
            </label>
            <Select value={selectedRole} onValueChange={setSelectedRole} disabled={!selectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
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

          {/* Interview Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-indigo-700 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Interview Type
            </label>
            <Select value={selectedType} onValueChange={setSelectedType} disabled={!selectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {interviewTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <div>
                        <span>{type.label}</span>
                        <span className="text-xs text-gray-500 ml-2">{type.duration}</span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Quick Start Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleStartInterview}
            disabled={!selectedCompany || !selectedRole || !selectedType}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 text-lg font-medium"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Interview Now
          </Button>
        </div>

        {/* Selection Summary */}
        {selectedCompany && selectedRole && selectedType && (
          <div className="bg-white rounded-lg p-4 border border-indigo-100">
            <h3 className="font-medium text-indigo-800 mb-3">Your Selection</h3>
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex items-center gap-3">
                {getCompanyIcon(selectedCompany)}
                <div>
                  <p className="font-medium text-gray-900">
                    {companies.find(c => c.value === selectedCompany)?.label}
                  </p>
                  <p className="text-sm text-gray-600">
                    {roles.find(r => r.value === selectedRole)?.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="text-sm text-indigo-700">
                  {interviewTypes.find(t => t.value === selectedType)?.duration} • AI-Powered
                </span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                <Check className="w-3 h-3 mr-1" />
                Real-time Feedback
              </Badge>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                <Check className="w-3 h-3 mr-1" />
                Behavioral Analysis
              </Badge>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                <Check className="w-3 h-3 mr-1" />
                Detailed Report
              </Badge>
            </div>
          </div>
        )}

        {/* Quick Tips */}
        <div className="bg-indigo-50 rounded-lg p-4">
          <h3 className="font-medium text-indigo-800 mb-3">Quick Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-indigo-700">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-indigo-600 mt-0.5" />
              <span>Enable camera and microphone for best experience</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-indigo-600 mt-0.5" />
              <span>Use headphones for better audio quality</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-indigo-600 mt-0.5" />
              <span>Choose a quiet, well-lit location</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-indigo-600 mt-0.5" />
              <span>Have your resume and notes ready</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}