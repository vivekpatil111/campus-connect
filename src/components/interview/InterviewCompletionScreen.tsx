"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Clock, Star, ArrowRight } from "lucide-react";

interface InterviewCompletionScreenProps {
  company: string;
  role: string;
  interviewType: string;
  answers: any[];
  engagementMetrics: any;
  onClose: () => void;
  onNextRound: () => void;
}

export function InterviewCompletionScreen({
  company,
  role,
  interviewType,
  answers,
  engagementMetrics,
  onClose,
  onNextRound
}: InterviewCompletionScreenProps) {
  // Capitalize company and role names for display
  const companyName = company.charAt(0).toUpperCase() + company.slice(1);
  const roleName = interviewType === "Technical" ? "Technical Interview" : "HR / Behavioral Interview";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Interview Completed</CardTitle>
              <p className="text-sm text-gray-600">Your interview has been successfully completed</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-y-auto space-y-6 p-4">
            <div className="text-center py-8 space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-10 h-10 text-green-600" />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Interview Completed Successfully</h3>
                <p className="text-gray-600 mb-4">
                  Thank you for completing your {companyName} {roleName} interview.
                </p>
              </div>

              {/* Interview Summary */}
              <div className="bg-green-50 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="font-semibold text-green-800 mb-3">Interview Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium">{companyName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role:</span>
                    <span className="font-medium">{roleName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions Answered:</span>
                    <span className="font-medium">{answers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {engagementMetrics?.duration ? `${Math.floor(engagementMetrics.duration / 60)} minutes` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                <h4 className="font-semibold text-blue-800 mb-3">Next Steps</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Review your answers and performance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Prepare for additional rounds if needed</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Continue practicing with other companies</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t p-4 bg-gray-50 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={onNextRound}
              className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Next Round
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}