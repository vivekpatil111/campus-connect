import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/dashboard");
  };

  const handleSwitchToSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/campusprep-logo.png"
              alt="CampusPrep Logo"
              className="h-12 w-12 object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome back to CampusPrep</CardTitle>
          <CardDescription className="text-gray-600">
            Continue your interview preparation with AI-powered practice and verified alumni guidance.
          </CardDescription>
          <p className="text-xs text-gray-500 mt-2">
            Secure login • Institution-backed platform • Alumni verified by admin
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm onLoginSuccess={handleLoginSuccess} onSwitchToSignup={handleSwitchToSignup} />
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Powered by Team Block Minds
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}