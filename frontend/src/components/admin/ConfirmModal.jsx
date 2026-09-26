import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Vehicle?',
  message = 'This action will remove this vehicle from the dealership catalog.',
  confirmText = 'Delete Vehicle',
  cancelText = 'Cancel',
  isDanger = true,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3 p-3 bg-red-50 text-red-900 border border-red-200 rounded-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">{message}</p>
        </div>

        <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'primary' : 'secondary'}
            size="sm"
            onClick={onConfirm}
            className={isDanger ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
