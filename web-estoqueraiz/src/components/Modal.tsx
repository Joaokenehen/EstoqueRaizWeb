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
  closeOnClickOutside?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  titulo,
  children,
  maxWidth = 'max-w-2xl',
  headerClasses = 'bg-[#fbfaf5] text-slate-950 border-raiz-borda',
  testId = 'modal',
  closeOnClickOutside = false
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm" 
      style={{ animation: 'modal-overlay-fade 0.5s ease-out forwards' }} 
      data-testid={`${testId}-overlay`}
      onClick={closeOnClickOutside ? onClose : undefined}
    >
      {/* Injetando animação pura para garantir fluidez extrema e crescimento a partir de um tamanho reduzido */}
      <style>{`
        @keyframes modal-overlay-fade {
          from { opacity: 0; background-color: rgba(0, 0, 0, 0); }
          to { opacity: 1; background-color: rgba(0, 0, 0, 0.5); }
        }
        @keyframes modal-scale-up {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes modal-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <div 
        className={`w-full ${maxWidth} max-h-[90vh] overflow-hidden rounded-lg border border-white/60 bg-white shadow-[0_34px_90px_-44px_rgba(15,23,42,0.55)] ring-1 ring-black/5 flex flex-col`} 
        style={{ animation: 'modal-scale-up 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`flex shrink-0 items-center justify-between border-b px-6 py-4 ${headerClasses}`}>
          <h2 className="text-lg font-bold tracking-tight">{titulo}</h2>
          <button
            onClick={onClose}
            className="er-icon-button text-slate-500 hover:bg-white hover:text-slate-900"
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
