import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SessionFeedback() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { toast } = useToast();

  const [feedback, setFeedback] = useState({
    overallExperience: "",
    helpfulness: "",
    communication: "",
    technicalKnowledge: "",
    additionalComments: ""
  });

  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (sessionId) {
        const sessionDoc = doc(db, "sessions", sessionId);
        await updateDoc(sessionDoc, {
          feedback,
          feedbackSubmitted: true,
          feedbackDate: new Date()
        });
      }

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!"
      });

      // Navigate to student dashboard
      navigate("/student");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Session Feedback</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Share Your Experience</CardTitle>
            <p className="text-gray-600">
              Please provide feedback about your mentoring session to help us improve
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    How was your overall experience?
                  </Label>
                  <RadioGroup
                    className="mt-2"
                    value={feedback.overallExperience}
                    onValueChange={(value) => handleInputChange("overallExperience", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="excellent" id="excellent" />
                      <Label htmlFor="excellent">Excellent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="good" id="good" />
                      <Label htmlFor="good">Good</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="average" id="average" />
                      <Label htmlFor="average">Average</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="poor" id="poor" />
                      <Label htmlFor="poor">Poor</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium">
                    How helpful was the mentor?
                  </Label>
                  <RadioGroup
                    className="mt-2"
                    value={feedback.helpfulness}
                    onValueChange={(value) => handleInputChange("helpfulness", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="very-helpful" id="very-helpful" />
                      <Label htmlFor="very-helpful">Very Helpful</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="helpful" id="helpful" />
                      <Label htmlFor="helpful">Helpful</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="somewhat-helpful" id="somewhat-helpful" />
                      <Label htmlFor="somewhat-helpful">Somewhat Helpful</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="not-helpful" id="not-helpful" />
                      <Label htmlFor="not-helpful">Not Helpful</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium">
                    Communication Skills
                  </Label>
                  <RadioGroup
                    className="mt-2"
                    value={feedback.communication}
                    onValueChange={(value) => handleInputChange("communication", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="excellent" id="comm-excellent" />
                      <Label htmlFor="comm-excellent">Excellent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="good" id="comm-good" />
                      <Label htmlFor="comm-good">Good</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="average" id="comm-average" />
                      <Label htmlFor="comm-average">Average</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="poor" id="comm-poor" />
                      <Label htmlFor="comm-poor">Poor</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium">
                    Technical Knowledge
                  </Label>
                  <RadioGroup
                    className="mt-2"
                    value={feedback.technicalKnowledge}
                    onValueChange={(value) => handleInputChange("technicalKnowledge", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="expert" id="expert" />
                      <Label htmlFor="expert">Expert</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="proficient" id="proficient" />
                      <Label htmlFor="proficient">Proficient</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="adequate" id="adequate" />
                      <Label htmlFor="adequate">Adequate</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="limited" id="limited" />
                      <Label htmlFor="limited">Limited</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="additional-comments" className="text-base font-medium">
                    Additional Comments
                  </Label>
                  <Textarea
                    id="additional-comments"
                    value={feedback.additionalComments}
                    onChange={(e) => handleInputChange("additionalComments", e.target.value)}
                    placeholder="Any other feedback or suggestions..."
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/student")}
                >
                  Skip
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}