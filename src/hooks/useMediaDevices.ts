import { useState, useEffect, useRef, useCallback } from 'react';

export interface MediaDeviceError {
  name: string;
  message: string;
  constraint?: string;
}

export interface UseMediaDevicesProps {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
  onError?: (error: MediaDeviceError) => void;
  onSuccess?: (stream: MediaStream) => void;
}

export interface UseMediaDevicesReturn {
  stream: MediaStream | null;
  isLoading: boolean;
  error: MediaDeviceError | null;
  hasPermission: boolean;
  isSupported: boolean;
  devices: MediaDeviceInfo[];
  requestPermission: () => Promise<void>;
  stopStream: () => void;
  restartStream: () => Promise<void>;
}

export const useMediaDevices = ({
  video = false,
  audio = false,
  onError,
  onSuccess
}: UseMediaDevicesProps): UseMediaDevicesReturn => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<MediaDeviceError | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Check browser support
  useEffect(() => {
    const checkSupport = () => {
      const supported = 
        navigator.mediaDevices && 
        navigator.mediaDevices.getUserMedia && 
        navigator.mediaDevices.enumerateDevices;
      setIsSupported(!!supported);
    };
    checkSupport();
  }, []);

  // Enumerate available devices
  const enumerateDevices = useCallback(async () => {
    if (!isSupported) return;

    try {
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      setDevices(deviceList);
    } catch (err) {
      console.warn('Failed to enumerate devices:', err);
    }
  }, [isSupported]);

  // Check current permission state
  const checkPermissionState = useCallback(async () => {
    if (!isSupported) return;

    try {
      // Check camera permission
      if (video) {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setHasPermission(cameraPermission.state === 'granted');
      }
      
      // Check microphone permission  
      if (audio) {
        const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setHasPermission(microphonePermission.state === 'granted');
      }
    } catch (err) {
      // Some browsers don't support permission query API
      console.warn('Permission query not supported:', err);
    }
  }, [video, audio, isSupported]);

  // Request media stream with error handling
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      const error: MediaDeviceError = {
        name: 'NotSupportedError',
        message: 'Media devices API is not supported in this browser'
      };
      setError(error);
      onError?.(error);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if we need to request permission first
      await checkPermissionState();
      
      const constraints: MediaStreamConstraints = {
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
          facingMode: 'user',
          ...(typeof video === 'object' ? video : {})
        } : false,
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          ...(typeof audio === 'object' ? audio : {})
        } : false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setHasPermission(true);
      setIsLoading(false);
      
      // Enumerate devices after getting permission
      await enumerateDevices();
      
      onSuccess?.(mediaStream);
    } catch (err: any) {
      const mediaError: MediaDeviceError = {
        name: err.name || 'UnknownError',
        message: getErrorMessage(err),
        constraint: err.constraint
      };
      
      setError(mediaError);
      setIsLoading(false);
      setHasPermission(false);
      onError?.(mediaError);
    }
  }, [video, audio, isSupported, onError, onSuccess, checkPermissionState, enumerateDevices]);

  // Stop the current stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  // Restart stream with same constraints
  const restartStream = useCallback(async () => {
    stopStream();
    await requestPermission();
  }, [stopStream, requestPermission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  // Monitor permission changes
  useEffect(() => {
    if (!isSupported) return;

    const handlePermissionChange = () => {
      checkPermissionState();
    };

    // Listen for permission changes
    navigator.permissions?.query({ name: 'camera' as PermissionName })
      .then(permission => permission.addEventListener('change', handlePermissionChange))
      .catch(() => {});

    navigator.permissions?.query({ name: 'microphone' as PermissionName })
      .then(permission => permission.addEventListener('change', handlePermissionChange))
      .catch(() => {});

    return () => {
      navigator.permissions?.query({ name: 'camera' as PermissionName })
        .then(permission => permission.removeEventListener('change', handlePermissionChange))
        .catch(() => {});

      navigator.permissions?.query({ name: 'microphone' as PermissionName })
        .then(permission => permission.removeEventListener('change', handlePermissionChange))
        .catch(() => {});
    };
  }, [isSupported, checkPermissionState]);

  return {
    stream,
    isLoading,
    error,
    hasPermission,
    isSupported,
    devices,
    requestPermission,
    stopStream,
    restartStream
  };
};

// Helper function to get user-friendly error messages
const getErrorMessage = (error: any): string => {
  switch (error.name) {
    case 'NotAllowedError':
      return 'Camera/microphone access was denied. Please allow access in your browser settings and try again.';
    case 'NotFoundError':
      return 'No camera/microphone found. Please check your device connections.';
    case 'NotReadableError':
      return 'Camera/microphone is currently in use by another application. Please close other applications and try again.';
    case 'OverconstrainedError':
      return `Unable to satisfy constraints: ${error.constraint}. Please try different settings.`;
    case 'NotSupportedError':
      return 'Your browser does not support camera/microphone access. Please try a different browser.';
    case 'TypeError':
      return 'Invalid constraints provided. Please check your media configuration.';
    default:
      return 'An unexpected error occurred while accessing camera/microphone. Please try again.';
  }
};