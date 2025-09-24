
/**
 * @fileoverview A confirmation dialog for deleting an announcement.
 * Ensures the admin is sure before proceeding with the deletion.
 */

'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/context/language-context';

interface DeleteAnnouncementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAnnouncementDialog({
  isOpen,
  onClose,
  onConfirm,
}: DeleteAnnouncementDialogProps) {
  const { t } = useLanguage();
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('modals.deleteDialog.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('modals.deleteDialog.announcementDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{t('modals.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t('modals.continue')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
