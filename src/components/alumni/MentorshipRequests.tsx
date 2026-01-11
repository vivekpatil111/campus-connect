import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Check, Clock, MessageCircle, Phone, Video, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MentorshipRequest {
  id: string;
  studentId: string;
  alumniId: string;
  message: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  timestamp: Date;
  type?: "chat" | "video" | "in-person";
  chatEnabled?: boolean;
}

interface StudentProfile {
  uid: string;
  fullName: string;
  email: string;
  collegeName: string;
  department: string;
  currentYear?: string;
}

export function MentorshipRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [studentProfiles, setStudentProfiles] = useState<Record<string, StudentProfile>>({});
  const [loading, setLoading] = useState(true);

  // Fetch mentorship requests for this alumni
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "mentorshipRequests"),
      where("alumniId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requestsList: MentorshipRequest[] = [];
      querySnapshot.forEach((doc) => {
        requestsList.push({ id: doc.id, ...doc.data() } as MentorshipRequest);
      });
      setRequests(requestsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching mentorship requests:", error);
      toast({
        title: "Error",
        description: "Failed to load mentorship requests",
        variant: "destructive"
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  // Fetch student profiles for the requests
  useEffect(() => {
    const fetchStudentProfiles = async () => {
      const profiles: Record<string, StudentProfile> = {};

      for (const request of requests) {
        if (request.studentId && !profiles[request.studentId]) {
          try {
            const studentDoc = await getDoc(doc(db, "users", request.studentId));
            if (studentDoc.exists()) {
              profiles[request.studentId] = {
                uid: studentDoc.id,
                ...studentDoc.data()
              } as StudentProfile;
            }
          } catch (error) {
            console.error(`Error fetching student ${request.studentId}:`, error);
          }
        }
      }

      setStudentProfiles(profiles);
    };

    if (requests.length > 0) {
      fetchStudentProfiles();
    }
  }, [requests]);

  const handleRequestResponse = async (requestId: string, status: "accepted" | "rejected") => {
    try {
      const requestDoc = doc(db, "mentorshipRequests", requestId);
      await updateDoc(requestDoc, {
        status,
        updatedAt: new Date(),
        chatEnabled: status === "accepted"
      });

      // If accepted, create chat document
      if (status === "accepted") {
        const requestDoc = await getDoc(doc(db, "mentorshipRequests", requestId));
        if (requestDoc.exists()) {
          const requestData = requestDoc.data();
          const chatId = `chat_${requestId}`;

          // Create chat document
          await setDoc(doc(db, "chats", chatId), {
            participants: [requestData.studentId, requestData.alumniId],
            createdAt: new Date(),
            lastMessage: "",
            lastMessageTime: new Date()
          });
        }
      }

      toast({
        title: "Request Updated",
        description: `Mentorship request has been ${status}.`
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

  const handleStartChat = (request: MentorshipRequest) => {
    if (request.status === "accepted" && request.chatEnabled) {
      navigate(`/alumni/chat/chat_${request.id}`);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentorship Requests</h2>
        <p className="text-gray-600">Manage requests from students for mentorship sessions</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">No mentorship requests at this time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((request) => {
            const student = studentProfiles[request.studentId];
            return (
              <Card key={request.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Mentorship Request</CardTitle>
                      <CardDescription>{student?.email || "Student"}</CardDescription>
                    </div>
                    {getRequestStatusBadge(request.status)}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{student?.fullName ? student.fullName.charAt(0) : 'S'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student?.fullName || "Student"}</p>
                        <p className="text-sm text-gray-500">{student?.collegeName}</p>
                        <p className="text-sm text-gray-500">{student?.department} - {student?.currentYear}</p>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">Message:</span> {request.message}
                    </p>

                    {request.type && (
                      <div className="flex items-center gap-2">
                        {getRequestTypeIcon(request.type)}
                        <span className="text-sm capitalize">{request.type} session</span>
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      Requested: {request.timestamp.toLocaleString()}
                    </div>
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
                      className="w-full flex items-center gap-2"
                      onClick={() => handleStartChat(request)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat with Student
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}