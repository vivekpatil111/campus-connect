import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, Paperclip, Mic, Smile } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatInterface } from "@/components/chat/ChatInterface";

interface ChatParticipant {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

export function ChatWindow() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [participant, setParticipant] = useState<ChatParticipant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChatDetails = async () => {
      if (!chatId || !user) return;

      try {
        // Check if this is a mentorship request ID
        const requestDoc = await getDoc(doc(db, "mentorshipRequests", chatId.replace("chat_", "")));

        if (requestDoc.exists()) {
          const requestData = requestDoc.data();

          // Determine if current user is student or alumni
          if (requestData.studentId === user.uid) {
            // Current user is student, get alumni info
            const alumniDoc = await getDoc(doc(db, "alumniProfiles", requestData.alumniId));
            if (alumniDoc.exists()) {
              const alumniData = alumniDoc.data();
              setParticipant({
                id: requestData.alumniId,
                name: alumniData.fullName || "Alumni Mentor",
                role: "alumni",
                avatar: `/avatars/${requestData.alumniId}.png`
              });
            }
          } else if (requestData.alumniId === user.uid) {
            // Current user is alumni, get student info
            const studentDoc = await getDoc(doc(db, "users", requestData.studentId));
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              setParticipant({
                id: requestData.studentId,
                name: studentData.fullName || "Student",
                role: "student",
                avatar: "/avatars/user.png"
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching chat details:", error);
        toast({
          title: "Error",
          description: "Failed to load chat details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChatDetails();
  }, [chatId, user, toast]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Card className="max-w-md mx-auto mt-16">
          <CardHeader>
            <CardTitle>Chat Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">The requested chat could not be found.</p>
            <Button onClick={handleBack} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-4">
          <Button onClick={handleBack} variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <ChatInterface
          sessionId={chatId || ""}
          participantName={participant.name}
          participantRole={participant.role}
          participantAvatar={participant.avatar}
          onClose={handleBack}
        />
      </div>
    </div>
  );
}