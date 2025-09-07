'use client';

import Link from 'next/link';
import { InvernessEaglesLogo } from '@/components/icons/inverness-eagles-logo';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground/80 border-t border-primary-foreground/10">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 py-12 sm:px-6 lg:px-8">
        {/* About Section */}
        <div className="md:col-span-1">
          <InvernessEaglesLogo className="h-8 w-auto mb-4" />
          <p className="text-sm">
            Inverness Eagles Volleyball Club. Promoting community, skill, and passion for volleyball in Inverness.
          </p>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-primary-foreground mb-4">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="h-5 w-5 mt-1 shrink-0" />
              <span>123 Volleyball Lane,<br />Inverness, IV1 2AB</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0" />
              <a href="mailto:info@invernesseagles.com" className="hover:text-primary-foreground transition-colors">info@invernesseagles.com</a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0" />
              <a href="tel:+1234567890" className="hover:text-primary-foreground transition-colors">(123) 456-7890</a>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-primary-foreground mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-primary-foreground transition-colors">Sessions</Link></li>
            <li><Link href="/calendar" className="hover:text-primary-foreground transition-colors">Calendar</Link></li>
            <li><Link href="/announcements" className="hover:text-primary-foreground transition-colors">Announcements</Link></li>
            <li><Link href="/profile" className="hover:text-primary-foreground transition-colors">Profile</Link></li>
          </ul>
        </div>
        
        {/* Social Media */}
        <div>
           <h3 className="text-lg font-semibold text-primary-foreground mb-4">Follow Us</h3>
           <div className="flex space-x-4">
            <a href="#" className="hover:text-primary-foreground transition-colors" aria-label="Facebook"><Facebook /></a>
            <a href="#" className="hover:text-primary-foreground transition-colors" aria-label="Twitter"><Twitter /></a>
            <a href="#" className="hover:text-primary-foreground transition-colors" aria-label="Instagram"><Instagram /></a>
           </div>
        </div>

      </div>
      <div className="border-t border-primary-foreground/10 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Inverness Eagles. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
