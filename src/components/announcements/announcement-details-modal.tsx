
/**
 * @fileoverview A modal dialog to display the full details of an announcement.
 * Triggered when a user clicks on an announcement card.
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
import type { Announcement, AnnouncementCategory } from '@/lib/types';
import { Calendar } from 'lucide-react';
import { getSafeDate } from '@/context/session-context';
import { cn } from '@/lib/utils';

interface AnnouncementDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}

const categoryStyles: Record<AnnouncementCategory, { bg: string; text: string; pin: string }> = {
  event: { bg: 'bg-paper-yellow', text: 'text-red-800', pin: 'bg-red-500' },
  class: { bg: 'bg-paper-blue', text: 'text-blue-800', pin: 'bg-blue-500' },
  tournament: { bg: 'bg-paper-pink', text: 'text-purple-800', pin: 'bg-purple-500' },
  general: { bg: 'bg-paper-green', text: 'text-green-800', pin: 'bg-green-500' },
};


export default function AnnouncementDetailsModal({ isOpen, onClose, announcement }: AnnouncementDetailsModalProps) {
  if (!announcement) return null;

  const styles = categoryStyles[announcement.category] || categoryStyles.general;

  const formatDate = (date: string) => {
    return getSafeDate(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("w-full max-w-lg mx-auto p-6 rounded-lg shadow-lg", styles.bg)}>
        <div className={cn('pushpin', styles.pin)}></div>
        <DialogHeader className="pt-4 text-left">
           <div className="mb-4">
            <span className={cn('px-3 py-1 rounded-full text-sm font-semibold', styles.bg.replace('bg-', 'bg-light-'), styles.text)}>
            {announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}
            </span>
          </div>
          <DialogTitle className="handwriting text-3xl font-bold text-brown text-left">{announcement.title}</DialogTitle>
          <DialogDescription asChild>
            <div className="flex items-center gap-2 pt-2 text-sm text-brown-light">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(announcement.date)}</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 whitespace-pre-wrap text-brown-dark">
          {announcement.content}
        </div>
        <DialogFooter>
          <Button onClick={onClose} className="bg-brown text-cream button-hover">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
