
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
import type { Announcement } from '@/lib/types';
import { Calendar } from 'lucide-react';

interface AnnouncementDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}

export default function AnnouncementDetailsModal({ isOpen, onClose, announcement }: AnnouncementDetailsModalProps) {
  if (!announcement) return null;

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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">{announcement.title}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-2 pt-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(announcement.date)}</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 whitespace-pre-wrap text-foreground">
          {announcement.content}
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
