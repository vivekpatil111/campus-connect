import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ChatSession() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [participantInfo, setParticipantInfo] = useState({
    name: "",
    role: "",
    avatar: ""
  });

  // Load session data
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;

      try {
        const sessionDoc = doc(db, "connectionRequests", sessionId);
        const sessionSnap = await getDoc(sessionDoc);

        if (sessionSnap.exists()) {
          const data = sessionSnap.data();
          setSessionData({ id: sessionSnap.id, ...data });

          // Get participant info based on user role
          if (data.studentId === user?.uid) {
            // Student is the current user, get alumni info
            const alumniDoc = await getDoc(doc(db, "alumniProfiles", data.alumniId));
            if (alumniDoc.exists()) {
              const alumniData = alumniDoc.data();
              setParticipantInfo({
                name: alumniData.fullName || "Alumni Mentor",
                role: "alumni",
                avatar: `/avatars/${data.alumniId}.png`
              });
            }
          } else {
            // Alumni is the current user, get student info
            const studentDoc = await getDoc(doc(db, "users", data.studentId));
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              setParticipantInfo({
                name: studentData.fullName || "Student",
                role: "student",
                avatar: "/avatars/user.png"
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        toast({
          title: "Error",
          description: "Failed to load chat session",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, user, toast]);

  const handleCloseChat = () => {
    navigate("/student");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Card className="max-w-md mx-auto mt-16">
          <CardHeader>
            <CardTitle>Chat Session Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">The requested chat session could not be found.</p>
            <Button onClick={handleCloseChat} className="mt-4">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <ChatInterface
          sessionId={sessionId || ""}
          participantName={participantInfo.name}
          participantRole={participantInfo.role}
          participantAvatar={participantInfo.avatar}
          onClose={handleCloseChat}
        />
      </div>
    </div>
  );
}