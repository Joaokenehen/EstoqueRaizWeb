import { X } from 'lucide-react';
import { type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  titulo: ReactNode;
  children: ReactNode;
  maxWidth?: string;
  headerClasses?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  titulo,
  children,
  maxWidth = 'max-w-2xl',
  headerClasses = 'bg-gray-50 text-gray-900 border-gray-200'
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-opacity">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${headerClasses}`}>
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button
            onClick={onClose}
            className="opacity-70 hover:opacity-100 transition-opacity"
            type="button"
            title="Fechar"
          >
            <X size={24} />
          </button>
        </div>
        <div className="overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};