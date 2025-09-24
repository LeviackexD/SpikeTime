
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


interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: Partial<User>) => void;
  user: User | null;
}

export default function EditProfileModal({ isOpen, onClose, onSave, user }: EditProfileModalProps) {
    const [formData, setFormData] = React.useState<User | null>(user);
    const [isUploading, setIsUploading] = React.useState(false);
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
        if (e.target.files && e.target.files[0] && user) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({
                    title: "Image too large",
                    description: "Please select an image smaller than 2MB.",
                    variant: "destructive"
                });
                return;
            }
            setIsUploading(true);
            // This is a mock upload. In a real app, you'd upload to a service like Firebase Storage.
            setTimeout(() => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  setFormData(prev => prev ? { ...prev, avatarUrl: reader.result as string } : null);
                  toast({
                      title: "Avatar updated",
                      description: "Your new avatar is ready. Save your profile to keep the changes.",
                      variant: "success",
                  });
                  setIsUploading(false);
              };
              reader.readAsDataURL(file);
            }, 1500);
        }
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
                  <Label>Avatar</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={formData.avatarUrl} alt={formData.name} />
                      <AvatarFallback>{formData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                      {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isUploading ? 'Uploading...' : 'Change Picture'}
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
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={formData.name} onChange={handleChange} required />
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
