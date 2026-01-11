import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { VideoStream } from "@/components/media/VideoStream";
import { useAuth } from "@/hooks/useAuth";

export default function OneToOneSession() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { toast } = useToast();
  const { user } = useAuth();

  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Load session data
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;

      try {
        const sessionDoc = doc(db, "connectionRequests", sessionId);
        const sessionSnap = await getDoc(sessionDoc);

        if (sessionSnap.exists()) {
          setSessionData({ id: sessionSnap.id, ...sessionSnap.data() });
          setIsSessionActive(sessionSnap.data().status === "active");
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        toast({
          title: "Error",
          description: "Failed to load session data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, toast]);

  // Handle session end
  const handleEndSession = async () => {
    try {
      if (sessionId) {
        const sessionDoc = doc(db, "connectionRequests", sessionId);
        await updateDoc(sessionDoc, {
          status: "completed",
          endTime: new Date(),
          duration: 0 // Will be calculated based on start/end time
        });
      }

      // Navigate to feedback page
      navigate(`/student/session/${sessionId}/feedback`);
    } catch (error) {
      console.error("Error ending session:", error);
      toast({
        title: "Error",
        description: "Failed to end session properly",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Get company and role names for display
  const companyName = sessionData?.companyId || "Company";
  const roleName = sessionData?.roleId || "Role";

  return (
    <div className="min-h-screen">
      <VideoStream
        sessionId={sessionId || "unknown"}
        companyName={companyName.charAt(0).toUpperCase() + companyName.slice(1)}
        roleName={roleName.charAt(0).toUpperCase() + roleName.slice(1)}
        onEndSession={handleEndSession}
      />
    </div>
  );
}