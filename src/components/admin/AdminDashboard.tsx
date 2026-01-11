import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface AlumniProfile {
  uid: string;
  college: string;
  department: string;
  passingYear: string;
  company: string;
  role: string;
  status: "pending" | "approved" | "rejected";
}

export function AdminDashboard() {
  const [pendingAlumni, setPendingAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch pending alumni profiles
  useEffect(() => {
    const q = query(
      collection(db, "alumniProfiles"),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const alumniList: AlumniProfile[] = [];
      querySnapshot.forEach((doc) => {
        alumniList.push({ uid: doc.id, ...doc.data() } as AlumniProfile);
      });
      setPendingAlumni(alumniList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching pending alumni:", error);
      toast({
        title: "Error",
        description: "Failed to load pending alumni profiles",
        variant: "destructive"
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleApproval = async (uid: string, status: "approved" | "rejected") => {
    try {
      const alumniDoc = doc(db, "alumniProfiles", uid);
      await updateDoc(alumniDoc, {
        status,
        updatedAt: new Date()
      });
      
      toast({
        title: "Profile Updated",
        description: `Alumni profile has been ${status}.`
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: `Failed to ${status} profile`,
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pending Alumni Profiles</h2>
        <p className="text-gray-600">
          Review and approve alumni profiles for student visibility
        </p>
      </div>
      
      {pendingAlumni.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No pending alumni profiles for review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingAlumni.map((alumni) => (
            <Card key={alumni.uid} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{alumni.company}</CardTitle>
                    <CardDescription>{alumni.role}</CardDescription>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {alumni.uid}</p>
                  <p><span className="font-medium">College:</span> {alumni.college}</p>
                  <p><span className="font-medium">Department:</span> {alumni.department}</p>
                  <p><span className="font-medium">Passing Year:</span> {alumni.passingYear}</p>
                </div>
              </CardContent>
              <div className="p-6 pt-0 flex justify-between">
                <Button 
                  variant="destructive" 
                  onClick={() => handleApproval(alumni.uid, "rejected")}
                  className="w-[48%]"
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => handleApproval(alumni.uid, "approved")}
                  className="w-[48%]"
                >
                  Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}