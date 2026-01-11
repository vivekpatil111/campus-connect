import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AlumniProfile {
  uid: string;
  college: string;
  department: string;
  passingYear: string;
  company: string;
  role: string;
  status: "pending" | "approved" | "rejected";
}

export function ApprovedAlumniList() {
  const [approvedAlumni, setApprovedAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch approved alumni profiles
  useEffect(() => {
    const q = query(
      collection(db, "alumniProfiles"),
      where("status", "==", "approved")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const alumniList: AlumniProfile[] = [];
      querySnapshot.forEach((doc) => {
        alumniList.push({ uid: doc.id, ...doc.data() } as AlumniProfile);
      });
      setApprovedAlumni(alumniList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching approved alumni:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      
      {approvedAlumni.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No approved alumni profiles available yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedAlumni.map((alumni) => (
            <Card key={alumni.uid} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{alumni.company}</CardTitle>
                    <CardDescription>{alumni.role}</CardDescription>
                  </div>
                  <Badge variant="default">Verified</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">College:</span> {alumni.college}</p>
                  <p><span className="font-medium">Department:</span> {alumni.department}</p>
                  <p><span className="font-medium">Passing Year:</span> {alumni.passingYear}</p>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Connect with {alumni.company} Alumni
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}