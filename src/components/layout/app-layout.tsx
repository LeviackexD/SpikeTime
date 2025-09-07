'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  Settings,
  User,
  Shield,
  LogOut,
  Bell,
  Megaphone,
  Menu,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InvernessEaglesLogo } from '@/components/icons/inverness-eagles-logo';
import { currentUser } from '@/lib/mock-data';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { VolleyballIcon } from '../icons/volleyball-icon';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"


const navItems = [
  { href: '/', icon: VolleyballIcon, label: 'Sessions' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/announcements', icon: Megaphone, label: 'Announcements' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/admin', icon: Shield, label: 'Admin Panel', adminOnly: true },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-app-background">
        <AppHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}

function AppHeader() {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        {isMobile ? (
           <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
               <div className="p-4 border-b">
                 <InvernessEaglesLogo className="h-8 w-auto" />
               </div>
               <nav className="grid gap-2 p-4 text-lg font-medium">
                {navItems.map((item) => {
                    if (item.adminOnly && currentUser.role !== 'admin') {
                        return null;
                    }
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                                pathname === item.href && 'bg-muted text-primary'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
               </nav>
            </SheetContent>
          </Sheet>
        ) : (
            <>
                <InvernessEaglesLogo className="h-8 w-auto" />
                <nav className="hidden md:flex md:items-center md:gap-5 lg:gap-6 text-sm font-medium">
                {navItems.map((item) => {
                    if (item.adminOnly && currentUser.role !== 'admin') {
                        return null;
                    }
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'transition-colors hover:text-foreground',
                                pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
                            )}
                        >
                            {item.label}
                        </Link>
                    );
                })}
                </nav>
            </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <UserNav />
      </div>
    </header>
  );
}

function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        {currentUser.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/login">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
