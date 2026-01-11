import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Camera, Mic, AlertTriangle, CheckCircle, RefreshCw, Settings } from 'lucide-react';
import { MediaDeviceError } from '@/hooks/useMediaDevices';

interface PermissionGuardProps {
  type: 'camera' | 'microphone' | 'both';
  isSupported: boolean;
  isLoading: boolean;
  error: MediaDeviceError | null;
  hasPermission: boolean;
  onRequestPermission: () => Promise<void>;
  onRetry?: () => void;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  type,
  isSupported,
  isLoading,
  error,
  hasPermission,
  onRequestPermission,
  onRetry,
  children
}) => {
  // If everything is good, render children
  if (isSupported && hasPermission && !isLoading && !error) {
    return <>{children}</>;
  }

  // Browser not supported
  if (!isSupported) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Browser Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Browser Incompatibility</AlertTitle>
            <AlertDescription>
              Your browser does not support camera/microphone access. 
              Please use Chrome, Firefox, Safari, or Edge.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Initializing {type === 'both' ? 'Camera & Microphone' : type}
          </h3>
          <p className="text-gray-600 text-center">
            Please wait while we set up your media devices...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Access Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTitle>{error.name}</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
          
          <div className="flex gap-2 justify-center">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button onClick={onRequestPermission} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Request Access
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Permission not granted - show request UI
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'both' ? (
            <>
              <Camera className="h-5 w-5 text-indigo-600" />
              <Mic className="h-5 w-5 text-indigo-600" />
            </>
          ) : type === 'camera' ? (
            <Camera className="h-5 w-5 text-indigo-600" />
          ) : (
            <Mic className="h-5 w-5 text-indigo-600" />
          )}
          Permission Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTitle>Media Access Required</AlertTitle>
          <AlertDescription>
            This feature requires access to your {type === 'both' ? 'camera and microphone' : type}.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Required Permissions</span>
            <Badge variant="outline">
              {type === 'both' ? 'Camera & Microphone' : type}
            </Badge>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Steps to Grant Access:</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>Click "Grant Permission" button below</li>
              <li>Allow access in the browser dialog</li>
              <li>Reload if prompted</li>
            </ol>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={onRequestPermission} 
            className="flex items-center gap-2"
            size="lg"
          >
            <CheckCircle className="h-4 w-4" />
            Grant Permission
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>If access is denied, check your browser settings and try again.</p>
        </div>
      </CardContent>
    </Card>
  );
};