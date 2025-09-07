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
import type { Announcement } from '@/lib/types';

interface AnnouncementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (announcement: Announcement) => void;
  announcement: Announcement | null;
}

const emptyAnnouncement: Omit<Announcement, 'id' | 'date'> = {
  title: '',
  content: '',
};

export default function AnnouncementFormModal({ isOpen, onClose, onSave, announcement }: AnnouncementFormModalProps) {
    const [formData, setFormData] = React.useState<Omit<Announcement, 'id' | 'date'>>(announcement || emptyAnnouncement);

    React.useEffect(() => {
        if(announcement) {
            setFormData({ title: announcement.title, content: announcement.content });
        } else {
            setFormData(emptyAnnouncement);
        }
    }, [announcement, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({...prev, [id]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...(announcement || { id: '', date: '' }),
            ...formData,
        });
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{announcement ? 'Edit Announcement' : 'Create Announcement'}</DialogTitle>
          <DialogDescription>
            {announcement ? 'Update the details for this announcement.' : 'Fill out the form to create a new announcement.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="title">
                    Title
                    </Label>
                    <Input id="title" value={formData.title} onChange={handleChange} placeholder="e.g., Summer Tournament" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="content">
                    Content
                    </Label>
                    <Textarea id="content" value={formData.content} onChange={handleChange} placeholder="Describe the announcement..." required/>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Announcement</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
