/**
 * @fileoverview Main layout component for the application.
 * It wraps all pages, providing a consistent structure with a header
 * and main content area. It also handles routing logic for
 * authentication pages vs. main app pages.
 */

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
  Megaphone,
  Menu,
  Home,
  MessageCircle,
} from 'lucide-react';

// UI Components
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Custom Components & Icons
import { InvernessEaglesLogo } from '@/components/icons/inverness-eagles-logo';
import { VolleyballIcon } from '../icons/volleyball-icon';
import Footer from './footer';

// Hooks & Utils
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

// --- NAVIGATION ---
const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/announcements', icon: Megaphone, label: 'Announcements' },
  { href: '/chat', icon: MessageCircle, label: 'Chat' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/admin', icon: Shield, label: 'Admin Panel', adminOnly: true },
];

/**
 * Main application layout.
 * Conditionally renders auth pages or the full app layout.
 */
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
      <Footer />
    </div>
  );
}

/**
 * The main header component containing navigation and user menu.
 */
function AppHeader() {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        {isMobile ? <MobileNav /> : <InvernessEaglesLogo className="h-8 w-auto" />}
      </div>

      <DesktopNav />

      <div className="flex items-center gap-4">
        {user && <UserNav user={user} />}
      </div>
    </header>
  );
}

/**
 * Desktop navigation links.
 */
function DesktopNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="hidden md:flex flex-1 justify-center md:items-center md:gap-5 lg:gap-6 text-sm lg:text-base font-medium">
      {navItems.map((item) => {
        if (item.adminOnly && user?.role !== 'admin') {
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
  );
}


/**
 * Mobile navigation, including the hamburger menu (Sheet) and home button.
 */
function MobileNav() {
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-2">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 bg-primary text-primary-foreground border-primary-foreground/20">
          <div className="p-4 border-b border-primary-foreground/20">
            <InvernessEaglesLogo className="h-8 w-auto" />
          </div>
          <nav className="grid gap-2 p-4 text-lg font-medium">
            {navItems.map((item) => {
              if (item.adminOnly && user?.role !== 'admin') {
                return null;
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSheetOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-primary-foreground/80 transition-all hover:text-primary-foreground',
                    pathname === item.href && 'bg-white/10 text-primary-foreground'
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
      
      <Link href="/">
        <Button variant="outline" size="icon" className="shrink-0">
          <Home className="h-5 w-5" />
          <span className="sr-only">Go to Home</span>
        </Button>
      </Link>
    </div>
  );
}

/**
 * User navigation dropdown menu.
 */
function UserNav({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
  const { logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        {user.role === 'admin' && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin</span>
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
