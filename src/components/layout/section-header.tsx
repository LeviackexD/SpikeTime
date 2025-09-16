/**
 * @fileoverview A reusable component for creating consistent section headers.
 * It includes an icon, a title, and an optional slot for action buttons.
 * It is not responsible for the separator line.
 */

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
    icon: LucideIcon;
    title: string;
    children?: React.ReactNode;
    className?: string;
}

export default function SectionHeader({ icon: Icon, title, children, className }: SectionHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between w-full", className)}>
            <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold font-headline">{title}</h2>
            </div>
            {children}
        </div>
    )
}
