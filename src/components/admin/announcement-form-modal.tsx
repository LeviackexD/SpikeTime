
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
import { useLanguage } from '@/context/language-context';

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
    const { t } = useLanguage();
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
          <DialogTitle className="font-headline text-brown handwriting text-2xl">{announcement ? t('modals.announcementForm.editTitle') : t('modals.announcementForm.createTitle')}</DialogTitle>
          <DialogDescription>
            {announcement ? t('modals.announcementForm.editDescription') : t('modals.announcementForm.createDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-brown font-semibold">
                    {t('modals.announcementForm.title')}
                    </Label>
                    <Input id="title" value={formData.title} onChange={handleChange} placeholder="e.g., Summer Tournament" required className="bg-cream border-brown-light focus:border-brown"/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="category" className="text-brown font-semibold">{t('modals.announcementForm.category')}</Label>
                    <Select value={formData.category} onValueChange={handleSelectChange}>
                        <SelectTrigger id="category" className="bg-cream border-brown-light focus:border-brown">
                            <SelectValue placeholder={t('modals.announcementForm.selectCategory')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="event">🎉 {t('announcementCategories.event')}</SelectItem>
                            <SelectItem value="class">🏐 {t('announcementCategories.class')}</SelectItem>
                            <SelectItem value="tournament">🏆 {t('announcementCategories.tournament')}</SelectItem>
                            <SelectItem value="general">📢 {t('announcementCategories.general')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="content" className="text-brown font-semibold">
                    {t('modals.announcementForm.content')}
                    </Label>
                    <Textarea id="content" value={formData.content} onChange={handleChange} placeholder="Describe the announcement..." required className="bg-cream border-brown-light focus:border-brown" />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} className="button-hover">{t('modals.cancel')}</Button>
                <Button type="submit" className="bg-brown text-cream button-hover">{t('modals.save')}</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
