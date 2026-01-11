"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Building, Code, User, Play } from "lucide-react";

interface InterviewSetupProps {
  onStartInterview: (company: string, role: string, type: string) => void;
}

export function InterviewSetup({ onStartInterview }: InterviewSetupProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [type, setType] = useState("");

  const companies = [
    { value: "google", label: "Google" },
    { value: "microsoft", label: "Microsoft" },
    { value: "amazon", label: "Amazon" },
    { value: "netflix", label: "Netflix" },
    { value: "facebook", label: "Facebook" }
  ];

  const roles = [
    { value: "frontend", label: "Frontend Engineer" },
    { value: "backend", label: "Backend Engineer" },
    { value: "ml", label: "ML Engineer" },
    { value: "fullstack", label: "Fullstack Engineer" }
  ];

  const interviewTypes = [
    { value: "technical", label: "Technical Interview" },
    { value: "hr", label: "HR/Behavioral Interview" },
    { value: "system_design", label: "System Design" }
  ];

  const handleStartInterview = () => {
    if (!company || !role || !type) {
      toast({
        title: "Error",
        description: "Please select all options to start the interview",
        variant: "destructive"
      });
      return;
    }

    onStartInterview(company, role, type);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-gray-900">Interview Setup</CardTitle>
        <CardDescription>
          Select your target company, role, and interview type to begin your practice session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Select Company
            </label>
            <Select value={company} onValueChange={setCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.value} value={company.value}>
                    {company.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Code className="w-4 h-4" />
              Select Role
            </label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Interview Type
            </label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select interview type" />
              </SelectTrigger>
              <SelectContent>
                {interviewTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleStartInterview}
            disabled={!company || !role || !type}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}