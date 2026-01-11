import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Check, Clock, MessageCircle, Phone, Video, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConnectionRequest {
  id: string;
  studentId: string;
  alumniId: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  type: "chat" | "video" | "in-person";
  timestamp: Date;
  scheduledTime?: Date;
  studentName?: string;
  studentEmail?: string;
}

export function ConnectionRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch connection requests for this alumni
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "connectionRequests"),
      where("alumniId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requestsList: ConnectionRequest[] = [];
      querySnapshot.forEach((doc) => {
        requestsList.push({ id: doc.id, ...doc.data() } as ConnectionRequest);
      });
      setRequests(requestsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching connection requests:", error);
      toast({
        title: "Error",
        description: "Failed to load connection requests",
        variant: "destructive"
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleRequestResponse = async (requestId: string, status: "accepted" | "rejected") => {
    try {
      const requestDoc = doc(db, "connectionRequests", requestId);
      await updateDoc(requestDoc, {
        status,
        updatedAt: new Date()
      });

      if (status === "accepted") {
        // Create a session document
        const request = requests.find(r => r.id === requestId);
        if (request) {
          await updateDoc(requestDoc, {
            status: "accepted",
            sessionCreated: true
          });
        }
      }

      toast({
        title: "Request Updated",
        description: `Connection request has been ${status}.`
      });
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description: `Failed to ${status} request`,
        variant: "destructive"
      });
    }
  };

  const handleStartSession = (request: ConnectionRequest) => {
    if (request.status === "accepted") {
      // Navigate to the appropriate session type
      if (request.type === "video") {
        navigate(`/alumni/session/${request.id}`);
      } else if (request.type === "chat") {
        navigate(`/alumni/chat/${request.id}`);
      }
    }
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case "accepted":
        return <Badge variant="default" className="flex items-center gap-1"><Check className="w-3 h-3" /> Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex items-center gap-1"><X className="w-3 h-3" /> Rejected</Badge>;
      case "completed":
        return <Badge variant="outline" className="flex items-center gap-1"><Check className="w-3 h-3" /> Completed</Badge>;
      default:
        return null;
    }
  };

  const getRequestTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "chat":
        return <MessageCircle className="w-4 h-4" />;
      case "in-person":
        return <Phone className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Requests</h2>
        <p className="text-gray-600">Manage requests from students for mentorship sessions</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No connection requests at this time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Connection Request</CardTitle>
                    <CardDescription>{request.studentEmail || "Student"}</CardDescription>
                  </div>
                  {getRequestStatusBadge(request.status)}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {getRequestTypeIcon(request.type)}
                    <span className="text-sm capitalize">{request.type} session</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Requested: {request.timestamp.toLocaleString()}
                  </div>
                  {request.scheduledTime && (
                    <div className="text-sm text-gray-500">
                      Scheduled: {request.scheduledTime.toLocaleString()}
                    </div>
                  )}
                </div>
              </CardContent>
              {request.status === "pending" && (
                <div className="p-4 pt-0 flex justify-between">
                  <Button
                    variant="destructive"
                    onClick={() => handleRequestResponse(request.id, "rejected")}
                    className="w-[48%]"
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleRequestResponse(request.id, "accepted")}
                    className="w-[48%]"
                  >
                    Accept
                  </Button>
                </div>
              )}
              {request.status === "accepted" && (
                <div className="p-4 pt-0">
                  <Button
                    className="w-full"
                    onClick={() => handleStartSession(request)}
                  >
                    Start Session
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}