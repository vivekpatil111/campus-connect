import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface SessionRequest {
  id: string;
  studentId: string;
  studentEmail: string;
  companyId: string;
  roleId: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  timestamp: Date;
}

export function SessionRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch session requests for this alumni
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "sessionRequests"),
      where("alumniId", "==", user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requestsList: SessionRequest[] = [];
      querySnapshot.forEach((doc) => {
        requestsList.push({ id: doc.id, ...doc.data() } as SessionRequest);
      });
      setRequests(requestsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching session requests:", error);
      toast({
        title: "Error",
        description: "Failed to load session requests",
        variant: "destructive"
      });
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [user, toast]);

  const handleRequestResponse = async (requestId: string, status: "accepted" | "rejected") => {
    try {
      const requestDoc = doc(db, "sessionRequests", requestId);
      await updateDoc(requestDoc, {
        status,
        updatedAt: new Date()
      });
      
      if (status === "accepted") {
        // Create a session document
        await addDoc(collection(db, "sessions"), {
          requestId,
          studentId: requests.find(r => r.id === requestId)?.studentId,
          alumniId: user?.uid,
          companyId: requests.find(r => r.id === requestId)?.companyId,
          roleId: requests.find(r => r.id === requestId)?.roleId,
          status: "active",
          startTime: new Date(),
          createdAt: new Date()
        });
      }
      
      toast({
        title: "Request Updated",
        description: `Session request has been ${status}.`
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Requests</h2>
        <p className="text-gray-600">Manage requests from students for one-to-one mentoring sessions</p>
      </div>
      
      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No session requests at this time</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Session Request</CardTitle>
                    <CardDescription>{request.studentEmail}</CardDescription>
                  </div>
                  <Badge variant={
                    request.status === "pending" ? "secondary" :
                    request.status === "accepted" ? "default" :
                    request.status === "rejected" ? "destructive" : "outline"
                  }>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Company:</span> {request.companyId}</p>
                  <p><span className="font-medium">Role:</span> {request.roleId}</p>
                  <p><span className="font-medium">Requested:</span> {request.timestamp.toLocaleString()}</p>
                </div>
              </CardContent>
              {request.status === "pending" && (
                <div className="p-6 pt-0 flex justify-between">
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}