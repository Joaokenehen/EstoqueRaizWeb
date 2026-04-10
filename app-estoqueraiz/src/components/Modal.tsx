import { X } from 'lucide-react';
import { type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  titulo: ReactNode;
  children: ReactNode;
  maxWidth?: string;
  testId?: string;
  headerClasses?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  titulo,
  children,
  maxWidth = 'max-w-2xl',
  headerClasses = 'bg-gray-50 text-gray-900 border-gray-200',
  testId = 'modal'
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" style={{ animation: 'modal-overlay-fade 0.5s ease-out forwards' }} data-testid={`${testId}-overlay`}>
      {/* Injetando animação pura para garantir fluidez extrema e crescimento a partir de um tamanho reduzido */}
      <style>{`
        @keyframes modal-overlay-fade {
          from { opacity: 0; background-color: rgba(0, 0, 0, 0); }
          to { opacity: 1; background-color: rgba(0, 0, 0, 0.5); }
        }
        @keyframes modal-scale-up {
          from { opacity: 0; transform: scale(0.6); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes modal-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div className={`bg-white rounded-xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden`} style={{ animation: 'modal-scale-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${headerClasses}`}>
          <h2 className="text-xl font-bold">{titulo}</h2>
          <button
            onClick={onClose}
            className="opacity-70 hover:opacity-100 transition-opacity"
            type="button"
            title="Fechar"
            data-testid={`${testId}-close-btn`}
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