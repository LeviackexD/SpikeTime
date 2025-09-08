
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InvernessEaglesLogo } from '@/components/icons/inverness-eagles-logo';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { SkillLevel, PlayerPosition, User } from '@/lib/types';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [skillLevel, setSkillLevel] = React.useState<SkillLevel | ''>('');
  const [favoritePosition, setFavoritePosition] = React.useState<PlayerPosition | ''>('');
  const [isLoading, setIsLoading] = React.useState(false);


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillLevel || !favoritePosition) {
      toast({ title: "Profile details required", description: "Please select your skill level and favorite position.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Now create a user profile document in Firestore
      const newUser: Omit<User, 'id'> = {
        name,
        username: name.toLowerCase().replace(/\s/g, ''),
        email: email,
        avatarUrl: `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
        role: 'user',
        skillLevel,
        favoritePosition,
        stats: { sessionsPlayed: 0 }
      };

      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      
      toast({
          title: 'Account Created!',
          description: 'You can now log in with your credentials.',
          variant: 'success'
      });

      router.push('/login');
    } catch (error: any) {
      console.error("Registration error: ", error);
      let errorMessage = 'An unexpected error occurred.';
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters.';
            break;
          default:
            errorMessage = 'Failed to create an account. Please try again.';
        }
      }
      toast({ title: "Registration Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <InvernessEaglesLogo className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>
            Join the Inverness Eagles community today!
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="Alex Johnson" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill-level">Skill Level</Label>
              <Select value={skillLevel} onValueChange={(value) => setSkillLevel(value as SkillLevel)} required>
                <SelectTrigger id="skill-level">
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
              <Select value={favoritePosition} onValueChange={(value) => setFavoritePosition(value as PlayerPosition)} required>
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="underline font-semibold text-primary">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
