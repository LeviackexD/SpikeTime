import type { LucideIcon } from 'lucide-react';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
    icon: LucideIcon;
    title: string;
    children?: React.ReactNode;
    className?: string;
}

export default function SectionHeader({ icon: Icon, title, children, className }: SectionHeaderProps) {
    return (
        <div className={cn("flex flex-col gap-2 w-full", className)}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold font-headline">{title}</h2>
                </div>
                {children}
            </div>
            <Separator />
        </div>
    )
}
