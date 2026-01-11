import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Check, Clock, MessageCircle, Phone, Video, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface AlumniProfile {
  uid: string;
  fullName: string;
  college: string;
  department: string;
  branch: string;
  passingYear: number;
  company: string;
  role: string;
  status: "pending" | "approved" | "rejected";
  availability?: string[];
  expertise?: string[];
}

interface ConnectionRequest {
  id: string;
  studentId: string;
  alumniId: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  type: "chat" | "video" | "in-person";
  timestamp: Date;
  scheduledTime?: Date;
}

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

export function AlumniConnection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [alumniList, setAlumniList] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);
  const [requestType, setRequestType] = useState<"chat" | "video" | "in-person">("video");
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch approved alumni profiles
  useEffect(() => {
    const q = query(
      collection(db, "alumniProfiles"),
      where("status", "==", "approved")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const alumni: AlumniProfile[] = [];
      querySnapshot.forEach((doc) => {
        alumni.push({ uid: doc.id, ...doc.data() } as AlumniProfile);
      });
      setAlumniList(alumni);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching approved alumni:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch connection requests for current user
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "connectionRequests"),
      where("studentId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requests: ConnectionRequest[] = [];
      querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() } as ConnectionRequest);
      });
      setConnectionRequests(requests);
    }, (error) => {
      console.error("Error fetching connection requests:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch mentorship requests for current user
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "mentorshipRequests"),
      where("studentId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requests: MentorshipRequest[] = [];
      querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() } as MentorshipRequest);
      });
      setMentorshipRequests(requests);
    }, (error) => {
      console.error("Error fetching mentorship requests:", error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleConnectClick = (alumni: AlumniProfile) => {
    setSelectedAlumni(alumni);
    setShowRequestForm(true);
    setMessage(""); // Reset message when opening form
  };

  const handleRequestSubmit = async () => {
    if (!user || !selectedAlumni) {
      toast({
        title: "Error",
        description: "User or alumni information missing",
        variant: "destructive"
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message for your mentorship request",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create mentorship request data
      const requestData = {
        studentId: user.uid,
        alumniId: selectedAlumni.uid,
        message: message.trim(),
        status: "pending",
        type: requestType,
        timestamp: new Date(),
        chatEnabled: false
      };

      // Add to mentorshipRequests collection
      const docRef = await addDoc(collection(db, "mentorshipRequests"), requestData);

      toast({
        title: "Request Sent",
        description: `Your mentorship request has been sent to ${selectedAlumni.fullName}`,
        variant: "default"
      });

      // Reset form state
      setShowRequestForm(false);
      setSelectedAlumni(null);
      setMessage("");
    } catch (error) {
      console.error("Error sending mentorship request:", error);
      toast({
        title: "Error",
        description: "Failed to send mentorship request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, "mentorshipRequests", requestId), {
        status: "rejected"
      });

      toast({
        title: "Request Cancelled",
        description: "Your mentorship request has been cancelled",
        variant: "default"
      });
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast({
        title: "Error",
        description: "Failed to cancel request",
        variant: "destructive"
      });
    }
  };

  const handleStartSession = (request: MentorshipRequest) => {
    if (request.status === "accepted") {
      // Navigate to the appropriate session type
      if (request.type === "video") {
        navigate(`/student/session/${request.id}`);
      } else if (request.type === "chat") {
        navigate(`/student/chat/chat_${request.id}`);
      }
    }
  };

  const handleStartChat = (request: MentorshipRequest) => {
    if (request.status === "accepted" && request.chatEnabled) {
      navigate(`/student/chat/chat_${request.id}`);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect with Alumni</h2>
        <p className="text-gray-600">
          Reach out to verified alumni for mentorship and guidance
        </p>
      </div>

      {/* Mentorship Requests */}
      {mentorshipRequests.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Mentorship Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mentorshipRequests.map((request) => {
              const alumni = alumniList.find(a => a.uid === request.alumniId);
              return (
                <Card key={request.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{alumni?.fullName || "Alumni"}</CardTitle>
                      {getRequestStatusBadge(request.status)}
                    </div>
                    <CardDescription className="text-sm">
                      {alumni?.company} - {alumni?.role}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getRequestTypeIcon(request.type || "video")}
                        <span className="text-sm capitalize">{request.type || "video"} session</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Message: {request.message}
                      </div>
                      <div className="flex gap-2">
                        {request.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelRequest(request.id)}
                          >
                            Cancel Request
                          </Button>
                        )}
                        {request.status === "accepted" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStartSession(request)}
                            >
                              Start Session
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartChat(request)}
                              className="flex items-center gap-1"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Chat
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Alumni List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alumniList.map((alumni) => (
          <Card key={alumni.uid} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={`/avatars/${alumni.uid}.png`} alt={alumni.fullName} />
                    <AvatarFallback>{alumni.fullName ? alumni.fullName.charAt(0) : 'A'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{alumni.fullName}</CardTitle>
                    <CardDescription>{alumni.company}</CardDescription>
                  </div>
                </div>
                <Badge variant="default" className="flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Verified
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{alumni.role}</p>
                  <p className="text-sm text-gray-500">{alumni.college}</p>
                  <p className="text-sm text-gray-500">{alumni.department}</p>
                  <p className="text-sm text-gray-500">Class of {alumni.passingYear}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Expertise</h4>
                  <div className="flex flex-wrap gap-1">
                    {alumni.expertise?.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Availability</h4>
                  <div className="flex flex-wrap gap-1">
                    {alumni.availability && alumni.availability.length > 0 ? (
                      alumni.availability.map((time, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {time}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No availability specified</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="p-4 pt-0">
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => handleConnectClick(alumni)}
              >
                Connect with {alumni.fullName ? alumni.fullName.split(' ')[0] : 'Alumni'}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Connection Request Form */}
      {showRequestForm && selectedAlumni && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Request Mentorship</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowRequestForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={`/avatars/${selectedAlumni.uid}.png`} alt={selectedAlumni.fullName} />
                  <AvatarFallback>{selectedAlumni.fullName ? selectedAlumni.fullName.charAt(0) : 'A'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedAlumni.fullName}</h3>
                  <p className="text-sm text-gray-500">{selectedAlumni.company} - {selectedAlumni.role}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Connection Type</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={requestType === "video" ? "default" : "outline"}
                    onClick={() => setRequestType("video")}
                    className="flex flex-col items-center gap-1 py-3"
                  >
                    <Video className="w-5 h-5" />
                    <span className="text-xs">Video Call</span>
                  </Button>
                  <Button
                    variant={requestType === "chat" ? "default" : "outline"}
                    onClick={() => setRequestType("chat")}
                    className="flex flex-col items-center gap-1 py-3"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs">Chat</span>
                  </Button>
                  <Button
                    variant={requestType === "in-person" ? "default" : "outline"}
                    onClick={() => setRequestType("in-person")}
                    className="flex flex-col items-center gap-1 py-3"
                  >
                    <Phone className="w-5 h-5" />
                    <span className="text-xs">In-Person</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the alumni why you'd like their mentorship..."
                  rows={4}
                  required
                />
              </div>

              {requestType === "video" && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Preferred Time</h4>
                  <input
                    type="datetime-local"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowRequestForm(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={handleRequestSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}