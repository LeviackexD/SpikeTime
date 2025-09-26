/**
 * @fileoverview A modal dialog (lightbox) for viewing a single photo in a larger format.
 * It's used on the Memories page.
 */

'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface PhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export default function PhotoViewerModal({ isOpen, onClose, imageUrl, alt }: PhotoViewerModalProps) {
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-transparent border-none shadow-none w-full max-w-4xl p-2 sm:p-4">
        <div className="relative aspect-square w-full h-auto max-h-[90vh]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
            </div>
          )}
          <Image
            src={imageUrl}
            alt={alt}
            fill
            sizes="100vw"
            className="object-contain"
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
