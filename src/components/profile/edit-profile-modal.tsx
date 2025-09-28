
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase-client';


interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
    const { t } = useLanguage();
    const { updateUser } = useAuth();
    const [formData, setFormData] = React.useState<User | null>(user);
    const [isUploading, setIsUploading] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    React.useEffect(() => {
        setFormData(user);
    }, [user, isOpen]);

    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => prev ? {...prev, [id]: value} : null);
    };

    const handleSelectChange = (field: 'skillLevel' | 'favoritePosition') => (value: string) => {
        setFormData(prev => prev ? ({ ...prev, [field]: value as any }) : null);
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !user) {
            return;
        }

        const file = e.target.files[0];
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({
                title: t('toasts.imageTooLargeTitle'),
                description: t('toasts.imageTooLargeDescription', {maxSize: 5}),
                variant: "destructive"
            });
            return;
        }
        setIsUploading(true);

        try {
            // --- Logic to delete old files ---
            const { data: files, error: listError } = await supabase.storage.from('avatars').list(user.id);
            if (listError) console.error('Error listing old avatars:', listError);
            if (files && files.length > 0) {
                const filesToRemove = files.map((f: { name: string }) => `${user.id}/${f.name}`);
                const { error: removeError } = await supabase.storage.from('avatars').remove(filesToRemove);
                if (removeError) console.error('Error removing old avatars:', removeError);
            }

            // --- Upload new file ---
            const fileExtension = file.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExtension}`;
            
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (uploadError) throw uploadError;

            // --- Get public URL and update profile ---
            const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            const avatarUrlWithCacheBuster = `${publicUrlData.publicUrl}?t=${new Date().getTime()}`;

            const success = await updateUser({ ...formData, avatarUrl: avatarUrlWithCacheBuster });

            if(success) {
                setFormData(prev => prev ? { ...prev, avatarUrl: avatarUrlWithCacheBuster } : null);
                toast({ title: t('toasts.avatarUpdatedTitle'), description: t('toasts.avatarUpdatedDescription'), variant: "success", duration: 1500 });
            } else {
                throw new Error("Failed to update user profile with new avatar URL.");
            }

        } catch (error: any) {
            toast({
                title: t('toasts.uploadFailedTitle'),
                description: error.message || t('toasts.uploadFailedDescription'),
                variant: "destructive"
            });
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            setIsSaving(true);
            const success = await updateUser(formData);
            if(success) {
                toast({
                    title: t('toasts.profileUpdatedTitle'),
                    description: t('toasts.profileUpdatedDescription'),
                    variant: "success",
                    duration: 1500
                });
                onClose();
            } else {
                toast({
                    title: t('toasts.updateFailedTitle'),
                    description: t('toasts.updateFailedDescription'),
                    variant: "destructive",
                });
            }
            setIsSaving(false);
        }
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{t('modals.editProfile.title')}</DialogTitle>
          <DialogDescription>
            {t('modals.editProfile.description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>{t('modals.editProfile.avatar')}</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={formData.avatarUrl} alt={formData.name} />
                      <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                      {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isUploading ? t('modals.editProfile.uploading') : t('modals.editProfile.changePicture')}
                    </Button>
                    <Input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/png, image/jpeg, image/gif"
                      onChange={handleAvatarChange}
                      disabled={isUploading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">{t('modals.editProfile.fullName')}</Label>
                    <Input id="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="skillLevel">{t('profilePage.skillLevel')}</Label>
                    <Select value={formData.skillLevel} onValueChange={handleSelectChange('skillLevel')}>
                        <SelectTrigger id="skillLevel">
                            <SelectValue placeholder={t('registerPage.skillLevelPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Beginner">{t('skillLevels.Beginner')}</SelectItem>
                            <SelectItem value="Intermediate">{t('skillLevels.Intermediate')}</SelectItem>
                            <SelectItem value="Advanced">{t('skillLevels.Advanced')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="favoritePosition">{t('profilePage.favoritePosition')}</Label>
                    <Select value={formData.favoritePosition} onValueChange={handleSelectChange('favoritePosition')}>
                        <SelectTrigger id="favoritePosition">
                            <SelectValue placeholder={t('registerPage.favoritePositionPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Setter">{t('positions.Setter')}</SelectItem>
                            <SelectItem value="Hitter">{t('positions.Hitter')}</SelectItem>
                            <SelectItem value="Libero">{t('positions.Libero')}</SelectItem>
                            <SelectItem value="Blocker">{t('positions.Blocker')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>{t('modals.cancel')}</Button>
                <Button type="submit" disabled={isSaving || isUploading}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t('modals.saveChanges')}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

    