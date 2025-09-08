/**
 * @fileoverview A modal dialog for editing the current user's profile information.
 * Allows changing name, avatar, skill level, and favorite position.
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { User, SkillLevel, PlayerPosition } from '@/lib/types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user: User | null;
}

export default function EditProfileModal({ isOpen, onClose, onSave, user }: EditProfileModalProps) {
    const [formData, setFormData] = React.useState<User | null>(user);

    React.useEffect(() => {
        setFormData(user);
    }, [user, isOpen]);

    if (!formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => prev ? {...prev, [id]: value} : null);
    };

    const handleSelectChange = (field: 'skillLevel' | 'favoritePosition') => (value: string) => {
        setFormData(prev => prev ? ({ ...prev, [field]: value }) : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            onSave(formData);
        }
    }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={formData.name} onChange={handleChange} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="avatarUrl">Avatar URL</Label>
                    <Input id="avatarUrl" value={formData.avatarUrl} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="skillLevel">Skill Level</Label>
                    <Select value={formData.skillLevel} onValueChange={handleSelectChange('skillLevel')}>
                        <SelectTrigger id="skillLevel">
                            <SelectValue placeholder="Select your skill level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Beginner">Beginner</SelectItem>
                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                            <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="favoritePosition">Favorite Position</Label>
                    <Select value={formData.favoritePosition} onValueChange={handleSelectChange('favoritePosition')}>
                        <SelectTrigger id="favoritePosition">
                            <SelectValue placeholder="Select your favorite position" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Setter">Setter</SelectItem>
                            <SelectItem value="Hitter">Hitter</SelectItem>
                            <SelectItem value="Libero">Libero</SelectItem>
                            <SelectItem value="Blocker">Blocker</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
