"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Building, Briefcase, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CompanyInterviewSelectionProps {
  onStartInterview: (company: string, role: string, type: string) => void;
  onClose: () => void;
}

export function CompanyInterviewSelection({ onStartInterview, onClose }: CompanyInterviewSelectionProps) {
  const { toast } = useToast();
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedInterviewType, setSelectedInterviewType] = useState<string | null>(null);

  // Available companies
  const companies = [
    {
      id: "Google",
      name: "Google",
      logo: "/google-logo.png",
      roles: ["Frontend Engineer", "Backend Engineer", "ML Engineer"],
      interviewTypes: ["Technical", "HR"]
    },
    {
      id: "Microsoft",
      name: "Microsoft",
      logo: "/microsoft-logo.png",
      roles: ["Frontend Engineer", "Backend Engineer", "ML Engineer"],
      interviewTypes: ["Technical", "HR"]
    },
    {
      id: "Amazon",
      name: "Amazon",
      logo: "/amazon-logo.png",
      roles: ["Frontend Engineer", "Backend Engineer", "ML Engineer"],
      interviewTypes: ["Technical", "HR"]
    }
  ];

  const handleStartInterview = () => {
    if (!selectedCompany || !selectedRole || !selectedInterviewType) {
      toast({
        title: "Selection Required",
        description: "Please select company, role, and interview type",
        variant: "destructive"
      });
      return;
    }

    // Extract role ID from role name (e.g., "Frontend Engineer" -> "frontend")
    const roleId = selectedRole.toLowerCase().replace(" engineer", "");

    onStartInterview(selectedCompany, roleId, selectedInterviewType);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Select Interview</CardTitle>
              <CardDescription>Choose company, role, and interview type</CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-y-auto space-y-6 p-4">
            {/* Company Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Company</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {companies.map((company) => (
                  <Card
                    key={company.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedCompany === company.id
                        ? "border-indigo-500 border-2"
                        : "border-gray-200"
                    }`}
                    onClick={() => setSelectedCompany(company.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-3">
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="h-12 w-12 object-contain"
                        />
                      </div>
                      <h4 className="font-medium text-gray-900">{company.name}</h4>
                      {selectedCompany === company.id && (
                        <Check className="w-5 h-5 text-indigo-600 mx-auto mt-2" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Role Selection */}
            {selectedCompany && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Role</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {companies
                    .find(c => c.id === selectedCompany)
                    ?.roles.map((role) => (
                      <Card
                        key={role}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          selectedRole === role
                            ? "border-indigo-500 border-2"
                            : "border-gray-200"
                        }`}
                        onClick={() => setSelectedRole(role)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Briefcase className="w-6 h-6 text-indigo-600" />
                          </div>
                          <h4 className="font-medium text-gray-900">{role}</h4>
                          {selectedRole === role && (
                            <Check className="w-5 h-5 text-indigo-600 mx-auto mt-2" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Interview Type Selection */}
            {selectedRole && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Interview Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companies
                    .find(c => c.id === selectedCompany)
                    ?.interviewTypes.map((type) => (
                      <Card
                        key={type}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          selectedInterviewType === type
                            ? "border-indigo-500 border-2"
                            : "border-gray-200"
                        }`}
                        onClick={() => setSelectedInterviewType(type)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-medium text-sm">
                                {type.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{type} Interview</h4>
                              <p className="text-sm text-gray-600">
                                {type === "Technical"
                                  ? "Technical questions and problem-solving"
                                  : "Behavioral and cultural fit assessment"}
                              </p>
                            </div>
                          </div>
                          {selectedInterviewType === type && (
                            <Check className="w-5 h-5 text-indigo-600 ml-auto mt-2" />
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            {/* Selection Summary */}
            {selectedInterviewType && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <h3 className="font-semibold text-indigo-800 mb-3">Your Selection</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium">Company:</span>
                    <span>{selectedCompany}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <span className="font-medium">Role:</span>
                    <span>{selectedRole}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Type:</span>
                    <Badge variant="secondary">{selectedInterviewType} Interview</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="border-t p-4 bg-gray-50 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleStartInterview}
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={!selectedInterviewType}
            >
              Start Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}