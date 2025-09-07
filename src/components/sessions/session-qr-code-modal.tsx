
'use client';

import * as React from 'react';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Session } from '@/lib/types';
import { Calendar, Clock, MapPin, QrCode } from 'lucide-react';

interface SessionQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
}

export default function SessionQRCodeModal({ isOpen, onClose, session }: SessionQRCodeModalProps) {
  const qrCodeRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (isOpen && session && qrCodeRef.current) {
      const sessionInfo = `Session ID: ${session.id}\nLevel: ${session.level}\nDate: ${session.date}\nTime: ${session.startTime} - ${session.endTime}`;
      QRCode.toCanvas(qrCodeRef.current, sessionInfo, { width: 256, margin: 2 }, (error) => {
        if (error) console.error('Failed to generate QR Code:', error);
      });
    }
  }, [isOpen, session]);

  if (!session) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <QrCode /> Session Check-in
          </DialogTitle>
          <DialogDescription>
            Scan this code to check players into the session.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-6 py-4">
          <canvas ref={qrCodeRef} className="rounded-lg" />
          <div className="text-center">
            <h3 className="text-lg font-bold">{session.level} Session</h3>
            <div className="text-sm text-muted-foreground space-y-1 mt-2">
              <p className="flex items-center justify-center gap-2"><Calendar className="h-4 w-4" /> {formatDate(session.date)}</p>
              <p className="flex items-center justify-center gap-2"><Clock className="h-4 w-4" /> {session.startTime} - {session.endTime}</p>
              <p className="flex items-center justify-center gap-2"><MapPin className="h-4 w-4" /> {session.location}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
