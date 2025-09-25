
/**
 * @fileoverview A modal component for capturing and uploading a "moment" photo after a session.
 * It handles camera access, photo capture, preview, and upload to Supabase storage.
 */

'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera, RefreshCw, Upload } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { supabase } from '@/lib/supabase-client';
import type { Session } from '@/lib/types';
import { useSessions } from '@/context/session-context';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface CreateMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
}

export default function CreateMemoryModal({ isOpen, onClose, session }: CreateMemoryModalProps) {
  const { t } = useLanguage();
  const { addMomentToSession } = useSessions();
  const { toast } = useToast();

  // Component State
  const [hasCameraPermission, setHasCameraPermission] = React.useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  
  // Refs
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // --- EFFECTS ---

  // Effect to handle camera setup and cleanup
  React.useEffect(() => {
    let stream: MediaStream | null = null;
    
    const getCameraPermission = async () => {
      if (!isOpen) return;

      setCapturedImage(null); // Reset on open

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, toast]);

  // --- EVENT HANDLERS ---

  const handleTakePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // High-quality JPEG
      setCapturedImage(dataUrl);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };
  
  const handleUploadPhoto = async () => {
    if (!capturedImage) return;

    setIsUploading(true);

    // Convert base64 to blob
    const response = await fetch(capturedImage);
    const blob = await response.blob();

    const filePath = `moments/${session.id}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('sessions')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true, // Overwrite if a moment for this session already exists
      });

    if (uploadError) {
      toast({ title: t('toasts.uploadFailedTitle'), description: uploadError.message, variant: 'destructive' });
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('sessions')
      .getPublicUrl(filePath);
      
    const imageUrl = `${publicUrlData.publicUrl}?t=${new Date().getTime()}`; // Cache-busting

    const success = await addMomentToSession(session.id, imageUrl);

    setIsUploading(false);

    if (success) {
      toast({ title: "Moment Saved!", description: "Your memory has been added to the session.", variant: "success" });
      onClose();
    } else {
       toast({ title: t('toasts.updateFailedTitle'), description: "Could not save the moment to the session.", variant: "destructive" });
    }
  };

  // --- RENDER LOGIC ---

  const renderContent = () => {
    if (hasCameraPermission === null) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (hasCameraPermission === false) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            Please allow camera access in your browser to use this feature. You may need to refresh the page after granting permission.
          </AlertDescription>
        </Alert>
      );
    }

    if (capturedImage) {
      // Show Preview
      return (
        <div className="space-y-4">
          <img src={capturedImage} alt="Captured moment" className="rounded-md aspect-video object-cover w-full" />
          <DialogFooter>
            <Button variant="outline" onClick={handleRetake} disabled={isUploading}>
              <RefreshCw className="mr-2" /> {t('Retake')}
            </Button>
            <Button onClick={handleUploadPhoto} disabled={isUploading}>
              {isUploading ? <Loader2 className="mr-2 animate-spin" /> : <Upload className="mr-2" />}
              {isUploading ? t('Uploading...') : t('Upload Moment')}
            </Button>
          </DialogFooter>
        </div>
      );
    }

    // Show Camera View
    return (
      <div className="space-y-4">
        <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
        <DialogFooter>
          <Button onClick={handleTakePhoto} className="w-full" size="lg">
            <Camera className="mr-2" /> {t('Take Photo')}
          </Button>
        </DialogFooter>
      </div>
    );
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline">{t('modals.sessionDetails.uploadMoment')}</DialogTitle>
          <DialogDescription>
            {t('modals.sessionDetails.uploadHint')}
          </DialogDescription>
        </DialogHeader>
        
        {renderContent()}

        {/* Hidden canvas for capturing the image */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

      </DialogContent>
    </Dialog>
  );
}
