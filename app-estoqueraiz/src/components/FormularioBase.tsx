import { type ReactNode, type FormEvent } from 'react';

interface FormularioBaseProps {
  onSubmit: (e: FormEvent) => void;
  processando?: boolean;
  testId?: string;
  textoBotaoSubmit?: string;
  children: ReactNode; 
}

export const FormularioBase = ({
  onSubmit,
  processando = false,
  testId = 'formulario-base',
  textoBotaoSubmit = 'Salvar',
  children
}: FormularioBaseProps) => {
  

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!processando) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="p-6 space-y-4" data-testid={testId}>
      
      {children}

      <div className="pt-4 mt-6 border-t border-gray-100">
        <button
          type="submit"
          disabled={processando}
          data-testid={`${testId}-submit`}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {processando ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processando...
            </>
          ) : (
            textoBotaoSubmit
          )}
        </button>
      </div>
    </form>
  );
};