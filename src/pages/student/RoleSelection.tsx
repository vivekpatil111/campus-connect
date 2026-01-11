import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RoleSelection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { companyId } = useParams();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const roles = [
    { id: "frontend", name: "Frontend Engineer", description: "Focus on UI/UX and client-side development" },
    { id: "backend", name: "Backend Engineer", description: "Focus on server-side logic and databases" },
    { id: "ml", name: "ML Engineer", description: "Focus on machine learning and data science" },
  ];

  const handleRoleSelect = (roleId: string) => {
    navigate(`/student/${companyId}/${roleId}/interview`);
  };

  // Capitalize company name for display
  const companyName = companyId ? 
    companyId.charAt(0).toUpperCase() + companyId.slice(1) : 
    "Company";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Role Selection</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user?.email}</span>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Select Role at {companyName}
            </h2>
            <p className="text-gray-600">
              Choose the position you're preparing for
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <Card
                key={role.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardHeader>
                  <CardTitle className="text-xl">{role.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{role.description}</p>
                  <Button className="w-full">Select Role</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}