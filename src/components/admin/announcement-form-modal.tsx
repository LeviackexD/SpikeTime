/**
 * @fileoverview A modal form for creating or editing announcements.
 * It's used within the admin page and the new announcements page.
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Announcement, AnnouncementCategory } from '@/lib/types';

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  announcement: Announcement | null;
}

const emptyAnnouncement: Omit<Announcement, 'id' | 'date'> = {
  title: '',
  content: '',
  category: 'general',
};

export default function AnnouncementFormModal({ isOpen, onClose, onSave, announcement }: AnnouncementFormModalProps) {
    const [formData, setFormData] = React.useState<Omit<Announcement, 'id' | 'date'>>(emptyAnnouncement);

    React.useEffect(() => {
        if(isOpen) {
            if(announcement) {
                setFormData({ title: announcement.title, content: announcement.content, category: announcement.category });
            } else {
                setFormData(emptyAnnouncement);
            }
        }
    }, [announcement, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    };

    const handleSelectChange = (value: AnnouncementCategory) => {
        setFormData(prev => ({ ...prev, category: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-paper">
        <DialogHeader>
          <DialogTitle className="font-headline text-brown handwriting text-2xl">{announcement ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
          <DialogDescription>
            {announcement ? 'Update the details for this announcement.' : 'Fill out the form to create a new announcement for the corkboard.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-brown font-semibold">
                    Title
                    </Label>
                    <Input id="title" value={formData.title} onChange={handleChange} placeholder="e.g., Summer Tournament" required className="bg-cream border-brown-light focus:border-brown"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="category" className="text-brown font-semibold">Category</Label>
                    <Select value={formData.category} onValueChange={handleSelectChange}>
                        <SelectTrigger id="category" className="bg-cream border-brown-light focus:border-brown">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="event">🎉 Event</SelectItem>
                            <SelectItem value="class">🏐 Class</SelectItem>
                            <SelectItem value="tournament">🏆 Tournament</SelectItem>
                            <SelectItem value="general">📢 General</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="content" className="text-brown font-semibold">
                    Content
                    </Label>
                    <Textarea id="content" value={formData.content} onChange={handleChange} placeholder="Describe the announcement..." required className="bg-cream border-brown-light focus:border-brown" />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} className="button-hover">Cancel</Button>
                <Button type="submit" className="bg-brown text-cream button-hover">Save</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
