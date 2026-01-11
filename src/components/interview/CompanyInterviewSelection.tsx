"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Code, User, Play, Clock, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CompanyInterviewSelectionProps {
  onStartInterview: (company: string, role: string, type: string) => void;
  onClose: () => void;
}

export function CompanyInterviewSelection({ onStartInterview, onClose }: CompanyInterviewSelectionProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const companies = [
    { value: "Google", label: "Google", icon: "G", color: "text-blue-600", bg: "bg-blue-100" },
    { value: "Microsoft", label: "Microsoft", icon: "M", color: "text-red-600", bg: "bg-red-100" },
    { value: "Amazon", label: "Amazon", icon: "A", color: "text-orange-600", bg: "bg-orange-100" }
  ];

  const roles = [
    { value: "SoftwareEngineer", label: "Software Engineer", description: "Coding, algorithms, system design" },
    { value: "DataScientist", label: "Data Scientist", description: "ML, statistics, data analysis" },
    { value: "ProductManager", label: "Product Manager", description: "Strategy, roadmaps, stakeholder management" }
  ];

  const interviewTypes = [
    {
      value: "Technical",
      label: "Technical Interview",
      description: "Coding, algorithms, system design",
      duration: "45 minutes",
      questions: 10
    },
    {
      value: "HR",
      label: "HR/Behavioral Interview",
      description: "Leadership, culture fit, behavioral questions",
      duration: "30 minutes",
      questions: 8
    }
  ];

  const handleStartInterview = (type: string) => {
    if (!selectedCompany || !selectedRole) {
      toast({
        title: "Selection Required",
        description: "Please select both company and role",
        variant: "destructive"
      });
      return;
    }

    onStartInterview(selectedCompany, selectedRole, type);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle className="text-xl">AI Mock Interview Setup</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-y-auto p-4">
            {/* Company Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Company</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {companies.map((company) => (
                  <Card
                    key={company.value}
                    className={`hover:shadow-md transition-shadow cursor-pointer ${selectedCompany === company.value ? 'border-indigo-500 border-2' : ''}`}
                    onClick={() => setSelectedCompany(company.value)}
                  >
                    <CardContent className="text-center p-6">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${company.bg}`}>
                        <span className={`text-xl font-bold ${company.color}`}>{company.icon}</span>
                      </div>
                      <h4 className="font-medium mb-2">{company.label}</h4>
                      <p className="text-sm text-gray-600">Technical & HR Interviews</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Role Selection */}
            {selectedCompany && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Role</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roles.map((role) => (
                    <Card
                      key={role.value}
                      className={`hover:shadow-md transition-shadow cursor-pointer ${selectedRole === role.value ? 'border-indigo-500 border-2' : ''}`}
                      onClick={() => setSelectedRole(role.value)}
                    >
                      <CardContent className="text-center p-6">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Code className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h4 className="font-medium mb-2">{role.label}</h4>
                        <p className="text-sm text-gray-600">{role.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Interview Type Selection */}
            {selectedCompany && selectedRole && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Interview Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {interviewTypes.map((type) => (
                    <Card key={type.value} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            {type.value === "Technical" ? (
                              <Code className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <User className="w-5 h-5 text-indigo-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{type.label}</h4>
                            <p className="text-sm text-gray-600">{type.description}</p>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{type.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{type.questions} questions</span>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleStartInterview(type.value)}
                          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start {type.label}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t p-4 bg-gray-50 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}